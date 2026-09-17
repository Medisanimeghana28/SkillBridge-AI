import { useState, useEffect } from 'react';
import { datasetService } from '@/services/datasetService';
import { importService } from '@/services/importService';
import { dataTransform } from '@/utils/dataTransform';
import { dataValidation } from '@/utils/dataValidation';
import { Button } from '@/components/common/Button';
import { 
  Database, UploadCloud, AlertCircle, FileText, 
  CheckCircle2, ArrowRight, Settings2, BarChart
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Datasets() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Import State
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [columns, setColumns] = useState([]);
  
  const [datasetType, setDatasetType] = useState('industry_requirements');
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    loadBatches();
  }, []);

  async function loadBatches() {
    try {
      const data = await datasetService.getImportBatches();
      setBatches(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setRawText(text);
      
      const rows = dataTransform.parseCSV(text);
      setParsedRows(rows);
      setColumns(dataValidation.detectColumns(rows));
      setStep(2);
    };
    reader.readAsText(file);
  };

  const startMapping = () => {
    // Auto-map where possible based on common dataset headers
    const autoMap = {};
    columns.forEach(col => {
      const lower = col.toLowerCase();
      // Industry reqs
      if (lower.includes('role') || lower.includes('title')) autoMap['role_name'] = col;
      if (lower.includes('skill')) autoMap['skills'] = col;
      
      // Students
      if (lower === 'student_id') autoMap['student_id'] = col;
      if (lower === 'vocational_program') autoMap['vocational_program'] = col;
      if (lower === 'academic_performance') autoMap['academic_performance'] = col;
      if (lower === 'skill_1') autoMap['skill_1'] = col;
      if (lower === 'skill_2') autoMap['skill_2'] = col;
      if (lower === 'skill_3') autoMap['skill_3'] = col;
      if (lower === 'skill_4') autoMap['skill_4'] = col;
      if (lower === 'skill_5') autoMap['skill_5'] = col;

      // Employability
      if (lower === 'sl_no') autoMap['sl_no'] = col;
      if (lower === 'degree_p') autoMap['degree_p'] = col;
      if (lower === 'degree_t') autoMap['degree_t'] = col;
      if (lower === 'etest_p') autoMap['etest_p'] = col;
      if (lower === 'specialisation') autoMap['specialisation'] = col;
      if (lower === 'status') autoMap['status'] = col;
    });
    setMapping(autoMap);
    setStep(3);
  };

  const executeImport = async () => {
    setImporting(true);
    try {
      let result;
      if (datasetType === 'industry_requirements') {
        result = await importService.importIndustryRequirements(
          parsedRows, 
          mapping, 
          { name: file.name, type: datasetType }
        );
      } else if (datasetType === 'students') {
        result = await importService.importStudents(
          parsedRows, 
          mapping, 
          { name: file.name, type: datasetType }
        );
      } else if (datasetType === 'employability') {
        result = await importService.importEmployability(
          parsedRows, 
          mapping, 
          { name: file.name, type: datasetType }
        );
      }
      setSummary(result);
      setStep(4);
      loadBatches();
    } catch (error) {
      alert("Import failed: " + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dataset Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Import structured datasets and map them into the SkillBridge AI ecosystem.</p>
      </div>

      {/* Importer Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary-500" /> New Data Import
          </h2>
          <div className="flex gap-2 items-center text-sm font-medium">
            <span className={cn(step >= 1 ? "text-primary-600" : "text-slate-400")}>1. Upload</span>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <span className={cn(step >= 2 ? "text-primary-600" : "text-slate-400")}>2. Inspect</span>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <span className={cn(step >= 3 ? "text-primary-600" : "text-slate-400")}>3. Map & Import</span>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Entity</label>
                <select 
                  className="w-full max-w-md p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value)}
                >
                  <option value="industry_requirements">Industry Role Requirements</option>
                  <option value="students">Students Dataset (Vocational)</option>
                  <option value="employability">Employability/Campus Recruitment Dataset</option>
                  <option value="internships" disabled>Internships (Coming Soon)</option>
                </select>
               </div>
               
               <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-10 flex flex-col items-center text-center max-w-md">
                 <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                 <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select CSV Dataset</p>
                 <input type="file" accept=".csv" className="hidden" id="dataset-upload" onChange={handleFileUpload} />
                 <label htmlFor="dataset-upload">
                   <Button as="span" variant="outline" className="mt-4 cursor-pointer">Browse Files</Button>
                 </label>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="font-medium text-sm">Detected {parsedRows.length} rows</p>
                  <p className="text-xs opacity-80">{columns.join(', ')}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg max-h-64">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0">
                    <tr>{columns.map(c => <th key={c} className="px-4 py-2 border-b">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b dark:border-slate-700 text-slate-600 dark:text-slate-400">
                        {columns.map(c => <td key={c} className="px-4 py-2 truncate max-w-[150px]">{row[c]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={startMapping}>Continue to Data Mapping</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-slate-400" /> Map Columns to System Schema
              </h3>
              
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                {/* Fixed schema fields for Industry Requirements */}
                <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Role Name</label>
                  <select 
                    className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    value={mapping['role_name'] || ''}
                    onChange={e => setMapping({...mapping, role_name: e.target.value})}
                  >
                    <option value="">-- Ignore --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Required Skills (Comma separated)</label>
                  <select 
                    className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    value={mapping['skills'] || ''}
                    onChange={e => setMapping({...mapping, skills: e.target.value})}
                  >
                    <option value="">-- Ignore --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm flex items-start gap-2 border border-amber-100">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>Importing {parsedRows.length} rows into <strong>industry_requirements</strong>. Skills will automatically run through the Skill Normalization Engine.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={executeImport} disabled={importing}>
                  {importing ? 'Importing Data...' : 'Confirm & Execute Import'}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && summary && (
            <div className="space-y-6 text-center py-8">
              <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Import Complete</h2>
              
              <div className="max-w-sm mx-auto bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm space-y-2 text-left border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between"><span className="text-slate-500">Dataset</span><span className="font-medium text-slate-800 dark:text-slate-200">{file?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Rows Processed</span><span className="font-medium text-slate-800 dark:text-slate-200">{summary.total}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Successfully Imported</span><span className="font-medium text-emerald-600">{summary.imported}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Skipped (Missing Data)</span><span className="font-medium text-amber-600">{summary.skipped}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Errors</span><span className="font-medium text-red-600">{summary.errors}</span></div>
              </div>

              <Button onClick={() => { setStep(1); setFile(null); setSummary(null); }}>Import Another Dataset</Button>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-slate-400" /> Import History
        </h3>
        
        {loading ? (
          <p className="text-sm text-slate-500">Loading history...</p>
        ) : batches.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No datasets imported yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Date</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Dataset Source</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Status</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Imported</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Failed</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => (
                  <tr key={batch.id} className="border-b dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <td className="px-4 py-3">{new Date(batch.import_date).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{batch.dataset_sources?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        batch.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{batch.records_imported} / {batch.records_processed}</td>
                    <td className="px-4 py-3 text-red-500">{batch.invalid_records}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
