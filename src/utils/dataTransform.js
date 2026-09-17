export const dataTransform = {
  // Parse CSV-like string fields into arrays (e.g. "React, Node.js, SQL")
  stringToArray(str, delimiter = ',') {
    if (!str || typeof str !== 'string') return [];
    return str.split(delimiter).map(s => s.trim()).filter(s => s.length > 0);
  },

  // Try to parse stringified JSON or fallback
  safeParseJSON(str, fallback = {}) {
    if (!str) return fallback;
    if (typeof str === 'object') return str;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  },

  // Map generic input rows to target schema fields using a config map
  // mapConfig example: { targetField: 'sourceField', name: 'FullName' }
  mapRow(row, mapConfig) {
    const mapped = {};
    for (const [targetKey, sourceKey] of Object.entries(mapConfig)) {
      if (sourceKey && row[sourceKey] !== undefined) {
        mapped[targetKey] = row[sourceKey];
      }
    }
    return mapped;
  },
  
  parseCSV(text) {
    // A naive CSV parser to remove the need for PapaParse if missing.
    // Splits by newline, then by comma, handling basic quotes.
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      // Very naive split that doesn't fully handle commas inside quotes, 
      // but works for simple flat datasets. Use papaparse for production.
      const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, index) => {
        obj[h] = row[index] || null;
      });
      results.push(obj);
    }
    return results;
  }
};
