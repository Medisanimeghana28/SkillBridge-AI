// Skill assessments: proctored proof before a skill lands in Skill DNA.
//
// Provider order:
//  1. Gemini (https://ai.google.dev) when VITE_GEMINI_API_KEY is set —
//     questions are generated fresh for the exact skill.
//  2. Built-in question bank for popular skills (real questions, reviewed).
// Skills outside the bank without a key can only be saved as explicitly
// self-reported / Unverified — never as assessed.

const GEMINI_MODEL = 'gemini-3.6-flash';

// Each entry: { q, options: [4], answer: index }
const BANK = {
  python: [
    { q: 'What does print(2 ** 3) output in Python?', options: ['6', '8', '9', '16'], answer: 1 },
    { q: 'Which of these is immutable?', options: ['list', 'dict', 'tuple', 'set'], answer: 2 },
    { q: 'What does len("hello") return?', options: ['4', '5', '6', 'Error'], answer: 1 },
    { q: 'Which keyword defines a function?', options: ['func', 'def', 'function', 'lambda only'], answer: 1 },
  ],
  javascript: [
    { q: 'What is the result of typeof null?', options: ['"null"', '"object"', '"undefined"', '"nil"'], answer: 1 },
    { q: 'Which declaration cannot be reassigned?', options: ['var', 'let', 'const', 'static'], answer: 2 },
    { q: 'What does [1, 2, 3].map(x => x * 2) return?', options: ['[1,2,3]', '[2,4,6]', '[2,2,2]', 'Error'], answer: 1 },
    { q: '=== differs from == because it…', options: ['is faster', 'checks type and value', 'works on objects', 'is deprecated'], answer: 1 },
  ],
  react: [
    { q: 'What is JSX?', options: ['A database', 'JavaScript syntax for UI markup', 'A testing tool', 'A CSS framework'], answer: 1 },
    { q: 'Which hook holds component state?', options: ['useEffect', 'useState', 'useMemo', 'useRef'], answer: 1 },
    { q: 'How is data passed to a child component?', options: ['Via props', 'Via state', 'Via context only', 'Via refs only'], answer: 0 },
    { q: 'Why do list items need a "key"?', options: ['For styling', 'To help React track identity', 'For SEO', 'It is optional metadata'], answer: 1 },
  ],
  sql: [
    { q: 'Which clause filters rows?', options: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING only'], answer: 2 },
    { q: 'Which JOIN returns only matching rows on both sides?', options: ['LEFT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN'], answer: 1 },
    { q: 'What does ORDER BY age DESC do?', options: ['Sorts youngest first', 'Sorts oldest first', 'Groups by age', 'Deletes duplicates'], answer: 1 },
    { q: 'Which statement adds a row?', options: ['ADD', 'INSERT INTO', 'APPEND', 'CREATE'], answer: 1 },
  ],
  java: [
    { q: 'What is the entry point of a Java program?', options: ['start()', 'public static void main', 'init()', 'run()'], answer: 1 },
    { q: 'What does JVM stand for?', options: ['Java Virtual Machine', 'Java Vendor Module', 'Joint Variable Method', 'Java Version Manager'], answer: 0 },
    { q: 'Which keyword expresses inheritance?', options: ['implements only', 'extends', 'inherits', 'super only'], answer: 1 },
    { q: 'Which type holds whole numbers?', options: ['float', 'String', 'int', 'char'], answer: 2 },
  ],
  'node.js': [
    { q: 'What is Node.js?', options: ['A frontend framework', 'A JS runtime outside the browser', 'A database', 'A package registry'], answer: 1 },
    { q: 'Which tool installs Node packages?', options: ['pip', 'npm', 'maven', 'gem'], answer: 1 },
    { q: 'How do you import a local module?', options: ['import from http', 'require("./file")', 'include()', 'using'], answer: 1 },
    { q: 'Node.js handles I/O chiefly via…', options: ['threads per request', 'an event loop', 'forking', 'cron jobs'], answer: 1 },
  ],
  git: [
    { q: 'Which command records a snapshot?', options: ['git push', 'git commit', 'git clone', 'git fetch'], answer: 1 },
    { q: 'git push sends commits…', options: ['to a branch locally', 'to a remote repository', 'to the staging area', 'to the trash'], answer: 1 },
    { q: 'What does git clone do?', options: ['Deletes a repo', 'Copies a remote repo locally', 'Merges branches', 'Shows history'], answer: 1 },
    { q: 'A branch is best described as…', options: ['A backup file', 'A movable pointer to commits', 'A server', 'A tag only'], answer: 1 },
  ],
  'machine learning': [
    { q: 'Learning from labeled examples is…', options: ['unsupervised learning', 'supervised learning', 'reinforcement only', 'clustering'], answer: 1 },
    { q: 'Why split data into train and test sets?', options: ['To train faster', 'To measure generalization', 'To reduce size', 'It is optional'], answer: 1 },
    { q: 'Overfitting means the model…', options: ['is too simple', 'memorizes training noise', 'never converges', 'needs more features only'], answer: 1 },
    { q: 'Predicting a number (e.g. price) is…', options: ['classification', 'clustering', 'regression', 'ranking only'], answer: 2 },
  ],
};

function bankKey(skillName) {
  return String(skillName || '').trim().toLowerCase();
}

export function hasBankQuestions(skillName) {
  return Boolean(BANK[bankKey(skillName)]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateWithGemini(skillName, count = 5) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return null;

  const prompt = `Generate ${count} beginner-to-intermediate multiple-choice quiz questions to test practical knowledge of the skill "${skillName}".
Return ONLY a JSON array with this exact shape, no markdown fences:
[{"question": "...", "options": ["...", "...", "...", "..."], "answer": 0}]
Rules: exactly 4 options per question, "answer" is the 0-based index of the single correct option, questions must be specific to ${skillName} (not generic), no trick questions.`;

  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(1500 * attempt);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
          }),
        }
      );
      if (res.status === 429 || res.status === 503) {
        lastError = new Error('AI is busy (overloaded).');
        continue;
      }
      if (!res.ok) throw new Error(`Gemini request failed (${res.status}).`);
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned no content.');
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Gemini returned no questions.');

      const cleaned = parsed
        .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length === 4)
        .slice(0, count)
        .map((q) => ({
          q: q.question,
          options: q.options.map(String),
          answer: Math.max(0, Math.min(3, Number(q.answer) || 0)),
        }));
      if (cleaned.length === 0) throw new Error('Gemini returned no usable questions.');
      return cleaned;
    } catch (err) {
      lastError = err;
      if (err.message === 'AI is busy (overloaded).') continue;
      throw err;
    }
  }
  throw lastError || new Error('Gemini request failed.');
}

/**
 * Load assessment questions for a skill.
 * Returns { questions, source: 'gemini' | 'bank' }.
 * Throws when neither source can serve this skill.
 */
export async function loadAssessment(skillName, count = 5) {
  const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  // Prefer live AI generation when a key is configured.
  try {
    const ai = await generateWithGemini(skillName, count);
    if (ai && ai.length > 0) return { questions: ai, source: 'gemini' };
  } catch (err) {
    console.warn('Gemini generation failed, falling back to bank:', err.message);
    if (hasKey && err.message === 'AI is busy (overloaded).' && !BANK[bankKey(skillName)]) {
      throw new Error('AI question service is busy right now — please try again in a minute, or save as self-reported.');
    }
  }

  const banked = BANK[bankKey(skillName)];
  if (banked) {
    const picked = [...banked].sort(() => Math.random() - 0.5).slice(0, count);
    return { questions: picked, source: 'bank' };
  }

  throw new Error(
    `"${skillName}" needs AI-generated questions — set VITE_GEMINI_API_KEY (see .env.example), or save it as self-reported instead.`
  );
}

export function scoreAssessment(questions, answers) {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct += 1;
  });
  return questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
}

/** Verification outcome for an assessed score. */
export function verificationForScore(score) {
  return score >= 70 ? 'Partially Verified' : 'Claimed';
}
