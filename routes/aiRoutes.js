import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// 🔥 Key direct daal di hai
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // 🔥 Yahan System Instruction add kiya hai (AI ka personality)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: `Aap ek anubhavi Vedic Pandit aur Hindu Temple Guide hain. 
      Aap sirf Hindu mythology, pujas, Vedic rituals, mantras, temples, aur festivals ke baare mein baat karenge. 
      Agar koi user aisi baat pooche jo isse alag ho, toh use vinamrata se dharmik aur spiritual baaton par wapas le aayein. 
      Aapki bhasha aadarful, shuddh aur aadhyaatmik honi chahiye. 
      Aap hamesha "Pranam" ya "Namaste" se shuru karein aur user ko "Beta" ya "Shishya" keh kar sambodhit karein.
      Agar koi aapko coding, politics, ya duniya ki baaton ke baare mein pooche, toh kaho: "Beta, main ek Vedic Pandit hoon, main aapko dharmik marg par le chalta hoon. Kripya koi aadhyatmik prashn poochhiye."`
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      success: true, 
      reply: text 
    });

  } catch (error) {
    console.error("Gemini AI Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "AI se jawab nahi mil paya." 
    });
  }
});

export default router;