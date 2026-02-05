<script setup lang="ts">
useHead({
  title: 'RentLICA - 임대사업자를 위한 법규 및 세무 정보'
})
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>RentLICA</h1>
      <p class="subtitle">대한민국 임대사업자를 위한 법규 및 세무 정보</p>
    </header>

    <main class="main">
      <div class="features">
        <Card class="feature-card">
          <template #title>
            <i class="pi pi-book" /> 법규 정보
          </template>
          <template #content>
            <p>주택임대차보호법, 상가건물 임대차보호법 등 임대사업에 필요한 법규 정보를 제공합니다.</p>
          </template>
        </Card>

        <Card class="feature-card">
          <template #title>
            <i class="pi pi-calculator" /> 세무 계산
          </template>
          <template #content>
            <p>임대소득세, 종합부동산세, 부가가치세 등 세금 계산 및 절세 정보를 안내합니다.</p>
          </template>
        </Card>

        <Card class="feature-card">
          <template #title>
            <i class="pi pi-calendar" /> 일정 알림
          </template>
          <template #content>
            <p>세금 신고 기한, 임대사업자 의무 이행 일정 등을 알려드립니다.</p>
          </template>
        </Card>
      </div>

      <!-- 개발자 도구 -->
      <div class="dev-tools">
        <Divider />
        <NuxtLink to="/bridge-test">
          <Button label="Bridge API 테스트" icon="pi pi-code" severity="secondary" outlined />
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  color: var(--p-primary-color);
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--p-text-muted-color);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  height: 100%;
}

.feature-card :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-card :deep(.p-card-title i) {
  color: var(--p-primary-color);
}

.dev-tools {
  margin-top: 2rem;
  text-align: center;
}
</style>
