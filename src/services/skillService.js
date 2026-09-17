import { supabase } from '@/lib/supabaseClient';

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

  async addStudentSkill(studentId, skillName, proficiency, source = 'Manual') {
    // 1. Find or create skill in dictionary
    let { data: skill, error: skillError } = await supabase.from('skills').select('id').eq('name', skillName).single();
    if (!skill) {
      const { data: newSkill } = await supabase.from('skills').insert([{ name: skillName, category: 'Uncategorized' }]).select().single();
      skill = newSkill;
    }
    
    // 2. Add to student_skills
    const { data, error } = await supabase.from('student_skills').upsert({
      student_id: studentId,
      skill_id: skill.id,
      proficiency,
      source
    }, { onConflict: 'student_id, skill_id' }).select();
    
    if (error) throw error;
    return data;
  }
};
