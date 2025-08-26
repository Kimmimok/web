Cloud Function 예제: Google Sheets에 안전하게 appendRow 하는 방법

요약
- 이 폴더는 Node.js Cloud Function 예제 코드를 포함합니다. 서버에서 Google 서비스 계정을 사용해 Sheets API를 호출하므로 클라이언트에 민감 정보를 노출하지 않습니다.

환경 변수
- TARGET_SPREADSHEET_ID: 저장할 스프레드시트 ID
- APP_SECRET_TOKEN: 클라이언트가 요청 시 사용하는 비밀 토큰
- ALLOWED_SHEETS: 쉼표로 구분된 허용 시트 명 (예: SH_H,SH_T)

로컬 테스트
1. 서비스 계정 키를 발급받아 `GOOGLE_APPLICATION_CREDENTIALS` 환경변수로 경로를 지정합니다.
   Windows PowerShell 예:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\key.json"
$env:TARGET_SPREADSHEET_ID = "your_sheet_id"
$env:APP_SECRET_TOKEN = "your_secret_token"
$env:ALLOWED_SHEETS = "SH_H,SH_T,SH_RCAR"
node index.js
```

(참고: index.js 는 Cloud Function용 엔트리포인트이며, 로컬에서 간단히 express 서버로 감싸 테스트할 수 있습니다.)

GCP 배포(간단)
1. gcloud CLI 로그인 및 프로젝트 설정:
```powershell
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```
2. 필요한 API 활성화:
```powershell
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable sheets.googleapis.com
```
3. 서비스 계정 생성 및 스프레드시트 편집자로 초대 (Sheets 문서에서 서비스계정 이메일을 편집자로 추가)
4. 배포:
```powershell
gcloud functions deploy appendRow `
  --runtime nodejs18 `
  --trigger-http `
  --allow-unauthenticated `
  --entry-point appendRow `
  --set-env-vars TARGET_SPREADSHEET_ID=YOUR_SHEET_ID,APP_SECRET_TOKEN=YourLongSecret,ALLOWED_SHEETS=SH_H,SH_T,SH_RCAR
```

보안 주의
- `--allow-unauthenticated`를 사용하면 누구나 호출 가능하니, 헤더 토큰을 반드시 검증하세요.
- 운영에서는 Secret Manager를 사용해 토큰을 보관하고 IAM 기반 호출(더 안전)을 고려하세요.

React 클라이언트 예
```javascript
fetch(process.env.REACT_APP_SERVER_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-app-token': process.env.REACT_APP_APP_SECRET_TOKEN
  },
  body: JSON.stringify({ sheet:'SH_H', service:'hotel', row: rowData })
});
```

원하시면 이 예제에 대해 배포 스크립트나 CI/CD 설정도 만들어 드리겠습니다.
