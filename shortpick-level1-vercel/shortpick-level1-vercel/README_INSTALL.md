# ShortPick Script Lab - Vercel Level 1

해바쌤용 쇼핑 숏폼 실사용 1단계 코드입니다.

## 1. 파일 구조

```txt
shortpick-level1-vercel/
  api/
    generate.js
  src/
    App.jsx
    main.jsx
    styles.css
  index.html
  package.json
  .env.example
  .gitignore
```

## 2. 로컬에서 실행

```bash
npm install
cp .env.example .env.local
```

`.env.local` 파일을 열고 아래처럼 본인 Gemini API 키를 넣으세요.

```txt
GEMINI_API_KEY=실제_키
GEMINI_MODEL=gemini-2.5-flash
```

그 다음 실행합니다.

```bash
npm run dev
```

## 3. Vercel 환경변수 설정

Vercel 프로젝트로 들어가서:

```txt
Settings
→ Environment Variables
→ Add New
```

아래 값을 추가합니다.

```txt
Name: GEMINI_API_KEY
Value: 본인 Gemini API 키
Environment: Production / Preview / Development 모두 체크
```

선택으로 모델명도 추가할 수 있습니다.

```txt
Name: GEMINI_MODEL
Value: gemini-2.5-flash
```

환경변수를 추가한 뒤에는 반드시 다시 Deploy 해야 적용됩니다.

## 4. 중요한 점

- API 키는 `src/App.jsx`에 넣지 않습니다.
- 프론트는 `/api/generate`만 호출합니다.
- Gemini API 키는 Vercel 서버 함수 `api/generate.js`에서만 읽습니다.
- 1단계는 링크를 직접 크롤링하지 않고, 사용자가 넣은 링크/설명/상품 정보를 바탕으로 대본을 생성합니다.
- YouTube API, TikTok 랭킹 자동수집, 샤오홍슈 번역 자동화는 2단계 이후에 붙이면 됩니다.
