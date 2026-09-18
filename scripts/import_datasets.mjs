// SkillBridge AI - dataset import into Supabase (direct Postgres, batched)
import pg from 'pg';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const DB = {
  host: process.env.SB_DB || 'db.dhsudmveawezorgrwopc.supabase.co',
  port: 5432,
  user: process.env.SB_USER || 'postgres',
  password: process.env.SB_PASS || 'Skillbridge-AI',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const client = new pg.Client(DB);
await client.connect();
const now = new Date().toISOString();

// BATCH helper: insert rows into table with $1..$n placeholders
async function bulk(table, columns, rows, onConflict = '') {
  if (rows.length === 0) return 0;
  const colList = columns.join(', ');
  const conflict = onConflict ? ` ON CONFLICT (${onConflict}) DO NOTHING` : '';
  const CHUNK = 500;
  let n = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const params = [];
    const valueStrs = chunk.map((r) => {
      const parts = [];
      for (const col of columns) {
        params.push(r[col]);
        parts.push('$' + params.length);
      }
      return '(' + parts.join(',') + ')';
    });
    await client.query(`INSERT INTO ${table} (${colList}) VALUES ${valueStrs.join(',')}${conflict}`, params);
    n += chunk.length;
  }
  return n;
}

// ---------- 0. prep ----------
await client.query('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey');
await client.query("ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()");
console.log('[0] prep ok');

// ---------- 1. parse all_job_post ----------
const allJobRows = parse(
  readFileSync(ROOT + 'datasets/data/source/all_job_post.csv', 'utf8').replace(/\r/g, '\n'),
  { columns: true, skip_empty_lines: true, relax_column_count: true, relax_quotes: true, bom: true }
);
const skillSet = new Map();
const jobRoleToSkills = new Map();
const catToSkill = { 'INFORMATION-TECHNOLOGY': 'Technical', 'FINANCE': 'Finance', 'SALES': 'Sales', 'HR': 'Human Resources', 'BUSINESS-DEVELOPMENT': 'Business' };
function parseSkillList(raw) {
  if (!raw || typeof raw !== 'string') return [];
  let str = raw.trim();
  if (str.startsWith('[') && str.endsWith(']')) str = str.slice(1, -1);
  return str.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter((s) => s.length > 0);
}
for (const job of allJobRows) {
  const skills = parseSkillList(job.job_skill_set);
  const category = catToSkill[job.category] || 'General';
  if (skills.length === 0) continue;
  if (!jobRoleToSkills.has(job.job_title)) {
    jobRoleToSkills.set(job.job_title, { skills, category, description: (job.job_description || '').slice(0, 800) });
  }
  for (const s of skills) {
    if (!skillSet.has(s)) skillSet.set(s, { category, demand: 1 });
    else skillSet.get(s).demand += 1;
  }
}

const VOCATION_SKILLS = {
  'Welder': ['MIG Welding', 'Arc Welding', 'Blueprint Reading', 'Metal Fabrication', 'Safety Compliance'],
  'Plumber': ['Pipe Fitting', 'Plumbing Systems', 'Water Supply Systems', 'Blueprint Reading', 'Safety Compliance'],
  'Welders, Cutters, Solderers, and Brazers': ['MIG Welding', 'Arc Welding', 'Metal Fabrication', 'Safety Compliance', 'Blueprint Reading'],
  'Mechanic': ['Engine Repair', 'Vehicle Diagnostics', 'Automotive Electrical', 'Brake Systems', 'Hand Tools'],
  'Automotive Service Technicians and Mechanics': ['Engine Repair', 'Vehicle Diagnostics', 'Automotive Electrical', 'Brake Systems', 'Hand Tools'],
  'Electrician': ['Electrical Wiring', 'Circuit Installation', 'Electrical Diagnostics', 'Safety Compliance', 'Blueprint Reading'],
  'Electricians': ['Electrical Wiring', 'Circuit Installation', 'Electrical Diagnostics', 'Safety Compliance', 'Blueprint Reading'],
  'IT Technician': ['Computer Networking', 'Troubleshooting', 'Operating Systems', 'Hardware Maintenance', 'Customer Support'],
  'Computer Support Specialists': ['Computer Networking', 'Troubleshooting', 'Operating Systems', 'Hardware Maintenance', 'Customer Support'],
  'Carpenter': ['Woodworking', 'Measuring & Layout', 'Power Tools', 'Cabinet Making', 'Blueprint Reading'],
  'Carpenters': ['Woodworking', 'Measuring & Layout', 'Power Tools', 'Cabinet Making', 'Blueprint Reading']
};
for (const skills of Object.values(VOCATION_SKILLS)) {
  for (const s of skills) if (!skillSet.has(s)) skillSet.set(s, { category: 'Vocational', demand: 0 });
}

// ---------- 2. skills (bulk) ----------
const seenSkill = new Set();
const skillRows = [...skillSet.entries()]
  .filter(([name]) => name && name.trim().length > 0)
  .map(([name, meta]) => ({ name: name.trim(), category: meta.category }))
  .filter((r) => (seenSkill.has(r.name) ? false : (seenSkill.add(r.name), true)));
const nSk = await bulk('skills', ['name', 'category'], skillRows, 'name');
console.log('[1] skills:', nSk);

// ---------- 3. demo auth users ----------
const demoUsers = [
  { email: 'student@demo.com', password: 'student123', role: 'student', full_name: 'Aarav Sharma', target_role: 'AI Engineer' },
  { email: 'academia@demo.com', password: 'academia123', role: 'academia', full_name: 'Academia Demo', institution_name: 'SkillBridge Institute' },
  { email: 'industry@demo.com', password: 'industry123', role: 'industry', full_name: 'TechCorp Industries', company_name: 'TechCorp' },
  { email: 'admin@demo.com', password: 'admin123', role: 'admin', full_name: 'Platform Admin' }
];
const authUserIds = {};
for (const u of demoUsers) {
  const pw = await client.query("SELECT crypt($1, gen_salt('bf')) AS hash", [u.password]);
  const id = randomUUID();
  await client.query(
    `INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
     VALUES ($1, $2, 'authenticated', 'authenticated', $3, $4, now(), '{"provider":"email","providers":["email"]}'::jsonb, $5::jsonb, $6::timestamptz, $6::timestamptz, NULL, NULL, NULL, NULL)
     ON CONFLICT (email) WHERE (is_sso_user = false) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password
     RETURNING id`,
    ['00000000-0000-0000-0000-000000000000', id, u.email, pw.rows[0].hash,
      JSON.stringify({ role: u.role, full_name: u.full_name, name: u.full_name, companyName: u.company_name, institutionName: u.institution_name }), now]
  );
  authUserIds[u.email] = id;
  await client.query(
    `INSERT INTO profiles (id, role, email, full_name, company_name, institution_name, has_completed_onboarding, target_role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8::timestamptz, $8::timestamptz)
     ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email, full_name = EXCLUDED.full_name`,
    [id, u.role, u.email, u.full_name, u.company_name || null, u.institution_name || null, u.target_role || null, now]
  );
}
console.log('[2] demo users:', Object.keys(authUserIds).length);

// ---------- 4. sources & batches ----------
async function makeImport(name, type, desc, imp, proc) {
  const src = await client.query('INSERT INTO dataset_sources (name, source_type, description) VALUES ($1,$2,$3) RETURNING id', [name, type, desc]);
  const b = await client.query('INSERT INTO import_batches (dataset_source_id, status, records_processed, records_imported, records_skipped, invalid_records, import_date) VALUES ($1,\'Completed\',$3,$2,0,0,$4::timestamptz) RETURNING id', [src.rows[0].id, imp, proc, now]);
  return b.rows[0].id;
}

// ---------- 5. industry_requirements ----------
const reqBatchId = await makeImport('Job Posting Dataset (all_job_post.csv)', 'industry_requirements', 'Real industry role requirements parsed from job postings', jobRoleToSkills.size, allJobRows.length);
const reqRows = [...jobRoleToSkills.entries()].map(([role, meta]) => ({ role_name: role, skills: JSON.stringify(meta.skills.slice(0, 12)), category: meta.category, import_batch_id: reqBatchId }));
const nReq = await bulk('industry_requirements', ['role_name', 'skills', 'category', 'import_batch_id'], reqRows);
console.log('[3] industry_requirements:', nReq);

// ---------- 6. internships ----------
const intBatchId = await makeImport('Job Posting Dataset (all_job_post.csv)', 'internships', 'Sample of internship postings derived from job posts', 250, allJobRows.length);
const categoryBuckets = {};
for (const job of allJobRows) { (categoryBuckets[job.category || 'Other'] ??= []).push(job); }
const picked = [];
for (const cat of Object.keys(categoryBuckets)) {
  const bucket = categoryBuckets[cat];
  const step = Math.max(1, Math.floor(bucket.length / 50));
  bucket.forEach((job, i) => { if (i % step === 0) picked.push(job); });
}
const industries = await client.query(`SELECT id FROM profiles WHERE role = 'industry' LIMIT 3`);
const industryIds = industries.rows.map((r) => r.id);
const LOCATIONS = ['Remote', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai'];
const MODES = ['Remote', 'Hybrid', 'On-site'];
const intRows = picked.slice(0, 250).map((job, i) => ({
  industry_id: industryIds[i % industryIds.length],
  title: job.job_title,
  description: (job.job_description || '').slice(0, 1000),
  location: LOCATIONS[i % LOCATIONS.length],
  work_mode: MODES[i % MODES.length],
  duration: `${3 + (i % 3)} months`,
  required_skills: JSON.stringify(parseSkillList(job.job_skill_set).slice(0, 10)),
  status: 'Open',
  category: catToSkill[job.category] || 'General',
  import_batch_id: intBatchId
}));
const nInt = await bulk('internships', ['industry_id', 'title', 'description', 'location', 'work_mode', 'duration', 'required_skills', 'status', 'category', 'import_batch_id'], intRows);
console.log('[4] internships:', nInt);

// ---------- 7. challenges ----------
const chBatchId = await makeImport('Challenge seed', 'challenges', 'Seed challenges for industry portal', 6, 6);
const challengeTemplates = [
  { title: 'AI Model Optimization Challenge', domain: 'Machine Learning', difficulty: 'Advanced', duration: '2 weeks', skills: ['Python', 'Machine Learning', 'TensorFlow'] },
  { title: 'Full-Stack Product Sprint', domain: 'Web Development', difficulty: 'Intermediate', duration: '1 week', skills: ['React', 'Node.js', 'SQL'] },
  { title: 'Data Insights Hackathon', domain: 'Data Science', difficulty: 'Intermediate', duration: '2 weeks', skills: ['Data Analysis', 'SQL', 'Visualization'] },
  { title: 'UI/UX Design Challenge', domain: 'Design', difficulty: 'Beginner', duration: '1 week', skills: ['Figma', 'Wireframing', 'UX Research'] },
  { title: 'Cybersecurity Capture the Flag', domain: 'Cybersecurity', difficulty: 'Advanced', duration: '3 weeks', skills: ['Networking', 'Security', 'Linux'] },
  { title: 'Cloud Architecture Blueprint', domain: 'Cloud', difficulty: 'Advanced', duration: '2 weeks', skills: ['AWS', 'Docker', 'System Design'] }
];
for (const c of challengeTemplates) {
  await client.query(`INSERT INTO challenges (industry_id, title, domain, difficulty, duration, description, required_skills, status, import_batch_id, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,'Active',$8,$9::timestamptz)`,
    [industryIds[0], c.title, c.domain, c.difficulty, c.duration, `Solve the ${c.title.toLowerCase()} to showcase your ${c.domain} skills.`, JSON.stringify(c.skills), chBatchId, now]);
}
console.log('[5] challenges:', challengeTemplates.length);

// ---------- 8. students ----------
const studentRows = parse(
  readFileSync(ROOT + 'datasets/data/source/Skill_Job_Matching_Dataset.csv', 'utf8').replace(/\r/g, '\n'),
  { columns: true, skip_empty_lines: true, bom: true }
);
const studentBatchId = await makeImport('Skill-Job Matching Dataset (Skill_Job_Matching_Dataset.csv)', 'students', '2809 vocational students with skills', studentRows.length, studentRows.length);
const PROGRAM_LABEL = { Welder: 'Fabrication Technology', Plumber: 'Plumbing Technology', Mechanic: 'Automotive Technology', Electrician: 'Electrical Technology', 'IT Technician': 'Information Technology', Carpenter: 'Carpentry & Woodworking' };

// build profile + academic + student_skills in memory with client UUIDs
const profileRows = [], acadRows = [], ssRows = [];
const skillIdCache = new Map((await client.query('SELECT id, name FROM skills')).rows.map((r) => [r.name, r.id]));

for (const s of studentRows) {
  const pid = randomUUID();
  const program = s.Vocational_Program;
  const skillNames = VOCATION_SKILLS[program] || [];
  const codes = [s.Skill_1, s.Skill_2, s.Skill_3, s.Skill_4, s.Skill_5].map((v) => Math.max(0, Math.min(10, Number(v) || 0)));
  const genderAbb = s.Gender === 'Male' ? 'M' : 'F';
  profileRows.push({ role: 'student', email: `${s.Student_ID.toLowerCase()}@skillbridge.demo`, full_name: `${s.Student_ID} (${genderAbb})`, institution_name: PROGRAM_LABEL[program] || program, has_completed_onboarding: true, target_role: s.Job_Title, import_batch_id: studentBatchId, created_at: now, updated_at: now, id: pid });
  acadRows.push({ student_id: pid, institution: PROGRAM_LABEL[program] || program, department: program, degree: s.Job_Title, gpa: Math.round(Number(s.Academic_Performance) * 100) / 1000, import_batch_id: studentBatchId, created_at: now });
  for (let i = 0; i < skillNames.length; i++) {
    const sid = skillIdCache.get(skillNames[i]);
    if (!sid) continue;
    ssRows.push({ student_id: pid, skill_id: sid, proficiency: Math.max(10, codes[i] * 10), verification_status: 'Verified', source: 'Dataset', import_batch_id: studentBatchId, created_at: now, updated_at: now });
  }
}
const nProf = await bulk('profiles', ['id', 'role', 'email', 'full_name', 'institution_name', 'has_completed_onboarding', 'target_role', 'import_batch_id', 'created_at', 'updated_at'], profileRows);
const nAcad = await bulk('academic_records', ['student_id', 'institution', 'department', 'degree', 'gpa', 'import_batch_id', 'created_at'], acadRows);
const nSS = await bulk('student_skills', ['student_id', 'skill_id', 'proficiency', 'verification_status', 'source', 'import_batch_id', 'created_at', 'updated_at'], ssRows);
console.log('[6] students:', nProf, '| academic:', nAcad, '| student_skills:', nSS);

// ---------- 9. employability ----------
const placementRows = parse(
  readFileSync(ROOT + 'datasets/data/source/Placement_Data_Full_Class.csv', 'utf8').replace(/\r/g, '\n'),
  { columns: true, skip_empty_lines: true, bom: true }
);
const empBatchId = await makeImport('Campus Placement Dataset (Placement_Data_Full_Class.csv)', 'employability', 'Employability records for campus placement', placementRows.length, placementRows.length);
const empProfiles = [], empAcad = [];
for (const p of placementRows) {
  const pid = randomUUID();
  const degreeT = p.degree_t || 'General';
  empProfiles.push({ role: 'student', email: `candidate_${p.sl_no}@skillbridge.demo`, full_name: `Candidate ${p.sl_no}`, institution_name: 'SkillBridge Placement Campus', has_completed_onboarding: true, target_role: p.status, import_batch_id: empBatchId, created_at: now, updated_at: now, id: pid });
  empAcad.push({ student_id: pid, institution: 'SkillBridge Placement Campus', department: degreeT, degree: p.specialisation, gpa: Math.round(Number(p.degree_p) * 100) / 100 || 0, source_employability_score: Math.round(Number(p.etest_p) * 100) / 100 || 0, import_batch_id: empBatchId, created_at: now });
}
const nEp = await bulk('profiles', ['id', 'role', 'email', 'full_name', 'institution_name', 'has_completed_onboarding', 'target_role', 'import_batch_id', 'created_at', 'updated_at'], empProfiles);
const nEa = await bulk('academic_records', ['student_id', 'institution', 'department', 'degree', 'gpa', 'source_employability_score', 'import_batch_id', 'created_at'], empAcad);
console.log('[7] employability:', nEp, '| acad:', nEa);

// ---------- 10. demo student skills ----------
const demoStudentId = authUserIds['student@demo.com'];
const demoSkillDefs = [
  ['Python', 85], ['Machine Learning', 78], ['SQL', 70], ['React', 60], ['Node.js', 55],
  ['Data Analysis', 72], ['TensorFlow', 50], ['AWS', 45], ['Docker', 40], ['Communication', 90], ['Problem Solving', 88]
];
const demoSS = [];
for (const [name, prof] of demoSkillDefs) {
  const sid = skillIdCache.get(name);
  if (!sid) continue;
  demoSS.push({ student_id: demoStudentId, skill_id: sid, proficiency: prof, verification_status: 'Verified', source: 'Manual', created_at: now, updated_at: now });
}
await bulk('student_skills', ['student_id', 'skill_id', 'proficiency', 'verification_status', 'source', 'created_at', 'updated_at'], demoSS);
await client.query(`UPDATE profiles SET target_role = 'AI Engineer', has_completed_onboarding = true WHERE id = $1`, [demoStudentId]);
console.log('[8] demo student skills seeded');

// ensure skills used by demos/roles exist even if not in job posts
const extraSkills = ['Python', 'Machine Learning', 'SQL', 'React', 'Node.js', 'Data Analysis', 'TensorFlow', 'AWS', 'Docker', 'Communication', 'Problem Solving', 'Figma', 'Wireframing', 'UX Research', 'Networking', 'Security', 'Linux', 'System Design', 'Visualization', 'JavaScript', 'HTML', 'CSS'];
const extraRows = extraSkills.filter((n) => !skillSet.has(n)).map((n) => ({ name: n, category: 'Technical' })).filter((r) => (seenSkill.has(r.name) ? false : (seenSkill.add(r.name), true)));
await bulk('skills', ['name', 'category'], extraRows, 'name');
console.log('extra skills ensured');

await client.end();
console.log('IMPORT COMPLETE');