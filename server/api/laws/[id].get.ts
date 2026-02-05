// 국가법령정보센터 Open API - 법령 상세 조회
// API 문서: https://open.law.go.kr/LSO/openApi/guideResult.do

interface LawArticle {
  조문번호: string
  조문제목: string
  조문내용: string
}

interface LawDetailResponse {
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

export default defineEventHandler(async (event): Promise<LawDetailResponse> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Law ID is required'
    })
  }

  try {
    const apiKey = process.env.LAW_API_KEY || 'test'
    const apiUrl = `http://www.law.go.kr/DRF/lawService.do`

    const params = new URLSearchParams({
      OC: apiKey,
      target: 'law',
      type: 'JSON',
      ID: id
    })

    const response = await fetch(`${apiUrl}?${params}`)

    if (!response.ok) {
      console.error('Law detail API error:', response.status)
      return getMockLawDetail(id)
    }

    const data = await response.json()

    if (data.법령?.기본정보) {
      const info = data.법령.기본정보
      const articles = data.법령.조문?.조문단위 || []

      return {
        id: id,
        name: info.법령명한글 || '',
        shortName: info.법령약칭명 || '',
        type: info.법령구분명 || '',
        ministry: info.소관부처명 || '',
        enforcementDate: info.시행일자 || '',
        promulgationDate: info.공포일자 || '',
        promulgationNumber: info.공포번호 || '',
        articles: Array.isArray(articles)
          ? articles.map((art: LawArticle) => ({
            number: art.조문번호 || '',
            title: art.조문제목 || '',
            content: art.조문내용 || ''
          }))
          : [],
        source: '국가법령정보센터',
        sourceUrl: `https://www.law.go.kr/법령/${encodeURIComponent(info.법령명한글 || '')}`
      }
    }

    return getMockLawDetail(id)
  } catch (error) {
    console.error('Law detail error:', error)
    return getMockLawDetail(id)
  }
})

// 개발/테스트용 목업 데이터
function getMockLawDetail(id: string): LawDetailResponse {
  const mockData: Record<string, LawDetailResponse> = {
    'housing': {
      id: 'housing',
      name: '주택임대차보호법',
      shortName: '주임법',
      type: '법률',
      ministry: '법무부',
      enforcementDate: '2023-08-08',
      promulgationDate: '2023-02-07',
      promulgationNumber: '제19216호',
      articles: [
        {
          number: '제1조',
          title: '목적',
          content: '이 법은 주거용 건물의 임대차(賃貸借)에 관하여 「민법」에 대한 특례를 규정함으로써 국민 주거생활의 안정을 보장함을 목적으로 한다.'
        },
        {
          number: '제2조',
          title: '적용범위',
          content: '이 법은 주거용 건물(이하 "주택"이라 한다)의 전부 또는 일부의 임대차에 관하여 적용한다. 그 임차주택(賃借住宅)의 일부가 주거 외의 목적으로 사용되는 경우에도 또한 같다.'
        },
        {
          number: '제3조',
          title: '대항력 등',
          content: '① 임대차는 그 등기가 없는 경우에도 임차인(賃借人)이 주택의 인도(引渡)와 주민등록을 마친 때에는 그 다음 날부터 제삼자에 대하여 효력이 생긴다. 이 경우 전입신고를 한 때에 주민등록이 된 것으로 본다.\n② 임차주택의 양수인(讓受人)(그 밖에 임대할 권리를 승계한 자를 포함한다)은 임대인(賃貸人)의 지위를 승계한 것으로 본다.'
        },
        {
          number: '제3조의2',
          title: '보증금의 회수',
          content: '① 제3조제1항, 제2항 또는 제3항의 대항요건(對抗要件)과 임대차계약증서(제3조제2항 및 제3항의 경우에는 법인과 임대인 사이의 임대차계약증서를 말한다)상의 확정일자(確定日字)를 갖춘 임차인은 「민사집행법」에 따른 경매 또는 「국세징수법」에 따른 공매(公賣)를 할 때에 임차주택(대지를 포함한다)의 환가대금(換價代金)에서 후순위권리자(後順位權利者)나 그 밖의 채권자보다 우선하여 보증금을 변제(辨濟)받을 권리가 있다.'
        },
        {
          number: '제6조',
          title: '계약의 갱신',
          content: '① 임대인이 임대차기간이 끝나기 6개월 전부터 2개월 전까지의 기간에 임차인에게 갱신거절(更新拒絶)의 통지를 하지 아니하거나 계약조건을 변경하지 아니하면 갱신하지 아니한다는 뜻의 통지를 하지 아니한 경우에는 그 기간이 끝난 때에 전 임대차와 동일한 조건으로 다시 임대차한 것으로 본다.'
        },
        {
          number: '제6조의3',
          title: '계약갱신 요구 등',
          content: '① 제6조에도 불구하고 임대인은 임차인이 제6조제1항 전단의 기간 이내에 계약갱신을 요구할 경우 정당한 사유 없이 거절하지 못한다. 다만, 다음 각 호의 어느 하나에 해당하는 경우에는 그러하지 아니하다.'
        },
        {
          number: '제7조',
          title: '차임 등의 증감청구권',
          content: '① 당사자는 약정한 차임이나 보증금이 임차주택에 관한 조세, 공과금, 그 밖의 부담의 증감이나 경제사정의 변동으로 인하여 적절하지 아니하게 된 때에는 장래에 대하여 그 증감을 청구할 수 있다.\n② 제1항에 따른 증액청구는 임대차계약 또는 약정한 차임이나 보증금의 증액이 있은 후 1년 이내에는 하지 못한다.'
        }
      ],
      source: '국가법령정보센터',
      sourceUrl: 'https://www.law.go.kr/법령/주택임대차보호법'
    },
    'commercial': {
      id: 'commercial',
      name: '상가건물 임대차보호법',
      shortName: '상임법',
      type: '법률',
      ministry: '법무부',
      enforcementDate: '2023-08-08',
      promulgationDate: '2023-02-07',
      promulgationNumber: '제19217호',
      articles: [
        {
          number: '제1조',
          title: '목적',
          content: '이 법은 상가건물 임대차에 관하여 「민법」에 대한 특례를 규정하여 국민 경제생활의 안정을 보장함을 목적으로 한다.'
        },
        {
          number: '제2조',
          title: '적용범위',
          content: '① 이 법은 상가건물(제3조제1항에 따른 사업자등록의 대상이 되는 건물을 말한다)의 임대차(임대차 목적물의 주된 부분을 영업용으로 사용하는 경우를 포함한다)에 대하여 적용한다.'
        },
        {
          number: '제10조',
          title: '계약갱신 요구 등',
          content: '① 임대인은 임차인이 임대차기간이 만료되기 6개월 전부터 1개월 전까지 사이에 계약갱신을 요구할 경우 정당한 사유 없이 거절하지 못한다.\n② 임차인의 계약갱신요구권은 최초의 임대차기간을 포함한 전체 임대차기간이 10년을 초과하지 아니하는 범위에서만 행사할 수 있다.'
        },
        {
          number: '제10조의4',
          title: '권리금 정의',
          content: '이 법에서 "권리금"이란 임대차 목적물인 상가건물에서 영업을 하는 자 또는 영업을 하려는 자가 영업시설·비품, 거래처, 신용, 영업상의 노하우, 상가건물의 위치에 따른 영업상의 이점 등 유형·무형의 재산적 가치의 양도 또는 이용대가로서 임대인, 임차인에게 보증금과 차임 이외에 지급하는 금전 등의 대가를 말한다.'
        },
        {
          number: '제10조의5',
          title: '권리금 회수기회 보호 등',
          content: '① 임대인은 임대차기간이 끝나기 6개월 전부터 임대차 종료 시까지 다음 각 호의 어느 하나에 해당하는 행위를 함으로써 권리금 계약에 따라 임차인이 주선한 신규임차인이 되려는 자로부터 권리금을 지급받는 것을 방해하여서는 아니 된다.'
        },
        {
          number: '제11조',
          title: '차임 등의 증감청구권',
          content: '① 차임 또는 보증금이 임차건물에 관한 조세, 공과금, 그 밖의 부담의 증감이나 경제사정의 변동으로 인하여 상당하지 아니하게 된 경우에는 당사자는 장래의 차임 또는 보증금에 대하여 증감을 청구할 수 있다.\n② 제1항에 따른 증액청구는 임대차계약 또는 약정한 차임 등의 증액이 있은 후 1년 이내에는 하지 못한다. 다만, 증액의 범위는 청구 당시의 차임 또는 보증금의 100분의 5를 초과하지 못한다.'
        }
      ],
      source: '국가법령정보센터',
      sourceUrl: 'https://www.law.go.kr/법령/상가건물임대차보호법'
    },
    'rental-business': {
      id: 'rental-business',
      name: '민간임대주택에 관한 특별법',
      shortName: '민간임대주택법',
      type: '법률',
      ministry: '국토교통부',
      enforcementDate: '2024-01-19',
      promulgationDate: '2023-07-18',
      promulgationNumber: '제19555호',
      articles: [
        {
          number: '제1조',
          title: '목적',
          content: '이 법은 민간임대주택의 건설·공급 및 관리와 민간 주택임대사업자 육성 등에 관한 사항을 정함으로써 민간임대주택의 공급을 촉진하고 국민의 주거생활을 안정시키는 것을 목적으로 한다.'
        },
        {
          number: '제5조',
          title: '임대사업자 등록',
          content: '① 주택을 임대하려는 자(이 법 또는 다른 법률에 따라 주택을 건설하여 임대하는 자를 포함한다)는 특별자치시장·특별자치도지사·시장·군수 또는 구청장(자치구의 구청장을 말한다)에게 등록을 신청할 수 있다.'
        },
        {
          number: '제42조',
          title: '민간임대주택의 임대의무기간',
          content: '① 임대사업자는 민간임대주택을 임대의무기간 동안 계속 임대하여야 한다.\n② 제1항에 따른 임대의무기간은 다음 각 호의 구분에 따른다.\n1. 단기민간임대주택: 4년\n2. 장기일반민간임대주택: 10년'
        },
        {
          number: '제44조',
          title: '임대료의 증액',
          content: '① 임대사업자는 임대료의 증액을 청구하는 경우 임대료의 5퍼센트의 범위에서 주거비 물가지수, 인근 지역의 임대료 변동률 등을 고려하여 대통령령으로 정하는 증액비율을 초과하여 증액할 수 없다.\n② 임대사업자는 임대차계약 또는 임대료의 증액이 있은 후 1년 이내에는 임대료를 증액하지 못한다.'
        },
        {
          number: '제49조',
          title: '과태료',
          content: '① 다음 각 호의 어느 하나에 해당하는 자에게는 1천만원 이하의 과태료를 부과한다.\n1. 제5조제2항에 따른 신고를 하지 아니하거나 거짓으로 신고한 자\n2. 제43조를 위반하여 임차인의 자격 및 선정방법 등을 따르지 아니한 자'
        }
      ],
      source: '국가법령정보센터',
      sourceUrl: 'https://www.law.go.kr/법령/민간임대주택에관한특별법'
    }
  }

  return mockData[id] || {
    id: id,
    name: '법령 정보를 찾을 수 없습니다',
    shortName: '',
    type: '',
    ministry: '',
    enforcementDate: '',
    promulgationDate: '',
    promulgationNumber: '',
    articles: [],
    source: '국가법령정보센터',
    sourceUrl: 'https://www.law.go.kr'
  }
}
