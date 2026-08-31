import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth/mammoth.browser';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { generateId } from './helpers';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extractResumeText(file) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const document = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = await Promise.all(Array.from({ length: document.numPages }, async (_, index) => {
      const page = await document.getPage(index + 1);
      const content = await page.getTextContent();
      return content.items.map(item => item.str).join(' ');
    }));
    return pages.join('\n');
  }

  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

const SECTION_HEADINGS = {
  summary: /^(summary|professional summary|profile|objective|about me)$/i,
  experience: /^(experience|work experience|professional experience|employment|employment history|work history)$/i,
  education: /^(education|academic background|qualifications)$/i,
  skills: /^(skills|technical skills|core competencies|competencies|expertise)$/i,
  projects: /^(projects|selected projects|personal projects)$/i,
  certifications: /^(certifications|certificates|licenses|licenses and certifications)$/i,
  achievements: /^(achievements|awards|honors|accomplishments)$/i,
  languages: /^(languages|language skills)$/i,
  interests: /^(interests|hobbies|activities)$/i,
};
const HEADING_TEXT = Object.values(SECTION_HEADINGS).map(expression => expression.source.replace(/^\^|\$$/g, '')).join('|');
const CUSTOM_HEADING = /^(volunteer(?:ing| experience)?|publications|presentations|references|professional affiliations|community involvement|additional information|activities|training|courses|coursework)$/i;

const emptySections = () => ({
  personal: { fullName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '' },
  summary: '', experience: [], education: [], projects: [], skills: [], certifications: [], achievements: [], languages: [], interests: [], custom: [],
});

const cleanLine = line => line.replace(/^[\s•▪◦●\-–—]+/, '').replace(/\s+/g, ' ').trim();
const itemLines = lines => lines.map(cleanLine).filter(Boolean);
const hasContent = sections => Object.values(sections).some(value => Array.isArray(value) ? value.length : typeof value === 'object' ? Object.values(value).some(Boolean) : Boolean(value));
const createCustomSection = (title, lines) => ({ id: generateId(), title, items: itemLines(lines).map(value => ({ id: generateId(), title: value, subtitle: '', date: '', description: '' })) });

function headingFor(line) {
  const candidate = cleanLine(line).replace(/:$/, '');
  return Object.entries(SECTION_HEADINGS).find(([, expression]) => expression.test(candidate))?.[0];
}

function setPersonalInfo(lines, personal) {
  const contactLines = lines.slice(0, Math.min(lines.length, 14));
  const joined = contactLines.join(' | ');
  personal.email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  personal.phone = joined.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || '';
  personal.linkedin = joined.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+/i)?.[0] || '';
  personal.github = joined.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|]+/i)?.[0] || '';
  personal.website = joined.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s|]*)?/i)?.[0] || '';
  if (personal.website && [personal.linkedin, personal.github].includes(personal.website)) personal.website = '';

  const identityLines = contactLines.filter(line => !/@|\d{3,}|https?:\/\/|www\.|linkedin\.com|github\.com/i.test(line));
  personal.fullName = identityLines.find(line => /^[A-Za-zÀ-ÿ.' -]{3,60}$/.test(line) && line.split(' ').length >= 2) || '';
  if (!personal.fullName) {
    const firstLine = contactLines[0] || '';
    personal.fullName = firstLine.match(/^([A-ZÀ-Ý][A-Za-zÀ-ÿ.'-]+(?:\s+[A-ZÀ-Ý][A-Za-zÀ-ÿ.'-]+){1,3})/)?.[1] || '';
  }
  const nameIndex = contactLines.indexOf(personal.fullName);
  personal.title = nameIndex >= 0 ? identityLines.find(line => line !== personal.fullName && line.length < 80) || '' : '';
  personal.location = contactLines.find(line => /(?:,\s*[A-Z]{2}\b|\b(?:india|usa|united states|canada|uk|united kingdom|australia)\b)/i.test(line) && line !== personal.fullName) || '';
}

function normalizeSection(key, lines, sections) {
  const entries = itemLines(lines);
  if (!entries.length) return;
  if (key === 'summary') { sections.summary = entries.join(' '); return; }
  if (key === 'skills') { sections.skills = [{ id: generateId(), category: 'Skills', skills: entries.join(',').split(/[,;|]/).map(cleanLine).filter(Boolean) }]; return; }
  if (key === 'languages') { sections.languages = entries.join(',').split(/[,;|]/).map(cleanLine).filter(Boolean).map(value => { const [language, proficiency] = value.split(/\s*[-–:]\s*/, 2); return { id: generateId(), language, proficiency: proficiency || 'Intermediate' }; }); return; }
  if (key === 'interests') { sections.interests = entries.join(',').split(/[,;|]/).map(cleanLine).filter(Boolean); return; }
  if (key === 'certifications') { sections.certifications = entries.map(value => ({ id: generateId(), name: value, issuer: '', date: '', url: '', credentialId: '' })); return; }
  if (key === 'achievements') { sections.achievements = entries.map(value => ({ id: generateId(), title: value, description: '', date: '' })); return; }
  if (key === 'projects') { sections.projects = entries.map(value => ({ id: generateId(), name: value, role: '', url: '', startDate: '', endDate: '', description: '', bullets: [] })); return; }
  if (key === 'education') { sections.education = [{ id: generateId(), school: entries[0] || '', degree: entries.slice(1).join(' '), field: '', location: '', startDate: '', endDate: '', current: false, gpa: '', description: '' }]; return; }
  if (key === 'experience') { sections.experience = [{ id: generateId(), company: '', position: entries[0] || '', location: '', startDate: '', endDate: '', current: false, description: '', bullets: entries.slice(1) }]; }
}

/**
 * Extracts plain-text resume content into the app's existing sections schema.
 * This deliberately keeps only content: no source document styles or layout are read.
 */
export async function extractResumeData(file) {
  if (!file || !(/\.pdf$/i.test(file.name) || /\.docx$/i.test(file.name) || file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
    throw new Error('Unsupported resume file');
  }
  const text = (await extractResumeText(file)).split('\0').join('').trim();
  if (text.length < 3) throw new Error('No readable resume text');

  // PDF text items often arrive as one visual line. Separating known headings here
  // retains their content without trying to reproduce the source document layout.
  const textWithHeadings = text.replace(new RegExp(`\\s+(${HEADING_TEXT})\\s*:?(?=\\s|$)`, 'gi'), '\n$1\n');
  const lines = textWithHeadings.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const sections = emptySections();
  setPersonalInfo(lines, sections.personal);
  let current = null;
  let buffer = [];
  let customTitle = '';
  let customBuffer = [];
  const flush = () => { if (current) normalizeSection(current, buffer, sections); buffer = []; };
  const flushCustom = () => {
    if (customTitle && customBuffer.length) sections.custom.push(createCustomSection(customTitle, customBuffer));
    customTitle = '';
    customBuffer = [];
  };

  lines.forEach(line => {
    const heading = headingFor(line);
    if (heading) { flush(); flushCustom(); current = heading; return; }
    const candidate = cleanLine(line).replace(/:$/, '');
    if (CUSTOM_HEADING.test(candidate) || /^[A-Z][A-Z &/]{3,}$/.test(candidate)) {
      flush();
      flushCustom();
      current = null;
      customTitle = candidate;
      return;
    }
    if (customTitle) customBuffer.push(line);
    else if (current) buffer.push(line);
  });
  flush();
  flushCustom();

  if (!sections.summary) {
    const firstHeading = lines.findIndex(headingFor);
    const intro = lines.slice(0, firstHeading >= 0 ? firstHeading : Math.min(lines.length, 8)).filter(line => line !== sections.personal.fullName && line !== sections.personal.title && !line.includes(sections.personal.email) && !line.includes(sections.personal.phone));
    if (intro.length) sections.summary = intro.join(' ');
  }
  if (!lines.some(headingFor) && !sections.custom.length) {
    sections.custom.push(createCustomSection('Imported content', lines));
  }
  if (!hasContent(sections)) throw new Error('No usable resume information');
  return sections;
}
