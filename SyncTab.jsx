import React, { useState } from 'react';
import { Link2, RefreshCw, Download, Upload, CheckCircle2, AlertCircle, FileSpreadsheet, Smartphone } from 'lucide-react';
import { exportBackupData, importBackupData } from '../utils/storage';
import { testConnection } from '../utils/sheetSync';

export default function SyncTab({ settings = {}, setSettings, syncAll }) {
  const [statusMsg, setStatusMsg] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);

  const handleSyncAll = async () => {
    if (!settings.webhookUrl) {
      setStatusMsg('Masukkan URL Web App terlebih dahulu.');
      return;
    }
    setSyncBusy(true);
    setStatusMsg('Menyinkronkan jadwal, menu, dan log ke Google Sheet...');
    const result = await syncAll();
    setSyncBusy(false);
    if (result && result.error) {
      setStatusMsg(`Gagal: ${result.error}`);
    } else {
      setStatusMsg('✨ Seluruh data berhasil terkirim ke Google Sheet!');
    }
  };

  const handleTestConnection = async () => {
    setStatusMsg('Mencoba koneksi...');
    const res = await testConnection(settings.webhookUrl);
    setStatusMsg(res.message);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      const res = importBackupData(content);
      if (res.ok) {
        alert('Data backup berhasil diimpor! Halaman akan direfresh.');
        window.location.reload();
      } else {
        alert(res.error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '26px' }}>Sinkronisasi Google Sheet & AppSheet</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>
          Hubungkan SADHANA Web dengan Google Sheet sebagai basis data terpusat dan AppSheet untuk notifikasi mobile native.
        </p>
      </div>

      {/* Webhook Connection Card */}
      <div className="sadhana-card gold-border">
        <h3 style={{ fontSize: '18px', color: 'var(--accent-gold)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link2 size={20} /> Konfigurasi Jembatan Google Apps Script
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              URL Web App Google Apps Script (/exec)
            </label>
            <input
              type="text"
              className="sadhana-input font-mono"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={settings.webhookUrl || ''}
              onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn-primary"
              onClick={handleSyncAll}
              disabled={syncBusy}
            >
              <RefreshCw size={16} className={syncBusy ? 'animate-spin' : ''} />
              {syncBusy ? 'Menyinkronkan...' : 'Sinkron Semua Data Sekarang'}
            </button>

            <button
              className="btn-secondary"
              onClick={handleTestConnection}
            >
              Uji Koneksi
            </button>

            {statusMsg && (
              <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '500' }}>
                {statusMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* JSON Backup & Restore Card */}
      <div className="sadhana-card">
        <h3 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={20} color="var(--accent-sage)" /> Cadangan & Pemulihan Lokal (Backup JSON)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Unduh salinan data lokal Anda untuk cadangan mandiri atau impor kembali di perangkat lain.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={exportBackupData}>
            <Download size={16} /> Ekspor Backup (.json)
          </button>

          <label className="btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Impor Backup (.json)
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Setup Guide Card */}
      <div className="sadhana-card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>
          📘 Langkah Menghubungkan Google Sheet & AppSheet
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--accent-sage-glow)', color: 'var(--accent-sage)', height: 'fit-content' }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>1. Siapkan Google Sheet & Apps Script</strong>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '2px' }}>
                Buat Spreadsheet baru dengan 3 tab: <code>Jadwal</code>, <code>PolaMakan</code>, dan <code>Aktivitas</code>. Buka <em>Extensions → Apps Script</em>, tempel kode dari file <code>google apps script.GS</code>, lalu klik <em>Deploy → New Deployment → Web App</em> (Akses: <strong>Anyone</strong>).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)', height: 'fit-content' }}>
              <Link2 size={20} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>2. Hubungkan URL ke Aplikasi SADHANA</strong>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '2px' }}>
                Salin URL hasil deploy Apps Script yang diakhiri <code>/exec</code> ke kolom di atas, lalu tekan <strong>Sinkron Semua Data Sekarang</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(142, 175, 150, 0.15)', color: 'var(--text-main)', height: 'fit-content' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>3. Hubungkan ke AppSheet untuk Notifikasi Mobile</strong>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '2px' }}>
                Buka <strong>AppSheet.com</strong> → <em>Create App from Google Sheets</em>, pilih Spreadsheet SADHANA Anda. AppSheet secara otomatis akan mendeteksi jadwal dan dapat memberi notifikasi jam latihan langsung di ponsel Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
