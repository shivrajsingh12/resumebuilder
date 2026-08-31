import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import { createSampleResume } from '../data/sampleResume';
import { TEMPLATE_CONFIGS } from '../templates';
import { extractResumeData } from '../utils/resumeTextExtractor';

const filters = ['All', 'ATS Friendly', 'Modern', 'Creative', 'Student', 'Professional', 'Executive', 'Tech', 'Academic'];
const careerPaths = {
  'Student / Fresher': ['student', 'modern', 'ats'], 'Software / IT': ['tech', 'modern', 'ats'], 'Business / Management': ['executive', 'twoColumn', 'modern'],
  'Creative / Design': ['creative', 'minimal', 'modern'], Academic: ['academic'], 'Experienced Professional': ['executive', 'compact', 'twoColumn'],
};

function TemplateCard({ template, recommended, onPreview, onUse }) {
  const sample = useMemo(() => ({ ...createSampleResume(), template: template.id }), [template.id]);
  const Template = template.component;
  return <article className={`template-card template-card--real ${recommended ? 'template-card--recommended' : ''}`}><div className="template-card__preview"><Template resume={sample} templateId={template.id} /></div><div className="template-card__body"><div className="template-card__title"><div><p className="template-category">{template.category}</p><h2>{template.name}</h2></div>{recommended && <span className="template-recommended">Recommended</span>}</div><p className="template-description">{template.description}</p><p className="template-fit">{template.atsFriendly ? 'ATS Friendly' : 'Creative Layout'}</p><div className="template-card__actions"><button type="button" onClick={() => onPreview(template)}>Preview</button><button type="button" className="template-use" onClick={() => onUse(template)}>Use Template</button></div></div></article>;
}

const importedLabels = [
  ['personal', 'Name'], ['contact', 'Contact information'], ['summary', 'Summary'], ['experience', 'Experience'], ['education', 'Education'], ['skills', 'Skills'], ['projects', 'Projects'], ['certifications', 'Certifications'], ['achievements', 'Achievements'], ['languages', 'Languages'], ['interests', 'Interests'], ['custom', 'Other information'],
];

function importedCategories(sections) {
  if (!sections) return [];
  const contact = sections.personal && ['email', 'phone', 'location', 'website', 'linkedin', 'github'].some(key => Boolean(sections.personal[key]));
  return importedLabels.filter(([key]) => key === 'contact' ? contact : key === 'personal' ? Boolean(sections.personal?.fullName) : Array.isArray(sections[key]) ? sections[key].length : Boolean(sections[key])).map(([, label]) => label);
}

export default function Templates({ onCreate, onToast }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [career, setCareer] = useState('');
  const [preview, setPreview] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [importError, setImportError] = useState('');
  const [reviewImport, setReviewImport] = useState(null);
  const [importedSections, setImportedSections] = useState(null);
  const recommended = careerPaths[career] || [];
  const filtered = TEMPLATE_CONFIGS.filter(template => {
    const matchesFilter = filter === 'All' || (filter === 'ATS Friendly' ? template.atsFriendly : template.category === filter);
    const query = search.trim().toLowerCase();
    return matchesFilter && (!query || `${template.name} ${template.category} ${template.description}`.toLowerCase().includes(query));
  });
  const handleUseTemplate = template => { const id = onCreate(`${template.name} resume`, { id: template.id, accentColor: template.accentColor }, importedSections); navigate(`/editor/${id}`); };
  const handleFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImportError('');
    setIsReading(true);
    try {
      setReviewImport(await extractResumeData(file));
    } catch {
      setImportError("We couldn't read this resume. Please try another PDF or DOCX.");
    } finally {
      setIsReading(false);
    }
  };
  const confirmImport = () => {
    setImportedSections(reviewImport);
    setReviewImport(null);
    onToast?.('Resume information imported successfully.', 'success');
  };
  const cancelImport = () => { setReviewImport(null); };
  const previewResume = preview ? { ...createSampleResume(), template: preview.id } : null;
  const PreviewTemplate = preview?.component;
  return <main className="folio-page templates-page"><section className="page-heading"><p className="eyebrow">Folio template studio</p><h1>Find a format that<br /><i>fits your story.</i></h1><p>Explore original layouts rendered with real resume content. Pick the structure that helps your experience read clearly.</p></section><section className="template-recommender"><div><p className="eyebrow">A quicker starting point</p><h2>What type of resume are you creating?</h2></div><select aria-label="Resume type" value={career} onChange={event => setCareer(event.target.value)}><option value="">Choose a career path</option>{Object.keys(careerPaths).map(path => <option key={path} value={path}>{path}</option>)}</select>{career && <p className="recommendation-note">A few strong matches are highlighted below.</p>}</section><section className="resume-import-card" aria-labelledby="resume-import-title"><div><p className="eyebrow">Optional shortcut</p><h2 id="resume-import-title">Have an old resume?</h2><p>Upload your existing resume and reuse its information in your new design.</p>{importedSections && <p className="resume-import-card__success">Information ready for your selected template.</p>}{importError && <p className="resume-import-card__error" role="alert">{importError}</p>}</div><label className={`folio-button folio-button--primary resume-import-card__upload ${isReading ? 'is-reading' : ''}`}><input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} disabled={isReading} />{isReading ? 'Reading your resume...' : 'Upload PDF / DOCX'}</label></section><div className="template-toolbar"><div className="template-filters">{filters.map(item => <button type="button" key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="template-search"><span>Search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search templates..." /></label></div><p className="template-count">Showing {filtered.length} of {TEMPLATE_CONFIGS.length} templates</p><section className="templates-grid templates-grid--real">{filtered.map(template => <TemplateCard key={template.id} template={template} recommended={recommended.includes(template.id)} onPreview={setPreview} onUse={handleUseTemplate} />)}</section><Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview ? `${preview.name} preview` : ''} size="xl">{preview && <div className="template-modal"><div className="template-modal__paper"><PreviewTemplate resume={previewResume} templateId={preview.id} /></div><p>{preview.description}</p><button type="button" className="folio-button folio-button--primary" onClick={() => handleUseTemplate(preview)}>Use This Template</button></div>}</Modal><Modal open={Boolean(reviewImport)} onClose={cancelImport} title="Information found"><div className="resume-import-review"><p>We found the following information in your resume:</p><ul>{importedCategories(reviewImport).map(category => <li key={category}>&#10003; {category}</li>)}</ul><div className="resume-import-review__actions"><button type="button" className="folio-button folio-button--quiet" onClick={cancelImport}>Cancel</button><button type="button" className="folio-button folio-button--primary" onClick={confirmImport}>Use This Information</button></div></div></Modal></main>;
}
