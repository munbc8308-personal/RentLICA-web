# RentLICA-web

대한민국 임대사업자를 위한 법규 및 세무 정보 웹 애플리케이션

## 프로젝트 개요

RentLICA는 주택 및 상가 임대사업자가 사업을 운영하면서 알아야 할 법규, 세무, 신고 일정 등의 정보를 제공하는 웹 기반 서비스입니다.

### 타겟 사용자

- 주택임대사업자 (아파트, 빌라, 오피스텔 등)
- 상가임대사업자 (상가, 사무실 등)

## 주요 기능

### 1. 법규 정보 (`/laws`)

- **주택임대차보호법**: 대항력, 우선변제권, 계약갱신청구권 등
- **상가건물 임대차보호법**: 권리금 보호, 10년 계약갱신요구권, 차임증액 제한
- **민간임대주택에 관한 특별법**: 임대사업자 등록 요건, 의무임대기간
- **법령 검색**: 국가법령정보센터 API 연동
- **조문 상세 보기**: 법령별 조문 펼치기/접기

### 2. 세무 계산기 (`/tax`)

#### 임대소득세 계산기 (`/tax/income`)
- 주택/상가 임대 구분
- 분리과세(14%) vs 종합과세 자동 비교
- 등록 임대사업자 단순경비율 적용 (42.3% → 60.1%)
- 2024년 종합소득세율표 기준

#### 종합부동산세 계산기 (`/tax/property`)
- 1세대1주택 / 다주택 구분
- 공정시장가액비율 조정 (60%)
- 고령자 공제 (60세↑ 10~30%)
- 장기보유 공제 (5년↑ 20~50%)
- 농어촌특별세 포함

#### 부가가치세 계산기 (`/tax/vat`)
- 일반과세자 / 간이과세자 구분
- 간주임대료(보증금 이자) 자동 계산
- 매입세액 공제
- 1기/2기 신고기간 구분

### 3. 일정 알림 (`/calendar`)

- 세금 신고 기한 (종합소득세, 부가세, 종부세 등)
- 임대사업자 의무 이행 일정
- 월별/구분별 필터링

### 4. 네이티브 앱 연동 (Bridge API)

LICA-App-base와의 WebView 통신을 위한 브릿지 API:
- 디바이스 정보 조회
- 스토리지 (AsyncStorage) 연동
- 푸시 토큰, 위치 정보
- 햅틱 피드백, 공유하기

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Nuxt.js 3 (Vue.js) |
| Language | TypeScript |
| UI Library | PrimeVue (Aura 테마) |
| Deployment | Vercel |
| API | 국가법령정보센터 Open API |

## 프로젝트 구조

```
RentLICA-web/
├── pages/
│   ├── index.vue          # 홈화면
│   ├── laws/
│   │   ├── index.vue      # 법규 목록
│   │   └── [id].vue       # 법령 상세
│   ├── tax/
│   │   ├── index.vue      # 세무 정보 메인
│   │   ├── income.vue     # 임대소득세 계산기
│   │   ├── property.vue   # 종합부동산세 계산기
│   │   └── vat.vue        # 부가가치세 계산기
│   ├── calendar/
│   │   └── index.vue      # 일정 알림
│   └── bridge-test.vue    # 브릿지 API 테스트 (개발용)
├── components/
│   └── HelpToggle.vue     # 도움말 토글 컴포넌트
├── composables/
│   ├── useBridge.ts       # 브릿지 API 훅
│   └── useBridgeLogger.ts # 브릿지 로그 관리
├── server/api/
│   └── laws/
│       ├── search.get.ts  # 법령 검색 API
│       └── [id].get.ts    # 법령 상세 API
├── plugins/
│   └── bridge.client.ts   # 브릿지 이벤트 리스너
├── types/
│   └── bridge.ts          # 브릿지 타입 정의
└── public/
    ├── logo.svg           # 로고 (SVG)
    ├── logo.png           # 로고 (PNG)
    └── app-icon.svg       # 앱 아이콘
```

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 환경변수 설정 (선택)
cp .env.example .env

# 개발 서버 실행
npm run dev
# http://localhost:3000

# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

## 외부 API 연동

### 국가법령정보센터 Open API

법규 정보를 실시간으로 가져오기 위해 사용합니다.

1. [국가법령정보 공동활용](https://open.law.go.kr/)에서 회원가입
2. API 키 발급
3. `.env` 파일에 설정:

```env
LAW_API_KEY=your_api_key_here
```

**참고:** API 키가 없어도 목업 데이터로 테스트 가능합니다.

## 설계 원칙

### Stateless / DB-less 아키텍처
- **데이터베이스 미사용**: 모든 데이터는 외부 API 또는 정적 데이터로 제공
- **서버 상태 없음**: 서버는 단순 API 프록시 역할만 수행
- **캐싱**: 필요시 클라이언트 사이드 캐싱 활용

### 인증
- **현재**: 인증 없이 서비스 제공
- **향후**: SSO(Single Sign-On) 연동 예정

## 데이터 출처

| 데이터 | 출처 |
|--------|------|
| 법령 정보 | [국가법령정보센터](https://www.law.go.kr) |
| 세율표 | [국세청](https://www.nts.go.kr) |
| 단순경비율 | [국세청 고시](https://www.nts.go.kr) |
| 공시가격 | [부동산공시가격알리미](https://www.realtyprice.kr) |

## 배포

- **Production**: https://rent-lica-web.vercel.app
- **Platform**: Vercel (자동 배포)

## 라이선스

MIT License
