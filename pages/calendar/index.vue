<script setup lang="ts">
useHead({
  title: '일정 알림 - RentLICA'
})

interface ScheduleItem {
  id: string
  title: string
  description: string
  deadline: string
  category: 'tax' | 'report' | 'obligation'
  month: number
}

const schedules: ScheduleItem[] = [
  // 1월
  {
    id: '1',
    title: '부가가치세 확정신고 (2기)',
    description: '상가임대 부가세 2기분 신고 및 납부',
    deadline: '1월 25일',
    category: 'tax',
    month: 1
  },
  // 3월
  {
    id: '2',
    title: '지방세 신고 (균등분)',
    description: '사업자 지방세 균등분 납부',
    deadline: '3월 31일',
    category: 'tax',
    month: 3
  },
  // 4월
  {
    id: '3',
    title: '부가가치세 예정신고 (1기)',
    description: '상가임대 부가세 1기 예정신고',
    deadline: '4월 25일',
    category: 'tax',
    month: 4
  },
  // 5월
  {
    id: '4',
    title: '종합소득세 신고',
    description: '임대소득 포함 종합소득세 신고 및 납부',
    deadline: '5월 31일',
    category: 'tax',
    month: 5
  },
  // 6월
  {
    id: '5',
    title: '임대료 증액 제한 확인',
    description: '계약갱신 시 임대료 5% 이내 증액 확인',
    deadline: '상시',
    category: 'obligation',
    month: 6
  },
  // 7월
  {
    id: '6',
    title: '부가가치세 확정신고 (1기)',
    description: '상가임대 부가세 1기분 신고 및 납부',
    deadline: '7월 25일',
    category: 'tax',
    month: 7
  },
  {
    id: '7',
    title: '재산세 납부 (건물)',
    description: '임대주택 건물분 재산세 납부',
    deadline: '7월 31일',
    category: 'tax',
    month: 7
  },
  // 9월
  {
    id: '8',
    title: '재산세 납부 (토지)',
    description: '임대주택 토지분 재산세 납부',
    deadline: '9월 30일',
    category: 'tax',
    month: 9
  },
  // 10월
  {
    id: '9',
    title: '부가가치세 예정신고 (2기)',
    description: '상가임대 부가세 2기 예정신고',
    deadline: '10월 25일',
    category: 'tax',
    month: 10
  },
  // 12월
  {
    id: '10',
    title: '종합부동산세 납부',
    description: '보유 부동산 종합부동산세 납부',
    deadline: '12월 15일',
    category: 'tax',
    month: 12
  },
  {
    id: '11',
    title: '임대차계약 신고',
    description: '신규/갱신 계약 시 30일 이내 신고 (렌트홈)',
    deadline: '계약 후 30일 이내',
    category: 'report',
    month: 0
  },
  {
    id: '12',
    title: '임대조건 신고',
    description: '등록 임대주택 임대조건 변경 시 신고',
    deadline: '변경 후 3개월 이내',
    category: 'report',
    month: 0
  }
]

const selectedMonth = ref<number | null>(null)
const selectedCategory = ref<string | null>(null)

const categoryOptions = [
  { label: '전체', value: null },
  { label: '세금 신고', value: 'tax' },
  { label: '신고/보고', value: 'report' },
  { label: '의무사항', value: 'obligation' }
]

const months = [
  { label: '전체', value: null },
  ...Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}월`, value: i + 1 }))
]

const filteredSchedules = computed(() => {
  return schedules.filter(s => {
    const monthMatch = selectedMonth.value === null || s.month === selectedMonth.value || s.month === 0
    const categoryMatch = selectedCategory.value === null || s.category === selectedCategory.value
    return monthMatch && categoryMatch
  })
})

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tax': return 'info'
    case 'report': return 'success'
    case 'obligation': return 'warn'
    default: return 'secondary'
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'tax': return '세금'
    case 'report': return '신고'
    case 'obligation': return '의무'
    default: return category
  }
}

// 현재 월 기준으로 초기화
onMounted(() => {
  const currentMonth = new Date().getMonth() + 1
  selectedMonth.value = currentMonth
})
</script>

<template>
  <div class="calendar-page">
    <!-- Header -->
    <header class="page-header">
      <NuxtLink to="/" class="back-link">
        <i class="pi pi-arrow-left" /> 홈
      </NuxtLink>
      <h1><i class="pi pi-calendar" /> 일정 알림</h1>
      <p class="page-description">세금 신고 및 임대사업자 의무 이행 일정</p>
    </header>

    <!-- Filters -->
    <section class="filters">
      <div class="filter-group">
        <label>월별</label>
        <Select v-model="selectedMonth" :options="months" optionLabel="label" optionValue="value" placeholder="월 선택" class="filter-select" />
      </div>
      <div class="filter-group">
        <label>구분</label>
        <Select v-model="selectedCategory" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="구분 선택" class="filter-select" />
      </div>
    </section>

    <!-- Schedule List -->
    <section class="schedule-list">
      <Card v-for="item in filteredSchedules" :key="item.id" class="schedule-card">
        <template #content>
          <div class="schedule-item">
            <div class="schedule-main">
              <div class="schedule-header">
                <Tag :value="getCategoryLabel(item.category)" :severity="getCategoryColor(item.category)" />
                <span v-if="item.month > 0" class="schedule-month">{{ item.month }}월</span>
              </div>
              <h3 class="schedule-title">{{ item.title }}</h3>
              <p class="schedule-description">{{ item.description }}</p>
            </div>
            <div class="schedule-deadline">
              <i class="pi pi-clock" />
              <span>{{ item.deadline }}</span>
            </div>
          </div>
        </template>
      </Card>

      <div v-if="filteredSchedules.length === 0" class="no-results">
        <i class="pi pi-inbox" />
        <p>해당하는 일정이 없습니다.</p>
      </div>
    </section>

    <!-- Tips -->
    <section class="tips-section">
      <Card>
        <template #title>
          <i class="pi pi-lightbulb" /> 알림 설정 안내
        </template>
        <template #content>
          <div class="tips-content">
            <p>주요 신고 기한을 놓치지 않도록 알림을 설정하세요.</p>
            <ul>
              <li>홈택스에서 세금 신고 알림 서비스 신청</li>
              <li>렌트홈에서 임대사업자 의무 알림 설정</li>
              <li>캘린더 앱에 주요 일정 등록</li>
            </ul>
          </div>
        </template>
      </Card>
    </section>
  </div>
</template>

<style scoped>
.calendar-page {
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
  color: var(--p-orange-500);
}

.page-description {
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
}

/* Filters */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
}

.filter-select {
  min-width: 120px;
}

/* Schedule List */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.schedule-card :deep(.p-card-body) {
  padding: 1rem;
}

.schedule-card :deep(.p-card-content) {
  padding: 0;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.schedule-main {
  flex: 1;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.schedule-month {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.schedule-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.schedule-description {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.schedule-deadline {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: var(--p-surface-100);
  border-radius: 6px;
  font-size: 0.875rem;
  white-space: nowrap;
}

.schedule-deadline i {
  color: var(--p-orange-500);
}

.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--p-text-muted-color);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results p {
  margin: 0;
}

/* Tips Section */
.tips-section :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.tips-section :deep(.p-card-title i) {
  color: var(--p-yellow-500);
}

.tips-content p {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
}

.tips-content ul {
  margin: 0;
  padding-left: 1.25rem;
}

.tips-content li {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.25rem;
}

/* Mobile */
@media (max-width: 640px) {
  .schedule-item {
    flex-direction: column;
  }

  .schedule-deadline {
    align-self: flex-start;
  }
}
</style>
