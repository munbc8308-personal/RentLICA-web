<script setup lang="ts">
useHead({
  title: '세무 정보 - RentLICA'
})

const router = useRouter()

const taxCalculators = [
  {
    id: 'income',
    title: '임대소득세',
    icon: 'pi-wallet',
    color: '#3B82F6',
    description: '주택 및 상가 임대소득에 대한 종합소득세',
    features: [
      '분리과세 vs 종합과세 비교',
      '단순경비율 자동 적용',
      '2024년 세율표 기준'
    ],
    link: '/tax/income'
  },
  {
    id: 'property',
    title: '종합부동산세',
    icon: 'pi-building',
    color: '#10B981',
    description: '일정 금액 이상 부동산 보유 시 부과',
    features: [
      '1세대1주택 / 다주택 구분',
      '고령자·장기보유 공제',
      '농어촌특별세 포함'
    ],
    link: '/tax/property'
  },
  {
    id: 'vat',
    title: '부가가치세',
    icon: 'pi-percentage',
    color: '#F59E0B',
    description: '상가 임대 시 부과되는 부가세',
    features: [
      '일반 / 간이과세자 구분',
      '간주임대료 자동 계산',
      '매입세액 공제'
    ],
    link: '/tax/vat'
  }
]

const deductions = [
  { name: '재산세', description: '임대주택에 대해 납부한 재산세', icon: 'pi-home' },
  { name: '감가상각비', description: '건물 취득가액의 감가상각', icon: 'pi-chart-line' },
  { name: '수선비', description: '임대주택 수선 및 유지보수 비용', icon: 'pi-wrench' },
  { name: '대출이자', description: '임대주택 취득을 위한 대출이자', icon: 'pi-money-bill' },
  { name: '보험료', description: '화재보험 등 임대주택 관련 보험료', icon: 'pi-shield' },
  { name: '관리비', description: '임대인이 부담하는 관리비', icon: 'pi-cog' }
]

const taxCalendar = [
  { month: '1월', event: '부가가치세 확정신고 (2기)', deadline: '1월 25일', severity: 'warn' },
  { month: '5월', event: '종합소득세 신고', deadline: '5월 31일', severity: 'danger' },
  { month: '7월', event: '부가가치세 확정신고 (1기)', deadline: '7월 25일', severity: 'warn' },
  { month: '12월', event: '종합부동산세 납부', deadline: '12월 15일', severity: 'info' }
]

const goToCalculator = (link: string) => {
  router.push(link)
}
</script>

<template>
  <div class="tax-page">
    <!-- Header -->
    <header class="page-header">
      <NuxtLink to="/" class="back-link">
        <i class="pi pi-arrow-left" /> 홈
      </NuxtLink>
      <h1><i class="pi pi-calculator" /> 세무 정보</h1>
      <p class="page-description">임대사업자 세금 계산 및 절세 정보</p>
    </header>

    <!-- Tax Calculators -->
    <section class="calculators-section">
      <h2 class="section-title">
        <i class="pi pi-calculator" /> 세금 계산기
      </h2>
      <div class="calculators-grid">
        <Card
          v-for="calc in taxCalculators"
          :key="calc.id"
          class="calculator-card"
          @click="goToCalculator(calc.link)"
        >
          <template #header>
            <div class="calc-header" :style="{ backgroundColor: calc.color }">
              <i :class="['pi', calc.icon]" />
            </div>
          </template>
          <template #title>{{ calc.title }}</template>
          <template #subtitle>{{ calc.description }}</template>
          <template #content>
            <ul class="features-list">
              <li v-for="feature in calc.features" :key="feature">
                <i class="pi pi-check" />
                {{ feature }}
              </li>
            </ul>
          </template>
          <template #footer>
            <Button
              label="계산하기"
              icon="pi pi-arrow-right"
              iconPos="right"
              size="small"
            />
          </template>
        </Card>
      </div>
    </section>

    <!-- Tax Deductions -->
    <section class="deductions-section">
      <Card>
        <template #title>
          <i class="pi pi-minus-circle" /> 필요경비 공제 항목
        </template>
        <template #subtitle>
          임대소득세 계산 시 수입에서 공제할 수 있는 비용
        </template>
        <template #content>
          <div class="deductions-grid">
            <div v-for="item in deductions" :key="item.name" class="deduction-item">
              <div class="deduction-icon">
                <i :class="['pi', item.icon]" />
              </div>
              <div class="deduction-content">
                <strong>{{ item.name }}</strong>
                <span>{{ item.description }}</span>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </section>

    <!-- Tax Calendar -->
    <section class="calendar-section">
      <Card>
        <template #title>
          <i class="pi pi-calendar" /> 주요 세금 신고 일정
        </template>
        <template #content>
          <div class="calendar-list">
            <div v-for="item in taxCalendar" :key="item.month" class="calendar-item">
              <div class="calendar-month">{{ item.month }}</div>
              <div class="calendar-info">
                <span class="calendar-event">{{ item.event }}</span>
                <Tag :value="item.deadline" :severity="item.severity" />
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <NuxtLink to="/calendar">
            <Button
              label="전체 일정 보기"
              icon="pi pi-arrow-right"
              iconPos="right"
              text
              size="small"
            />
          </NuxtLink>
        </template>
      </Card>
    </section>

    <!-- Tips -->
    <section class="tips-section">
      <Card>
        <template #title>
          <i class="pi pi-lightbulb" /> 절세 팁
        </template>
        <template #content>
          <Accordion>
            <AccordionPanel value="0">
              <AccordionHeader>임대사업자 등록 시 혜택</AccordionHeader>
              <AccordionContent>
                <ul class="tips-list">
                  <li>단순경비율 상향 적용 (미등록 42.3% → 등록 60.1%)</li>
                  <li>필요경비 증가로 과세표준 감소</li>
                  <li>양도소득세 장기보유특별공제 추가 혜택</li>
                </ul>
              </AccordionContent>
            </AccordionPanel>
            <AccordionPanel value="1">
              <AccordionHeader>분리과세 vs 종합과세</AccordionHeader>
              <AccordionContent>
                <ul class="tips-list">
                  <li>주택임대 연 2,000만원 이하: 분리과세(14%) 선택 가능</li>
                  <li>다른 소득이 많으면 분리과세가 유리</li>
                  <li>다른 소득이 없거나 적으면 종합과세가 유리할 수 있음</li>
                </ul>
              </AccordionContent>
            </AccordionPanel>
            <AccordionPanel value="2">
              <AccordionHeader>필요경비 꼼꼼히 챙기기</AccordionHeader>
              <AccordionContent>
                <ul class="tips-list">
                  <li>모든 지출 영수증 보관 (수선비, 관리비 등)</li>
                  <li>대출이자 납입증명서 확보</li>
                  <li>재산세 납부확인서 챙기기</li>
                  <li>감가상각비는 매년 일정액 공제 가능</li>
                </ul>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </template>
      </Card>
    </section>

    <!-- Notice -->
    <Message severity="warn" :closable="false" class="notice">
      <p>
        <strong>주의:</strong> 본 계산기는 참고용이며, 개인 상황에 따라 실제 세금은 다를 수 있습니다.
        정확한 세금 계산은 세무사와 상담하시기 바랍니다.
      </p>
    </Message>
  </div>
</template>

<style scoped>
.tax-page {
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
  color: var(--p-green-500);
}

.page-description {
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
}

/* Section Title */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.section-title i {
  color: var(--p-primary-color);
}

/* Calculators Section */
.calculators-section {
  margin-bottom: 2rem;
}

.calculators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.calculator-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.calculator-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.calc-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  border-radius: 6px 6px 0 0;
}

.calc-header i {
  font-size: 2rem;
  color: white;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
  font-size: 0.85rem;
}

.features-list li i {
  color: var(--p-green-500);
  font-size: 0.75rem;
}

/* Deductions Section */
.deductions-section {
  margin-bottom: 2rem;
}

.deductions-section :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.deductions-section :deep(.p-card-title i) {
  color: var(--p-red-500);
}

.deductions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.deduction-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--p-surface-50);
  border-radius: 8px;
}

.deduction-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: var(--p-primary-color);
}

.deduction-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.deduction-content strong {
  font-size: 0.9rem;
}

.deduction-content span {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

/* Calendar Section */
.calendar-section {
  margin-bottom: 2rem;
}

.calendar-section :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calendar-section :deep(.p-card-title i) {
  color: var(--p-orange-500);
}

.calendar-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.calendar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--p-surface-50);
  border-radius: 8px;
}

.calendar-month {
  font-weight: 700;
  font-size: 1rem;
  color: var(--p-primary-color);
  min-width: 3rem;
}

.calendar-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 1rem;
}

.calendar-event {
  font-size: 0.9rem;
}

/* Tips Section */
.tips-section {
  margin-bottom: 2rem;
}

.tips-section :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tips-section :deep(.p-card-title i) {
  color: var(--p-yellow-500);
}

.tips-list {
  margin: 0;
  padding-left: 1.25rem;
}

.tips-list li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Notice */
.notice p {
  margin: 0;
  font-size: 0.875rem;
}

/* Mobile */
@media (max-width: 640px) {
  .calendar-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
