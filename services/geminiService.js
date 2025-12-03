const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeJournal = async (journalText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
      Role: Game Master RPG.
      Input: "${journalText}"
      
      Tugas: Ubah input menjadi JSON stats game.
      Aturan: HANYA berikan output JSON valid. Jangan ada markdown (\`\`\`), jangan ada kata pengantar.
      
      Format JSON Wajib:
      {
        "mood": "String (Emosi utama, misal: Lelah, Semangat)",
        "xp_gained": Number (10-100),
        "stats": {
          "stamina": Number (0-100),
          "mental": Number (0-100),
          "social": Number (0-100)
        },
        "summary": "String (Komentar singkat 1 kalimat gaya Gen Z)",
        "theme": "String (Tema hari ini 2-3 kata, misal: 'Drama Kantor')"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Gemini Raw:", text); // Cek terminal kalau ada error

    // PEMBERSIH JSON SUPER (Mencari kurung kurawal terluar)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    } else {
      throw new Error("Format AI tidak valid");
    }

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    // Return default data jika AI gagal/limit habis, agar app tidak crash
    return {
      mood: "Error AI",
      xp_gained: 0,
      stats: { stamina: 50, mental: 50, social: 50 },
      summary: "Maaf, AI sedang lelah. Coba lagi nanti.",
      theme: "System Error"
    };
  }
};

module.exports = { analyzeJournal };