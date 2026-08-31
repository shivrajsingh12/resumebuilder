import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTemplate } from '../templates';

export default function PrintResume({ getResume }) {
  const { id } = useParams();
  const resume = getResume(id);

  useEffect(() => {
    if (!resume) return undefined;
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, [resume]);

  if (!resume) return <main className="print-route"><p>Resume could not be loaded.</p></main>;
  const Template = getTemplate(resume.template).component;
  return <main className="print-route" id="resume-print"><Template resume={resume} templateId={resume.template} /></main>;
}
