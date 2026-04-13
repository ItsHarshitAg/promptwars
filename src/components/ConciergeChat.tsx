import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types';
import { askConcierge } from '../utils/concierge';
import { useCrowd } from '../hooks/useCrowd';

const DEBOUNCE_MS = 300;

const SUGGESTIONS = [
  "Where's the shortest food queue?",
  "Which gate is least crowded?",
  "Nearest restroom with no wait?",
] as const;

export const ConciergeChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am StadiumAI. How can I help you navigate the stadium today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { zones, lastUpdated } = useCrowd();
  const bottomRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const reply = await askConcierge(text, zones);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
    } catch {
      const errMsg = 'Sorry, I am having trouble connecting right now.';
      setError(errMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }, [loading, zones]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      sendMessage(input);
    }, DEBOUNCE_MS);
  }, [input, sendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const showSuggestions = messages.length === 1 && messages[0].role === 'assistant';
  const fmt = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            aria-hidden="true"
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(0,169,157,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 500, color: '#00A99D',
            }}
          >AI</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-h)' }}>StadiumAI</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Powered by Gemini</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(39,161,72,0.12)', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#27A148' }}>
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#27A148' }} />
          Live venue data
        </div>
      </div>

      {/* ── Suggested questions ── */}
      {showSuggestions && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Try asking:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                aria-label={`Ask: ${q}`}
                style={{
                  fontSize: 13,
                  border: '0.5px solid var(--border-color)',
                  borderRadius: 99,
                  padding: '6px 14px',
                  background: 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat area ── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{
          background: 'var(--surface-alt)',
          borderRadius: 12,
          padding: 16,
          minHeight: 260,
          maxHeight: 'min(460px, 50vh)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={`${msg.timestamp}-${idx}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {msg.role === 'assistant' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 'min(72%, 480px)' }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(0,169,157,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 500, color: '#00A99D',
                  }}
                >AI</div>
                <div>
                  <div style={{
                    background: 'var(--surface)',
                    border: '0.5px solid var(--border-color)',
                    borderRadius: '2px 12px 12px 12px',
                    padding: '10px 14px',
                    fontSize: 14,
                    color: 'var(--text)',
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{fmt(msg.timestamp)}</div>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 'min(72%, 480px)' }}>
                <div style={{
                  background: '#185FA5',
                  color: '#ffffff',
                  borderRadius: '12px 12px 2px 12px',
                  padding: '10px 14px',
                  fontSize: 14,
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
                  {fmt(msg.timestamp)}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div
              aria-hidden="true"
              style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(0,169,157,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 500, color: '#00A99D',
              }}
            >AI</div>
            <div style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--border-color)',
              borderRadius: '2px 12px 12px 12px',
              padding: '14px 16px',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}>
              <span className="typing-dot" style={{ animationDelay: '0s' }} aria-hidden="true" />
              <span className="typing-dot" style={{ animationDelay: '0.15s' }} aria-hidden="true" />
              <span className="typing-dot" style={{ animationDelay: '0.3s' }} aria-hidden="true" />
              <span className="sr-only">StadiumAI is typing…</span>
            </div>
          </div>
        )}

        {error && <p role="alert" style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <label htmlFor="concierge-input" className="sr-only">Message to StadiumAI</label>
        <input
          id="concierge-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about queues, food, or your seat..."
          aria-label="Message to StadiumAI"
          style={{
            flex: 1,
            height: 44,
            padding: '0 14px',
            borderRadius: 8,
            border: '0.5px solid var(--border-color)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            flexShrink: 0,
            background: '#185FA5',
            border: 'none',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading || !input.trim() ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>

      {/* ── Context strip ── */}
      <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: 'var(--muted)' }}>
        Sending live data for {zones.length} zones
        {lastUpdated && ` · last updated ${lastUpdated.toLocaleTimeString()}`}
      </div>

    </div>
  );
};

