// 브릿지 API 타입 정의

export type BridgeMessageType =
  // 앱 인증
  | 'app.getSignature'
  | 'app.getSessionToken'
  | 'app.refreshToken'
  | 'app.validateOrigin'
  // 사용자 인증
  | 'auth.login'
  | 'auth.logout'
  | 'auth.getToken'
  | 'auth.biometric'
  // 스토리지
  | 'storage.set'
  | 'storage.get'
  | 'storage.remove'
  // 디바이스
  | 'device.getInfo'
  | 'device.getPushToken'
  | 'device.getLocation'
  // 미디어
  | 'media.camera'
  | 'media.gallery'
  | 'media.download'
  | 'media.upload'
  // UI
  | 'ui.haptic'
  | 'ui.share'
  | 'ui.openExternal'
  // 네비게이션
  | 'nav.back'
  | 'nav.exit'

export interface BridgeResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  requestId?: string
}

export interface DeviceInfo {
  os: 'ios' | 'android'
  osVersion: string
  model: string
  appVersion: string
  uniqueId?: string
}

export interface LocationInfo {
  latitude: number
  longitude: number
  accuracy: number
}

// Window 타입 확장
declare global {
  interface Window {
    sendToApp?: (type: BridgeMessageType, payload?: unknown) => void
    isNativeApp?: boolean
  }

  interface WindowEventMap {
    nativeAppReady: CustomEvent
    nativeMessage: CustomEvent<BridgeResponse>
  }
}

export {}
