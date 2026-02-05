import type { BridgeMessageType, BridgeResponse, DeviceInfo, LocationInfo } from '~/types/bridge'

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
        resolve({ success: false, error: 'Not in app environment' })
        return
      }

      const requestId = generateRequestId()

      // 타임아웃 설정 (5초)
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId)
        resolve({ success: false, error: 'Request timeout' })
      }, 5000)

      // 응답 핸들러 등록
      pendingRequests.set(requestId, (response) => {
        clearTimeout(timeout)
        pendingRequests.delete(requestId)
        resolve(response as BridgeResponse<T>)
      })

      console.log('[Bridge] Sending message:', { type, payload, requestId })

      // 앱으로 메시지 전송 (sendToApp 사용, requestId 전달)
      window.sendToApp(type, payload || {}, requestId)
    })
  }

  // 앱 인증 API
  const getAppSignature = async (): Promise<string | null> => {
    const response = await sendMessage<{ signature: string }>('app.getSignature')
    return response.success ? response.data?.signature ?? null : null
  }

  const getSessionToken = async (): Promise<string | null> => {
    const response = await sendMessage<{ token: string }>('app.getSessionToken')
    return response.success ? response.data?.token ?? null : null
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
    const response = await sendMessage<{ token: string }>('auth.getToken')
    return response.success ? response.data?.token ?? null : null
  }

  // 디바이스 API
  const getDeviceInfo = async (): Promise<DeviceInfo | null> => {
    const response = await sendMessage<DeviceInfo>('device.getInfo')
    return response.success ? response.data ?? null : null
  }

  const getPushToken = async (): Promise<string | null> => {
    const response = await sendMessage<{ token: string }>('device.getPushToken')
    return response.success ? response.data?.token ?? null : null
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
    const response = await sendMessage<{ value: string }>('storage.get', { key })
    return response.success ? response.data?.value ?? null : null
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

  // 이벤트 리스너 설정
  onMounted(() => {
    isInApp.value = checkIsInApp()

    // 앱 준비 완료 이벤트
    const handleAppReady = () => {
      console.log('[Bridge] App ready event received')
      isAppReady.value = true
      isInApp.value = true
    }

    // 앱에서 응답 수신
    const handleNativeMessage = (event: CustomEvent<BridgeResponse>) => {
      console.log('[Bridge] Native message received:', event.detail)
      const { requestId } = event.detail
      if (requestId && pendingRequests.has(requestId)) {
        const handler = pendingRequests.get(requestId)
        handler?.(event.detail)
      } else {
        console.log('[Bridge] No pending request for requestId:', requestId)
        console.log('[Bridge] Pending requests:', Array.from(pendingRequests.keys()))
      }
    }

    window.addEventListener('nativeAppReady', handleAppReady)
    window.addEventListener('nativeMessage', handleNativeMessage as EventListener)

    // 이미 앱이 준비된 경우
    if (window.isNativeApp) {
      console.log('[Bridge] App already ready')
      isAppReady.value = true
      isInApp.value = true
    }

    // ReactNativeWebView 존재 여부 로그
    console.log('[Bridge] ReactNativeWebView available:', !!window.ReactNativeWebView)
    console.log('[Bridge] isInApp:', isInApp.value)

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
  }
}
