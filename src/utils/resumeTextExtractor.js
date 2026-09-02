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
      // A PDF stores positioned text fragments. Rebuild visual lines before
      // parsing; flattening a page turns unrelated content into one sentence.
      const fragments = content.items.filter(item => item.str?.trim()).map(item => ({
        text: item.str.trim(), x: item.transform[4], y: item.transform[5],
        width: item.width || 0, height: Math.abs(item.transform[3]) || 10,
      }));
      const rows = [];
      fragments.sort((a, b) => b.y - a.y || a.x - b.x).forEach(fragment => {
        const row = rows.find(candidate => Math.abs(candidate.y - fragment.y) <= Math.max(2, fragment.height * 0.45));
        if (row) row.items.push(fragment);
        else rows.push({ y: fragment.y, items: [fragment] });
      });
      return rows.map(row => {
        const items = row.items.sort((a, b) => a.x - b.x);
        return items.reduce((line, item, itemIndex) => {
          if (!itemIndex) return item.text;
          const previous = items[itemIndex - 1];
          const gap = item.x - (previous.x + previous.width);
          // A large horizontal gap is a separate text column. Preserve it as
          // another logical line so contact details cannot contaminate a name.
          return `${line}${gap > Math.max(12, previous.height * 1.2) ? '\n' : ' '}${item.text}`;
        }, '');
      }).join('\n');
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
const ROLE_KEYWORDS = /engineer|developer|designer|manager|analyst|architect|consultant|specialist|lead|director|intern|student|scientist|coordinator|assistant|advisor|writer|product|marketing|operations|associate/i;
const COUNTRY_HINTS = ['usa', 'united states', 'canada', 'uk', 'united kingdom', 'india', 'australia', 'germany', 'france', 'singapore', 'brazil', 'netherlands', 'spain', 'ireland', 'sweden', 'norway', 'denmark', 'finland', 'japan', 'korea', 'china', 'mexico', 'turkey', 'egypt'];
const HUMAN_NAME_PATTERN = /^[A-ZÀ-Ý][a-zà-ÿ'’.-]*(?:\s+[A-ZÀ-Ý][a-zà-ÿ'’.-]*){1,5}$/;
const DATE_PATTERN = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present|current)\b|\d{4}/i;

const isLikelyName = value => {
  if (!value || value.length < 2 || value.length > 80) return false;
  if (/[0-9@]/.test(value) || /https?:\/\//i.test(value) || /\b(?:www\.)/i.test(value) || DATE_PATTERN.test(value)) return false;
  if (COUNTRY_HINTS.some(country => new RegExp(`\\b${country}\\b`, 'i').test(value))) return false;
  if (ROLE_KEYWORDS.test(value)) return false;
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 6) return false;
  // Do not let ordinary lower-case prose pass the permissive legacy pattern.
  if (words.some(word => !/^[A-Z][A-Za-z'’.-]*$/.test(word))) return false;
  return words.every(word => HUMAN_NAME_PATTERN.test(word) || /^[A-ZÀ-Ý][a-zà-ÿ'’.-]*$/i.test(word)) && !/^(summary|profile|objective|experience|education|skills|projects|certifications|awards|languages|interests|contact)$/i.test(value);
};

const isLikelyLocation = value => {
  if (!value || value.length > 80 || /https?:\/\//i.test(value) || /@/.test(value) || /[.!?]/.test(value)) return false;
  const normalized = value.toLowerCase();
  const hasCountry = COUNTRY_HINTS.some(country => normalized.includes(country));
  const hasStateCode = /(?:,\s*[A-Z]{2,}|\b[A-Z]{2}\b)/.test(value);
  const isCityish = /(?:^|\s)[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}$/.test(value) && value.split(/\s+/).length <= 5;
  return hasCountry || (hasStateCode && isCityish) || (isCityish && /(?:city|state|province|county)/i.test(normalized));
};

const isLikelyDate = value => DATE_PATTERN.test(value) && /\d/.test(value) && value.split(/\s+/).length <= 4;
const isLikelyBullet = value => /^([•\-*]|\d+\.)\s*/.test(value) || /^(?:skills|tools|technologies):/i.test(value);

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
  // Personal details are only read from the header. Scanning every section is
  // what allows descriptions, skills and locations inside work history to fill
  // personal fields.
  const firstSection = lines.findIndex(line => headingFor(line));
  const textLines = lines.slice(0, firstSection >= 0 ? firstSection : Math.min(lines.length, 12))
    .map(cleanLine).filter(line => line && !headingFor(line));
  const joined = textLines.join(' | ');

  personal.email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  personal.phone = joined.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || '';
  personal.linkedin = joined.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+/i)?.[0] || '';
  personal.github = joined.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|]+/i)?.[0] || '';
  personal.website = joined.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?/i)?.[0] || '';
  if (personal.website && [personal.linkedin, personal.github].includes(personal.website)) personal.website = '';

  const nameCandidates = textLines.filter(line => isLikelyName(line));
  personal.fullName = nameCandidates[0] || '';

  const titleCandidates = textLines.filter(line => {
    if (!line || line === personal.fullName || line === personal.email || line === personal.phone || headingFor(line) || /https?:\/\//i.test(line)) return false;
    if (isLikelyLocation(line) || isLikelyDate(line) || isLikelyName(line)) return false;
    return line.length <= 80 && line.split(/\s+/).length <= 8 && !/[.!?]/.test(line) && !/\d/.test(line) && ROLE_KEYWORDS.test(line);
  });
  personal.title = titleCandidates[0] || '';

  personal.location = textLines.find(line => isLikelyLocation(line) && line !== personal.fullName && line !== personal.title) || '';
}

function splitIntoBlocks(lines) {
  const blocks = [];
  let current = [];
  let justSawDate = false;

  for (const line of lines) {
    const trimmed = cleanLine(line);
    if (!trimmed) continue;
    if (isLikelyDate(trimmed) && current.length > 0 && !justSawDate) {
      blocks.push(current);
      current = [];
    }
    current.push(trimmed);
    justSawDate = isLikelyDate(trimmed);
  }

  if (current.length) blocks.push(current);
  return blocks.filter(block => block.length);
}

function normalizeExperienceBlock(block) {
  const entries = itemLines(block);
  if (!entries.length) return null;

  let company = '';
  let position = '';
  let location = '';
  let dateRange = '';
  const bullets = [];
  let description = '';

  for (const line of entries) {
    if (!line) continue;
    if (isLikelyDate(line)) {
      dateRange = line;
      continue;
    }
    if (isLikelyBullet(line)) {
      bullets.push(cleanLine(line.replace(/^([•\-*]|\d+\.)\s*/, '')));
      continue;
    }
    if (!company && /\b(?:inc|llc|ltd|corp|company|group|foundation|university|college|systems|labs|technologies|partners|solutions)\b/i.test(line)) {
      company = line;
      continue;
    }
    if (!location && isLikelyLocation(line)) {
      location = line;
      continue;
    }
    if (!position && !/\b(?:inc|llc|ltd|corp|company|group|foundation|university|college)\b/i.test(line) && !isLikelyLocation(line) && line.split(/\s+/).length <= 10) {
      position = line;
      continue;
    }
    if (!description) description = line;
    else description = [description, line].filter(Boolean).join(' ');
  }

  if (!position) position = entries[0] || '';
  if (!company) company = entries.find(line => !isLikelyLocation(line) && !isLikelyDate(line) && line !== position) || '';

  return {
    id: generateId(),
    company: company || '',
    position: position || '',
    location: location || '',
    startDate: dateRange.includes('–') ? dateRange.split('–')[0].trim() : '',
    endDate: dateRange.includes('–') ? dateRange.split('–')[1].trim() : '',
    current: /present|current/i.test(dateRange),
    description: description || '',
    bullets: bullets.filter(Boolean),
  };
}

function normalizeEducationBlock(block) {
  const entries = itemLines(block);
  if (!entries.length) return null;

  const school = entries.find(line => /\b(?:university|college|school|institute|academy|campus)\b/i.test(line)) || entries[0] || '';
  const degree = entries.find(line => /\b(?:bachelor|master|phd|mba|diploma|certificate|associate|degree)\b/i.test(line)) || '';
  const field = entries.find(line => !/\b(?:university|college|school|institute|academy|campus|bachelor|master|phd|mba|diploma|certificate|associate|degree)\b/i.test(line) && !isLikelyLocation(line) && !isLikelyDate(line)) || '';
  const location = entries.find(line => isLikelyLocation(line)) || '';
  const dateRange = entries.find(line => isLikelyDate(line)) || '';

  return {
    id: generateId(),
    school: school || '',
    degree: degree || '',
    field: field || '',
    location: location || '',
    startDate: dateRange.includes('–') ? dateRange.split('–')[0].trim() : '',
    endDate: dateRange.includes('–') ? dateRange.split('–')[1].trim() : '',
    current: /present|current/i.test(dateRange),
    gpa: '',
    description: entries.filter(line => line !== school && line !== degree && line !== field && line !== location && line !== dateRange).join(' '),
  };
}

function normalizeProjectsBlock(block) {
  const entries = itemLines(block);
  if (!entries.length) return null;

  const name = entries[0] || '';
  const links = entries.flatMap(line => line.match(/(?:https?:\/\/|www\.)[^\s,|]+|(?:github|gitlab)\.com\/[^\s,|]+/gi) || []);
  const description = entries.slice(1).filter(line => !isLikelyDate(line)).join(' ');

  return {
    id: generateId(),
    name: name || '',
    role: '',
    url: links.find(link => !/github\.com|gitlab\.com/i.test(link)) || '',
    github: links.find(link => /github\.com|gitlab\.com/i.test(link)) || '',
    links,
    startDate: '',
    endDate: '',
    description: description || '',
    bullets: [],
  };
}

function splitProjectBlocks(lines) {
  const blocks = [];
  let current = [];
  lines.forEach(line => {
    const clean = cleanLine(line);
    const isHeader = current.length > 1 && !isLikelyBullet(clean) && !isLikelyDate(clean) && clean.split(/\s+/).length <= 10 && /^[A-Z0-9][\w .:&/+-]*$/.test(clean) && !/^(https?:|www\.)/i.test(clean);
    if (isHeader) { blocks.push(current); current = [clean]; }
    else current.push(clean);
  });
  if (current.length) blocks.push(current);
  return blocks;
}

function normalizeSkillsList(lines) {
  return itemLines(lines)
    .flatMap(line => line.split(/[,;|]/))
    .map(cleanLine)
    .filter(Boolean)
    .filter(value => value.length > 1 && !/^(summary|skills|tools|technologies|experience|education)$/i.test(value));
}

function normalizeSection(key, lines, sections) {
  const entries = itemLines(lines);
  if (!entries.length) return;

  if (key === 'summary') {
    sections.summary = entries.join(' ');
    return;
  }

  if (key === 'skills') {
    sections.skills = [{ id: generateId(), category: 'Skills', skills: normalizeSkillsList(entries) }];
    return;
  }

  if (key === 'languages') {
    sections.languages = normalizeSkillsList(entries).map(value => {
      const [language, proficiency = 'Intermediate'] = value.split(/\s*[-–:]+\s*/);
      return { id: generateId(), language: language || value, proficiency };
    });
    return;
  }

  if (key === 'interests') {
    sections.interests = normalizeSkillsList(entries);
    return;
  }

  if (key === 'certifications') {
    sections.certifications = entries.map(value => ({ id: generateId(), name: value, issuer: '', date: '', url: '', credentialId: '' }));
    return;
  }

  if (key === 'achievements') {
    sections.achievements = entries.map(value => ({ id: generateId(), title: value, description: '', date: '' }));
    return;
  }

  if (key === 'projects') {
    sections.projects = splitProjectBlocks(entries).map(normalizeProjectsBlock).filter(Boolean);
    return;
  }

  if (key === 'education') {
    sections.education = splitIntoBlocks(entries).map(normalizeEducationBlock).filter(Boolean);
    return;
  }

  if (key === 'experience') {
    sections.experience = splitIntoBlocks(entries).map(normalizeExperienceBlock).filter(Boolean);
  }
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

  // Split only labels that are visually separated (or end with a colon), never
  // words such as "experience" that happen to occur inside a sentence.
  const textWithHeadings = text.replace(new RegExp(`(?:^|\\n| {2,})\\s*(${HEADING_TEXT})\\s*:(?=\\s|$)`, 'gi'), '\n$1\n');
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
