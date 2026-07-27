import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Activity, AlertCircle } from 'lucide-react';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const timeToMinutes = (t) => {
  const [h, m] = (t || '06:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export default function ScheduleTab({ schedule = [], onAdd, onRemove }) {
  const [activeDayFilter, setActiveDayFilter] = useState('Semua');
  const [form, setForm] = useState({
    day: 'Senin',
    time: '06:00',
    jenis: 'Hatha Yoga',
    durasi: 45,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.jenis.trim()) return;
    onAdd(form);
    setForm({ ...form, jenis: 'Hatha Yoga', notes: '' });
  };

  const filteredDays = activeDayFilter === 'Semua' ? DAYS : [activeDayFilter];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '26px' }}>Jadwal Latihan Yoga & Olahraga</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>
          Susun ritme mingguan latihan fisik, pranayama, dan meditasi Anda.
        </p>
      </div>

      {/* Form Input Card */}
      <form className="sadhana-card" onSubmit={handleSubmit}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--accent-sage)' }}>
          + Tambah Sesi Latihan Baru
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Hari</label>
            <select
              className="sadhana-select"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Jam Mulai</label>
            <input
              type="time"
              className="sadhana-input font-mono"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Jenis Latihan</label>
            <input
              type="text"
              className="sadhana-input"
              placeholder="cth. Vinyasa Flow / Yin Yoga"
              value={form.jenis}
              onChange={(e) => setForm({ ...form, jenis: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Durasi (menit)</label>
            <input
              type="number"
              className="sadhana-input font-mono"
              value={form.durasi}
              onChange={(e) => setForm({ ...form, durasi: Number(e.target.value) })}
              min="5"
              max="300"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Catatan / Fokus (Opsional)</label>
            <input
              type="text"
              className="sadhana-input"
              placeholder="cth. Fokus pembukaan pinggul & pernapasan halus"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" className="btn-primary">
            <Plus size={16} /> Tambah Ke Jadwal
          </button>
        </div>
      </form>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`badge ${activeDayFilter === 'Semua' ? 'badge-gold' : 'btn-secondary'}`}
          onClick={() => setActiveDayFilter('Semua')}
          style={{ cursor: 'pointer', padding: '6px 14px' }}
        >
          Semua Hari
        </button>
        {DAYS.map((d) => (
          <button
            key={d}
            className={`badge ${activeDayFilter === d ? 'badge-gold' : 'btn-secondary'}`}
            onClick={() => setActiveDayFilter(d)}
            style={{ cursor: 'pointer', padding: '6px 14px' }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Weekly Schedule List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredDays.map((day) => {
          const items = schedule
            .filter((s) => s.day === day)
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

          if (items.length === 0 && activeDayFilter !== 'Semua') {
            return (
              <div key={day} className="sadhana-card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-dim)' }}>
                Belum ada jadwal latihan untuk hari {day}.
              </div>
            );
          }

          if (items.length === 0) return null;

          return (
            <div key={day} className="sadhana-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '10px' }}>
                <Calendar size={18} color="var(--accent-sage)" />
                <h3 style={{ fontSize: '18px', color: 'var(--accent-sage)' }}>{day}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: 'auto' }} className="font-mono">
                  {items.length} Sesi
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(10, 22, 17, 0.4)',
                      border: '1px solid var(--surface-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span className="badge badge-sage font-mono" style={{ fontSize: '13px' }}>
                        <Clock size={12} /> {s.time}
                      </span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{s.jenis}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          Durasi: {s.durasi} menit {s.notes && `• ${s.notes}`}
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-icon danger"
                      title="Hapus Sesi"
                      onClick={() => onRemove(s.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {schedule.length === 0 && (
          <div className="sadhana-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
            <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} color="var(--accent-sage)" />
            <p style={{ fontSize: '15px', fontWeight: '500' }}>Jadwal Latihan Masih Kosong</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Gunakan formulir di atas untuk merencanakan latihan mingguan Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
