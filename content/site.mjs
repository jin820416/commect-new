import { readFileSync } from 'node:fs';
import { legal } from './legal.mjs';

export const company = {
  brand: 'COMMECT', legalName: '㈜코멕트', representative: '김응진', registration: '478-86-03825',
  email: 'sales@commect.ai', phone: '010-4836-5159', internationalPhone: '+82-10-4836-5159',
  address: '인천광역시 남동구 남동대로215번길 30, 인천종합비즈니스센터 711호',
  addressEn: 'Suite 711, Incheon Business Center, 30 Namdong-daero 215beon-gil, Namdong-gu, Incheon, Republic of Korea',
  origin: 'https://www.commect.ai',
};

// Photos: images/photos/ (Unsplash, see images/photos/SOURCES.md).
export const images = {
  home: 'photos/port-sea.jpg',
  homeSourcing: 'photos/sacks-warehouse.jpg',
  homeInfo: 'photos/chart-lines.jpg',
  homeTrust: 'photos/port-topdown.jpg',
  homeExpertise: 'PXL_20221209_082420450-edited-scaled.jpg', // the deployed site's Expertise photo
  sourcing: 'photos/sacks-stack.jpg',
  commercial: 'photos/sack-brasil.jpg',
  specialty: 'photos/drying-canopy.jpg',
  tiles: ['photos/plantation-rows.jpg', 'photos/cupping-dark.jpg', 'photos/trading-desk.jpg', 'photos/port-cranes.jpg'],
  market: 'photos/terminal-multi.jpg',
  daily: 'photos/chart-dark.jpg',
  monthly: 'photos/chart-lines.jpg',
  about: 'photos/warehouse-cupping-bw.jpg',
  aboutExpertise: 'PXL_20221209_082420450-edited-scaled.jpg',
  aboutTrust: 'photos/port-topdown-2.jpg',
  contactHero: 'photos/drying-beds.jpg',
  values: ['pillars/global-network.svg', 'pillars/market-understanding.svg', 'pillars/reliable-communication.svg'],
  aboutSourcing: 'photos/green-beans.jpg',
  aboutMarket: 'photos/terminal-multi.jpg',
  contact: 'photos/incheon-business-center.jpg', // Naver street-view capture: check terms before publishing
};

// Published briefings for the web list, newest first: date, weekday, subject line and one-line summary
// (no price figures). Updated automatically after each customer send (coffee-ontology tools/site/publish_briefing.py).
// Korean only; the English pages show the same list marked as Korean.
export const briefings = JSON.parse(readFileSync(new URL('./briefings.json', import.meta.url), 'utf8'));

const formTexts = {
  ko: {
    labels: { name: '담당자명', company: '회사명', phone: '전화번호', email: '이메일', message: '문의 내용' },
    optional: '선택', requiredNote: '* 필수 입력 항목',
    sending: '전송 중…',
    failure: '전송되지 않았습니다. 입력하신 내용은 유지됩니다. 잠시 후 다시 시도하거나 sales@commect.ai로 연락해주세요.',
    invalid: '필수 항목과 이메일 주소, 동의 여부를 확인해주세요.',
    offline: '연결 상태를 확인한 후 다시 시도해주세요. 입력하신 내용은 유지됩니다.',
    duplicate: '전송 중입니다. 잠시만 기다려주세요.',
    noScript: '양식을 쓰려면 JavaScript가 필요합니다. sales@commect.ai로 연락하실 수도 있습니다.',
    privacyLink: '수집·이용 안내',
  },
  en: {
    labels: { name: 'Contact name', company: 'Company', phone: 'Phone', email: 'Email', message: 'Your message' },
    optional: 'Optional', requiredNote: '* Required fields',
    sending: 'Sending…',
    failure: 'Your request could not be sent. Your information has been kept in the form. Please try again or contact sales@commect.ai.',
    invalid: 'Please check the required fields, email address and consent.',
    offline: 'Please check your connection and try again. Your information has been kept in the form.',
    duplicate: 'Your request is being sent. Please wait.',
    noScript: 'JavaScript is needed to use this form. You can also contact sales@commect.ai.',
    privacyLink: 'Privacy information',
  },
};

export const content = {
  ko: {
    locale: 'ko_KR', skip: '본문으로 바로가기', homeLabel: '홈', menuOpen: '메뉴 열기', menuClose: '메뉴 닫기',
    nav: { sourcing: '생두 소싱', market: '시장 정보', about: '회사 소개', contact: '문의' },
    titles: { home: '생두 소싱 파트너', sourcing: '생두 소싱', market: '시장 정보', about: '회사 소개', contact: '문의', policy: '이용약관', privacy: '개인정보처리방침', '404': '페이지를 찾을 수 없습니다' },
    description: '생두 소싱 파트너 COMMECT. 커머셜부터 스페셜티까지, 신뢰와 전문성을 바탕으로 고객의 성공적인 생두 구매를 함께합니다.',
    more: '자세히 보기', contactButton: '문의하기', backHome: '홈으로 돌아가기',
    home: {
      title: ['Green Coffee Sourcing.', 'Market Intelligence.'],
      lead: '생두 소싱 파트너, 코멕트',
      text: '신뢰와 전문성을 바탕으로,\n고객의 성공적인 커피 비즈니스를 지원합니다.',
      latest: '최근 브리핑',
      sourcing: { label: '생두 소싱', title: '생두 소싱의 모든 것', text: '커머셜부터 스페셜티까지,\n고객이 원하는 최적의 생두를 제안합니다.' },
      info: { label: '시장 정보', title: '한 박자 빠른 정보', text: '시장의 흐름을 읽는\n정확하고 신속한 정보를 제공합니다.', button: '브리핑 받아보기' },
      trust: { label: '파트너십', title: '신뢰할 수 있는 파트너십', text: '세계 유수의 글로벌 기업과 함께\n안정적인 거래 기반을 갖추고 있습니다.' },
      expertise: { label: '전문성', title: '현장에서 검증된 전문성', text: '풍부한 실무 경험을 바탕으로\n고객에게 최적의 솔루션을 제공합니다.', role: '대표', career: '국내 최대 물량의 생두 구매 실무' },
    },
    contactBand: { title: '비즈니스 문의', text: '언제든 편하게 문의해 주시기 바랍니다.' },
    sourcing: {
      title: '생두 소싱의 모든 것', text: '커머셜부터 스페셜티까지,\n고객이 원하는 최적의 생두를 제안합니다.',
      commercial: ['커머셜 생두', '안정적인 품질과 물량'],
      specialty: ['스페셜티 생두', '산지의 개성을 담은 생두'],
      tilesTitle: '산지에서 고객까지',
      tiles: ['산지', '품질', '가격', '물류'],
      tileTexts: ['세계 주요 산지의 생두 조달을 지원합니다.', '꼼꼼한 품질 확인을 지원합니다.', '합리적인 가격 결정을 지원합니다.', '안정적인 선적과 입고를 지원합니다.'],
      tileAlts: ['줄지어 심어진 커피 농장', '커핑으로 샘플을 평가하는 모습', '가격 차트가 띄워진 트레이딩 데스크', '항구의 크레인과 컨테이너'],
    },
    market: {
      title: '한 박자 빠른 정보', text: '시장의 흐름을 읽는\n정확하고 신속한 정보를 제공합니다.',
      listTitle: '최근 브리핑', listNote: '',
      // [title, description, kind]
      daily: ['Coffee Daily', '매일 아침, 가장 먼저 만나는 커피 시장 소식', '일일 시장 브리핑'],
      monthly: ['Monthly Report', '한 달의 흐름을 한눈에 짚는 깊이 있는 분석', '월간 시장 리포트'],
      subscribeTitle: '브리핑 받아보기', subscribeText: '업계 관계자께 보내드립니다.',
    },
    about: {
      title: '생두 소싱 파트너, COMMECT', text: '신뢰와 전문성을 바탕으로\n고객과 함께 성장합니다.',
      values: {
        label: '핵심 가치', title: '고객의 신뢰에 보답하는 세 가지 약속',
        items: [
          ['신뢰', '세계 유수의 파트너와 함께 안정적인 거래를 이어갑니다.'],
          ['전문성', '깊이 있는 시장 이해로 고객의 선택을 돕습니다.'],
          ['소통', '투명하고 원활한 소통으로 오래가는 관계를 만듭니다.'],
        ],
      },
      business: { label: '사업 영역', title: '생두 소싱과 시장 정보' },
    },
    contactPage: { title: '문의', text: '궁금하신 점이 있으시면\n언제든 편하게 문의해 주시기 바랍니다.', email: '이메일', address: '주소' },
    contact: {
      ...formTexts.ko,
      kindLabel: '문의 유형', kinds: ['거래 문의', '브리핑 수신', '기타'],
      consent: '문의 처리를 위한 개인정보 수집·이용에 동의합니다.',
      submit: '문의 보내기',
      success: '문의가 접수되었습니다. 남겨주신 연락처로 안내해드리겠습니다.',
    },
    subscribe: {
      ...formTexts.ko,
      kind: '브리핑 수신',
      consent: '개인정보 수집·이용에 동의합니다.',
      consentMail: '브리핑 메일 수신에 동의합니다.',
      submit: '신청하기',
      success: '신청이 접수되었습니다. 확인 후 안내해드리겠습니다.',
    },
    footer: { representative: '대표', registration: '사업자등록번호', disclaimer: '본 사이트의 시장 정보는 참고용이며, 특정 거래를 권유하지 않습니다.', copyright: '© 2026 COMMECT' },
    legal: legal.ko,
    notFound: { title: '페이지를 찾을 수 없습니다', text: '요청하신 페이지가 변경되었거나 더 이상 제공되지 않습니다.\n홈으로 이동하시거나 문의를 남겨주세요.' },
  },
  en: {
    locale: 'en_US', skip: 'Skip to content', homeLabel: 'Home', menuOpen: 'Open menu', menuClose: 'Close menu',
    nav: { sourcing: 'Sourcing', market: 'Market Insight', about: 'About', contact: 'Contact' },
    titles: { home: 'Your Green Coffee Sourcing Partner', sourcing: 'Green Coffee Sourcing', market: 'Market Insight', about: 'About', contact: 'Contact', policy: 'Terms of Use', privacy: 'Privacy Policy', '404': 'Page not found' },
    description: 'COMMECT, your green coffee sourcing partner. From commercial to specialty coffees, built on trust and expertise.',
    more: 'Learn more', contactButton: 'Contact us', backHome: 'Back to home',
    home: {
      title: ['Green Coffee Sourcing.', 'Market Intelligence.'],
      lead: 'COMMECT, Your Green Coffee Sourcing Partner',
      text: 'Built on trust and expertise,\nsupporting the success of your coffee business.',
      latest: 'Latest briefing',
      sourcing: { label: 'Sourcing', title: 'Everything in Green Coffee Sourcing', text: 'From commercial to specialty coffees,\nwe propose the right green coffee for your needs.' },
      info: { label: 'Market Insight', title: 'Insight, One Step Ahead', text: 'Accurate and timely information\nto read the market.', button: 'Receive the briefing' },
      trust: { label: 'Partnership', title: 'Partnerships You Can Trust', text: 'Working with leading global companies\non a stable trading foundation.' },
      expertise: { label: 'Expertise', title: 'Proven Expertise in the Field', text: 'Extensive hands-on experience,\ndelivering the right solutions for our clients.', role: 'Representative', career: 'Hands-on green coffee buying at the largest volumes in Korea' },
    },
    contactBand: { title: 'Business Inquiries', text: 'Please feel free to contact us.' },
    sourcing: {
      title: 'Everything in Green Coffee Sourcing', text: 'From commercial to specialty coffees,\nwe propose the right green coffee for your needs.',
      commercial: ['Commercial Coffee', 'Consistent quality and volume'],
      specialty: ['Specialty Coffee', 'Coffees that carry the character of their origin'],
      tilesTitle: 'From Origin to Client',
      tiles: ['Origin', 'Quality', 'Price', 'Logistics'],
      tileTexts: ['Supporting sourcing from the world\'s key origins.', 'Supporting thorough quality checks.', 'Supporting well-informed pricing decisions.', 'Supporting reliable shipment and arrival.'],
      tileAlts: ['Rows of coffee trees on a farm', 'Coffee samples being cupped', 'A trading desk with price charts', 'Port cranes and containers'],
    },
    market: {
      title: 'Insight, One Step Ahead', text: 'Accurate and timely information\nto read the market.',
      listTitle: 'Latest Briefings', listNote: 'Briefings are published in Korean.',
      daily: ['Coffee Daily', 'Start every morning with the latest coffee market news.', 'Daily market briefing'],
      monthly: ['Monthly Report', 'An in-depth look at the month\'s market trends.', 'Monthly market report'],
      subscribeTitle: 'Receive the Briefing', subscribeText: 'For industry professionals.',
    },
    about: {
      title: 'COMMECT, Your Green Coffee Sourcing Partner', text: 'Growing together with our clients\nthrough trust and expertise.',
      values: {
        label: 'Core Values', title: 'Three Commitments to Our Clients',
        items: [
          ['Trust', 'Steady, reliable trade alongside leading global partners.'],
          ['Expertise', 'In-depth market understanding that supports your decisions.'],
          ['Communication', 'Open, timely communication that builds lasting relationships.'],
        ],
      },
      business: { label: 'What We Do', title: 'Green Coffee Sourcing and Market Insight' },
    },
    contactPage: { title: 'Contact', text: 'If you have any questions,\nplease feel free to contact us.', email: 'Email', address: 'Address' },
    contact: {
      ...formTexts.en,
      kindLabel: 'Inquiry type', kinds: ['Trade inquiry', 'Briefing subscription', 'Other'],
      consent: 'I consent to the collection and use of my information to handle this inquiry.',
      submit: 'Send inquiry',
      success: 'Thank you. Your inquiry has been received. We will contact you using the details you provided.',
    },
    subscribe: {
      ...formTexts.en,
      kind: 'Briefing subscription',
      consent: 'I consent to the collection and use of my information.',
      consentMail: 'I agree to receive the briefing by email.',
      submit: 'Subscribe',
      success: 'Thank you. Your request has been received. We will be in touch after review.',
    },
    footer: { representative: 'Representative', registration: 'Business registration', disclaimer: 'Market information on this site is for reference only and is not a recommendation of any transaction.', copyright: '© 2026 COMMECT' },
    legal: legal.en,
    notFound: { title: 'Page not found', text: 'The page you requested has moved or is no longer available.\nPlease return to the homepage or get in touch.' },
  },
};
