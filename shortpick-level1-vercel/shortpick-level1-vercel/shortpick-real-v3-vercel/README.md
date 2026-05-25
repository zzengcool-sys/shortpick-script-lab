# ShortPick Script Lab - Real Vercel Level 1

이 버전은 업로드한 `shortpick_lab_workspace` 화면을 Vercel 실사용 구조로 바꾼 버전입니다.

## 바뀐 점

1. Gemini API 키가 프론트 코드에서 제거되었습니다.
2. 프론트는 `/api/gemini`만 호출합니다.
3. 실제 API 호출은 `api/gemini.js`에서 처리합니다.
4. Vercel 환경변수 `GEMINI_API_KEY`, `GEMINI_MODEL`을 사용합니다.
5. 링크만으로 실제 TikTok/YouTube 영상을 읽는다고 속이지 않도록 수정했습니다.
6. API 실패 시 효소 데모 상품으로 자동 대체되던 부분을 제거했습니다.
7. 사용자가 입력한 상품명/카테고리/판매포인트를 고정하도록 프롬프트를 강화했습니다.
8. 경상도/전라도 사투리 15초 대본이 결과에 추가됩니다.

## Vercel 설정

Project Settings → Environment Variables 에 아래 2개를 넣으세요.

- `GEMINI_API_KEY` : Google AI Studio에서 받은 API 키
- `GEMINI_MODEL` : 예시 `gemini-1.5-flash`

추가 후 반드시 **Redeploy** 해야 반영됩니다.

## 사용 주의

Level 1은 링크 안의 영상을 자동 재생/다운로드/자막 추출하지 않습니다.
링크는 참고 주소이고, 정확한 분석을 원하면 아래를 직접 넣어야 합니다.

- 영상 제목/캡션
- 영상 화면 설명
- 영상 자막/대사
- 조회수/댓글/반응
- 판매할 상품명
- 판매 포인트

자동 링크 크롤링, 유튜브 자막 추출, 틱톡/인스타 영상 수집은 Level 2 기능입니다.
