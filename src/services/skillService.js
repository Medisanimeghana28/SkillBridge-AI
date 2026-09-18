import { supabase } from '@/lib/supabaseClient';
import { skillNormalizationService } from './skillNormalizationService';

export const skillService = {
  async getStudentSkills(studentId) {
    const { data, error } = await supabase
      .from('student_skills')
      .select('*, skills(*)')
      .eq('student_id', studentId);
    if (error) throw error;
    // Map to a friendlier format
    return data.map(item => ({
      ...item,
      name: item.skills?.name,
      category: item.skills?.category
    }));
  },

  async addStudentSkill(studentId, skillName, proficiency, source = 'Manual', verificationStatus = null) {
    // 1. Resolve through the canonical dictionary (case-insensitive + aliases),
    //    so "ReactJS", "react" and "React" all map to one skill row.
    const skill = await skillNormalizationService.createOrGetSkill(skillName);
    if (!skill) throw new Error(`Could not resolve skill "${skillName}".`);

    // 2. Add to student_skills
    const payload = {
      student_id: studentId,
      skill_id: skill.id,
      proficiency,
      source,
    };
    if (verificationStatus) payload.verification_status = verificationStatus;
    const { data, error } = await supabase.from('student_skills').upsert(payload, { onConflict: 'student_id, skill_id' }).select();

    if (error) throw error;
    return data;
  },

  async updateProficiency(studentSkillId, proficiency) {
    const value = Math.max(0, Math.min(100, Number(proficiency) || 0));
    const { data, error } = await supabase
      .from('student_skills')
      .update({ proficiency: value })
      .eq('id', studentSkillId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeStudentSkill(studentSkillId) {
    const { error } = await supabase
      .from('student_skills')
      .delete()
      .eq('id', studentSkillId);
    if (error) throw error;
  }
};
