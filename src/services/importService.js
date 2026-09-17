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

  // Similar functions would be implemented for importStudents, importInternships, etc.
  // following the exact same pattern: Map -> Normalize -> Insert -> Record Batch.
};
