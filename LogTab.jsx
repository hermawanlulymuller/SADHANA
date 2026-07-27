import React, { useState } from 'react';
import { Plus, Trash2, Activity, Star, Calendar, Flame } from 'lucide-react';

export default function LogTab({ logs = [], onAdd, onRemove }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    jenis: 'Hatha Yoga',
    durasi: 45,
    energi: 4,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.jenis.trim()) return;
    onAdd(form);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      jenis: 'Hatha Yoga',
      durasi: 45,
      energi: 4,
      notes: ''
    });
  };

  const sortedLogs = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '26px' }}>Log Aktivitas & Energi Tubuh</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>
          Catat latihan yang telah Anda selesaikan untuk memantau konsistensi dan tingkat energi harian.
        </p>
      </div>

      {/* Form Input Card */}
      <form className="sadhana-card" onSubmit={handleSubmit}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--accent-sage)' }}>
          + Catat Sesi Latihan Selesai
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Tanggal</label>
            <input
              type="date"
              className="sadhana-input font-mono"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Jenis Latihan</label>
            <input
              type="text"
              className="sadhana-input"
              placeholder="cth. Hatha Yoga / Pranayama"
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

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Tingkat Energi (1–5)</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setForm({ ...form, energi: lvl })}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: form.energi >= lvl ? 'var(--accent-gold)' : 'var(--surface-border)',
                    background: form.energi >= lvl ? 'var(--accent-gold-glow)' : 'transparent',
                    color: form.energi >= lvl ? 'var(--accent-gold)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  ⚡ {lvl}
                </button>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Sensasi & Catatan Sensitivitas Tubuh</label>
            <input
              type="text"
              className="sadhana-input"
              placeholder="cth. Napas terasa lapang, bahu rileks sesudah sesi"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" className="btn-primary">
            <Plus size={16} /> Simpan Catatan Aktivitas
          </button>
        </div>
      </form>

      {/* History Log List */}
      <div className="sadhana-card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-sage)" /> Riwayat Catatan Aktivitas
        </h3>

        {sortedLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-dim)' }}>
            Belum ada aktivitas yang dicatat. Catat sesi pertama Anda di atas!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedLogs.map((l) => (
              <div
                key={l.id}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="badge badge-sage font-mono" style={{ fontSize: '12px' }}>
                    <Calendar size={12} /> {l.date}
                  </span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {l.jenis} <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '400' }}>· {l.durasi} menit</span>
                    </div>
                    {l.notes && <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{l.notes}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="badge badge-gold font-mono" title={`Tingkat Energi ${l.energi}/5`}>
                    ⚡ Energi {l.energi}/5
                  </span>

                  <button
                    className="btn-icon danger"
                    title="Hapus Catatan"
                    onClick={() => onRemove(l.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
