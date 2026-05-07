const functions = require('@google-cloud/functions-framework');

const GEMINI_API_KEY = "RealKeyNotHere";
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-2.5-flash"];

functions.http('generateRecipes', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "No prompt provided." });
    return;
  }

  for (let i = 0; i < MODELS.length; i++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS[i]}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();

      if (response.ok && data.candidates) {
        res.json({ recipe: data.candidates[0].content.parts[0].text });
        return;
      }
      console.warn(MODELS[i] + " failed:", data.error?.message);
    } catch (error) {
      console.warn(MODELS[i] + " error:", error.message);
    }
  }

  res.status(500).json({ error: "All models failed." });
});
