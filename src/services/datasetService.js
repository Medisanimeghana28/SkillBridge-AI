import { supabase } from '@/lib/supabaseClient';

export const datasetService = {
  async getDatasetSources() {
    const { data, error } = await supabase.from('dataset_sources').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createDatasetSource(sourceData) {
    const { data, error } = await supabase.from('dataset_sources').insert([sourceData]).select().single();
    if (error) throw error;
    return data;
  },

  async getImportBatches() {
    // NOTE: import_batches has no FK to profiles, so only the
    // dataset_sources embed is valid here.
    const { data, error } = await supabase
      .from('import_batches')
      .select('*, dataset_sources(name)')
      .order('import_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createImportBatch(batchData) {
    const { data, error } = await supabase.from('import_batches').insert([batchData]).select().single();
    if (error) throw error;
    return data;
  },

  async updateImportBatch(batchId, updates) {
    const { data, error } = await supabase.from('import_batches').update(updates).eq('id', batchId).select().single();
    if (error) throw error;
    return data;
  }
};
