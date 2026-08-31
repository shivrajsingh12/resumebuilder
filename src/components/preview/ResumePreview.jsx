import { useState } from 'react';
import { TEMPLATES } from '../../templates';

export default function ResumePreview({ resume }) {
  const [zoom, setZoom] = useState(0.6);
  const [mobileView, setMobileView] = useState(false);

  const Template = TEMPLATES[resume.template] || TEMPLATES.modern;
  const A4_PX = 794; // 210mm at 96dpi

  const handlePrint = () => {
    window.open(`/resume/${resume.id}/print`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--muted)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--card)] border-b border-[var(--border)] gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1)))} className="w-7 h-7 flex items-center justify-center rounded-lg text-sm bg-[var(--muted)] hover:bg-[var(--border)] transition-colors font-bold">−</button>
          <span className="text-xs font-mono text-[var(--muted-foreground)] w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)))} className="w-7 h-7 flex items-center justify-center rounded-lg text-sm bg-[var(--muted)] hover:bg-[var(--border)] transition-colors font-bold">+</button>
          <button onClick={() => setZoom(0.6)} className="text-xs px-2 h-7 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors text-[var(--muted-foreground)]">Fit</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileView(false)}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${!mobileView ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'}`}
          >Desktop</button>
          <button
            onClick={() => setMobileView(true)}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${mobileView ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'}`}
          >Mobile</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Save as PDF
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8" style={{ minHeight: 0 }}>
        <div
          className="resume-preview-scale"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            width: mobileView ? 375 : A4_PX,
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
            marginBottom: `${(1 - zoom) * -100}%`,
          }}
        >
          <div id="resume-print">
            <Template resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
