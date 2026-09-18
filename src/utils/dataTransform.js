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
  
  // Splits one CSV line respecting double-quoted fields
  // (including commas and escaped "" inside quotes).
  splitCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells.map((c) => c.trim());
  },

  parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = this.splitCSVLine(lines[0]);
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const row = this.splitCSVLine(lines[i]);
      const obj = {};
      headers.forEach((h, index) => {
        obj[h] = row[index] !== undefined && row[index] !== '' ? row[index] : null;
      });
      results.push(obj);
    }
    return results;
  }
};
