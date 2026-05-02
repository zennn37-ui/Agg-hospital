import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, AlertCircle, RefreshCw, Zap, Heart, Thermometer } from 'lucide-react';
import api from '../../utils/api';

const SUGGESTIONS = [
  'What does my blood pressure reading mean?',
  'Are there drug interactions in my medications?',
  'What foods should I avoid with my conditions?',
  'Explain my medication schedule',
  'When should I go to the emergency room?',
  'What are signs of low blood sugar?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AGG Hospital AI Health Assistant. I have access to your medical records and can provide personalized health guidance. How can I help you today?\n\n_Note: I provide health information only. Always consult your doctor for medical decisions._', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: userText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(1).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const res = await api.post('/ai/chat', { message: userText, conversationHistory: history });
      const reply = res.data.data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: new Date(), demo: res.data.data.usage?.demo }]);
    } catch (err) {
      setError('Failed to get a response. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally { setLoading(false); }
  };

  const formatContent = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>{line.startsWith('_') && line.endsWith('_') ? <em style={{ color: 'var(--text-muted)', fontSize: 12 }}>{line.slice(1, -1)}</em> : line}<br /></span>
    ));
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - var(--topbar-height) - 56px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b2a, #0a3d52)', borderRadius: 16, padding: '18px 24px', border: '1px solid rgba(5,191,219,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(5,191,219,0.2)', border: '1px solid rgba(5,191,219,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={26} color="#05bfdb" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>AGG AI Health Assistant</span>
              <span style={{ background: 'linear-gradient(135deg, #05bfdb, #00d4aa)', color: '#fff', fontSize: 9.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>POWERED BY GPT</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>Personalized health guidance based on your medical records</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ icon: Heart, label: 'Records', color: '#ef4444' }, { icon: Thermometer, label: 'Vitals', color: '#f59e0b' }, { icon: Zap, label: 'AI', color: '#05bfdb' }].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 10 }}>
              <item.icon size={16} color={item.color} style={{ display: 'block', margin: '0 auto 3px' }} />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="alert alert-warning" style={{ flexShrink: 0 }}>
        <AlertCircle size={15} color="#92400e" />
        <p><strong>Medical Disclaimer:</strong> AI responses are informational only. Always consult your doctor for medical decisions.</p>
      </div>

      {/* Chat window */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #0d1b2a, #0a3d52)', border: '1px solid rgba(5,191,219,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Brain size={16} color="#05bfdb" />
                </div>
              )}
              <div style={{ maxWidth: '74%' }}>
                <div style={{ padding: '13px 16px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : '#f8fafc', border: msg.role === 'assistant' ? '1px solid var(--border-light)' : 'none', color: msg.role === 'user' ? '#fff' : 'var(--text-primary)', fontSize: 14, lineHeight: 1.65 }}>
                  {formatContent(msg.content)}
                  {msg.demo && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: 6 }}>⚡ Demo mode — add OPENAI_API_KEY for full AI responses</div>}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.role === 'user' && (
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 11, fontWeight: 700 }}>Me</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #0d1b2a, #0a3d52)', border: '1px solid rgba(5,191,219,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Brain size={16} color="#05bfdb" />
              </div>
              <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#05bfdb', animation: `pulse 1.2s ${i*0.3}s infinite` }} />)}
              </div>
            </div>
          )}
          {error && <div className="alert alert-danger" style={{ borderRadius: 10 }}><AlertCircle size={15} /><span>{error}</span></div>}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} disabled={loading} style={{ background: 'var(--primary-lighter)', color: 'var(--primary)', border: '1px solid rgba(10,77,104,0.15)', borderRadius: 20, padding: '5px 13px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#d0e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-lighter)'}
            >{s}</button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your health, medications, symptoms..."
            disabled={loading}
            style={{ flex: 1, padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, outline: 'none', color: 'var(--text-primary)', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 46, height: 46, borderRadius: 12, border: 'none', background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--primary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 2px 10px rgba(10,77,104,0.3)', transition: 'all 0.2s' }}>
            <Send size={18} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
