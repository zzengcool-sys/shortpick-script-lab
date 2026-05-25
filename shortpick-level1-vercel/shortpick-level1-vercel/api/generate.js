const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const REPORT_SCHEMA = {
  type: "object",
  required: [
    "summary",
    "basicInfo",
    "whyViral",
    "hooks",
    "highRetention",
    "benchmarking",
    "storyboard",
    "scripts15s",
    "script20s",
    "ctas",
    "copywriting"
  ],
  properties: {
    summary: { type: "array", items: { type: "string" } },
    basicInfo: {
      type: "object",
      required: ["platform", "url", "title", "category", "metrics", "reliability", "reliabilityReason"],
      properties: {
        platform: { type: "string" },
        url: { type: "string" },
        title: { type: "string" },
        category: { type: "string" },
        metrics: { type: "string" },
        reliability: { type: "string" },
        reliabilityReason: { type: "string" }
      }
    },
    whyViral: {
      type: "object",
      required: ["hook", "empathy", "problem", "visual", "comment", "conversion"],
      properties: {
        hook: { type: "string" },
        empathy: { type: "string" },
        problem: { type: "string" },
        visual: { type: "string" },
        comment: { type: "string" },
        conversion: { type: "string" }
      }
    },
    hooks: {
      type: "object",
      required: ["whyStop", "koreanHooks"],
      properties: {
        whyStop: { type: "string" },
        koreanHooks: { type: "array", items: { type: "string" } }
      }
    },
    highRetention: {
      type: "object",
      required: ["section", "reason", "tip"],
      properties: {
        section: { type: "string" },
        reason: { type: "string" },
        tip: { type: "string" }
      }
    },
    benchmarking: {
      type: "object",
      required: ["keep", "change", "adapt", "caution"],
      properties: {
        keep: { type: "string" },
        change: { type: "string" },
        adapt: { type: "string" },
        caution: { type: "string" }
      }
    },
    storyboard: {
      type: "array",
      items: {
        type: "object",
        required: ["time", "layout", "subtitle", "narration", "tip"],
        properties: {
          time: { type: "string" },
          layout: { type: "string" },
          subtitle: { type: "string" },
          narration: { type: "string" },
          tip: { type: "string" }
        }
      }
    },
    scripts15s: {
      type: "object",
      required: ["soldOut", "empathy", "comparison", "expert", "review"],
      properties: {
        soldOut: { "$ref": "#/$defs/scriptBlock" },
        empathy: { "$ref": "#/$defs/scriptBlock" },
        comparison: { "$ref": "#/$defs/scriptBlock" },
        expert: { "$ref": "#/$defs/scriptBlock" },
        review: { "$ref": "#/$defs/scriptBlock" }
      }
    },
    script20s: { "$ref": "#/$defs/scriptBlock" },
    ctas: { type: "array", items: { type: "string" } },
    copywriting: {
      type: "object",
      required: ["thumbnails", "captions", "comments"],
      properties: {
        thumbnails: { type: "array", items: { type: "string" } },
        captions: { type: "array", items: { type: "string" } },
        comments: { type: "array", items: { type: "string" } }
      }
    }
  },
  $defs: {
    scriptBlock: {
      type: "object",
      required: ["hook", "empathy", "problem", "solution", "benefit", "cta"],
      properties: {
        hook: { type: "string" },
        empathy: { type: "string" },
        problem: { type: "string" },
        solution: { type: "string" },
        benefit: { type: "string" },
        cta: { type: "string" }
      }
    }
  }
};

const REFERENCE_SCHEMA = {
  type: "object",
  required: ["estimatedTitle", "estimatedMetrics", "estimatedContent"],
  properties: {
    estimatedTitle: { type: "string" },
    estimatedMetrics: { type: "string" },
    estimatedContent: { type: "string" }
  }
};

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function extractText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
}

function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJson(text) {
  const cleaned = cleanJsonText(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI가 JSON 형식으로 응답하지 않았습니다. 다시 생성해 주세요.");
  }
}

async function fetchGemini(payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 없습니다. Vercel Settings → Environment Variables에 추가해 주세요.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data?.error?.message ||
      `Gemini API 요청 실패: HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function buildBasePayload({ systemInstruction, prompt }) {
  return {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };
}

async function callGeminiJson({ systemInstruction, prompt, schema }) {
  const base = buildBasePayload({ systemInstruction, prompt });

  const attempts = [
    {
      ...base,
      generationConfig: {
        temperature: 0.75,
        responseFormat: {
          text: {
            mimeType: "application/json",
            schema
          }
        }
      }
    },
    {
      ...base,
      generationConfig: {
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    },
    {
      ...base,
      generationConfig: {
        temperature: 0.75,
        responseMimeType: "application/json"
      }
    }
  ];

  let lastError;
  for (const payload of attempts) {
    try {
      const data = await fetchGemini(payload);
      const text = extractText(data);
      if (!text) throw new Error("Gemini 응답 텍스트가 비어 있습니다.");
      return parseJson(text);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini 호출에 실패했습니다.");
}

function buildReferencePrompt(payload) {
  return `
[참고 숏폼 분석 요청]

플랫폼: ${payload.platform || "알 수 없음"}
링크: ${payload.videoUrl || "없음"}
사용자가 적은 화면 설명:
${payload.videoContent || "설명 없음"}

주의:
- 실제 플랫폼 내부 데이터를 직접 가져온 것이 아니라, 사용자가 제공한 링크/설명 기반의 추정 분석입니다.
- 한국 쇼핑 숏폼에 맞게 제목, 반응 추정, 영상 구조를 짧고 실무적으로 작성하세요.

반드시 아래 JSON만 반환하세요.
{
  "estimatedTitle": "한국어 제목",
  "estimatedMetrics": "조회수/댓글 등 추정 반응",
  "estimatedContent": "화면 구성과 판매 흐름 설명"
}
`;
}

function buildScriptPrompt(payload) {
  return `
[오리지널 레퍼런스 영상 데이터]
분석 방식: ${payload.inputMode || "link"}
감지된 플랫폼: ${payload.detectedPlatform || "Short-form platform"}
영상 링크: ${payload.videoUrl || "제공 안 됨"}
영상 제목/캡션: ${payload.videoTitle || "제공 안 됨"}
영상 자막/화면 설명/스크립트: ${payload.videoContent || "제공 안 됨"}
조회수 및 지표: ${payload.metrics || "제공 안 됨"}

[한국 판매 기획용 상품 데이터]
상품명: ${payload.productName}
카테고리: ${payload.productCategory || "일반 쇼핑템"}
주요 타깃 성별/연령: ${payload.targetGenderAge}
타깃 라이프스타일: ${payload.targetLifestyle}
타깃의 주 고민사항: ${payload.targetConcerns}
타깃의 주요 관심사: ${payload.targetInterests}
핵심 셀링 포인트: ${payload.sellingPoint}
원하는 영상 길이: ${payload.videoLength}

[출력 규칙]
- 한국 쇼핑 숏폼 실전용으로 작성합니다.
- 각 대본은 후킹, 공감, 문제제기, 해결, 상품 장점, 구매 유도를 반드시 포함합니다.
- 키컷 이미지는 촬영자가 바로 찍을 수 있게 장면 중심으로 씁니다.
- 과대광고, 의학적 단정, 허위 효과 표현은 피합니다.
- "무조건 치료", "100% 효과", "뱃살이 빠진다"처럼 위험한 표현은 피하고 "관리", "도움", "가볍게", "불편함 줄이기"처럼 안전하게 표현합니다.
- 실제 영상 데이터를 직접 크롤링한 것이 아니면 reliabilityReason에 "사용자 제공 정보 기반 추정"이라고 명시합니다.
- 반드시 JSON만 반환합니다.
`;
}

const SYSTEM_SCRIPT = `
당신은 대한민국 쇼핑 숏폼 대본 전문 AI입니다.
목표는 인스타그램 릴스, 틱톡, 유튜브 쇼츠에서 바로 쓸 수 있는 판매형 대본을 만드는 것입니다.
어투는 친근하지만 신뢰감 있게, 35~50대 여성이 바로 이해할 수 있는 현실적인 한국어로 작성합니다.
`;

const SYSTEM_REFERENCE = `
당신은 숏폼 레퍼런스 분석가입니다.
사용자가 제공한 링크나 화면 설명을 바탕으로, 영상의 후킹 구조와 판매 흐름을 추정해 실무용 메타데이터를 생성합니다.
`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 가능합니다." });
  }

  try {
    const body = await readJson(req);
    const { mode, payload = {} } = body;

    if (mode === "analyzeReference") {
      const result = await callGeminiJson({
        systemInstruction: SYSTEM_REFERENCE,
        prompt: buildReferencePrompt(payload),
        schema: REFERENCE_SCHEMA
      });
      return res.status(200).json({ result });
    }

    if (mode === "generateScript") {
      if (!payload.productName || !payload.sellingPoint) {
        return res.status(400).json({ error: "상품명과 판매 소구점은 필수입니다." });
      }

      const result = await callGeminiJson({
        systemInstruction: SYSTEM_SCRIPT,
        prompt: buildScriptPrompt(payload),
        schema: REPORT_SCHEMA
      });
      return res.status(200).json({ result });
    }

    return res.status(400).json({ error: "지원하지 않는 mode입니다." });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "서버 오류가 발생했습니다."
    });
  }
}
