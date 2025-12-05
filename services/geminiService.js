const { GoogleGenerativeAI } = require("@google/generative-ai");

// Pastikan API Key ada
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY tidak ditemukan di .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeJournal = async (journalText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
      Bertindaklah sebagai Game Master RPG. Analisis curhatan ini: "${journalText}".
      
      Tugas: Ubah input menjadi JSON stats game.
      Aturan: 
      1. HANYA berikan output JSON valid. 
      2. Jangan gunakan markdown (\`\`\`). 
      3. Jangan berikan kata pengantar atau penutup.
      
      Format JSON Wajib:
      {
        "mood": "String (Emosi utama, misal: Lelah, Semangat)",
        "xp_gained": Number (Antara 10-100),
        "stats": {
          "stamina": Number (0-100),
          "mental": Number (0-100),
          "social": Number (0-100)
        },
        "summary": "String (Komentar singkat 1 kalimat gaya Gen Z Indonesia yang relate)",
        "theme": "String (Tema hari ini 2-3 kata)"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Raw Output Gemini:", text); // Debugging

    // --- PEMBERSIH JSON LEVEL DEWA ---
    // Cari kurung kurawal pertama '{' dan terakhir '}'
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    } else {
      throw new Error("Format JSON tidak ditemukan dalam respon AI");
    }
    // ---------------------------------

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error.message);
    // Fallback data agar aplikasi TIDAK CRASH jika AI error/limit habis
    return {
      mood: "Sistem Sibuk",
      xp_gained: 10,
      stats: { stamina: 50, mental: 50, social: 50 },
      summary: "Maaf bestie, AI lagi pusing (Overload). Coba lagi nanti ya!",
      theme: "Maintenance Mode"
    };
  }
};

module.exports = { analyzeJournal };