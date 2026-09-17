import { supabase } from '@/lib/supabaseClient';

export const skillNormalizationService = {
  normalizeSkillName(rawSkill) {
    if (!rawSkill) return '';
    // Basic normalization: trim, lowercase, remove extra spaces
    return rawSkill.toString().trim().toLowerCase().replace(/\s+/g, ' ');
  },

  async findCanonicalSkill(rawSkill) {
    const normalized = this.normalizeSkillName(rawSkill);
    if (!normalized) return null;

    // First try exact match (case insensitive)
    let { data, error } = await supabase
      .from('skills')
      .select('*')
      .ilike('name', normalized)
      .single();
    
    if (data) return data;

    // Here we could add mapping tables (e.g. 'js' -> 'javascript')
    return null;
  },

  async createOrGetSkill(rawSkill, category = 'Uncategorized', batchId = null) {
    const normalized = this.normalizeSkillName(rawSkill);
    if (!normalized) return null;

    const existing = await this.findCanonicalSkill(rawSkill);
    if (existing) return existing;

    // Use proper capitalization for new skills (title case naive)
    const displayName = normalized.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const { data, error } = await supabase.from('skills').insert([{
      name: displayName,
      category,
      import_batch_id: batchId
    }]).select().single();

    if (error) {
      // Handle potential race condition if another process just created it
      if (error.code === '23505') { 
        return await this.findCanonicalSkill(rawSkill);
      }
      throw error;
    }
    
    return data;
  },

  async normalizeSkillList(rawSkillsArray, batchId = null) {
    const normalizedSkills = [];
    for (const raw of rawSkillsArray) {
      const skill = await this.createOrGetSkill(raw, 'Uncategorized', batchId);
      if (skill) normalizedSkills.push(skill);
    }
    return normalizedSkills;
  }
};
