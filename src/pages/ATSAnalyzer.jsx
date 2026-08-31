import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { extractResumeText } from '../utils/resumeTextExtractor';

const CATEGORIES = [
  ['technical', '⌘', 'Technical / IT', 'Software, data, engineering', ['software', 'developer', 'engineering', 'programming', 'technical', 'data', 'technology', 'cloud', 'api', 'database']],
  ['nonTechnical', '▦', 'Non-Technical', 'HR, operations, administration', ['operations', 'human resources', 'administration', 'recruitment', 'coordination', 'office', 'communication']],
  ['salesMarketing', '↗', 'Sales & Marketing', 'Sales, marketing, growth', ['sales', 'marketing', 'business development', 'campaign', 'social media', 'customer', 'content', 'brand']],
  ['bankingFinance', '$', 'Banking & Finance', 'Banking, accounting, finance', ['finance', 'banking', 'accounting', 'financial', 'investment', 'audit', 'budget', 'excel']],
  ['studentFresher', '✦', 'Student / Fresher', 'Internships, graduate, entry level', ['student', 'internship', 'graduate', 'academic', 'project', 'coursework', 'volunteer', 'university']],
];
const STOP_WORDS = new Set('about after again also and are been being between both could does doing each for from have into just more most much must need our over should some than that their them then there these they this those through using very what when where which while with would your years'.split(' '));
const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').replace(/\s+/g, ' ').trim();
const colorFor = score => score >= 80 ? '#16805b' : score >= 60 ? '#b87520' : '#c44b4b';
const unique = values => [...new Set(values.filter(Boolean))];

function keywords(text) { return unique(normalize(text).split(' ').filter(word => word.length > 3 && !STOP_WORDS.has(word))); }
function analyze(text, category, jobDescription) {
  const source = normalize(text);
  const categoryData = CATEGORIES.find(item => item[0] === category) || CATEGORIES[0];
  const required = jobDescription.trim() ? keywords(jobDescription).slice(0, 35) : categoryData[4];
  const matched = required.filter(word => source.includes(word));
  const missing = required.filter(word => !source.includes(word));
  const keywordScore = required.length ? Math.round(matched.length / required.length * 100) : 0;
  const sections = {
    experience: /experience|employment|work history|internship/i.test(text),
    education: /education|university|college|bachelor|master|degree|coursework/i.test(text),
    skills: /skills|technologies|tools|proficien/i.test(text),
    projects: /projects|portfolio/i.test(text),
  };
  const formatting = Math.min(100, 58 + Math.round(Math.min(text.length / 1800, 1) * 35) + (text.split(/\r?\n/).length > 8 ? 7 : 0));
  const experience = sections.experience ? 82 : sections.projects ? 64 : 32;
  const skills = sections.skills ? Math.min(100, 58 + Math.min(42, matched.length * 5)) : 30;
  const score = Math.min(100, Math.max(0, Math.round(keywordScore * (jobDescription.trim() ? .42 : .26) + formatting * .2 + experience * .18 + skills * .16 + (sections.education ? 8 : 0))));
  const suggestions = [];
  if (!sections.experience) suggestions.push('Add experience, internships, volunteering, or practical work if you have it.');
  if (!sections.skills) suggestions.push('Add a clear Skills section with tools you genuinely use.');
  if (!/summary|objective|profile/i.test(text)) suggestions.push('Add a short professional summary near the top of your resume.');
  if (!/\d|%|increased|reduced|improved|managed/i.test(text)) suggestions.push('Use stronger action verbs and measurable outcomes where you can support them.');
  if (missing.length && jobDescription.trim()) suggestions.push(`If relevant to your background, consider mentioning: ${missing.slice(0, 4).join(', ')}.`);
  if (!suggestions.length) suggestions.push('Your resume has a solid foundation. Review each section for accuracy before applying.');
  return { score, matched, missing: missing.slice(0, 12), suggestions, breakdown: [{ label: 'Keyword match', score: keywordScore }, { label: 'Formatting', score: formatting }, { label: 'Experience', score: experience }, { label: 'Skills relevance', score: skills }] };
}

function profileFrom(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return { name: lines.find(line => line.length > 2 && line.length < 55 && !/@/.test(line) && !/resume|curriculum vitae/i.test(line)) || 'Name not detected', email: text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || 'Not detected' };
}

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
  const requestRef = useRef(0);
  const hasUploadedResume = Boolean(resumeFile);
  const text = parsedResume?.text || '';
  const profile = profileFrom(text);

  const handleUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(extension)) { setResumeFile(null); setParsedResume(null); setUploadStatus('error'); setMessage('Unsupported file. Please upload PDF, DOC, or DOCX.'); return; }
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setResumeFile(file); setParsedResume(null); setAnalysis(null); setUploadStatus('parsing'); setMessage('Reading your resume...');
    try {
      const extracted = await extractResumeText(file);
      if (!extracted.trim()) throw new Error('empty');
      if (requestRef.current !== requestId) return;
      setParsedResume({ text: extracted }); setUploadStatus('parsed'); setMessage('Resume read successfully');
    } catch {
      if (requestRef.current !== requestId) return;
      setParsedResume(null); setUploadStatus('error'); setMessage(extension === '.doc' ? "Old .doc files aren't supported yet. Please upload PDF or DOCX." : "We couldn't read this file. Please try another PDF or DOCX.");
    }
  };
  const runAnalysis = async () => {
    if (!hasUploadedResume) { setUploadStatus('error'); setMessage('Please upload a resume first.'); return; }
    if (uploadStatus === 'parsing') { setMessage("We're still reading your resume..."); return; }
    if (!parsedResume?.text) { setUploadStatus('error'); setMessage("We couldn't read this file. Please try another PDF or DOCX."); return; }
    if (!category) { setMessage('Please choose one career path.'); return; }
    setAnalyzing(true); setAnalysis(null); await new Promise(resolve => setTimeout(resolve, 550)); setAnalysis(analyze(text, category, jobDescription)); setAnalyzing(false);
  };
  const reset = () => { requestRef.current += 1; setResumeFile(null); setParsedResume(null); setUploadStatus('idle'); setMessage(''); setCategory(''); setJobDescription(''); setShowJobDescription(false); setAnalysis(null); };
  return <main className="job-check-page"><header className="job-check-hero"><div><p className="eyebrow"><span /> Resume & Job Match</p><h1>Check your resume against the role you want.</h1><p>Upload a resume, optionally paste a job description, and get ATS health plus role-fit guidance in one view.</p></div><button onClick={() => navigate('/dashboard')}>← Dashboard</button></header><div className="job-check-layout"><section className="job-check-inputs"><div className="job-check-card"><div className="job-check-card__title"><h2><span>01</span> Upload your resume</h2>{resumeFile && <button onClick={reset}>Remove file</button>}</div><label className={`job-upload ${parsedResume ? 'job-upload--success' : ''}`} htmlFor="job-resume"><strong>{resumeFile ? resumeFile.name : 'Choose a PDF, DOC, or DOCX'}</strong><small>{uploadStatus === 'parsing' ? 'Reading your resume...' : parsedResume ? 'Resume read successfully' : 'Your resume is read locally in your browser.'}</small><input id="job-resume" type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} /></label>{message && <p className={`job-message job-message--${uploadStatus}`}>{uploadStatus === 'parsed' ? '✓ ' : uploadStatus === 'error' ? '! ' : ''}{message}</p>}{parsedResume && <div className="job-detected"><div><span>Name</span><b>{profile.name}</b></div><div><span>Email</span><b>{profile.email}</b></div><div><span>Text</span><b>{text.split(/\s+/).filter(Boolean).length} words</b></div></div>}</div><div className="job-check-card"><div className="job-check-card__title"><h2><span>02</span> Choose a career path</h2><small>One choice</small></div><div className="job-category-grid">{CATEGORIES.map(([id, icon, title, detail]) => <button type="button" key={id} className={category === id ? 'selected' : ''} onClick={() => { setCategory(id); setAnalysis(null); }}><i>{icon}</i><b>{title}</b><small>{detail}</small>{category === id && <strong>✓</strong>}</button>)}</div></div><div className="job-optional"><button type="button" onClick={() => setShowJobDescription(value => !value)}><b>{showJobDescription ? '−' : '+'}</b> Add Job Description <small>Optional deeper match</small></button>{showJobDescription && <textarea value={jobDescription} onChange={event => { setJobDescription(event.target.value); setAnalysis(null); }} rows={5} placeholder="Paste the role, requirements, and responsibilities here..." />}</div><Button onClick={runAnalysis} loading={analyzing} disabled={analyzing || !parsedResume} size="lg">{analyzing ? 'Analyzing your resume...' : 'Analyze my resume →'}</Button></section><section className="job-check-results">{analyzing && <div className="job-empty"><div className="job-spinner" /><h2>Analyzing your resume</h2><p>Checking its actual content, skills, and sections...</p></div>}{!analyzing && !analysis && !hasUploadedResume && <div className="job-empty"><div>◌</div><h2>Check your resume's ATS score</h2><p>Upload your resume and we'll analyze its formatting, skills, keywords, and content.</p><small>PDF · DOC · DOCX</small></div>}{!analyzing && !analysis && hasUploadedResume && <div className="job-empty"><div>✓</div><h2>Ready to analyze</h2><p>{uploadStatus === 'parsing' ? 'Reading your resume...' : 'Your resume has been successfully read. Choose a path and analyze it.'}</p></div>}{analysis && <Results analysis={analysis} file={resumeFile} onReset={reset} />}</section></div></main>;
}

function Results({ analysis, file, onReset }) { return <div className="job-results animate-fade-in"><div className="job-score"><div className="job-score-ring" style={{ '--score': `${analysis.score * 3.6}deg`, '--color': colorFor(analysis.score) }}><b>{analysis.score}</b><small>/ 100</small></div><div><p className="eyebrow">ATS score</p><h2>{analysis.score >= 80 ? 'Strong match' : analysis.score >= 60 ? 'Good match' : 'Needs attention'}</h2><p>Based on {file?.name || 'your uploaded resume'}.</p></div></div><div className="job-breakdown"><h2>Score breakdown</h2>{analysis.breakdown.map(item => <div className="job-breakdown-row" key={item.label}><ProgressBar value={item.score} label={item.label} color={colorFor(item.score)} /></div>)}</div><div className="job-keywords"><Keyword title="Matched keywords" items={analysis.matched} tone="good" /><Keyword title="Missing keywords" items={analysis.missing} tone="warn" /></div><div className="job-suggestions"><h2>Improvement suggestions</h2><ol>{analysis.suggestions.map((item, index) => <li key={item}><b>{index + 1}</b>{item}</li>)}</ol></div><Button variant="outline" onClick={onReset}>Analyze another resume</Button></div>; }
function Keyword({ title, items, tone }) { return <div className={`job-keyword job-keyword--${tone}`}><h2>{title} <span>{items.length}</span></h2><div>{items.length ? items.map(item => <span key={item}>{item}</span>) : <p>No items found.</p>}</div></div>; }
