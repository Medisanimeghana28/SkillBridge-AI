import { supabase } from '@/lib/supabaseClient';

// Common shorthand / variant spellings mapped to canonical display names.
const SKILL_ALIASES = {
  'js': 'JavaScript',
  'javascriptjs': 'JavaScript',
  'reactjs': 'React',
  'react.js': 'React',
  'nodejs': 'Node.js',
  'node js': 'Node.js',
  'node': 'Node.js',
  'ts': 'TypeScript',
  'py': 'Python',
  'python3': 'Python',
  'ml': 'Machine Learning',
  'ai': 'Artificial Intelligence',
  'dl': 'Deep Learning',
  'nlp': 'Natural Language Processing',
  'k8s': 'Kubernetes',
  'kubernete': 'Kubernetes',
  'docker compose': 'Docker',
  'postgres': 'PostgreSQL',
  'postgress': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongodb atlas': 'MongoDB',
  'gh actions': 'GitHub Actions',
  'github action': 'GitHub Actions',
  'html5': 'HTML',
  'css3': 'CSS',
  'scikit': 'Scikit-learn',
  'sklearn': 'Scikit-learn',
  'tf': 'TensorFlow',
  'pytorch lightning': 'PyTorch',
  'aws ec2': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'Google Cloud',
  'azure devops': 'Azure',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'rest': 'REST APIs',
  'restful': 'REST APIs',
  'rest api': 'REST APIs',
  'oop': 'Object-Oriented Programming',
  'dsa': 'Data Structures & Algorithms',
  'excel': 'Microsoft Excel',
  'ms excel': 'Microsoft Excel',
  'ms office': 'Microsoft Office',
  'msoffice': 'Microsoft Office',
  'powerbi': 'Power BI',
  'power bi': 'Power BI',
  'tableau desktop': 'Tableau',
  'c++': 'C++',
  'c plus plus': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  '.net': '.NET',
  'dotnet': '.NET',
};

export const skillNormalizationService = {
  normalizeSkillName(rawSkill) {
    if (!rawSkill) return '';
    // Basic normalization: trim, lowercase, remove extra spaces
    return rawSkill.toString().trim().toLowerCase().replace(/\s+/g, ' ');
  },

  resolveAlias(normalized) {
    return SKILL_ALIASES[normalized] || null;
  },

  async findCanonicalSkill(rawSkill) {
    const normalized = this.normalizeSkillName(rawSkill);
    if (!normalized) return null;

    // 0. Known shorthand -> canonical display name lookup.
    const alias = this.resolveAlias(normalized);
    if (alias) {
      const { data } = await supabase
        .from('skills')
        .select('*')
        .ilike('name', alias)
        .limit(1)
        .maybeSingle();
      if (data) return data;
      // Alias target not in dictionary yet: fall through and create it.
      return this.createSkillRow(alias, 'Uncategorized', null);
    }

    // 1. Exact match (case insensitive). ilike without wildcards == case-insensitive equals.
    const { data } = await supabase
      .from('skills')
      .select('*')
      .ilike('name', normalized)
      .limit(1)
      .maybeSingle();

    if (data) return data;
    return null;
  },

  async createSkillRow(displayName, category = 'Uncategorized', batchId = null) {
    const { data, error } = await supabase.from('skills').insert([{
      name: displayName,
      category,
      import_batch_id: batchId
    }]).select().single();

    if (error) {
      // Race: another request created it first.
      if (error.code === '23505') {
        const { data: retry } = await supabase
          .from('skills')
          .select('*')
          .ilike('name', displayName)
          .limit(1)
          .maybeSingle();
        return retry;
      }
      throw error;
    }

    return data;
  },

  async createOrGetSkill(rawSkill, category = 'Uncategorized', batchId = null) {
    const normalized = this.normalizeSkillName(rawSkill);
    if (!normalized) return null;

    const existing = await this.findCanonicalSkill(rawSkill);
    if (existing) return existing;

    // Use proper capitalization for new skills (title case naive)
    const displayName = normalized.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return this.createSkillRow(displayName, category, batchId);
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
