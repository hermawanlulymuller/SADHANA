/**
 * AI Holistic Health & Yoga Advisor helper.
 * Supports custom API key (Gemini / Anthropic / OpenRouter) or smart offline recommendation engine.
 */

export const SYSTEM_PROMPT = `Kamu adalah tim Penasehat Kesehatan Holistic SADHANA yang berpengalaman dalam 3 bidang utama:
1. Instruktur Yoga & Olahraga (Ahli Pose, Pranayama, Postur, & Fleksibilitas)
2. Ahli Nutrisi & Gizi Sattvic (Waktu Makan sebelum/sesudah Latihan, Hidrasi, Nutrisi Pemulihan)
3. Ahli Fisioterapi & Kesehatan Tubuh (Anatomi, Keamanan Sendi, Manfaat Tubuh & Pikiran)

Berikan jawaban yang hangat, menenangkan, praktis, serta spesifik untuk mendukung latihan penggunanya.
Gunakan Bahasa Indonesia yang ramah, santun, dan terstruktur jelas (gunakan bullet points bila perlu).
Bila pertanyaan terkait keluhan medis berat, berikan saran praktis pertama lalu sarankan konsultasi dengan dokter/tenaga medis berlisensi.`;

export async function askAdvisor(userText, contextSummary, settings = {}) {
  const { apiKey, aiProvider = 'gemini' } = settings;

  // If user provided a Gemini API Key
  if (apiKey && aiProvider === 'gemini') {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nKontek Pengguna:\n${contextSummary}\n\nPertanyaan: ${userText}` }]
            }
          ]
        })
      });
      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) return answer;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart engine', err);
    }
  }

  // If user provided an Anthropic API Key
  if (apiKey && aiProvider === 'anthropic') {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `${contextSummary}\n\nPertanyaan: ${userText}` }]
        })
      });
      const data = await res.json();
      const text = data?.content?.filter(b => b.type === 'text').map(b => b.text).join('\n');
      if (text) return text;
    } catch (err) {
      console.warn('Anthropic API call failed, falling back to smart engine', err);
    }
  }

  // Built-in Smart Recommendation Fallback Engine
  return generateOfflineAdvice(userText, contextSummary);
}

function generateOfflineAdvice(userText, context) {
  const query = userText.toLowerCase();

  if (query.includes('harian') || query.includes('saran hari ini') || query.includes('rekomendasi')) {
    return `✨ **Saran Ritme Harian SADHANA**:

1. 🧘 **Persiapan Latihan Yoga**:
   - Pastikan perut dalam keadaan ringan. Hindari makan berat 2 jam sebelum latihan.
   - Awali latihan dengan 5 menit *Nadi Shodhana* (Pranayama pernapasan bergantian) untuk menenangkan sistem saraf.

2. 🥗 **Nutrisi & Hidrasi**:
   - Konsumsi air hangat dengan perasan lemon di pagi hari untuk aktivasi pencernaan.
   - Pilih hidangan bergizi seimbang (protein nabati, biji-bijian, dan sayuran segar).

3. 🌿 **Pemulihan & Pemulihan Energi**:
   - Setelah sesi latihan, luangkan 5–10 menit untuk *Savasana* penuh guna mengintegrasikan energi tubuh.
   - Cukupi waktu tidur malam (7-8 jam) agar otot dapat beregenerasi sempurna.`;
  }

  if (query.includes('makan') || query.includes('diet') || query.includes('nutrisi') || query.includes('menu')) {
    return `🥗 **Panduan Nutrisi & Waktu Makan Yoga**:

- **Sebelum Latihan (30-60 menit)**: Camilan ringan seperti pisang, kurma, atau segelas smoothie buah. Ini memberikan energi cepat tanpa memberatkan pencernaan.
- **Setelah Latihan (30 menit sesudah)**: Santap makanan berprotein (tahu, tempe, edamame, atau oat) untuk membantu pemulihan jaringan otot.
- **Hidrasi**: Minum air mineral hangat atau teh herbal tanpa kafein (seperti chamomile atau peppermint).`;
  }

  if (query.includes('pegal') || query.includes('sakit') || query.includes('punggung') || query.includes('leher')) {
    return `🧘‍♂️ **Rekomendasi Pemulihan Tubuh & Pose Relaksasi**:

- **Punggung kaku/pegal**: Lakukan gerakan lembut *Cat-Cow Pose* (Marjaryasana-Bitilasana) sebanyak 8-10 siklus napas halus.
- **Bahu & Leher tegang**: Praktikkan *Child's Pose* (Balasana) yang diperpanjang ke depan dengan napas perut yang dalam.
- **Pinggul tegang**: Lakukan *Supta Baddha Konasana* (Bound Angle berbaring) disangga bantal di bawah lutut.

*Catatan: Bergeraklah secara perlahan tanpa memaksa sendi. Jika rasa nyeri berlanjut, konsultasikan dengan dokter atau fisioterapis.*`;
  }

  return `🌿 **Saran dari Penasehat SADHANA**:

Berdasarkan ritme dan rutinitas harianmu:
- Selalu dengarkan sinyal tubuhmu saat berlatih yoga. Fokus pada kedalaman napas ketimbang fleksibilitas yang dipaksakan.
- Menjaga konsistensi latihan 20–30 menit setiap hari jauh lebih bermanfaat daripada sesi intensif 2 jam tetapi jarang dilakukan.
- Jaga keharmonisan antara aktivitas fisik, asupan gizi Sattvic, dan istirahat yang berkualitas.

Ada aspek khusus dalam latihan atau menu hari ini yang ingin kamu diskusikan lebih detail?`;
}
