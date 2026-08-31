import ModernTemplate from './ModernTemplate';
import TwoColumnTemplate from './TwoColumnTemplate';
import SidebarTemplate from './SidebarTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import StudentTemplate from './StudentTemplate';
import CreativeTemplate from './CreativeTemplate';
import ATSTemplate from './ATSTemplate';
import TechTemplate from './TechTemplate';
import TimelineTemplate from './TimelineTemplate';
import MinimalTemplate from './MinimalTemplate';
import CompactTemplate from './CompactTemplate';
import AcademicTemplate from './AcademicTemplate';

export const TEMPLATE_CONFIGS = [
  ['modern', 'Modern', 'Professional', 'Clean hierarchy with subtle rules and confident typography.', true, ModernTemplate],
  ['twoColumn', 'Professional Two Column', 'Professional', 'A calm 35/65 split for skills and detailed experience.', true, TwoColumnTemplate],
  ['sidebar', 'Sidebar', 'Creative', 'A bold color rail that makes your identity memorable.', false, SidebarTemplate],
  ['executive', 'Executive', 'Executive', 'Restrained, spacious presentation for leadership candidates.', true, ExecutiveTemplate],
  ['student', 'Student', 'Student', 'Education and projects lead the story for early careers.', true, StudentTemplate],
  ['creative', 'Creative', 'Creative', 'Asymmetric blocks and project-led rhythm for creative work.', false, CreativeTemplate],
  ['ats', 'ATS Classic', 'ATS Friendly', 'Plain, scannable formatting built for parsing systems.', true, ATSTemplate],
  ['tech', 'Tech Developer', 'Tech', 'A technical header and tag-forward skills system.', true, TechTemplate],
  ['timeline', 'Timeline', 'Professional', 'Experience unfolds along a clear vertical career path.', true, TimelineTemplate],
  ['minimal', 'Minimal', 'Minimal', 'Generous whitespace where typography does the work.', true, MinimalTemplate],
  ['compact', 'Compact', 'Professional', 'Dense two-track information design for deep experience.', true, CompactTemplate],
  ['academic', 'Academic', 'Academic', 'Structured academic metadata for research-focused applications.', true, AcademicTemplate],
].map(([id, name, category, description, atsFriendly, component]) => ({ id, name, category, description, atsFriendly, component, accentColor: '#245b55' }));

export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATE_CONFIGS.map(template => [template.id, template]));
export const getTemplate = id => TEMPLATE_BY_ID[id] || TEMPLATE_BY_ID.modern;
export const normalizeTemplateId = id => TEMPLATE_BY_ID[id] ? id : 'modern';
export const TEMPLATES = Object.fromEntries(TEMPLATE_CONFIGS.map(template => [template.id, template.component]));
export { default as ResumeTemplateRenderer } from './ResumeTemplateRenderer';
