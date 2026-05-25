export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 가능합니다." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY 환경변수가 없습니다. Vercel Project Settings > Environment Variables에서 GEMINI_API_KEY를 추가한 뒤 Redeploy 해주세요."
    });
  }

  try {
    const { promptText, systemInstruction = "", responseSchema = null } = req.body || {};

    if (!promptText || typeof promptText !== "string") {
      return res.status(400).json({ error: "promptText가 비어 있습니다." });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ]
    };

    if (systemInstruction && typeof systemInstruction === "string") {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (responseSchema) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema
      };
    }

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const googleResponse = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const rawText = await googleResponse.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { rawText };
    }

    if (!googleResponse.ok) {
      const googleMessage =
        data?.error?.message ||
        data?.error ||
        rawText ||
        "Gemini API 요청 실패";

      return res.status(googleResponse.status).json({
        error: "Gemini API 오류",
        details: googleMessage,
        model
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "서버 API 처리 중 오류가 발생했습니다.",
      details: error?.message || String(error)
    });
  }
}
