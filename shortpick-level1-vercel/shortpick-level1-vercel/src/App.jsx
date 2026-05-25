import React, { useMemo, useState } from 'react';

const defaultTarget = {
  age: '35~50대 여성',
  lifestyle: '운동은 하지만 식단과 체형 관리가 어려운 분, 바쁜 일상 속 체형 및 이너뷰티 관리에 관심 있는 분',
  concerns: '입마름, 단백질 부족, 아랫배 붓기, 잘 안 빠지는 나잇살, 소화 더부룩함, 피부 탄력 저하, 만성 피로',
  interests: '건강식품, 다이어트 간식, 단백질 제품, 효소/유산균, 생활 꿀템, 뷰티/이너뷰티'
};

const emptyForm = {
  referenceUrl: '',
  referenceTitle: '',
  referenceSummary: '',
  metrics: '',
  productName: '',
  category: '',
  sellingPoint: '',
  videoLength: 'both',
  dialect: 'standard',
  age: defaultTarget.age,
  lifestyle: defaultTarget.lifestyle,
  concerns: defaultTarget.concerns,
  interests: defaultTarget.interests
};

const dialectLabel = {
  standard: '표준 판매톤',
  gyeongsang: '경상도 사투리',
  jeolla: '전라도 사투리',
  chungcheong: '충청도 사투리'
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function stripCodeFence(text) {
  return String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function makeTone(text, dialect) {
  if (!text) return '';
  if (dialect === 'standard') return text;
  if (dialect === 'gyeongsang') {
    return text
      .replace(/보세요/g, '보이소')
      .replace(/해보세요/g, '해보이소')
      .replace(/좋아요/g, '좋다 아입니까')
      .replace(/놓치지 마세요/g, '놓치면 아깝다 아입니까')
      .replace(/확인하세요/g, '확인해보이소');
  }
  if (dialect === 'jeolla') {
    return text
      .replace(/보세요/g, '봐부러요')
      .replace(/해보세요/g, '해봐부러요')
      .replace(/좋아요/g, '괜찮당께요')
      .replace(/놓치지 마세요/g, '놓치면 아깝당께요')
      .replace(/확인하세요/g, '확인해봐부러요');
  }
  if (dialect === 'chungcheong') {
    return text
      .replace(/보세요/g, '봐유')
      .replace(/해보세요/g, '해봐유')
      .replace(/좋아요/g, '괜찮아유')
      .replace(/놓치지 마세요/g, '놓치면 아까워유')
      .replace(/확인하세요/g, '확인해봐유');
  }
  return text;
}

function fallbackGenerate(form, reason = '') {
  const name = form.productName.trim() || '입력한 상품';
  const category = form.category.trim() || '쇼핑 상품';
  const point = form.sellingPoint.trim() || '간편하게 사용할 수 있고 일상 고민을 줄여주는 점';
  const concern = form.concerns.trim() || defaultTarget.concerns;
  const audience = form.age.trim() || defaultTarget.age;
  const hookBase = `${audience}가 ${category} 고를 때 제일 먼저 봐야 할 건 바로 이거예요.`;

  const scripts15 = [
    {
      title: '공감 문제해결형',
      script: `${hookBase} ${concern.split(',')[0]} 때문에 고민이라면 ${name} 한 번 체크해보세요. ${point}. 지금 필요한 분들은 상세 페이지에서 혜택 먼저 확인하세요.`
    },
    {
      title: '비교 설득형',
      script: `비슷한 ${category} 많죠? 그런데 ${name}은 ${point} 이 부분이 달라요. 매번 고민만 했다면 이번엔 기준을 바꿔보세요. 구매 전 옵션 꼭 확인하세요.`
    },
    {
      title: '리뷰형',
      script: `처음엔 반신반의했는데 ${name}, 생각보다 실사용 포인트가 확실했어요. ${point}. 바쁜 분들이 쓰기 좋고, 지금 혜택 있을 때 보는 게 좋아요.`
    },
    {
      title: '긴급 혜택형',
      script: `${category} 찾던 분들, 이건 그냥 넘기지 마세요. ${name}은 ${point}. 필요했던 분들은 가격 올라가기 전에 지금 구성 확인해보세요.`
    },
    {
      title: '짧은 후킹형',
      script: `이런 고민 있으면 ${name} 먼저 보세요. ${concern.split(',').slice(0, 2).join(', ')} 때문에 불편했다면 ${point}. 아래 링크에서 바로 확인하세요.`
    }
  ].map(item => ({ ...item, script: makeTone(item.script, form.dialect) }));

  const script20 = makeTone(
    `처음 3초는 고민부터 보여주세요. “요즘 ${concern.split(',')[0]} 때문에 불편하지 않으세요?”라고 시작합니다. 그다음 ${name}을 보여주면서 ${point}를 짧게 설명하세요. 마지막에는 “필요한 분들은 오늘 구성과 가격을 먼저 확인하세요”로 마무리하면 됩니다.`,
    form.dialect
  );

  return {
    notice: reason ? `Gemini 응답이 불안정해서 기본 안전 생성으로 표시했어요. 사유: ${reason}` : '',
    summary: `${name}은 ${audience}에게 ${concern.split(',').slice(0, 2).join(', ')} 고민을 건드리면서 판매하기 좋은 ${category} 상품입니다. 첫 장면은 문제 상황을 먼저 보여주고, 바로 ${point}를 증거처럼 보여주는 구성이 좋습니다.`,
    keycuts: [
      { time: '0~3초', image: '고민이 드러나는 얼굴/손/상황 클로즈업', subtitle: `${concern.split(',')[0]} 고민이면 멈춰보세요`, tip: '첫 장면은 제품보다 불편한 상황을 먼저 보여주세요.' },
      { time: '3~7초', image: `${name} 제품 등장 + 손으로 사용하는 장면`, subtitle: `이게 편한 이유는 ${point.split(',')[0] || point}`, tip: '제품명과 핵심 장점을 한 번에 보이게 촬영하세요.' },
      { time: '7~12초', image: '사용 전/후 또는 비교 장면', subtitle: '써보면 차이가 바로 느껴지는 포인트', tip: '과장 표현 대신 실제 사용감 중심으로 보여주세요.' },
      { time: '12~15초', image: '가격/구성/혜택 또는 링크 유도 장면', subtitle: '필요했던 분들은 지금 구성 확인', tip: '손가락으로 하단 링크를 가리키거나 구매 화면을 짧게 보여주세요.' }
    ],
    scripts15,
    script20,
    cta: [
      `${name}, 지금 혜택 구성 먼저 확인해보세요.`,
      `필요했던 분들은 아래 링크에서 옵션부터 비교해보세요.`,
      `오늘 쇼핑 리스트에 넣어둘 만한 ${category}입니다.`
    ],
    comments: [
      `실사용 포인트는 ${point.split(',')[0] || point}예요. 궁금한 점은 댓글로 남겨주세요.`,
      `비슷한 제품이 많아서 헷갈린다면 ${name} 기준으로 비교해보세요.`
    ],
    thumbnail: [
      `이거 왜 이제 샀지?`,
      `${audience} 추천템`,
      `${category} 고를 때 이것부터`
    ]
  };
}

function buildPrompt(form) {
  const exactName = form.productName.trim();
  const dialect = dialectLabel[form.dialect] || '표준 판매톤';
  return `
너는 한국 쇼핑 숏폼 구매전환 대본 전문가다.
아래 입력값만 사용해서 결과를 만들어라.
중요 규칙:
- 상품명은 반드시 정확히 "${exactName}" 그대로 써라. 절대 다른 상품명으로 바꾸지 마라.
- 제품 효능을 허위·과장하지 마라. 의료적 치료, 확실한 감량, 보장 표현 금지.
- 링크를 실제로 읽었다고 말하지 마라. 입력된 제목/설명/판매포인트를 바탕으로 추정 분석하라.
- 결과는 한국 소비자에게 자연스러운 말투로 작성하라.
- 요청 말투: ${dialect}. scripts15와 script20에 이 말투를 반영하라.
- 반드시 JSON만 출력하라. 마크다운 금지.

입력값:
참고 링크: ${form.referenceUrl || '없음'}
참고 영상 제목/컨셉: ${form.referenceTitle || '없음'}
참고 영상 내용/자막/화면 설명: ${form.referenceSummary || '없음'}
조회수/댓글/반응: ${form.metrics || '없음'}
상품명: ${exactName}
상품 카테고리: ${form.category}
핵심 판매 포인트: ${form.sellingPoint}
타깃: ${form.age}
라이프스타일: ${form.lifestyle}
핵심 고민: ${form.concerns}
관심사: ${form.interests}
원하는 길이: ${form.videoLength}

아래 JSON 구조와 필드명을 그대로 지켜라:
{
  "summary": "결론 요약 3~5문장",
  "keycuts": [
    {"time":"0~3초", "image":"키컷 이미지/장면 구성", "subtitle":"화면 자막", "tip":"촬영 팁"}
  ],
  "scripts15": [
    {"title":"버전명", "script":"15초 전체 대본"}
  ],
  "script20": "20초 전체 대본",
  "cta": ["CTA 문구 1", "CTA 문구 2", "CTA 문구 3"],
  "comments": ["고정댓글 1", "고정댓글 2"],
  "thumbnail": ["썸네일 문구 1", "썸네일 문구 2", "썸네일 문구 3"]
}

조건:
- keycuts는 정확히 4개.
- scripts15는 정확히 5개.
- 각 15초 대본에는 후킹, 공감, 문제제기, 해결, 장점, 구매유도가 들어가야 한다.
- 20초 대본은 후킹, 공감, 문제제기, 해결, 장점, 구매유도 순서로 써라.
`;
}

function CopyButton({ text, label = '복사' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text || '');
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    } catch {
      alert('복사에 실패했어요. 텍스트를 직접 선택해서 복사해주세요.');
    }
  };
  return <button className="smallBtn" type="button" onClick={copy}>{done ? '복사됨' : label}</button>;
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return form.productName.trim() && form.sellingPoint.trim();
  }, [form.productName, form.sellingPoint]);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const fillBeautyExample = () => {
    setForm(prev => ({
      ...prev,
      referenceUrl: 'https://youtube.com/shorts/예시',
      referenceTitle: '운동 후 피부 열감 진정 루틴',
      referenceSummary: '운동 후 얼굴이 붉어지고 건조해진 상태를 보여준 뒤, 앰플을 바르고 촉촉하게 진정된 피부를 보여주는 UGC 스타일 영상.',
      metrics: '조회수 40만 / 댓글 230개',
      productName: '피부 진정 수분 앰플',
      category: '화장품 / 스킨케어',
      sellingPoint: '운동 후 열감 케어, 끈적임 적은 수분감, 휴대하기 쉬운 사이즈, 메이크업 전 사용 가능',
      dialect: 'gyeongsang'
    }));
    setResult(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('상품명과 핵심 판매 포인트는 꼭 입력해야 해요.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(form) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.details || data?.error || 'API 호출 실패');

      const raw = stripCodeFence(data.text);
      const parsed = JSON.parse(raw);
      const normalized = {
        ...fallbackGenerate(form),
        ...parsed,
        keycuts: safeArray(parsed.keycuts).length ? parsed.keycuts : fallbackGenerate(form).keycuts,
        scripts15: safeArray(parsed.scripts15).length ? parsed.scripts15 : fallbackGenerate(form).scripts15,
        cta: safeArray(parsed.cta).length ? parsed.cta : fallbackGenerate(form).cta,
        comments: safeArray(parsed.comments).length ? parsed.comments : fallbackGenerate(form).comments,
        thumbnail: safeArray(parsed.thumbnail).length ? parsed.thumbnail : fallbackGenerate(form).thumbnail,
        notice: ''
      };
      setResult(normalized);
    } catch (err) {
      const fallback = fallbackGenerate(form, err.message);
      setResult(fallback);
      setError('Gemini 연결이 불안정해서 기본 생성 결과를 먼저 보여줬어요. 환경변수나 API 상태를 확인하면 AI 품질로 다시 생성됩니다.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        document.getElementById('resultArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const fullResultText = result ? [
    '① 결론 요약', result.summary,
    '', '② 키컷 이미지 / 장면 구성',
    ...result.keycuts.map(k => `${k.time} | ${k.image} | ${k.subtitle} | ${k.tip}`),
    '', '③ 15초 대본 5종',
    ...result.scripts15.map((s, i) => `${i + 1}. ${s.title}\n${s.script}`),
    '', '④ 20초 대본', result.script20,
    '', '⑤ CTA / 댓글 / 썸네일 문구',
    'CTA: ' + result.cta.join(' / '),
    '댓글: ' + result.comments.join(' / '),
    '썸네일: ' + result.thumbnail.join(' / ')
  ].join('\n') : '';

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">ShortPick Script Lab · Level 1.2 Real</p>
          <h1>쇼핑 숏폼 실사용 대본 생성기</h1>
          <p>상품명과 판매 포인트를 넣으면 키컷, 후킹, 공감, 문제제기, 해결, 장점, 구매유도까지 바로 뽑아줘.</p>
          <p className="note">Level 1은 링크 영상을 자동으로 읽는 단계가 아니야. 링크는 참고용이고, 영상 제목/자막/화면 설명을 같이 넣으면 정확도가 올라가.</p>
        </div>
        <div className="heroActions">
          <button type="button" onClick={fillBeautyExample}>뷰티 예시 채우기</button>
          <button type="button" onClick={() => { setForm(emptyForm); setResult(null); setError(''); }}>초기화</button>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h2>1. 참고 영상 정보</h2>
          <label>참고 영상 링크</label>
          <input value={form.referenceUrl} onChange={e => setField('referenceUrl', e.target.value)} placeholder="YouTube Shorts / TikTok / Instagram Reels 링크" />
          <label>영상 제목 / 컨셉</label>
          <input value={form.referenceTitle} onChange={e => setField('referenceTitle', e.target.value)} placeholder="예: 운동 후 피부 진정 루틴" />
          <label>영상 내용 / 자막 / 화면 설명</label>
          <textarea value={form.referenceSummary} onChange={e => setField('referenceSummary', e.target.value)} placeholder="영상에서 보이는 장면과 자막을 간단히 적어줘. 링크만으로 모든 영상을 자동 분석하는 건 Level 2 기능이야." />
          <label>조회수 / 댓글 / 반응</label>
          <input value={form.metrics} onChange={e => setField('metrics', e.target.value)} placeholder="예: 조회수 40만 / 댓글 230개" />
        </div>

        <div className="card">
          <h2>2. 판매할 상품 정보</h2>
          <label>상품명 *</label>
          <input value={form.productName} onChange={e => setField('productName', e.target.value)} placeholder="예: 피부 진정 수분 앰플" />
          <label>상품 카테고리</label>
          <input value={form.category} onChange={e => setField('category', e.target.value)} placeholder="예: 화장품 / 스킨케어" />
          <label>핵심 판매 포인트 *</label>
          <textarea value={form.sellingPoint} onChange={e => setField('sellingPoint', e.target.value)} placeholder="예: 운동 후 열감 케어, 끈적임 적은 수분감, 휴대하기 쉬움" />
          <div className="inlineGrid">
            <div>
              <label>원하는 영상 길이</label>
              <select value={form.videoLength} onChange={e => setField('videoLength', e.target.value)}>
                <option value="both">15초 / 20초</option>
                <option value="15">15초 중심</option>
                <option value="20">20초 중심</option>
              </select>
            </div>
            <div>
              <label>말투 / 사투리</label>
              <select value={form.dialect} onChange={e => setField('dialect', e.target.value)}>
                <option value="standard">표준 판매톤</option>
                <option value="gyeongsang">경상도 사투리</option>
                <option value="jeolla">전라도 사투리</option>
                <option value="chungcheong">충청도 사투리</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>3. 타깃 설정</h2>
        <div className="grid two compact">
          <div><label>성별 / 연령</label><input value={form.age} onChange={e => setField('age', e.target.value)} /></div>
          <div><label>라이프스타일</label><input value={form.lifestyle} onChange={e => setField('lifestyle', e.target.value)} /></div>
          <div><label>핵심 고민</label><textarea value={form.concerns} onChange={e => setField('concerns', e.target.value)} /></div>
          <div><label>관심사</label><textarea value={form.interests} onChange={e => setField('interests', e.target.value)} /></div>
        </div>
        {error && <p className="warning">{error}</p>}
        <button className="primary" type="button" onClick={handleSubmit} disabled={loading || !canSubmit}>
          {loading ? '대본 생성 중…' : '실제 쇼핑 숏폼 대본 생성하기'}
        </button>
      </section>

      <section id="resultArea" className="results">
        {!result && !loading && (
          <div className="emptyState">아직 결과가 없어. 위 정보를 넣고 보라색 생성 버튼을 누르면 이 아래에 결과가 나타나.</div>
        )}
        {loading && <div className="emptyState loading">Gemini가 대본을 만드는 중이야. 잠깐만 기다려줘…</div>}
        {result && (
          <>
            <div className="resultTop">
              <h2>생성 결과</h2>
              <CopyButton text={fullResultText} label="전체 결과 복사" />
            </div>
            {result.notice && <p className="warning">{result.notice}</p>}

            <div className="resultCard">
              <h3>① 결론 요약</h3>
              <p>{result.summary}</p>
            </div>

            <div className="resultCard">
              <h3>② 키컷 이미지 / 장면 구성</h3>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>시간</th><th>키컷 이미지</th><th>자막</th><th>촬영 팁</th><th>복사</th></tr></thead>
                  <tbody>
                    {result.keycuts.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.time}</td>
                        <td>{row.image}</td>
                        <td>{row.subtitle}</td>
                        <td>{row.tip}</td>
                        <td><CopyButton text={`${row.time}\n${row.image}\n${row.subtitle}\n${row.tip}`} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="resultCard">
              <h3>③ 15초 대본 5종</h3>
              <div className="scriptGrid">
                {result.scripts15.map((item, idx) => (
                  <article className="scriptBox" key={idx}>
                    <div className="scriptHead"><strong>{idx + 1}. {item.title}</strong><CopyButton text={item.script} /></div>
                    <p>{item.script}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="resultCard">
              <h3>④ 20초 대본</h3>
              <CopyButton text={result.script20} />
              <p className="scriptLong">{result.script20}</p>
            </div>

            <div className="resultCard">
              <h3>⑤ CTA / 댓글 / 썸네일 문구</h3>
              <div className="miniCols">
                <div><h4>CTA</h4>{result.cta.map((x, i) => <p key={i}>• {x}</p>)}</div>
                <div><h4>고정댓글</h4>{result.comments.map((x, i) => <p key={i}>• {x}</p>)}</div>
                <div><h4>썸네일 문구</h4>{result.thumbnail.map((x, i) => <p key={i}>• {x}</p>)}</div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
