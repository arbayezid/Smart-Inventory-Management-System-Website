const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

router.post('/ask', protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    // Fetch data context for this specific ShopOwner securely 
    const products = await Product.find({ shopId: req.user._id });
    
    // We construct a specific context string to feed to the AI
    const dataContext = `
    Context: You are an AI-powered Analytics Assistant for a Shop Owner named ${req.user.name}.
    Here is their current database of products in JSON format:
    ${JSON.stringify(products.map(p => ({name: p.name, stock: p.quantity, price: p.price, category: p.category})))}
    
    User prompt: "${prompt}"
    
    Task: Answer the user's prompt directly based on the JSON context provided above. Keep it concise, helpful, and business-focused. If the answer is not in the data context, let them know politely.
    `;

    // Make request to Gemini
    // We check if API key exists. If not, return a mock response for rapid development.
    if (!process.env.GEMINI_API_KEY) {
       console.log("No GEMINI_API_KEY found, returning generic AI response for demo.");
       return res.json({ 
         answer: `(DEMO MODE - No API Key Provided)\nFor prompt '${prompt}', we found ${products.length} total products. You need to supply GEMINI_API_KEY in backend/.env to get real AI responses!` 
       });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [dataContext]
    });

    res.json({ answer: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI processing failed: ' + err.message });
  }
});

module.exports = router;
