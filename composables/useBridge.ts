import type { BridgeMessageType, BridgeResponse, DeviceInfo, LocationInfo, CalendarEvent } from '~/types/bridge'
import { bridgeLogger } from './useBridgeLogger'

// 앱에서 주입하는 함수 타입 선언
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
    sendToApp?: (type: string, payload?: unknown, requestId?: string) => void
  }
}

interface UseBridgeReturn {
  isAppReady: Ref<boolean>
  isInApp: Ref<boolean>
  sendMessage: <T = unknown>(type: BridgeMessageType, payload?: unknown) => Promise<BridgeResponse<T>>
  // 앱 인증
  getAppSignature: () => Promise<string | null>
  getSessionToken: () => Promise<string | null>
  // 사용자 인증
  login: (token: string) => Promise<boolean>
  logout: () => Promise<boolean>
  getAuthToken: () => Promise<string | null>
  // 디바이스
  getDeviceInfo: () => Promise<DeviceInfo | null>
  getPushToken: () => Promise<string | null>
  getLocation: () => Promise<LocationInfo | null>
  // 스토리지
  setStorage: (key: string, value: string) => Promise<boolean>
  getStorage: (key: string) => Promise<string | null>
  removeStorage: (key: string) => Promise<boolean>
  // UI
  haptic: (type?: 'light' | 'medium' | 'heavy') => Promise<void>
  share: (text: string, url?: string) => Promise<boolean>
  openExternal: (url: string) => Promise<boolean>
  // 캘린더
  requestCalendarPermission: () => Promise<boolean>
  addCalendarEvent: (event: CalendarEvent) => Promise<string | null>
}

export function useBridge(): UseBridgeReturn {
  const isAppReady = ref(false)
  const isInApp = ref(false)
  const pendingRequests = new Map<string, (response: BridgeResponse) => void>()

  // 앱 환경 감지 (User-Agent 또는 sendToApp 함수 체크)
  const checkIsInApp = (): boolean => {
    if (import.meta.server) return false
    const ua = navigator.userAgent
    return ua.includes('LICA-App') || !!window.sendToApp
  }

  // 고유 요청 ID 생성
  const generateRequestId = (): string => {
    return Date.now().toString()
  }

  // 앱으로 메시지 전송 (sendToApp 함수 사용)
  const sendMessage = <T = unknown>(
    type: BridgeMessageType,
    payload?: unknown
  ): Promise<BridgeResponse<T>> => {
    return new Promise((resolve) => {
      if (!isInApp.value || !window.sendToApp) {
        bridgeLogger.log('bridge', 'error', 'Not in app environment', { isInApp: isInApp.value, sendToApp: !!window.sendToApp })
        resolve({ success: false, error: 'Not in app environment' })
        return
      }

      const requestId = generateRequestId()

      // 타임아웃 설정 (5초)
      const timeout = setTimeout(() => {
        bridgeLogger.log('bridge', 'error', `Request timeout: ${type}`, { requestId })
        pendingRequests.delete(requestId)
        resolve({ success: false, error: 'Request timeout' })
      }, 5000)

      // 응답 핸들러 등록
      pendingRequests.set(requestId, (response) => {
        clearTimeout(timeout)
        pendingRequests.delete(requestId)
        bridgeLogger.log('bridge', 'receive', `Response for ${type}`, response)
        resolve(response as BridgeResponse<T>)
      })

      bridgeLogger.log('bridge', 'send', `Sending: ${type}`, { payload, requestId })

      // 앱으로 메시지 전송 (sendToApp 사용, requestId 전달)
      window.sendToApp(type, payload || {}, requestId)
    })
  }

  // 앱 인증 API
  const getAppSignature = async (): Promise<string | null> => {
    const response = await sendMessage<string>('app.getSignature')
    return response.success ? response.data ?? null : null
  }

  const getSessionToken = async (): Promise<string | null> => {
    const response = await sendMessage<string>('app.getSessionToken')
    return response.success ? response.data ?? null : null
  }

  // 사용자 인증 API
  const login = async (token: string): Promise<boolean> => {
    const response = await sendMessage('auth.login', { token })
    return response.success
  }

  const logout = async (): Promise<boolean> => {
    const response = await sendMessage('auth.logout')
    return response.success
  }

  const getAuthToken = async (): Promise<string | null> => {
    const response = await sendMessage<string>('auth.getToken')
    return response.success ? response.data ?? null : null
  }

  // 디바이스 API
  const getDeviceInfo = async (): Promise<DeviceInfo | null> => {
    const response = await sendMessage<DeviceInfo>('device.getInfo')
    return response.success ? response.data ?? null : null
  }

  const getPushToken = async (): Promise<string | null> => {
    const response = await sendMessage<string>('device.getPushToken')
    return response.success ? response.data ?? null : null
  }

  const getLocation = async (): Promise<LocationInfo | null> => {
    const response = await sendMessage<LocationInfo>('device.getLocation')
    return response.success ? response.data ?? null : null
  }

  // 스토리지 API
  const setStorage = async (key: string, value: string): Promise<boolean> => {
    const response = await sendMessage('storage.set', { key, value })
    return response.success
  }

  const getStorage = async (key: string): Promise<string | null> => {
    const response = await sendMessage<string>('storage.get', { key })
    return response.success ? response.data ?? null : null
  }

  const removeStorage = async (key: string): Promise<boolean> => {
    const response = await sendMessage('storage.remove', { key })
    return response.success
  }

  // UI API
  const haptic = async (type: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
    await sendMessage('ui.haptic', { type })
  }

  const share = async (text: string, url?: string): Promise<boolean> => {
    const response = await sendMessage('ui.share', { text, url })
    return response.success
  }

  const openExternal = async (url: string): Promise<boolean> => {
    const response = await sendMessage('ui.openExternal', { url })
    return response.success
  }

  // 캘린더 API
  const requestCalendarPermission = async (): Promise<boolean> => {
    const response = await sendMessage('calendar.requestPermission')
    return response.success
  }

  const addCalendarEvent = async (event: CalendarEvent): Promise<string | null> => {
    const response = await sendMessage<{ eventId: string }>('calendar.addEvent', event)
    return response.success ? response.data?.eventId ?? null : null
  }

  // 이벤트 리스너 설정
  onMounted(() => {
    isInApp.value = checkIsInApp()
    bridgeLogger.log('bridge', 'info', `Bridge mounted, isInApp: ${isInApp.value}`)

    // 앱 준비 완료 이벤트
    const handleAppReady = () => {
      bridgeLogger.log('bridge', 'info', 'App ready event received')
      isAppReady.value = true
      isInApp.value = true
    }

    // 앱에서 응답 수신
    const handleNativeMessage = (event: CustomEvent<BridgeResponse>) => {
      bridgeLogger.log('bridge', 'receive', 'Native message event', event.detail)
      const { requestId } = event.detail
      if (requestId && pendingRequests.has(requestId)) {
        bridgeLogger.log('bridge', 'info', `Found pending request: ${requestId}`)
        const handler = pendingRequests.get(requestId)
        handler?.(event.detail)
      } else {
        bridgeLogger.log('bridge', 'debug', `No pending request for: ${requestId}`, {
          pending: Array.from(pendingRequests.keys())
        })
      }
    }

    window.addEventListener('nativeAppReady', handleAppReady)
    window.addEventListener('nativeMessage', handleNativeMessage as EventListener)

    // 이미 앱이 준비된 경우
    if ((window as any).isNativeApp) {
      bridgeLogger.log('bridge', 'info', 'App already ready on mount')
      isAppReady.value = true
      isInApp.value = true
    }

    onUnmounted(() => {
      window.removeEventListener('nativeAppReady', handleAppReady)
      window.removeEventListener('nativeMessage', handleNativeMessage as EventListener)
    })
  })

  return {
    isAppReady,
    isInApp,
    sendMessage,
    getAppSignature,
    getSessionToken,
    login,
    logout,
    getAuthToken,
    getDeviceInfo,
    getPushToken,
    getLocation,
    setStorage,
    getStorage,
    removeStorage,
    haptic,
    share,
    openExternal,
    requestCalendarPermission,
    addCalendarEvent,
  }
}
