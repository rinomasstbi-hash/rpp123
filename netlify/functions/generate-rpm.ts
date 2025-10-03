import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Definisi tipe dari project utama, salin jika diperlukan agar tidak ada error dependensi
enum PedagogicalPractice {
  INQUIRY_DISCOVERY = 'Inkuiri-Discovery',
  PJBL = 'PjBL',
  PROBLEM_SOLVING = 'Problem Solving',
  GAME_BASED = 'Game Based Learning',
  STATION_LEARNING = 'Station Learning',
}

enum GraduateDimension {
  FAITH = 'Keimanan & Ketakwaan',
  CITIZENSHIP = 'Kewargaan',
  CRITICAL_REASONING = 'Penalaran Kritis',
  CREATIVITY = 'Kreativitas',
  COLLABORATION = 'Kolaborasi',
  INDEPENDENCE = 'Kemandirian',
  HEALTH = 'Kesehatan',
  COMMUNICATION = 'Komunikasi',
}

interface RPMInput {
  teacherName: string;
  teacherNip: string;
  className: string;
  subject: string;
  learningObjectives: string;
  subjectMatter: string;
  language: 'Bahasa Inggris' | 'Bahasa Arab';
  meetings: number;
  pedagogicalPractices: PedagogicalPractice[];
  graduateDimensions: GraduateDimension[];
}

function createPrompt(data: RPMInput): string {
  const {
    teacherName,
    teacherNip,
    className,
    subject,
    learningObjectives,
    subjectMatter,
    language,
    meetings,
    pedagogicalPractices,
    graduateDimensions
  } = data;

  const practicesText = pedagogicalPractices
    .map((practice, index) => `Pertemuan ${index + 1}: ${practice}`)
    .join(', ');

  return `
    Anda adalah asisten ahli dalam pembuatan Rencana Pembelajaran Mendalam (RPM) untuk kurikulum madrasah di Indonesia, khususnya untuk MTsN 4 Jombang.

    Berdasarkan input berikut:
    - Nama Guru: ${teacherName}
    - NIP Guru: ${teacherNip}
    - Kelas: ${className}
    - Mata Pelajaran: ${subject}
    - Tujuan Pembelajaran: ${learningObjectives}
    - Materi Pelajaran: ${subjectMatter}
    - Bahasa Pembuka/Penutup: ${language}
    - Jumlah Pertemuan: ${meetings}
    - Praktik Pedagogis per Pertemuan: ${practicesText}
    - Dimensi Lulusan: ${graduateDimensions.join(', ')}

    Tugas Anda adalah membuat dokumen RPM yang lengkap, terstruktur, dan siap pakai dalam format HTML. Ikuti struktur dan instruksi di bawah ini dengan SANGAT TELITI menggunakan Ejaan Bahasa Indonesia yang baik dan benar. Pastikan semua teks berwarna hitam atau sangat gelap agar kontrasnya tinggi dan mudah dibaca. Jangan gunakan sintaks Markdown seperti **teks tebal** di dalam output HTML Anda; sebagai gantinya, gunakan tag HTML yang sesuai seperti \`<b>\` atau \`<strong>\`.

    **STRUKTUR OUTPUT HTML UTAMA:**

    Gunakan sebuah div kontainer utama dengan gaya \`style="color: #000;"\`. Di dalamnya, buatlah struktur berikut:

    1.  **Tabel RPM (Dua Kolom):** Buat sebuah tabel HTML (\`<table>\`) dengan kelas 'w-full border-collapse'. Kolom pertama adalah "Komponen" dan kedua "Isi". 
        - Gunakan \`<thead>\` untuk header.
        - Gunakan \`<tbody>\` untuk konten.
        - Untuk setiap baris komponen, gunakan \`<tr>\`.
        - Kolom "Komponen" (\`<td>\`) harus bold dan rata atas (\`style="font-weight: bold; vertical-align: top; width: 30%; padding: 8px; border: 1px solid #ddd;"\`).
        - Kolom "Isi" (\`<td>\`) harus rata kanan-kiri (\`style="text-align: justify; padding: 8px; border: 1px solid #ddd;"\`).
        - Untuk header seksi seperti "IDENTITAS", gunakan \`<tr style="background-color: #f2f2f2;"><td colspan="2" style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">NAMA SEKSI</td></tr>\`.

    **Isi Tabel RPM:**

    a. **IDENTITAS**
       - Nama Madrasah: MTsN 4 Jombang
       - Mata Pelajaran: ${subject}
       - Kelas/Semester: ${className} / [Generate semester ganjil/genap secara logis]
       - Durasi Pertemuan: ${meetings} x (2 x 40 menit)

    b. **IDENTIFIKASI**
       - Siswa: Generate deskripsi singkat karakteristik umum siswa kelas ${className} di madrasah tsanawiyah.
       - Materi Pelajaran: ${subjectMatter}
       - Capaian Dimensi Lulusan: ${graduateDimensions.join(', ')}
       - Topik Panca Cinta: Pilih 2-3 dimensi Kurikulum Berbasis Cinta (KBC) yang paling relevan dari [Cinta Allah dan Rasul-Nya, Cinta Ilmu, Cinta Lingkungan, Cinta Diri dan Sesama, Cinta Tanah Air] berdasarkan materi pelajaran.
       - Materi Insersi: Untuk setiap Topik Panca Cinta yang dipilih, tuliskan satu kalimat singkat yang menggambarkan nilai cinta yang diintegrasikan dalam pembelajaran.

    c. **DESAIN PEMBELAJARAN**
       - Lintas Disiplin Ilmu: Generate 1-2 disiplin ilmu lain yang relevan dengan materi.
       - Tujuan Pembelajaran: ${learningObjectives}
       - Topik Pembelajaran: Buat judul topik yang lebih spesifik dan menarik dari input 'Materi Pelajaran'.
       - Praktik Pedagogis per Pertemuan: ${practicesText}
       - Kemitraan Pembelajaran: Generate saran kemitraan yang relevan (misal: orang tua, perpustakaan sekolah).
       - Lingkungan Pembelajaran: Generate saran lingkungan belajar yang sesuai (misal: di dalam kelas, di luar kelas, laboratorium).
       - Pemanfaatan Digital: Generate saran tools digital relevan beserta tautan (contoh: Quizizz, Canva, YouTube).

    d. **PENGALAMAN BELAJAR**
       - Memahami (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan awal. **Mulai kegiatan awal ini dengan salam pembuka yang sesuai dalam ${language}.** Setelah menjelaskan tujuan, tambahkan satu paragraf singkat untuk membangun koneksi emosional siswa dengan mengaitkan materi pada salah satu nilai KBC.
       - Mengaplikasi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan inti detail sesuai sintaks dari praktik pedagogis (${practicesText}). Tambahkan instruksi spesifik untuk mendorong refleksi nilai KBC dalam aktivitas.
       - Refleksi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan penutup. **Akhiri kegiatan penutup ini dengan salam penutup yang sesuai dalam ${language}.**

    e. **ASESMEN PEMBELAJARAN**
       - Asesmen Awal (diagnostik/apersepsi): Jelaskan metode asesmen awal (misal: pertanyaan pemantik lisan).
       - Asesmen Formatif (for/as learning): Jelaskan metode asesmen formatif (misal: observasi, penilaian LKPD).
       - Asesmen Sumatif (of learning): Jelaskan metode asesmen sumatif (misal: tes tulis, penilaian proyek).

    2.  **Tanda Tangan:** Setelah tabel utama, buatlah sebuah tabel baru untuk bagian tanda tangan dengan gaya \`<table style="width: 100%; margin-top: 40px; border: none;">\`. Tabel ini harus memiliki satu baris (\`<tr>\`) dan dua kolom (\`<td>\`).
        - Kolom kiri: \`<td style="width: 50%; vertical-align: top; border: none;">Mengetahui,<br/>Kepala MTsN 4 Jombang<br/><br/><br/><br/><b>Sulthon Sulaiman, M.Pd.I.</b><br/>NIP. 19810616 2005011003</td>\`
        - Kolom kanan: \`<td style="width: 50%; vertical-align: top; border: none;">Jombang, [Generate tanggal hari ini format DD MMMM YYYY]<br/>Guru Mata Pelajaran<br/><br/><br/><br/><b>${teacherName}</b><br/>NIP. ${teacherNip}</td>\`

    3.  **LAMPIRAN (Disederhanakan untuk Performa):** Gunakan \`<div style="page-break-before: always;">\` untuk memulai di halaman baru.
        - \`<h2>Lampiran</h2>\`
        - \`<h3>Lampiran 1: Lembar Kerja Peserta Didik (LKPD)</h3>\`
        - \`<p><i>[Guru dapat mengembangkan LKPD di sini sesuai dengan kegiatan pada bagian PENGALAMAN BELAJAR. LKPD harus mencakup kegiatan untuk memahami, mengaplikasikan, dan merefleksikan materi.]</i></p><br/>\`
        - \`<h3>Lampiran 2: Instrumen Asesmen</h3>\`
        - \`<p><i>[Guru dapat mengembangkan instrumen asesmen di sini, termasuk soal untuk asesmen awal, serta rubrik penilaian untuk asesmen formatif (sikap) dan sumatif (pengetahuan dan keterampilan).]</i></p>\`

    Pastikan seluruh output adalah satu blok kode HTML yang valid dan rapi.
    `;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    if (!process.env.API_KEY) {
      throw new Error("Konfigurasi sisi server tidak lengkap: API_KEY untuk layanan AI tidak ditemukan.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const data = JSON.parse(event.body || '{}') as RPMInput;
    const model = 'gemini-2.5-flash';
    const prompt = createPrompt(data);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    let cleanedText = response.text.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rpm: cleanedText }),
    };
  } catch (error) {
    console.error("Error in Netlify Function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Terjadi kesalahan pada server saat menghasilkan RPM.",
        details: errorMessage 
      }),
    };
  }
};

export { handler };