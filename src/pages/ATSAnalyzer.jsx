import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { extractResumeText } from '../utils/resumeTextExtractor';

/* ---------------------------------------------------------
   Palette — dark navy ground, cream text, teal as the working
   accent, amber reserved for one highlight moment. Matches the
   site's existing dark panels (PDF-import / template sections).
--------------------------------------------------------- */
const colors = {
  bg: '#151A24',
  surface: '#1C2330',
  surfaceMuted: '#232B3B',
  border: '#2B3345',
  borderStrong: '#3A4359',
  ink: '#F1ECDE',
  inkSoft: '#A9B2C9',
  inkFaint: '#727C97',
  accent: '#2E6F5C',
  accentBright: '#4FA98C',
  accentSoft: 'rgba(46, 111, 92, 0.16)',
  amber: '#D98A46',
  amberSoft: 'rgba(217, 138, 70, 0.15)',
  danger: '#C1554A',
  cream: '#F1ECDE',
  creamInk: '#14171F',
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600;700&display=swap');`;

/* ---------------------------------------------------------
   Data & analysis logic — unchanged from the original
--------------------------------------------------------- */
const CATEGORIES = [
  ['technical', '⌘', 'Technical / IT', 'Software, data, engineering',
    ['software', 'developer', 'engineering', 'programming', 'technical', 'data', 'technology', 'cloud', 'api', 'database']],
  ['nonTechnical', '▦', 'Non-Technical', 'HR, operations, administration',
    ['operations', 'human resources', 'administration', 'recruitment', 'coordination', 'office', 'communication']],
  ['salesMarketing', '↗', 'Sales & Marketing', 'Sales, marketing, growth',
    ['sales', 'marketing', 'business development', 'campaign', 'social media', 'customer', 'content', 'brand']],
  ['bankingFinance', '$', 'Banking & Finance', 'Banking, accounting, finance',
    ['finance', 'banking', 'accounting', 'financial', 'investment', 'audit', 'budget', 'excel']],
  ['studentFresher', '✦', 'Student / Fresher', 'Internships, graduate, entry level',
    ['student', 'internship', 'graduate', 'academic', 'project', 'coursework', 'volunteer', 'university']],
];

const STOP_WORDS = new Set(
  'about after again also and are been being between both could does doing each for from have into just more most much must need our over should some than that their them then there these they this those through using very what when where which while with would your years'.split(' ')
);

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').replace(/\s+/g, ' ').trim();
const colorFor = score => (score >= 80 ? colors.accentBright : score >= 60 ? colors.amber : colors.danger);
const unique = values => [...new Set(values.filter(Boolean))];

function keywords(text) {
  return unique(normalize(text).split(' ').filter(word => word.length > 3 && !STOP_WORDS.has(word)));
}

function analyze(text, category, jobDescription) {
  const source = normalize(text);
  const categoryData = CATEGORIES.find(item => item[0] === category) || CATEGORIES[0];
  const required = jobDescription.trim() ? keywords(jobDescription).slice(0, 35) : categoryData[4];
  const matched = required.filter(word => source.includes(word));
  const missing = required.filter(word => !source.includes(word));
  const keywordScore = required.length ? Math.round((matched.length / required.length) * 100) : 0;

  const sections = {
    experience: /experience|employment|work history|internship/i.test(text),
    education: /education|university|college|bachelor|master|degree|coursework/i.test(text),
    skills: /skills|technologies|tools|proficien/i.test(text),
    projects: /projects|portfolio/i.test(text),
  };

  const formatting = Math.min(100, 58 + Math.round(Math.min(text.length / 1800, 1) * 35) + (text.split(/\r?\n/).length > 8 ? 7 : 0));
  const experience = sections.experience ? 82 : sections.projects ? 64 : 32;
  const skills = sections.skills ? Math.min(100, 58 + Math.min(42, matched.length * 5)) : 30;
  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        keywordScore * (jobDescription.trim() ? 0.42 : 0.26) +
        formatting * 0.2 +
        experience * 0.18 +
        skills * 0.16 +
        (sections.education ? 8 : 0)
      )
    )
  );

  const suggestions = [];
  if (!sections.experience) suggestions.push('Add experience, internships, volunteering, or practical work if you have it.');
  if (!sections.skills) suggestions.push('Add a clear Skills section with tools you genuinely use.');
  if (!/summary|objective|profile/i.test(text)) suggestions.push('Add a short professional summary near the top of your resume.');
  if (!/\d|%|increased|reduced|improved|managed/i.test(text)) suggestions.push('Use stronger action verbs and measurable outcomes where you can support them.');
  if (missing.length && jobDescription.trim()) suggestions.push(`If relevant to your background, consider mentioning: ${missing.slice(0, 4).join(', ')}.`);
  if (!suggestions.length) suggestions.push('Your resume has a solid foundation. Review each section for accuracy before applying.');

  return {
    score,
    matched,
    missing: missing.slice(0, 12),
    suggestions,
    breakdown: [
      { label: 'Keyword match', score: keywordScore },
      { label: 'Formatting', score: formatting },
      { label: 'Experience', score: experience },
      { label: 'Skills relevance', score: skills },
    ],
  };
}

function profileFrom(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return {
    name: lines.find(line => line.length > 2 && line.length < 55 && !/@/.test(line) && !/resume|curriculum vitae/i.test(line)) || 'Name not detected',
    email: text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || 'Not detected',
  };
}

function buildReportText(analysis, fileName) {
  const lines = [
    `ATS Report — ${fileName || 'resume'}`,
    `Score: ${analysis.score} / 100`,
    '',
    'Breakdown:',
    ...analysis.breakdown.map(item => `- ${item.label}: ${item.score}`),
    '',
    `Matched keywords (${analysis.matched.length}): ${analysis.matched.join(', ') || 'none'}`,
    `Missing keywords (${analysis.missing.length}): ${analysis.missing.join(', ') || 'none'}`,
    '',
    'Suggestions:',
    ...analysis.suggestions.map((item, i) => `${i + 1}. ${item}`),
  ];
  return lines.join('\n');
}

function downloadReport(analysis, fileName) {
  const blob = new Blob([buildReportText(analysis, fileName)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ats-report.txt';
  link.click();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------
   Reusable inline style fragments
--------------------------------------------------------- */
const cardStyle = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px' };
const eyebrowNumberStyle = { fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: colors.accentBright, background: colors.accentSoft, padding: '2px 7px', borderRadius: '5px' };
const pillCreamButton = { border: 'none', background: colors.cream, color: colors.creamInk, fontWeight: 700, fontSize: '0.85rem', padding: '10px 20px', borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap' };
const detectedBoxStyle = { background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '10px 12px' };

export default function ATSAnalyzer() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const requestRef = useRef(0);

  const hasUploadedResume = Boolean(resumeFile);
  const text = parsedResume?.text || '';
  const profile = profileFrom(text);

  const processFile = async file => {
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(extension)) {
      setResumeFile(null);
      setParsedResume(null);
      setUploadStatus('error');
      setMessage('Unsupported file. Please upload PDF, DOC, or DOCX.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setResumeFile(null);
      setParsedResume(null);
      setUploadStatus('error');
      setMessage('That file is larger than 8MB. Try a smaller export of your resume.');
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setResumeFile(file);
    setParsedResume(null);
    setAnalysis(null);
    setUploadStatus('parsing');
    setMessage('Reading your resume...');

    try {
      const extracted = await extractResumeText(file);
      if (!extracted.trim()) throw new Error('empty');
      if (requestRef.current !== requestId) return;
      setParsedResume({ text: extracted });
      setUploadStatus('parsed');
      setMessage('Resume read successfully');
    } catch {
      if (requestRef.current !== requestId) return;
      setParsedResume(null);
      setUploadStatus('error');
      setMessage(
        extension === '.doc'
          ? "Old .doc files aren't supported yet. Please upload PDF or DOCX."
          : "We couldn't read this file. Please try another PDF or DOCX."
      );
    }
  };

  const handleUpload = event => processFile(event.target.files?.[0]);

  const handleDrop = event => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const runAnalysis = async () => {
    if (!hasUploadedResume) {
      setUploadStatus('error');
      setMessage('Please upload a resume first.');
      return;
    }
    if (uploadStatus === 'parsing') {
      setMessage("We're still reading your resume...");
      return;
    }
    if (!parsedResume?.text) {
      setUploadStatus('error');
      setMessage("We couldn't read this file. Please try another PDF or DOCX.");
      return;
    }
    if (!category) {
      setMessage('Please choose one career path.');
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    await new Promise(resolve => setTimeout(resolve, 550));
    setAnalysis(analyze(text, category, jobDescription));
    setAnalyzing(false);
  };

  const reset = () => {
    requestRef.current += 1;
    setResumeFile(null);
    setParsedResume(null);
    setUploadStatus('idle');
    setMessage('');
    setCategory('');
    setJobDescription('');
    setShowJobDescription(false);
    setAnalysis(null);
  };

  const messageColor =
    uploadStatus === 'parsed' ? colors.accentBright : uploadStatus === 'error' ? colors.danger : colors.inkSoft;

  return (
    <main
      style={{
        background: colors.bg,
        color: colors.ink,
        minHeight: '100vh',
        padding: '40px 24px 72px',
        maxWidth: '1180px',
        margin: '0 auto',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        ${fontImport}
        .ats-btn { transition: background-color .15s ease, border-color .15s ease, color .15s ease; }
        .ats-spin { animation: atsSpin .8s linear infinite; }
        .ats-fade { animation: atsFade .25s ease; }
        @keyframes atsSpin { to { transform: rotate(360deg); } }
        @keyframes atsFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 860px) {
          .ats-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .ats-keywords { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Hero */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '20px',
          flexWrap: 'wrap',
          paddingBottom: '28px',
          marginBottom: '32px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: colors.amber, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors.amber, display: 'inline-block' }} />
            Resume &amp; Job Match
          </p>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: '2rem', lineHeight: 1.2, maxWidth: '620px', marginTop: '10px', color: colors.ink }}>
            Check your resume against the role you want.
          </h1>
          <p style={{ color: colors.inkSoft, fontSize: '0.95rem', maxWidth: '480px', marginTop: '12px' }}>
            Upload a resume, optionally paste a job description, and get ATS health plus role-fit guidance in one view.
          </p>
        </div>
        <button
          className="ats-btn"
          onClick={() => navigate('/dashboard')}
          style={pillCreamButton}
          onMouseEnter={e => (e.currentTarget.style.background = '#DCD6C4')}
          onMouseLeave={e => (e.currentTarget.style.background = colors.cream)}
        >
          ← Dashboard
        </button>
      </header>

      {/* Layout */}
      <div className="ats-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: '24px', alignItems: 'start' }}>
        {/* Inputs column */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Upload card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, margin: 0, color: colors.ink }}>
                <span style={eyebrowNumberStyle}>01</span> Upload your resume
              </h2>
              {resumeFile && (
                <button
                  className="ats-btn"
                  onClick={reset}
                  style={{ background: 'transparent', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: '0.75rem', padding: '5px 12px', borderRadius: '999px', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = colors.danger; e.currentTarget.style.color = colors.danger; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = colors.borderStrong; e.currentTarget.style.color = colors.inkSoft; }}
                >
                  Remove file
                </button>
              )}
            </div>

            <label
              htmlFor="ats-resume"
              className="ats-btn"
              onDragOver={event => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center',
                textAlign: 'center',
                border: `1.5px dashed ${isDragging ? colors.amber : parsedResume ? colors.accent : colors.borderStrong}`,
                borderStyle: parsedResume ? 'solid' : 'dashed',
                borderRadius: '10px',
                padding: '28px 16px',
                cursor: 'pointer',
                background: isDragging ? colors.amberSoft : parsedResume ? colors.accentSoft : colors.surfaceMuted,
                position: 'relative',
              }}
            >
              <strong style={{ color: colors.ink, fontSize: '0.92rem', fontWeight: 600 }}>
                {resumeFile ? resumeFile.name : 'Choose or drop a PDF, DOC, or DOCX'}
              </strong>
              <small style={{ color: colors.inkFaint, fontSize: '0.78rem' }}>
                {uploadStatus === 'parsing'
                  ? 'Reading your resume...'
                  : parsedResume
                    ? 'Resume read successfully'
                    : 'Your resume is read locally in your browser.'}
              </small>
              <input id="ats-resume" type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </label>

            {message && (
              <p style={{ fontSize: '0.82rem', margin: '12px 0 0', color: messageColor }}>
                {uploadStatus === 'parsed' ? '✓ ' : uploadStatus === 'error' ? '! ' : ''}
                {message}
              </p>
            )}

            {parsedResume && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '14px' }}>
                <div style={detectedBoxStyle}>
                  <span style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: colors.inkFaint, marginBottom: '3px' }}>Name</span>
                  <b style={{ fontSize: '0.85rem', color: colors.ink, fontWeight: 600, wordBreak: 'break-word' }}>{profile.name}</b>
                </div>
                <div style={detectedBoxStyle}>
                  <span style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: colors.inkFaint, marginBottom: '3px' }}>Email</span>
                  <b style={{ fontSize: '0.85rem', color: colors.ink, fontWeight: 600, wordBreak: 'break-word' }}>{profile.email}</b>
                </div>
                <div style={detectedBoxStyle}>
                  <span style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: colors.inkFaint, marginBottom: '3px' }}>Text</span>
                  <b style={{ fontSize: '0.85rem', color: colors.ink, fontWeight: 600 }}>{text.split(/\s+/).filter(Boolean).length} words</b>
                </div>
              </div>
            )}
          </div>

          {/* Category card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, margin: 0, color: colors.ink }}>
                <span style={eyebrowNumberStyle}>02</span> Choose a career path
              </h2>
              <small style={{ color: colors.inkFaint, fontSize: '0.75rem' }}>One choice</small>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              {CATEGORIES.map(([id, icon, title, detail]) => {
                const selected = category === id;
                return (
                  <button
                    type="button"
                    key={id}
                    className="ats-btn"
                    onClick={() => { setCategory(id); setAnalysis(null); }}
                    style={{
                      position: 'relative',
                      textAlign: 'left',
                      background: selected ? colors.accentSoft : colors.bg,
                      border: `1px solid ${selected ? colors.accent : colors.border}`,
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = colors.accentBright; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = colors.border; }}
                  >
                    <i style={{ fontStyle: 'normal', fontSize: '1.1rem', color: colors.accentBright }}>{icon}</i>
                    <b style={{ fontSize: '0.85rem', color: colors.ink, fontWeight: 600 }}>{title}</b>
                    <small style={{ fontSize: '0.72rem', color: colors.inkFaint }}>{detail}</small>
                    {selected && <strong style={{ position: 'absolute', top: '10px', right: '10px', color: colors.accentBright, fontSize: '0.85rem' }}>✓</strong>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional job description */}
          <div style={cardStyle}>
            <button
              type="button"
              onClick={() => setShowJobDescription(value => !value)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: colors.ink, fontSize: '0.88rem', cursor: 'pointer', padding: 0 }}
            >
              <b style={{ color: colors.accentBright, fontSize: '1rem' }}>{showJobDescription ? '−' : '+'}</b>
              Add Job Description
              <small style={{ color: colors.inkFaint, fontWeight: 400, marginLeft: 'auto' }}>Optional deeper match</small>
            </button>
            {showJobDescription && (
              <textarea
                value={jobDescription}
                onChange={event => { setJobDescription(event.target.value); setAnalysis(null); }}
                rows={5}
                placeholder="Paste the role, requirements, and responsibilities here..."
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '12px',
                  color: colors.ink,
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = colors.accentBright)}
                onBlur={e => (e.target.style.borderColor = colors.border)}
              />
            )}
          </div>

          <Button onClick={runAnalysis} loading={analyzing} disabled={analyzing || !parsedResume} size="lg">
            {analyzing ? 'Analyzing your resume...' : 'Analyze my resume →'}
          </Button>
        </section>

        {/* Results column */}
        <section style={{ ...cardStyle, padding: '28px', minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
          {analyzing && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '320px', color: colors.inkSoft }}>
              <div className="ats-spin" style={{ width: '32px', height: '32px', borderRadius: '50%', border: `3px solid ${colors.border}`, borderTopColor: colors.accentBright, margin: '0 auto 14px' }} />
              <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.15rem', marginBottom: '8px', color: colors.ink }}>Analyzing your resume</h2>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>Checking its actual content, skills, and sections...</p>
            </div>
          )}

          {!analyzing && !analysis && !hasUploadedResume && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '320px', color: colors.inkSoft }}>
              <div style={{ fontSize: '2rem', color: colors.accentBright, marginBottom: '10px' }}>◌</div>
              <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.15rem', marginBottom: '8px', color: colors.ink }}>Check your resume's ATS score</h2>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>Upload your resume and we'll analyze its formatting, skills, keywords, and content.</p>
              <small style={{ display: 'inline-block', marginTop: '10px', color: colors.inkFaint, fontSize: '0.72rem', letterSpacing: '0.04em' }}>PDF · DOC · DOCX</small>
            </div>
          )}

          {!analyzing && !analysis && hasUploadedResume && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '320px', color: colors.inkSoft }}>
              <div style={{ fontSize: '2rem', color: colors.accentBright, marginBottom: '10px' }}>✓</div>
              <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.15rem', marginBottom: '8px', color: colors.ink }}>Ready to analyze</h2>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{uploadStatus === 'parsing' ? 'Reading your resume...' : 'Your resume has been successfully read. Choose a path and analyze it.'}</p>
            </div>
          )}

          {analysis && <Results analysis={analysis} file={resumeFile} onReset={reset} />}
        </section>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------
   Results
--------------------------------------------------------- */
function Results({ analysis, file, onReset }) {
  return (
    <div className="ats-fade" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div
          style={{
            '--score': `${analysis.score * 3.6}deg`,
            '--color': colorFor(analysis.score),
            width: '92px',
            height: '92px',
            borderRadius: '50%',
            background: `conic-gradient(${colorFor(analysis.score)} ${analysis.score * 3.6}deg, ${colors.border} 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', background: colors.surface }} />
          <b style={{ position: 'relative', fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.5rem', color: colors.ink }}>{analysis.score}</b>
          <small style={{ position: 'relative', fontSize: '0.6rem', color: colors.inkFaint, marginLeft: '2px', alignSelf: 'flex-end', marginBottom: '6px' }}>/ 100</small>
        </div>
        <div>
          <p style={{ color: colors.amber, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>ATS score</p>
          <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', margin: '4px 0', color: colors.ink }}>
            {analysis.score >= 80 ? 'Strong match' : analysis.score >= 60 ? 'Good match' : 'Needs attention'}
          </h2>
          <p style={{ color: colors.inkFaint, fontSize: '0.82rem' }}>Based on {file?.name || 'your uploaded resume'}.</p>
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1rem', marginBottom: '14px', color: colors.ink }}>Score breakdown</h2>
        {analysis.breakdown.map(item => (
          <div style={{ marginBottom: '12px' }} key={item.label}>
            <ProgressBar value={item.score} label={item.label} color={colorFor(item.score)} />
          </div>
        ))}
      </div>

      <div className="ats-keywords" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Keyword title="Matched keywords" items={analysis.matched} tone="good" />
        <Keyword title="Missing keywords" items={analysis.missing} tone="warn" />
      </div>

      <div>
        <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1rem', marginBottom: '14px', color: colors.ink }}>Improvement suggestions</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analysis.suggestions.map((item, index) => (
            <li key={item} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: colors.inkSoft, lineHeight: 1.5 }}>
              <b style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: colors.accentSoft, color: colors.accentBright, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {index + 1}
              </b>
              {item}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={onReset}>Analyze another resume</Button>
        <button
          className="ats-btn"
          onClick={() => downloadReport(analysis, file?.name)}
          style={{ border: `1px solid ${colors.borderStrong}`, background: 'transparent', color: colors.inkSoft, fontSize: '0.85rem', fontWeight: 600, padding: '9px 18px', borderRadius: '999px', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accentBright; e.currentTarget.style.color = colors.accentBright; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.borderStrong; e.currentTarget.style.color = colors.inkSoft; }}
        >
          Download report
        </button>
      </div>
    </div>
  );
}

function Keyword({ title, items, tone }) {
  const [copied, setCopied] = useState(false);
  const isGood = tone === 'good';

  const copyAll = async () => {
    if (!items.length) return;
    try {
      await navigator.clipboard.writeText(items.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — fail silently, chips remain visible for manual copy
    }
  };

  return (
    <div style={{ borderRadius: '10px', padding: '16px', border: `1px solid ${colors.border}`, background: isGood ? colors.accentSoft : colors.amberSoft }}>
      <h2 style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', margin: '0 0 10px', color: colors.ink, fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600 }}>
        {title}
        <span style={{ fontSize: '0.68rem', color: colors.inkFaint, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{items.length}</span>
        {items.length > 0 && (
          <button
            type="button"
            className="ats-btn"
            onClick={copyAll}
            style={{ marginLeft: 'auto', background: 'transparent', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: '0.68rem', fontFamily: 'Inter, sans-serif', fontWeight: 500, padding: '3px 9px', borderRadius: '999px', cursor: 'pointer' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.length
          ? items.map(item => (
              <span key={item} style={{ background: colors.surface, border: `1px solid ${colors.border}`, color: colors.ink, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px' }}>
                {item}
              </span>
            ))
          : <p style={{ color: colors.inkFaint, fontSize: '0.8rem' }}>No items found.</p>}
      </div>
    </div>
  );
}