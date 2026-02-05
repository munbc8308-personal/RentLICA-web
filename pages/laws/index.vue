<script setup lang="ts">
useHead({
  title: '법규 정보 - RentLICA'
})

const router = useRouter()

const lawCategories = [
  {
    id: 'housing',
    title: '주택임대차보호법',
    icon: 'pi-home',
    description: '주택 임차인의 권리 보호에 관한 법률',
    highlights: [
      '대항력 및 우선변제권',
      '계약 갱신청구권',
      '전월세 전환율 제한'
    ]
  },
  {
    id: 'commercial',
    title: '상가건물 임대차보호법',
    icon: 'pi-building',
    description: '상가 임차인의 영업권 보호에 관한 법률',
    highlights: [
      '권리금 보호',
      '계약갱신요구권 (10년)',
      '차임증액 제한 (5%)'
    ]
  },
  {
    id: 'rental-business',
    title: '민간임대주택에 관한 특별법',
    icon: 'pi-briefcase',
    description: '민간임대주택의 공급 촉진에 관한 특별법',
    highlights: [
      '임대사업자 등록 요건',
      '의무임대기간 준수',
      '임대료 증액 제한'
    ]
  }
]

const registrationSteps = [
  {
    step: 1,
    title: '지자체 등록',
    description: '시/군/구청 주택과에 임대사업자 등록 신청',
    docs: ['임대주택 현황', '등기부등본', '신분증']
  },
  {
    step: 2,
    title: '세무서 등록',
    description: '관할 세무서에 사업자등록 신청',
    docs: ['임대사업자 등록증', '임대차계약서', '신분증']
  },
  {
    step: 3,
    title: '렌트홈 신고',
    description: '렌트홈 시스템에 임대차 계약 신고',
    docs: ['임대차계약서', '임대사업자 등록번호']
  }
]

// 검색 기능
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

const searchLaws = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const data = await $fetch('/api/laws/search', {
      params: { keyword: searchKeyword.value }
    })
    searchResults.value = data.laws || []
  } catch (e) {
    console.error('Search error:', e)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const goToDetail = (id: string) => {
  router.push(`/laws/${id}`)
}
</script>

<template>
  <div class="laws-page">
    <!-- Header -->
    <header class="page-header">
      <NuxtLink to="/" class="back-link">
        <i class="pi pi-arrow-left" /> 홈
      </NuxtLink>
      <h1><i class="pi pi-book" /> 법규 정보</h1>
      <p class="page-description">임대사업자가 알아야 할 주요 법규 정보</p>
    </header>

    <!-- Search -->
    <section class="search-section">
      <div class="search-box">
        <InputText
          v-model="searchKeyword"
          placeholder="법령명으로 검색 (예: 임대차, 주택)"
          class="search-input"
          @keyup.enter="searchLaws"
        />
        <Button
          icon="pi pi-search"
          :loading="isSearching"
          @click="searchLaws"
        />
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div class="results-header">
          <span>검색 결과 {{ searchResults.length }}건</span>
          <Button
            icon="pi pi-times"
            text
            size="small"
            @click="searchResults = []; searchKeyword = ''"
          />
        </div>
        <div
          v-for="result in searchResults"
          :key="result.id"
          class="result-item"
          @click="goToDetail(result.id)"
        >
          <div class="result-main">
            <Tag :value="result.type" size="small" severity="info" />
            <span class="result-name">{{ result.name }}</span>
            <span v-if="result.shortName" class="result-short">({{ result.shortName }})</span>
          </div>
          <div class="result-meta">
            <span>{{ result.ministry }}</span>
            <span>시행 {{ result.enforcementDate }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Laws -->
    <section class="law-categories">
      <h2 class="section-title">주요 임대차 관련 법률</h2>
      <div class="categories-grid">
        <Card
          v-for="category in lawCategories"
          :key="category.id"
          class="law-card"
          @click="goToDetail(category.id)"
        >
          <template #header>
            <div class="card-icon">
              <i :class="['pi', category.icon]" />
            </div>
          </template>
          <template #title>{{ category.title }}</template>
          <template #subtitle>{{ category.description }}</template>
          <template #content>
            <ul class="highlights">
              <li v-for="item in category.highlights" :key="item">
                <i class="pi pi-check" />
                {{ item }}
              </li>
            </ul>
          </template>
          <template #footer>
            <Button
              label="조문 보기"
              icon="pi pi-arrow-right"
              iconPos="right"
              text
              size="small"
            />
          </template>
        </Card>
      </div>
    </section>

    <!-- Registration Steps -->
    <section class="registration-section">
      <Card>
        <template #title>
          <i class="pi pi-file-edit" /> 임대사업자 등록 절차
        </template>
        <template #content>
          <div class="steps-timeline">
            <div v-for="step in registrationSteps" :key="step.step" class="step-item">
              <div class="step-indicator">
                <span class="step-number">{{ step.step }}</span>
                <div class="step-line" />
              </div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
                <div class="step-docs">
                  <Tag
                    v-for="doc in step.docs"
                    :key="doc"
                    :value="doc"
                    severity="secondary"
                    class="doc-tag"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </section>

    <!-- External Links -->
    <section class="external-links">
      <Card>
        <template #title>
          <i class="pi pi-link" /> 관련 사이트
        </template>
        <template #content>
          <div class="links-grid">
            <a href="https://www.law.go.kr" target="_blank" rel="noopener noreferrer" class="link-item">
              <i class="pi pi-external-link" />
              <div>
                <strong>국가법령정보센터</strong>
                <span>대한민국 법령 검색</span>
              </div>
            </a>
            <a href="https://www.renthome.go.kr" target="_blank" rel="noopener noreferrer" class="link-item">
              <i class="pi pi-external-link" />
              <div>
                <strong>렌트홈</strong>
                <span>임대사업자 등록/신고</span>
              </div>
            </a>
            <a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer" class="link-item">
              <i class="pi pi-external-link" />
              <div>
                <strong>홈택스</strong>
                <span>세금 신고/납부</span>
              </div>
            </a>
          </div>
        </template>
      </Card>
    </section>

    <!-- Notice -->
    <Message severity="info" :closable="false" class="notice">
      <p>
        <strong>참고:</strong> 법규 내용은 변경될 수 있으며, 최신 정보는
        <a href="https://www.law.go.kr" target="_blank" rel="noopener noreferrer">국가법령정보센터</a>에서
        확인하시기 바랍니다.
      </p>
    </Message>
  </div>
</template>

<style scoped>
.laws-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header */
.page-header {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  color: var(--p-primary-color);
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.page-header h1 i {
  color: var(--p-primary-color);
}

.page-description {
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
}

.search-results {
  margin-top: 1rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--p-surface-50);
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.result-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--p-surface-100);
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: var(--p-surface-50);
}

.result-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.result-name {
  font-weight: 500;
}

.result-short {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.result-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

/* Section Title */
.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

/* Law Categories */
.law-categories {
  margin-bottom: 2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.law-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.law-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: linear-gradient(135deg, var(--p-primary-color), var(--p-primary-400));
  border-radius: 6px 6px 0 0;
}

.card-icon i {
  font-size: 1.5rem;
  color: white;
}

.highlights {
  list-style: none;
  padding: 0;
  margin: 0;
}

.highlights li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
  font-size: 0.875rem;
}

.highlights li i {
  color: var(--p-green-500);
  font-size: 0.75rem;
}

/* Registration Section */
.registration-section {
  margin-bottom: 2rem;
}

.registration-section :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.registration-section :deep(.p-card-title i) {
  color: var(--p-primary-color);
}

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step-item {
  display: flex;
  gap: 1rem;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
}

.step-line {
  width: 2px;
  flex: 1;
  background: var(--p-surface-200);
  margin: 0.5rem 0;
}

.step-item:last-child .step-line {
  display: none;
}

.step-content {
  flex: 1;
  padding-bottom: 1.5rem;
}

.step-content h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.step-content p {
  margin: 0 0 0.5rem;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.step-docs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.doc-tag {
  font-size: 0.75rem;
}

/* External Links */
.external-links {
  margin-bottom: 2rem;
}

.external-links :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.external-links :deep(.p-card-title i) {
  color: var(--p-primary-color);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
}

.link-item:hover {
  background: var(--p-surface-100);
}

.link-item i {
  color: var(--p-primary-color);
}

.link-item strong {
  display: block;
  font-size: 0.9rem;
}

.link-item span {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

/* Notice */
.notice p {
  margin: 0;
  font-size: 0.875rem;
}

.notice a {
  color: var(--p-primary-color);
}
</style>
