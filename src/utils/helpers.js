export const generateId = () => Math.random().toString(36).slice(2, 11);

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  if (!month) return year;
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

export const clsx = (...classes) =>
  classes.filter(Boolean).join(' ');

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const computeCompletion = (resume) => {
  let score = 0;
  const p = resume.sections.personal;
  if (p.fullName) score += 10;
  if (p.email) score += 5;
  if (p.phone) score += 5;
  if (p.location) score += 5;
  if (p.linkedin || p.website) score += 5;
  if (resume.sections.summary.length > 50) score += 15;
  if (resume.sections.experience.length > 0) score += 20;
  if (resume.sections.education.length > 0) score += 10;
  if (resume.sections.skills.length > 0) score += 10;
  if (resume.sections.projects.length > 0) score += 10;
  if (resume.sections.certifications.length > 0) score += 5;
  return Math.min(100, score);
};

export const downloadPDF = (elementId) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  // The printable renderer already exists in the current document. Printing
  // it directly retains the exact CSS, pagination rules and user-selected font.
  window.print();
};
