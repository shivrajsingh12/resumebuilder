import { useNavigate } from 'react-router-dom';

const features = [
  ['✦', 'AI Resume Builder', 'Build each section with helpful prompts that keep your story clear and truthful.', '/dashboard'],
  ['◌', 'Resume & Job Match', 'See your ATS health and compare it with a role before you apply.', '/ats'],
  ['▦', 'Resume Templates', 'Choose a structure designed for your field, experience, and next move.', '/templates'],
  ['↑', 'Import Existing Resume', 'Bring over your information from an old PDF or DOCX without its old design.', '/ats'],
  ['✎', 'AI Writing Suggestions', 'Turn projects, internships, and achievements into stronger language.', '/career-center'],
];
const steps = [['01', 'Choose a template', 'Start with a layout that makes your best evidence easy to scan.'], ['02', 'Build and improve with AI', 'Fill in your story section by section, with guidance when you need it.'], ['03', 'Download and apply', 'Check your resume, tailor it for the role, and send it with confidence.']];
const careers = ['Student', 'Software Engineer', 'Business', 'Marketing', 'Finance', 'Healthcare'];
const templates = [['Modern', 'Clear hierarchy', 'modern'], ['Executive', 'Confident and calm', 'executive'], ['Student', 'Projects first', 'student'], ['Creative', 'Distinctive rhythm', 'creative'], ['Tech', 'Technical focus', 'tech'], ['ATS Classic', 'Easy to parse', 'ats']];

// Profile used across the preview + template band. Swap this to re-brand the whole page.
const profile = {
  name: 'Shivraj Singh Chouhan',
  title: 'Developer',
  contact: 'shivrajbana2003@gmail.com · India',
  initials: 'SC',
  github: 'https://github.com/shivrajsingh12',
  linkedin: 'https://linkedin.com/in/shivraj-sigh12',
  email: 'shivrajbana2003@gmail.com',
};

function ResumePreview() {
  return <div className="home-preview-wrap"><div className="home-preview-badge home-preview-badge--score"><b>92</b><span>ATS ready</span></div><div className="home-resume-preview"><div className="home-resume-preview__head"><div className="home-avatar">{profile.initials}</div><div><b>{profile.name}</b><span>{profile.title}</span><small>{profile.contact}</small></div></div><div className="home-resume-preview__line" /><PreviewSection title="Summary"><p>Frontend developer and CS undergraduate building responsive, high-performance interfaces with React, Next.js, and clean component architecture.</p></PreviewSection><PreviewSection title="Education"><strong>B.Tech, Computer Science &amp; Engineering</strong><small>2022 – 2026</small></PreviewSection><PreviewSection title="Selected projects"><strong>Bharatiya Virasat</strong><small>Responsive React app showcasing India's cultural heritage, deployed on Vercel.</small></PreviewSection><div className="home-skill-row"><span>React.js</span><span>Next.js</span><span>GSAP</span></div></div><div className="home-preview-badge home-preview-badge--keywords"><b>3</b><span>improvements<br />to make</span></div></div>;
}
function PreviewSection({ title, children }) { return <section className="home-resume-preview__section"><b>{title}</b>{children}</section>; }

export default function LandingPage({ onGetStarted = () => 'new' }) {
  const navigate = useNavigate();
  const start = () => {
    // Guard: never let a missing/throwing onGetStarted break the primary CTA.
    let id = 'new';
    try {
      const result = onGetStarted();
      if (result) id = result;
    } catch (err) {
      console.error('onGetStarted failed, starting a fresh resume instead:', err);
    }
    navigate(`/editor/${id}`);
  };
  return <main className="home-page">
    <style>{`
      :root {
        --folio-ink: #F5F1E8;
        --folio-ink-soft: #171A21;
        --folio-ink-softer: #1F2635;
        --folio-paper: #12151B;
        --folio-paper-raised: #171A21;
        --folio-line: rgba(245, 241, 232, 0.12);
        --folio-line-dark: rgba(245, 241, 232, 0.14);
        --folio-muted: #B6BFCB;
        --folio-muted-dark: #8E99AA;
        --folio-gold: #D99032;
        --folio-gold-dark: #B97A1A;
        --folio-gold-soft: rgba(217, 144, 50, 0.12);
        --folio-gold-deep: #F7D7A8;
        --folio-teal: #287765;
      }

      * { box-sizing: border-box; }

      .home-page {
        background:
          radial-gradient(circle at top right, rgba(217, 144, 50, 0.13), transparent 22%),
          radial-gradient(circle at bottom left, rgba(40, 119, 101, 0.16), transparent 24%),
          var(--folio-paper);
        color: var(--folio-ink);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
        overflow-x: hidden;
      }

      .home-page h1, .home-page h2, .home-page h3 {
        font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
        color: var(--folio-ink);
        margin: 0;
        font-weight: 400;
      }

      .home-page em {
        font-style: normal;
        background: var(--folio-gold-soft);
        color: var(--folio-gold-deep);
        padding: 0 10px 4px;
        border-radius: 3px;
        display: inline-block;
      }

      .home-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13.5px;
        color: #B8C0CC;
        margin: 0 0 18px;
      }

      .home-kicker span {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--folio-gold);
        flex-shrink: 0;
      }

      .home-button {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        font-size: 15px;
        font-family: inherit;
        border-radius: 999px;
        padding: 14px 26px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
      }

      .home-button span { transition: transform 0.2s ease; }
      .home-button:hover span { transform: translateX(3px); }
      .home-button:active { transform: scale(0.97); }
      .home-button:focus-visible { outline: 2px solid var(--folio-gold); outline-offset: 3px; }

      .home-button--primary {
        background: linear-gradient(135deg, var(--folio-gold), #E8A85E);
        color: #10182A;
        box-shadow: 0 20px 28px rgba(217, 144, 50, 0.22);
      }
      .home-button--primary:hover { background: linear-gradient(135deg, #E8A85E, var(--folio-gold)); }

      .home-button--secondary {
        background: rgba(245, 241, 232, 0.03);
        color: var(--folio-ink);
        border-color: var(--folio-line);
      }
      .home-button--secondary:hover { border-color: var(--folio-gold); color: var(--folio-gold-deep); background: rgba(217, 144, 50, 0.08); }

      .home-button--light {
        background: #F7F3EC;
        color: #10182A;
      }
      .home-button--light:hover { background: rgba(217, 144, 50, 0.12); color: var(--folio-gold-deep); }

      /* Hero */
      .home-hero {
        max-width: 1180px;
        margin: 0 auto;
        padding: 76px 28px 64px;
        display: grid;
        grid-template-columns: 1fr 0.95fr;
        gap: 48px;
        align-items: center;
      }

      .home-hero__copy h1 {
        font-size: 52px;
        line-height: 1.12;
        letter-spacing: -0.01em;
      }

      .home-hero__lead {
        font-size: 16.5px;
        line-height: 1.6;
        color: #B8C0CC;
        max-width: 46ch;
        margin: 22px 0 30px;
      }

      .home-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .home-trust {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        margin-top: 26px;
        font-size: 13.5px;
        color: #B8C0CC;
      }

      .home-hero__visual { position: relative; }

      .home-preview-wrap { position: relative; }

      .home-resume-preview {
        background: linear-gradient(180deg, #1B1F2A 0%, #12151B 100%);
        border: 1px solid rgba(245, 241, 232, 0.10);
        border-radius: 18px;
        padding: 26px 24px;
        box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.7);
        transform: rotate(-1.2deg);
      }

      .home-resume-preview__head { display: flex; gap: 12px; align-items: center; }

      .home-avatar {
        width: 42px;
        height: 42px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--folio-gold), var(--folio-teal));
        color: #10182A;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        flex-shrink: 0;
        box-shadow: 0 10px 20px rgba(40, 119, 101, 0.18);
      }

      .home-resume-preview__head b { display: block; font-size: 15px; font-family: Georgia, serif; color: var(--folio-ink); }
      .home-resume-preview__head span { display: block; font-size: 12.5px; color: #B8C0CC; }
      .home-resume-preview__head small { display: block; font-size: 11px; color: #B8C0CC; margin-top: 2px; }

      .home-resume-preview__line {
        height: 1px;
        background: var(--folio-line-dark);
        margin: 16px 0;
      }

      .home-resume-preview__section { margin-bottom: 14px; }
      .home-resume-preview__section b { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--folio-gold); margin-bottom: 6px; font-family: inherit; }
      .home-resume-preview__section p { margin: 0; font-size: 12.5px; color: var(--folio-ink); line-height: 1.5; }
      .home-resume-preview__section strong { display: block; font-size: 12.5px; font-weight: 600; margin-top: 6px; color: var(--folio-ink); }
      .home-resume-preview__section small { display: block; font-size: 11.5px; color: #B8C0CC; margin-top: 2px; }

      .home-skill-row { display: flex; gap: 6px; flex-wrap: wrap; }
      .home-skill-row span {
        font-size: 11px;
        background: rgba(201, 135, 61, 0.16);
        color: var(--folio-gold);
        padding: 4px 10px;
        border-radius: 999px;
      }

      .home-preview-badge {
        position: absolute;
        background: var(--folio-paper-raised);
        border: 1px solid var(--folio-line);
        border-radius: 12px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 16px 32px -20px rgba(20, 22, 27, 0.3);
      }
      .home-preview-badge b { font-family: Georgia, serif; font-size: 18px; }
      .home-preview-badge span { font-size: 11px; color: #B8C0CC; line-height: 1.3; }

      .home-preview-badge--score { top: -18px; left: -18px; }
      .home-preview-badge--score b { color: var(--folio-gold-dark); }
      .home-preview-badge--keywords { bottom: -18px; right: -14px; }
      .home-preview-badge--keywords b { color: var(--folio-gold-dark); }

      /* Proof strip */
      .home-proof {
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 28px 64px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        border-top: 1px solid var(--folio-line);
        border-bottom: 1px solid var(--folio-line);
      }
      .home-proof > div {
        padding: 26px 20px;
        text-align: center;
        border-left: 1px solid var(--folio-line);
      }
      .home-proof > div:first-child { border-left: none; }
      .home-proof b { display: block; font-family: Georgia, serif; font-size: 19px; margin-bottom: 4px; color: var(--folio-gold-deep); }
      .home-proof span { font-size: 13px; color: #B8C0CC; }

      /* Sections */
      .home-section {
        max-width: 1180px;
        margin: 0 auto;
        padding: 88px 28px;
      }

      .home-section__intro { max-width: 620px; margin-bottom: 46px; }
      .home-section__intro h2 { font-size: 34px; line-height: 1.2; margin-bottom: 16px; }
      .home-section__intro p { font-size: 15.5px; color: #B8C0CC; line-height: 1.6; margin: 0; }

      .home-section__heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 30px;
        margin-bottom: 44px;
        flex-wrap: wrap;
      }
      .home-section__heading h2 { font-size: 34px; line-height: 1.2; margin-bottom: 0; }
      .home-section__heading > p { font-size: 15px; color: #B8C0CC; max-width: 34ch; margin: 0; }

      .home-text-link {
        background: none;
        border: none;
        color: var(--folio-gold-deep);
        font-size: 14.5px;
        cursor: pointer;
        padding: 0;
        white-space: nowrap;
      }
      .home-text-link:hover { color: var(--folio-gold); }
      .home-text-link:focus-visible { outline: 2px solid var(--folio-gold); outline-offset: 3px; }

      /* Steps */
      .home-step-list { display: flex; flex-direction: column; }
      .home-step-list article {
        display: flex;
        align-items: center;
        gap: 26px;
        padding: 26px 4px;
        border-top: 1px solid var(--folio-line);
      }
      .home-step-list article:last-child { border-bottom: 1px solid var(--folio-line); }
      .home-step-list span {
        font-family: Georgia, serif;
        font-size: 30px;
        color: var(--folio-gold-soft);
        -webkit-text-stroke: 1px var(--folio-gold);
        width: 60px;
        flex-shrink: 0;
      }
      .home-step-list h3 { font-size: 18px; margin-bottom: 4px; font-family: inherit; font-weight: 600; }
      .home-step-list p { margin: 0; font-size: 14px; color: #B8C0CC; }
      .home-step-list i { margin-left: auto; font-style: normal; color: #B8C0CC; font-size: 18px; transition: transform 0.2s ease, color 0.2s ease; }
      .home-step-list article:hover i { transform: translateX(4px); color: var(--folio-gold-deep); }

      /* Feature grid */
      .home-feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      .home-feature-grid button {
        text-align: left;
        background: var(--folio-paper-raised);
        border: 1px solid var(--folio-line);
        border-radius: 14px;
        padding: 26px;
        cursor: pointer;
        font-family: inherit;
        transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .home-feature-grid button:hover {
        border-color: var(--folio-gold);
        transform: translateY(-3px);
        box-shadow: 0 20px 34px -26px rgba(20, 22, 27, 0.35);
      }
      .home-feature-grid button:focus-visible { outline: 2px solid var(--folio-gold); outline-offset: 2px; }
      .home-feature-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: rgba(217, 144, 50, 0.15);
        color: var(--folio-gold-deep);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        margin-bottom: 16px;
      }
      .home-feature-grid h3 { font-size: 16.5px; margin-bottom: 8px; font-family: Georgia, serif; }
      .home-feature-grid p { font-size: 13.5px; color: #B8C0CC; line-height: 1.5; margin: 0 0 16px; }
      .home-feature-grid strong { font-size: 13px; color: var(--folio-gold-deep); font-weight: 500; margin-top: auto; }
      .home-feature-grid strong span { display: inline-block; transition: transform 0.2s ease; }
      .home-feature-grid button:hover strong span { transform: translate(2px, -2px); }

      /* Template band */
      .home-template-band { max-width: 1180px; margin: 0 auto; padding: 88px 28px; }
      .home-template-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
      }
      .home-template-grid button {
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        padding: 0;
        font-family: inherit;
      }
      .home-template-grid button:focus-visible { outline: 2px solid var(--folio-gold); outline-offset: 3px; border-radius: 12px; }
      .home-template-card {
        border-radius: 12px;
        padding: 18px;
        height: 180px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 4px;
        border: 1px solid var(--folio-line);
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .home-template-grid button:hover .home-template-card {
        transform: translateY(-3px);
        box-shadow: 0 18px 32px -24px rgba(20, 22, 27, 0.4);
      }
      .home-template-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 6px;
      }
      .home-template-card b { font-family: Georgia, serif; font-size: 15px; }
      .home-template-card span { font-size: 11.5px; opacity: 0.75; }
      .home-template-card i { display: none; }
      .home-template-grid strong { display: block; font-size: 14.5px; margin-top: 12px; font-family: Georgia, serif; }
      .home-template-grid small { display: block; font-size: 12.5px; color: #B8C0CC; margin-top: 2px; }

      /* Recolored to a single ink/gold/cream family so the band reads as one identity */
      .home-template-card--modern { background: var(--folio-ink); color: var(--folio-paper); }
      .home-template-card--modern::before { background: var(--folio-gold); }
      .home-template-card--executive { background: var(--folio-ink-soft); color: var(--folio-paper); }
      .home-template-card--executive::before { background: var(--folio-muted-dark); }
      .home-template-card--student { background: var(--folio-gold-soft); color: var(--folio-gold-deep); }
      .home-template-card--student::before { background: var(--folio-gold); }
      .home-template-card--creative { background: var(--folio-ink-softer); color: var(--folio-gold-soft); }
      .home-template-card--creative::before { background: var(--folio-gold-dark); }
      .home-template-card--tech { background: var(--folio-paper-raised); color: var(--folio-ink); border-color: var(--folio-gold); }
      .home-template-card--tech::before { background: var(--folio-ink); }
      .home-template-card--ats { background: var(--folio-paper-raised); color: var(--folio-ink); }
      .home-template-card--ats::before { background: var(--folio-gold-dark); }

      /* Import band */
      .home-import {
        position: relative;
        max-width: 1180px;
        margin: 40px auto;
        padding: 32px;
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        align-items: center;
        gap: 32px;
        border-radius: 30px;
        background: linear-gradient(135deg, rgba(18, 21, 27, 0.98), rgba(31, 38, 53, 0.96));
        border: 1px solid rgba(245, 241, 232, 0.11);
        box-shadow: 0 28px 60px -30px rgba(0, 0, 0, 0.7);
        overflow: hidden;
      }
      .home-import::before {
        content: "";
        position: absolute;
        inset: auto -80px -90px auto;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: rgba(217, 144, 50, 0.12);
        filter: blur(28px);
      }
      .home-import__visual {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        min-height: 210px;
        border-radius: 26px;
        background: linear-gradient(145deg, rgba(247, 243, 236, 0.04), rgba(40, 119, 101, 0.08));
        border: 1px solid rgba(247, 243, 236, 0.08);
        padding: 24px;
      }
      .home-import__visual::after {
        content: "";
        position: absolute;
        inset: 18px;
        border-radius: 18px;
        border: 1px solid rgba(217, 144, 50, 0.14);
        pointer-events: none;
      }
      .home-import__content {
        position: relative;
        z-index: 1;
        background: linear-gradient(145deg, rgba(247, 243, 236, 0.97), rgba(247, 243, 236, 0.9));
        color: var(--folio-paper);
        border-radius: 24px;
        border: 1px solid rgba(16, 24, 42, 0.08);
        box-shadow: 0 22px 38px -28px rgba(16, 24, 42, 0.55);
        padding: 32px 30px;
        animation: fadeUp 0.7s ease both;
      }
      .home-import .home-kicker { color: var(--folio-gold); }
      .home-import h2 { color: var(--folio-paper); font-size: 32px; margin-bottom: 14px; }
      .home-import > div:last-child > p { font-size: 15px; color: rgba(16, 24, 42, 0.72); line-height: 1.6; margin: 0 0 26px; max-width: 46ch; }
      .home-import em { background: rgba(217, 144, 50, 0.16); color: var(--folio-gold); }

      .import-file, .import-new {
        width: 92px;
        height: 118px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Georgia, serif;
        font-size: 20px;
        box-shadow: 0 18px 30px -20px rgba(0, 0, 0, 0.5);
      }
      .import-file {
        background: linear-gradient(180deg, rgba(31, 38, 53, 0.96), rgba(18, 21, 27, 0.96));
        color: var(--folio-ink);
        border: 1px solid rgba(245, 241, 232, 0.1);
      }
      .import-new {
        background: linear-gradient(135deg, var(--folio-gold), #E7A75B);
        color: #10182A;
      }
      .import-arrow {
        color: var(--folio-gold);
        font-size: 22px;
        font-weight: 700;
      }

      /* Careers */
      .home-career-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .home-career-grid button {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--folio-paper-raised);
        border: 1px solid var(--folio-line);
        border-radius: 999px;
        padding: 14px 20px;
        cursor: pointer;
        font-family: inherit;
        transition: border-color 0.2s ease, background 0.2s ease;
      }
      .home-career-grid button:hover { border-color: var(--folio-gold); background: var(--folio-gold-soft); }
      .home-career-grid button:focus-visible { outline: 2px solid var(--folio-gold); outline-offset: 2px; }
      .home-career-grid span { font-size: 12px; color: var(--folio-gold-dark); font-family: Georgia, serif; }
      .home-career-grid b { font-size: 14.5px; font-weight: 500; }
      .home-career-grid i { margin-left: auto; font-style: normal; color: #B8C0CC; }

      /* Final CTA */
      .home-final {
        width: 100%;
        margin: 0;
        padding: 64px 28px;
        background:
          radial-gradient(circle at top right, rgba(217, 144, 50, 0.13), transparent 22%),
          radial-gradient(circle at bottom left, rgba(40, 119, 101, 0.16), transparent 24%),
          linear-gradient(180deg, #12151B, #0F1218);
        border-top: 1px solid rgba(245, 241, 232, 0.08);
        border-bottom: 1px solid rgba(245, 241, 232, 0.08);
        position: relative;
        overflow: hidden;
      }
      .home-final::before {
        content: "";
        position: absolute;
        inset: auto -140px -100px auto;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: rgba(217, 144, 50, 0.1);
        filter: blur(32px);
      }
      .home-final__card {
        position: relative;
        z-index: 1;
        max-width: 860px;
        margin: 0 auto;
        text-align: center;
        animation: fadeUp 0.7s ease both;
      }
      .home-final .home-kicker { color: var(--folio-gold); font-size: 12px; }
      .home-final__card h2 {
        font-size: 42px;
        line-height: 1.25;
        margin: 18px 0 36px;
        color: var(--folio-ink);
      }
      .home-final__card h2 em {
        background: none;
        color: var(--folio-gold-deep);
        padding: 0;
        border-radius: 0;
      }
      .home-final__card .home-button {
        position: relative;
        z-index: 2;
      }

      /* Footer */
      .home-footer {
        border-top: 1px solid var(--folio-line);
        padding: 40px 28px;
        max-width: 1180px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
      }
      .home-footer__brand { display: flex; align-items: center; gap: 9px; }
      .home-footer__brand span {
        width: 26px; height: 26px; border-radius: 7px;
        background: var(--folio-ink); color: var(--folio-gold);
        display: flex; align-items: center; justify-content: center;
        font-family: Georgia, serif; font-style: italic; font-size: 13px;
      }
      .home-footer__brand b { font-family: Georgia, serif; font-size: 16px; font-weight: 400; }
      .home-footer__brand b span:last-child { all: unset; color: var(--folio-gold-dark); }
      .home-footer > p { font-size: 13.5px; color: #B8C0CC; margin: 0; }
      .home-footer > div { display: flex; gap: 18px; align-items: center; }
      .home-footer button, .home-footer a { background: none; border: none; color: #B8C0CC; font-size: 13.5px; cursor: pointer; padding: 0; text-decoration: none; }
      .home-footer button:hover, .home-footer a:hover { color: var(--folio-gold-deep); }

      @media (max-width: 960px) {
        .home-hero { grid-template-columns: 1fr; padding-top: 52px; }
        .home-hero__visual { order: -1; max-width: 380px; margin: 0 auto; }
        .home-hero__copy h1 { font-size: 38px; }
        .home-proof { grid-template-columns: 1fr; }
        .home-proof > div { border-left: none; border-top: 1px solid var(--folio-line); }
        .home-proof > div:first-child { border-top: none; }
        .home-feature-grid { grid-template-columns: repeat(2, 1fr); }
        .home-template-grid { grid-template-columns: repeat(2, 1fr); }
        .home-career-grid { grid-template-columns: repeat(2, 1fr); }
        .home-import { grid-template-columns: 1fr; }
        .home-import__visual, .home-import > div:last-child { padding-left: 28px; padding-right: 28px; }
        .home-final h2 { font-size: 32px; }
      }

      @media (max-width: 620px) {
        .home-feature-grid { grid-template-columns: 1fr; }
        .home-template-grid { grid-template-columns: 1fr; }
        .home-career-grid { grid-template-columns: 1fr; }
        .home-section__heading { align-items: flex-start; }
        .home-final { padding: 48px 20px; }
        .home-final h2 { font-size: 26px; margin-bottom: 24px; }
        .home-final > div:last-child > p { font-size: 14.5px; }
      }

      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .home-page * { transition: none !important; }
      }
    `}</style>

    <section className="home-hero"><div className="home-hero__copy"><p className="home-kicker"><span /> A calmer way to build your career story</p><h1>Build a resume<br />that gets <em>noticed.</em></h1><p className="home-hero__lead">Create, improve, and tailor a resume that feels like you, then make sure it is ready for the people and systems reading it.</p><div className="home-actions"><button className="home-button home-button--primary" onClick={start}>Create my resume <span>→</span></button><button className="home-button home-button--secondary" onClick={() => navigate('/ats')}>Import existing resume</button></div><div className="home-trust"><span>✓ Free to start</span><span>✓ Saves as you work</span><span>✓ Built for every career stage</span></div></div><div className="home-hero__visual"><ResumePreview /></div></section>
    <section className="home-proof"><div><b>One clear workspace</b><span>From first draft to final PDF</span></div><div><b>12 original templates</b><span>Choose your visual voice</span></div><div><b>Real-time guidance</b><span>Know what to do next</span></div></section>
    <section className="home-section home-steps"><div className="home-section__intro"><p className="home-kicker"><span />A simple process</p><h2>From blank page<br />to <em>ready to send.</em></h2><p>Everything is designed to keep momentum on your side, whether this is your first resume or your fiftieth.</p></div><div className="home-step-list">{steps.map(([number, title, detail]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div><i>→</i></article>)}</div></section>
    <section className="home-section home-features"><div className="home-section__heading"><div><p className="home-kicker"><span />Your career toolkit</p><h2>Good tools for the<br /><em>important details.</em></h2></div><p>Bring the practical parts of applying into one focused place, without making your resume feel like a project to manage.</p></div><div className="home-feature-grid">{features.map(([icon, title, detail, path]) => <button key={title} onClick={() => navigate(path)}><span className="home-feature-icon">{icon}</span><h3>{title}</h3><p>{detail}</p><strong>Explore <span>↗</span></strong></button>)}</div></section>
    <section className="home-template-band"><div className="home-section__heading"><div><p className="home-kicker"><span />Find your format</p><h2>Templates with<br /><em>different points of view.</em></h2></div><button className="home-text-link" onClick={() => navigate('/templates')}>View all templates →</button></div><div className="home-template-grid">{templates.map(([name, detail, variant]) => <button key={name} onClick={() => navigate('/templates')}><div className={`home-template-card home-template-card--${variant}`}><b>{name === 'ATS Classic' ? profile.name : name}</b><span>{detail}</span></div><strong>{name}</strong><small>{detail}</small></button>)}</div></section>
    <section className="home-import"><div className="home-import__visual"><div className="import-file">PDF</div><div className="import-arrow">→</div><div className="import-new">F</div></div><div className="home-import__content"><p className="home-kicker"><span />Already have a resume?</p><h2>Bring your experience<br /><em>with you.</em></h2><p>Upload an old PDF or DOCX and we will help you move the information into a fresh Folio template. Your content comes across; the old design stays behind.</p><button className="home-button home-button--light" onClick={() => navigate('/ats')}>Import my resume <span>→</span></button></div></section>
    <section className="home-section home-careers"><div className="home-section__heading"><div><p className="home-kicker"><span />Made for your next move</p><h2>Start with where<br /><em>you are going.</em></h2></div><p>Explore a starting point for the role, industry, or stage that sounds like you.</p></div><div className="home-career-grid">{careers.map((career, index) => <button key={career} onClick={() => navigate(`/templates?career=${encodeURIComponent(career)}`)}><span>0{index + 1}</span><b>{career}</b><i>↗</i></button>)}</div></section>
    <section className="home-final"><div className="home-final__card"><p className="home-kicker"><span />A stronger application starts here</p><h2>Your next opportunity starts<br />with a <em>better resume.</em></h2><button className="home-button home-button--primary" onClick={start}>Build my resume <span>→</span></button></div></section>
    <footer className="home-footer"><div className="home-footer__brand"><span>F</span><b>folio<span>.</span></b></div><p>Tools for the people building what comes next.</p><div><button onClick={() => navigate('/templates')}>Templates</button><button onClick={() => navigate('/ats')}>Resume & Job Match</button><a href={`mailto:${profile.email}`}>Contact</a><a href={profile.github} target="_blank" rel="noreferrer">GitHub</a></div></footer>
  </main>;
}