import { bridgeLogger } from '~/composables/useBridgeLogger'

// 전역 브릿지 이벤트 리스너 (클라이언트 전용)
export default defineNuxtPlugin(() => {
  bridgeLogger.log('plugin', 'info', 'Bridge plugin initializing...')

  // 모든 이벤트 캡처 (디버깅용)
  const originalDispatchEvent = window.dispatchEvent.bind(window)
  window.dispatchEvent = function(event: Event) {
    if (event.type === 'nativeMessage' || event.type === 'nativeAppReady') {
      bridgeLogger.log('plugin', 'debug', `Event dispatched: ${event.type}`)
      if (event instanceof CustomEvent) {
        bridgeLogger.log('plugin', 'receive', `CustomEvent detail`, event.detail)
      }
    }
    return originalDispatchEvent(event)
  }

  // nativeMessage 이벤트 리스너 (전역, capture phase)
  window.addEventListener('nativeMessage', (event) => {
    const customEvent = event as CustomEvent
    bridgeLogger.log('app', 'receive', 'nativeMessage received', customEvent.detail)
  }, { capture: true })

  // nativeAppReady 이벤트 리스너 (전역)
  window.addEventListener('nativeAppReady', () => {
    bridgeLogger.log('app', 'info', 'nativeAppReady event received')
  }, { capture: true })

  // 테스트용 함수
  ;(window as any).testBridgeEvent = (requestId?: string) => {
    const testData = {
      success: true,
      data: { test: 'hello', timestamp: Date.now() },
      requestId: requestId || Date.now().toString()
    }
    bridgeLogger.log('web', 'debug', 'Testing bridge event', testData)
    window.dispatchEvent(new CustomEvent('nativeMessage', { detail: testData }))
  }

  // 앱에서 injectJavaScript가 실행되는지 확인용
  ;(window as any).bridgeReady = true

  // 초기 상태 로깅
  bridgeLogger.log('plugin', 'info', 'Bridge plugin initialized')
  bridgeLogger.log('plugin', 'info', `sendToApp: ${typeof (window as any).sendToApp}`)
  bridgeLogger.log('plugin', 'info', `ReactNativeWebView: ${!!(window as any).ReactNativeWebView}`)
  bridgeLogger.log('plugin', 'info', `isNativeApp: ${!!(window as any).isNativeApp}`)
})
