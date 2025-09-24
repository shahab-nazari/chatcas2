// api/generate.js
export default async function handler(req, res) {
  try {
    // accept GET ?prompt=... or POST body { prompt, steps }
    let prompt = "";
    let steps = 4;

    if (req.method === "GET") {
      prompt = (req.query.prompt || "").toString().trim();
    } else if (req.method === "POST") {
      const body = req.body || {};
      prompt = (body.prompt || "").toString().trim();
      if (body.steps) steps = body.steps;
    } else {
      return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
    }

    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    // forward request to fooocus.one
    const upstream = await fetch("https://fooocus.one/api/flux-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*"
      },
      body: JSON.stringify({ prompt, steps })
    });

    const text = await upstream.text(); // ممکنه JSON باشه یا چیز دیگه
    // سعی کنیم JSON پارس کنیم، اگر نرفت متن خام برگردد
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // upstream possibly returned plain text
      return res.status(upstream.status).send(text);
    }

    return res.status(upstream.status).json(parsed);

  } catch (err) {
    console.error("Relay error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
