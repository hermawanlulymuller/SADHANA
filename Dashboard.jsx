import React from 'react';
import { Flame, CalendarDays, Utensils, Sparkles, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import SunArc from './SunArc';

const timeToMinutes = (t) => {
  const [h, m] = (t || '06:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export default function Dashboard({
  today,
  schedule = [],
  diet = [],
  logs = [],
  streak = 0,
  dailyInsight = '',
  insightBusy = false,
  getDailyInsight,
  onNavigate
}) {
  const todaySchedule = schedule
    .filter((s) => s.day === today)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const todayDiet = diet
    .filter((d) => d.day === today)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const todayLogs = logs.filter((l) => l.date === new Date().toISOString().slice(0, 10));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ color: 'var(--accent-sage)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }} className="font-mono">
            {today}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 style={{ fontSize: '32px', marginTop: '4px' }}>
            Selamat Berlatih. 🌿
          </h1>
        </div>

        <button className="btn-primary" onClick={() => onNavigate('ai')}>
          <Sparkles size={16} /> Konsultasi AI
        </button>
      </div>

      {/* Sun Arc Card */}
      <div className="sadhana-card gold-border">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px' }}>Ritme Busur Matahari</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
              Alur harian dari fajar hingga malam (04:00 – 22:00)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-sage)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-sage)', boxShadow: '0 0 8px var(--accent-sage)' }} /> Latihan
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)', boxShadow: '0 0 8px var(--accent-gold)' }} /> Makan
            </span>
          </div>
        </div>

        <SunArc schedule={schedule} diet={diet} day={today} />
      </div>

      {/* Statistics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="sadhana-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)', border: '1px solid rgba(230,180,80,0.3)' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-gold)' }} className="font-serif">
              {streak} Hari
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Beruntun Tercatat</div>
          </div>
        </div>

        <div className="sadhana-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-sage-glow)', color: 'var(--accent-sage)', border: '1px solid rgba(142,175,150,0.3)' }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-sage)' }} className="font-serif">
              {todaySchedule.length} Sesi
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Jadwal Hari Ini</div>
          </div>
        </div>

        <div className="sadhana-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(230, 180, 80, 0.1)', color: 'var(--accent-gold)' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }} className="font-serif">
              {todayDiet.length} Menu
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Rencana Makan</div>
          </div>
        </div>
      </div>

      {/* Schedule & Diet Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Today's Practice Card */}
        <div className="sadhana-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--accent-sage)' }}>🧘‍♂️ Sesi Latihan Hari Ini</h3>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => onNavigate('jadwal')}>
              Kelola
            </button>
          </div>

          {todaySchedule.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
              Belum ada jadwal latihan hari ini. Tambahkan di tab Jadwal.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todaySchedule.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(10, 22, 17, 0.5)',
                    border: '1px solid var(--surface-border)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{s.jenis}</div>
                    {s.notes && <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{s.notes}</div>}
                  </div>
                  <span className="badge badge-sage font-mono">
                    {s.time} · {s.durasi}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Meal Plan Card */}
        <div className="sadhana-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--accent-gold)' }}>🥗 Rencana Makan Hari Ini</h3>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => onNavigate('makan')}>
              Kelola
            </button>
          </div>

          {todayDiet.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
              Belum ada rencana makan hari ini. Tambahkan di tab Pola Makan.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayDiet.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(10, 22, 17, 0.5)',
                    border: '1px solid var(--surface-border)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '600' }}>{d.slot}</span>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '2px' }}>{d.menu}</div>
                  </div>
                  <span className="badge badge-gold font-mono">{d.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Daily Insight Card */}
      <div className="sadhana-card gold-border">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px' }}>Saran Harian Penasehat AI</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Rekomendasi holistic berdasarkan jadwal dan kondisi hari ini</p>
            </div>
          </div>

          <button
            className="btn-secondary"
            onClick={getDailyInsight}
            disabled={insightBusy}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={insightBusy ? 'animate-spin' : ''} />
            {insightBusy ? 'Menganalisis...' : 'Perbarui'}
          </button>
        </div>

        <div
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'var(--text-main)',
            whiteSpace: 'pre-wrap',
            background: 'rgba(10, 22, 17, 0.4)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--surface-border)'
          }}
        >
          {dailyInsight || 'Tekan "Perbarui" untuk mendapatkan analisis harian mengenai latihan yoga, nutrisi, dan pemulihan tubuh Anda.'}
        </div>
      </div>
    </div>
  );
}
