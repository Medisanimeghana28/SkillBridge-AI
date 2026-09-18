import { supabase } from '@/lib/supabaseClient';
import { getRoleSkillDemand, analyzeGap } from './gapService';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const SOFT_PATTERN = /soft|commun|teamwork|team work|leadership|problem solving|adaptab|collaborat|presentation|time management|critical thinking/i;

// Cached skill dictionary for keyword matching (fetched once per session).
let dictionaryPromise = null;
function getSkillDictionary() {
  if (!dictionaryPromise) {
    dictionaryPromise = supabase
      .from('skills')
      .select('name')
      .then(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((r) => r.name).filter(Boolean);
      })
      .catch(() => []);
  }
  return dictionaryPromise;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extract raw text from a PDF file (first 10 pages max). */
async function extractPdfText(fileBlob) {
  const buffer = await fileBlob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const maxPages = Math.min(pdf.numPages, 10);
  let text = '';
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(' ') + '\n';
  }
  await pdf.destroy();
  return text;
}

/**
 * Match dictionary skill names against free text (whole-phrase,
 * case-insensitive). Returns names ordered by frequency.
 */
function casingScore(name) {
  // Prefer "Python" / "SQL" over all-lowercase historical duplicates.
  if (name !== name.toLowerCase() && name !== name.toUpperCase()) return 2;
  if (name === name.toUpperCase()) return 1;
  return 0;
}

export function matchSkillsInText(text, dictionary, limit = 30) {
  const lower = String(text || '').toLowerCase();
  if (!lower.trim()) return [];
  // Dedupe case-insensitively: the dictionary contains historical
  // duplicates ("Python" vs "python"); keep the best-cased variant.
  const byKey = new Map();
  for (const raw of dictionary) {
    const norm = String(raw).trim();
    if (norm.length < 2) continue;
    const key = norm.toLowerCase();
    const existing = byKey.get(key);
    if (!existing || casingScore(norm) > casingScore(existing)) {
      byKey.set(key, norm);
    }
  }
  const hits = [];
  for (const [key, name] of byKey) {
    const rx = new RegExp(`\\b${escapeRegExp(key)}\\b`, 'gi');
    const matches = lower.match(rx);
    if (matches) hits.push({ name, count: matches.length });
  }
  return hits
    .sort((a, b) => b.count - a.count || b.name.length - a.name.length)
    .slice(0, limit)
    .map((h) => h.name);
}

export const resumeService = {
  async uploadResume(studentId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    // First path segment is the owner id (enforced by storage RLS).
    const filePath = `${studentId}/${fileName}`;

    // Upload to Supabase Storage (private `resumes` bucket)
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create database record
    const { data, error } = await supabase.from('resumes').insert([{
      student_id: studentId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      status: 'Uploaded'
    }]).select().single();

    if (error) throw error;
    return data;
  },

  async getStudentResumes(studentId) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*, resume_analysis(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .order('created_at', { ascending: false, foreignTable: 'resume_analysis' });

    if (error) throw error;
    return data;
  },

  /**
   * Builds an analysis from keywords actually extracted from the file
   * (PDF text is parsed; images fall back to Skill DNA), plus live
   * industry demand for the target role.
   * skills: [{ name, proficiency, category }]
   */
  async analyzeResume(resumeId, { skills = [], targetRole = null } = {}) {
    // 1. Mark as analyzing + load the resume row for its storage path.
    const { error: markError } = await supabase
      .from('resumes')
      .update({ status: 'Analyzing' })
      .eq('id', resumeId);
    if (markError) throw markError;

    const { data: resumeRow, error: rowError } = await supabase
      .from('resumes')
      .select('file_path, file_type, file_name')
      .eq('id', resumeId)
      .single();
    if (rowError) throw rowError;

    // 2. Extract keywords from the file itself.
    let extracted = [];
    let extractionNote = '';
    try {
      const isPdf = (resumeRow.file_type || '').includes('pdf') || /\.pdf$/i.test(resumeRow.file_name || '');
      if (isPdf) {
        const { data: blob, error: dlError } = await supabase.storage
          .from('resumes')
          .download(resumeRow.file_path);
        if (dlError) throw dlError;
        const text = await extractPdfText(blob);
        const dictionary = await getSkillDictionary();
        extracted = matchSkillsInText(text, dictionary);
        if (extracted.length === 0) {
          extractionNote = 'No recognizable skill keywords were found in this PDF (it may be scanned) — falling back to your Skill DNA.';
        }
      } else {
        extractionNote = 'Image resumes cannot be text-parsed — analysis uses your Skill DNA instead.';
      }
    } catch (err) {
      extractionNote = `Could not parse this file (${err.message || 'parse error'}) — analysis uses your Skill DNA instead.`;
    }

    // 3. Detected = keywords from the file, topped up with Skill DNA.
    const ranked = [...skills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
    const dnaNames = ranked.map((s) => s.name).filter(Boolean);
    const seen = new Set(extracted.map((s) => s.toLowerCase()));
    const detected = [...extracted];
    for (const n of dnaNames) {
      if (detected.length >= 12) break;
      if (!seen.has(String(n).toLowerCase())) {
        detected.push(n);
        seen.add(String(n).toLowerCase());
      }
    }

    let overall = ranked.length > 0
      ? Math.round(ranked.reduce((s, x) => s + (x.proficiency || 0), 0) / ranked.length)
      : 0;
    let missing = [];
    let recommendations = [];

    if (targetRole && targetRole.trim()) {
      try {
        const { required } = await getRoleSkillDemand(targetRole.trim());
        if (required.length > 0) {
          const gap = analyzeGap(
            ranked.map((s) => ({ name: s.name, proficiency: s.proficiency })),
            required
          );
          overall = gap.matchScore;
          missing = gap.gaps.slice(0, 6).map((g) => g.skill);
          recommendations = gap.gaps.slice(0, 3).map(
            (g) => `Strengthen ${g.skill} (currently ${g.current}%, target ${g.target}%) — about ${g.estimatedTime}.`
          );
        }
      } catch {
        // Demand lookup is best-effort; fall through to DNA-only analysis.
      }
    }

    if (extractionNote) {
      recommendations.unshift(extractionNote);
    }

    if (recommendations.length === (extractionNote ? 1 : 0) && detected.length > 0) {
      recommendations.push(
        `Strongest area: ${ranked[0].name} (${ranked[0].proficiency}%). Keep evidence fresh with projects or challenges.`,
      );
      if (missing.length === 0) {
        recommendations.push('Set a target role to get demand-driven gap recommendations.');
      }
    }

    if (extracted.length > 0) {
      recommendations.push(
        `${extracted.length} skill keyword${extracted.length === 1 ? '' : 's'} extracted directly from the file. Click any detected skill to add it to your Skill DNA.`
      );
    }

    const technical = detected.filter((n) => !SOFT_PATTERN.test(n));
    const soft = detected.filter((n) => SOFT_PATTERN.test(n));

    const analysis = {
      resume_id: resumeId,
      overall_score: overall,
      skills_detected: detected,
      technical_skills: technical.length > 0 ? technical : detected,
      soft_skills: soft,
      projects_identified: [],
      certifications_identified: [],
      strengths: ranked.slice(0, 3).map((s) => `${s.name} (${s.proficiency}%)`),
      missing_skills: missing,
      recommendations,
      target_role: targetRole || null,
    };

    const { data, error } = await supabase.from('resume_analysis').insert([analysis]).select().single();
    if (error) throw error;

    await supabase.from('resumes').update({ status: 'Analyzed' }).eq('id', resumeId);

    return data;
  },
};
