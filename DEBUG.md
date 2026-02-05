# DEBUG.md

RentLICA-web ↔ LICA-App-base 브릿지 통신 디버깅 기록

## 현재 상황 (2026-02-05)

### 통신 흐름

```
[웹] sendToApp(type, payload, requestId)
    ↓ ✅ 성공
[앱] onMessage → handleMessage → 처리
    ↓ ✅ 성공
[앱] sendToWeb(response) → injectJavaScript
    ↓ ❓ 문제 지점
[웹] nativeMessage 이벤트 수신
    ↓ ❌ 실패
[웹] 응답 처리
```

---

## LICA-App-base 점검 사항

### 1. webViewRef가 null인지 확인

`WebViewScreen.tsx`의 `handleMessage`에서 `sendToWeb` 호출 전에 ref 확인:

```typescript
const handleMessage = useCallback(
  async (event: WebViewMessageEvent) => {
    try {
      const message: BridgeMessage = JSON.parse(event.nativeEvent.data);
      console.log('[WebView] Received message:', message);

      const response = await bridgeHandler.handleMessage(message);
      console.log('[WebView] Sending response:', response);

      // ⚠️ webViewRef 확인
      console.log('[WebView] webViewRef.current:', webViewRef.current);

      bridgeHandler.sendToWeb(response);
    } catch (error) {
      console.error('Bridge message error:', error);
    }
  },
  [bridgeHandler],
);
```

### 2. sendToWeb 디버깅 강화

`BridgeHandler.ts`의 `sendToWeb` 수정:

```typescript
sendToWeb(response: BridgeResponse): void {
  console.log('[BridgeHandler] sendToWeb called');
  console.log('[BridgeHandler] webViewRef.current:', this.webViewRef.current);

  if (!this.webViewRef.current) {
    console.error('[BridgeHandler] webViewRef.current is null!');
    return;
  }

  const responseJson = JSON.stringify(response);
  const script = `
    (function() {
      console.log('[App->Web] Script executing');
      console.log('[App->Web] Response: ${responseJson.replace(/'/g, "\\'")}');
      try {
        var event = new CustomEvent('nativeMessage', {
          detail: ${responseJson}
        });
        window.dispatchEvent(event);
        console.log('[App->Web] Event dispatched');
      } catch(e) {
        console.error('[App->Web] Error:', e.message);
      }
    })();
    true;
  `;

  console.log('[BridgeHandler] Injecting script...');
  this.webViewRef.current.injectJavaScript(script);
  console.log('[BridgeHandler] Script injected');
}
```

### 3. ScrollView + WebView 조합 문제

현재 `WebViewScreen.tsx`에서 WebView가 ScrollView 안에 있음:

```tsx
<ScrollView>
  <WebView ref={webViewRef} ... />
</ScrollView>
```

**가능한 문제:**
- ScrollView 안의 WebView에서 `injectJavaScript`가 제대로 동작하지 않을 수 있음
- ref 전달이 안 될 수 있음

**해결책 테스트:**
ScrollView를 일시적으로 제거하고 테스트:

```tsx
// 테스트용: ScrollView 없이
<SafeAreaView style={styles.container} edges={['top']}>
  <WebView
    ref={webViewRef}
    ...
  />
</SafeAreaView>
```

### 4. injectJavaScript 반환값 확인

React Native WebView에서 `injectJavaScript`는 Promise를 반환할 수 있음:

```typescript
sendToWeb(response: BridgeResponse): void {
  // ...
  const result = this.webViewRef.current?.injectJavaScript(script);
  console.log('[BridgeHandler] injectJavaScript result:', result);
}
```

### 5. WebView 설정 확인

`WebViewScreen.tsx`에서 필수 설정:

```tsx
<WebView
  javaScriptEnabled={true}        // ✅ 필수
  domStorageEnabled={true}        // ✅ 권장
  // ...
/>
```

### 6. iOS Safari 디버깅

1. iPhone에서 설정 → Safari → 고급 → 웹 검사기 활성화
2. Mac Safari → 개발자 메뉴 활성화
3. Safari → 개발자 → [기기명] → localhost 선택
4. 콘솔에서 `[App->Web]` 로그 확인

### 7. Android Chrome 디버깅

1. Chrome 브라우저에서 `chrome://inspect` 접속
2. WebView 인스턴스 선택
3. 콘솔에서 `[App->Web]` 로그 확인

---

## RentLICA-web 변경사항 (2026-02-05 업데이트)

### 실시간 로그 시스템 추가

1. **`composables/useBridgeLogger.ts`** - 전역 로그 관리
2. **`plugins/bridge.client.ts`** - 로거 연동
3. **`composables/useBridge.ts`** - 로거 연동
4. **`pages/bridge-test.vue`** - 하단 고정 로그창

### 테스트 페이지 기능

- 화면 하단에 실시간 브릿지 로그 표시
- 로그 접기/펼치기 가능
- "Test Local Event" 버튼으로 이벤트 리스너 동작 확인
- 모든 API 호출의 send/receive 로그 표시

---

## 테스트 순서

### 1단계: 웹 이벤트 리스너 확인

bridge-test 페이지에서 "Test Local Event" 버튼 클릭:
- 로그에 `[RECEIVE] nativeMessage received` 표시되면 리스너 정상

### 2단계: 앱에서 웹으로 스크립트 실행 확인

앱 콘솔에서:
```
[BridgeHandler] sendToWeb called
[BridgeHandler] webViewRef.current: [object]  ← null이면 문제
[BridgeHandler] Script injected
```

### 3단계: 웹 콘솔 확인 (Safari/Chrome 개발자 도구)

```
[App->Web] Script executing     ← 이게 안 나오면 injectJavaScript 실패
[App->Web] Response: {...}
[App->Web] Event dispatched
```

### 4단계: 웹 로그창 확인

bridge-test 페이지 하단 로그창에서:
```
[A] [RECEIVE] nativeMessage received {...}
[B] [RECEIVE] Response for device.getInfo {...}
```

---

## 개발 서버 실행

```bash
cd /Users/byeongcheonmun/Documents/IdeaProjects/RentLICA-web
npm run dev
# http://localhost:3000/bridge-test
```

---

## 예상 원인 순위

1. **ScrollView + WebView 조합** - ref 또는 injectJavaScript 동작 이상
2. **webViewRef.current가 null** - BridgeHandler 생성 시점 문제
3. **injectJavaScript 실행 안됨** - WebView 상태 문제
4. **CustomEvent가 웹에서 수신 안됨** - 이벤트 타이밍 문제
