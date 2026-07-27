import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  CalendarDays,
  Utensils,
  Activity,
  MessageCircle,
  Link2,
  Sparkles,
  Flame,
  Menu,
  X
} from 'lucide-react';

import { loadStorage, saveStorage, STORAGE_KEYS } from './utils/storage';
import { pushToSheet } from './utils/sheetSync';
import { askAdvisor, SYSTEM_PROMPT } from './utils/aiAdvisor';

import Dashboard from './components/Dashboard';
import ScheduleTab from './components/ScheduleTab';
import DietTab from './components/DietTab';
import LogTab from './components/LogTab';
import AiTab from './components/AiTab';
import SyncTab from './components/SyncTab';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const getTodayName = () => {
  const idx = new Date().getDay(); // 0=Sunday
  return DAYS[(idx + 6) % 7];
};
const generateId = () => Math.random().toString(36).slice(2, 10);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App States
  const [schedule, setSchedule] = useState([]);
  const [diet, setDiet] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ webhookUrl: '', apiKey: '', aiProvider: 'gemini' });

  // AI Chat & Advice State
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [dailyInsight, setDailyInsight] = useState('');
  const [insightBusy, setInsightBusy] = useState(false);

  // Initial Data Loading from Storage
  useEffect(() => {
    const loadedSchedule = loadStorage(STORAGE_KEYS.SCHEDULE, []);
    const loadedDiet = loadStorage(STORAGE_KEYS.DIET, []);
    const loadedLogs = loadStorage(STORAGE_KEYS.LOGS, []);
    const loadedSettings = loadStorage(STORAGE_KEYS.SETTINGS, { webhookUrl: '', apiKey: '', aiProvider: 'gemini' });
    const loadedChat = loadStorage(STORAGE_KEYS.CHAT_HISTORY, []);

    setSchedule(loadedSchedule);
    setDiet(loadedDiet);
    setLogs(loadedLogs);
    setSettings(loadedSettings);
    setChat(loadedChat);
    setLoading(false);
  }, []);

  // Save changes to localStorage
  useEffect(() => { if (!loading) saveStorage(STORAGE_KEYS.SCHEDULE, schedule); }, [schedule, loading]);
  useEffect(() => { if (!loading) saveStorage(STORAGE_KEYS.DIET, diet); }, [diet, loading]);
  useEffect(() => { if (!loading) saveStorage(STORAGE_KEYS.LOGS, logs); }, [logs, loading]);
  useEffect(() => { if (!loading) saveStorage(STORAGE_KEYS.SETTINGS, settings); }, [settings, loading]);
  useEffect(() => { if (!loading) saveStorage(STORAGE_KEYS.CHAT_HISTORY, chat); }, [chat, loading]);

  // Context Summary for AI Advisor
  const contextSummary = useCallback(() => {
    const today = getTodayName();
    const todaySchedule = schedule.filter((s) => s.day === today);
    const todayDiet = diet.filter((d) => d.day === today);
    const recentLogs = logs.slice(-7);

    return `Hari ini: ${today}.
Jadwal latihan hari ini: ${todaySchedule.map(s => `${s.time} ${s.jenis} (${s.durasi} menit)`).join('; ') || 'tidak ada'}.
Rencana makan hari ini: ${todayDiet.map(d => `${d.slot} ${d.time}: ${d.menu}`).join('; ') || 'tidak ada'}.
Log aktivitas 7 catatan terakhir: ${recentLogs.map(l => `${l.date} ${l.jenis} ${l.durasi}mnt energi:${l.energi}/5`).join('; ') || 'belum ada log'}.`;
  }, [schedule, diet, logs]);

  // Get Daily Insight Advice
  const getDailyInsight = async () => {
    setInsightBusy(true);
    const summary = contextSummary();
    const reply = await askAdvisor(
      'Berikan rekomendasi ritme harian singkat (maksimal 4 poin) untuk hari ini mencakup latihan yoga, asupan nutrisi, dan pemulihan tubuh berdasarkan jadwal & log saya.',
      summary,
      settings
    );
    setDailyInsight(reply);
    setInsightBusy(false);
  };

  /* ---------------- Handler Actions ---------------- */
  const addSchedule = (item) => {
    const withId = { ...item, id: generateId() };
    setSchedule((prev) => [...prev, withId]);
    pushToSheet(settings.webhookUrl, 'Jadwal', 'append', withId);
  };

  const removeSchedule = (id) => {
    setSchedule((prev) => prev.filter((x) => x.id !== id));
  };

  const addDiet = (item) => {
    const withId = { ...item, id: generateId() };
    setDiet((prev) => [...prev, withId]);
    pushToSheet(settings.webhookUrl, 'PolaMakan', 'append', withId);
  };

  const removeDiet = (id) => {
    setDiet((prev) => prev.filter((x) => x.id !== id));
  };

  const addLog = (item) => {
    const withId = { ...item, id: generateId() };
    setLogs((prev) => [...prev, withId]);
    pushToSheet(settings.webhookUrl, 'Aktivitas', 'append', withId);
  };

  const removeLog = (id) => {
    setLogs((prev) => prev.filter((x) => x.id !== id));
  };

  const syncAll = async () => {
    if (!settings.webhookUrl) return { ok: false, error: 'URL Web App belum disetel' };
    await pushToSheet(settings.webhookUrl, 'Jadwal', 'replace_all', schedule);
    await pushToSheet(settings.webhookUrl, 'PolaMakan', 'replace_all', diet);
    await pushToSheet(settings.webhookUrl, 'Aktivitas', 'replace_all', logs);
    return { ok: true };
  };

  // Calculate Streak
  const today = getTodayName();
  const streak = (() => {
    let count = 0;
    const dateSet = new Set(logs.map((l) => l.date));
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (dateSet.has(dateStr)) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  })();

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Beranda', icon: Sun },
    { id: 'jadwal', label: 'Jadwal Latihan', icon: CalendarDays },
    { id: 'makan', label: 'Pola Makan', icon: Utensils },
    { id: 'log', label: 'Log Aktivitas', icon: Activity },
    { id: 'ai', label: 'Penasehat AI', icon: MessageCircle },
    { id: 'sync', label: 'Sinkronisasi', icon: Link2 }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-dim)' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={32} className="animate-spin" color="var(--accent-gold)" style={{ margin: '0 auto 12px' }} />
          <p className="font-serif" style={{ fontSize: '18px', color: 'var(--text-main)' }}>Memuat SADHANA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div>
          <div className="brand-header">
            <div className="brand-icon">
              <Sun size={20} />
            </div>
            <div>
              <div className="brand-title">SADHANA</div>
              <div className="brand-subtitle">Yoga & Mindful Life</div>
            </div>
          </div>

          <nav>
            <ul className="nav-list">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    className={`nav-item ${activeTab === id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer info inside sidebar */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--surface-border)', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontSize: '13px' }}>
            <Flame size={16} /> <span className="font-serif" style={{ fontWeight: '600' }}>{streak} Hari Beruntun</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Vercel Ready • Cloud Dual Sync
          </p>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="app-content animate-fade-in">
        {activeTab === 'dashboard' && (
          <Dashboard
            today={today}
            schedule={schedule}
            diet={diet}
            logs={logs}
            streak={streak}
            dailyInsight={dailyInsight}
            insightBusy={insightBusy}
            getDailyInsight={getDailyInsight}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'jadwal' && (
          <ScheduleTab schedule={schedule} onAdd={addSchedule} onRemove={removeSchedule} />
        )}
        {activeTab === 'makan' && (
          <DietTab diet={diet} onAdd={addDiet} onRemove={removeDiet} />
        )}
        {activeTab === 'log' && (
          <LogTab logs={logs} onAdd={addLog} onRemove={removeLog} />
        )}
        {activeTab === 'ai' && (
          <AiTab
            chat={chat}
            setChat={setChat}
            chatInput={chatInput}
            setChatInput={setChatInput}
            chatBusy={chatBusy}
            setChatBusy={setChatBusy}
            contextSummary={contextSummary}
            settings={settings}
            setSettings={setSettings}
          />
        )}
        {activeTab === 'sync' && (
          <SyncTab settings={settings} setSettings={setSettings} syncAll={syncAll} />
        )}
      </main>
    </div>
  );
}
