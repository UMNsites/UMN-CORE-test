export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Clean the key: strips quotes/spaces in case it was pasted badly
  const KEY = (process.env.GROQ_API_KEY || "").replace(/["' ]/g, "").trim();
  if (!KEY.startsWith("gsk_")) {
    return res.status(500).json({
      error: "Server problem: GROQ_API_KEY is missing or malformed. Set it in Vercel → Settings → Environment Variables, then REDEPLOY."
    });
  }

  // Clean the model string: replaces fancy hyphens with real ones
  const MODEL = "llama-3.1-8b-instant".replace(/[\u2010-\u2015\u2212]/g, "-").trim();

  // Read incoming messages safely
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
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

  let response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + KEY
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }].concat(messages),
        max_tokens: 1024,
        temperature: 0.7
      })
    });
  } catch (err) {
    return res.status(502).json({ error: "Could not reach Groq: " + err.message });
  }

  // Read the RAW response so Groq's exact answer is never hidden from us
  const raw = await response.text();

  if (!response.ok) {
    return res.status(response.status).json({
      error: raw,
      debug: { model_sent: MODEL, upstream_status: response.status }
    });
  }

  let data;
  try { data = JSON.parse(raw); } catch {
    return res.status(502).json({ error: "Groq sent non-JSON: " + raw.slice(0, 300) });
  }

  const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!reply) {
    return res.status(502).json({ error: "Unexpected Groq response: " + raw.slice(0, 300) });
  }

  return res.status(200).json({ reply: reply });
}
