// 전역 브릿지 이벤트 리스너 (클라이언트 전용)
export default defineNuxtPlugin(() => {
  console.log('[Bridge Plugin] Starting initialization...')

  // 모든 이벤트 캡처 (디버깅용)
  const originalDispatchEvent = window.dispatchEvent.bind(window)
  window.dispatchEvent = function(event: Event) {
    if (event.type === 'nativeMessage' || event.type === 'nativeAppReady') {
      console.log('[Bridge Plugin] Event dispatched:', event.type)
      if (event instanceof CustomEvent) {
        console.log('[Bridge Plugin] CustomEvent detail:', event.detail)
      }
    }
    return originalDispatchEvent(event)
  }

  // nativeMessage 이벤트 리스너 (전역, capture phase)
  window.addEventListener('nativeMessage', (event) => {
    console.log('[Bridge Plugin] nativeMessage event object:', event)
    const customEvent = event as CustomEvent
    console.log('[Bridge Plugin] nativeMessage detail:', customEvent.detail)
    console.log('[Bridge Plugin] detail type:', typeof customEvent.detail)
  }, { capture: true })

  // nativeAppReady 이벤트 리스너 (전역)
  window.addEventListener('nativeAppReady', () => {
    console.log('[Bridge Plugin] nativeAppReady received')
  }, { capture: true })

  // 앱에서 주입하는 스크립트 확인을 위한 테스트 함수
  ;(window as any).testBridgeEvent = (requestId?: string) => {
    console.log('[Bridge Plugin] Testing bridge event with requestId:', requestId)
    window.dispatchEvent(new CustomEvent('nativeMessage', {
      detail: {
        success: true,
        data: { test: 'hello' },
        requestId: requestId || '12345'
      }
    }))
  }

  // 앱에서 injectJavaScript가 실행되는지 확인용
  ;(window as any).bridgeReady = true

  console.log('[Bridge Plugin] Initialized')
  console.log('[Bridge Plugin] sendToApp:', typeof (window as any).sendToApp)
  console.log('[Bridge Plugin] ReactNativeWebView:', !!(window as any).ReactNativeWebView)
  console.log('[Bridge Plugin] isNativeApp:', !!(window as any).isNativeApp)
})
