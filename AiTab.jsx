import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Key, Settings, RefreshCw } from 'lucide-react';
import { askAdvisor } from '../utils/aiAdvisor';

export default function AiTab({
  chat = [],
  setChat,
  chatInput,
  setChatInput,
  chatBusy,
  setChatBusy,
  contextSummary,
  settings = {},
  setSettings
}) {
  const [showConfig, setShowConfig] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, chatBusy]);

  const handleSend = async (textToSend = chatInput) => {
    const text = (textToSend || '').trim();
    if (!text || chatBusy) return;

    const userMsg = { role: 'user', text };
    setChat((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatBusy(true);

    const summary = contextSummary ? contextSummary() : '';
    const reply = await askAdvisor(text, summary, settings);

    setChat((prev) => [...prev, { role: 'assistant', text: reply }]);
    setChatBusy(false);
  };

  const PRESET_PROMPTS = [
    '🧘 Pose yoga untuk pegal punggung bawah & pinggul',
    '🥗 Menu makanan Sattvic ringan 30 menit sebelum latihan',
    '✨ Evaluasi dan saran ritme harian berdasarkan jadwal saya',
    '🌬️ Teknik Pranayama untuk menenangkan pikiran sebelum tidur'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '26px' }}>Penasehat AI SADHANA</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>
            Konsultasi holistic gabungan Instruktur Yoga, Ahli Nutrisi, dan Fisioterapi.
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={() => setShowConfig(!showConfig)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
        >
          <Key size={14} /> {settings.apiKey ? 'API Key Terpasang' : 'Pengaturan API'}
        </button>
      </div>

      {/* Optional API Key Configuration Panel */}
      {showConfig && (
        <div className="sadhana-card gold-border animate-fade-in">
          <h3 style={{ fontSize: '15px', color: 'var(--accent-gold)', marginBottom: '10px' }}>
            🔑 Pengaturan Penyedia AI (Opsional)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '14px' }}>
            Aplikasi dilengkapi Mesin Rekomendasi Pintar offline secara default. Anda juga dapat memasukkan API Key pribadi (Google Gemini / Anthropic) untuk kecerdasan AI berbasis cloud secara langsung.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <select
              className="sadhana-select"
              value={settings.aiProvider || 'gemini'}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
            >
              <option value="gemini">Google Gemini API</option>
              <option value="anthropic">Anthropic Claude API</option>
            </select>

            <input
              type="password"
              className="sadhana-input font-mono"
              placeholder="Tempel API Key di sini (opsional)..."
              value={settings.apiKey || ''}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      <div
        className="sadhana-card"
        style={{
          minHeight: '440px',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          padding: '20px'
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px' }}>
          {chat.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto 0', padding: '32px 16px', color: 'var(--text-dim)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Apa yang ingin Anda tanyakan hari ini?</h3>
              <p style={{ fontSize: '13px', marginTop: '6px', maxWidth: '440px', margin: '6px auto 0' }}>
                Tanyakan seputar pose yoga yang aman, asupan nutrisi sebelum/sesudah latihan, atau cara mengoptimalkan energi harian Anda.
              </p>
            </div>
          )}

          {chat.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {!isUser && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gold-glow)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', flexShrink: 0 }}>
                    <Bot size={16} />
                  </div>
                )}

                <div
                  style={{
                    background: isUser ? 'rgba(230, 180, 80, 0.15)' : 'rgba(10, 22, 17, 0.6)',
                    border: isUser ? '1px solid rgba(230, 180, 80, 0.3)' : '1px solid var(--surface-border)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.text}
                </div>

                {isUser && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-sage-glow)', border: '1px solid var(--accent-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sage)', flexShrink: 0 }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {chatBusy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px' }}>
              <RefreshCw size={14} className="animate-spin" /> Penasehat sedang menganalisis & mengetik...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Preset Chips */}
        {chat.length === 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '12px' }}>
            {PRESET_PROMPTS.map((p, i) => (
              <button
                key={i}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => handleSend(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--surface-border)' }}>
          <input
            type="text"
            className="sadhana-input"
            placeholder="Tuliskan pertanyaan seputar yoga, nutrisi, atau pemulihan..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="btn-primary"
            onClick={() => handleSend()}
            disabled={chatBusy || !chatInput.trim()}
          >
            <Send size={16} /> Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
