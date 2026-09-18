import { supabase } from '@/lib/supabaseClient';

// Target proficiency for a skill required by a role.
// industry_requirements stores skill names (no per-skill targets),
// so readiness is measured against this bar.
export const TARGET_PROFICIENCY = 80;
export const MAX_REQUIRED_SKILLS = 25;
export const MAX_POSTINGS = 60;

const STOPWORDS = new Set([
  'and', 'the', 'for', 'with', 'sr', 'jr', 'ii', 'iii', 'iv', '2', '3', '4',
  'remote', 'hybrid', 'onsite', 'fulltime', 'full-time', 'parttime', 'part-time',
  'summer', 'intern', 'internship', 'hiring', 'hired', 'hire', 'job', 'jobs',
  'role', 'new', 'lead', 'senior', 'junior', 'associate', 'assistant', 'entry',
  'level', 'based', 'only', 'location', 'flexible', 'direct', 'percent',
]);

function keywords(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Whole-word match so "ai" doesn't match "said"/"training".
function containsWord(haystack, word) {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(haystack);
}

function normalizeSkillName(name) {
  return String(name || '').trim().toLowerCase();
}

function displayName(normalized, samples) {
  // Prefer the most common original casing seen in the data.
  const counts = new Map();
  for (const s of samples) {
    const key = String(s || '').trim();
    if (normalizeSkillName(key) === normalized && key) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  let best = null;
  let bestCount = 0;
  for (const [k, v] of counts) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best || normalized;
}

/**
 * Finds industry postings relevant to a target role and aggregates
 * the demanded skills by frequency.
 * Returns { postings, required: [{ name, demand, postings }] }.
 */
export async function getRoleSkillDemand(targetRole) {
  const keys = keywords(targetRole);
  if (keys.length === 0) {
    return { postings: [], required: [] };
  }

  const { data, error } = await supabase
    .from('industry_requirements')
    .select('id, role_name, skills');
  if (error) throw error;

  const scored = [];
  for (const row of data || []) {
    const title = String(row.role_name || '');
    const matched = keys.filter((k) => containsWord(title, k));
    if (matched.length === 0) continue;
    scored.push({ row, score: matched.length });
  }

  scored.sort((a, b) => b.score - a.score);
  const postings = scored.slice(0, MAX_POSTINGS).map((s) => s.row);

  // Aggregate skill demand across matched postings.
  const demand = new Map(); // normalized -> { samples: [], postings: Set }
  postings.forEach((p, idx) => {
    const skills = Array.isArray(p.skills) ? p.skills : [];
    const seen = new Set();
    for (const raw of skills) {
      const norm = normalizeSkillName(raw);
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      if (!demand.has(norm)) demand.set(norm, { samples: [], postingIdx: new Set() });
      const entry = demand.get(norm);
      entry.samples.push(raw);
      entry.postingIdx.add(idx);
    }
  });

  const minDemand = Math.max(2, Math.ceil(postings.length * 0.1));
  const required = [...demand.entries()]
    .filter(([, v]) => v.postingIdx.size >= minDemand)
    .map(([norm, v]) => ({
      name: displayName(norm, v.samples),
      key: norm,
      demand: v.postingIdx.size,
    }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, MAX_REQUIRED_SKILLS);

  return { postings, required };
}

function toGap(current, target) {
  const gap = Math.max(0, target - current);
  return {
    gap,
    priority: gap <= 0 ? 'Low' : gap > 30 ? 'High' : gap > 15 ? 'Medium' : 'Low',
    estimatedTime: gap <= 0 ? '0 weeks' : `${Math.ceil(gap / 10)} weeks`,
  };
}

/**
 * Compares a student's proficiencies against demanded skills.
 * studentSkills: [{ name, proficiency }]
 */
export function analyzeGap(studentSkills = [], required = []) {
  const bySkill = new Map();
  for (const s of studentSkills) {
    bySkill.set(normalizeSkillName(s.name), Number(s.proficiency) || 0);
  }

  let matched = 0;
  let total = 0;
  const strong = [];
  const improve = [];
  const missing = [];
  const gaps = [];

  for (const req of required) {
    const current = bySkill.get(req.key) ?? 0;
    total += TARGET_PROFICIENCY;
    matched += Math.min(current, TARGET_PROFICIENCY);

    const meta = toGap(current, TARGET_PROFICIENCY);
    if (current >= TARGET_PROFICIENCY - 5) {
      strong.push(req.name);
    } else if (current >= TARGET_PROFICIENCY / 2) {
      improve.push(req.name);
    } else {
      missing.push(req.name);
    }
    if (meta.gap > 0) {
      gaps.push({
        skill: req.name,
        current,
        target: TARGET_PROFICIENCY,
        demand: req.demand,
        ...meta,
      });
    }
  }

  gaps.sort((a, b) => b.gap - a.gap || b.demand - a.demand);

  const matchScore = total > 0 ? Math.round((matched / total) * 100) : 0;
  const technical = matchScore;
  const demandAvg = required.length > 0
    ? Math.round(required.reduce((s, r) => s + r.demand, 0) / required.length)
    : 0;

  return {
    matchScore,
    strong,
    improve,
    missing,
    gaps,
    breakdown: {
      Readiness: matchScore,
      Technical: technical,
      AvgDemand: demandAvg,
    },
  };
}

/**
 * One-call helper: demand lookup + gap analysis for a target role.
 */
export async function analyzeRoleGap(studentSkills, targetRole) {
  const { postings, required } = await getRoleSkillDemand(targetRole);
  return {
    postingsCount: postings.length,
    requiredCount: required.length,
    required,
    ...analyzeGap(studentSkills, required),
  };
}
