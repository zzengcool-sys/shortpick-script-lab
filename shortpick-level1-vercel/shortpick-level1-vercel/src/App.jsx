import React, { useMemo, useState } from "react";

const DEFAULT_TARGET = {
  genderAge: "35~50대 여성",
  lifestyle: "운동은 하지만 식단과 체형 관리가 어려운 분, 바쁜 일상 속 체형 및 이너뷰티 관리가 필요함",
  concerns: "입마름, 단백질 부족, 아랫배 붓기, 잘 안 빠지는 나잇살, 소화 더부룩함, 피부 탄력 저하, 만성 피로",
  interests: "건강식품, 다이어트 간식, 단백질 제품, 효소/유산균, 생활 꿀템, 뷰티/이너뷰티"
};

const emptyForm = {
  inputMode: "link",
  videoUrl: "",
  videoTitle: "",
  videoContent: "",
  metrics: "",
  productName: "",
  productCategory: "",
  targetGenderAge: DEFAULT_TARGET.genderAge,
  targetLifestyle: DEFAULT_TARGET.lifestyle,
  targetConcerns: DEFAULT_TARGET.concerns,
  targetInterests: DEFAULT_TARGET.interests,
  sellingPoint: "",
  videoLength: "15초 / 20초"
};

function detectPlatform(url = "") {
  const lower = url.toLowerCase();
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "YouTube Shorts";
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("instagram") || lower.includes("reels")) return "Instagram Reels";
  if (lower.includes("xiaohongshu") || lower.includes("xhslink")) return "Xiaohongshu";
  return "Short-form platform";
}

async function callApi(payload) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "API 요청에 실패했습니다.");
  }
  return data;
}

function copyText(text) {
  navigator.clipboard.writeText(text);
}

function Section({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ScriptCard({ title, script }) {
  if (!script) return null;
  const full = [script.hook, script.empathy, script.problem, script.solution, script.benefit, script.cta]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="script-card">
      <div className="script-head">
        <h3>{title}</h3>
        <button type="button" onClick={() => copyText(full)}>복사</button>
      </div>
      <p><b>후킹</b> {script.hook}</p>
      <p><b>공감</b> {script.empathy}</p>
      {script.problem && <p><b>문제제기</b> {script.problem}</p>}
      <p><b>해결</b> {script.solution}</p>
      <p><b>장점</b> {script.benefit}</p>
      <p><b>구매유도</b> {script.cta}</p>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const detectedPlatform = useMemo(() => detectPlatform(form.videoUrl), [form.videoUrl]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadDemo = () => {
    setForm({
      inputMode: "link",
      videoUrl: "https://youtube.com/shorts/sample",
      videoTitle: "배수구 냄새 때문에 화장실 들어가기 싫다면",
      videoContent:
        "화장실 배수구에서 냄새가 올라오는 장면을 보여준 뒤, 팝업형 배수구 트랩을 손으로 끼워 넣고 물을 흘려보내는 장면. 마지막에는 머리카락과 찌꺼기가 쉽게 걸러지고 냄새가 줄어드는 사용 전후를 보여줌.",
      metrics: "조회수 80만회 / 댓글 600개 추정",
      productName: "팝업형 화장실 배수구 트랩",
      productCategory: "생활꿀템 / 욕실 청소",
      targetGenderAge: DEFAULT_TARGET.genderAge,
      targetLifestyle: "집안 냄새, 물때, 머리카락 청소가 번거로운 바쁜 1~2인 가구와 3050 여성",
      targetConcerns: "화장실 냄새, 배수구 벌레, 머리카락 막힘, 손대기 싫은 청소, 물때",
      targetInterests: "생활꿀템, 욕실용품, 청소템, 살림템, 집안 냄새 관리",
      sellingPoint:
        "끼우기만 하면 되는 간편 설치, 손 안 대고 머리카락 필터링, 물빠짐 유지, 냄새 역류 방지 구조, 세척 쉬움, 욕실 분위기 깔끔함",
      videoLength: "15초 / 20초"
    });
    setResult(null);
    setError("");
  };

  const resetAll = () => {
    setForm(emptyForm);
    setResult(null);
    setError("");
  };

  const analyzeReference = async () => {
    setError("");
    if (!form.videoUrl.trim() && !form.videoContent.trim()) {
      setError("참고 영상 링크 또는 영상 설명을 먼저 넣어줘.");
      return;
    }

    setReferenceLoading(true);
    try {
      const data = await callApi({
        mode: "analyzeReference",
        payload: {
          inputMode: form.inputMode,
          videoUrl: form.videoUrl,
          videoContent: form.videoContent,
          platform: detectedPlatform
        }
      });

      setForm((prev) => ({
        ...prev,
        videoTitle: data.result.estimatedTitle || prev.videoTitle,
        metrics: data.result.estimatedMetrics || prev.metrics,
        videoContent: data.result.estimatedContent || prev.videoContent
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setReferenceLoading(false);
    }
  };

  const generateScript = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!form.productName.trim()) {
      setError("상품명은 꼭 넣어줘.");
      return;
    }
    if (!form.sellingPoint.trim()) {
      setError("상품 장점/판매 소구점은 꼭 넣어줘.");
      return;
    }

    setScriptLoading(true);
    try {
      const data = await callApi({
        mode: "generateScript",
        payload: {
          ...form,
          detectedPlatform
        }
      });
      setResult(data.result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setScriptLoading(false);
    }
  };

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">ShortPick Script Lab · Level 1</p>
          <h1>쇼핑 숏폼 실사용 대본 생성기</h1>
          <p>
            상품명과 판매 포인트를 넣으면 키컷, 후킹, 공감, 문제제기, 해결, 장점, 구매유도까지 바로 뽑아줘.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" onClick={loadDemo}>예시 채우기</button>
          <button type="button" className="ghost" onClick={resetAll}>초기화</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result-grid">
          <Section title="① 결론 요약">
            <ul className="summary-list">
              {result.summary?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="② 키컷 이미지 / 장면 구성">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>키컷 이미지</th>
                    <th>자막</th>
                    <th>촬영 팁</th>
                  </tr>
                </thead>
                <tbody>
                  {result.storyboard?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.time}</td>
                      <td>{item.layout}</td>
                      <td>{item.subtitle}</td>
                      <td>{item.tip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="③ 15초 대본 5종">
            <div className="scripts">
              <ScriptCard title="품절/한정형" script={result.scripts15s?.soldOut} />
              <ScriptCard title="공감형" script={result.scripts15s?.empathy} />
              <ScriptCard title="비교형" script={result.scripts15s?.comparison} />
              <ScriptCard title="전문가형" script={result.scripts15s?.expert} />
              <ScriptCard title="후기형" script={result.scripts15s?.review} />
            </div>
          </Section>

          <Section title="④ 20초 대본">
            <ScriptCard title="20초 판매형 대본" script={result.script20s} />
          </Section>

          <Section title="⑤ CTA / 댓글 / 썸네일 문구">
            <div className="chips">
              {result.ctas?.map((item, index) => (
                <button key={index} type="button" onClick={() => copyText(item)}>
                  {item}
                </button>
              ))}
            </div>
            <h3 className="mini-title">썸네일 문구</h3>
            <div className="chips">
              {result.copywriting?.thumbnails?.map((item, index) => (
                <button key={index} type="button" onClick={() => copyText(item)}>
                  {item}
                </button>
              ))}
            </div>
          </Section>
        </div>
      )}

      <form className="layout" onSubmit={generateScript}>
        <section className="panel">
          <h2>1. 참고 영상 정보</h2>
          <label>
            참고 영상 링크
            <input
              value={form.videoUrl}
              onChange={(e) => update("videoUrl", e.target.value)}
              placeholder="YouTube Shorts / TikTok / Instagram Reels 링크"
            />
          </label>
          <p className="hint">감지 플랫폼: {detectedPlatform}</p>

          <label>
            영상 제목 / 캡션
            <input
              value={form.videoTitle}
              onChange={(e) => update("videoTitle", e.target.value)}
              placeholder="예: 화장실 냄새 한 번에 잡는 욕실템"
            />
          </label>

          <label>
            영상 내용 / 자막 / 화면 설명
            <textarea
              value={form.videoContent}
              onChange={(e) => update("videoContent", e.target.value)}
              placeholder="영상에서 보이는 장면을 간단히 적어줘. 링크만으로 모든 플랫폼 영상을 완벽히 읽는 건 아직 2단계 기능이야."
            />
          </label>

          <label>
            조회수 / 댓글 / 반응
            <input
              value={form.metrics}
              onChange={(e) => update("metrics", e.target.value)}
              placeholder="예: 조회수 40만 / 댓글 230개"
            />
          </label>

          <button type="button" className="secondary" onClick={analyzeReference} disabled={referenceLoading}>
            {referenceLoading ? "참고 영상 분석 중..." : "참고 영상 구조 추정하기"}
          </button>
        </section>

        <section className="panel">
          <h2>2. 판매할 상품 정보</h2>
          <label>
            상품명 *
            <input
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
              placeholder="예: 팝업형 화장실 배수구 트랩"
            />
          </label>

          <label>
            상품 카테고리
            <input
              value={form.productCategory}
              onChange={(e) => update("productCategory", e.target.value)}
              placeholder="예: 생활꿀템 / 욕실 청소"
            />
          </label>

          <label>
            핵심 판매 포인트 *
            <textarea
              value={form.sellingPoint}
              onChange={(e) => update("sellingPoint", e.target.value)}
              placeholder="예: 설치가 쉽다, 냄새 역류 방지, 머리카락 필터링, 세척 간편..."
            />
          </label>

          <label>
            원하는 영상 길이
            <select value={form.videoLength} onChange={(e) => update("videoLength", e.target.value)}>
              <option>15초</option>
              <option>20초</option>
              <option>15초 / 20초</option>
              <option>15초 / 20초 / 30초</option>
            </select>
          </label>
        </section>

        <section className="panel wide">
          <h2>3. 타깃 설정</h2>
          <div className="target-grid">
            <label>
              성별/연령
              <input value={form.targetGenderAge} onChange={(e) => update("targetGenderAge", e.target.value)} />
            </label>
            <label>
              라이프스타일
              <input value={form.targetLifestyle} onChange={(e) => update("targetLifestyle", e.target.value)} />
            </label>
            <label>
              핵심 고민
              <textarea value={form.targetConcerns} onChange={(e) => update("targetConcerns", e.target.value)} />
            </label>
            <label>
              관심사
              <textarea value={form.targetInterests} onChange={(e) => update("targetInterests", e.target.value)} />
            </label>
          </div>

          <button type="submit" className="primary" disabled={scriptLoading}>
            {scriptLoading ? "AI 대본 생성 중..." : "실제 쇼핑 숏폼 대본 생성하기"}
          </button>
        </section>
      </form>
    </main>
  );
}
