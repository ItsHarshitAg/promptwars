import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types';
import { askConcierge } from '../utils/concierge';
import SendIcon from '@mui/icons-material/Send';
import { useCrowd } from '../hooks/useCrowd';

const DEBOUNCE_MS = 300;

export const ConciergeChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am StadiumAI. How can I help you navigate the stadium today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { zones } = useCrowd();
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

  return (
    <section aria-label="AI Concierge Chat" style={{ display: 'flex', flexDirection: 'column', height: '400px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {messages.map((msg, idx) => (
          <div key={`${msg.timestamp}-${idx}`} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{
              background: msg.role === 'user' ? '#1976d2' : '#f5f5f5',
              color: msg.role === 'user' ? '#fff' : '#000',
              padding: '12px',
              borderRadius: '8px'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ alignSelf: 'flex-start', padding: '12px' }}>Thinking...</div>}
        <div ref={bottomRef} />
      </div>
      {error && <p role="alert" style={{ color: '#c62828', padding: '0 16px', margin: 0 }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '8px', borderTop: '1px solid #ddd' }}>
        <label htmlFor="concierge-input" className="sr-only">Message to StadiumAI</label>
        <input
          id="concierge-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about queues, food, or seats..."
          aria-label="Message to StadiumAI"
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          style={{ marginLeft: '8px', padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          <SendIcon aria-hidden="true" />
        </button>
      </form>
    </section>
  );
};
