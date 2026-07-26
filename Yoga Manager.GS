import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sun, Moon, Utensils, Activity, MessageCircle, Settings,
  Plus, Trash2, Check, Send, Sparkles, CalendarDays, Flame,
  ChevronRight, X, Link2, RefreshCw
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const FONT_IMPORT_ID = "yoga-fonts";
function ensureFonts() {
  if (document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const MEAL_SLOTS = ["Sarapan", "Makan Siang", "Makan Malam", "Camilan"];
const todayName = () => {
  const idx = new Date().getDay(); // 0=Sun
  return DAYS[(idx + 6) % 7];
};
const uid = () => Math.random().toString(36).slice(2, 10);
const timeToMinutes = (t) => {
  const [h, m] = (t || "06:00").split(":").map(Number);
  return h * 60 + (m || 0);
};

/* ---------------------------------------------------------
   STORAGE HELPERS
--------------------------------------------------------- */
async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    if (res && res.value) return JSON.parse(res.value);
    return fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("storage set failed", key, e);
  }
}

/* ---------------------------------------------------------
   AI CALL (Claude via Anthropic API in artifact)
--------------------------------------------------------- */
async function askAdvisor(systemPrompt, userText) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userText }],
      }),
    });
    const data = await response.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return text || "Maaf, saya tidak bisa memberi jawaban saat ini.";
  } catch (e) {
    return "Terjadi kendala menghubungi penasehat AI. Coba lagi sebentar lagi.";
  }
}

/* ---------------------------------------------------------
   SYNC TO GOOGLE SHEET (via Apps Script Web App webhook)
--------------------------------------------------------- */
async function pushToSheet(webhookUrl, sheet, action, data) {
  if (!webhookUrl) return { ok: false, skipped: true };
  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ sheet, action, data }),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* ---------------------------------------------------------
   SUN ARC (signature visual)
--------------------------------------------------------- */
function SunArc({ schedule, diet, day }) {
  const W = 640, H = 200;
  const startMin = 4 * 60, endMin = 22 * 60; // 04:00 - 22:00
  const cx = W / 2, cy = H - 10, r = 260;

  const posFor = (minutes) => {
    const clamped = Math.min(Math.max(minutes, startMin), endMin);
    const t = (clamped - startMin) / (endMin - startMin); // 0..1
    const angle = Math.PI - t * Math.PI; // pi -> 0
    return {
      x: cx + r * Math.cos(angle) * 0.98,
      y: cy - r * Math.sin(angle) * 0.98,
    };
  };

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowPos = posFor(nowMin);

  const items = [
    ...schedule.filter((s) => s.day === day).map((s) => ({ ...s, kind: "asana" })),
    ...diet.filter((d) => d.day === day).map((d) => ({ ...d, kind: "meal" })),
  ];

  const arcPath = () => {
    const p0 = posFor(startMin);
    const p1 = posFor(endMin);
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <path d={arcPath()} fill="none" stroke="var(--surface-2)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      {[6, 9, 12, 15, 18, 21].map((h) => {
        const p = posFor(h * 60);
        return (
          <text key={h} x={p.x} y={p.y + 16} textAnchor="middle" fontSize="10" fill="var(--text-dim)" fontFamily="JetBrains Mono, monospace">
            {String(h).padStart(2, "0")}
          </text>
        );
      })}
      {items.map((it) => {
        const p = posFor(timeToMinutes(it.time));
        const color = it.kind === "asana" ? "var(--accent-sage)" : "var(--accent-gold)";
        return (
          <g key={it.id}>
            <circle cx={p.x} cy={p.y} r="6" fill={color} opacity="0.9" />
            <circle cx={p.x} cy={p.y} r="10" fill={color} opacity="0.15" />
          </g>
        );
      })}
      <g transform={`translate(${nowPos.x}, ${nowPos.y})`}>
        <circle r="9" fill="var(--accent-gold)" />
        <circle r="14" fill="var(--accent-gold)" opacity="0.25" />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */
function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--surface-2)",
      borderRadius: 14,
      padding: 18,
      ...style,
    }}>
      {children}
    </div>
  );
}

function IconBtn({ onClick, children, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "transparent",
        border: "1px solid var(--surface-2)",
        borderRadius: 8,
        color: danger ? "var(--danger)" : "var(--text-dim)",
        width: 32, height: 32,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-dim)", fontFamily: "Inter, sans-serif" }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--surface-2)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "var(--text)",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  outline: "none",
};

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */
export default function YogaManager() {
  useEffect(() => { ensureFonts(); }, []);

  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [schedule, setSchedule] = useState([]);
  const [diet, setDiet] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ webhookUrl: "", name: "" });

  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [dailyInsight, setDailyInsight] = useState("");
  const [insightBusy, setInsightBusy] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [s, d, l, st] = await Promise.all([
        loadKey("yoga_schedule", []),
        loadKey("yoga_diet", []),
        loadKey("yoga_logs", []),
        loadKey("yoga_settings", { webhookUrl: "", name: "" }),
      ]);
      setSchedule(s); setDiet(d); setLogs(l); setSettings(st);
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) saveKey("yoga_schedule", schedule); }, [schedule, loading]);
  useEffect(() => { if (!loading) saveKey("yoga_diet", diet); }, [diet, loading]);
  useEffect(() => { if (!loading) saveKey("yoga_logs", logs); }, [logs, loading]);
  useEffect(() => { if (!loading) saveKey("yoga_settings", settings); }, [settings, loading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, chatBusy]);

  const contextSummary = useCallback(() => {
    const today = todayName();
    const todaySchedule = schedule.filter((s) => s.day === today);
    const todayDiet = diet.filter((d) => d.day === today);
    const recentLogs = logs.slice(-7);
    return `Hari ini: ${today}.
Jadwal latihan hari ini: ${todaySchedule.map(s => `${s.time} ${s.jenis} (${s.durasi} menit)`).join("; ") || "tidak ada"}.
Rencana makan hari ini: ${todayDiet.map(d => `${d.slot} ${d.time}: ${d.menu}`).join("; ") || "tidak ada"}.
Log aktivitas 7 catatan terakhir: ${recentLogs.map(l => `${l.date} ${l.jenis} ${l.durasi}mnt energi:${l.energi}/5`).join("; ") || "belum ada log"}.
Jadwal mingguan lengkap: ${schedule.map(s => `${s.day} ${s.time} ${s.jenis}`).join("; ") || "kosong"}.`;
  }, [schedule, diet, logs]);

  const SYSTEM_PROMPT = `Kamu adalah tim penasehat kesehatan pribadi untuk seorang praktisi yoga, terdiri dari tiga peran sekaligus: (1) ahli kesehatan tubuh, (2) instruktur olahraga/yoga berpengalaman, (3) ahli gizi.
Berikan saran yang praktis, aman, spesifik untuk yoga dan aktivitas fisik terkait, serta pola makan yang mendukung latihan (waktu makan sebelum/sesudah latihan, hidrasi, pemulihan otot).
Gunakan Bahasa Indonesia yang hangat namun profesional. Jangan memberi diagnosis medis pasti; sarankan konsultasi ke dokter/ahli gizi berlisensi untuk keluhan serius.
Jawaban ringkas, terstruktur dengan poin-poin bila perlu, dan langsung actionable.`;

  const sendChat = async () => {
    if (!chatInput.trim() || chatBusy) return;
    const userMsg = { role: "user", text: chatInput.trim() };
    setChat((c) => [...c, userMsg]);
    setChatInput("");
    setChatBusy(true);
    const reply = await askAdvisor(SYSTEM_PROMPT, `${contextSummary()}\n\nPertanyaan pengguna: ${userMsg.text}`);
    setChat((c) => [...c, { role: "assistant", text: reply }]);
    setChatBusy(false);
  };

  const getDailyInsight = async () => {
    setInsightBusy(true);
    const reply = await askAdvisor(
      SYSTEM_PROMPT,
      `${contextSummary()}\n\nBerikan saran harian singkat (maks 5 poin) untuk hari ini: apa yang perlu diperhatikan pada latihan yoga, pola makan, dan pemulihan, berdasarkan jadwal dan log di atas.`
    );
    setDailyInsight(reply);
    setInsightBusy(false);
  };

  /* ---------------- Schedule handlers ---------------- */
  const addSchedule = (item) => {
    const withId = { ...item, id: uid() };
    setSchedule((s) => [...s, withId]);
    pushToSheet(settings.webhookUrl, "Jadwal", "append", withId);
  };
  const removeSchedule = (id) => setSchedule((s) => s.filter((x) => x.id !== id));

  const addDiet = (item) => {
    const withId = { ...item, id: uid() };
    setDiet((d) => [...d, withId]);
    pushToSheet(settings.webhookUrl, "PolaMakan", "append", withId);
  };
  const removeDiet = (id) => setDiet((d) => d.filter((x) => x.id !== id));

  const addLog = (item) => {
    const withId = { ...item, id: uid() };
    setLogs((l) => [...l, withId]);
    pushToSheet(settings.webhookUrl, "Aktivitas", "append", withId);
  };
  const removeLog = (id) => setLogs((l) => l.filter((x) => x.id !== id));

  const syncAll = async () => {
    if (!settings.webhookUrl) return;
    await pushToSheet(settings.webhookUrl, "Jadwal", "replace_all", schedule);
    await pushToSheet(settings.webhookUrl, "PolaMakan", "replace_all", diet);
    await pushToSheet(settings.webhookUrl, "Aktivitas", "replace_all", logs);
  };

  const today = todayName();
  const streak = (() => {
    let s = 0;
    const dates = new Set(logs.map((l) => l.date));
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (dates.has(key)) s++; else if (i > 0) break;
    }
    return s;
  })();

  if (loading) {
    return (
      <div style={{ ...rootStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--text-dim)", fontFamily: "Inter, sans-serif" }}>Memuat data...</span>
      </div>
    );
  }

  const NAV = [
    { id: "dashboard", label: "Beranda", icon: Sun },
    { id: "jadwal", label: "Jadwal", icon: CalendarDays },
    { id: "makan", label: "Pola Makan", icon: Utensils },
    { id: "log", label: "Log Aktivitas", icon: Activity },
    { id: "ai", label: "Penasehat AI", icon: MessageCircle },
    { id: "sync", label: "Sinkron", icon: Link2 },
  ];

  return (
    <div className="app-root" style={rootStyle}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: var(--surface-2); border-radius: 8px; }
        button { font-family: 'Inter', sans-serif; }
        .app-root { flex-direction: row; }
        .app-nav { width: 190px; flex-direction: column; }
        .app-main { padding: 28px; }
        @media (max-width: 700px) {
          .app-root { flex-direction: column; }
          .app-nav { width: 100%; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--surface-2); padding: 10px; }
          .app-nav .brand { display: none; }
          .app-nav button { flex-shrink: 0; }
          .app-nav .nav-label { display: none; }
          .app-main { padding: 16px; }
        }
      `}</style>

      <nav className="app-nav" style={navStyle}>
        <div className="brand" style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 600, color: "var(--accent-gold)", padding: "4px 10px 18px" }}>
          Sadhana
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: tab === id ? "var(--surface-2)" : "transparent",
              color: tab === id ? "var(--text)" : "var(--text-dim)",
              border: "none", borderRadius: 10, padding: "10px 12px",
              cursor: "pointer", fontSize: 14, textAlign: "left",
            }}
          >
            <Icon size={16} />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main" style={mainStyle}>
        {tab === "dashboard" && (
          <Dashboard
            today={today} schedule={schedule} diet={diet} streak={streak}
            dailyInsight={dailyInsight} insightBusy={insightBusy} getDailyInsight={getDailyInsight}
          />
        )}
        {tab === "jadwal" && <ScheduleTab schedule={schedule} onAdd={addSchedule} onRemove={removeSchedule} />}
        {tab === "makan" && <DietTab diet={diet} onAdd={addDiet} onRemove={removeDiet} />}
        {tab === "log" && <LogTab logs={logs} onAdd={addLog} onRemove={removeLog} />}
        {tab === "ai" && (
          <AiTab chat={chat} chatInput={chatInput} setChatInput={setChatInput} sendChat={sendChat} chatBusy={chatBusy} chatEndRef={chatEndRef} />
        )}
        {tab === "sync" && <SyncTab settings={settings} setSettings={setSettings} syncAll={syncAll} />}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */
function Dashboard({ today, schedule, diet, streak, dailyInsight, insightBusy, getDailyInsight }) {
  const todaySchedule = schedule.filter((s) => s.day === today).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const todayDiet = diet.filter((d) => d.day === today).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ color: "var(--text-dim)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>{today}, hari ini</div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 30, color: "var(--text)", margin: "4px 0 0" }}>
          Selamat berlatih.
        </h1>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: "var(--text-dim)", fontSize: 12, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>
            Ritme hari ini
          </span>
          <span style={{ display: "flex", gap: 14, fontSize: 12, fontFamily: "Inter, sans-serif", color: "var(--text-dim)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: "var(--accent-sage)", display: "inline-block" }} />Latihan</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: "var(--accent-gold)", display: "inline-block" }} />Makan</span>
          </span>
        </div>
        <SunArc schedule={schedule} diet={diet} day={today} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-gold)" }}>
            <Flame size={16} /><span style={{ fontFamily: "Fraunces, serif", fontSize: 22 }}>{streak}</span>
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: 12, fontFamily: "Inter, sans-serif", marginTop: 4 }}>hari beruntun tercatat</div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-sage)" }}>
            <CalendarDays size={16} /><span style={{ fontFamily: "Fraunces, serif", fontSize: 22 }}>{todaySchedule.length}</span>
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: 12, fontFamily: "Inter, sans-serif", marginTop: 4 }}>sesi latihan hari ini</div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, marginBottom: 10, color: "var(--text)" }}>Latihan hari ini</div>
          {todaySchedule.length === 0 && <div style={{ color: "var(--text-dim)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>Belum ada jadwal. Tambahkan di tab Jadwal.</div>}
          {todaySchedule.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--surface-2)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
              <span>{s.jenis}</span>
              <span style={{ color: "var(--text-dim)", fontFamily: "JetBrains Mono, monospace" }}>{s.time} · {s.durasi}m</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, marginBottom: 10, color: "var(--text)" }}>Menu hari ini</div>
          {todayDiet.length === 0 && <div style={{ color: "var(--text-dim)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>Belum ada rencana makan.</div>}
          {todayDiet.map((d) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--surface-2)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
              <span>{d.slot}: {d.menu}</span>
              <span style={{ color: "var(--text-dim)", fontFamily: "JetBrains Mono, monospace" }}>{d.time}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ borderColor: "var(--accent-gold)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Fraunces, serif", fontSize: 16, color: "var(--text)" }}>
            <Sparkles size={16} color="var(--accent-gold)" /> Saran hari ini dari penasehat AI
          </div>
          <button onClick={getDailyInsight} disabled={insightBusy} style={ghostBtnStyle}>
            {insightBusy ? "Menganalisis..." : "Perbarui"}
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.6, color: "var(--text)", fontFamily: "Inter, sans-serif", whiteSpace: "pre-wrap" }}>
          {dailyInsight || "Tekan “Perbarui” untuk mendapatkan saran harian berdasarkan jadwal, menu, dan log aktivitasmu."}
        </div>
      </Card>
    </div>
  );
}

const ghostBtnStyle = {
  background: "transparent", border: "1px solid var(--accent-gold)", color: "var(--accent-gold)",
  borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer",
};

/* ---------------------------------------------------------
   SCHEDULE TAB
--------------------------------------------------------- */
function ScheduleTab({ schedule, onAdd, onRemove }) {
  const [form, setForm] = useState({ day: "Senin", time: "06:00", jenis: "Hatha Yoga", durasi: 45, notes: "" });
  return (
    <TabShell title="Jadwal Latihan" subtitle="Susun sesi yoga & olahraga mingguan.">
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr) auto", gap: 10, alignItems: "end" }}>
          <Field label="Hari">
            <select style={inputStyle} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Jam"><input type="time" style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
          <Field label="Jenis latihan"><input style={inputStyle} value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} placeholder="cth. Vinyasa Flow" /></Field>
          <Field label="Durasi (menit)"><input type="number" style={inputStyle} value={form.durasi} onChange={(e) => setForm({ ...form, durasi: Number(e.target.value) })} /></Field>
          <Field label="Catatan"><input style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="opsional" /></Field>
          <button onClick={() => onAdd(form)} style={{ ...ghostBtnStyle, height: 36, display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} />Tambah</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DAYS.map((day) => {
          const items = schedule.filter((s) => s.day === day).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
          if (items.length === 0) return null;
          return (
            <Card key={day}>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: "var(--accent-sage)", marginBottom: 8 }}>{day}</div>
              {items.map((s) => (
                <div key={s.id} style={rowStyle}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-dim)", width: 60 }}>{s.time}</span>
                  <span style={{ flex: 1 }}>{s.jenis} <span style={{ color: "var(--text-dim)" }}>· {s.durasi} menit</span></span>
                  {s.notes && <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{s.notes}</span>}
                  <IconBtn danger onClick={() => onRemove(s.id)}><Trash2 size={14} /></IconBtn>
                </div>
              ))}
            </Card>
          );
        })}
        {schedule.length === 0 && <EmptyState text="Belum ada jadwal latihan. Tambahkan sesi pertamamu di atas." />}
      </div>
    </TabShell>
  );
}

/* ---------------------------------------------------------
   DIET TAB
--------------------------------------------------------- */
function DietTab({ diet, onAdd, onRemove }) {
  const [form, setForm] = useState({ day: "Senin", slot: "Sarapan", time: "07:00", menu: "", notes: "" });
  return (
    <TabShell title="Pola Makan" subtitle="Rencanakan menu harian selaras dengan jadwal latihan.">
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr) auto", gap: 10, alignItems: "end" }}>
          <Field label="Hari">
            <select style={inputStyle} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Waktu makan">
            <select style={inputStyle} value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
              {MEAL_SLOTS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Jam"><input type="time" style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
          <Field label="Menu"><input style={inputStyle} value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} placeholder="cth. Oatmeal pisang" /></Field>
          <Field label="Catatan"><input style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="opsional" /></Field>
          <button onClick={() => onAdd(form)} style={{ ...ghostBtnStyle, height: 36, display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} />Tambah</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DAYS.map((day) => {
          const items = diet.filter((d) => d.day === day).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
          if (items.length === 0) return null;
          return (
            <Card key={day}>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: "var(--accent-gold)", marginBottom: 8 }}>{day}</div>
              {items.map((d) => (
                <div key={d.id} style={rowStyle}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-dim)", width: 60 }}>{d.time}</span>
                  <span style={{ flex: 1 }}><b style={{ fontWeight: 600 }}>{d.slot}</b> — {d.menu}</span>
                  {d.notes && <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{d.notes}</span>}
                  <IconBtn danger onClick={() => onRemove(d.id)}><Trash2 size={14} /></IconBtn>
                </div>
              ))}
            </Card>
          );
        })}
        {diet.length === 0 && <EmptyState text="Belum ada rencana makan. Tambahkan menu pertamamu di atas." />}
      </div>
    </TabShell>
  );
}

/* ---------------------------------------------------------
   LOG TAB
--------------------------------------------------------- */
function LogTab({ logs, onAdd, onRemove }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), jenis: "Hatha Yoga", durasi: 45, energi: 4, notes: "" });
  const sorted = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <TabShell title="Log Aktivitas" subtitle="Catat latihan yang sudah dijalani untuk memantau progres.">
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr auto", gap: 10, alignItems: "end" }}>
          <Field label="Tanggal"><input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Jenis"><input style={inputStyle} value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} /></Field>
          <Field label="Durasi (menit)"><input type="number" style={inputStyle} value={form.durasi} onChange={(e) => setForm({ ...form, durasi: Number(e.target.value) })} /></Field>
          <Field label="Energi (1-5)"><input type="number" min={1} max={5} style={inputStyle} value={form.energi} onChange={(e) => setForm({ ...form, energi: Number(e.target.value) })} /></Field>
          <Field label="Catatan"><input style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="bagaimana rasanya?" /></Field>
          <button onClick={() => onAdd(form)} style={{ ...ghostBtnStyle, height: 36, display: "flex", alignItems: "center", gap: 6 }}><Check size={14} />Catat</button>
        </div>
      </Card>

      <Card>
        {sorted.length === 0 && <EmptyState text="Belum ada catatan aktivitas." />}
        {sorted.map((l) => (
          <div key={l.id} style={rowStyle}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-dim)", width: 90 }}>{l.date}</span>
            <span style={{ flex: 1 }}>{l.jenis} <span style={{ color: "var(--text-dim)" }}>· {l.durasi} menit · energi {l.energi}/5</span></span>
            {l.notes && <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{l.notes}</span>}
            <IconBtn danger onClick={() => onRemove(l.id)}><Trash2 size={14} /></IconBtn>
          </div>
        ))}
      </Card>
    </TabShell>
  );
}

/* ---------------------------------------------------------
   AI ADVISOR TAB
--------------------------------------------------------- */
function AiTab({ chat, chatInput, setChatInput, sendChat, chatBusy, chatEndRef }) {
  return (
    <TabShell title="Penasehat AI" subtitle="Ahli kesehatan tubuh, instruktur olahraga, dan ahli gizi dalam satu percakapan.">
      <Card style={{ height: 480, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
          {chat.length === 0 && (
            <div style={{ color: "var(--text-dim)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
              Tanyakan apa saja — pose yang aman untuk keluhan tertentu, menu sebelum/sesudah latihan, cara menyusun jadwal mingguan, dll.
            </div>
          )}
          {chat.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "var(--surface-2)" : "var(--bg)",
              border: m.role === "user" ? "none" : "1px solid var(--surface-2)",
              borderRadius: 12, padding: "10px 14px", maxWidth: "80%",
              fontSize: 13.5, lineHeight: 1.55, color: "var(--text)", fontFamily: "Inter, sans-serif",
              whiteSpace: "pre-wrap",
            }}>
              {m.text}
            </div>
          ))}
          {chatBusy && <div style={{ color: "var(--text-dim)", fontSize: 12, fontFamily: "Inter, sans-serif" }}>Penasehat sedang mengetik...</div>}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Tulis pertanyaan..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
          />
          <button onClick={sendChat} disabled={chatBusy} style={{ ...ghostBtnStyle, display: "flex", alignItems: "center", gap: 6 }}>
            <Send size={14} /> Kirim
          </button>
        </div>
      </Card>
    </TabShell>
  );
}

/* ---------------------------------------------------------
   SYNC TAB
--------------------------------------------------------- */
function SyncTab({ settings, setSettings, syncAll }) {
  const [status, setStatus] = useState("");
  return (
    <TabShell title="Sinkronisasi" subtitle="Hubungkan aplikasi ini ke Google Sheet (dan AppSheet) milikmu.">
      <Card style={{ marginBottom: 16 }}>
        <Field label="URL Web App Google Apps Script">
          <input
            style={inputStyle}
            placeholder="https://script.google.com/macros/s/xxxx/exec"
            value={settings.webhookUrl}
            onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
          />
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            style={{ ...ghostBtnStyle, display: "flex", alignItems: "center", gap: 6 }}
            onClick={async () => { setStatus("Menyinkronkan..."); await syncAll(); setStatus("Terkirim ke Google Sheet."); }}
          >
            <RefreshCw size={14} /> Sinkron semua data sekarang
          </button>
          {status && <span style={{ color: "var(--text-dim)", fontSize: 12, alignSelf: "center", fontFamily: "Inter, sans-serif" }}>{status}</span>}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, marginBottom: 8, color: "var(--text)" }}>Cara menghubungkan</div>
        <ol style={{ color: "var(--text)", fontSize: 13.5, lineHeight: 1.8, fontFamily: "Inter, sans-serif", paddingLeft: 18 }}>
          <li>Buat Google Sheet baru dengan 3 tab: <b>Jadwal</b>, <b>PolaMakan</b>, <b>Aktivitas</b>.</li>
          <li>Buka <i>Extensions → Apps Script</i>, tempel skrip yang sudah disiapkan (lihat file terpisah), lalu <i>Deploy → New deployment → Web app</i> (akses: Anyone).</li>
          <li>Salin URL hasil deploy ke kolom di atas, lalu tekan “Sinkron semua data sekarang”.</li>
          <li>Buka AppSheet, buat app baru dari Google Sheet yang sama agar kamu punya versi mobile native + notifikasi.</li>
        </ol>
      </Card>
    </TabShell>
  );
}

/* ---------------------------------------------------------
   SHARED PIECES
--------------------------------------------------------- */
function TabShell({ title, subtitle, children }) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 24, color: "var(--text)", margin: 0 }}>{title}</h2>
        <div style={{ color: "var(--text-dim)", fontSize: 13, fontFamily: "Inter, sans-serif", marginTop: 4 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ color: "var(--text-dim)", fontSize: 13, fontFamily: "Inter, sans-serif", padding: "20px 0", textAlign: "center" }}>{text}</div>;
}

const rowStyle = {
  display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
  borderBottom: "1px solid var(--surface-2)", fontSize: 13.5, fontFamily: "Inter, sans-serif", color: "var(--text)",
};

const rootStyle = {
  "--bg": "#10201A",
  "--surface": "#182920",
  "--surface-2": "#223A2E",
  "--accent-gold": "#D8A857",
  "--accent-sage": "#8FAE96",
  "--text": "#F1ECDD",
  "--text-dim": "#8FA294",
  "--danger": "#C97064",
  background: "var(--bg)",
  minHeight: "100vh",
  display: "flex",
  fontFamily: "Inter, sans-serif",
};

const navStyle = {
  width: 190,
  background: "var(--surface)",
  borderRight: "1px solid var(--surface-2)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flexShrink: 0,
};

const mainStyle = {
  flex: 1,
  padding: 28,
  maxWidth: 880,
  overflowY: "auto",
};