// 브릿지 로그 전역 상태
export interface BridgeLogEntry {
  id: number
  time: string
  source: 'plugin' | 'bridge' | 'app' | 'web'
  level: 'info' | 'send' | 'receive' | 'error' | 'debug'
  message: string
  data?: unknown
}

// 전역 로그 배열 (reactive)
const logs = ref<BridgeLogEntry[]>([])
let logId = 0

export function useBridgeLogger() {
  const addLog = (
    source: BridgeLogEntry['source'],
    level: BridgeLogEntry['level'],
    message: string,
    data?: unknown
  ) => {
    const entry: BridgeLogEntry = {
      id: ++logId,
      time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
      source,
      level,
      message,
      data
    }
    logs.value.unshift(entry)

    // 최대 100개 유지
    if (logs.value.length > 100) {
      logs.value = logs.value.slice(0, 100)
    }

    // 콘솔에도 출력
    const prefix = `[${source.toUpperCase()}]`
    if (level === 'error') {
      console.error(prefix, message, data ?? '')
    } else {
      console.log(prefix, message, data ?? '')
    }
  }

  const clearLogs = () => {
    logs.value = []
  }

  return {
    logs: readonly(logs),
    addLog,
    clearLogs
  }
}

// 전역 로거 인스턴스 (플러그인에서 사용)
export const bridgeLogger = {
  log: (source: BridgeLogEntry['source'], level: BridgeLogEntry['level'], message: string, data?: unknown) => {
    const entry: BridgeLogEntry = {
      id: ++logId,
      time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
      source,
      level,
      message,
      data
    }
    logs.value.unshift(entry)
    if (logs.value.length > 100) {
      logs.value = logs.value.slice(0, 100)
    }
  }
}
