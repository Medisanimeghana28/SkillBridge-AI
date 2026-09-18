import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const TARGET = 80;

export function useAcademiaData() {
  const { user } = useAuth();
  const [data, setData] = useState({
    students: [],
    studentCount: 0,
    departments: [],
    skillGaps: [],
    industryDemand: { topRoles: [], topSkills: [] },
    readiness: { avg: 0, verified: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [countRes, recordsRes, skillsRes, dictRes, reqRes, verifRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('academic_records').select('department, employability_score'),
          supabase.from('student_skills').select('skill_id, proficiency'),
          supabase.from('skills').select('id, name'),
          supabase.from('industry_requirements').select('role_name, skills'),
          supabase.from('student_skills').select('id', { count: 'exact', head: true }).eq('verification_status', 'Verified'),
        ]);

        const names = new Map((dictRes.data || []).map((s) => [s.id, s.name]));

        // Demand frequency across postings.
        const demand = new Map();
        const roleCounts = new Map();
        for (const row of reqRes.data || []) {
          const role = (row.role_name || 'Unspecified').trim() || 'Unspecified';
          roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
          const seen = new Set();
          for (const raw of Array.isArray(row.skills) ? row.skills : []) {
            const norm = String(raw || '').trim().toLowerCase();
            if (!norm || seen.has(norm)) continue;
            seen.add(norm);
            if (!demand.has(norm)) demand.set(norm, { display: String(raw).trim(), count: 0 });
            demand.get(norm).count += 1;
          }
        }
        const topSkills = [...demand.entries()]
          .map(([key, v]) => ({ key, ...v }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 12);
        const topSet = new Set(topSkills.map((s) => s.key));

        // Average student proficiency for the top-demanded skills.
        const sums = new Map();
        let profTotal = 0;
        let profCount = 0;
        for (const row of skillsRes.data || []) {
          const prof = Number(row.proficiency) || 0;
          profTotal += prof;
          profCount += 1;
          const norm = String(names.get(row.skill_id) || '').trim().toLowerCase();
          if (topSet.has(norm)) {
            if (!sums.has(norm)) sums.set(norm, { total: 0, n: 0 });
            const e = sums.get(norm);
            e.total += prof;
            e.n += 1;
          }
        }

        const skillGaps = topSkills.map((s) => {
          const e = sums.get(s.key);
          const avg = e && e.n > 0 ? Math.round(e.total / e.n) : 0;
          return {
            skill: s.display,
            current: avg,
            target: TARGET,
            gap: Math.max(0, TARGET - avg),
            demand: s.count,
            students: e ? e.n : 0,
          };
        }).sort((a, b) => b.gap - a.gap);

        const departments = new Map();
        const scores = [];
        for (const r of recordsRes.data || []) {
          const d = (r.department || 'Unspecified').trim() || 'Unspecified';
          departments.set(d, (departments.get(d) || 0) + 1);
          if (r.employability_score != null) scores.push(Number(r.employability_score));
        }

        setData({
          students: [],
          studentCount: countRes.count || 0,
          departments: [...departments.entries()]
            .map(([name, n]) => ({ name, students: n }))
            .sort((a, b) => b.students - a.students),
          skillGaps,
          industryDemand: {
            topRoles: [...roleCounts.entries()]
              .map(([role, postings]) => ({ role, postings }))
              .sort((a, b) => b.postings - a.postings)
              .slice(0, 10),
            topSkills: topSkills.slice(0, 10),
          },
          readiness: {
            avg: profCount > 0 ? Math.round(profTotal / profCount) : 0,
            verified: verifRes.count || 0,
            total: profCount,
          },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  return { data, loading };
}
