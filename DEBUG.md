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

### 확인된 사항

1. **웹 → 앱 메시지 전송**: 정상 동작
2. **앱에서 메시지 수신 및 처리**: 정상 동작
3. **앱에서 리턴 메시지 생성**: 정상 동작
4. **웹에서 응답 수신**: 실패 (로그 없음)

### 문제 추정

`sendToWeb`의 `injectJavaScript`가 웹에서 실행되지 않거나, 실행되더라도 이벤트가 전달되지 않음.

---

## 수정된 파일들

### RentLICA-web

#### 1. `composables/useBridge.ts`
- `sendToApp` 함수 사용하도록 변경
- requestId를 웹에서 생성하여 전달
- 디버그 로그 추가

#### 2. `plugins/bridge.client.ts`
- 전역 이벤트 리스너 등록
- `dispatchEvent` 오버라이드하여 모든 이벤트 캡처
- 테스트 함수 `window.testBridgeEvent()` 추가

#### 3. `types/bridge.ts`
- 브릿지 메시지 타입 정의
- Window 인터페이스 확장

#### 4. `pages/bridge-test.vue`
- 브릿지 API 테스트 UI

### LICA-App-base (수정 필요)

#### 1. `src/screens/WebViewScreen.tsx` - injectedJavaScript
```typescript
window.sendToApp = function(type, payload, requestId) {
  const message = JSON.stringify({
    type: type,
    payload: payload || {},
    requestId: requestId || Date.now().toString()  // requestId 외부에서 받을 수 있도록 수정
  });
  window.ReactNativeWebView.postMessage(message);
};
```

#### 2. `src/services/BridgeHandler.ts` - sendToWeb (디버깅용)
```typescript
sendToWeb(response: BridgeResponse): void {
  const responseJson = JSON.stringify(response);
  const script = `
    console.log('[App->Web] Script executing...');
    console.log('[App->Web] Response:', ${JSON.stringify(responseJson)});
    try {
      window.dispatchEvent(new CustomEvent('nativeMessage', {
        detail: ${responseJson}
      }));
      console.log('[App->Web] Event dispatched successfully');
    } catch(e) {
      console.log('[App->Web] Error:', e.message);
    }
    true;
  `;
  this.webViewRef.current?.injectJavaScript(script);
}
```

---

## 다음 디버깅 단계

### 1. 웹 콘솔 확인
- `[App->Web] Script executing...` 로그가 나오는지 확인
- 나오면: 이벤트 dispatch 문제
- 안 나오면: injectJavaScript 실행 자체가 안됨

### 2. injectJavaScript 실행 확인
만약 스크립트가 실행되지 않는다면:
- `webViewRef.current`가 null인지 확인
- WebView의 `javaScriptEnabled={true}` 확인

### 3. 웹 콘솔 접근 방법
- **iOS**: Safari → 개발자 메뉴 → [기기명] → localhost
- **Android**: Chrome → `chrome://inspect` → WebView 선택

### 4. 테스트 방법
웹 콘솔에서 직접 이벤트 발생 테스트:
```javascript
window.testBridgeEvent('12345')
```
이게 동작하면 이벤트 리스너는 정상, injectJavaScript 문제.

---

## 브릿지 API 사용법 (구현 완료)

### 웹에서 사용
```typescript
const bridge = useBridge()

// 앱 환경 확인
if (bridge.isInApp.value) {
  // 디바이스 정보 조회
  const deviceInfo = await bridge.getDeviceInfo()

  // 앱 서명 조회
  const signature = await bridge.getAppSignature()

  // 스토리지 사용
  await bridge.setStorage('key', 'value')
  const value = await bridge.getStorage('key')
}
```

### 지원 API
- 앱 인증: `getAppSignature`, `getSessionToken`
- 사용자 인증: `login`, `logout`, `getAuthToken`
- 디바이스: `getDeviceInfo`, `getPushToken`, `getLocation`
- 스토리지: `setStorage`, `getStorage`, `removeStorage`
- UI: `haptic`, `share`, `openExternal`

---

## 개발 서버 실행

```bash
cd /Users/byeongcheonmun/Documents/IdeaProjects/RentLICA-web
npm run dev
# http://localhost:3000
# 테스트 페이지: http://localhost:3000/bridge-test
```
