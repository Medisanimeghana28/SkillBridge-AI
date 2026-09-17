import { supabase } from '@/lib/supabaseClient';
import { skillNormalizationService } from './skillNormalizationService';
import { datasetService } from './datasetService';
import { dataTransform } from '@/utils/dataTransform';

export const importService = {
  
  async importIndustryRequirements(rows, mapConfig, sourceMetadata) {
    let imported = 0, skipped = 0, errors = 0;
    
    // 1. Create Source & Batch
    const source = await datasetService.createDatasetSource({
      name: sourceMetadata.name || 'Unknown Dataset',
      source_type: sourceMetadata.type || 'industry_requirements',
      description: 'Imported via dataset UI'
    });
    
    const batch = await datasetService.createImportBatch({
      dataset_source_id: source.id,
      mapping_config: mapConfig,
      status: 'Processing'
    });

    for (const rawRow of rows) {
      try {
        const mapped = dataTransform.mapRow(rawRow, mapConfig);
        if (!mapped.role_name) {
          skipped++;
          continue;
        }

        // Parse skills
        const rawSkills = dataTransform.stringToArray(mapped.skills);
        const normalizedSkills = await skillNormalizationService.normalizeSkillList(rawSkills, batch.id);

        const { error } = await supabase.from('industry_requirements').insert([{
          role_name: mapped.role_name,
          skills: normalizedSkills.map(s => s.name),
          import_batch_id: batch.id
        }]);

        if (error) { errors++; } else { imported++; }
      } catch (err) {
        errors++;
      }
    }

    // 2. Finalize Batch
    await datasetService.updateImportBatch(batch.id, {
      status: 'Completed',
      records_processed: rows.length,
      records_imported: imported,
      records_skipped: skipped,
      invalid_records: errors
    });

    return { imported, skipped, errors, total: rows.length };
  },

  async importStudents(rows, mapConfig, sourceMetadata) {
    let imported = 0, skipped = 0, errors = 0;
    
    const source = await datasetService.createDatasetSource({
      name: sourceMetadata.name || 'Students Dataset',
      source_type: 'students',
      description: 'Imported via dataset UI'
    });
    
    const batch = await datasetService.createImportBatch({
      dataset_source_id: source.id,
      mapping_config: mapConfig,
      status: 'Processing'
    });

    for (const rawRow of rows) {
      try {
        const mapped = dataTransform.mapRow(rawRow, mapConfig);
        
        // Profiles
        const { data: profile, error: pErr } = await supabase.from('profiles').insert([{
          role: 'student',
          email: `${mapped.student_id?.toLowerCase() || 'stu_'+Math.random()}@example.com`,
          full_name: mapped.student_id,
          import_batch_id: batch.id
        }]).select().single();

        if (pErr) throw pErr;

        // Academic Records
        await supabase.from('academic_records').insert([{
          student_id: profile.id,
          institution: 'Unknown Institution',
          department: mapped.vocational_program,
          gpa: mapped.academic_performance,
          import_batch_id: batch.id
        }]);

        // Skills (Skill_1 to Skill_5 proficiencies)
        // Note: dataset just provides scores for generic skills. 
        // We preserve these as Skill 1...5
        for (let i = 1; i <= 5; i++) {
          if (mapped[`skill_${i}`] !== undefined) {
            const skill = await skillNormalizationService.createOrGetSkill(`Vocational Skill ${i}`, 'Vocational', batch.id);
            await supabase.from('student_skills').insert([{
              student_id: profile.id,
              skill_id: skill.id,
              proficiency: Number(mapped[`skill_${i}`]) * 10, // 0-10 to 0-100 scale
              verification_status: 'Verified',
              source: 'Dataset',
              import_batch_id: batch.id
            }]);
          }
        }

        imported++;
      } catch (err) {
        errors++;
      }
    }

    await datasetService.updateImportBatch(batch.id, {
      status: 'Completed',
      records_processed: rows.length,
      records_imported: imported,
      records_skipped: skipped,
      invalid_records: errors
    });

    return { imported, skipped, errors, total: rows.length };
  },

  async importEmployability(rows, mapConfig, sourceMetadata) {
    let imported = 0, skipped = 0, errors = 0;
    
    const source = await datasetService.createDatasetSource({
      name: sourceMetadata.name || 'Employability Dataset',
      source_type: 'employability',
      description: 'Imported via dataset UI'
    });
    
    const batch = await datasetService.createImportBatch({
      dataset_source_id: source.id,
      mapping_config: mapConfig,
      status: 'Processing'
    });

    for (const rawRow of rows) {
      try {
        const mapped = dataTransform.mapRow(rawRow, mapConfig);
        
        // Profiles
        const { data: profile, error: pErr } = await supabase.from('profiles').insert([{
          role: 'student',
          email: `emp_${mapped.sl_no || Math.random()}@example.com`,
          full_name: `Candidate ${mapped.sl_no}`,
          import_batch_id: batch.id
        }]).select().single();

        if (pErr) throw pErr;

        // Academic Records (with employability score preserved, not readiness!)
        await supabase.from('academic_records').insert([{
          student_id: profile.id,
          institution: 'Unknown Institution',
          department: mapped.degree_t,
          degree: mapped.specialisation,
          gpa: mapped.degree_p,
          source_employability_score: mapped.etest_p,
          import_batch_id: batch.id
        }]);

        imported++;
      } catch (err) {
        errors++;
      }
    }

    await datasetService.updateImportBatch(batch.id, {
      status: 'Completed',
      records_processed: rows.length,
      records_imported: imported,
      records_skipped: skipped,
      invalid_records: errors
    });

    return { imported, skipped, errors, total: rows.length };
  }
};
