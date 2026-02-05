<script setup lang="ts">
useHead({
  title: '임대소득세 계산 - RentLICA'
})

// 입력값
const rentalType = ref<'housing' | 'commercial'>('housing')
const annualRentalIncome = ref<number>(0) // 연 임대수입
const depositIncome = ref<number>(0) // 간주임대료 (보증금 이자)
const necessaryExpenses = ref<number>(0) // 필요경비
const expenseMethod = ref<'simple' | 'actual'>('simple') // 경비 산정 방법
const otherIncome = ref<number>(0) // 기타 종합소득
const isRegistered = ref(false) // 임대사업자 등록 여부

// 2024년 기준 세율표 (국세청 기준)
// 출처: https://www.nts.go.kr
const taxBrackets = [
  { min: 0, max: 14000000, rate: 0.06, deduction: 0 },
  { min: 14000000, max: 50000000, rate: 0.15, deduction: 1260000 },
  { min: 50000000, max: 88000000, rate: 0.24, deduction: 5760000 },
  { min: 88000000, max: 150000000, rate: 0.35, deduction: 15440000 },
  { min: 150000000, max: 300000000, rate: 0.38, deduction: 19940000 },
  { min: 300000000, max: 500000000, rate: 0.40, deduction: 25940000 },
  { min: 500000000, max: 1000000000, rate: 0.42, deduction: 35940000 },
  { min: 1000000000, max: Infinity, rate: 0.45, deduction: 65940000 }
]

// 단순경비율 (2024년 기준)
// 출처: 국세청 기준경비율/단순경비율 고시
const simpleExpenseRates = {
  housing: {
    registered: 0.601, // 등록 임대사업자
    unregistered: 0.423 // 미등록
  },
  commercial: {
    registered: 0.351,
    unregistered: 0.351
  }
}

// 도움말 텍스트
const helpTexts = {
  rentalType: '주택임대: 주거용 건물 임대 (아파트, 빌라, 오피스텔 등)\n상가임대: 영업용 건물 임대 (상가, 사무실 등)\n\n주택임대는 연 2,000만원 이하 시 분리과세(14%) 선택 가능',
  isRegistered: '임대사업자로 등록하면 단순경비율이 높아집니다.\n\n• 주택 미등록: 42.3%\n• 주택 등록: 60.1%\n\n경비율이 높을수록 과세표준이 낮아져 세금이 줄어듭니다.',
  annualRentalIncome: '1년간 받은 월세의 총 합계입니다.\n\n예) 월세 100만원 × 12개월 = 1,200만원\n\n보증금은 별도로 간주임대료 항목에 입력하세요.',
  depositIncome: '보증금에서 발생하는 이자 상당액입니다.\n\n3주택 이상 보유 또는 보증금 합계 3억원 초과 시 해당됩니다.\n\n계산: (보증금 합계 - 3억원) × 60% × 정기예금이자율(연 2.1%)',
  expenseMethod: '단순경비율: 수입에 일정 비율을 곱해 경비 계산 (간편)\n\n실제경비: 실제 지출한 경비를 직접 입력 (영수증 필요)\n\n대부분의 임대사업자는 단순경비율이 유리합니다.',
  otherIncome: '임대소득 외에 다른 종합소득이 있으면 입력하세요.\n\n• 근로소득 (연봉에서 비과세 제외)\n• 사업소득\n• 연금소득 등\n\n종합과세 시 합산하여 세율이 결정됩니다.'
}

// 계산 결과
const calculation = computed(() => {
  // 1. 총 임대수입
  const totalIncome = annualRentalIncome.value + depositIncome.value

  // 2. 필요경비 계산
  let expenses = 0
  if (expenseMethod.value === 'simple') {
    const rate = simpleExpenseRates[rentalType.value][isRegistered.value ? 'registered' : 'unregistered']
    expenses = Math.floor(totalIncome * rate)
  } else {
    expenses = necessaryExpenses.value
  }

  // 3. 임대소득금액
  const rentalIncomeAmount = Math.max(0, totalIncome - expenses)

  // 4. 분리과세 vs 종합과세 판단 (주택임대, 2000만원 이하)
  const canSeparateTax = rentalType.value === 'housing' && totalIncome <= 20000000

  // 5-A. 분리과세 계산 (14%)
  let separateTax = 0
  if (canSeparateTax) {
    const basicDeduction = 2000000 // 기본공제 200만원
    const taxableForSeparate = Math.max(0, rentalIncomeAmount - basicDeduction)
    separateTax = Math.floor(taxableForSeparate * 0.14)
  }

  // 5-B. 종합과세 계산
  const totalTaxableIncome = rentalIncomeAmount + otherIncome.value
  const personalDeduction = 1500000 // 기본 인적공제 150만원
  const taxableIncome = Math.max(0, totalTaxableIncome - personalDeduction)

  let comprehensiveTax = 0
  for (const bracket of taxBrackets) {
    if (taxableIncome > bracket.min) {
      comprehensiveTax = Math.floor(taxableIncome * bracket.rate - bracket.deduction)
    }
  }

  // 6. 유리한 과세 방식 선택
  const recommendedMethod = canSeparateTax && separateTax < comprehensiveTax ? 'separate' : 'comprehensive'
  const finalTax = recommendedMethod === 'separate' ? separateTax : comprehensiveTax

  return {
    totalIncome,
    expenses,
    expenseRate: expenseMethod.value === 'simple'
      ? simpleExpenseRates[rentalType.value][isRegistered.value ? 'registered' : 'unregistered']
      : null,
    rentalIncomeAmount,
    canSeparateTax,
    separateTax,
    comprehensiveTax,
    taxableIncome,
    recommendedMethod,
    finalTax,
    effectiveRate: totalIncome > 0 ? (finalTax / totalIncome * 100).toFixed(2) : '0'
  }
})

const formatNumber = (num: number) => {
  return num.toLocaleString('ko-KR')
}

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
      <h1><i class="pi pi-wallet" /> 임대소득세 계산기</h1>
      <p class="page-description">주택 및 상가 임대소득에 대한 종합소득세를 계산합니다</p>
    </header>

    <div class="calculator-layout">
      <!-- Input Section -->
      <Card class="input-section">
        <template #title>
          <i class="pi pi-pencil" /> 소득 정보 입력
        </template>
        <template #content>
          <!-- 임대 유형 -->
          <div class="form-group">
            <label class="form-label">
              임대 유형
              <HelpToggle :text="helpTexts.rentalType" />
            </label>
            <SelectButton
              v-model="rentalType"
              :options="[
                { label: '주택 임대', value: 'housing' },
                { label: '상가 임대', value: 'commercial' }
              ]"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <!-- 임대사업자 등록 여부 -->
          <div class="form-group">
            <label class="form-label">
              임대사업자 등록
              <HelpToggle :text="helpTexts.isRegistered" />
            </label>
            <div class="checkbox-group">
              <Checkbox v-model="isRegistered" :binary="true" inputId="registered" />
              <label for="registered">등록 임대사업자입니다</label>
            </div>
          </div>

          <Divider />

          <!-- 연 임대수입 -->
          <div class="form-group">
            <label class="form-label">
              연 임대수입 (월세 합계)
              <HelpToggle :text="helpTexts.annualRentalIncome" />
            </label>
            <InputNumber
              v-model="annualRentalIncome"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              class="w-full"
              placeholder="예: 12,000,000"
            />
            <small class="form-hint">월세 100만원 × 12개월 = 1,200만원</small>
          </div>

          <!-- 간주임대료 -->
          <div class="form-group">
            <label class="form-label">
              간주임대료 (보증금 이자)
              <HelpToggle :text="helpTexts.depositIncome" />
            </label>
            <InputNumber
              v-model="depositIncome"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              class="w-full"
              placeholder="해당 없으면 0"
            />
          </div>

          <Divider />

          <!-- 경비 산정 방법 -->
          <div class="form-group">
            <label class="form-label">
              필요경비 산정 방법
              <HelpToggle :text="helpTexts.expenseMethod" />
            </label>
            <SelectButton
              v-model="expenseMethod"
              :options="[
                { label: '단순경비율', value: 'simple' },
                { label: '실제경비', value: 'actual' }
              ]"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <!-- 실제 경비 입력 (실제경비 선택 시) -->
          <div v-if="expenseMethod === 'actual'" class="form-group">
            <label class="form-label">필요경비 합계</label>
            <InputNumber
              v-model="necessaryExpenses"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              class="w-full"
            />
            <small class="form-hint">재산세, 감가상각비, 수선비, 대출이자, 보험료, 관리비 등</small>
          </div>

          <Divider />

          <!-- 기타 종합소득 -->
          <div class="form-group">
            <label class="form-label">
              기타 종합소득 (연간)
              <HelpToggle :text="helpTexts.otherIncome" />
            </label>
            <InputNumber
              v-model="otherIncome"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              class="w-full"
              placeholder="없으면 0"
            />
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
              <!-- Step 1: 총 수입 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <span class="step-title">총 임대수입</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row">
                    <span>연 임대수입</span>
                    <span>{{ formatCurrency(annualRentalIncome) }}</span>
                  </div>
                  <div class="calc-row">
                    <span>+ 간주임대료</span>
                    <span>{{ formatCurrency(depositIncome) }}</span>
                  </div>
                  <div class="calc-row result">
                    <span>= 총 임대수입</span>
                    <span>{{ formatCurrency(calculation.totalIncome) }}</span>
                  </div>
                </div>
              </div>

              <!-- Step 2: 필요경비 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <span class="step-title">필요경비</span>
                </div>
                <div class="step-detail">
                  <div v-if="expenseMethod === 'simple'" class="calc-row">
                    <span>
                      단순경비율 적용
                      <Tag :value="`${(calculation.expenseRate! * 100).toFixed(1)}%`" severity="info" size="small" />
                    </span>
                    <span>{{ formatCurrency(calculation.expenses) }}</span>
                  </div>
                  <div v-else class="calc-row">
                    <span>실제 필요경비</span>
                    <span>{{ formatCurrency(calculation.expenses) }}</span>
                  </div>
                </div>
              </div>

              <!-- Step 3: 임대소득금액 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <span class="step-title">임대소득금액</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row">
                    <span>총 임대수입 - 필요경비</span>
                    <span class="highlight">{{ formatCurrency(calculation.rentalIncomeAmount) }}</span>
                  </div>
                </div>
              </div>

              <!-- Step 4: 세금 계산 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <span class="step-title">세금 계산</span>
                </div>
                <div class="step-detail">
                  <!-- 분리과세 가능 시 -->
                  <template v-if="calculation.canSeparateTax">
                    <div class="tax-option">
                      <div class="option-header">
                        <Tag value="분리과세" :severity="calculation.recommendedMethod === 'separate' ? 'success' : 'secondary'" />
                        <span v-if="calculation.recommendedMethod === 'separate'" class="recommended">추천</span>
                      </div>
                      <div class="calc-row sub">
                        <span>임대소득금액 - 기본공제(200만원)</span>
                        <span>{{ formatCurrency(Math.max(0, calculation.rentalIncomeAmount - 2000000)) }}</span>
                      </div>
                      <div class="calc-row sub">
                        <span>× 세율 14%</span>
                        <span class="highlight">{{ formatCurrency(calculation.separateTax) }}</span>
                      </div>
                    </div>
                  </template>

                  <div class="tax-option">
                    <div class="option-header">
                      <Tag value="종합과세" :severity="calculation.recommendedMethod === 'comprehensive' ? 'success' : 'secondary'" />
                      <span v-if="calculation.recommendedMethod === 'comprehensive'" class="recommended">추천</span>
                    </div>
                    <div class="calc-row sub">
                      <span>임대소득 + 기타소득 - 인적공제</span>
                      <span>{{ formatCurrency(calculation.taxableIncome) }}</span>
                    </div>
                    <div class="calc-row sub">
                      <span>× 종합소득세율 (6~45%)</span>
                      <span class="highlight">{{ formatCurrency(calculation.comprehensiveTax) }}</span>
                    </div>
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
              <div class="result-label">예상 임대소득세</div>
              <div class="result-amount">{{ formatCurrency(calculation.finalTax) }}</div>
              <div class="result-meta">
                <Tag
                  :value="calculation.recommendedMethod === 'separate' ? '분리과세' : '종합과세'"
                  severity="info"
                />
                <span class="effective-rate">실효세율 {{ calculation.effectiveRate }}%</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- 참고사항 -->
        <Message severity="warn" :closable="false" class="notice">
          <ul class="notice-list">
            <li>본 계산은 참고용이며, 실제 세금은 다를 수 있습니다</li>
            <li>지방소득세(10%)가 별도 부과됩니다</li>
            <li>정확한 세금 계산은 세무사와 상담하세요</li>
          </ul>
        </Message>
      </div>
    </div>

    <!-- 세율표 및 출처 -->
    <Card class="reference-card">
      <template #title>
        <i class="pi pi-table" /> 2024년 종합소득세율표
      </template>
      <template #content>
        <DataTable :value="taxBrackets" size="small" class="rate-table">
          <Column header="과세표준">
            <template #body="{ data }">
              {{ formatNumber(data.min) }}원 ~ {{ data.max === Infinity ? '' : formatNumber(data.max) + '원' }}
            </template>
          </Column>
          <Column field="rate" header="세율">
            <template #body="{ data }">
              {{ (data.rate * 100) }}%
            </template>
          </Column>
          <Column field="deduction" header="누진공제">
            <template #body="{ data }">
              {{ formatCurrency(data.deduction) }}
            </template>
          </Column>
        </DataTable>

        <div class="source-info">
          <p><strong>출처:</strong></p>
          <ul>
            <li>
              <a href="https://www.nts.go.kr" target="_blank" rel="noopener">국세청</a> - 종합소득세율표
            </li>
            <li>
              <a href="https://www.law.go.kr/법령/소득세법" target="_blank" rel="noopener">국가법령정보센터</a> - 소득세법
            </li>
            <li>
              <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2372&cntntsId=7693" target="_blank" rel="noopener">국세청</a> - 단순경비율 고시
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
  color: var(--p-blue-500);
}

.page-description {
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
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

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group label {
  font-size: 0.9rem;
  cursor: pointer;
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
  background: var(--p-primary-color);
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

.calc-row.sub {
  padding-left: 0.5rem;
  color: var(--p-text-muted-color);
}

.calc-row .highlight {
  font-weight: 600;
  color: var(--p-primary-color);
}

.tax-option {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.recommended {
  font-size: 0.75rem;
  color: var(--p-green-500);
  font-weight: 600;
}

/* Final Result */
.final-result-card {
  background: linear-gradient(135deg, var(--p-primary-color), var(--p-primary-400));
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

.rate-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.source-info {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-200);
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
