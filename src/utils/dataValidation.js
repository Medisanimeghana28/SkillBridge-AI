export const dataValidation = {
  detectColumns(rows) {
    if (!rows || rows.length === 0) return [];
    return Object.keys(rows[0]);
  },

  validateRow(row, requiredColumns) {
    const errors = [];
    for (const col of requiredColumns) {
      if (row[col] === undefined || row[col] === null || row[col] === '') {
        errors.push(`Missing required column: ${col}`);
      }
    }
    return errors;
  },

  detectDuplicates(rows, uniqueKey) {
    const seen = new Set();
    const duplicates = [];
    rows.forEach((row, index) => {
      const val = row[uniqueKey];
      if (val) {
        if (seen.has(val)) {
          duplicates.push(index);
        } else {
          seen.add(val);
        }
      }
    });
    return duplicates;
  },
  
  generateImportSummary(total, imported, skipped, errors) {
    return {
      totalProcessed: total,
      recordsImported: imported,
      recordsSkipped: skipped,
      invalidRecords: errors,
      timestamp: new Date().toISOString()
    };
  }
};
