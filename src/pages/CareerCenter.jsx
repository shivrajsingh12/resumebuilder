import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------------------------------------------------
   Design tokens — dark navy ground, cream text, deep teal as
   the primary interactive color, amber reserved for a single
   highlight moment. Matches the site's existing dark sections
   (PDF-import panel / template cards) rather than the earlier
   light theme.
--------------------------------------------------------- */
const colors = {
  bg: "#151A24",
  surface: "#1C2330",
  surfaceMuted: "#232B3B",
  border: "#2B3345",
  borderStrong: "#3A4359",
  ink: "#F1ECDE",
  inkSoft: "#A9B2C9",
  inkFaint: "#727C97",
  accent: "#2E6F5C",         // deep teal — the one signature color
  accentBright: "#4FA98C",   // teal used for small text/links on dark
  accentSoft: "#2E6F5C26",
  accentSofter: "#2E6F5C12",
  amber: "#D98A46",          // used sparingly — eyebrow, one highlight
  amberSoft: "#D98A4622",
  cream: "#F1ECDE",          // pill-button fill
  creamInk: "#14171F",       // text on cream pill buttons
  white: "#FFFFFF"
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600;700&display=swap');`;

/* ---------------------------------------------------------
   Data
--------------------------------------------------------- */
const promptsData = [
  { id: "objective", title: "Career Objective", icon: "🎯", category: "Goals",
    prompt: "Motivated final-year student seeking an opportunity to apply research, communication and problem-solving skills while contributing to a thoughtful team." },
  { id: "summary", title: "Professional Summary", icon: "📝", category: "Summary",
    prompt: "Early-career candidate with hands-on project experience, a growth mindset and a strong foundation in collaboration and clear communication." },
  { id: "project", title: "Project Description", icon: "💻", category: "Experience",
    prompt: "Designed and delivered a student-focused project, translating user feedback into a simple solution and presenting measurable outcomes to stakeholders." },
  { id: "achievement", title: "Achievement", icon: "🏆", category: "Achievements",
    prompt: "Recognized for taking initiative and improving a shared process through careful research, collaboration and follow-through." },
  { id: "internship", title: "Internship Bullet", icon: "💼", category: "Experience",
    prompt: "Partnered with the team to organize research and ship a practical improvement, documenting results for future iterations." },
  { id: "leadership", title: "Leadership", icon: "👥", category: "Skills",
    prompt: "Led cross-functional team of [X] members to deliver [project], improving [metric] by [Y]% through strategic planning and collaboration." },
  { id: "skills", title: "Skills Statement", icon: "⚡", category: "Skills",
    prompt: "Proficient in [technologies/tools] with demonstrated ability to apply these skills to solve complex problems and deliver business value." },
  { id: "freelance", title: "Freelance Highlight", icon: "🧭", category: "Experience",
    prompt: "Delivered [X] client projects independently, managing scope, timelines and communication end to end while maintaining a [Y]% repeat-client rate." },
  { id: "certification", title: "Certification Note", icon: "📚", category: "Achievements",
    prompt: "Completed [certification name], deepening practical knowledge of [skill area] and applying it directly to [project/role]." }
];

const aiTemplates = {
  student: {
    label: "Student",
    summary: "Dedicated student with a strong academic foundation and hands-on project experience. Passionate about applying knowledge to real-world challenges, with a proven ability to collaborate and communicate clearly.",
    points: [
      "Strong academic record with a focus on [field]",
      "Practical experience through projects and internships",
      "Clear communicator, comfortable working in teams",
      "Quick to learn and adapt to new tools and challenges",
      "Proven problem-solving ability"
    ]
  },
  graduate: {
    label: "Recent Graduate",
    summary: "Recent graduate in [field] with practical experience in [area]. Ready to bring fresh perspective and technical skill to a team that values careful, well-communicated work.",
    points: [
      "Strong educational background in [field]",
      "Hands-on project experience",
      "Technical proficiency in [skills]",
      "Solid analytical and research skills",
      "Careful, detail-oriented approach to work"
    ]
  },
  professional: {
    label: "Professional",
    summary: "Results-driven professional with [X] years of experience in [industry]. A track record of delivering measurable results, leading teams, and following through on strategic initiatives.",
    points: [
      "Extensive experience in [industry]",
      "Track record of delivering [results]",
      "Comfortable leading and managing teams",
      "Strong at strategic planning and execution",
      "Clear communicator with stakeholders at every level"
    ]
  },
  "career-changer": {
    label: "Career Changer",
    summary: "Professional moving into [industry] from a background in [field], bringing transferable skills in [skills] alongside a deliberate, self-directed effort to build relevant expertise.",
    points: [
      "Transferable experience from [field] into [industry]",
      "Self-directed learning in [skills]",
      "Track record of adapting quickly to new domains",
      "Strong foundation in collaboration and communication",
      "Motivated by [industry] and committed to the transition"
    ]
  },
  executive: {
    label: "Executive",
    summary: "Strategic executive with [X]+ years of leadership experience in [industry]. Focused on driving organizational growth, building high-performing teams, and leading through change.",
    points: [
      "Senior leadership experience in [industry]",
      "Track record of business transformation",
      "Strategic vision paired with hands-on execution",
      "Experience building and developing teams",
      "Strong stakeholder and partnership management"
    ]
  }
};

const careerPaths = [
  { id: "first-resume", label: "First Resume", icon: "🌱", note: "Starting from scratch, no work history yet" },
  { id: "internship", label: "Internship Resume", icon: "💼", note: "Coursework and projects front and center" },
  { id: "fresher", label: "Fresher Resume", icon: "🎓", note: "Just graduated, ready for a first role" },
  { id: "part-time", label: "Part-time Job", icon: "⏰", note: "Flexible roles alongside study or other work" },
  { id: "campus", label: "Campus Placement", icon: "🏛️", note: "Built for on-campus recruiting rounds" },
  { id: "graduate", label: "Graduate Resume", icon: "📜", note: "Degree-focused, entry-level positioning" }
];

const quickTips = [
  "Tailor the resume to the specific job description",
  "Use strong, specific action verbs",
  "Quantify achievements wherever you can",
  "Keep it concise — one page for most early careers",
  "Proofread carefully, then read it once more out loud",
  "Use simple, ATS-friendly formatting"
];

/* ---------------------------------------------------------
   Component
--------------------------------------------------------- */
export default function CareerCenter() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("prompts");

  // Prompts tab state
  const [selectedPrompt, setSelectedPrompt] = useState(promptsData[0]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [favorites, setFavorites] = useState(() => new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // AI generator state
  const [role, setRole] = useState("student");
  const [industry, setIndustry] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [tone, setTone] = useState("concise"); // concise | detailed
  const [generated, setGenerated] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Tips checklist state
  const [checkedTips, setCheckedTips] = useState(() => new Set());

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (activeTab === "ai") handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, tone]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleCopy = async (text, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} to clipboard`);
    } catch {
      showToast("Couldn't copy — try selecting the text manually");
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTip = (i) => {
    setCheckedTips((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(promptsData.map((p) => p.category)))],
    []
  );

  const filteredPrompts = useMemo(() => {
    return promptsData.filter((p) => {
      const matchesQuery =
        !query.trim() ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.prompt.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const matchesFavorite = !showFavoritesOnly || favorites.has(p.id);
      return matchesQuery && matchesCategory && matchesFavorite;
    });
  }, [query, categoryFilter, showFavoritesOnly, favorites]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const template = aiTemplates[role] || aiTemplates.student;
      let summary = template.summary;
      let points = [...template.points];

      const fill = (text) =>
        text
          .replace(/\[field\]/g, industry || "[field]")
          .replace(/\[industry\]/g, industry || "[industry]")
          .replace(/\[skills\]/g, skills || "[skills]")
          .replace(/\[X\]/g, experience || "[X]");

      summary = fill(summary);
      points = points.map(fill);

      if (tone === "detailed") {
        points = [
          ...points,
          "Open to relocation and flexible working arrangements where relevant",
          "Comfortable presenting work to non-technical stakeholders"
        ];
      } else {
        points = points.slice(0, 4);
      }

      setGenerated({ summary, points });
      setIsGenerating(false);
    }, 500);
  };

  const wordCount = generated ? generated.summary.trim().split(/\s+/).length : 0;
  const checkedCount = checkedTips.size;

  return (
    <div
      style={{
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "40px 24px 72px",
        background: colors.bg,
        minHeight: "100vh",
        color: colors.ink,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      <style>{`
        ${fontImport}
        .cc-btn { transition: background-color .15s ease, border-color .15s ease, color .15s ease; }
        .cc-row { transition: background-color .15s ease, border-color .15s ease; }
        .cc-fade { animation: ccFade .25s ease; }
        @keyframes ccFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ccSlide { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 720px) {
          .cc-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: colors.surfaceMuted,
            color: colors.ink,
            border: `1px solid ${colors.accent}`,
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            zIndex: 9999,
            animation: "ccSlide .25s ease"
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "8px",
          paddingBottom: "28px",
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: colors.amber, display: "inline-block" }} />
            <span style={{ color: colors.amber, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Career Center
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontWeight: 600,
              fontSize: "2.1rem",
              lineHeight: 1.15,
              margin: 0,
              color: colors.ink,
              maxWidth: "620px"
            }}
          >
            Build your{" "}
            <span style={{ background: colors.amberSoft, color: colors.amber, padding: "0 8px", borderRadius: "5px" }}>
              professional story
            </span>
          </h1>
          <p style={{ color: colors.inkSoft, fontSize: "0.95rem", marginTop: "14px", maxWidth: "480px" }}>
            Writing prompts, an AI-assisted generator, and guidance for every stage of your career.
          </p>
        </div>
        <button
          className="cc-btn"
          onClick={() => navigate("/templates")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 22px",
            borderRadius: "999px",
            border: "none",
            background: colors.cream,
            color: colors.creamInk,
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#DCD6C4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = colors.cream)}
        >
          Explore templates <span aria-hidden>→</span>
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1px",
          background: colors.border,
          margin: "0 0 32px",
          border: `1px solid ${colors.border}`,
          borderRadius: "10px",
          overflow: "hidden"
        }}
      >
        {[
          { value: promptsData.length, label: "Writing prompts" },
          { value: Object.keys(aiTemplates).length, label: "AI profiles" },
          { value: careerPaths.length, label: "Career paths" },
          { value: "12+", label: "Resume templates" }
        ].map((stat, i) => (
          <div key={i} style={{ background: colors.surface, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "1.6rem", color: colors.ink }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: colors.inkFaint, marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs — underline style, single accent */}
      <div style={{ display: "flex", gap: "24px", borderBottom: `1px solid ${colors.border}`, marginBottom: "28px" }}>
        {[
          { id: "prompts", label: "Writing prompts" },
          { id: "ai", label: "AI generator" },
          { id: "paths", label: "Career paths" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 2px 12px",
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${colors.accent}` : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab.id ? colors.ink : colors.inkFaint,
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: "0.92rem",
              cursor: "pointer",
              marginBottom: "-1px"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="cc-fade">
        {/* ---------------- Prompts Tab ---------------- */}
        {activeTab === "prompts" && (
          <div className="cc-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <div style={{ background: colors.surface, borderRadius: "12px", padding: "20px", border: `1px solid ${colors.border}` }}>
                <input
                  type="text"
                  placeholder="Search prompts…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: `1px solid ${colors.border}`,
                    fontSize: "0.88rem",
                    marginBottom: "12px",
                    outline: "none",
                    background: colors.bg,
                    color: colors.ink
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className="cc-btn"
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        border: `1px solid ${categoryFilter === cat ? colors.accent : colors.border}`,
                        background: categoryFilter === cat ? colors.accentSoft : "transparent",
                        color: categoryFilter === cat ? colors.accentBright : colors.inkSoft,
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        cursor: "pointer"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowFavoritesOnly((v) => !v)}
                    className="cc-btn"
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      border: `1px solid ${showFavoritesOnly ? colors.amber : colors.border}`,
                      background: showFavoritesOnly ? colors.amberSoft : "transparent",
                      color: showFavoritesOnly ? colors.amber : colors.inkSoft,
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                  >
                    ★ Favorites
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {filteredPrompts.length === 0 && (
                    <p style={{ color: colors.inkFaint, fontSize: "0.85rem", padding: "12px 4px" }}>
                      No prompts match — try a different search or filter.
                    </p>
                  )}
                  {filteredPrompts.map((p) => (
                    <div
                      key={p.id}
                      className="cc-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 10px",
                        borderRadius: "7px",
                        background: selectedPrompt.id === p.id ? colors.accentSoft : "transparent",
                        cursor: "pointer"
                      }}
                      onClick={() => setSelectedPrompt(p)}
                    >
                      <span>{p.icon}</span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "0.86rem",
                          color: selectedPrompt.id === p.id ? colors.accentBright : colors.ink,
                          fontWeight: selectedPrompt.id === p.id ? 600 : 500
                        }}
                      >
                        {p.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(p.id);
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          color: favorites.has(p.id) ? colors.amber : colors.borderStrong,
                          padding: "2px"
                        }}
                        aria-label="Toggle favorite"
                      >
                        ★
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  background: colors.accentSofter,
                  borderRadius: "10px",
                  padding: "14px 18px",
                  border: `1px solid ${colors.border}`,
                  fontSize: "0.82rem",
                  color: colors.inkSoft
                }}
              >
                Need something tailored to your details?{" "}
                <span
                  onClick={() => setActiveTab("ai")}
                  style={{ color: colors.accentBright, fontWeight: 600, cursor: "pointer" }}
                >
                  Try the AI generator
                </span>
                .
              </div>
            </div>

            {/* Selected prompt */}
            <div style={{ background: colors.surface, borderRadius: "12px", padding: "22px", border: `1px solid ${colors.border}`, alignSelf: "start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "1.4rem" }}>{selectedPrompt.icon}</span>
                <div>
                  <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "1.05rem", fontWeight: 600, margin: 0, color: colors.ink }}>
                    {selectedPrompt.title}
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: colors.inkFaint }}>{selectedPrompt.category}</span>
                </div>
              </div>

              <div style={{ background: colors.bg, borderRadius: "8px", padding: "16px", marginBottom: "16px", border: `1px solid ${colors.border}` }}>
                <p style={{ color: colors.ink, fontSize: "0.94rem", lineHeight: 1.6, margin: 0 }}>{selectedPrompt.prompt}</p>
              </div>

              <button
                className="cc-btn"
                onClick={() => handleCopy(selectedPrompt.prompt)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "999px",
                  border: "none",
                  background: colors.cream,
                  color: colors.creamInk,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#DCD6C4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.cream)}
              >
                Copy to clipboard
              </button>
            </div>
          </div>
        )}

        {/* ---------------- AI Generator Tab ---------------- */}
        {activeTab === "ai" && (
          <div className="cc-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ background: colors.surface, borderRadius: "12px", padding: "22px", border: `1px solid ${colors.border}` }}>
              <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "1.1rem", fontWeight: 600, marginBottom: "4px", color: colors.ink }}>
                AI content generator
              </h3>
              <p style={{ color: colors.inkSoft, fontSize: "0.85rem", marginBottom: "18px" }}>
                Fill in your details for a draft summary and supporting points.
              </p>

              <Field label="Your level">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={selectStyle}
                >
                  {Object.entries(aiTemplates).map(([key, t]) => (
                    <option key={key} value={key}>{t.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Industry / field">
                <input
                  type="text"
                  placeholder="e.g., Technology, Healthcare, Finance…"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Skills (comma separated)">
                <input
                  type="text"
                  placeholder="e.g., JavaScript, Project Management, Design…"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              {(role === "professional" || role === "executive") && (
                <Field label="Years of experience">
                  <input
                    type="text"
                    placeholder="e.g., 3, 5–7, 10+…"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    style={inputStyle}
                  />
                </Field>
              )}

              <Field label="Tone">
                <div style={{ display: "flex", gap: "8px" }}>
                  {["concise", "detailed"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className="cc-btn"
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "7px",
                        border: `1px solid ${tone === t ? colors.accent : colors.border}`,
                        background: tone === t ? colors.accentSoft : colors.surface,
                        color: tone === t ? colors.accentBright : colors.inkSoft,
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize"
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="cc-btn"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "999px",
                  border: "none",
                  background: colors.accent,
                  color: colors.white,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: isGenerating ? "default" : "pointer",
                  opacity: isGenerating ? 0.7 : 1,
                  marginTop: "6px"
                }}
              >
                {isGenerating ? "Generating…" : "Generate content"}
              </button>
            </div>

            {/* Output */}
            <div style={{ background: colors.surface, borderRadius: "12px", padding: "22px", border: `1px solid ${colors.border}`, alignSelf: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "1.02rem", fontWeight: 600, margin: 0, color: colors.ink }}>
                  Generated content
                </h3>
                {generated && (
                  <span style={{ fontSize: "0.7rem", color: colors.inkFaint }}>{wordCount} words</span>
                )}
              </div>

              {isGenerating ? (
                <p style={{ color: colors.inkFaint, fontSize: "0.88rem", padding: "20px 0" }}>Drafting your content…</p>
              ) : generated ? (
                <>
                  <div style={{ background: colors.bg, borderRadius: "8px", padding: "15px", marginBottom: "14px", border: `1px solid ${colors.border}` }}>
                    <Label>Professional summary</Label>
                    <p style={{ color: colors.ink, fontSize: "0.9rem", lineHeight: 1.6, margin: "6px 0 10px" }}>{generated.summary}</p>
                    <CopyLink onClick={() => handleCopy(generated.summary, "Summary copied")} />
                  </div>

                  <div style={{ background: colors.bg, borderRadius: "8px", padding: "15px", border: `1px solid ${colors.border}` }}>
                    <Label>Key points</Label>
                    <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 10px" }}>
                      {generated.points.map((point, i) => (
                        <li
                          key={i}
                          style={{
                            padding: "7px 0",
                            fontSize: "0.85rem",
                            color: colors.ink,
                            borderBottom: i < generated.points.length - 1 ? `1px solid ${colors.border}` : "none",
                            display: "flex",
                            gap: "8px"
                          }}
                        >
                          <span style={{ color: colors.accentBright }}>–</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <CopyLink onClick={() => handleCopy(generated.points.map((p) => `• ${p}`).join("\n"), "Points copied")} />
                  </div>
                </>
              ) : (
                <p style={{ color: colors.inkFaint, fontSize: "0.88rem", padding: "20px 0" }}>
                  Fill in your details and generate to see a draft here.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---------------- Career Paths Tab ---------------- */}
        {activeTab === "paths" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" }}>
              {careerPaths.map((path) => (
                <div
                  key={path.id}
                  onClick={() => navigate("/templates")}
                  className="cc-row"
                  style={{
                    background: colors.surface,
                    borderRadius: "10px",
                    padding: "20px",
                    border: `1px solid ${colors.border}`,
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
                >
                  <div style={{ fontSize: "1.7rem", marginBottom: "8px" }}>{path.icon}</div>
                  <h4 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "0.98rem", fontWeight: 600, margin: "0 0 4px", color: colors.ink }}>
                    {path.label}
                  </h4>
                  <p style={{ fontSize: "0.78rem", color: colors.inkFaint, margin: 0 }}>{path.note}</p>
                  <span style={{ display: "inline-block", marginTop: "10px", fontSize: "0.75rem", color: colors.accentBright, fontWeight: 600 }}>
                    View templates
                  </span>
                </div>
              ))}
            </div>

            {/* Tips as a checklist */}
            <div style={{ marginTop: "20px", background: colors.surface, borderRadius: "10px", padding: "20px 22px", border: `1px solid ${colors.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "0.98rem", fontWeight: 600, margin: 0, color: colors.ink }}>
                  Before you submit
                </h4>
                <span style={{ fontSize: "0.75rem", color: colors.inkFaint }}>{checkedCount}/{quickTips.length} done</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "6px" }}>
                {quickTips.map((tip, i) => (
                  <label
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "8px 10px",
                      background: colors.bg,
                      borderRadius: "7px",
                      fontSize: "0.83rem",
                      color: checkedTips.has(i) ? colors.inkFaint : colors.ink,
                      textDecoration: checkedTips.has(i) ? "line-through" : "none",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checkedTips.has(i)}
                      onChange={() => toggleTip(i)}
                      style={{ accentColor: colors.accent, width: "15px", height: "15px" }}
                    />
                    {tip}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Small local components
--------------------------------------------------------- */
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: colors.inkSoft, marginBottom: "5px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: colors.inkFaint, textTransform: "uppercase", letterSpacing: "0.02em" }}>
      {children}
    </span>
  );
}

function CopyLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="cc-btn"
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        color: colors.inkSoft,
        borderRadius: "6px",
        padding: "5px 12px",
        fontSize: "0.72rem",
        cursor: "pointer"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
    >
      Copy
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "7px",
  border: `1px solid ${colors.border}`,
  fontSize: "0.88rem",
  outline: "none",
  background: colors.bg,
  color: colors.ink
};

const selectStyle = { ...inputStyle, cursor: "pointer" };