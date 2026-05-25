import React, { useState, useEffect, useRef } from 'react';

// --- Global variables provided by environment ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'shortpick-lab-default';
// Gemini API key is stored only on Vercel serverless API routes.

// Default Target Profile defined by user instructions
const DEFAULT_TARGET = {
  genderAge: "35~50대 여성",
  lifestyle: "운동은 하지만 식단과 체형 관리가 어려운 분, 바쁜 일상 속 체형 및 이너뷰티 관리가 필요함",
  concerns: "입마름, 단백질 부족, 아랫배 붓기, 잘 안 빠지는 나잇살, 소화 더부룩함, 피부 탄력 저하, 만성 피로",
  interests: "건강식품, 다이어트 간식, 단백질 제품, 효소/유산균, 생활 꿀템, 뷰티/이너뷰티"
};

// SVG Icons for reliable rendering
const Icons = {
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
  ),
  Link: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
  ),
  Image: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
  ),
  Play: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  Pause: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  Stop: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h6v6H9V9z"/></svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728L12 5a7 7 0 100 14z"/></svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
  ),
  TextSize: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h12M4 18h8"/></svg>
  ),
  Flame: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  ),
  Wand: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.485 12L12 19.485M19.485 12a3 3 0 00-4.243-4.242L7.757 15.243a3 3 0 000 4.242l.707.707a3 3 0 004.242 0L19.485 12zM9 9l.01-.011M14 6l.01-.01M17 9l.01-.01M12 4l.01-.01M5 8l.01-.01"/></svg>
  )
};

// High-quality Mock Data (Sample) for immediate play/demo
const SAMPLE_ANALYSIS = {
  summary: [
    "자극적인 고탄수 식사 후 직관적인 배부름 and 효소 섭취 후 30분 만의 붓기 감소 전후 차이를 극명한 비포애프터로 매치하여 멈출 수밖에 없게 만듦.",
    "중장년층 여성들의 가장 큰 스트레스인 '나잇살'과 '더부룩함'이라는 고질적인 일상 문제를 일상적인 브이로그(UGC) 형태로 부담 없이 접근함.",
    "과학적 수치(역가수치)나 어려운 성분 설명 대신, '나와 똑같이 먹고 즐기는데 나만 살찌는 억울함'을 건드려 폭발적인 구매 전환을 이끌어냄."
  ],
  basicInfo: {
    platform: "YouTube Shorts",
    url: "https://youtube.com/shorts/sample-viral-enzyme",
    title: "밥 먹고 이거 먹었더니 뱃살 붓기 싹 빠짐 ㄷㄷ #효소추천",
    category: "건강식품 / 다이어트 효소",
    metrics: "조회수 120만회 / 좋아요 3.2만개 / 댓글 480개",
    reliability: "높음",
    reliabilityReason: "가시적인 신체 비포애프터 및 리얼 라이프스타일을 담은 고효율 커머스 문법이 전형적으로 완벽하게 들어맞아 신뢰성 높게 분석됨."
  },
  whyViral: {
    hook: "도입 1.5초 만에 산더미 같은 떡볶이와 빵을 허겁지겁 먹는 자극적인 대리만족 씬으로 시청을 정지시킴.",
    empathy: "'오늘도 무너졌네...', '내일부터 다이어트 해야지' 하는 3050 여성들의 매일 반복되는 내적 죄책감을 100% 자극함.",
    problem: "많이 먹지 않아도 나이가 들면 효소가 부족해 소화가 안 되고 그대로 나잇살이 된다는 핵심 노화 문제를 짚음.",
    visual: "효소 분말 가루가 물에 녹아 탄수화물을 순식간에 녹여버리는 리얼한 유리컵 실험 장면으로 가시적 쾌감 선사.",
    comment: "'진짜 이거 먹으면 다음 날 붓기 빠지나요?', '저 인절미 맛 매일 먹는 중' 등 리얼 후기 논쟁과 질문 유도 성공.",
    conversion: "평소 고민하던 만성 소화불량과 아랫배 처짐을 해결할 '치트키'처럼 포지셔닝하여 프로필 링크 클릭 유도 극대화."
  },
  hooks: {
    whyStop: "눈앞에서 갓 구운 빵과 떡볶이가 무자비하게 입으로 들어가는 시각적 자극 + 빵빵해진 아랫배 움켜쥐기로 호기심 유발.",
    koreanHooks: [
      "물만 마셔도 살찌는 40대, 운동이 문제가 아닙니다!",
      "솔직히 아랫배 붓기 빼는 건 이게 제일 빠르더라고요.",
      "소화가 안 돼서 밥숟가락 놓으셨다면 딱 15초만 보세요.",
      "나잇살인 줄 알았는데 그냥 다 '더부룩한 붓기'였습니다.",
      "맛있는 거 다 먹으면서 뱃살 가벼워지는 치트키 공개!"
    ]
  },
  highRetention: {
    section: "04초~09초 구간 (효소 탄수화물 분해 실험 및 섭취 장면)",
    reason: "밀가루가 컵 속에서 몽글몽글 녹아내리는 화학적 반응이 시각적으로 대단히 통쾌하며 '내 뱃속에서도 저렇게 되겠구나' 하는 강력한 기대감을 줌.",
    tip: "실제 효소 분말을 밀가루 풀에 얹어 서서히 액체로 변하는 과정을 2배속 타임랩스로 편집하여 이탈율을 막고 체류시간 확보하기."
  },
  benchmarking: {
    keep: "꾸밈없이 화장대나 식탁에서 핸드폰을 들고 편하게 찍은 'UGC(사용자 제작 콘텐츠)' 리얼 리뷰 감성 유지하기.",
    change: "너무 웅장한 배경음악을 빼고, 귀에 쏙쏙 박히는 '동네 친한 동생의 속삭임' 같은 속도감 있는 나레이션으로 교체.",
    adapt: "한국인들이 가장 사랑하는 고소한 '인절미 미숫가루 맛'이라는 점을 강하게 언급해 효소 특유의 쿰쿰한 맛 거부감 상쇄시키기.",
    caution: "단순히 '이거 먹으면 뱃살이 빠진다'고 하면 식약처 과대광고에 걸릴 수 있으므로, 반드시 '소화 기능 촉진 및 가벼워지는 아침 붓기 관리'로 에둘러 소구할 것."
  },
  storyboard: [
    { time: "0~3초", layout: "떡볶이 폭식 후 불룩하게 나온 배를 만지며 절망하는 장면 (클로즈업)", subtitle: "물만 먹어도 살찌는 나이? 억울해 죽겠어요😭", narration: "분명 많이 안 먹었는데 아랫배만 볼록 나오는 억울한 느낌, 다들 아시죠?", tip: "가장 빵빵해 보이는 각도에서 배를 양손으로 잡아 리얼함을 극대화합니다." },
    { time: "3~7초", layout: "물잔에 효소를 붓고 식빵이 순식간에 녹아내리는 분해 실험 숏", subtitle: "소화 효소 부족 = 나잇살의 원인!", narration: "30대 후반부터 몸속 효소가 뚝 떨어져서 그래요. 소화 안 된 게 그대로 살이 되는 겁니다.", tip: "분해 실험은 투명한 유리잔에서 대비가 뚜렷하게 촬영합니다." },
    { time: "7~11초", layout: "이지컷 한 포를 뜯어 털어 먹으며 맛있어서 미소 짓는 얼굴 바스트 샷", subtitle: "쿰쿰함 제로! 고소한 진짜 인절미 맛🌾", narration: "그래서 전 이거 하루 딱 한 포 먹어요. 쿰쿰함 1도 없는 진짜 고소한 미숫가루 맛!", tip: "물 없이도 사르르 녹아내리는 제형을 입자가 보이게 붓습니다." },
    { time: "11~15초", layout: "가벼워진 바지 핏을 자랑하며 카메라를 보며 윙크/손가락 하트", subtitle: "🚨오늘만 1+1 특별 혜택! 프로필 링크 확인", narration: "내일부터 가뿐해지고 싶다면 지금 하단 링크에서 1+1 혜택을 놓치지 마세요!", tip: "자신감 있는 자세 and 밝은 미소로 신뢰감을 주며 손가락으로 하단을 가리킵니다." }
  ],
  scripts15s: {
    soldOut: {
      hook: "지금 전국 약국 대란템, 드디어 한정 수량 풀렸습니다!",
      empathy: "매번 속 더부룩하고 아랫배 처지는 분들 많으시죠?",
      solution: "효소 부족하면 나잇살 직행이에요.",
      benefit: "하루 한 포로 묵은 소화 싹 해결하고 고소하게 다이어트하세요.",
      cta: "재입고 기념 1+1 혜택, 수량 끝나기 전에 프로필 링크 클릭!"
    },
    empathy: {
      hook: "나이 먹으니 조금만 먹어도 배만 뽈록 나와서 속상하시죠?",
      empathy: "식단 아무리 줄여도 아침마다 온몸이 팅팅 부어있을 때...",
      solution: "그거 몸속 소화 효소가 바닥나서 그렇거든요.",
      benefit: "이 효소 한 포로 더부룩함 다 털어내고 아침을 상쾌하게 시작하세요.",
      cta: "내 몸에 주는 선물, 지금 최저가 링크에서 만나보세요!"
    },
    comparison: {
      hook: "옆집 영희 엄마가 나보다 밥을 2배는 먹는데 살 안 찌는 이유?",
      empathy: "맨날 나만 붓고 나만 소화 안 돼서 물만 먹는 억울함 그만!",
      solution: "차이는 딱 하나, 탄수화물 분해 효소 유무입니다.",
      benefit: "곡물 백프로 발효 효소로 먹은 밥빵면 싹 다 녹여버리세요.",
      cta: "진짜인지 가짜인지 딱 한 박스만 직접 확인해보세요!"
    },
    expert: {
      hook: "전문가들이 나잇살 빼려면 효소부터 채우라고 강조하는 진짜 이유.",
      empathy: "소화 기능이 무너지면 아무리 좋은 운동도 소용없습니다.",
      solution: "80만 초고역가수치로 확실하게 설계된 고강도 효소.",
      benefit: "화학 첨가물 없이 순수한 진짜 곡물 맛으로 건강하게 비워내세요.",
      cta: "정품 공식 인증 숍에서 가장 안전한 혜택가로 데려가세요."
    },
    review: {
      hook: "광고 아니고 내돈내산 6개월째 공복에 먹고 쓰는 찐후기!",
      empathy: "밥만 먹으면 속이 꽉 막혀서 가스 차고 배 아팠던 과거의 나...",
      solution: "이거 가방에 넣고식후마다 털어먹은 뒤론 세상 편안해요.",
      benefit: "고소한 인절미 맛이라 군것질 끊고 이거로 입터짐까지 방지함!",
      cta: "아직도 안 드셔 보셨어요? 후기 한 번만 읽어보고 결정하세요!"
    }
  },
  script20s: {
    hook: "속 더부룩하고 나잇살 안 빠진다면? 딱 20초만 집중해보세요.",
    empathy: "운동을 아무리 해도 아랫배 붓기가 그대로고 밤만 되면 속이 꽉 막힌 듯 가스 차는 고통, 아는 사람만 알죠.",
    solution: "원인은 나이 들수록 줄어드는 소화 효소 때문입니다. 소화가 안 되니 전부 독소와 살로 가는 거예요.",
    benefit: "이건 80만 고역가수치 천연 효소라, 먹은 탄수화물을 사르르 분해해서 물처럼 편하게 내려보내 줍니다. 게다가 맛도 고소해서 먹기 편해요.",
    cta: "지금만 독점 공동구매 특가 진행 중이니 아랫배 가벼워지실 분들은 어서 아래 링크를 터치하세요!"
  },
  script30s: "에휴, 언니들 진짜 솔직하게 말씀드릴게요. 저도 40대 접어들고는 밥 반 공기만 먹어도 소화가 안 돼서 하루 종일 배가 빵빵하고 옷 태가 하나도 안 살아서 엄청 스트레스였거든요? 근데 알고 보니까 이게 우리가 나이 먹으면서 몸속 효소가 다 말라버려서 그런 거래요. 소화가 안 되니까 먹은 게 고대로 아랫배 나잇살이 되는 거죠! 그래서 제가 요새 가방에 꼭 넣어 다니는 게 바로 이 곡물 효소인데요. 그냥 미숫가루 맛이라 물 없이 털어 넣어도 엄청 고소해요. 먹고 나면 신기할 정도로 한 시간 뒤에 속이 싹 편안해지고 다음 날 아침 일어날 때 얼굴 붓기가 완전 쏙 빠져있어요. 소화 찌꺼기만 잘 비워내도 몸이 이렇게 가뿐해져요! 지금 마침 선착순 특가 이벤트 하더라고요. 더 늦기 전에 하나 장만해서 매일 가뿐하게 지내봐요!",
  ctas: [
    "🚨 선착순 50명만 1+1 특가 혜택 받아가기!",
    "⚠️ 오늘 밤 12시 정각에 행사가 정상가로 전환됩니다.",
    "👉 아랫배 더부룩함 끝내고 싶다면 지금 바로 구매하기",
    "💥 구매 고객 평점 4.9의 화제성 대란템 직접 체험해보세요.",
    "🛒 지금 주문하면 무료 배송에 샘플 3포 추가 증정!",
    "🔍 다른 저가 효소들과 리얼 후기 비교해보고 선택하세요.",
    "🔥 다이어트 단톡방 난리 난 효소, 물량 확보 완료!",
    "💖 소중한 내 몸을 위한 가벼운 하루 습관 시작하기",
    "🛑 품절 임박! 서둘러 남은 수량 확인하세요.",
    "👇 더 가벼워진 내일의 나를 위해 링크를 누르세요!"
  ],
  copywriting: {
    thumbnails: [
      "물만 먹어도 살찌는 '나잇살' 30분 만에 비우기",
      "밥 먹고 이거 한 포면 다음날 아침 붓기 제로!",
      "옆집 엄마 나보다 더 먹는데 살 안 찌는 꼼수",
      "속 더부룩한 3050 여성 필수 생존 치트키",
      "운동 안 하고 뱃살 쏙 빼주는 간편한 루틴",
      "탄수화물 싹 녹이는 미친 분해 실험의 비밀",
      "내돈내산 6개월 찐후기: 뱃살 가벼워진 이야기",
      "가스 차고 더부룩한 배, 제발 방치하지 마세요!",
      "약국 품절 대란 효소 드디어 한정 재입고",
      "인절미 맛 다이어트 간식으로 맛있게 비우기"
    ],
    captions: [
      "매일 아침 팅팅 부어오르는 뱃살, 알고 보니 소화 안 된 가스 찌꺼기?!",
      "탄수화물 완전 정복! 먹은 빵과 떡볶이 눈앞에서 순식간에 녹여줄 효소 추천",
      "나이 들수록 부족한 효소를 한 번에 채워주는 80만 역가수치 화제템",
      "운동해도 안 빠지던 아랫배 고민, 이 작은 한 포로 가볍게 리셋하세요 ✨",
      "쿰쿰해서 못 먹던 효소는 가라! 고소한 미숫가루 향 가득한 진짜 꿀맛 효소",
      "식사 직후 털어먹는 간단한 루틴으로 매일매일 상쾌한 공복감 유지 중",
      "밀가루 중독자인 제가 6개월간 매일 섭취하고 몸무게 앞자리 바꾼 비결!",
      "몸속 독소 다 비워내고 피부 탄력까지 챙기는 이너뷰티의 시작지점",
      "소화제 대신 천연 발효 곡물 효소로 안전하고 건강하게 가벼워지기 🌾",
      "아직도 뱃살 붓기 참으세요? 하루 500원의 행복을 바로 경험하세요."
    ],
    comments: [
      "진짜 인절미 맛 나나요? 비위 약한데 먹을 수 있을지 고민돼요 🤔",
      "공구 언제 마감되나요? 저번 차수에 품절돼서 못 샀어요 ㅠㅠ",
      "먹은 날 and 안 먹은 날 아침 가벼움 체감이 180도 다릅니다 찐추천!",
      "부모님도 속 더부룩하다고 하셔서 효소 선물해드렸는데 진짜 좋아하시네요",
      "아래 링크 들어가니까 할인 쿠폰 주던데 다들 챙겨 가세요!! 👍"
    ]
  }
};

export default function App() {
  // Global View Preferences (Default: Light Mode and Large text for extreme comfort)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [globalFontSize, setGlobalFontSize] = useState("large");

  // NEW: Input Mode (link vs image)
  const [inputMode, setInputMode] = useState("link"); // 'link' or 'image'

  // Input states (Simplified)
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoContent, setVideoContent] = useState("");
  
  // NEW: Image Upload States (Simulated for UI)
  const [uploadedImages, setUploadedImages] = useState([]);

  const [metrics, setMetrics] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [targetGenderAge, setTargetGenderAge] = useState(DEFAULT_TARGET.genderAge);
  const [targetLifestyle, setTargetLifestyle] = useState(DEFAULT_TARGET.lifestyle);
  const [targetConcerns, setTargetConcerns] = useState(DEFAULT_TARGET.concerns);
  const [targetInterests, setTargetInterests] = useState(DEFAULT_TARGET.interests);
  const [sellingPoint, setSellingPoint] = useState("");
  const [videoLength, setVideoLength] = useState("15초 / 20초 / 30초");

  // UX Toggle and Helpers
  const [isAnalyzed, setIsAnalyzed] = useState(false); // Renamed from isLinkAnalyzed for both modes
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanceRef, setShowAdvanceRef] = useState(false);

  // Output states
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");

  // Teleprompter states
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [prompterText, setPrompterText] = useState("");
  const [prompterSpeed, setPrompterSpeed] = useState(3); // 1-5 scale
  const [prompterFontSize, setPrompterFontSize] = useState(32); // px
  const [isPrompterRunning, setIsPrompterRunning] = useState(false);
  const prompterScrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // --- NEW AI FEATURE STATES ---
  const [aiToneSourceText, setAiToneSourceText] = useState("");
  const [aiSelectedTone, setAiSelectedTone] = useState("츤데레 친언니");
  const [aiToneResultText, setAiToneResultText] = useState("");
  const [isToneChanging, setIsToneChanging] = useState(false);

  const [aiObjectionText, setAiObjectionText] = useState("가격이 왜 이리 비싼가요? 다른 저가형 효소랑 뭐가 달라요?");
  const [aiObjectionResult, setAiObjectionResult] = useState(null);
  const [isCrushingObjection, setIsCrushingObjection] = useState(false);

  const [aiAudioScriptText, setAiAudioScriptText] = useState("");
  const [aiAudioResult, setAiAudioResult] = useState(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);

  // Helper for Toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Helper for Clipboard Copy
  const handleCopyText = (text, label) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(`${label} 복사 완료!`);
    } catch (err) {
      showToast("복사 실패했습니다.");
    }
    document.body.removeChild(textArea);
  };

  // Image Upload Simulation Handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Simulate reading files for UI preview
    const newImages = files.slice(0, 3).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file) // Create temporary local URL for preview
    }));
    
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 3)); // Max 3 images
    showToast(`${newImages.length}장의 이미지가 업로드 되었습니다.`);
  };

  // Pre-load default values for quick testing
  const handleLoadDemo = () => {
    setInputMode("link");
    setVideoUrl("https://youtube.com/shorts/sample-viral-enzyme");
    setVideoTitle("밥 먹고 이거 먹었더니 뱃살 붓기 싹 빠짐 ㄷㄷ #효소추천 #나잇살");
    setVideoContent("한 여성이 맛있게 빵과 떡볶이를 먹은 뒤, 배가 빵빵해진 모습을 보여줍니다. 그 다음 주머니에서 효소를 꺼내 한 포 먹는 모습을 보여주고, 30분 뒤 뱃살이 몰라보게 쏙 들어간 전후 비교(비포애프터)를 직관적으로 보여주며 제품을 소개합니다.");
    setMetrics("조회수 120만회 / 좋아요 3.2만개 / 댓글 480개 / 공유 1.5천회");
    setProductName("하루 한 포 포스트바이오틱스 곡물 효소");
    setProductCategory("건강식품 / 다이어트 효소");
    setTargetGenderAge(DEFAULT_TARGET.genderAge);
    setTargetLifestyle(DEFAULT_TARGET.lifestyle);
    setTargetConcerns(DEFAULT_TARGET.concerns);
    setTargetInterests(DEFAULT_TARGET.interests);
    setSellingPoint("100% 천연 국내산 곡물 발효, 80만 초고역가수치로 독보적인 탄수화물 분해력, 쿰쿰함 없는 진짜 고소한 미숫가루 인절미 맛, 스틱 한 포 개별포장으로 외출 시 완벽 휴대");
    setVideoLength("15초 / 20초 / 30초");

    setAnalysisResult(SAMPLE_ANALYSIS);
    setIsAnalyzed(true);
    
    // Auto populate AI source script
    const defaultDemoScript = "나이 먹으니 조금만 먹어도 배만 볼록 나와서 속상하시죠? 식단 아무리 줄여도 아침마다 온몸이 팅팅 부어있을 때... 그거 몸속 소화 효소가 바닥나서 그렇거든요. 이 효소 한 포로 더부룩함 다 털어내고 아침을 상쾌하게 시작하세요. 내 몸에 주는 선물, 지금 최저가 링크에서 만나보세요!";
    setAiToneSourceText(defaultDemoScript);
    setAiAudioScriptText(defaultDemoScript);

    showToast("성공 공식 데모 데이터가 가득 채워졌습니다!");
  };

  const handleReset = () => {
    setVideoUrl("");
    setVideoTitle("");
    setVideoContent("");
    setMetrics("");
    setProductName("");
    setProductCategory("");
    setTargetGenderAge(DEFAULT_TARGET.genderAge);
    setTargetLifestyle(DEFAULT_TARGET.lifestyle);
    setTargetConcerns(DEFAULT_TARGET.concerns);
    setTargetInterests(DEFAULT_TARGET.interests);
    setSellingPoint("");
    setVideoLength("15초 / 20초 / 30초");
    setAnalysisResult(null);
    setApiError("");
    setAiToneSourceText("");
    setAiToneResultText("");
    setAiObjectionResult(null);
    setAiAudioResult(null);
    setIsAnalyzed(false);
    setUploadedImages([]);
    showToast("모든 작업 시트가 초기화되었습니다.");
  };

  // Unified API call. Gemini key is protected in Vercel Environment Variables.
  // Frontend never sees GEMINI_API_KEY.
  const callGeminiAPI = async (promptText, systemInstruction = "", responseSchema = null, retries = 2, delay = 800) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptText, systemInstruction, responseSchema })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          return data;
        }

        const message = data?.error || data?.details || "Gemini API 호출에 실패했습니다.";
        if (response.status < 500 || i === retries) {
          throw new Error(message);
        }
      } catch (err) {
        if (i === retries) {
          throw err;
        }
      }

      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
    }

    throw new Error("서버와 연결하지 못했습니다. Vercel 환경변수와 배포 상태를 확인해 주세요.");
  };

  // ACTION: ✨ 1단계 분석기 (Handles both Link and Image modes)
  const handleAnalyzeReference = async () => {
    if (inputMode === 'link' && !videoUrl.trim()) {
      showToast("오리지널 레퍼런스 영상 링크를 먼저 적어주세요!");
      return;
    }
    if (inputMode === 'image' && uploadedImages.length === 0) {
      showToast("분석할 캡처 이미지를 최소 1장 이상 업로드해 주세요!");
      return;
    }

    setIsAnalyzing(true);
    setApiError("");

    const systemPrompt = "당신은 숏폼 정보를 바탕으로, 영상의 잠재 흥행 구조와 대략적인 연출 묘사를 과학적으로 유추하여 채워주는 마케팅 테크니션 AI입니다.";
    
    let userPromptContext = "";
    if (inputMode === 'link') {
       userPromptContext = `사용자가 제공한 숏폼 링크: "${videoUrl}"\n주의: 이 앱은 Level 1 버전이라 링크 안의 실제 영상 화면을 자동으로 재생/다운로드해 읽지 않습니다. 사용자가 입력한 제목, 캡션, 화면 설명이 있으면 그것을 우선하고, 부족하면 링크 플랫폼과 상품 맥락만 근거로 "추정 분석"으로 표시해 주세요.`;
    } else {
       userPromptContext = `사용자가 숏폼 영상의 캡처 이미지 ${uploadedImages.length}장을 제공했습니다. (이미지 비전 분석을 통해)\n이 영상의 시각적 요소(구도, 자막 배치, 피사체 연출)를 바탕으로 숏폼 영상의 가상 시나리오 메타데이터를 예측하여 생성해 주세요.`;
    }

    const userPrompt = `
      ${userPromptContext}

      [중요 기획 조건]
      - 2026년 현재 최신 한국 미디어 커머스 트렌드에 완전 부합하는 썸네일 제목과 세일즈 구조를 제안해 주세요.
      - 타깃 연령층이 공감하고 자주 쓰는 현실적인 언어 표현을 적극적으로 사용해야 합니다.

      JSON 스키마:
      {
        "estimatedTitle": "흥행하기 좋은 한국어 숏폼 영상 한글 제목 (예: '아랫배 무조건 가벼워지는 치트키 루틴')",
        "estimatedMetrics": "조회수 및 반응 추정값 (예: '조회수 180만회 / 좋아요 3.2만개')",
        "estimatedContent": "해당 숏폼 비디오가 어떤 화면 연출과 나레이션으로 채워져 있을지 2~3문장 내외로 숏폼 문법에 맞춰 구체적으로 시각 묘사"
      }
    `;

    const estimatedSchema = {
      type: "OBJECT",
      required: ["estimatedTitle", "estimatedMetrics", "estimatedContent"],
      properties: {
        estimatedTitle: { type: "STRING" },
        estimatedMetrics: { type: "STRING" },
        estimatedContent: { type: "STRING" }
      }
    };

    try {
      const data = await callGeminiAPI(userPrompt, systemPrompt, estimatedSchema);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        setVideoTitle(parsed.estimatedTitle);
        setMetrics(parsed.estimatedMetrics);
        setVideoContent(parsed.estimatedContent);
        setIsAnalyzed(true);
        showToast(inputMode === 'link' ? "✨ 링크 분석 완료!" : "✨ 이미지 비전 분석 완료!");
      } else {
        throw new Error("답변 데이터를 받지 못했습니다.");
      }
    } catch (err) {
      setApiError(err.message || "참고 영상 분석에 실패했습니다. 링크만으로 실제 영상 내용을 읽을 수 없으니 제목/자막/화면 설명을 직접 입력한 뒤 다시 눌러 주세요.");
      showToast("분석 실패: 입력값 또는 API 설정을 확인해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Action: Main Report Generator
  const handleGenerateScript = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError("");

    if (!productName || !sellingPoint) {
      setApiError("상품명과 상품의 판매 소구점(장점)은 필수적으로 입력해 주세요.");
      setIsLoading(false);
      return;
    }

    // Automatically detect platform internally based on input link if link mode
    let detectedPlatform = "Short-form platform";
    if (inputMode === 'link') {
      if (videoUrl.toLowerCase().includes("youtube") || videoUrl.toLowerCase().includes("youtu.be")) {
        detectedPlatform = "YouTube Shorts";
      } else if (videoUrl.toLowerCase().includes("tiktok")) {
        detectedPlatform = "TikTok";
      } else if (videoUrl.toLowerCase().includes("instagram") || videoUrl.toLowerCase().includes("reels")) {
        detectedPlatform = "Instagram Reels";
      }
    } else {
       detectedPlatform = "Instagram Reels / TikTok (Image Analyzed)";
    }

    const systemPrompt = `
      당신은 대한민국 최고 숏폼 미디어 커머스 전문 연구소인 "ShortPick Lab(숏픽랩)"입니다.
      사용자가 제공하는 분석 대상 원본 영상 정보와, 한국 쇼핑 숏폼으로 녹여낼 판매 제품 정보를 결합하여 매출 극대화를 부르는 분석 리포트와 고효율 대본을 생성해야 합니다.

      [중요 대본 작성 가이드라인]
      - 어투 및 트렌드: 2026년 최신 흐름에 맞추어 지나치게 낡고 고루한 광고 어투를 완벽히 배제합니다. 타깃 연령층이 인스타그램이나 유튜브 커뮤니티에서 실제로 쓰는 '리얼 라이프스타일 밀착형 단어', '생생한 생존 꿀팁 뉘앙스'를 담아야 합니다.
      - 말투 톤앤매너: 친한 동생이나 언니가 직접 써보고 조언하듯 친근하고 털털한 느낌 50% + 노련하고 이성적인 전문 코치 스타일 30% + 있는 그대로의 가감 없는 솔직 생생 후기 느낌 20%를 황금 비율로 섞습니다.
      - 과대광고 회피: 식약처 등 규제 가이드라인을 어기지 않는 선에서 아랫배의 붓기, 속 더부룩함, 가스 차오름, 피로, 피부 탄력 등의 개선으로 돌려 말하는 정교하고 고도화된 셀링 기법을 적용하세요.
      - 실무 적용성: 출력은 반드시 제공된 엄격한 JSON 스키마를 100% 준수해야 합니다.
      - 영상 세부장면을 실제로 보지 못한 링크 정보만 있을 경우 '추정 분석' 임을 basicInfo.reliability와 reliabilityReason에 녹여 투명하게 말해야 합니다.
      - 상품 고정 원칙: 사용자가 입력한 상품명, 카테고리, 판매 포인트만 사용하세요. 레퍼런스 영상의 상품이나 데모 예시 상품(효소/배수구/선풍기 등)을 절대 섞지 마세요.
      - 입력 상품이 화장품이면 모든 대본·키컷·CTA가 반드시 화장품 사용 장면과 효능 표현 범위 안에서 작성되어야 합니다. 다른 카테고리 상품으로 바꾸면 실패입니다.
      - 사투리 버전: 결과에는 경상도 사투리 버전과 전라도 사투리 버전의 15초 대본을 각각 1개씩 추가하세요. 과장된 희화화가 아니라 실제 쇼핑 숏폼에서 자연스럽게 들리는 친근한 말투여야 합니다.
    `;

    const userPrompt = `
      --- [오리지널 레퍼런스 영상 데이터] ---
      분석 방식: ${inputMode === 'link' ? 'URL 링크' : '캡처 이미지'}
      감지된 플랫폼: ${detectedPlatform}
      영상 링크/정보: ${videoUrl || "캡처 이미지 제공됨"}
      영상 제목/캡션: ${videoTitle || "제공안됨"}
      영상 자막/화면 설명/스크립트: ${videoContent || "제공안됨"}
      조회수 및 지표: ${metrics || "제공안됨"}

      --- [한국 판매 기획용 상품 데이터] ---
      상품명: ${productName}
      카테고리: ${productCategory || "일반 이너뷰티"}
      주요 타깃 성별/연령: ${targetGenderAge}
      타깃 라이프스타일: ${targetLifestyle}
      타깃의 주 고민사항: ${targetConcerns}
      타깃의 주요 관심사: ${targetInterests}
      핵심 셀링 포인트 (판매 장점): ${sellingPoint}
      원하는 영상 길이: ${videoLength}

      ${(!videoUrl && uploadedImages.length === 0) && !videoTitle && !videoContent ? "주의: 사용자가 레퍼런스 영상 정보를 구체적으로 주지 않았습니다. 상품 판매 포인트와 타깃의 고충만을 토대로 트렌디한 가상 숏폼 분석 레퍼런스를 직접 역설계하여 채워주세요." : ""}

      [절대 조건]
      - 최종 결과의 모든 문장에는 반드시 위 상품명/카테고리/판매 포인트가 반영되어야 합니다.
      - 레퍼런스 영상은 구조만 참고하고, 판매 상품은 사용자가 입력한 상품으로만 바꾸세요.
      - 15초 대본 5종, 20초 대본, 30초 대본, 경상도 사투리 15초, 전라도 사투리 15초를 모두 만드세요.
      - 상품명: "${productName}"이 아닌 다른 제품으로 내용이 바뀌면 실패입니다.

      위 정보를 종합하여, 한국 쇼핑 숏폼 대본 생성기 규칙에 따라 완전히 번역/기획된 JSON 결과를 반환하세요.
    `;

    // Strict Schema Definition
    const responseSchema = {
      type: "OBJECT",
      required: ["summary", "basicInfo", "whyViral", "hooks", "highRetention", "benchmarking", "storyboard", "scripts15s", "script20s", "script30s", "ctas", "copywriting"],
      properties: {
        summary: { type: "ARRAY", items: { type: "STRING" } },
        basicInfo: {
          type: "OBJECT",
          required: ["platform", "url", "title", "category", "metrics", "reliability", "reliabilityReason"],
          properties: {
            platform: { type: "STRING" },
            url: { type: "STRING" },
            title: { type: "STRING" },
            category: { type: "STRING" },
            metrics: { type: "STRING" },
            reliability: { type: "STRING" },
            reliabilityReason: { type: "STRING" }
          }
        },
        whyViral: {
          type: "OBJECT",
          required: ["hook", "empathy", "problem", "visual", "comment", "conversion"],
          properties: {
            hook: { type: "STRING" },
            empathy: { type: "STRING" },
            problem: { type: "STRING" },
            visual: { type: "STRING" },
            comment: { type: "STRING" },
            conversion: { type: "STRING" }
          }
        },
        hooks: {
          type: "OBJECT",
          required: ["whyStop", "koreanHooks"],
          properties: {
            whyStop: { type: "STRING" },
            koreanHooks: { type: "ARRAY", items: { type: "STRING" } }
          }
        },
        highRetention: {
          type: "OBJECT",
          required: ["section", "reason", "tip"],
          properties: {
            section: { type: "STRING" },
            reason: { type: "STRING" },
            tip: { type: "STRING" }
          }
        },
        benchmarking: {
          type: "OBJECT",
          required: ["keep", "change", "adapt", "caution"],
          properties: {
            keep: { type: "STRING" },
            change: { type: "STRING" },
            adapt: { type: "STRING" },
            caution: { type: "STRING" }
          }
        },
        storyboard: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["time", "layout", "subtitle", "narration", "tip"],
            properties: {
              time: { type: "STRING" },
              layout: { type: "STRING" },
              subtitle: { type: "STRING" },
              narration: { type: "STRING" },
              tip: { type: "STRING" }
            }
          }
        },
        scripts15s: {
          type: "OBJECT",
          required: ["soldOut", "empathy", "comparison", "expert", "review"],
          properties: {
            soldOut: {
              type: "OBJECT",
              required: ["hook", "empathy", "solution", "benefit", "cta"],
              properties: { hook: { type: "STRING" }, empathy: { type: "STRING" }, solution: { type: "STRING" }, benefit: { type: "STRING" }, cta: { type: "STRING" } }
            },
            empathy: {
              type: "OBJECT",
              required: ["hook", "empathy", "solution", "benefit", "cta"],
              properties: { hook: { type: "STRING" }, empathy: { type: "STRING" }, solution: { type: "STRING" }, benefit: { type: "STRING" }, cta: { type: "STRING" } }
            },
            comparison: {
              type: "OBJECT",
              required: ["hook", "empathy", "solution", "benefit", "cta"],
              properties: { hook: { type: "STRING" }, empathy: { type: "STRING" }, solution: { type: "STRING" }, benefit: { type: "STRING" }, cta: { type: "STRING" } }
            },
            expert: {
              type: "OBJECT",
              required: ["hook", "empathy", "solution", "benefit", "cta"],
              properties: { hook: { type: "STRING" }, empathy: { type: "STRING" }, solution: { type: "STRING" }, benefit: { type: "STRING" }, cta: { type: "STRING" } }
            },
            review: {
              type: "OBJECT",
              required: ["hook", "empathy", "solution", "benefit", "cta"],
              properties: { hook: { type: "STRING" }, empathy: { type: "STRING" }, solution: { type: "STRING" }, benefit: { type: "STRING" }, cta: { type: "STRING" } }
            }
          }
        },
        script20s: {
          type: "OBJECT",
          required: ["hook", "empathy", "solution", "benefit", "cta"],
          properties: {
            hook: { type: "STRING" },
            empathy: { type: "STRING" },
            solution: { type: "STRING" },
            benefit: { type: "STRING" },
            cta: { type: "STRING" }
          }
        },
        script30s: { type: "STRING" },
        dialectScripts: {
          type: "OBJECT",
          properties: {
            gyeongsang15s: { type: "STRING" },
            jeolla15s: { type: "STRING" }
          }
        },
        ctas: { type: "ARRAY", items: { type: "STRING" } },
        copywriting: {
          type: "OBJECT",
          required: ["thumbnails", "captions", "comments"],
          properties: {
            thumbnails: { type: "ARRAY", items: { type: "STRING" } },
            captions: { type: "ARRAY", items: { type: "STRING" } },
            comments: { type: "ARRAY", items: { type: "STRING" } }
          }
        }
      }
    };

    try {
      const data = await callGeminiAPI(systemPrompt + "\n\n" + userPrompt, "", responseSchema);
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const textResult = data.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(textResult);
        setAnalysisResult(parsedJson);

        // Prepopulate AI helpers with the newly generated scripts
        if (parsedJson.script30s) {
          setAiToneSourceText(parsedJson.script30s);
          setAiAudioScriptText(parsedJson.script30s);
        } else if (parsedJson.scripts15s?.empathy) {
          const empText = `${parsedJson.scripts15s.empathy.hook} ${parsedJson.scripts15s.empathy.empathy} ${parsedJson.scripts15s.empathy.solution}`;
          setAiToneSourceText(empText);
          setAiAudioScriptText(empText);
        }

        setActiveTab("scripts");
        showToast("인공지능 분석 및 대본 패키지가 완성되었습니다! 대본 탭에서 바로 확인하세요.");
      } else {
        throw new Error("결과 포맷 분석 오류가 발생하였습니다.");
      }
    } catch (err) {
      setApiError(err.message || "서버 통신 실패 또는 JSON 구문 분석 오류가 발생했습니다. 잠시 후 다시 시작해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // FEATURE 1: ✨ AI 톤 체인저 (Tone Changer)
  const handleToneChange = async () => {
    if (!aiToneSourceText.trim()) {
      showToast("변환할 원본 대본을 입력해 주세요!");
      return;
    }
    setIsToneChanging(true);
    
    const systemPrompt = "당신은 대한민국 최고 숏폼 카피라이터이자 크리에이티브 디렉터입니다. 원본 대본을 제공받으면, 가이드하는 독특한 브랜드 캐릭터 톤앤매너로 100% 각색하여 신선한 대본을 창작하세요.";
    const userPrompt = `
      [변환할 원본 대본]
      ${aiToneSourceText}

      [원하는 목표 캐릭터 톤]
      ${aiSelectedTone}

      [각 캐릭터 톤 가이드라인]
      - 츤데레 친언니: "에휴 속상하게 정말 왜 그래?", "딱 한 번만 말한다 들어라" 식의 잔소리 같지만 챙겨주는 친근한 말투. 반말 위주.
      - 하이텐션 홈쇼핑 쇼호스트: "고객님 주목하세요!", "이런 찬스 절대 없습니다!", "마감 직전!"의 쩌렁쩌렁하고 숨가쁜 완벽 프로페셔널 어투.
      - 냉철한 팩폭 약사/의사: "솔직히 말씀드리면, 이건 운동부족만의 문제가 아니에요.", "원리는 단순합니다." 식의 이성적이고 차분한 지적 카리스마 톤.
      - 감성 가득한 일상 브이로거: "오늘 아침도 참 가볍게 시작해요🌾", "잔잔하게 스며드는 제 일상의 소소한 치트키랄까요..." 식의 부드럽고 낭만적인 ASMR식 독백 톤.
      - 급식체 가득한 힙스터: "와 진짜 이거 대박적 모먼트 인정?", "폼 미쳤다 진짜ㅋㅋㅋ" 식의 유행어가 듬뿍 들어간 활기찬 트렌디 반말 톤.
      - 경상도 사투리 이모: "아지매들 이거 마 무봤나? 가만 놔두면 다 나잇살 된다 아이가!", "마 내 믿고 딱 한 포만 무봐라. 속이 억수로 가뿐해진다!" 같은 활기차고 속시원한 경상도(부산/대구) 사투리 구어체.
      - 전라도 사투리 이모: "아따 인자 밥 묵고 이거 언능 한 포 털어 넣어 보쇼잉~ 속이 겁나게 개운허요!", "웜매, 참말로 신통방통하당께!" 같은 정감 넘치고 구수한 전라도 사투리 구어체.

      [주의사항]
      - 과장 광고나 허위 성능은 피하되, 상품 소구점을 찰지게 강조하세요.
      - 숏폼 영상으로 읽기에 너무 길지 않게(최대 30초 내외 분량) 정제하여 한국어로 깔끔히 리라이팅하세요.
    `;

    try {
      const data = await callGeminiAPI(userPrompt, systemPrompt);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiToneResultText(text.trim());
        showToast("✨ 대본 톤앤매너 변환 완료!");
      } else {
        throw new Error("답변 데이터를 받지 못했습니다.");
      }
    } catch (err) {
      showToast("톤 변환에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsToneChanging(false);
    }
  };

  // FEATURE 2: ✨ AI 반론 돌파 치트키 (Objection Crusher)
  const handleCrushObjection = async () => {
    if (!aiObjectionText.trim()) {
      showToast("고객의 의문 및 반대 의견을 적어주세요!");
      return;
    }
    setIsCrushingObjection(true);

    const systemPrompt = "당신은 쇼핑몰 구매전환율을 극대화하는 세일즈 라이팅 전문가입니다. 소비자가 가질법한 냉소적이거나 회의적인 우려, 비싼 가격, 신뢰성 부족 등의 문제를 위트 있고 명쾌하게 극복하여 장바구니로 가게 만드는 멘트를 작성합니다.";
    const userPrompt = `
      [고객의 반론 / 의구심]
      "${aiObjectionText}"

      위 반론에 대항하는 쇼핑 숏폼 세일즈 라이터로서의 완벽한 3가지 구성을 아래의 JSON 포맷으로 만들어 주세요.

      JSON 스키마:
      {
        "videoDefenseScript": "영상 대본 중 자연스럽게 반론을 타파하는 10초 스크립트 (예: '비싸다고요? 일주일 커피값 아껴서 내 몸을 리셋하는데...', '이것저것 돈 날리는 게 진짜 아까운 법!')",
        "officialCommentReply": "공식 채널에서 댓글로 달아줄 수 있는 젠틀하면서도 이성적 설득이 담긴 대댓글 양식",
        "socialProofAngle": "이 반론을 역이용하여 다음 숏폼 영상의 '후킹' 아이디어로 삼는 기획안 1문장"
      }
    `;

    const objectionSchema = {
      type: "OBJECT",
      required: ["videoDefenseScript", "officialCommentReply", "socialProofAngle"],
      properties: {
        videoDefenseScript: { type: "STRING" },
        officialCommentReply: { type: "STRING" },
        socialProofAngle: { type: "STRING" }
      }
    };

    try {
      const data = await callGeminiAPI(userPrompt, systemPrompt, objectionSchema);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiObjectionResult(JSON.parse(text));
        showToast("✨ 반론 돌파 솔루션이 생성되었습니다!");
      } else {
        throw new Error("결과 파싱 실패");
      }
    } catch (err) {
      showToast("반론 솔루션 생성 오류가 발생했습니다.");
    } finally {
      setIsCrushingObjection(false);
    }
  };

  // FEATURE 3: ✨ AI 효과음 & BGM 디렉터 (BGM & SFX Matcher)
  const handleAudioAnalysis = async () => {
    if (!aiAudioScriptText.trim()) {
      showToast("분석할 대본을 입력해 주세요!");
      return;
    }
    setIsAnalyzingAudio(true);

    const systemPrompt = "당신은 유명 숏폼 프로덕션의 메인 오디오 엔지니어이자 음악 감독입니다. 주어진 대본의 문장 흐름, 감정 상태, 세일즈 극적 상황을 파악하여 최적의 오디오 연출안을 추천합니다.";
    const userPrompt = `
      [분석 대상 대본]
      "${aiAudioScriptText}"

      이 대본에 완벽히 매치되는 다음 오디오 가이드를 아래 JSON 스키마로 추천해 주세요.

      JSON 스키마:
      {
        "bgmRecommendation": "BGM 장르 및 속도 (예: 120BPM의 경쾌한 어쿠스틱 하우스 비트 / 시선을 사로잡는 강력한 신스팝)",
        "pacingGuide": "크리에이터의 낭독 속도 및 강세 변화 가이드 (예: 도입부는 빠르게 채찍질하듯 쏘아붙이고, 실험 장면에서는 약간 뜸을 들여 정적으로 낭독)",
        "audioTimeline": [
          {
            "segmentText": "대본의 특정 핵심 어휘 혹은 시작 구절",
            "sfxEffect": "어울리는 효과음 추천 (예: [팅~ 하는 실로폰 효과음] / [콰콰쾅 번개 소리] / [찰칵 카메라 셔터음])",
            "volumeControl": "해당 타이밍의 BGM 볼륨 조절 가이드 (예: BGM 0.3초간 음소거 / 볼륨 30%로 하강)"
          }
        ]
      }
    `;

    const audioSchema = {
      type: "OBJECT",
      required: ["bgmRecommendation", "pacingGuide", "audioTimeline"],
      properties: {
        bgmRecommendation: { type: "STRING" },
        pacingGuide: { type: "STRING" },
        audioTimeline: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["segmentText", "sfxEffect", "volumeControl"],
            properties: {
              segmentText: { type: "STRING" },
              sfxEffect: { type: "STRING" },
              volumeControl: { type: "STRING" }
            }
          }
        }
      }
    };

    try {
      const data = await callGeminiAPI(userPrompt, systemPrompt, audioSchema);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiAudioResult(JSON.parse(text));
        showToast("✨ 사운드 연출 디렉팅이 완성되었습니다!");
      } else {
        throw new Error("결과 획득 실패");
      }
    } catch (err) {
      showToast("사운드 디렉팅 도중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  const sendToAIToneChanger = (text) => {
    setAiToneSourceText(text);
    setActiveTab("aiTools");
    showToast("대본이 AI 매직 툴박스로 전송되었습니다. 톤앤매너를 골라보세요!");
  };

  // Helper for dynamic font scaling on both Left and Right panels!
  const getFontSizeClass = (type) => {
    // globalFontSize: 'normal' or 'large' (comfort version)
    if (globalFontSize === "large") {
      if (type === "title") return "text-lg md:text-xl font-black leading-snug";
      if (type === "label") return "text-sm md:text-base font-extrabold leading-relaxed";
      if (type === "body") return "text-sm md:text-base leading-relaxed font-medium";
      if (type === "script") return "text-base md:text-lg leading-loose font-semibold";
      if (type === "caption") return "text-xs md:text-sm font-semibold leading-normal";
    }
    // Default 'normal' size (Still comfortably readable, but slightly more compact)
    if (type === "title") return "text-base md:text-lg font-black leading-snug";
    if (type === "label") return "text-xs md:text-sm font-bold leading-normal";
    if (type === "body") return "text-xs md:text-sm leading-relaxed";
    if (type === "script") return "text-sm md:text-base leading-loose";
    if (type === "caption") return "text-[10px] md:text-xs leading-normal";
  };

  // Teleprompter Automatic Scroll logic
  useEffect(() => {
    if (isPrompterRunning && prompterScrollRef.current) {
      const speedMap = { 1: 15, 2: 30, 3: 45, 4: 65, 5: 90 };
      const pixelsPerSecond = speedMap[prompterSpeed] || 45;
      const intervalMs = 30;
      const increment = (pixelsPerSecond * intervalMs) / 1000;

      let currentScroll = prompterScrollRef.current.scrollTop;

      scrollIntervalRef.current = setInterval(() => {
        if (prompterScrollRef.current) {
          currentScroll += increment;
          prompterScrollRef.current.scrollTop = currentScroll;

          if (
            prompterScrollRef.current.scrollHeight - prompterScrollRef.current.clientHeight <=
            prompterScrollRef.current.scrollTop + 5
          ) {
            setIsPrompterRunning(false);
            showToast("프롬프터 낭독이 끝났습니다.");
          }
        }
      }, intervalMs);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPrompterRunning, prompterSpeed]);

  const startTeleprompter = (text) => {
    setPrompterText(text);
    setIsPrompterOpen(true);
    setIsPrompterRunning(false);
    setTimeout(() => {
      if (prompterScrollRef.current) {
        prompterScrollRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // Theme styling helpers mapping (Focus on ultra-clean sans-serif, high legibility)
  const theme = {
    bg: isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-800",
    headerBg: isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200 shadow-sm",
    panelBg: isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-md",
    cardBg: isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200",
    inputBg: isDarkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400",
    headingText: isDarkMode ? "text-white" : "text-slate-900",
    bodyText: isDarkMode ? "text-slate-300" : "text-slate-700",
    mutedText: isDarkMode ? "text-slate-400" : "text-slate-500",
    subtleBorder: isDarkMode ? "border-slate-800" : "border-slate-200",
    activeTab: isDarkMode ? "text-indigo-400 border-indigo-500 bg-indigo-950/20" : "text-indigo-600 border-indigo-600 bg-indigo-50",
    inactiveTab: isDarkMode ? "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100",
    scriptCardBg: isDarkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200",
    experimentBox: isDarkMode ? "bg-slate-950 border border-slate-850" : "bg-slate-50 border border-slate-200"
  };

  return (
    <div 
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${theme.bg}`}
      style={{ fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      
      {/* Global CSS Injector to enforce single unified sans-serif font across everything */}
      <style dangerouslySetInnerHTML={{__html: `
        * {
          font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}} />

      {/* Upper Navigation Header */}
      <header className={`sticky top-0 z-40 backdrop-blur border-b px-6 py-4 flex items-center justify-between transition-colors duration-200 ${theme.headerBg}`}>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Icons.Sparkles />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Short-form Commerce Lab</span>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${theme.headingText}`}>
              ShortPick Lab <span className={`text-xs font-normal py-0.5 px-2 rounded-full border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>v1.8 Premium</span>
            </h1>
          </div>
        </div>

        {/* Global Controls: Dark/Light Mode & Text Size Controls for High Accessibility */}
        <div className="flex items-center space-x-4">
          
          {/* Readability Options Bar (Simplified to 2 options: 보통 and 크게) */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${theme.cardBg}`}>
            <span className={`text-xs font-bold mr-1 flex items-center gap-1 ${theme.mutedText}`}>
              <Icons.TextSize /> 가독성:
            </span>
            <button
              onClick={() => setGlobalFontSize("normal")}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                globalFontSize === "normal"
                  ? "bg-indigo-600 text-white font-black"
                  : `${isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-200 text-slate-700"}`
              }`}
              title="보통 크기 텍스트"
            >
              보통
            </button>
            <button
              onClick={() => setGlobalFontSize("large")}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                globalFontSize === "large"
                  ? "bg-indigo-600 text-white font-black"
                  : `${isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-200 text-slate-700"}`
              }`}
              title="크게 보기"
            >
              크게
            </button>
          </div>

          {/* Theme Mode Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition ${theme.cardBg} ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-slate-600 hover:text-slate-900'}`}
            title={isDarkMode ? "라이트 모드로 전환 (가독성 추천)" : "다크 모드로 전환"}
          >
            {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition"
          >
            <Icons.Flame />
            데모 로드
          </button>
          <button
            onClick={handleReset}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'}`}
          >
            초기화
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Input Workspace Wizard Form */}
        <section className={`lg:col-span-5 rounded-2xl border p-6 flex flex-col space-y-6 transition-colors duration-200 ${theme.panelBg}`}>
          
          {/* STEP 1: 원본 레퍼런스 영상 링크 및 AI 분석 */}
          <div className={`border-b pb-5 ${theme.subtleBorder} space-y-4`}>
            <div className="flex items-center justify-between">
              <span className={`bg-indigo-600 text-white font-black px-2.5 py-1 rounded-full ${getFontSizeClass('caption')}`}>1단계</span>
              <span className={`font-bold ${isAnalyzed ? 'text-green-600 dark:text-green-400' : 'text-amber-500'} ${getFontSizeClass('caption')}`}>
                {isAnalyzed ? '● 분석 완료' : '○ 분석 대기'}
              </span>
            </div>
            
            <h2 className={`font-black flex items-center gap-2 ${theme.headingText} ${getFontSizeClass('title')}`}>
              <Icons.Link /> 레퍼런스 영상 분석
            </h2>

            {/* NEW: Input Mode Toggle (Link vs Image) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
              <button
                onClick={() => setInputMode('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                  inputMode === 'link' 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icons.Link /> 영상 링크로 분석
              </button>
              <button
                onClick={() => setInputMode('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                  inputMode === 'image' 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-purple-600 dark:text-purple-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icons.Image /> 캡처 이미지로 분석
              </button>
            </div>

            {/* Input Content based on Mode */}
            {inputMode === 'link' ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="유튜브 쇼츠 / 틱톡 / 릴스 주소를 넣어주세요."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={`flex-1 rounded-xl px-3.5 py-2.5 transition ${theme.inputBg} focus:outline-none focus:ring-1 focus:ring-indigo-500 ${getFontSizeClass('body')}`}
                />
                <button
                  type="button"
                  onClick={handleAnalyzeReference}
                  disabled={isAnalyzing}
                  className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 disabled:bg-slate-500 ${getFontSizeClass('body')}`}
                >
                  {isAnalyzing ? "분석중..." : "✨ 링크 분석 (AI)"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition ${isDarkMode ? 'border-slate-700 hover:border-purple-500' : 'border-slate-300 hover:border-purple-500'}`}>
                  <input 
                    type="file" 
                    id="image-upload" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                      <Icons.Upload />
                    </div>
                    <span className={`font-bold ${theme.headingText} ${getFontSizeClass('body')}`}>벤치마킹 이미지 업로드 (최대 3장)</span>
                    <span className={`text-[10px] ${theme.mutedText}`}>후킹, 본론, 결과 장면을 캡처해서 올려주세요.</span>
                  </label>
                </div>
                
                {/* Image Preview Area */}
                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={img.url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyzeReference}
                  disabled={isAnalyzing || uploadedImages.length === 0}
                  className={`w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95 disabled:bg-slate-500 disabled:cursor-not-allowed ${getFontSizeClass('body')}`}
                >
                  {isAnalyzing ? "이미지 시각 분석중..." : "✨ 업로드 이미지 분석 (AI)"}
                </button>
              </div>
            )}

            {/* Auto-filled details panel by AI */}
            {isAnalyzed && (
              <div className={`p-4 rounded-xl border space-y-2.5 animate-fadeIn ${theme.cardBg}`}>
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-dashed border-slate-300 dark:border-slate-800">
                  <span className={`font-black ${inputMode === 'link' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'} ${getFontSizeClass('label')}`}>
                    ✨ {inputMode === 'link' ? '링크 기반' : '이미지 비전'} 감지된 분석 정보
                  </span>
                  <button 
                    type="button"
                    onClick={() => setShowAdvanceRef(!showAdvanceRef)}
                    className="text-[10px] text-slate-500 hover:underline font-bold"
                  >
                    {showAdvanceRef ? "상세 닫기" : "수정/상세 보기"}
                  </button>
                </div>
                <div>
                  <span className={`text-slate-500 block ${getFontSizeClass('caption')}`}>검출/예측 제목</span>
                  <p className={`font-bold ${theme.bodyText} ${getFontSizeClass('body')}`}>{videoTitle || "제목 미상"}</p>
                </div>
                <div>
                  <span className={`text-slate-500 block ${getFontSizeClass('caption')}`}>추정 지표</span>
                  <p className={`font-bold ${theme.bodyText} ${getFontSizeClass('body')}`}>{metrics || "지표 미상"}</p>
                </div>

                {showAdvanceRef && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className={`text-slate-500 block mb-1 ${getFontSizeClass('caption')}`}>제목 수정</label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className={`w-full rounded p-1.5 ${theme.inputBg} ${getFontSizeClass('body')}`}
                      />
                    </div>
                    <div>
                      <label className={`text-slate-500 block mb-1 ${getFontSizeClass('caption')}`}>예상 지표 수정</label>
                      <input
                        type="text"
                        value={metrics}
                        onChange={(e) => setMetrics(e.target.value)}
                        className={`w-full rounded p-1.5 ${theme.inputBg} ${getFontSizeClass('body')}`}
                      />
                    </div>
                    <div>
                      <label className={`text-slate-500 block mb-1 ${getFontSizeClass('caption')}`}>화면 묘사 수정</label>
                      <textarea
                        rows="2"
                        value={videoContent}
                        onChange={(e) => setVideoContent(e.target.value)}
                        className={`w-full rounded p-1.5 resize-none ${theme.inputBg} ${getFontSizeClass('body')}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: 판매할 한국 쇼핑 상품 정보 입력 */}
          <div className={`border-b pb-5 ${theme.subtleBorder} space-y-4`}>
            <div className="flex items-center justify-between">
              <span className={`bg-indigo-600 text-white font-black px-2.5 py-1 rounded-full ${getFontSizeClass('caption')}`}>2단계</span>
              <span className={`font-bold ${productName ? 'text-green-600 dark:text-green-400' : 'text-slate-400'} ${getFontSizeClass('caption')}`}>
                {productName ? '● 작성중' : '○ 미작성'}
              </span>
            </div>

            <h2 className={`font-black flex items-center gap-2 ${theme.headingText} ${getFontSizeClass('title')}`}>
              <Icons.Target /> 한국 세일즈용 상품 정보
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block font-bold mb-1 ${theme.bodyText} ${getFontSizeClass('label')}`}>상품명 *</label>
                <input
                  type="text"
                  placeholder="예: 곡물 발효 효소"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 transition ${theme.inputBg} focus:outline-none focus:ring-1 focus:ring-indigo-500 ${getFontSizeClass('body')}`}
                  required
                />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${theme.bodyText} ${getFontSizeClass('label')}`}>상품 카테고리</label>
                <input
                  type="text"
                  placeholder="예: 건강 간식"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 transition ${theme.inputBg} focus:outline-none focus:ring-1 focus:ring-indigo-500 ${getFontSizeClass('body')}`}
                />
              </div>
            </div>

            {/* Target 페르소나 디폴트 정보 아코디언 */}
            <div className={`p-4 rounded-xl border space-y-2 transition-colors duration-200 ${theme.cardBg}`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-dashed border-slate-300 dark:border-slate-800">
                <span className={`font-black text-indigo-600 dark:text-indigo-400 ${getFontSizeClass('label')}`}>타깃 디폴트 프로필</span>
                <span className={`font-bold ${theme.mutedText} ${getFontSizeClass('caption')}`}>자동 셋팅됨</span>
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className="flex items-center">
                  <span className={`${theme.mutedText} font-bold whitespace-nowrap ${getFontSizeClass('body')}`}>타깃 층: </span>
                  <input 
                    type="text" 
                    value={targetGenderAge} 
                    onChange={(e) => setTargetGenderAge(e.target.value)}
                    className={`bg-transparent focus:outline-none ml-1 py-0.5 w-full ${theme.bodyText} ${getFontSizeClass('body')}`}
                  />
                </div>
                <div className="flex items-center">
                  <span className={`${theme.mutedText} font-bold whitespace-nowrap ${getFontSizeClass('body')}`}>타깃의 주 고민: </span>
                  <input 
                    type="text" 
                    value={targetConcerns} 
                    onChange={(e) => setTargetConcerns(e.target.value)}
                    className={`bg-transparent focus:outline-none ml-1 py-0.5 w-full ${theme.bodyText} ${getFontSizeClass('body')}`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${theme.bodyText} ${getFontSizeClass('label')}`}>핵심 셀링 포인트 (장점/강도) *</label>
              <textarea
                rows="2"
                placeholder="예: 80만 역가수치로 탄수화물을 물처럼 싹 녹이고, 고소한 인절미 맛이라 군것질 대신 한 포씩 먹기 좋아요."
                value={sellingPoint}
                onChange={(e) => setSellingPoint(e.target.value)}
                className={`w-full rounded-xl p-3 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none ${theme.inputBg} ${getFontSizeClass('body')}`}
                required
              />
            </div>
          </div>

          {/* STEP 3: 최종 원클릭 세일즈 대본 패키지 빌드 */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className={`bg-indigo-600 text-white font-black px-2.5 py-1 rounded-full ${getFontSizeClass('caption')}`}>3단계</span>
              <span className={`font-bold ${analysisResult ? 'text-green-600 dark:text-green-400' : 'text-slate-400'} ${getFontSizeClass('caption')}`}>
                {analysisResult ? '● 패키지 대기완료' : '○ 기획 대기'}
              </span>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isLoading}
              className={`w-full py-4 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition ${
                isLoading
                  ? "bg-slate-450 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20 active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  최고효율 쇼핑 대본 조합 중...
                </>
              ) : (
                <>
                  <Icons.Sparkles /> 🎬 맞춤 쇼핑 대본 패키지 즉시 생성
                </>
              )}
            </button>
          </div>

        </section>

        {/* Right Side: Results & Prompter Dashboard */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          
          {analysisResult ? (
            <div className={`border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full transition-colors duration-200 ${theme.panelBg}`}>
              
              {/* Tab Bar Selection */}
              <div className={`flex px-4 pt-4 overflow-x-auto scrollbar-none gap-1 border-b ${theme.subtleBorder}`}>
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-4 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition rounded-t-lg ${
                    activeTab === "analysis" ? theme.activeTab : theme.inactiveTab
                  }`}
                >
                  📊 요약 및 원인 분석
                </button>
                <button
                  onClick={() => setActiveTab("scripts")}
                  className={`px-4 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition rounded-t-lg ${
                    activeTab === "scripts" ? theme.activeTab : theme.inactiveTab
                  }`}
                >
                  🎬 숏폼 판매 대본
                </button>
                <button
                  onClick={() => setActiveTab("storyboard")}
                  className={`px-4 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition rounded-t-lg ${
                    activeTab === "storyboard" ? theme.activeTab : theme.inactiveTab
                  }`}
                >
                  📋 키컷 스토리보드
                </button>
                <button
                  onClick={() => setActiveTab("copywriting")}
                  className={`px-4 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition rounded-t-lg ${
                    activeTab === "copywriting" ? theme.activeTab : theme.inactiveTab
                  }`}
                >
                  ✍️ 카피 & 자막 추천
                </button>
                <button
                  onClick={() => setActiveTab("aiTools")}
                  className={`px-4 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition rounded-t-lg ${
                    activeTab === "aiTools" ? theme.activeTab : theme.inactiveTab
                  }`}
                >
                  ✨ AI 매직 툴박스
                </button>
              </div>

              {/* Dynamic Tab Content Area with configurable font sizes for great readability */}
              <div className="p-6 flex-1 overflow-y-auto max-h-[750px]">
                
                {/* TAB 1: 요약 및 원인 분석 */}
                {activeTab === "analysis" && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* 3-Line Core Virality Summary */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 rounded-2xl border border-indigo-500/20">
                      <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Icons.Sparkles /> 3줄 구조 핵심 비결 요약
                      </h3>
                      <ul className={`space-y-3 list-disc pl-5 ${getFontSizeClass('body')} ${theme.bodyText}`}>
                        {analysisResult.summary.map((item, idx) => (
                          <li key={idx} className="font-medium">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Meta reliability info banner */}
                    <div className={`p-4 rounded-xl border grid grid-cols-2 gap-4 text-xs ${theme.cardBg}`}>
                      <div>
                        <span className={`block font-bold ${theme.mutedText} ${getFontSizeClass('caption')}`}>분석 신뢰성 레벨</span>
                        <span className={`font-black inline-block px-2.5 py-0.5 rounded mt-1.5 ${
                          analysisResult.basicInfo.reliability === "높음" 
                            ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                            : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        } ${getFontSizeClass('caption')}`}>
                          {analysisResult.basicInfo.reliability} ({analysisResult.basicInfo.reliability === "높음" ? "정밀 분석" : "추정 분석"})
                        </span>
                      </div>
                      <div>
                        <span className={`block font-bold ${theme.mutedText} ${getFontSizeClass('caption')}`}>신뢰 이유 및 근거</span>
                        <span className={`mt-1 block leading-relaxed ${theme.bodyText} ${getFontSizeClass('body')}`}>{analysisResult.basicInfo.reliabilityReason}</span>
                      </div>
                    </div>

                    {/* Virality Grid Analysis */}
                    <div>
                      <h3 className={`font-black mb-3 ${theme.headingText} ${getFontSizeClass('title')}`}>왜 이 영상이 폭발했는가?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: "첫 3초 후킹 장치", desc: analysisResult.whyViral.hook },
                          { title: "핵심 공감 자극", desc: analysisResult.whyViral.empathy },
                          { title: "일상적 문제제기", desc: analysisResult.whyViral.problem },
                          { title: "시각적 통쾌감", desc: analysisResult.whyViral.visual },
                          { title: "댓글 활성화 유도", desc: analysisResult.whyViral.comment },
                          { title: "세일즈 구매전환", desc: analysisResult.whyViral.conversion },
                        ].map((item, index) => (
                          <div key={index} className={`p-4.5 rounded-xl border ${theme.cardBg}`}>
                            <span className={`text-indigo-600 dark:text-indigo-400 font-extrabold ${getFontSizeClass('label')}`}>{item.title}</span>
                            <p className={`mt-1.5 leading-relaxed ${theme.bodyText} ${getFontSizeClass('body')}`}>{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benchmarking Actions */}
                    <div className={`border-t pt-5 space-y-4 ${theme.subtleBorder}`}>
                      <h3 className={`font-black ${theme.headingText} ${getFontSizeClass('title')}`}>현업 세일즈 실전 벤치마킹 전략</h3>
                      <div className="space-y-3">
                        <div className={`flex items-start gap-3 p-4 rounded-xl border ${theme.cardBg}`}>
                          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black px-2 py-1 rounded">그대로 유지</span>
                          <p className={`leading-relaxed flex-1 ${theme.bodyText} ${getFontSizeClass('body')}`}>{analysisResult.benchmarking.keep}</p>
                        </div>
                        <div className={`flex items-start gap-3 p-4 rounded-xl border ${theme.cardBg}`}>
                          <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-black px-2 py-1 rounded">수정/교체</span>
                          <p className={`leading-relaxed flex-1 ${theme.bodyText} ${getFontSizeClass('body')}`}>{analysisResult.benchmarking.change}</p>
                        </div>
                        <div className={`flex items-start gap-3 p-4 rounded-xl border ${theme.cardBg}`}>
                          <span className="bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs font-black px-2 py-1 rounded">한국형 각색</span>
                          <p className={`leading-relaxed flex-1 ${theme.bodyText} ${getFontSizeClass('body')}`}>{analysisResult.benchmarking.adapt}</p>
                        </div>
                        <div className={`flex items-start gap-3 p-4 rounded-xl border border-red-500/20 ${theme.cardBg}`}>
                          <span className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-black px-2 py-1 rounded">주의 사항</span>
                          <p className={`leading-relaxed flex-1 ${theme.bodyText} ${getFontSizeClass('body')}`}>{analysisResult.benchmarking.caution}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hook Recommendation list */}
                    <div className={`border-t pt-5 ${theme.subtleBorder}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-black ${theme.headingText} ${getFontSizeClass('title')}`}>3초 이탈 방지 한국형 훅 (Hook) 5종</h3>
                        <span className={`text-xs ${theme.mutedText}`}>클릭 시 자동복사</span>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.hooks.koreanHooks.map((hk, i) => (
                          <div
                            key={i}
                            onClick={() => handleCopyText(hk, `훅 문구 #${i+1}`)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition hover:border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/20 ${theme.cardBg} ${theme.bodyText} ${getFontSizeClass('body')}`}
                          >
                            <span><strong className="text-indigo-600 dark:text-indigo-400 mr-2">0{i+1}.</strong> {hk}</span>
                            <Icons.Copy />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: 쇼핑 숏폼 판매 대본 */}
                {activeTab === "scripts" && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Teleprompter Integration Notice Banner */}
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 rounded-xl border border-amber-500/20 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-amber-600 dark:text-amber-300">📱 촬영 전 필독! 숏픽랩 스마트 텔레프롬프터</h4>
                        <p className={`text-slate-600 dark:text-slate-400 ${getFontSizeClass('caption')}`}>
                          대본 카드 우측 상단의 <strong className="text-indigo-600 dark:text-indigo-400">플레이 ▶ 버튼</strong>을 누르면 낭독 속도와 글자크기 조절이 가능한 프롬프터 모드로 즉각 진입합니다.
                        </p>
                      </div>
                    </div>

                    {/* 15s - 5 Versions */}
                    <div>
                      <h3 className={`font-black border-b pb-2 mb-4 ${theme.headingText} ${theme.subtleBorder} ${getFontSizeClass('title')}`}>
                        💡 가장 많이 쓰는 15초형 소구 대본 (5대 심리 유형)
                      </h3>
                      
                      <div className="space-y-6">
                        {Object.entries(analysisResult.scripts15s).map(([key, value]) => {
                          const labels = {
                            soldOut: { title: "📦 1. 품절 압박형 대본", desc: "홈쇼핑 한정 마감 기법으로 즉각적인 품절 심리를 유도하는 고자극 스크립트" },
                            empathy: { title: "🤝 2. 공감 문제해결형 대본", desc: "타깃의 하루 일상 속 고충을 부드럽게 위로하며 제품의 필요성을 어필하는 감성 자극 스크립트" },
                            comparison: { title: "⚖️ 3. 비교 반전형 대본", desc: "타사의 무리한 연출과 자사 천연 실험 분해력을 극적으로 대조하여 통쾌함을 제공하는 스크립트" },
                            expert: { title: "🩺 4. 전문가 추천형 대본", desc: "이성적인 수치 분석 및 과학적 설계를 통하여 구매의 정당성과 신뢰도를 심어주는 스크립트" },
                            review: { title: "💬 5. 솔직 후기형 대본", desc: "직접 반년 이상 복용해 본 크리에이터가 날것 그대로 전수하는 데일리 건강 꿀팁 스크립트" }
                          };

                          const labelInfo = labels[key] || { title: key, desc: "" };
                          const fullScriptText = `${value.hook} ${value.empathy} ${value.solution} ${value.benefit} ${value.cta}`;

                          return (
                            <div key={key} className={`border rounded-2xl p-5 space-y-4 shadow-sm transition-colors duration-200 ${theme.scriptCardBg}`}>
                              <div className="flex items-start justify-between border-b pb-3 border-dashed border-slate-300 dark:border-slate-800">
                                <div>
                                  <h4 className={`font-black ${theme.headingText} ${getFontSizeClass('label')}`}>{labelInfo.title}</h4>
                                  <p className={`text-[11px] mt-0.5 ${theme.mutedText}`}>{labelInfo.desc}</p>
                                </div>
                                <div className="flex gap-2.5">
                                  <button
                                    onClick={() => handleCopyText(fullScriptText, labelInfo.title)}
                                    className={`p-1.5 rounded-lg border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}
                                    title="대사 클립보드 복사"
                                  >
                                    <Icons.Copy />
                                  </button>
                                  <button
                                    onClick={() => startTeleprompter(fullScriptText)}
                                    className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                                    title="프롬프터 열기"
                                  >
                                    <Icons.Play /> 프롬프터
                                  </button>
                                  <button
                                    onClick={() => sendToAIToneChanger(fullScriptText)}
                                    className="p-1.5 bg-purple-600/10 text-purple-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg border border-purple-500/20 transition text-xs font-bold"
                                    title="AI 톤 체인저로 바로 보내기"
                                  >
                                    ✨ AI 각색
                                  </button>
                                </div>
                              </div>

                              <div className={`p-4 rounded-xl text-slate-800 dark:text-slate-200 leading-loose space-y-4 font-normal ${theme.experimentBox} ${getFontSizeClass('script')}`}>
                                <p className="border-l-4 border-red-500 pl-3">
                                  <strong className="text-red-500 mr-2">[0~2초 후킹]</strong> {value.hook}
                                </p>
                                <p className="border-l-4 border-orange-500 pl-3">
                                  <strong className="text-orange-500 mr-2">[2~5초 문제제기]</strong> {value.empathy}
                                </p>
                                <p className="border-l-4 border-yellow-500 pl-3">
                                  <strong className="text-yellow-600 dark:text-yellow-400 mr-2">[5~8초 해결책]</strong> {value.solution}
                                </p>
                                <p className="border-l-4 border-blue-500 pl-3">
                                  <strong className="text-blue-500 mr-2">[8~12초 강점]</strong> {value.benefit}
                                </p>
                                <p className="border-l-4 border-purple-500 pl-3">
                                  <strong className="text-purple-500 mr-2">[12~15초 CTA]</strong> {value.cta}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 20s Extended Script */}
                    <div className={`border-t pt-6 ${theme.subtleBorder}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`font-black ${theme.headingText} ${getFontSizeClass('title')}`}>⏱️ 20초 심화 확장형 대본</h3>
                          <p className={`text-xs mt-0.5 ${theme.mutedText}`}>디테일한 작용 메커니즘을 3~4초 연장하여 확실한 이성적 신뢰를 완성합니다.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const text = `${analysisResult.script20s.hook} ${analysisResult.script20s.empathy} ${analysisResult.script20s.solution} ${analysisResult.script20s.benefit} ${analysisResult.script20s.cta}`;
                              handleCopyText(text, "20초 확장 대본");
                            }}
                            className={`p-1.5 rounded-lg border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}
                          >
                            <Icons.Copy />
                          </button>
                          <button
                            onClick={() => {
                              const text = `${analysisResult.script20s.hook} ${analysisResult.script20s.empathy} ${analysisResult.script20s.solution} ${analysisResult.script20s.benefit} ${analysisResult.script20s.cta}`;
                              startTeleprompter(text);
                            }}
                            className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                          >
                            <Icons.Play /> 프롬프터
                          </button>
                        </div>
                      </div>

                      <div className={`p-5 rounded-2xl border leading-loose space-y-4 ${theme.scriptCardBg} ${getFontSizeClass('script')}`}>
                        <p><strong className="text-indigo-600 dark:text-indigo-400 block mb-1">0~3초: 첫 인상 후킹</strong> {analysisResult.script20s.hook}</p>
                        <p><strong className="text-indigo-600 dark:text-indigo-400 block mb-1">3~6초: 깊은 고충 공감</strong> {analysisResult.script20s.empathy}</p>
                        <p><strong className="text-indigo-600 dark:text-indigo-400 block mb-1">6~10초: 핵심 해결 단서</strong> {analysisResult.script20s.solution}</p>
                        <p><strong className="text-indigo-600 dark:text-indigo-400 block mb-1">10~15초: 확실한 스펙 소구</strong> {analysisResult.script20s.benefit}</p>
                        <p><strong className="text-indigo-600 dark:text-indigo-400 block mb-1">15~20초: 확실한 구매 촉구</strong> {analysisResult.script20s.cta}</p>
                      </div>
                    </div>

                    {/* 30s UGC Review Narrative */}
                    <div className={`border-t pt-6 ${theme.subtleBorder}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`font-black ${theme.headingText} ${getFontSizeClass('title')}`}>🗣️ 30초 풀-리뷰형 나레이션 (UGC 내추럴 감성)</h3>
                          <p className={`text-xs mt-0.5 ${theme.mutedText}`}>억지 광고 느낌을 철저히 배제하고 속삭이듯 친근한 구어체로 유도합니다.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyText(analysisResult.script30s, "30초 리뷰 나레이션")}
                            className={`p-1.5 rounded-lg border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}
                          >
                            <Icons.Copy />
                          </button>
                          <button
                            onClick={() => startTeleprompter(analysisResult.script30s)}
                            className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                          >
                            <Icons.Play /> 프롬프터
                          </button>
                        </div>
                      </div>

                      <div className={`p-6 rounded-2xl border leading-loose font-medium italic tracking-wide ${theme.scriptCardBg} ${getFontSizeClass('script')}`}>
                        "{analysisResult.script30s}"
                      </div>
                    </div>

                    {analysisResult.dialectScripts && (
                      <div className={`border-t pt-6 ${theme.subtleBorder}`}>
                        <h3 className={`font-black mb-4 ${theme.headingText} ${getFontSizeClass('title')}`}>🗣️ 바로 쓰는 사투리 버전 15초 대본</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.dialectScripts.gyeongsang15s && (
                            <div className={`p-5 rounded-2xl border ${theme.scriptCardBg}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-black text-orange-500">🍊 경상도 사투리 버전</h4>
                                <button onClick={() => handleCopyText(analysisResult.dialectScripts.gyeongsang15s, "경상도 사투리 대본")} className={`p-1.5 rounded-lg border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}><Icons.Copy /></button>
                              </div>
                              <p className={`whitespace-pre-wrap leading-loose ${theme.bodyText} ${getFontSizeClass('script')}`}>{analysisResult.dialectScripts.gyeongsang15s}</p>
                            </div>
                          )}
                          {analysisResult.dialectScripts.jeolla15s && (
                            <div className={`p-5 rounded-2xl border ${theme.scriptCardBg}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-black text-emerald-500">🌾 전라도 사투리 버전</h4>
                                <button onClick={() => handleCopyText(analysisResult.dialectScripts.jeolla15s, "전라도 사투리 대본")} className={`p-1.5 rounded-lg border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}><Icons.Copy /></button>
                              </div>
                              <p className={`whitespace-pre-wrap leading-loose ${theme.bodyText} ${getFontSizeClass('script')}`}>{analysisResult.dialectScripts.jeolla15s}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 3: 키컷 스토리보드 */}
                {activeTab === "storyboard" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-black ${theme.headingText} ${getFontSizeClass('title')}`}>🎥 촬영지침 키컷 스토리보드</h3>
                        <p className={`text-xs mt-0.5 ${theme.mutedText}`}>1인 크리에이터 혹은 촬영 감독이 카메라를 세팅할 때 보고 바로 따라할 수 있는 레벨로 구성되었습니다.</p>
                      </div>
                    </div>

                    {/* Storyboard Table / Grid */}
                    <div className="space-y-4">
                      {analysisResult.storyboard.map((item, index) => (
                        <div key={index} className={`rounded-xl border overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-colors duration-200 ${theme.cardBg}`}>
                          <div className={`md:col-span-2 p-4 border-r flex flex-col justify-center items-center text-center bg-indigo-50 dark:bg-indigo-950/20 ${theme.subtleBorder}`}>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">구간</span>
                            <span className={`text-lg font-black ${theme.headingText}`}>{item.time}</span>
                          </div>

                          <div className="md:col-span-10 p-5 space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className={`text-[10px] font-bold block uppercase ${theme.mutedText}`}>🎬 화면 연출 기획</span>
                                <p className={`font-semibold mt-1 leading-relaxed ${theme.headingText} ${getFontSizeClass('body')}`}>{item.layout}</p>
                              </div>
                              <div>
                                <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold block uppercase">💬 자막 자막 가이드</span>
                                <p className={`font-black mt-1 leading-relaxed text-indigo-600 dark:text-indigo-300 ${getFontSizeClass('body')}`}>{item.subtitle}</p>
                              </div>
                            </div>

                            <div className={`border-t pt-3 ${theme.subtleBorder}`}>
                              <span className={`text-[10px] font-bold block uppercase ${theme.mutedText}`}>🎙️ 나레이션 보이스오버 대사</span>
                              <p className={`font-mono mt-1 leading-loose ${theme.bodyText} ${getFontSizeClass('body')}`}>{item.narration}</p>
                            </div>

                            <div className={`p-3 rounded border text-xs flex items-start gap-1.5 ${isDarkMode ? 'bg-slate-950/80 text-amber-300 border-amber-500/20' : 'bg-amber-50/50 text-amber-800 border-amber-300'}`}>
                              <span className="text-sm">💡</span>
                              <span><strong>촬영 꿀팁:</strong> {item.tip}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: 카피 & 자막 추천 */}
                {activeTab === "copywriting" && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Thumbnail Headline 10 */}
                    <div>
                      <h3 className={`font-black mb-3 ${theme.headingText} ${getFontSizeClass('title')}`}>🏷️ 고시인성 썸네일 카피 (10선)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {analysisResult.copywriting.thumbnails.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleCopyText(item, `썸네일 카피 #${idx+1}`)}
                            className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition hover:border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/10 ${theme.cardBg}`}
                          >
                            <span className={`font-bold leading-normal ${theme.bodyText} ${getFontSizeClass('body')}`}><strong className="text-indigo-600 dark:text-indigo-400 mr-2">#{idx+1}</strong>{item}</span>
                            <Icons.Copy />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reels/Shorts Caption 10 */}
                    <div className={`border-t pt-6 ${theme.subtleBorder}`}>
                      <h3 className={`font-black mb-3 ${theme.headingText} ${getFontSizeClass('title')}`}>📝 릴스/쇼츠 본문 피드 캡션 (10선)</h3>
                      <div className="space-y-2">
                        {analysisResult.copywriting.captions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleCopyText(item, `본문 캡션 #${idx+1}`)}
                            className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition hover:border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/10 ${theme.cardBg}`}
                          >
                            <span className={`leading-relaxed pr-3 ${theme.bodyText} ${getFontSizeClass('body')}`}>{item}</span>
                            <Icons.Copy />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action 10 */}
                    <div className={`border-t pt-6 ${theme.subtleBorder}`}>
                      <h3 className={`font-black mb-3 ${theme.headingText} ${getFontSizeClass('title')}`}>🔥 즉각 주문 행동 유도 CTA 카피 (10선)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {analysisResult.ctas.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleCopyText(item, `CTA 카피 #${idx+1}`)}
                            className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition hover:border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/10 ${theme.cardBg}`}
                          >
                            <span className={`font-extrabold ${theme.bodyText} ${getFontSizeClass('body')}`}><strong className="text-indigo-600 dark:text-indigo-400 mr-2">#{idx+1}</strong>{item}</span>
                            <Icons.Copy />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Comment hooks 5 */}
                    <div className={`border-t pt-6 ${theme.subtleBorder}`}>
                      <h3 className={`font-black mb-3 ${theme.headingText} ${getFontSizeClass('title')}`}>💬 댓글 지수 성장을 위한 AI 마중물 댓글 (5선)</h3>
                      <div className="space-y-2">
                        {analysisResult.copywriting.comments.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleCopyText(item, `부스팅 댓글 #${idx+1}`)}
                            className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition hover:border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/10 ${theme.cardBg}`}
                          >
                            <span className={`leading-normal ${theme.bodyText} ${getFontSizeClass('body')}`}><strong className="text-indigo-600 dark:text-indigo-400 mr-2">#부스트{idx+1}</strong>{item}</span>
                            <Icons.Copy />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 5: ✨ AI 매직 툴박스 */}
                {activeTab === "aiTools" && (
                  <div className="space-y-8 animate-fadeIn">
                    
                    {/* Introduction Banner */}
                    <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20">
                      <h3 className="text-base font-black text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5">
                        <Icons.Sparkles /> 숏픽랩 ✨ AI 매직 툴박스 (Gemini 2.5)
                      </h3>
                      <p className={`text-slate-600 dark:text-slate-300 mt-2 leading-relaxed ${getFontSizeClass('body')}`}>
                        비디오 커머스 실전 알고리즘을 딥러닝한 Gemini API를 사용하여 대본의 완벽한 톤 전환, 진상 고객 및 반대 악플 돌파 치트키, 그리고 배경음 연출 큐시트까지 원클릭으로 추출합니다.
                      </p>
                    </div>

                    {/* TOOL 1: ✨ AI 대본 톤 체인저 */}
                    <div className={`border rounded-2xl p-6 space-y-4 shadow-sm ${theme.scriptCardBg}`}>
                      <div>
                        <span className="text-xs font-bold text-indigo-500 tracking-wider block mb-1">TOOL 01</span>
                        <h4 className={`text-base font-black flex items-center gap-1.5 ${theme.headingText}`}>
                          ✨ AI 숏폼 대본 톤 체인저 (Vibe Changer)
                        </h4>
                        <p className={`text-xs ${theme.mutedText}`}>설정하신 오리지널 대본의 내용을 해치지 않으면서 타깃 밀착형 캐릭터의 완벽한 화법으로 각색합니다.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className={`block font-bold mb-1 ${theme.bodyText} ${getFontSizeClass('label')}`}>각색할 대상 대사 텍스트</label>
                          <textarea
                            rows="3"
                            value={aiToneSourceText}
                            onChange={(e) => setAiToneSourceText(e.target.value)}
                            placeholder="변환하고 싶은 기준 스크립트를 입력하시거나, 좌측 상단 탭의 생성 대본에서 '✨ AI 톤앤비지엠'을 클릭해 전송하세요."
                            className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme.inputBg}`}
                          />
                        </div>

                        {/* Tone & Dialect Selector Buttons Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {["츤데레 친언니", "하이텐션 홈쇼핑 쇼호스트", "냉철한 팩폭 약사", "감성 가득한 일상 브이로거", "급식체 가득한 힙스터", "경상도 사투리 이모", "전라도 사투리 이모"].map((tone) => (
                            <button
                              key={tone}
                              type="button"
                              onClick={() => setAiSelectedTone(tone)}
                              className={`py-2 px-2 text-[11px] font-bold rounded-lg border transition ${
                                aiSelectedTone === tone
                                  ? "bg-indigo-500 text-white font-black border-indigo-600 shadow"
                                  : `${theme.inputBg} hover:opacity-90`
                              }`}
                            >
                              {tone === "경상도 사투리 이모" ? "🍊 경상도 사투리" : tone === "전라도 사투리 이모" ? "🌾 전라도 사투리" : tone}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={handleToneChange}
                          disabled={isToneChanging}
                          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                        >
                          {isToneChanging ? "Gemini가 대본 입체적 각색 중..." : "✨ 선택한 캐릭터 화법으로 대본 1초 변환"}
                        </button>

                        {aiToneResultText && (
                          <div className={`rounded-xl p-4 mt-4 space-y-2 border ${theme.cardBg}`}>
                            <div className="flex items-center justify-between border-b pb-2 mb-2 border-dashed border-slate-300 dark:border-slate-800">
                              <span className="text-xs font-black text-amber-500">✨ AI 리라이팅 대본 [{aiSelectedTone} 버전]</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleCopyText(aiToneResultText, `${aiSelectedTone} 대본`)}
                                  className={`p-1 rounded border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:text-white' : 'bg-slate-200 border-slate-300 text-slate-700'}`}
                                  title="복사"
                                >
                                  <Icons.Copy />
                                </button>
                                <button
                                  onClick={() => startTeleprompter(aiToneResultText)}
                                  className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Icons.Play /> 프롬프터 전송
                                </button>
                              </div>
                            </div>
                            <p className={`leading-loose whitespace-pre-wrap ${theme.bodyText} ${getFontSizeClass('body')}`}>{aiToneResultText}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TOOL 2: ✨ AI 반론 돌파 치트키 */}
                    <div className={`border rounded-2xl p-6 space-y-4 shadow-sm ${theme.scriptCardBg}`}>
                      <div>
                        <span className="text-xs font-bold text-indigo-500 tracking-wider block mb-1">TOOL 02</span>
                        <h4 className={`text-base font-black flex items-center gap-1.5 ${theme.headingText}`}>
                          ✨ AI 숏폼 댓글 반론 극복기 (Objection Crusher)
                        </h4>
                        <p className={`text-xs ${theme.mutedText}`}>"진짜 효과 있나요?", "비싸요" 등의 저항 반응을 구매 촉진의 강력한 무기로 대역전시킵니다.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className={`block font-bold mb-1 ${theme.bodyText} ${getFontSizeClass('label')}`}>우려되는 고객 트집 및 부정적 의견</label>
                          <input
                            type="text"
                            value={aiObjectionText}
                            onChange={(e) => setAiObjectionText(e.target.value)}
                            placeholder="예: 효과가 없으면 전액 환불해 주나요?"
                            className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme.inputBg}`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleCrushObjection}
                          disabled={isCrushingObjection}
                          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                        >
                          {isCrushingObjection ? "철벽 세일즈 가드 대사 연산 중..." : "✨ 논리적 세일즈 반론 극복 시나리오 설계"}
                        </button>

                        {aiObjectionResult && (
                          <div className={`rounded-xl p-4 mt-4 space-y-4 border ${theme.cardBg}`}>
                            <div>
                              <span className="text-xs font-bold text-red-500 block mb-1">🎤 1) 비디오 대본 내 자연스러운 타파 구절 (10초)</span>
                              <p className={`leading-relaxed bg-white dark:bg-slate-900 p-3 rounded border ${theme.bodyText} ${getFontSizeClass('body')} ${theme.subtleBorder}`}>{aiObjectionResult.videoDefenseScript}</p>
                              <button
                                onClick={() => handleCopyText(aiObjectionResult.videoDefenseScript, "비디오 돌파 구절")}
                                className={`mt-1.5 text-[10px] font-bold flex items-center gap-1 ${theme.mutedText} hover:text-indigo-500`}
                              >
                                <Icons.Copy /> 구절 복사
                              </button>
                            </div>

                            <div className={`border-t pt-3.5 ${theme.subtleBorder}`}>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">💬 2) 신뢰를 높이는 공식 답변 오피셜 댓글</span>
                              <p className={`leading-relaxed bg-white dark:bg-slate-900 p-3 rounded border ${theme.bodyText} ${getFontSizeClass('body')} ${theme.subtleBorder}`}>{aiObjectionResult.officialCommentReply}</p>
                              <button
                                onClick={() => handleCopyText(aiObjectionResult.officialCommentReply, "오피셜 답변")}
                                className={`mt-1.5 text-[10px] font-bold flex items-center gap-1 ${theme.mutedText} hover:text-indigo-500`}
                              >
                                <Icons.Copy /> 댓글 복사
                              </button>
                            </div>

                            <div className={`border-t pt-3.5 ${theme.subtleBorder}`}>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">💡 3) 반대 우려를 역이용한 다음 영상 후킹각</span>
                              <p className={`leading-loose italic font-bold ${theme.headingText} ${getFontSizeClass('body')}`}>"{aiObjectionResult.socialProofAngle}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TOOL 3: ✨ AI 오디오 & 효과음 디렉터 */}
                    <div className={`border rounded-2xl p-6 space-y-4 shadow-sm ${theme.scriptCardBg}`}>
                      <div>
                        <span className="text-xs font-bold text-indigo-500 tracking-wider block mb-1">TOOL 03</span>
                        <h4 className={`text-base font-black flex items-center gap-1.5 ${theme.headingText}`}>
                          ✨ AI 오디오 & 효과음 디렉터 (Audio Matcher)
                        </h4>
                        <p className={`text-xs ${theme.mutedText}`}>대본의 감정 흐름을 포착하여 영상 퀄리티를 수직 상승시킬 사운드 타이밍을 지정해 줍니다.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className={`block font-bold mb-1 ${theme.bodyText}`}>오디오 분석을 진행할 타깃 스크립트</label>
                          <textarea
                            rows="3"
                            value={aiAudioScriptText}
                            onChange={(e) => setAiAudioScriptText(e.target.value)}
                            placeholder="사운드 효과 가이드를 얹고 싶은 전체 나레이션 대사를 입력해 주세요."
                            className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme.inputBg}`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAudioAnalysis}
                          disabled={isAnalyzingAudio}
                          className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                        >
                          {isAnalyzingAudio ? "배경 오디오 및 기교 큐시트 연산 중..." : "✨ 문장별 오디오 디렉팅 큐시트 생성"}
                        </button>

                        {aiAudioResult && (
                          <div className={`rounded-xl p-4 mt-4 space-y-4 border ${theme.cardBg}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className={`p-3 rounded-lg border ${theme.subtleBorder} bg-white dark:bg-slate-900`}>
                                <span className={`block uppercase font-black text-[9px] ${theme.mutedText}`}>추천 백그라운드 뮤직 (BGM)</span>
                                <span className="text-teal-600 dark:text-teal-400 font-extrabold mt-1 block">{aiAudioResult.bgmRecommendation}</span>
                              </div>
                              <div className={`p-3 rounded-lg border ${theme.subtleBorder} bg-white dark:bg-slate-900`}>
                                <span className={`block uppercase font-black text-[9px] ${theme.mutedText}`}>보이스 스피드/강약 조절 기교</span>
                                <span className={`font-bold mt-1 block leading-relaxed ${theme.headingText}`}>{aiAudioResult.pacingGuide}</span>
                              </div>
                            </div>

                            <div className={`border-t pt-3.5 ${theme.subtleBorder}`}>
                              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block mb-2">⏱️ 각 나레이션 부근 효과음(SFX) 삽입 지침</span>
                              <div className="space-y-2">
                                {aiAudioResult.audioTimeline.map((item, idx) => (
                                  <div key={idx} className={`p-3.5 rounded border flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-slate-900/50 ${theme.subtleBorder} ${getFontSizeClass('body')}`}>
                                    <span className={`font-medium md:max-w-xs ${theme.bodyText}`}>"{item.segmentText}" 발음 시점</span>
                                    <div className="flex gap-2 text-[11px] font-bold">
                                      <span className="bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/10">{item.sfxEffect}</span>
                                      <span className="bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/10">{item.volumeControl}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Bottom Sticky Action Footer */}
              <div className={`p-4 flex justify-between items-center text-xs border-t transition-colors duration-200 ${theme.headerBg} ${theme.mutedText}`}>
                <span>© ShortPick Lab ∙ 출력 텍스트 우측 상단 카피 아이콘을 누르면 바로 클립보드로 전송됩니다.</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-1 animate-pulse">
                  🌟 Tip: 라이트 모드와 우측 상단의 글꼴 조절을 조합해 보세요!
                </span>
              </div>

            </div>
          ) : (
            // Empty State Dashboard Landing
            <div className={`border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-5 flex-1 h-[600px] transition-colors duration-200 ${theme.panelBg}`}>
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-500 p-4.5 rounded-full text-white shadow-2xl shadow-indigo-500/15">
                <Icons.Sparkles />
              </div>
              <div className="max-w-md">
                <h3 className={`text-lg font-black ${theme.headingText}`}>완벽한 가독성과 미친 분석, 숏픽랩</h3>
                <p className={`text-xs mt-2.5 leading-loose ${theme.mutedText}`}>
                  왼쪽 기획 입력창에 레퍼런스 영상 링크와 판매할 상품 정보만 적고 <strong className="text-indigo-600 dark:text-indigo-400">"쇼핑 숏폼 대본 패키지 무료 생성"</strong>을 누르면, 
                  인간 심리를 꿰뚫는 첫 3초 후킹 및 5대 소구점 대본 리포트 세트가 고해상도로 렌더링됩니다.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={handleLoadDemo}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition shadow-xl shadow-indigo-600/10"
                  >
                    🚀 실제 효소 성공 공식 대본 데모 구동하기
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* Interactive Teleprompter Scrolling Modal */}
      {isPrompterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[550px] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header Control Panel */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">숏픽랩 프롬프터 리딩 룸</h3>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Scroll Speed Control */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">스크롤 속도</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={prompterSpeed}
                    onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                    className="w-16 accent-indigo-500 h-1 rounded"
                  />
                  <span className="text-xs font-bold text-indigo-400">{prompterSpeed}x</span>
                </div>

                {/* Font Size Control */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">글자 크기</span>
                  <button
                    onClick={() => setPrompterFontSize(prev => Math.max(16, prev - 4))}
                    className="w-6 h-6 bg-slate-800 rounded hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-300"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setPrompterFontSize(prev => Math.min(52, prev + 4))}
                    className="w-6 h-6 bg-slate-800 rounded hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-300"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Scrolling Prompter Field */}
            <div
              ref={prompterScrollRef}
              className="flex-1 overflow-y-auto px-8 py-44 bg-slate-950/70 select-none scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div
                className="text-center font-bold text-white leading-loose tracking-wide space-y-6"
                style={{ fontSize: `${prompterFontSize}px` }}
              >
                {prompterText}
              </div>
            </div>

            {/* Bottom Actions Playback Bar */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">카메라 렌즈 아래에 스마트폰을 거치하고 낭독하세요.</span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPrompterRunning(!isPrompterRunning)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isPrompterRunning
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {isPrompterRunning ? (
                    <>
                      <Icons.Pause /> 일시정지
                    </>
                  ) : (
                    <>
                      <Icons.Play /> 스크롤 시작
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsPrompterRunning(false);
                    if (prompterScrollRef.current) prompterScrollRef.current.scrollTop = 0;
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Icons.Stop /> 처음으로
                </button>
                <button
                  onClick={() => {
                    setIsPrompterRunning(false);
                    setIsPrompterOpen(false);
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  종료
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Global Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-2xl shadow-indigo-500/20 border border-indigo-400/30 flex items-center gap-2 animate-bounce">
          <Icons.Check /> {toastMessage}
        </div>
      )}

    </div>
  );
}