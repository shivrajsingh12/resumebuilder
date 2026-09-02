import { useEffect, useRef, useState } from 'react';
import { TEMPLATES } from '../../templates';

export default function ResumePreview({ resume }) {
  const [zoom, setZoom] = useState(0.6);
  const previewAreaRef = useRef(null);

  const Template = TEMPLATES[resume.template] || TEMPLATES.modern;
  const A4_PX = 794; // 210mm at 96dpi
  const A4_HEIGHT_PX = 1123; // 297mm at 96dpi

  // Fit the visual A4 bounds (not the unscaled DOM box) into the available
  // preview pane. This keeps the page truly centred with matching side space.
  useEffect(() => {
    const area = previewAreaRef.current;
    if (!area) return undefined;
    const fit = () => {
      const width = Math.max(0, area.clientWidth - 48);
      const height = Math.max(0, area.clientHeight - 48);
      if (width && height) setZoom(Math.min(1.5, +(Math.min(width / A4_PX, height / A4_HEIGHT_PX).toFixed(2))));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

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
          <button onClick={() => {
            const area = previewAreaRef.current;
            if (area) setZoom(+(Math.min((area.clientWidth - 48) / A4_PX, (area.clientHeight - 48) / A4_HEIGHT_PX).toFixed(2)));
          }} className="text-xs px-2 h-7 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors text-[var(--muted-foreground)]">Fit</button>
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
      <div ref={previewAreaRef} className="flex-1 overflow-auto flex items-start justify-center p-6" style={{ minHeight: 0 }}>
        <div
          className="resume-preview-scale"
          style={{
            position: 'relative',
            width: A4_PX * zoom,
            height: A4_HEIGHT_PX * zoom,
            flex: '0 0 auto',
          }}
        >
          <div id="resume-print" style={{ width: A4_PX, transform: `scale(${zoom})`, transformOrigin: 'top left', boxShadow: '0 4px 32px rgba(0,0,0,0.15)' }}>
            <Template resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
