<script setup lang="ts">
useHead({
  title: '부가가치세 계산 - RentLICA'
})

// 입력값
const businessType = ref<'general' | 'simplified'>('general') // 일반/간이과세자
const monthlyRent = ref<number>(0) // 월 임대료 (부가세 제외)
const deposit = ref<number>(0) // 보증금 (간주임대료 계산용)
const purchaseAmount = ref<number>(0) // 매입세액 (세금계산서 수취분)
const period = ref<'1st' | '2nd'>('1st') // 신고기간

// 간이과세자 업종별 부가가치율 (부동산임대업) - 출처: 부가가치세법 시행령
const simplifiedRate = 0.4 // 40%

// 간주임대료 이자율 (2024년 기준) - 출처: 국세청 고시
const depositInterestRate = 0.021 // 2.1%

// 도움말 텍스트
const helpTexts = {
  businessType: '일반과세자: 매출세액 10%에서 매입세액 전액 공제\n\n간이과세자: 연 매출 8천만원 미만 사업자\n• 세금계산서 발급 불가\n• 낮은 세율 적용 (업종별 부가가치율 × 10%)\n• 매입세액 공제 제한적 (0.5%)',
  period: '부가가치세는 6개월 단위로 신고합니다.\n\n• 1기: 1~6월분 → 7월 1~25일 신고\n• 2기: 7~12월분 → 다음해 1월 1~25일 신고\n\n예정신고(4월, 10월)는 선택사항입니다.',
  monthlyRent: '부가세를 제외한 순수 임대료입니다.\n\n예) 임차인에게 110만원 청구 시\n→ 임대료: 100만원\n→ 부가세: 10만원\n\n6개월분이 자동 계산됩니다.',
  deposit: '보증금에 대한 간주임대료가 발생합니다.\n\n계산: 보증금 × 정기예금이자율(2.1%) × 6/12\n\n상가임대는 보증금 전액에 간주임대료가 적용됩니다 (주택과 다름).',
  purchaseAmount: '매입세액이 기재된 세금계산서의 부가세 합계입니다.\n\n공제 가능 항목:\n• 관리비\n• 수선비\n• 중개수수료 등\n\n간이과세자는 매입세액의 0.5%만 공제됩니다.'
}

// 계산 결과
const calculation = computed(() => {
  // 1. 임대료 수입 (6개월분)
  const semiAnnualRent = monthlyRent.value * 6

  // 2. 간주임대료 (보증금에서 발생하는 이자 상당액)
  // 계산: 보증금 × 이자율 × (6/12)
  const deemedRent = Math.floor(deposit.value * depositInterestRate * 0.5)

  // 3. 총 공급가액
  const totalSupply = semiAnnualRent + deemedRent

  let outputTax = 0 // 매출세액
  let inputTax = 0 // 매입세액
  let taxDue = 0 // 납부세액

  if (businessType.value === 'general') {
    // 일반과세자
    // 매출세액 = 공급가액 × 10%
    outputTax = Math.floor(totalSupply * 0.1)

    // 매입세액 (세금계산서 수취분)
    inputTax = purchaseAmount.value

    // 납부세액 = 매출세액 - 매입세액
    taxDue = Math.max(0, outputTax - inputTax)
  } else {
    // 간이과세자
    // 납부세액 = 공급대가 × 업종별 부가가치율 × 10%
    // 2024년부터 간이과세자도 매입세액 공제 가능 (일정 비율)
    outputTax = Math.floor(totalSupply * simplifiedRate * 0.1)

    // 간이과세자 매입세액 공제 (세금계산서 수취분 × 0.5%)
    inputTax = Math.floor(purchaseAmount.value * 0.005)

    taxDue = Math.max(0, outputTax - inputTax)
  }

  // 실효세율
  const effectiveRate = totalSupply > 0 ? (taxDue / totalSupply * 100).toFixed(2) : '0'

  return {
    semiAnnualRent,
    deemedRent,
    totalSupply,
    outputTax,
    inputTax,
    taxDue,
    effectiveRate,
    isSimplified: businessType.value === 'simplified'
  }
})

// 간이과세 기준 확인
const annualEstimate = computed(() => {
  return monthlyRent.value * 12 // 연간 추정
})

const canBeSimplified = computed(() => {
  return annualEstimate.value < 80000000 // 8천만원 미만
})

const formatCurrency = (num: number) => {
  return num.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div class="tax-calculator-page">
    <!-- Header -->
    <header class="page-header">
      <NuxtLink to="/tax" class="back-link">
        <i class="pi pi-arrow-left" /> 세무 정보
      </NuxtLink>
      <h1><i class="pi pi-percentage" /> 부가가치세 계산기</h1>
      <p class="page-description">상가 임대 부가가치세를 계산합니다 (주택임대는 면세)</p>
    </header>

    <!-- 면세 안내 -->
    <Message severity="info" :closable="false" class="tax-exempt-notice">
      <div class="notice-content">
        <i class="pi pi-home" />
        <div>
          <strong>주택임대는 부가가치세가 면제됩니다.</strong>
          <p>이 계산기는 상가, 사무실 등 영업용 건물 임대에만 해당됩니다.</p>
        </div>
      </div>
    </Message>

    <div class="calculator-layout">
      <!-- Input Section -->
      <Card class="input-section">
        <template #title>
          <i class="pi pi-pencil" /> 임대 정보 입력
        </template>
        <template #content>
          <!-- 과세 유형 -->
          <div class="form-group">
            <label class="form-label">
              사업자 유형
              <HelpToggle :text="helpTexts.businessType" />
            </label>
            <SelectButton
              v-model="businessType"
              :options="[
                { label: '일반과세자', value: 'general' },
                { label: '간이과세자', value: 'simplified' }
              ]"
              optionLabel="label"
              optionValue="value"
            />
            <small v-if="!canBeSimplified && businessType === 'simplified'" class="form-warning">
              <i class="pi pi-exclamation-triangle" />
              연 매출 {{ formatCurrency(annualEstimate) }} 추정, 일반과세자 적용 필요
            </small>
          </div>

          <!-- 신고기간 -->
          <div class="form-group">
            <label class="form-label">
              신고기간
              <HelpToggle :text="helpTexts.period" />
            </label>
            <SelectButton
              v-model="period"
              :options="[
                { label: '1기 (1~6월)', value: '1st' },
                { label: '2기 (7~12월)', value: '2nd' }
              ]"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <Divider />

          <!-- 월 임대료 -->
          <div class="form-group">
            <label class="form-label">
              월 임대료 (부가세 별도)
              <HelpToggle :text="helpTexts.monthlyRent" />
            </label>
            <InputNumber
              v-model="monthlyRent"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              class="w-full"
              placeholder="예: 1,000,000"
            />
            <small class="form-hint">
              6개월 합계: {{ formatCurrency(monthlyRent * 6) }}
            </small>
          </div>

          <!-- 보증금 -->
          <div class="form-group">
            <label class="form-label">
              보증금
              <HelpToggle :text="helpTexts.deposit" />
            </label>
            <InputNumber
              v-model="deposit"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              class="w-full"
              placeholder="예: 50,000,000"
            />
            <small class="form-hint">
              간주임대료 (6개월): {{ formatCurrency(calculation.deemedRent) }}
            </small>
          </div>

          <Divider />

          <!-- 매입세액 -->
          <div class="form-group">
            <label class="form-label">
              매입세액 (세금계산서 수취분)
              <HelpToggle :text="helpTexts.purchaseAmount" />
            </label>
            <InputNumber
              v-model="purchaseAmount"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              class="w-full"
              placeholder="예: 100,000"
            />
            <small class="form-hint">
              {{ businessType === 'general' ? '전액 공제' : '0.5% 공제 (간이과세자)' }}
            </small>
          </div>
        </template>
      </Card>

      <!-- Result Section -->
      <div class="result-section">
        <!-- 계산 과정 -->
        <Card class="calculation-card">
          <template #title>
            <i class="pi pi-calculator" /> 계산 과정
          </template>
          <template #content>
            <div class="calc-steps">
              <!-- Step 1: 공급가액 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <span class="step-title">공급가액 (6개월)</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row">
                    <span>임대료 수입 (월세 × 6)</span>
                    <span>{{ formatCurrency(calculation.semiAnnualRent) }}</span>
                  </div>
                  <div class="calc-row">
                    <span>+ 간주임대료</span>
                    <span>{{ formatCurrency(calculation.deemedRent) }}</span>
                  </div>
                  <div class="calc-row result">
                    <span>= 총 공급가액</span>
                    <span>{{ formatCurrency(calculation.totalSupply) }}</span>
                  </div>
                </div>
              </div>

              <!-- Step 2: 매출세액 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <span class="step-title">매출세액</span>
                </div>
                <div class="step-detail">
                  <template v-if="businessType === 'general'">
                    <div class="calc-row">
                      <span>공급가액 × 10%</span>
                      <span>{{ formatCurrency(calculation.outputTax) }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="calc-row">
                      <span>공급가액 × 부가가치율(40%) × 10%</span>
                      <span>{{ formatCurrency(calculation.outputTax) }}</span>
                    </div>
                    <small class="step-note">부동산임대업 부가가치율: 40% (부가가치세법 시행령)</small>
                  </template>
                </div>
              </div>

              <!-- Step 3: 매입세액 공제 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <span class="step-title">매입세액 공제</span>
                </div>
                <div class="step-detail">
                  <template v-if="businessType === 'general'">
                    <div class="calc-row">
                      <span>세금계산서 수취분</span>
                      <span>-{{ formatCurrency(calculation.inputTax) }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="calc-row">
                      <span>세금계산서 수취분 × 0.5%</span>
                      <span>-{{ formatCurrency(calculation.inputTax) }}</span>
                    </div>
                    <small class="step-note">간이과세자 매입세액 공제율: 0.5%</small>
                  </template>
                </div>
              </div>

              <!-- Step 4: 납부세액 -->
              <div class="calc-step highlight">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <span class="step-title">납부세액</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row result">
                    <span>매출세액 - 매입세액</span>
                    <span class="highlight">{{ formatCurrency(calculation.taxDue) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 최종 결과 -->
        <Card class="final-result-card">
          <template #content>
            <div class="final-result">
              <div class="result-label">
                {{ period === '1st' ? '1기' : '2기' }} 예상 부가가치세
              </div>
              <div class="result-amount">{{ formatCurrency(calculation.taxDue) }}</div>
              <div class="result-meta">
                <Tag
                  :value="businessType === 'general' ? '일반과세자' : '간이과세자'"
                  :severity="businessType === 'general' ? 'info' : 'warn'"
                />
                <span class="effective-rate">실효세율 {{ calculation.effectiveRate }}%</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- 신고 안내 -->
        <Card class="info-card">
          <template #title>
            <i class="pi pi-calendar" /> 신고 일정
          </template>
          <template #content>
            <div class="schedule-info">
              <div class="schedule-item" :class="{ active: period === '1st' }">
                <span class="schedule-period">1기 확정신고</span>
                <span class="schedule-date">7월 1일 ~ 25일</span>
                <span class="schedule-desc">1~6월분 신고</span>
              </div>
              <div class="schedule-item" :class="{ active: period === '2nd' }">
                <span class="schedule-period">2기 확정신고</span>
                <span class="schedule-date">다음해 1월 1일 ~ 25일</span>
                <span class="schedule-desc">7~12월분 신고</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- 참고사항 -->
        <Message severity="warn" :closable="false" class="notice">
          <ul class="notice-list">
            <li>세금계산서 발급 시 부가세 10%를 임차인에게 청구</li>
            <li>간이과세자는 세금계산서 발급 불가</li>
            <li>신고 지연 시 가산세가 부과됩니다</li>
          </ul>
        </Message>
      </div>
    </div>

    <!-- 출처 정보 -->
    <Card class="reference-card">
      <template #title>
        <i class="pi pi-info-circle" /> 계산 기준 및 출처
      </template>
      <template #content>
        <div class="source-info">
          <p><strong>적용 기준:</strong> 2024년 부가가치세법</p>
          <ul>
            <li>
              <a href="https://www.law.go.kr/법령/부가가치세법" target="_blank" rel="noopener">국가법령정보센터</a> - 부가가치세법
            </li>
            <li>
              <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2272&cntntsId=7694" target="_blank" rel="noopener">국세청</a> - 부가가치세 안내
            </li>
            <li>
              <a href="https://www.hometax.go.kr" target="_blank" rel="noopener">홈택스</a> - 전자신고
            </li>
          </ul>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.tax-calculator-page {
  max-width: 1200px;
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

/* Tax Exempt Notice */
.tax-exempt-notice {
  margin-bottom: 1.5rem;
}

.notice-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.notice-content i {
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.notice-content p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  font-weight: normal;
}

/* Layout */
.calculator-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .calculator-layout {
    grid-template-columns: 1fr;
  }
}

/* Input Section */
.input-section :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  color: var(--p-text-muted-color);
  font-size: 0.8rem;
}

.form-warning {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  color: var(--p-orange-500);
  font-size: 0.8rem;
}

.w-full {
  width: 100%;
}

/* Result Section */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calculation-card :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.calc-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calc-step {
  padding: 0.75rem;
  background: var(--p-surface-50);
  border-radius: 8px;
}

.calc-step.highlight {
  background: var(--p-orange-50);
  border: 1px solid var(--p-orange-200);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.step-number {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-orange-500);
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
}

.step-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.step-detail {
  padding-left: 2rem;
}

.step-note {
  display: block;
  margin-top: 0.25rem;
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.85rem;
}

.calc-row.result {
  font-weight: 600;
  border-top: 1px solid var(--p-surface-200);
  margin-top: 0.25rem;
  padding-top: 0.5rem;
}

.calc-row .highlight {
  font-weight: 600;
  color: var(--p-orange-600);
}

/* Final Result */
.final-result-card {
  background: linear-gradient(135deg, var(--p-orange-500), var(--p-orange-400));
  color: white;
}

.final-result-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.final-result {
  text-align: center;
}

.result-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.result-amount {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.result-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.effective-rate {
  font-size: 0.85rem;
  opacity: 0.9;
}

/* Schedule Info */
.info-card :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--p-surface-50);
  border-radius: 6px;
  font-size: 0.85rem;
}

.schedule-item.active {
  background: var(--p-orange-50);
  border: 1px solid var(--p-orange-200);
}

.schedule-period {
  font-weight: 600;
  min-width: 6rem;
}

.schedule-date {
  color: var(--p-primary-color);
  font-weight: 500;
}

.schedule-desc {
  color: var(--p-text-muted-color);
}

/* Notice */
.notice-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
}

.notice-list li {
  margin-bottom: 0.25rem;
}

/* Reference Card */
.reference-card {
  margin-top: 1rem;
}

.reference-card :deep(.p-card-title) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.source-info {
  font-size: 0.85rem;
}

.source-info p {
  margin: 0 0 0.5rem;
}

.source-info ul {
  margin: 0;
  padding-left: 1.25rem;
}

.source-info li {
  margin-bottom: 0.25rem;
}

.source-info a {
  color: var(--p-primary-color);
}
</style>
