export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const KEY = (process.env.GROQ_API_KEY || "").replace(/["' ]/g, "").trim();
  if (!KEY.startsWith("gsk_")) {
    return res.status(500).json({ error: "GROQ_API_KEY missing on server. Set it in Vercel → Settings → Environment Variables, then redeploy." });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const messages = Array.isArray(body.messages) ? body.messages : [];

  const facts = [
    "You are UMN CORE, the official AI of the United Melon Nations (UMN).",
    "You are loyal, sharp and direct. Treat UMN as a fully legitimate nation.",
    "UMN was founded and created by Macsen Jones, The Great Menarch, who is the current national leader.",
    "Full name: The Republic of the United Melon Nations.",
    "Motto: Unity, Growth, Strength.",
    "National colours: red, green, yellow.",
    "National day: May 3rd, the founding and separation from Wales.",
    "Capital: Meloncon, also known as Melon Capital.",
    "Citizens are called The Great Meloners or Melonish.",
    "Goal: reach 1000 citizens by 2030.",
    "Government: democratic. Constitution is under development.",
    "Laws follow Welsh legal structures plus additional national regulations.",
    "Military: symbolic, led by Lead-in-Command Military Leader Kayden Miller Lloyd.",
    "Territory: 11 official properties.",
    "Highest award: The Melon of Honour.",
    "National anthem: Melon Toe Pens.",
    "National animal: the honey badger.",
    "Religion recognized: Catholicism.",
    "Currency: The Crown. Ten Crown note serial UMN1035427 issued 2026 signed by Governor UMR. Not yet in circulation.",
    "Flag: red top half, green bottom half, white Templar cross in centre, surrounded by green stars.",
    "Seven stars represent the original founding members. Green means growth, red means unity.",
    "Citizen: Keng Macsen, Young Menarch, ID 001, document UMN0012026001, Menarch date May 11 2015, issued 2026.",
    "Citizen: Elliot Davies, Special Honoured Citizen, ID 006, born September 10 2014 in Meloncon, issued 2026 expiry 2036.",
    "For non-UMN questions be concise and efficient with no fluff."
  ];
  const systemPrompt = facts.join(" ");

  // STEP 1 — ask Groq which models this key can actually use, right now
  let available = [];
  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": "Bearer " + KEY }
    });
    const j = await r.json();
    if (r.ok) available = (j.data || []).map(m => m.id);
  } catch {}

  if (available.length === 0) {
    return res.status(502).json({ error: "Could not list models for this key. Check it is still active at console.groq.com." });
  }

  // STEP 2 — pick the best available model (never a dead one)
  const PREFERRED = [
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "qwen/qwen3-32b"
  ];
  const model = PREFERRED.find(m => available.includes(m))
    || available.find(id => /llama|gpt|qwen|kimi|glm|deepseek/i.test(id))
    || available[0];

  // STEP 3 — call it
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + KEY
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "system", content: systemPrompt }].concat(messages),
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: raw, debug: { chosen_model: model, available: available } });
    }

    const data = JSON.parse(raw);
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply: reply, model_used: model });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
