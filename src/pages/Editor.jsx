import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SECTION_LABELS, FONT_OPTIONS, COLOR_PRESETS } from '../data/types';
import { computeCompletion } from '../utils/helpers';
import { TEMPLATE_CONFIGS } from '../templates';
import ResumePreview from '../components/preview/ResumePreview';
import PersonalInfoEditor from '../components/editor/PersonalInfoEditor';
import ExperienceEditor from '../components/editor/ExperienceEditor';
import EducationEditor from '../components/editor/EducationEditor';
import SkillsEditor from '../components/editor/SkillsEditor';
import ProjectsEditor from '../components/editor/ProjectsEditor';
import { CertificationsEditor, AchievementsEditor, LanguagesEditor, InterestsEditor, CustomSectionEditor } from '../components/editor/OtherEditors';
import { Textarea } from '../components/ui/Input';
import AIAssistant from '../components/ai/AIAssistant';
import ProgressBar from '../components/ui/ProgressBar';

const SECTION_ICONS = {
  personal: '👤', summary: '📝', experience: '💼', education: '🎓',
  projects: '🚀', skills: '⚡', certifications: '🏆', achievements: '⭐',
  languages: '🌐', interests: '❤️', custom: '📌',
};

export default function Editor({ getResume, updateResume, undo, redo, canUndo, canRedo, darkMode, onToggleDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');
  const [sidebarTab, setSidebarTab] = useState('sections');
  const [saved, setSaved] = useState(true);
  const [mobileMode, setMobileMode] = useState('edit');

  const resume = id ? getResume(id) : undefined;

  useEffect(() => {
    if (!resume) navigate('/dashboard');
  }, [resume, navigate]);

  const update = useCallback((updater) => {
    if (!id) return;
    updateResume(id, updater);
    setSaved(false);
    setTimeout(() => setSaved(true), 800);
  }, [id, updateResume]);

  if (!resume || !id) return null;

  const completion = computeCompletion(resume);

  const updateSection = (key, value) =>
    update(r => ({ ...r, sections: { ...r.sections, [key]: value } }));

  const handleReorder = (from, to) => {
    const order = [...resume.sectionOrder];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    update(r => ({ ...r, sectionOrder: order }));
  };

  const moveSection = (idx, dir) => {
    handleReorder(idx, idx + dir);
  };

  const toggleVisibility = (key) =>
    update(r => ({ ...r, sectionVisibility: { ...r.sectionVisibility, [key]: !r.sectionVisibility[key] } }));

  const renderSectionEditor = () => {
    switch (activeSection) {
      case 'personal': return <PersonalInfoEditor data={resume.sections.personal} onChange={v => updateSection('personal', v)} />;
      case 'summary': return (
        <div className="space-y-3">
          <Textarea label="Professional Summary" rows={6} value={resume.sections.summary} onChange={e => updateSection('summary', e.target.value)} placeholder="Write a compelling 2-4 sentence summary highlighting your experience, key skills, and career goals..." />
          <p className="text-xs text-[var(--muted-foreground)]">{resume.sections.summary.length} characters · Aim for 300–600</p>
        </div>
      );
      case 'experience': return <ExperienceEditor data={resume.sections.experience} onChange={v => updateSection('experience', v)} />;
      case 'education': return <EducationEditor data={resume.sections.education} onChange={v => updateSection('education', v)} />;
      case 'projects': return <ProjectsEditor data={resume.sections.projects} onChange={v => updateSection('projects', v)} />;
      case 'skills': return <SkillsEditor data={resume.sections.skills} onChange={v => updateSection('skills', v)} />;
      case 'certifications': return <CertificationsEditor data={resume.sections.certifications} onChange={v => updateSection('certifications', v)} />;
      case 'achievements': return <AchievementsEditor data={resume.sections.achievements} onChange={v => updateSection('achievements', v)} />;
      case 'languages': return <LanguagesEditor data={resume.sections.languages} onChange={v => updateSection('languages', v)} />;
      case 'interests': return <InterestsEditor data={resume.sections.interests} onChange={v => updateSection('interests', v)} />;
      case 'custom': return <CustomSectionEditor data={resume.sections.custom} onChange={v => updateSection('custom', v)} />;
      default: return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--border)] bg-[var(--card)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            ← <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-[var(--border)]">/</span>
          <span className="text-sm font-medium text-[var(--foreground)] max-w-32 truncate">{resume.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => undo(id)} disabled={!canUndo(id)} className="w-8 h-8 flex items-center justify-center text-sm disabled:opacity-30 hover:bg-[var(--muted)] rounded-lg transition-colors" title="Undo">↩</button>
          <button onClick={() => redo(id)} disabled={!canRedo(id)} className="w-8 h-8 flex items-center justify-center text-sm disabled:opacity-30 hover:bg-[var(--muted)] rounded-lg transition-colors" title="Redo">↪</button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs">
            {saved
              ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400 font-medium">Saved</span></>
              : <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><span className="text-amber-600 dark:text-amber-400 font-medium">Saving...</span></>
            }
          </div>

          <button onClick={() => navigate('/ats')} className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] transition-colors">📊 Resume & Job Match</button>
          <button onClick={onToggleDark} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="editor-mobile-toggle sm:hidden" role="tablist" aria-label="Editor view">
            <button className={mobileMode === 'edit' ? 'active' : ''} onClick={() => setMobileMode('edit')} role="tab" aria-selected={mobileMode === 'edit'}>Edit</button>
            <button className={mobileMode === 'preview' ? 'active' : ''} onClick={() => setMobileMode('preview')} role="tab" aria-selected={mobileMode === 'preview'}>Preview</button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden">
          <div className="flex border-b border-[var(--border)] flex-shrink-0">
            {(['sections', 'design', 'ai']).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${sidebarTab === tab ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
              >{tab}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'sections' && (
              <div className="p-2">
                <div className="px-2 py-3 mb-2">
                  <ProgressBar value={completion} label="Resume Completion" color="var(--accent)" />
                </div>

                <SectionNavItem
                  icon={SECTION_ICONS['personal']}
                  label="Personal Information"
                  active={activeSection === 'personal'}
                  visible={true}
                  onClick={() => setActiveSection('personal')}
                  canToggle={false}
                />

                {resume.sectionOrder.map((key, i) => (
                  <SectionNavItem
                    key={key}
                    icon={SECTION_ICONS[key] || '📄'}
                    label={SECTION_LABELS[key] || key}
                    active={activeSection === key}
                    visible={resume.sectionVisibility[key] ?? true}
                    onClick={() => setActiveSection(key)}
                    onToggle={() => toggleVisibility(key)}
                    canMoveUp={i > 0}
                    canMoveDown={i < resume.sectionOrder.length - 1}
                    onMoveUp={() => moveSection(i, -1)}
                    onMoveDown={() => moveSection(i, 1)}
                  />
                ))}
              </div>
            )}

            {sidebarTab === 'design' && (
              <div className="p-3 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-2.5">Template</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {TEMPLATE_CONFIGS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => update(r => ({ ...r, template: t.id }))}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${resume.template === t.id ? 'ring-2 ring-[var(--primary)] bg-[var(--secondary)]' : 'hover:bg-[var(--muted)]'}`}
                      >
                        <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: t.accentColor }} />
                        <div>
                          <p className="text-xs font-medium">{t.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-2.5">Color Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((c, i) => (
                      <button key={i} onClick={() => update(r => ({ ...r, colors: c }))} className={`h-8 rounded-lg transition-all ${JSON.stringify(resume.colors) === JSON.stringify(c) ? 'ring-2 ring-[var(--ring)] scale-110' : 'hover:scale-105'}`} style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">Primary</p>
                      <input type="color" value={resume.colors.primary} onChange={e => update(r => ({ ...r, colors: { ...r.colors, primary: e.target.value } }))} className="w-full h-8 rounded cursor-pointer border border-[var(--border)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">Accent</p>
                      <input type="color" value={resume.colors.accent} onChange={e => update(r => ({ ...r, colors: { ...r.colors, accent: e.target.value } }))} className="w-full h-8 rounded cursor-pointer border border-[var(--border)]" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-2">Font</p>
                  <select value={resume.font} onChange={e => update(r => ({ ...r, font: e.target.value }))} className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1"><p className="text-xs font-semibold">Font Size</p><span className="text-xs text-[var(--muted-foreground)]">{Math.round((resume.fontScale || 1) * 100)}%</span></div>
                    <input type="range" min={0.85} max={1.2} step={0.05} value={resume.fontScale || 1} onChange={e => update(r => ({ ...r, fontScale: +e.target.value }))} className="w-full accent-[var(--primary)]" />
                    <div className="flex justify-between text-[10px] text-[var(--muted-foreground)]"><span>Compact</span><span>Roomy</span></div>
                    <div className="flex justify-between mb-1 mt-3"><p className="text-xs font-semibold">Base Size</p><span className="text-xs text-[var(--muted-foreground)]">{resume.fontSize}px</span></div>
                    <input type="range" min={8} max={13} step={0.5} value={resume.fontSize} onChange={e => update(r => ({ ...r, fontSize: +e.target.value }))} className="w-full accent-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><p className="text-xs font-semibold">Line Spacing</p><span className="text-xs text-[var(--muted-foreground)]">{resume.spacing}×</span></div>
                    <input type="range" min={1} max={2} step={0.1} value={resume.spacing} onChange={e => update(r => ({ ...r, spacing: +e.target.value }))} className="w-full accent-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><p className="text-xs font-semibold">Margins</p><span className="text-xs text-[var(--muted-foreground)]">{resume.margins}mm</span></div>
                    <input type="range" min={10} max={35} step={1} value={resume.margins} onChange={e => update(r => ({ ...r, margins: +e.target.value }))} className="w-full accent-[var(--primary)]" />
                  </div>
                </div>
              </div>
            )}

            {sidebarTab === 'ai' && (
              <div className="p-3">
                <AIAssistant
                  context={resume}
                  onInsert={(text) => {
                    if (activeSection === 'summary') updateSection('summary', text);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Center: section editor */}
        <div className={`editor-form-pane flex-1 overflow-y-auto ${mobileMode === 'preview' ? 'hidden md:block md:max-w-md' : 'block'} border-r border-[var(--border)]`}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">{SECTION_ICONS[activeSection] || '📄'}</span>
              <h2 className="text-base font-bold text-[var(--foreground)]">{activeSection === 'personal' ? 'Personal Information' : SECTION_LABELS[activeSection] || activeSection}</h2>
            </div>
            {renderSectionEditor()}
          </div>
        </div>

        {/* Right: preview */}
        <div className={`editor-preview-pane flex-1 ${mobileMode === 'preview' ? 'block' : 'hidden md:block'} min-w-0`}>
          <ResumePreview resume={resume} />
        </div>
      </div>
    </div>
  );
}

function SectionNavItem({ icon, label, active, visible, onClick, onToggle, canToggle = true, canMoveUp, canMoveDown, onMoveUp, onMoveDown }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 cursor-pointer transition-colors group ${active ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`}>
      <button onClick={onClick} className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`text-base flex-shrink-0 ${!visible && canToggle ? 'opacity-30' : ''}`}>{icon}</span>
        <span className={`text-xs font-medium truncate ${!visible && canToggle ? 'opacity-40 line-through' : ''}`}>{label}</span>
      </button>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {canMoveUp && <button onClick={e => { e.stopPropagation(); onMoveUp?.(); }} className="w-5 h-5 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded">↑</button>}
        {canMoveDown && <button onClick={e => { e.stopPropagation(); onMoveDown?.(); }} className="w-5 h-5 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded">↓</button>}
        {canToggle && onToggle && (
          <button onClick={e => { e.stopPropagation(); onToggle(); }} className={`w-5 h-5 flex items-center justify-center text-xs rounded ${visible ? 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`} title={visible ? 'Hide section' : 'Show section'}>
            {visible ? '👁' : '🙈'}
          </button>
        )}
      </div>
    </div>
  );
}
