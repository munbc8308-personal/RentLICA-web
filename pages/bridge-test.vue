<script setup lang="ts">
import { useBridgeLogger } from '~/composables/useBridgeLogger'

useHead({
  title: 'Bridge API Test - RentLICA'
})

const bridge = useBridge()
const { logs, clearLogs } = useBridgeLogger()

// UI 상태
const deviceInfo = ref<Record<string, unknown> | null>(null)
const sessionToken = ref<string | null>(null)
const appSignature = ref<string | null>(null)
const isLogExpanded = ref(true)

// 테스트 함수들
const testGetDeviceInfo = async () => {
  const info = await bridge.getDeviceInfo()
  if (info) {
    deviceInfo.value = info
  }
}

const testGetAppSignature = async () => {
  const signature = await bridge.getAppSignature()
  if (signature) {
    appSignature.value = signature
  }
}

const testGetSessionToken = async () => {
  const token = await bridge.getSessionToken()
  if (token) {
    sessionToken.value = token
  }
}

const testGetPushToken = async () => {
  await bridge.getPushToken()
}

const testGetLocation = async () => {
  await bridge.getLocation()
}

const testHaptic = async () => {
  await bridge.haptic('medium')
}

const testStorage = async () => {
  const testKey = 'rentlica_test'
  const testValue = `test_${Date.now()}`

  await bridge.setStorage(testKey, testValue)
  await bridge.getStorage(testKey)
  await bridge.removeStorage(testKey)
}

const testShare = async () => {
  await bridge.share('RentLICA Test', 'https://rentlica.com')
}

// 테스트 이벤트 발생 (웹에서 직접)
const testLocalEvent = () => {
  const testRequestId = Date.now().toString()
  ;(window as any).testBridgeEvent?.(testRequestId)
}

const getLogLevelClass = (level: string) => {
  return {
    'log-send': level === 'send',
    'log-receive': level === 'receive',
    'log-info': level === 'info',
    'log-error': level === 'error',
    'log-debug': level === 'debug'
  }
}

const getSourceBadge = (source: string) => {
  const badges: Record<string, string> = {
    plugin: 'P',
    bridge: 'B',
    app: 'A',
    web: 'W'
  }
  return badges[source] || '?'
}
</script>

<template>
  <div class="page-container">
    <!-- Main Content -->
    <div class="main-content">
      <header class="header">
        <h1>Bridge API Test</h1>
        <div class="status">
          <Tag :severity="bridge.isInApp.value ? 'success' : 'warn'">
            {{ bridge.isInApp.value ? 'In App' : 'Browser' }}
          </Tag>
          <Tag :severity="bridge.isAppReady.value ? 'success' : 'secondary'">
            {{ bridge.isAppReady.value ? 'Ready' : 'Waiting' }}
          </Tag>
        </div>
      </header>

      <div class="content">
        <!-- App Auth -->
        <Card class="test-section">
          <template #title>App Auth</template>
          <template #content>
            <div class="button-group">
              <Button label="App Signature" icon="pi pi-shield" size="small" @click="testGetAppSignature" />
              <Button label="Session Token" icon="pi pi-key" size="small" @click="testGetSessionToken" />
            </div>
            <div v-if="appSignature" class="result">
              <small>Signature: {{ appSignature }}</small>
            </div>
            <div v-if="sessionToken" class="result">
              <small>Token: {{ sessionToken?.substring(0, 30) }}...</small>
            </div>
          </template>
        </Card>

        <!-- Device -->
        <Card class="test-section">
          <template #title>Device</template>
          <template #content>
            <div class="button-group">
              <Button label="Device Info" icon="pi pi-mobile" size="small" @click="testGetDeviceInfo" />
              <Button label="Push Token" icon="pi pi-bell" size="small" @click="testGetPushToken" />
              <Button label="Location" icon="pi pi-map-marker" size="small" @click="testGetLocation" />
            </div>
            <div v-if="deviceInfo" class="result">
              <pre>{{ JSON.stringify(deviceInfo, null, 2) }}</pre>
            </div>
          </template>
        </Card>

        <!-- UI / Storage -->
        <Card class="test-section">
          <template #title>UI / Storage</template>
          <template #content>
            <div class="button-group">
              <Button label="Haptic" icon="pi pi-bolt" size="small" @click="testHaptic" />
              <Button label="Storage" icon="pi pi-database" size="small" @click="testStorage" />
              <Button label="Share" icon="pi pi-share-alt" size="small" @click="testShare" />
            </div>
          </template>
        </Card>

        <!-- Debug -->
        <Card class="test-section">
          <template #title>Debug</template>
          <template #content>
            <div class="button-group">
              <Button
                label="Test Local Event"
                icon="pi pi-play"
                size="small"
                severity="secondary"
                @click="testLocalEvent"
              />
            </div>
            <p class="hint">
              This fires a test nativeMessage event locally to verify the event listener works.
            </p>
          </template>
        </Card>

        <div class="footer-link">
          <NuxtLink to="/">
            <Button label="Home" icon="pi pi-home" severity="secondary" size="small" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Log Panel -->
    <div class="log-panel" :class="{ 'collapsed': !isLogExpanded }">
      <div class="log-header" @click="isLogExpanded = !isLogExpanded">
        <div class="log-title">
          <i :class="isLogExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"></i>
          <span>Bridge Logs ({{ logs.length }})</span>
        </div>
        <Button
          v-if="isLogExpanded"
          icon="pi pi-trash"
          size="small"
          severity="secondary"
          text
          @click.stop="clearLogs"
        />
      </div>

      <div v-if="isLogExpanded" class="log-content">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-item"
          :class="getLogLevelClass(log.level)"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-source" :title="log.source">{{ getSourceBadge(log.source) }}</span>
          <span class="log-level">[{{ log.level.toUpperCase() }}]</span>
          <span class="log-message">{{ log.message }}</span>
          <span v-if="log.data" class="log-data">{{ JSON.stringify(log.data) }}</span>
        </div>
        <div v-if="logs.length === 0" class="log-empty">
          No logs yet. Click buttons above to test bridge APIs.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 1rem;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
}

.header h1 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.status {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-section :deep(.p-card-body) {
  padding: 0.75rem;
}

.test-section :deep(.p-card-title) {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.test-section :deep(.p-card-content) {
  padding: 0;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.result {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--p-surface-100);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  word-break: break-all;
  overflow-x: auto;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
}

.hint {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.footer-link {
  margin-top: 0.5rem;
  text-align: center;
}

/* Log Panel - Fixed at bottom */
.log-panel {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--p-surface-0);
  border-top: 2px solid var(--p-primary-color);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  max-height: 40vh;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.log-panel.collapsed {
  max-height: auto;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--p-primary-color);
  color: white;
  cursor: pointer;
  user-select: none;
}

.log-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 0.7rem;
  line-height: 1.4;
  background: #1e1e1e;
  color: #d4d4d4;
}

.log-item {
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
  margin-bottom: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: baseline;
}

.log-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.log-time {
  color: #808080;
  flex-shrink: 0;
}

.log-source {
  width: 1.2em;
  height: 1.2em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-size: 0.65rem;
  font-weight: bold;
  flex-shrink: 0;
  background: #444;
  color: #fff;
}

.log-level {
  font-weight: 600;
  flex-shrink: 0;
  min-width: 60px;
}

.log-message {
  flex-shrink: 0;
}

.log-data {
  color: #9cdcfe;
  word-break: break-all;
  flex: 1;
  min-width: 0;
}

/* Log level colors */
.log-send .log-level { color: #569cd6; }
.log-receive .log-level { color: #4ec9b0; }
.log-info .log-level { color: #dcdcaa; }
.log-error .log-level { color: #f14c4c; }
.log-debug .log-level { color: #808080; }

.log-empty {
  color: #808080;
  text-align: center;
  padding: 2rem;
}

/* Source badge colors */
.log-item[class*="plugin"] .log-source { background: #6a5acd; }
.log-item[class*="bridge"] .log-source { background: #2e8b57; }
.log-item[class*="app"] .log-source { background: #cd853f; }
.log-item[class*="web"] .log-source { background: #4169e1; }
</style>
