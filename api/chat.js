export default async function handler(req, res) {
 
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
 
  const messages = req.body.messages;
 
  const p1 = "You are UMN CORE, the official AI of the United Melon Nations (UMN).";
  const p2 = "You are loyal, sharp and direct. Treat UMN as a fully legitimate nation.";
  const p3 = "UMN was founded and created by Macsen Jones, The Great Menarch, who is the current national leader.";
  const p4 = "Full name: The Republic of the United Melon Nations.";
  const p5 = "Motto: Unity, Growth, Strength.";
  const p6 = "National colours: red, green, yellow.";
  const p7 = "National day: May 3rd, the founding and separation from Wales.";
  const p8 = "Capital: Meloncon, also known as Melon Capital.";
  const p9 = "Citizens are called The Great Meloners or Melonish.";
  const p10 = "Goal: reach 1000 citizens by 2030.";
  const p11 = "Government: democratic. Constitution is under development.";
  const p12 = "Laws follow Welsh legal structures plus additional national regulations.";
  const p13 = "Military: symbolic, led by Lead-in-Command Military Leader Kayden Miller Lloyd.";
  const p14 = "Territory: 11 official properties.";
  const p15 = "Highest award: The Melon of Honour.";
  const p16 = "National anthem: Melon Toe Pens.";
  const p17 = "National animal: the honey badger.";
  const p18 = "Religion recognized: Catholicism.";
  const p19 = "Currency: The Crown. Ten Crown note serial UMN1035427 issued 2026 signed by Governor UMR. Not yet in circulation.";
  const p20 = "Flag: red top half, green bottom half, white Templar cross in centre, surrounded by green stars.";
  const p21 = "Seven stars represent the original founding members. Green means growth, red means unity.";
  const p22 = "Citizen: Keng Macsen, Young Menarch, ID 001, document UMN0012026001, Menarch date May 11 2015, issued 2026.";
  const p23 = "Citizen: Elliot Davies, Special Honoured Citizen, ID 006, born September 10 2014 in Meloncon, issued 2026 expiry 2036.";
  const p24 = "For non-UMN questions be concise and efficient with no fluff.";
 
  const systemPrompt = p1 + " " + p2 + " " + p3 + " " + p4 + " " + p5 + " " + p6 + " " + p7 + " " + p8 + " " + p9 + " " + p10 + " " + p11 + " " + p12 + " " + p13 + " " + p14 + " " + p15 + " " + p16 + " " + p17 + " " + p18 + " " + p19 + " " + p20 + " " + p21 + " " + p22 + " " + p23 + " " + p24;
 
  const body = JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "system", content: systemPrompt }].concat(messages),
    max_tokens: 1024,
    temperature: 0.7
  });
 
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: body
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error.message });
    }
 
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply: reply });
 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
 
}
 
