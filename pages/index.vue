<script setup lang="ts">
useHead({
  title: 'RentLICA - 임대사업자를 위한 법규 및 세무 정보'
})

const features = [
  {
    title: '법규 정보',
    icon: 'pi-book',
    description: '주택임대차보호법, 상가건물 임대차보호법 등 임대사업에 필요한 법규 정보를 제공합니다.',
    link: '/laws',
    color: '#3B82F6'
  },
  {
    title: '세무 계산',
    icon: 'pi-calculator',
    description: '임대소득세, 종합부동산세, 부가가치세 등 세금 계산 및 절세 정보를 안내합니다.',
    link: '/tax',
    color: '#10B981'
  },
  {
    title: '일정 알림',
    icon: 'pi-calendar',
    description: '세금 신고 기한, 임대사업자 의무 이행 일정 등을 알려드립니다.',
    link: '/calendar',
    color: '#F59E0B'
  }
]

const router = useRouter()
const navigateTo = (link: string) => {
  router.push(link)
}
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <img src="/logo.png" alt="RentLICA" class="hero-logo" />
        <p class="hero-subtitle">대한민국 임대사업자를 위한<br />법규 및 세무 정보 서비스</p>
        <div class="hero-tags">
          <Tag value="주택임대" severity="info" />
          <Tag value="상가임대" severity="success" />
          <Tag value="세무정보" severity="warn" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="features-grid">
        <Card
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
          @click="navigateTo(feature.link)"
        >
          <template #header>
            <div class="feature-icon" :style="{ backgroundColor: feature.color }">
              <i :class="['pi', feature.icon]" />
            </div>
          </template>
          <template #title>{{ feature.title }}</template>
          <template #content>
            <p>{{ feature.description }}</p>
          </template>
          <template #footer>
            <Button
              label="자세히 보기"
              icon="pi pi-arrow-right"
              iconPos="right"
              text
              size="small"
            />
          </template>
        </Card>
      </div>
    </section>

    <!-- Quick Info Section -->
    <section class="quick-info">
      <Card>
        <template #title>
          <i class="pi pi-info-circle" /> 임대사업자 필수 정보
        </template>
        <template #content>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">주택임대사업자 등록</span>
              <span class="info-value">지자체 + 세무서 이중 등록 필요</span>
            </div>
            <Divider />
            <div class="info-item">
              <span class="info-label">임대소득 신고</span>
              <span class="info-value">연 2,000만원 이하도 신고 의무</span>
            </div>
            <Divider />
            <div class="info-item">
              <span class="info-label">종합소득세 신고</span>
              <span class="info-value">매년 5월 1일 ~ 5월 31일</span>
            </div>
          </div>
        </template>
      </Card>
    </section>

  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, var(--p-primary-50) 0%, var(--p-primary-100) 100%);
  border-radius: 0 0 2rem 2rem;
  margin: 0 -1rem 2rem;
}

.hero-logo {
  height: 48px;
  margin-bottom: 0.75rem;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--p-text-muted-color);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.hero-tags {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Features Section */
.features {
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.feature-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  border-radius: 6px 6px 0 0;
}

.feature-icon i {
  font-size: 2rem;
  color: white;
}

.feature-card :deep(.p-card-title) {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.feature-card :deep(.p-card-content) {
  padding-top: 0;
}

.feature-card :deep(.p-card-content p) {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  line-height: 1.5;
  margin: 0;
}

.feature-card :deep(.p-card-footer) {
  padding-top: 0;
}

/* Quick Info Section */
.quick-info {
  margin-bottom: 2rem;
}

.quick-info :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.quick-info :deep(.p-card-title i) {
  color: var(--p-primary-color);
}

.info-list {
  font-size: 0.9rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.info-label {
  font-weight: 500;
  color: var(--p-text-color);
}

.info-value {
  color: var(--p-text-muted-color);
  text-align: right;
}

/* Mobile */
@media (max-width: 640px) {
  .hero-logo {
    height: 40px;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-value {
    text-align: left;
  }
}
</style>
