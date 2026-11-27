# COMMECT website

국문·영문 정적 웹사이트입니다. 기존 사진·브랜드·페이지 구성을 활용하며, 원고와 공통 화면을 관리하는 작은 생성 스크립트를 사용합니다.

## 작업 방법

- `npm run build`: 국문·영문 HTML과 배포용 `dist/` 생성.
- `npm run dev`: 새로 빌드한 뒤 `http://127.0.0.1:4173`에서 미리보기. 다른 포트는 `PORT=4174 npm run dev`.
- `npm test`: 빌드 후 실행. 페이지·링크·404 응답, 문의 양식의 성공·실패·중복 제출, 문의 메일 함수의 검사(필수 칸·글자 수·스팸·머리글 주입)를 확인합니다. 테스트와 미리보기는 메일을 실제로 보내지 않습니다.

내용을 바꾼 뒤에는 다시 빌드합니다. 개발 서버는 `dist/`를 그대로 제공하므로 빌드 후 브라우저를 새로고침하면 됩니다.

| 파일 | 역할 |
|---|---|
| `content/site.mjs` | 국문·영문 원고, 회사 정보, 이미지, 브리핑 목록과 보이는 개수(`briefingCounts`: 홈 3개, 시장 정보 5개. 옛 브리핑은 `briefings.json`에 남지만 사이트에는 안 보임) |
| `content/legal.mjs` | 이용약관·개인정보처리방침 본문 |
| `scripts/build.mjs` | 공통 헤더·푸터·페이지 템플릿, 언어별 HTML 생성 |
| `assets/site.css` | 공통 디자인과 반응형 규칙 |
| `assets/site.js` | 메뉴, 언어 전환, 사진, 등장 애니메이션, 문의 처리 |
| `api/inquiry.mjs` | Vercel 함수 `POST /api/inquiry`: 문의·브리핑 신청을 Zoho SMTP로 메일 발송(저장하지 않음) |
| `lib/inquiry.mjs` | 문의 검사와 메일 내용 만들기(함수·미리보기·테스트가 함께 씀) |
| `scripts/serve.mjs` | 배포 파일만 제공하는 미리보기 서버. `/api/inquiry`는 메일을 보내지 않고 제목만 로그로 남김 |
| `tests/site.test.mjs`, `tests/inquiry.test.mjs` | 경로·링크·문의 동작과 문의 메일 함수 검증 |
| `images/photos/SOURCES.md` | 사진 출처 기록 |

루트와 `en/`의 HTML은 생성 결과입니다. 직접 수정하면 다음 빌드에서 덮어씁니다. 원고는 `content/site.mjs`, 공통 화면은 `scripts/build.mjs`에서 수정합니다.

서체는 국문 Pretendard와 영문 Inter를 로컬에서 제공합니다. Inter 공식 배포본과 SIL Open Font License는 `vendor/fonts/inter/`에 있으며 빌드 결과에도 함께 포함됩니다. 등장 애니메이션은 스크롤로 처음 보일 때 한 번 재생하고, 기기의 움직임 줄이기 설정을 반영합니다.

로고는 `images/brand/commect-wordmark-navy.png`와 `commect-wordmark-white.png`를 사용합니다. 사진 위에서는 흰색, 흰 배경 헤더와 푸터에서는 남색을 표시합니다. 고해상도 원본과 재생성 기준은 `docs/design/commect-wordmark/`에 보관하며, 배포에는 최적화된 1024×240px PNG만 포함합니다.

## 주소와 배포

국문은 `/`, `/sourcing`, `/market`, `/about`, `/contact`이고 영문은 `/en` 아래에서 제공합니다. 옛 주소 `/service`·`/process`는 `/sourcing`으로 영구 이동합니다(`vercel.json`, 미리보기 서버도 같게 처리). `.html`과 기존 정책 쿼리 주소도 대응 페이지로 연결됩니다.

Vercel은 `npm run build`로 만든 `dist/`만 공개하도록 설정되어 있습니다. 과거의 `*-original.html`, 이전 물류 경로, 계획서, 테스트, 원고 파일과 사용하지 않는 라이브러리는 배포 결과에 포함되지 않습니다. 루트 폴더 전체를 정적 호스팅에 그대로 올리지 마세요.

## 문의 받기 (2026-11-23부터)

문의와 브리핑 신청은 데이터베이스에 저장하지 않고 메일로만 받습니다. 브라우저는 `/api/inquiry`로 보내고, 함수가 검사한 뒤 Zoho SMTP로 메일을 보냅니다. 답장 주소는 문의자 이메일입니다.

Vercel 환경변수(Preview·Production 모두):

| 이름 | 값 |
|---|---|
| `SMTP_USER` | 보내는 계정 (jin.kim@commect.ai) |
| `SMTP_PASS` | Zoho 앱 비밀번호. 사이트 전용으로 따로 발급해 사람이 직접 넣는다 |
| `INQUIRY_TO` | 받는 주소 (jin.kim@commect.ai) |
| `SMTP_HOST`, `SMTP_PORT` | 선택. 기본 smtp.zoho.com, 465 |

예전의 Supabase 공개 키 설정(`assets/inquiry-config.json`)은 지웠습니다.

## 공개 전 확인

- 약관은 그대로이고, 개인정보처리방침은 메일로만 받는 방식(Zoho·Vercel 위탁, 국외 이전)과 브리핑 수신 동의에 맞춰 고쳤습니다(2026-11-23). Zoho 계정의 데이터센터 지역을 확인해야 합니다. 정책 페이지의 검색 제외 설정은 유지합니다.
- 실제 메일 발송은 Vercel 미리보기 배포에서 사용자 승인 후 시험 1건으로 확인합니다.
- `images/photos/incheon-business-center.jpg`는 네이버 거리뷰 캡처입니다. 공개 전에 이용 조건을 확인하거나 직접 찍은 사진으로 바꿉니다.
