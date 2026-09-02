import { formatDate } from '../utils/helpers';

const labels = { summary: 'Professional Summary', experience: 'Experience', education: 'Education', projects: 'Projects', skills: 'Skills', certifications: 'Certifications', achievements: 'Achievements', languages: 'Languages', interests: 'Interests', custom: 'Additional Information' };
const all = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'custom'];
const has = value => Array.isArray(value) ? value.length > 0 : Boolean(value);
const linkHref = value => /^(https?:\/\/|mailto:|tel:)/i.test(value) ? value : `https://${value}`;
const Link = ({ value }) => <a href={linkHref(value)} target="_blank" rel="noreferrer">{value}</a>;

function Contact({ personal, compact = false }) {
  const values = [personal.email, personal.phone, personal.location, personal.website, personal.linkedin, personal.github, personal.portfolio].filter(Boolean);
  return values.length ? <p className={`resume-contact ${compact ? 'resume-contact--compact' : ''}`}>{values.map((value, index) => <span key={`${value}-${index}`}>{index > 0 && ' | '}{/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? <a href={`mailto:${value}`}>{value}</a> : /^(https?:\/\/|www\.|(?:[\w-]+\.)+[a-z]{2,})/i.test(value) ? <Link value={value} /> : value}</span>)}</p> : null;
}
function Header({ resume, style = '' }) { const p = resume.sections?.personal || {}; return <header className={`resume-header ${style}`}><div><h1>{p.fullName || 'Your Name'}</h1><p className="resume-title">{p.title || 'Professional Title'}</p></div><Contact personal={p} /></header>; }
function DateRange({ item }) { const text = [formatDate(item.startDate), item.current ? 'Present' : formatDate(item.endDate)].filter(Boolean).join(' - '); return text ? <span className="resume-date">{text}</span> : null; }
function Entry({ type, item, timeline = false }) {
  const title = type === 'experience' ? item.position : type === 'education' ? [item.degree, item.field && `in ${item.field}`].filter(Boolean).join(' ') : item.name || item.title || 'Untitled';
  const meta = type === 'experience' ? [item.company, item.location].filter(Boolean).join(' | ') : type === 'education' ? [item.school, item.location, item.gpa && `GPA ${item.gpa}`].filter(Boolean).join(' | ') : item.issuer || '';
  const links = [...new Set([item.url, item.github, ...(item.links || [])].filter(Boolean))];
  return <article className={`resume-entry ${timeline ? 'resume-entry--timeline' : ''}`}><div className="resume-entry__head"><div><h3>{title}</h3>{meta && <p>{meta}</p>}</div>{['experience', 'education', 'projects'].includes(type) && <DateRange item={item} />}</div>{item.description && <p className="resume-copy">{item.description}</p>}{item.bullets?.filter(Boolean).length > 0 && <ul>{item.bullets.filter(Boolean).map((bullet, index) => <li key={`${item.id || title}-${index}`}>{bullet}</li>)}</ul>}{item.tech?.length > 0 && <p className="resume-tags">{item.tech.join(' • ')}</p>}{links.length > 0 && <p className="resume-link">{links.map((link, index) => <span key={link}>{index > 0 && ' | '}<Link value={link} /></span>)}</p>}</article>;
}
function Section({ resume, name, className = '', timeline = false }) {
  const value = resume.sections?.[name];
  if (resume.sectionVisibility?.[name] === false || !has(value)) return null;
  let body;
  if (name === 'summary') body = <p className="resume-copy">{value}</p>;
  else if (['experience', 'education', 'projects', 'certifications', 'achievements', 'custom'].includes(name)) body = value.map(item => <Entry key={item.id} type={name} item={item} timeline={timeline && name === 'experience'} />);
  else if (name === 'skills') body = <div className="resume-skills">{value.map(group => <p key={group.id}><strong>{group.category}:</strong> {group.skills?.join(', ')}</p>)}</div>;
  else if (name === 'languages') body = <p className="resume-copy">{value.map(item => `${item.language}${item.proficiency ? ` (${item.proficiency})` : ''}`).join(' | ')}</p>;
  else body = <p className="resume-copy">{value.join(' | ')}</p>;
  return <section className={`resume-section ${className}`}><h2>{labels[name]}</h2>{body}</section>;
}
const Sections = ({ resume, names, className = '', timeline = false }) => <div className={className}>{names.map(name => <Section key={name} resume={resume} name={name} timeline={timeline} />)}</div>;
const Remaining = ({ resume, used }) => <Sections resume={resume} names={all.filter(name => !used.includes(name))} />;

export default function ResumeTemplateRenderer({ resume, templateId, variant = 'modern' }) {
  const style = { '--resume-accent': resume.colors?.primary || '#245b55', '--resume-text': resume.colors?.text || '#17211f', '--resume-soft': resume.colors?.secondary || '#e8efec', '--resume-font': resume.font || 'DM Sans', '--resume-size': `${(resume.fontSize || 10) * (resume.fontScale || 1)}px`, '--resume-leading': resume.spacing || 1.35, '--resume-margin': `${Math.max(10, Math.min(resume.margins || 18, 28))}mm` };
  const p = resume.sections?.personal || {};
  const render = {
    modern: <><Header resume={resume} /><Sections resume={resume} names={all} /></>,
    twoColumn: <><aside className="resume-column resume-column--soft"><div className="resume-column__identity"><h1>{p.fullName || 'Your Name'}</h1><p>{p.title || 'Professional Title'}</p></div><Contact personal={p} compact /><Sections resume={resume} names={['skills', 'languages', 'certifications', 'interests']} /></aside><main className="resume-column"><Sections resume={resume} names={['summary', 'experience', 'education', 'projects', 'achievements', 'custom']} /></main></>,
    sidebar: <><aside className="resume-sidebar--bold"><h1>{p.fullName || 'Your Name'}</h1><p>{p.title || 'Professional Title'}</p><Contact personal={p} compact /><Sections resume={resume} names={['skills', 'languages', 'interests', 'certifications']} /></aside><main className="resume-column"><Sections resume={resume} names={['summary', 'experience', 'projects', 'education', 'achievements', 'custom']} /></main></>,
    executive: <><Header resume={resume} style="resume-header--executive" /><Sections resume={resume} names={['summary', 'experience', 'achievements', 'education', 'projects']} /><Remaining resume={resume} used={['summary', 'experience', 'achievements', 'education', 'projects']} /></>,
    student: <><Header resume={resume} style="resume-header--center" /><Sections resume={resume} names={['education', 'projects', 'experience', 'skills', 'certifications', 'achievements']} /><Remaining resume={resume} used={['education', 'projects', 'experience', 'skills', 'certifications', 'achievements']} /></>,
    creative: <><div className="creative-mast"><p className="creative-kicker">Portfolio / Profile</p><h1>{p.fullName || 'Your Name'}</h1><p>{p.title || 'Creative Professional'}</p><Contact personal={p} compact /></div><Sections resume={resume} names={['summary', 'projects', 'experience', 'skills', 'education', 'achievements']} className="creative-grid" /><Remaining resume={resume} used={['summary', 'projects', 'experience', 'skills', 'education', 'achievements']} /></>,
    ats: <><div className="ats-heading"><h1>{p.fullName || 'Your Name'}</h1><Contact personal={p} compact /></div><Sections resume={resume} names={all} /></>,
    tech: <><div className="tech-heading"><div><h1>{p.fullName || 'Your Name'}</h1><p>{p.title || 'Software Engineer'}</p></div><Contact personal={p} compact /></div><Section resume={resume} name="skills" className="tech-skills" /><Sections resume={resume} names={['experience', 'projects', 'education']} /><Remaining resume={resume} used={['skills', 'experience', 'projects', 'education']} /></>,
    timeline: <><Header resume={resume} /><Sections resume={resume} names={['summary']} /><Section resume={resume} name="experience" timeline className="timeline-section" /><Sections resume={resume} names={['projects', 'education', 'skills', 'certifications']} /><Remaining resume={resume} used={['summary', 'experience', 'projects', 'education', 'skills', 'certifications']} /></>,
    minimal: <><Header resume={resume} style="resume-header--minimal" /><Sections resume={resume} names={['summary', 'experience', 'education', 'projects', 'skills']} /><Remaining resume={resume} used={['summary', 'experience', 'education', 'projects', 'skills']} /></>,
    compact: <><Header resume={resume} style="resume-header--compact" /><div className="compact-grid"><Sections resume={resume} names={['summary', 'experience', 'projects']} /><Sections resume={resume} names={['education', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'custom']} /></div></>,
    academic: <><div className="academic-heading"><h1>{p.fullName || 'Your Name'}</h1><Contact personal={p} compact /><p>{p.title || 'Researcher'}</p></div><Sections resume={resume} names={['education', 'experience', 'projects', 'achievements', 'certifications', 'skills']} /><Remaining resume={resume} used={['education', 'experience', 'projects', 'achievements', 'certifications', 'skills']} /></>,
  }[variant] || null;
  return <article className={`resume-page resume-print-page resume-template--${variant}`} style={style} data-template={templateId || variant}>{render}</article>;
}
