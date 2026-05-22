# UI 문제 해결

LiteLLM 관리자 UI에서 문제가 발생한 경우, 보고할 때 다음 정보를 포함해 주세요.

## 1. 재현 단계 {#1-steps-to-reproduce}

문제를 발생시키는 방법을 단계별로 명확하게 설명해 주세요(예: "Settings → Team으로 이동, 'Create Team' 클릭, 필드 입력, 제출 클릭 → 오류 발생").

## 2. LiteLLM 버전 {#2-litellm-version}

현재 실행 중인 LiteLLM 버전입니다. `litellm --version` 또는 UI의 설정 페이지에서 확인하세요.

## 3. 아키텍처 및 배포 설정 {#3-아키텍처--deployment-setup}

분산 환경은 UI 문제의 알려진 원인입니다. 다음 내용을 설명해 주세요.

- **LiteLLM instances/replicas 수**와 배포 방식(예: Kubernetes, Docker Compose, ECS)
- **Load balancer** 유형과 구성(예: ALB, Nginx, Cloudflare Tunnel) - sticky sessions 활성화 여부 포함
- **UI 접근 방식** - LiteLLM에 직접 접근하는지, reverse proxy를 통하는지, ingress controller 뒤에 있는지
- 사용자와 LiteLLM 서버 사이의 **CDN 또는 caching layers**

## 4. Network 탭 요청 {#4-network-tab-requests}

브라우저의 Developer Tools(F12 → Network tab)를 열고 문제를 재현한 뒤, 다음을 공유해 주세요.

- **실패한 request(s)** - URL, 메서드, 상태 코드, 응답 본문
- 관련 network activity의 **screenshots 또는 HAR export**
- Console tab에 표시되는 **CORS 또는 mixed-content errors**

## 5. 환경 변수 {#5-environment-variables}

UI 및 proxy 설정과 관련된 민감하지 않은 환경 변수입니다. 예시는 다음과 같습니다.

- `LITELLM_MASTER_KEY`
- `PROXY_BASE_URL` / `LITELLM_PROXY_BASE_URL`
- `UI_BASE_PATH`
- SSO 관련 변수(예: `GOOGLE_CLIENT_ID`, `MICROSOFT_TENANT`)

비밀번호, secrets, API keys는 **포함하지 마세요**.

## 6. 브라우저 및 접근 정보 {#6-browser--access-details}

- **브라우저** 및 버전(예: Chrome 120, Firefox 121)
- UI에 접근할 때 사용한 **Access URL**(민감한 부분은 마스킹)
- 문제가 **모든 사용자 또는 특정 역할**에서 발생하는지 여부(Admin, Internal User 등)

## 7. 스크린샷 또는 화면 녹화 {#7-screenshots-or-screen-recordings}

문제의 스크린샷이나 짧은 화면 녹화가 있으면 매우 유용합니다. 표시되는 오류 메시지, 토스트 알림, 예상치 못한 동작을 포함해 주세요.
