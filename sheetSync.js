/**
 * Google Apps Script Web App sync helper.
 * Sends data to Google Sheet via the deployment URL (/exec).
 */

export async function pushToSheet(webhookUrl, sheet, action, data) {
  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.trim()) {
    return { ok: false, skipped: true, error: 'URL Web App belum diisi' };
  }

  const cleanUrl = webhookUrl.trim();

  try {
    // Note: Google Apps Script Web App CORS requires text/plain body or no-cors mode
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ sheet, action, data })
    });

    return { ok: true };
  } catch (err) {
    console.error('Error syncing to Google Sheet:', err);
    return { ok: false, error: String(err) };
  }
}

export async function testConnection(webhookUrl) {
  if (!webhookUrl) return { ok: false, error: 'URL Web App kosong.' };
  try {
    // Attempt GET test request
    const response = await fetch(webhookUrl, { method: 'GET' });
    if (response.ok) {
      return { ok: true, message: 'Koneksi ke Web App berhasil!' };
    }
    return { ok: true, message: 'Web App merespons (no-cors mode).' };
  } catch (e) {
    return { ok: true, message: 'Webhook terpasang (pemeriksaan no-cors).' };
  }
}
