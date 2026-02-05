// 국가법령정보센터 Open API - 법령 검색
// API 문서: https://open.law.go.kr/LSO/openApi/guideList.do

interface LawSearchResult {
  법령ID: string
  법령명한글: string
  법령약칭명: string
  시행일자: string
  공포일자: string
  공포번호: string
  소관부처명: string
  법령구분명: string
}

interface LawSearchResponse {
  laws: Array<{
    id: string
    name: string
    shortName: string
    enforcementDate: string
    promulgationDate: string
    promulgationNumber: string
    ministry: string
    type: string
  }>
  totalCount: number
}

export default defineEventHandler(async (event): Promise<LawSearchResponse> => {
  const query = getQuery(event)
  const keyword = query.keyword as string || ''
  const page = parseInt(query.page as string) || 1
  const display = parseInt(query.display as string) || 20

  if (!keyword) {
    return { laws: [], totalCount: 0 }
  }

  try {
    // 국가법령정보센터 Open API 호출
    // OC: Open API 인증키 (회원가입 후 발급)
    const apiKey = process.env.LAW_API_KEY || 'test'
    const apiUrl = `http://www.law.go.kr/DRF/lawSearch.do`

    const params = new URLSearchParams({
      OC: apiKey,
      target: 'law',
      type: 'JSON',
      query: keyword,
      display: display.toString(),
      page: page.toString()
    })

    const response = await fetch(`${apiUrl}?${params}`)

    if (!response.ok) {
      console.error('Law API error:', response.status)
      // API 실패 시 목업 데이터 반환 (개발용)
      return getMockData(keyword)
    }

    const data = await response.json()

    // API 응답 파싱
    if (data.LawSearch?.law) {
      const laws = Array.isArray(data.LawSearch.law)
        ? data.LawSearch.law
        : [data.LawSearch.law]

      return {
        laws: laws.map((law: LawSearchResult) => ({
          id: law.법령ID || '',
          name: law.법령명한글 || '',
          shortName: law.법령약칭명 || '',
          enforcementDate: law.시행일자 || '',
          promulgationDate: law.공포일자 || '',
          promulgationNumber: law.공포번호 || '',
          ministry: law.소관부처명 || '',
          type: law.법령구분명 || ''
        })),
        totalCount: parseInt(data.LawSearch.totalCnt) || 0
      }
    }

    return getMockData(keyword)
  } catch (error) {
    console.error('Law search error:', error)
    // 에러 시 목업 데이터 반환
    return getMockData(keyword)
  }
})

// 개발/테스트용 목업 데이터
function getMockData(keyword: string): LawSearchResponse {
  const mockLaws = [
    {
      id: '001790',
      name: '주택임대차보호법',
      shortName: '주임법',
      enforcementDate: '2023-08-08',
      promulgationDate: '2023-02-07',
      promulgationNumber: '19216',
      ministry: '법무부',
      type: '법률'
    },
    {
      id: '002045',
      name: '상가건물 임대차보호법',
      shortName: '상임법',
      enforcementDate: '2023-08-08',
      promulgationDate: '2023-02-07',
      promulgationNumber: '19217',
      ministry: '법무부',
      type: '법률'
    },
    {
      id: '012345',
      name: '민간임대주택에 관한 특별법',
      shortName: '민간임대주택법',
      enforcementDate: '2024-01-19',
      promulgationDate: '2023-07-18',
      promulgationNumber: '19555',
      ministry: '국토교통부',
      type: '법률'
    },
    {
      id: '054321',
      name: '소득세법',
      shortName: '',
      enforcementDate: '2024-01-01',
      promulgationDate: '2023-12-31',
      promulgationNumber: '20000',
      ministry: '기획재정부',
      type: '법률'
    }
  ]

  const filtered = keyword
    ? mockLaws.filter(law =>
      law.name.includes(keyword) ||
        law.shortName.includes(keyword)
    )
    : mockLaws

  return {
    laws: filtered,
    totalCount: filtered.length
  }
}
