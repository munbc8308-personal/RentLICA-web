<script setup lang="ts">
const route = useRoute()
const lawId = computed(() => route.params.id as string)

interface LawDetail {
  id: string
  name: string
  shortName: string
  type: string
  ministry: string
  enforcementDate: string
  promulgationDate: string
  promulgationNumber: string
  articles: Array<{
    number: string
    title: string
    content: string
  }>
  source: string
  sourceUrl: string
}

const { data: law, pending, error } = await useFetch<LawDetail>(`/api/laws/${lawId.value}`)

useHead({
  title: computed(() => law.value ? `${law.value.name} - RentLICA` : '법령 정보 - RentLICA')
})

const expandedArticles = ref<Set<string>>(new Set())

const toggleArticle = (number: string) => {
  if (expandedArticles.value.has(number)) {
    expandedArticles.value.delete(number)
  } else {
    expandedArticles.value.add(number)
  }
}

const expandAll = () => {
  if (law.value) {
    law.value.articles.forEach(art => expandedArticles.value.add(art.number))
  }
}

const collapseAll = () => {
  expandedArticles.value.clear()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  // YYYYMMDD 또는 YYYY-MM-DD 형식 처리
  const cleaned = date.replace(/-/g, '')
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}년 ${parseInt(cleaned.slice(4, 6))}월 ${parseInt(cleaned.slice(6, 8))}일`
  }
  return date
}

const formatContent = (content: string) => {
  // 줄바꿈 및 항목 번호 처리
  return content
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<br><strong>$1</strong>')
    .replace(/^<br>/, '')
}
</script>

<template>
  <div class="law-detail-page">
    <!-- Header -->
    <header class="page-header">
      <NuxtLink to="/laws" class="back-link">
        <i class="pi pi-arrow-left" /> 법규 목록
      </NuxtLink>
    </header>

    <!-- Loading -->
    <div v-if="pending" class="loading">
      <ProgressSpinner />
      <p>법령 정보를 불러오는 중...</p>
    </div>

    <!-- Error -->
    <Message v-else-if="error" severity="error">
      <p>법령 정보를 불러오는데 실패했습니다.</p>
    </Message>

    <!-- Content -->
    <template v-else-if="law">
      <!-- Law Info Card -->
      <Card class="law-info-card">
        <template #content>
          <div class="law-header">
            <Tag :value="law.type" severity="info" />
            <h1>{{ law.name }}</h1>
            <p v-if="law.shortName" class="short-name">({{ law.shortName }})</p>
          </div>

          <div class="law-meta">
            <div class="meta-item">
              <span class="meta-label">소관부처</span>
              <span class="meta-value">{{ law.ministry || '-' }}</span>
            </div>
            <Divider layout="vertical" />
            <div class="meta-item">
              <span class="meta-label">시행일</span>
              <span class="meta-value">{{ formatDate(law.enforcementDate) }}</span>
            </div>
            <Divider layout="vertical" />
            <div class="meta-item">
              <span class="meta-label">공포번호</span>
              <span class="meta-value">{{ law.promulgationNumber || '-' }}</span>
            </div>
          </div>

          <div class="source-link">
            <a :href="law.sourceUrl" target="_blank" rel="noopener noreferrer">
              <Button
                label="국가법령정보센터에서 보기"
                icon="pi pi-external-link"
                iconPos="right"
                outlined
                size="small"
              />
            </a>
          </div>
        </template>
      </Card>

      <!-- Articles Section -->
      <section class="articles-section">
        <div class="articles-header">
          <h2><i class="pi pi-list" /> 조문 내용</h2>
          <div class="articles-actions">
            <Button
              label="모두 펼치기"
              icon="pi pi-angle-double-down"
              text
              size="small"
              @click="expandAll"
            />
            <Button
              label="모두 접기"
              icon="pi pi-angle-double-up"
              text
              size="small"
              @click="collapseAll"
            />
          </div>
        </div>

        <div v-if="law.articles.length === 0" class="no-articles">
          <Message severity="info" :closable="false">
            조문 정보가 없습니다. 국가법령정보센터에서 전체 내용을 확인해주세요.
          </Message>
        </div>

        <div v-else class="articles-list">
          <Card
            v-for="article in law.articles"
            :key="article.number"
            class="article-card"
            :class="{ 'expanded': expandedArticles.has(article.number) }"
          >
            <template #content>
              <div
                class="article-header"
                @click="toggleArticle(article.number)"
              >
                <div class="article-title">
                  <span class="article-number">{{ article.number }}</span>
                  <span class="article-name">{{ article.title }}</span>
                </div>
                <i :class="['pi', expandedArticles.has(article.number) ? 'pi-chevron-up' : 'pi-chevron-down']" />
              </div>

              <div v-if="expandedArticles.has(article.number)" class="article-content">
                <Divider />
                <div v-html="formatContent(article.content)" />
              </div>
            </template>
          </Card>
        </div>
      </section>

      <!-- Notice -->
      <Message severity="warn" :closable="false" class="notice">
        <p>
          <strong>주의:</strong> 본 정보는 참고용이며, 정확한 법령 내용은
          <a :href="law.sourceUrl" target="_blank" rel="noopener noreferrer">국가법령정보센터</a>에서
          확인하시기 바랍니다.
        </p>
      </Message>
    </template>
  </div>
</template>

<style scoped>
.law-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header */
.page-header {
  margin-bottom: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.back-link:hover {
  color: var(--p-primary-color);
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: var(--p-text-muted-color);
}

.loading p {
  margin-top: 1rem;
}

/* Law Info Card */
.law-info-card {
  margin-bottom: 1.5rem;
}

.law-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.law-header h1 {
  font-size: 1.5rem;
  margin: 0.75rem 0 0.25rem;
}

.short-name {
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
  margin: 0;
}

.law-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.meta-item {
  text-align: center;
}

.meta-label {
  display: block;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.25rem;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 500;
}

.source-link {
  text-align: center;
}

.source-link a {
  text-decoration: none;
}

/* Articles Section */
.articles-section {
  margin-bottom: 1.5rem;
}

.articles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.articles-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  margin: 0;
}

.articles-header h2 i {
  color: var(--p-primary-color);
}

.articles-actions {
  display: flex;
  gap: 0.25rem;
}

.no-articles {
  margin: 1rem 0;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-card.expanded {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.article-card :deep(.p-card-body) {
  padding: 0;
}

.article-card :deep(.p-card-content) {
  padding: 0;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.article-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.article-number {
  font-weight: 700;
  color: var(--p-primary-color);
  min-width: 4rem;
}

.article-name {
  font-weight: 500;
}

.article-header i {
  color: var(--p-text-muted-color);
}

.article-content {
  padding: 0 1rem 1rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--p-text-color);
}

.article-content :deep(.p-divider) {
  margin: 0 0 1rem;
}

/* Notice */
.notice p {
  margin: 0;
  font-size: 0.875rem;
}

.notice a {
  color: var(--p-primary-color);
}

/* Mobile */
@media (max-width: 640px) {
  .law-meta {
    flex-direction: column;
  }

  .law-meta :deep(.p-divider) {
    display: none;
  }

  .articles-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .article-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
