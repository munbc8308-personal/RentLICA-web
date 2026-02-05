<script setup lang="ts">
useHead({
  title: '종합부동산세 계산 - RentLICA'
})

// 입력값
const propertyType = ref<'housing' | 'land'>('housing')
const householdType = ref<'single' | 'multi'>('multi') // 1세대1주택 여부
const totalPublicPrice = ref<number>(0) // 공시가격 합계
const fairMarketRatio = ref<number>(60) // 공정시장가액비율 (2024년 60%)
const ageDeduction = ref<number>(0) // 고령자 공제율 (%)
const holdingYears = ref<number>(0) // 보유기간 (년)
const numberOfHouses = ref<number>(1) // 주택 수

// 2024년 종부세율 (주택) - 출처: 종합부동산세법
const housingTaxRates = {
  '2house': [ // 2주택 이하
    { min: 0, max: 300000000, rate: 0.005 },
    { min: 300000000, max: 600000000, rate: 0.007 },
    { min: 600000000, max: 1200000000, rate: 0.01 },
    { min: 1200000000, max: 2500000000, rate: 0.013 },
    { min: 2500000000, max: 5000000000, rate: 0.02 },
    { min: 5000000000, max: Infinity, rate: 0.027 }
  ],
  '3house': [ // 3주택 이상 또는 조정대상지역 2주택
    { min: 0, max: 300000000, rate: 0.012 },
    { min: 300000000, max: 600000000, rate: 0.016 },
    { min: 600000000, max: 1200000000, rate: 0.022 },
    { min: 1200000000, max: 2500000000, rate: 0.036 },
    { min: 2500000000, max: 5000000000, rate: 0.05 },
    { min: 5000000000, max: Infinity, rate: 0.06 }
  ]
}

// 도움말 텍스트
const helpTexts = {
  propertyType: '주택: 아파트, 빌라, 단독주택, 오피스텔(주거용) 등\n토지: 별도합산토지, 종합합산토지\n\n주택과 토지는 별도로 계산하며 기본공제와 세율이 다릅니다.',
  householdType: '1세대 1주택: 세대원 전원이 1주택만 보유\n\n혜택:\n• 기본공제 12억원 (다주택 9억원)\n• 고령자 공제 (60세↑ 10~30%)\n• 장기보유 공제 (5년↑ 20~50%)\n• 공제 합산 최대 80%',
  numberOfHouses: '3주택 이상 보유 시 중과세율이 적용됩니다.\n\n• 2주택 이하: 0.5% ~ 2.7%\n• 3주택 이상: 1.2% ~ 6.0%\n\n조정대상지역 2주택도 중과세율 적용',
  totalPublicPrice: '보유한 모든 주택(토지)의 공시가격 합계입니다.\n\n공시가격 확인:\n부동산공시가격알리미 (realtyprice.kr)\n\n매년 1월 1일 기준 공시가격으로 계산',
  fairMarketRatio: '공시가격에 적용하는 비율입니다.\n\n2024년 기준: 60%\n\n정부 정책에 따라 매년 변동될 수 있습니다.\n(2023년 60% → 2024년 60%)',
  ageDeduction: '1세대 1주택자 중 고령자에게 적용되는 공제입니다.\n\n• 60세 이상: 10%\n• 65세 이상: 20%\n• 70세 이상: 30%\n\n기준일: 과세기준일(6.1) 현재 연령',
  holdingYears: '1세대 1주택자의 장기보유 공제입니다.\n\n• 5년 이상: 20%\n• 10년 이상: 40%\n• 15년 이상: 50%\n\n고령자공제 + 장기보유공제 합산 최대 80%'
}

// 기본공제금액
const basicDeductions = computed(() => {
  if (propertyType.value === 'housing') {
    return householdType.value === 'single' ? 1200000000 : 900000000 // 12억 / 9억 (2024년 기준)
  }
  return 500000000 // 토지 5억
})

// 보유기간별 공제율
const getHoldingDeduction = (years: number) => {
  if (years >= 15) return 0.5
  if (years >= 10) return 0.4
  if (years >= 5) return 0.2
  return 0
}

// 계산 결과
const calculation = computed(() => {
  // 1. 공시가격 합계
  const totalPrice = totalPublicPrice.value

  // 2. 기본공제
  const deduction = basicDeductions.value

  // 3. 과세표준 계산
  const taxBase = Math.max(0, totalPrice - deduction)

  // 4. 공정시장가액비율 적용
  const adjustedTaxBase = Math.floor(taxBase * (fairMarketRatio.value / 100))

  // 5. 세율 적용
  const rates = numberOfHouses.value >= 3 ? housingTaxRates['3house'] : housingTaxRates['2house']
  let tax = 0
  let appliedRate = 0

  if (propertyType.value === 'housing') {
    for (const bracket of rates) {
      if (adjustedTaxBase > bracket.min) {
        const taxableInBracket = Math.min(adjustedTaxBase, bracket.max) - bracket.min
        tax += taxableInBracket * bracket.rate
        appliedRate = bracket.rate
      }
    }
  }
  tax = Math.floor(tax)

  // 6. 세액공제 (1세대1주택)
  let deductionAmount = 0
  if (householdType.value === 'single' && propertyType.value === 'housing') {
    // 고령자 공제
    const ageDeductionAmount = Math.floor(tax * (ageDeduction.value / 100))

    // 장기보유 공제
    const holdingDeductionRate = getHoldingDeduction(holdingYears.value)
    const holdingDeductionAmount = Math.floor(tax * holdingDeductionRate)

    // 합산 공제 (최대 80%)
    deductionAmount = Math.min(ageDeductionAmount + holdingDeductionAmount, Math.floor(tax * 0.8))
  }

  // 7. 최종 세액
  const finalTax = Math.max(0, tax - deductionAmount)

  // 8. 농어촌특별세 (종부세의 20%)
  const ruralTax = Math.floor(finalTax * 0.2)

  // 9. 총 납부세액
  const totalTax = finalTax + ruralTax

  return {
    totalPrice,
    basicDeduction: deduction,
    taxBase,
    fairMarketRatio: fairMarketRatio.value,
    adjustedTaxBase,
    appliedRate: (appliedRate * 100).toFixed(1),
    grossTax: tax,
    ageDeductionAmount: householdType.value === 'single' ? Math.floor(tax * (ageDeduction.value / 100)) : 0,
    holdingDeductionRate: getHoldingDeduction(holdingYears.value) * 100,
    holdingDeductionAmount: householdType.value === 'single' ? Math.floor(tax * getHoldingDeduction(holdingYears.value)) : 0,
    totalDeduction: deductionAmount,
    finalTax,
    ruralTax,
    totalTax
  }
})

const formatNumber = (num: number) => {
  return num.toLocaleString('ko-KR')
}

const formatCurrency = (num: number) => {
  return num.toLocaleString('ko-KR') + '원'
}

// 억 단위 표시
const formatBillion = (num: number) => {
  if (num >= 100000000) {
    const billion = num / 100000000
    return `${billion.toFixed(1)}억원`
  }
  return formatCurrency(num)
}
</script>

<template>
  <div class="tax-calculator-page">
    <!-- Header -->
    <header class="page-header">
      <NuxtLink to="/tax" class="back-link">
        <i class="pi pi-arrow-left" /> 세무 정보
      </NuxtLink>
      <h1><i class="pi pi-building" /> 종합부동산세 계산기</h1>
      <p class="page-description">보유 부동산에 대한 종합부동산세를 계산합니다</p>
    </header>

    <div class="calculator-layout">
      <!-- Input Section -->
      <Card class="input-section">
        <template #title>
          <i class="pi pi-pencil" /> 부동산 정보 입력
        </template>
        <template #content>
          <!-- 부동산 유형 -->
          <div class="form-group">
            <label class="form-label">
              부동산 유형
              <HelpToggle :text="helpTexts.propertyType" />
            </label>
            <SelectButton
              v-model="propertyType"
              :options="[
                { label: '주택', value: 'housing' },
                { label: '토지', value: 'land' }
              ]"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <!-- 1세대1주택 여부 (주택 선택 시) -->
          <div v-if="propertyType === 'housing'" class="form-group">
            <label class="form-label">
              세대 유형
              <HelpToggle :text="helpTexts.householdType" />
            </label>
            <SelectButton
              v-model="householdType"
              :options="[
                { label: '1세대 1주택', value: 'single' },
                { label: '다주택', value: 'multi' }
              ]"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <!-- 주택 수 (다주택 선택 시) -->
          <div v-if="propertyType === 'housing' && householdType === 'multi'" class="form-group">
            <label class="form-label">
              보유 주택 수
              <HelpToggle :text="helpTexts.numberOfHouses" />
            </label>
            <InputNumber
              v-model="numberOfHouses"
              :min="2"
              :max="100"
              showButtons
              class="w-full"
            />
          </div>

          <Divider />

          <!-- 공시가격 합계 -->
          <div class="form-group">
            <label class="form-label">
              공시가격 합계
              <HelpToggle :text="helpTexts.totalPublicPrice" />
            </label>
            <InputNumber
              v-model="totalPublicPrice"
              mode="currency"
              currency="KRW"
              locale="ko-KR"
              :min="0"
              :step="100000000"
              class="w-full"
              placeholder="예: 1,500,000,000"
            />
            <small class="form-hint">
              <a href="https://www.realtyprice.kr" target="_blank" rel="noopener">부동산공시가격알리미</a>에서 확인
            </small>
          </div>

          <!-- 공정시장가액비율 -->
          <div class="form-group">
            <label class="form-label">
              공정시장가액비율
              <HelpToggle :text="helpTexts.fairMarketRatio" />
            </label>
            <div class="slider-group">
              <Slider v-model="fairMarketRatio" :min="40" :max="100" :step="5" class="slider" />
              <span class="slider-value">{{ fairMarketRatio }}%</span>
            </div>
          </div>

          <!-- 1세대1주택 추가 공제 (해당 시) -->
          <template v-if="propertyType === 'housing' && householdType === 'single'">
            <Divider />
            <div class="form-group">
              <label class="form-label">
                고령자 공제율
                <HelpToggle :text="helpTexts.ageDeduction" />
              </label>
              <SelectButton
                v-model="ageDeduction"
                :options="[
                  { label: '해당없음', value: 0 },
                  { label: '60세↑ (10%)', value: 10 },
                  { label: '65세↑ (20%)', value: 20 },
                  { label: '70세↑ (30%)', value: 30 }
                ]"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                보유기간 (년)
                <HelpToggle :text="helpTexts.holdingYears" />
              </label>
              <InputNumber
                v-model="holdingYears"
                :min="0"
                :max="50"
                showButtons
                suffix=" 년"
                class="w-full"
              />
              <small class="form-hint">
                장기보유공제: {{ calculation.holdingDeductionRate }}% 적용
              </small>
            </div>
          </template>
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
              <!-- Step 1: 공시가격 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <span class="step-title">공시가격 합계</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row result">
                    <span>보유 부동산 공시가격</span>
                    <span>{{ formatBillion(calculation.totalPrice) }}</span>
                  </div>
                </div>
              </div>

              <!-- Step 2: 기본공제 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <span class="step-title">기본공제</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row">
                    <span>
                      {{ propertyType === 'housing' ? (householdType === 'single' ? '1세대1주택' : '다주택') : '토지' }} 공제
                    </span>
                    <span>-{{ formatBillion(calculation.basicDeduction) }}</span>
                  </div>
                </div>
              </div>

              <!-- Step 3: 과세표준 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <span class="step-title">과세표준</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row">
                    <span>공시가격 - 기본공제</span>
                    <span>{{ formatBillion(calculation.taxBase) }}</span>
                  </div>
                  <div class="calc-row">
                    <span>× 공정시장가액비율 {{ calculation.fairMarketRatio }}%</span>
                    <span class="highlight">{{ formatBillion(calculation.adjustedTaxBase) }}</span>
                  </div>
                </div>
              </div>

              <!-- Step 4: 세액 계산 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <span class="step-title">종부세액 계산</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row">
                    <span>
                      적용세율
                      <Tag :value="`${calculation.appliedRate}%`" severity="info" size="small" />
                    </span>
                    <span>{{ formatCurrency(calculation.grossTax) }}</span>
                  </div>

                  <!-- 세액공제 (1세대1주택) -->
                  <template v-if="householdType === 'single' && propertyType === 'housing'">
                    <div v-if="calculation.ageDeductionAmount > 0" class="calc-row sub">
                      <span>고령자 공제 ({{ ageDeduction }}%)</span>
                      <span>-{{ formatCurrency(calculation.ageDeductionAmount) }}</span>
                    </div>
                    <div v-if="calculation.holdingDeductionAmount > 0" class="calc-row sub">
                      <span>장기보유 공제 ({{ calculation.holdingDeductionRate }}%)</span>
                      <span>-{{ formatCurrency(calculation.holdingDeductionAmount) }}</span>
                    </div>
                    <div v-if="calculation.totalDeduction > 0" class="calc-row result">
                      <span>공제 후 종부세</span>
                      <span>{{ formatCurrency(calculation.finalTax) }}</span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Step 5: 농특세 -->
              <div class="calc-step">
                <div class="step-header">
                  <span class="step-number">5</span>
                  <span class="step-title">농어촌특별세</span>
                </div>
                <div class="step-detail">
                  <div class="calc-row">
                    <span>종부세 × 20%</span>
                    <span>{{ formatCurrency(calculation.ruralTax) }}</span>
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
              <div class="result-label">예상 종합부동산세</div>
              <div class="result-amount">{{ formatCurrency(calculation.totalTax) }}</div>
              <div class="result-breakdown">
                <span>종부세 {{ formatCurrency(calculation.finalTax) }}</span>
                <span>+</span>
                <span>농특세 {{ formatCurrency(calculation.ruralTax) }}</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- 참고사항 -->
        <Message severity="info" :closable="false" class="notice">
          <ul class="notice-list">
            <li>납부기한: 매년 12월 1일 ~ 15일</li>
            <li>세액 250만원 초과 시 분납 가능</li>
            <li>재산세와 중복분은 공제됩니다</li>
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
          <p><strong>적용 기준:</strong> 2024년 종합부동산세법</p>
          <ul>
            <li>
              <a href="https://www.law.go.kr/법령/종합부동산세법" target="_blank" rel="noopener">국가법령정보센터</a> - 종합부동산세법
            </li>
            <li>
              <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2353&cntntsId=7736" target="_blank" rel="noopener">국세청</a> - 종합부동산세 안내
            </li>
            <li>
              <a href="https://www.realtyprice.kr" target="_blank" rel="noopener">부동산공시가격알리미</a> - 공시가격 조회
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
  color: var(--p-green-500);
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

.form-hint a {
  color: var(--p-primary-color);
}

.w-full {
  width: 100%;
}

.slider-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
}

.slider-value {
  min-width: 3rem;
  text-align: right;
  font-weight: 600;
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
  background: var(--p-green-500);
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
  color: var(--p-green-600);
}

/* Final Result */
.final-result-card {
  background: linear-gradient(135deg, var(--p-green-500), var(--p-green-400));
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
  margin-bottom: 0.5rem;
}

.result-breakdown {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
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
