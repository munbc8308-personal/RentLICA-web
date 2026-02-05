# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RentLICA-web은 대한민국 임대사업자(주택/상가)를 위한 법규, 세무 정보 및 일정 알림 서비스입니다.

## Tech Stack

- **Frontend**: Nuxt.js 3, Vue.js, TypeScript, PrimeVue
- **Backend**: Nuxt Server Routes (Nitro)
- **Deployment**: Vercel

## Development Commands

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run preview  # 프로덕션 미리보기
```

## Project Structure

- `pages/` - 페이지 라우팅 (auth, laws, tax, calendar)
- `components/` - 재사용 컴포넌트
- `composables/` - Composition API 함수
- `server/api/` - 백엔드 API 엔드포인트
- `stores/` - Pinia 상태 관리
- `types/` - TypeScript 타입 정의
