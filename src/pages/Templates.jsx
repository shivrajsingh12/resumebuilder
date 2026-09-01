import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import { createSampleResume } from '../data/sampleResume';
import { TEMPLATE_CONFIGS } from '../templates';
import { extractResumeData } from '../utils/resumeTextExtractor';

const filters = ['All', 'ATS Friendly', 'Modern', 'Creative', 'Student', 'Professional', 'Executive', 'Tech', 'Academic'];
const careerPaths = {
  'Student / Fresher': ['student', 'modern', 'ats'],
  'Software / IT': ['tech', 'modern', 'ats'],
  'Business / Management': ['executive', 'twoColumn', 'modern'],
  'Creative / Design': ['creative', 'minimal', 'modern'],
  'Academic': ['academic'],
  'Experienced Professional': ['executive', 'compact', 'twoColumn'],
};

// Folio's editorial dark palette: near-black navy ground, warm cream text,
// a burnt-orange highlight, and a deep teal secondary accent.
const colors = {
  pageBg: '#14161C',
  panelBg: '#1B1E27',
  panelBgDeep: '#0F1015',
  cream: '#F4EFE3',
  creamMuted: '#B7B1A2',
  border: '#2C303C',
  orange: '#D98A3D',
  orangeDeep: '#B5702E',
  teal: '#2F6B5E',
  tealDeep: '#1F4D43',
  ink: '#14161C',
  inkMuted: '#5B5F6B',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F2E9',
};

const serif = "Georgia, 'Times New Roman', serif";

// Target width for the scaled-down resume thumbnail is computed live from
// the real preview box, not a hardcoded guess — see the ResizeObserver in
// TemplateCard. That's what keeps the thumbnail filling its box correctly
// no matter how wide the card actually renders on a given screen.
const THUMBNAIL_PADDING = 14;

function TemplateCard({ template, recommended, onPreview, onUse, index, layout = 'grid' }) {
  const sample = useMemo(() => ({ ...createSampleResume(), template: template.id }), [template.id]);
  const Template = template.component;
  const cardRef = useRef(null);
  const boxRef = useRef(null);
  const previewRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    const content = previewRef.current;
    if (!box || !content) return;
    const recompute = () => {
      const naturalWidth = content.scrollWidth;
      const availableWidth = box.clientWidth - THUMBNAIL_PADDING * 2;
      if (naturalWidth && availableWidth > 0) setScale(availableWidth / naturalWidth);
    };
    recompute();
    // Watch BOTH the box (resizes with the viewport/grid) and the content
    // (natural width can shift once fonts finish loading) so the scale
    // stays correct instead of being computed once and going stale.
    const resizeObserver = new ResizeObserver(recompute);
    resizeObserver.observe(box);
    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, []);

  const isList = layout === 'list';

  return (
    <article
      ref={cardRef}
      className="template-card"
      style={{
        background: colors.surface,
        borderRadius: '14px',
        boxShadow: isHovered ? '0 18px 40px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.22)',
        border: `1px solid ${isHovered ? colors.orange : 'transparent'}`,
        overflow: 'hidden',
        transition: 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${Math.min(index, 12) * 0.05}s`,
        cursor: 'default',
        maxWidth: isList ? 'none' : '340px',
        margin: isList ? 0 : '0 auto',
        width: '100%',
        display: isList ? 'flex' : 'block',
        alignItems: isList ? 'stretch' : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isList && <div style={{ height: '4px', background: `linear-gradient(90deg, ${colors.orange}, ${colors.teal})`, width: '100%' }} />}

      {recommended && (
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: `linear-gradient(135deg, ${colors.orange}, ${colors.orangeDeep})`,
            color: colors.cream,
            padding: '3px 14px',
            borderRadius: '20px',
            fontSize: '0.6rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            boxShadow: `0 3px 12px ${colors.orange}55`,
            zIndex: 10,
            animation: 'slideInRight 0.4s ease',
          }}
        >
          ★ Recommended
        </div>
      )}

      <div
        ref={boxRef}
        className="template-card__preview"
        style={{
          padding: `${THUMBNAIL_PADDING}px`,
          background: colors.surfaceMuted,
          height: isList ? '100%' : '220px',
          width: isList ? '190px' : 'auto',
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          borderRight: isList ? `1px solid ${colors.border}` : 'none',
        }}
      >
        <div
          ref={previewRef}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center', flexShrink: 0, pointerEvents: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.18)' }}
        >
          <Template resume={sample} templateId={template.id} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '36px',
            background: `linear-gradient(180deg, rgba(246,242,233,0) 0%, ${colors.surfaceMuted}F2 85%)`,
            pointerEvents: 'none',
          }}
        />
        {isHovered && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(180deg, ${colors.orange}0D, transparent)`, pointerEvents: 'none' }} />
        )}
      </div>

      <div
        className="template-card__body"
        style={{
          padding: isList ? '16px 20px' : '16px 18px 18px',
          flex: isList ? 1 : undefined,
          display: isList ? 'flex' : 'block',
          flexDirection: isList ? 'column' : undefined,
          justifyContent: isList ? 'center' : undefined,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: colors.orangeDeep, fontWeight: '700' }}>{template.category}</p>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: colors.ink, marginTop: '2px' }}>{template.name}</h3>
          </div>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.6rem',
              fontWeight: '600',
              background: template.atsFriendly ? `${colors.teal}1F` : `${colors.orange}1F`,
              color: template.atsFriendly ? colors.tealDeep : colors.orangeDeep,
              whiteSpace: 'nowrap',
            }}
          >
            {template.atsFriendly ? '✓ ATS' : '✦ Creative'}
          </span>
        </div>

        <p
          style={{
            color: colors.inkMuted,
            fontSize: '0.78rem',
            lineHeight: '1.5',
            marginBottom: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: isList ? 'auto' : '36px',
          }}
        >
          {template.description}
        </p>

        <div style={{ display: 'flex', gap: '8px', maxWidth: isList ? '320px' : 'none' }}>
          <button
            type="button"
            onClick={() => onPreview(template)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${isHovered ? colors.orange : colors.border}`,
              background: colors.surface,
              color: colors.ink,
              fontWeight: '500',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = colors.orange;
              e.target.style.background = `${colors.orange}14`;
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = isHovered ? colors.orange : colors.border;
              e.target.style.background = colors.surface;
            }}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => onUse(template)}
            style={{
              flex: 1.5,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: `linear-gradient(135deg, ${colors.pageBg}, ${colors.panelBg})`,
              color: colors.cream,
              fontWeight: '600',
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(20,22,28,0.35)',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 20px ${colors.orange}55`;
              e.target.style.background = `linear-gradient(135deg, ${colors.orangeDeep}, ${colors.orange})`;
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 3px 12px rgba(20,22,28,0.35)';
              e.target.style.background = `linear-gradient(135deg, ${colors.pageBg}, ${colors.panelBg})`;
            }}
          >
            Use →
          </button>
        </div>
      </div>
    </article>
  );
}

const importedLabels = [
  ['personal', 'Name'],
  ['contact', 'Contact information'],
  ['summary', 'Summary'],
  ['experience', 'Experience'],
  ['education', 'Education'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['certifications', 'Certifications'],
  ['achievements', 'Achievements'],
  ['languages', 'Languages'],
  ['interests', 'Interests'],
  ['custom', 'Other information'],
];

function importedCategories(sections) {
  if (!sections) return [];
  const contact = sections.personal && ['email', 'phone', 'location', 'website', 'linkedin', 'github'].some(key => Boolean(sections.personal[key]));
  return importedLabels
    .filter(([key]) =>
      key === 'contact' ? contact : key === 'personal' ? Boolean(sections.personal?.fullName) : Array.isArray(sections[key]) ? sections[key].length : Boolean(sections[key])
    )
    .map(([, label]) => label);
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
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    setIsPageVisible(true);
  }, []);

  const recommended = careerPaths[career] || [];

  const filtered = TEMPLATE_CONFIGS.filter(template => {
    const matchesFilter = filter === 'All' || (filter === 'ATS Friendly' ? template.atsFriendly : template.category === filter);
    const query = search.trim().toLowerCase();
    return matchesFilter && (!query || `${template.name} ${template.category} ${template.description}`.toLowerCase().includes(query));
  });

  const sortedTemplates = [...filtered].sort((a, b) => {
    if (sortBy === 'popular') return (b.popular || 0) - (a.popular || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const hasActiveFilters = filter !== 'All' || search.trim().length > 0;
  const clearFilters = () => {
    setFilter('All');
    setSearch('');
  };

  const handleUseTemplate = template => {
    const id = onCreate(`${template.name} resume`, { id: template.id, accentColor: template.accentColor }, importedSections);
    navigate(`/editor/${id}`);
  };

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

  const cancelImport = () => {
    setReviewImport(null);
  };
  const previewResume = preview ? { ...createSampleResume(), template: preview.id } : null;
  const PreviewTemplate = preview?.component;

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
      .animate-scale-in { animation: scaleIn 0.3s ease forwards; }

      .import-btn { position: relative; overflow: hidden; }
      .import-btn::after {
        content: '';
        position: absolute;
        top: 0;
        left: -120%;
        width: 60%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent);
        transition: left 0.6s ease;
        pointer-events: none;
      }
      .import-btn:hover::after { left: 120%; }

      .view-toggle-btn { transition: background 0.15s ease, color 0.15s ease; }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <main
      className="templates-page"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '40px 24px 60px',
        background: colors.pageBg,
        minHeight: '100vh',
        opacity: isPageVisible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Hero Section */}
      <section style={{ marginBottom: '40px', animation: 'fadeInUp 0.6s ease forwards', textAlign: 'center', padding: '20px 0' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.panelBg, padding: '4px 16px', borderRadius: '20px', marginBottom: '12px' }}>
            <span style={{ color: colors.orange, fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px' }}>✦ TEMPLATE STUDIO</span>
          </div>
          <h1 style={{ fontFamily: serif, fontSize: '2.8rem', fontWeight: '600', color: colors.cream, lineHeight: '1.15', marginBottom: '8px' }}>
            Choose from our stylish,{' '}
            <span style={{ background: colors.orange, color: colors.ink, padding: '1px 10px', borderRadius: '6px', display: 'inline-block' }}>ATS-friendly</span>{' '}
            resume templates
          </h1>
          <p style={{ color: colors.creamMuted, fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '580px', margin: '8px auto 0' }}>
            Let AI help you customize each one to perfection. Designed to look great and, most importantly,{' '}
            <span style={{ color: colors.cream, fontWeight: '600' }}>get you hired</span>.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px', animation: 'fadeInUp 0.6s ease 0.05s forwards', opacity: 0 }}>
        {[
          { label: 'Professional Templates', value: TEMPLATE_CONFIGS.length },
          { label: 'ATS Optimized', value: TEMPLATE_CONFIGS.filter(t => t.atsFriendly).length },
          { label: 'Design Categories', value: new Set(TEMPLATE_CONFIGS.map(t => t.category)).size },
          { label: 'AI-Powered', value: '100%' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{ background: colors.panelBg, padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, textAlign: 'center', transition: 'all 0.3s' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
              e.currentTarget.style.borderColor = colors.orange;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: colors.orange }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: colors.creamMuted, marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Career Recommender */}
      <div
        style={{
          background: colors.panelBg,
          borderRadius: '14px',
          padding: '16px 24px',
          marginBottom: '24px',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          animation: 'fadeInUp 0.6s ease 0.1s forwards',
          opacity: 0,
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = colors.orange)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            🎯
          </div>
          <div>
            <p style={{ color: colors.creamMuted, fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart Match</p>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: colors.cream }}>Find templates for your role</h3>
          </div>
        </div>
        <select
          aria-label="Select your role"
          value={career}
          onChange={event => setCareer(event.target.value)}
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            border: `1.5px solid ${colors.border}`,
            fontSize: '0.85rem',
            fontWeight: '500',
            background: colors.pageBg,
            color: colors.cream,
            cursor: 'pointer',
            minWidth: '180px',
            transition: 'all 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = colors.orange)}
          onBlur={e => (e.target.style.borderColor = colors.border)}
        >
          <option value="">Select your role</option>
          {Object.keys(careerPaths).map(path => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
        {career && (
          <span
            style={{
              color: colors.orange,
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '4px 14px',
              background: `${colors.orange}1A`,
              borderRadius: '20px',
              border: `1px solid ${colors.orange}4D`,
              animation: 'fadeInUp 0.3s ease',
            }}
          >
            ✦ {recommended.length} recommended matches
          </span>
        )}
      </div>

      {/* Import section — styled after Folio's dark CTA block */}
      <div
        style={{
          background: colors.panelBgDeep,
          borderRadius: '18px',
          padding: '36px 32px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '32px',
          animation: 'fadeInUp 0.6s ease 0.15s forwards',
          opacity: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <div
            style={{
              width: '84px',
              height: '112px',
              borderRadius: '12px',
              background: colors.panelBg,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.cream,
              fontWeight: '700',
              fontFamily: serif,
              fontSize: '0.95rem',
              transform: 'rotate(-6deg)',
              boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
            }}
          >
            PDF
          </div>
          <span style={{ color: colors.orange, fontSize: '1.3rem' }}>→</span>
          <div
            style={{
              width: '84px',
              height: '112px',
              borderRadius: '12px',
              background: `linear-gradient(160deg, ${colors.teal}, ${colors.tealDeep})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.cream,
              fontWeight: '700',
              fontFamily: serif,
              fontSize: '0.95rem',
              transform: 'rotate(4deg)',
              boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
            }}
          >
            F
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '260px' }}>
          <p style={{ color: colors.orange, fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.orange, display: 'inline-block' }} />
            Already have a resume?
          </p>
          <h3 style={{ fontFamily: serif, fontSize: '1.8rem', fontWeight: '600', color: colors.cream, lineHeight: '1.2', marginBottom: '4px' }}>Bring your experience</h3>
          <span style={{ fontFamily: serif, fontSize: '1.8rem', fontWeight: '600', color: colors.orange, background: `${colors.orangeDeep}33`, padding: '0 12px', borderRadius: '6px', display: 'inline-block', marginBottom: '14px' }}>
            with you.
          </span>
          <p style={{ color: colors.creamMuted, fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '18px', maxWidth: '480px' }}>
            Upload an old PDF or DOCX and we'll help you move the information into a fresh Folio template. Your content comes across; the old design stays behind.
          </p>
          {importedSections && <p style={{ color: colors.teal, fontWeight: '500', marginBottom: '10px', fontSize: '0.82rem' }}>✓ Resume imported successfully</p>}
          {importError && (
            <p role="alert" style={{ color: '#e07a6b', fontWeight: '500', marginBottom: '10px', fontSize: '0.82rem' }}>
              ⚠️ {importError}
            </p>
          )}
          <label
            className="import-btn"
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: colors.cream,
              color: colors.ink,
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: isReading ? 'not-allowed' : 'pointer',
              opacity: isReading ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              if (isReading) return;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(244,239,227,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFile}
              disabled={isReading}
              style={{ display: 'none' }}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>{isReading ? 'Reading...' : 'Import my resume'}</span>
            <span aria-hidden="true">→</span>
          </label>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          padding: '4px 0',
          animation: 'fadeInUp 0.6s ease 0.2s forwards',
          opacity: 0,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {filters.map(item => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: filter === item ? 'none' : `1.5px solid ${colors.border}`,
                background: filter === item ? colors.orange : colors.panelBg,
                color: filter === item ? colors.ink : colors.creamMuted,
                fontWeight: filter === item ? '700' : '500',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: filter === item ? `0 3px 12px ${colors.orange}40` : 'none',
              }}
              onMouseEnter={e => {
                if (filter !== item) {
                  e.target.style.borderColor = colors.orange;
                  e.target.style.color = colors.cream;
                }
              }}
              onMouseLeave={e => {
                if (filter !== item) {
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.creamMuted;
                }
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            aria-label="Sort templates"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '5px 12px', borderRadius: '8px', border: `1.5px solid ${colors.border}`, fontSize: '0.75rem', background: colors.panelBg, color: colors.cream, cursor: 'pointer' }}
          >
            <option value="popular">Sort: Popular</option>
            <option value="name">Sort: Name</option>
          </select>

          <div style={{ display: 'flex', borderRadius: '8px', border: `1.5px solid ${colors.border}`, overflow: 'hidden' }}>
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              className="view-toggle-btn"
              style={{ border: 'none', padding: '6px 10px', background: viewMode === 'grid' ? colors.orange : colors.panelBg, color: viewMode === 'grid' ? colors.ink : colors.creamMuted, cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1 }}
            >
              ▦
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className="view-toggle-btn"
              style={{ border: 'none', padding: '6px 10px', background: viewMode === 'list' ? colors.orange : colors.panelBg, color: viewMode === 'list' ? colors.ink : colors.creamMuted, cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1 }}
            >
              ☰
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: colors.panelBg, padding: '3px 14px', borderRadius: '20px', border: `1.5px solid ${colors.border}` }}>
            <span aria-hidden="true" style={{ color: colors.creamMuted, fontSize: '0.75rem' }}>
              🔍
            </span>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search templates..."
              aria-label="Search templates"
              style={{ border: 'none', padding: '5px 2px', fontSize: '0.8rem', outline: 'none', width: '130px', background: 'transparent', color: colors.cream }}
            />
          </label>
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <p style={{ color: colors.creamMuted, fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>
          Showing <strong style={{ color: colors.cream }}>{sortedTemplates.length}</strong> of {TEMPLATE_CONFIGS.length} professional templates
        </p>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} style={{ border: 'none', background: 'none', color: colors.orange, fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', padding: '2px 4px' }}>
            Clear filters ✕
          </button>
        )}
      </div>

      {sortedTemplates.length === 0 ? (
        <div
          style={{
            background: colors.panelBg,
            border: `1px dashed ${colors.border}`,
            borderRadius: '14px',
            padding: '48px 24px',
            textAlign: 'center',
            marginBottom: '40px',
            animation: 'fadeInUp 0.4s ease forwards',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: colors.cream, marginBottom: '4px' }}>No templates match your filters</h3>
          <p style={{ color: colors.creamMuted, fontSize: '0.85rem', marginBottom: '16px' }}>Try a different category or search term.</p>
          <button
            type="button"
            onClick={clearFilters}
            style={{ padding: '8px 22px', borderRadius: '999px', border: 'none', background: colors.orange, color: colors.ink, fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <section
          style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gap: viewMode === 'grid' ? '24px' : '16px',
            marginBottom: '40px',
          }}
        >
          {sortedTemplates.map((template, index) => (
            <TemplateCard key={template.id} template={template} recommended={recommended.includes(template.id)} onPreview={setPreview} onUse={handleUseTemplate} index={index} layout={viewMode} />
          ))}
        </section>
      )}

      {/* Preview Modal */}
      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview ? `${preview.name} Preview` : ''} size="xl" style={{ background: 'rgba(15,16,21,0.75)', backdropFilter: 'blur(10px)' }}>
        {preview && (
          <div style={{ padding: '24px', animation: 'scaleIn 0.3s ease' }}>
            <div style={{ background: colors.surfaceMuted, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', maxHeight: '65vh', overflowY: 'auto' }}>
              <PreviewTemplate resume={previewResume} templateId={preview.id} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '12px', flexWrap: 'wrap' }}>
              <p style={{ color: colors.creamMuted, fontSize: '0.85rem' }}>{preview.description}</p>
              <button
                onClick={() => handleUseTemplate(preview)}
                style={{
                  padding: '10px 32px',
                  borderRadius: '999px',
                  border: 'none',
                  background: colors.orange,
                  color: colors.ink,
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Use This Template →
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Import Review Modal */}
      <Modal open={Boolean(reviewImport)} onClose={cancelImport} title="Information Found" style={{ background: 'rgba(15,16,21,0.75)', backdropFilter: 'blur(10px)' }}>
        <div style={{ padding: '20px', animation: 'fadeInUp 0.3s ease' }}>
          <p style={{ color: colors.inkMuted, marginBottom: '14px', fontSize: '0.9rem' }}>We found the following information in your resume:</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '20px' }}>
            {importedCategories(reviewImport).map((category, index) => (
              <li
                key={category}
                style={{
                  padding: '8px 14px',
                  background: `${colors.teal}14`,
                  borderRadius: '8px',
                  color: colors.tealDeep,
                  fontWeight: '500',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: `fadeInUp 0.3s ease ${index * 0.04}s forwards`,
                  opacity: 0,
                }}
              >
                <span style={{ color: colors.orange }}>✦</span> {category}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={cancelImport}
              style={{ padding: '8px 22px', borderRadius: '999px', border: `1.5px solid ${colors.border}`, background: 'white', color: colors.inkMuted, fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
              onMouseEnter={e => {
                e.target.style.borderColor = colors.orange;
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = colors.border;
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmImport}
              style={{ padding: '8px 22px', borderRadius: '999px', border: 'none', background: colors.orange, color: colors.ink, fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Use this information
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}