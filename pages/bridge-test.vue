<script setup lang="ts">
useHead({
  title: 'Bridge API 테스트 - RentLICA'
})

const bridge = useBridge()

// 상태
const logs = ref<Array<{ time: string; type: 'send' | 'receive' | 'info' | 'error'; message: string }>>([])
const deviceInfo = ref<Record<string, unknown> | null>(null)
const sessionToken = ref<string | null>(null)
const appSignature = ref<string | null>(null)

// 로그 추가
const addLog = (type: 'send' | 'receive' | 'info' | 'error', message: string) => {
  const time = new Date().toLocaleTimeString('ko-KR')
  logs.value.unshift({ time, type, message })
  if (logs.value.length > 50) logs.value.pop()
}

// 테스트 함수들
const testGetDeviceInfo = async () => {
  addLog('send', 'device.getInfo 요청')
  const info = await bridge.getDeviceInfo()
  if (info) {
    deviceInfo.value = info
    addLog('receive', `디바이스 정보: ${JSON.stringify(info)}`)
  } else {
    addLog('error', '디바이스 정보 조회 실패')
  }
}

const testGetAppSignature = async () => {
  addLog('send', 'app.getSignature 요청')
  const signature = await bridge.getAppSignature()
  if (signature) {
    appSignature.value = signature
    addLog('receive', `앱 서명: ${signature}`)
  } else {
    addLog('error', '앱 서명 조회 실패')
  }
}

const testGetSessionToken = async () => {
  addLog('send', 'app.getSessionToken 요청')
  const token = await bridge.getSessionToken()
  if (token) {
    sessionToken.value = token
    addLog('receive', `세션 토큰: ${token.substring(0, 20)}...`)
  } else {
    addLog('error', '세션 토큰 조회 실패')
  }
}

const testGetPushToken = async () => {
  addLog('send', 'device.getPushToken 요청')
  const token = await bridge.getPushToken()
  if (token) {
    addLog('receive', `푸시 토큰: ${token.substring(0, 30)}...`)
  } else {
    addLog('error', '푸시 토큰 조회 실패 (Firebase 미설정일 수 있음)')
  }
}

const testGetLocation = async () => {
  addLog('send', 'device.getLocation 요청')
  const location = await bridge.getLocation()
  if (location) {
    addLog('receive', `위치: 위도 ${location.latitude}, 경도 ${location.longitude}`)
  } else {
    addLog('error', '위치 조회 실패')
  }
}

const testHaptic = async () => {
  addLog('send', 'ui.haptic 요청 (medium)')
  await bridge.haptic('medium')
  addLog('info', '햅틱 피드백 전송됨')
}

const testStorage = async () => {
  const testKey = 'rentlica_test'
  const testValue = `test_${Date.now()}`

  addLog('send', `storage.set 요청: ${testKey} = ${testValue}`)
  const setResult = await bridge.setStorage(testKey, testValue)

  if (setResult) {
    addLog('receive', '저장 성공')

    addLog('send', `storage.get 요청: ${testKey}`)
    const getValue = await bridge.getStorage(testKey)
    addLog('receive', `조회 결과: ${getValue}`)

    addLog('send', `storage.remove 요청: ${testKey}`)
    const removeResult = await bridge.removeStorage(testKey)
    addLog('receive', removeResult ? '삭제 성공' : '삭제 실패')
  } else {
    addLog('error', '저장 실패')
  }
}

const testShare = async () => {
  addLog('send', 'ui.share 요청')
  const result = await bridge.share('RentLICA 테스트', 'https://rentlica.com')
  addLog(result ? 'receive' : 'error', result ? '공유 완료' : '공유 실패')
}

const clearLogs = () => {
  logs.value = []
}

// 초기화 로그
onMounted(() => {
  addLog('info', `앱 환경: ${bridge.isInApp.value ? 'Yes' : 'No (브라우저)'}`)
  addLog('info', `User-Agent: ${navigator.userAgent}`)

  // 앱 준비 완료 감지
  watch(() => bridge.isAppReady.value, (ready) => {
    if (ready) {
      addLog('info', '앱 준비 완료 (nativeAppReady)')
    }
  })
})

const getLogClass = (type: string) => {
  return {
    'log-send': type === 'send',
    'log-receive': type === 'receive',
    'log-info': type === 'info',
    'log-error': type === 'error'
  }
}
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>Bridge API 테스트</h1>
      <div class="status">
        <Tag :severity="bridge.isInApp.value ? 'success' : 'warn'">
          {{ bridge.isInApp.value ? '앱 환경' : '브라우저 환경' }}
        </Tag>
        <Tag :severity="bridge.isAppReady.value ? 'success' : 'secondary'">
          {{ bridge.isAppReady.value ? '앱 준비됨' : '대기중' }}
        </Tag>
      </div>
    </header>

    <div class="content">
      <!-- 테스트 버튼 그룹 -->
      <Card class="test-section">
        <template #title>앱 인증</template>
        <template #content>
          <div class="button-group">
            <Button label="앱 서명 조회" icon="pi pi-shield" @click="testGetAppSignature" />
            <Button label="세션 토큰 조회" icon="pi pi-key" @click="testGetSessionToken" />
          </div>
          <div v-if="appSignature" class="result">
            <small>앱 서명: {{ appSignature }}</small>
          </div>
          <div v-if="sessionToken" class="result">
            <small>세션 토큰: {{ sessionToken.substring(0, 30) }}...</small>
          </div>
        </template>
      </Card>

      <Card class="test-section">
        <template #title>디바이스</template>
        <template #content>
          <div class="button-group">
            <Button label="디바이스 정보" icon="pi pi-mobile" @click="testGetDeviceInfo" />
            <Button label="푸시 토큰" icon="pi pi-bell" @click="testGetPushToken" />
            <Button label="위치 정보" icon="pi pi-map-marker" @click="testGetLocation" />
          </div>
          <div v-if="deviceInfo" class="result">
            <small>{{ JSON.stringify(deviceInfo, null, 2) }}</small>
          </div>
        </template>
      </Card>

      <Card class="test-section">
        <template #title>기타</template>
        <template #content>
          <div class="button-group">
            <Button label="햅틱" icon="pi pi-bolt" @click="testHaptic" />
            <Button label="스토리지 테스트" icon="pi pi-database" @click="testStorage" />
            <Button label="공유하기" icon="pi pi-share-alt" @click="testShare" />
          </div>
        </template>
      </Card>

      <!-- 로그 출력 -->
      <Card class="log-section">
        <template #title>
          <div class="log-header">
            <span>로그</span>
            <Button label="초기화" icon="pi pi-trash" size="small" severity="secondary" @click="clearLogs" />
          </div>
        </template>
        <template #content>
          <div class="log-container">
            <div
              v-for="(log, index) in logs"
              :key="index"
              class="log-item"
              :class="getLogClass(log.type)"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="logs.length === 0" class="log-empty">
              로그가 없습니다. 위 버튼을 눌러 테스트해보세요.
            </div>
          </div>
        </template>
      </Card>
    </div>

    <footer class="footer">
      <NuxtLink to="/">
        <Button label="홈으로" icon="pi pi-home" severity="secondary" />
      </NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.status {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.test-section :deep(.p-card-content) {
  padding-top: 0;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.result {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: var(--p-surface-100);
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.log-section {
  flex: 1;
  min-height: 200px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.85rem;
}

.log-item {
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--p-surface-200);
}

.log-time {
  color: var(--p-text-muted-color);
  margin-right: 0.5rem;
}

.log-type {
  font-weight: bold;
  margin-right: 0.5rem;
}

.log-send .log-type { color: var(--p-blue-500); }
.log-receive .log-type { color: var(--p-green-500); }
.log-info .log-type { color: var(--p-text-muted-color); }
.log-error .log-type { color: var(--p-red-500); }

.log-empty {
  color: var(--p-text-muted-color);
  text-align: center;
  padding: 2rem;
}

.footer {
  margin-top: 1.5rem;
  text-align: center;
}
</style>
