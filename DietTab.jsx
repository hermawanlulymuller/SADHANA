import React, { useState } from 'react';
import { Plus, Trash2, Utensils, Clock, Check } from 'lucide-react';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MEAL_SLOTS = ['Sarapan', 'Makan Siang', 'Makan Malam', 'Camilan'];
const timeToMinutes = (t) => {
  const [h, m] = (t || '06:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export default function DietTab({ diet = [], onAdd, onRemove }) {
  const [activeDayFilter, setActiveDayFilter] = useState('Semua');
  const [form, setForm] = useState({
    day: 'Senin',
    slot: 'Sarapan',
    time: '07:00',
    menu: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.menu.trim()) return;
    onAdd(form);
    setForm({ ...form, menu: '', notes: '' });
  };

  const filteredDays = activeDayFilter === 'Semua' ? DAYS : [activeDayFilter];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '26px' }}>Pola Makan & Nutrisi Sattvic</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>
          Rencanakan asupan nutrisi harian yang selaras dengan jam latihan yoga Anda.
        </p>
      </div>

      {/* Form Input Card */}
      <form className="sadhana-card gold-border" onSubmit={handleSubmit}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--accent-gold)' }}>
          + Tambah Rencana Makan Baru
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
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Waktu Makan</label>
            <select
              className="sadhana-select"
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: e.target.value })}
            >
              {MEAL_SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Jam</label>
            <input
              type="time"
              className="sadhana-input font-mono"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Menu Makanan / Minuman</label>
            <input
              type="text"
              className="sadhana-input"
              placeholder="cth. Oatmeal Pisang Kurma & Air Lemon Warm"
              value={form.menu}
              onChange={(e) => setForm({ ...form, menu: e.target.value })}
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Catatan Nutrisi (Opsional)</label>
            <input
              type="text"
              className="sadhana-input"
              placeholder="cth. Bebas gula olahan, disantap 1 jam sebelum latihan"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" className="btn-primary">
            <Plus size={16} /> Tambah Menu Makanan
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

      {/* Weekly Diet List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredDays.map((day) => {
          const items = diet
            .filter((d) => d.day === day)
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

          if (items.length === 0 && activeDayFilter !== 'Semua') {
            return (
              <div key={day} className="sadhana-card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-dim)' }}>
                Belum ada rencana makan untuk hari {day}.
              </div>
            );
          }

          if (items.length === 0) return null;

          return (
            <div key={day} className="sadhana-card gold-border">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '10px' }}>
                <Utensils size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '18px', color: 'var(--accent-gold)' }}>{day}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: 'auto' }} className="font-mono">
                  {items.length} Menu
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((d) => (
                  <div
                    key={d.id}
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
                      <span className="badge badge-gold font-mono" style={{ fontSize: '13px' }}>
                        <Clock size={12} /> {d.time}
                      </span>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '600' }}>{d.slot}</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginTop: '2px' }}>{d.menu}</div>
                        {d.notes && <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{d.notes}</div>}
                      </div>
                    </div>

                    <button
                      className="btn-icon danger"
                      title="Hapus Menu"
                      onClick={() => onRemove(d.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {diet.length === 0 && (
          <div className="sadhana-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
            <Utensils size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} color="var(--accent-gold)" />
            <p style={{ fontSize: '15px', fontWeight: '500' }}>Rencana Makan Masih Kosong</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Tambahkan menu nutrisi harian Anda di formulir atas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
