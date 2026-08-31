import { useState } from 'react';
import Button from '../ui/Button';

const ACTIONS = [
  { id: 'improve_summary', label: 'Improve Summary', icon: '✨', description: 'Rewrite your summary to be more impactful and ATS-friendly', prompt: 'improve summary' },
  { id: 'rewrite_bullets', label: 'Strengthen Bullets', icon: '💪', description: 'Rewrite experience bullets with stronger action verbs and metrics', prompt: 'rewrite bullets' },
  { id: 'generate_summary', label: 'Generate Summary', icon: '🤖', description: 'Generate a professional summary from your experience', prompt: 'generate summary' },
  { id: 'suggest_skills', label: 'Suggest Skills', icon: '🎯', description: 'Get skill suggestions based on your role and experience', prompt: 'suggest skills' },
  { id: 'ats_optimize', label: 'ATS Optimize', icon: '📊', description: 'Optimize your content for applicant tracking systems', prompt: 'ats optimize' },
  { id: 'project_desc', label: 'Describe Project', icon: '🚀', description: 'Generate a compelling project description', prompt: 'project description' },
];

const MOCK_RESPONSES = {
  improve_summary: 'Results-driven Senior Software Engineer with 6+ years architecting high-throughput distributed systems at scale. Proven track record delivering 40% cost reduction and 99.97% uptime across 500K TPS payment infrastructure. Led cross-functional teams of 10+ engineers; passionate about developer experience, clean architecture, and building systems that last.',
  rewrite_bullets: '• Engineered high-throughput event processing pipeline handling 500K transactions/second, achieving 62% latency reduction and saving $2.4M annually\n• Spearheaded monolith-to-microservices migration for 3 core services, accelerating deployment frequency 3× and reducing infrastructure costs by 40%\n• Established engineering excellence culture by mentoring 6 engineers and implementing automated testing framework, reducing production incidents 35%',
  generate_summary: 'Senior Software Engineer with deep expertise in distributed systems, cloud infrastructure, and full-stack web development. Known for turning complex technical challenges into elegant, scalable solutions. Effective communicator who bridges the gap between engineering and business objectives.',
  suggest_skills: 'Based on your experience as a Senior Software Engineer, consider adding: **System Design**, **Technical Leadership**, **Distributed Systems**, **API Design**, **Performance Optimization**, **CI/CD**, **Observability**, **gRPC**, **Event-Driven Architecture**',
  ats_optimize: 'Your resume has been optimized for ATS systems. Key improvements: Added industry-standard keywords ("distributed systems", "microservices", "cloud infrastructure"), quantified achievements with specific metrics, standardized date formats, and ensured clean formatting without tables or columns in the main content area.',
  project_desc: 'OpenCache is a production-grade distributed caching library for Node.js, featuring automatic consistent hashing for horizontal sharding, LRU eviction with configurable TTL, and zero-dependency core. Achieves sub-millisecond read latency with 99th percentile under 2ms. Used in production by 50+ companies handling 100M+ cache operations daily.',
};

export default function AIAssistant({ onInsert }) {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [chat, setChat] = useState([
    { role: 'ai', text: "Hi! I'm your AI resume assistant. I can help you improve your resume content, suggest keywords, optimize for ATS systems, and more. What would you like help with?" }
  ]);
  const [input, setInput] = useState('');
  const runAction = async (action) => {
    setLoading(action.id);
    setResult(null);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const text = MOCK_RESPONSES[action.id] || 'Here is an improved version of your content with stronger action verbs, quantifiable achievements, and ATS-friendly keywords integrated naturally throughout.';
    setResult({ action: action.label, text });
    setLoading(null);
  };

  const sendChat = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const responses = [
      "Great question! Here's how I'd improve that section: focus on quantifiable achievements, use strong action verbs at the start of each bullet, and make sure to include industry-specific keywords that match the job description.",
      "I'd recommend restructuring this to lead with your most impressive achievement. Hiring managers spend only 7 seconds on initial resume review, so your strongest points should appear first.",
      "For better ATS compatibility, avoid graphics, tables, and text boxes. Use standard section headers and ensure your contact information is in plain text at the top.",
      "Consider adding metrics to this bullet point — even approximate numbers (\"improved performance by ~40%\" or \"managed team of 5 engineers\") significantly increase credibility and impact.",
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    setChat(prev => [...prev, { role: 'ai', text: response }]);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          {ACTIONS.map(action => (
            <button
              key={action.id}
              onClick={() => runAction(action)}
              disabled={loading !== null}
              className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--secondary)] transition-all text-left group disabled:opacity-50"
            >
              <span className="text-xl flex-shrink-0">{loading === action.id ? '⏳' : action.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{action.label}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{action.description}</p>
              </div>
              {loading === action.id && <span className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="border border-[var(--accent)] rounded-xl p-4 bg-[var(--card)] animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[var(--accent)]">✨ {result.action}</p>
            <button onClick={() => setResult(null)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
          </div>
          <p className="text-sm text-[var(--foreground)] whitespace-pre-line leading-relaxed">{result.text}</p>
          {onInsert && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => { onInsert(result.text); setResult(null); }}>Apply to Resume</Button>
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(result.text)}>Copy</Button>
            </div>
          )}
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Ask AI</h3>
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[120px] max-h-64 pr-1">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--foreground)]'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
            placeholder="Ask about improving your resume..."
            className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <Button size="sm" onClick={sendChat}>Send</Button>
        </div>
      </div>
    </div>
  );
}
