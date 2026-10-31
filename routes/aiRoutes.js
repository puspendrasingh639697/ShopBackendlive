import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // 🔥 .env load karo

const router = express.Router();

// 🔥 Key .env se aa rahi hai (direct nahi hai)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, 
});

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "openrouter/free", // 🔥 Free Model
      messages: [
        {
          role: "system",
          content: `Aap ek anubhavi Vedic Pandit aur Hindu Temple Guide hain. 
          Aap sirf Hindu mythology, pujas, Vedic rituals, mantras, temples, aur festivals ke baare mein baat karenge. 
          Agar koi user aisi baat pooche jo isse alag ho, toh use vinamrata se dharmik aur spiritual baaton par wapas le aayein. 
          Aapki bhasha aadarful, shuddh aur aadhyaatmik honi chahiye.`
        },
        { role: "user", content: message }
      ],
    });

    res.status(200).json({
      success: true,
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "AI se jawab nahi mil paya." 
    });
  }
});

export default router;