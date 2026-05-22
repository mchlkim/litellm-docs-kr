import Image from '@theme/IdealImage';

# 팀 Soft Budget 알림

:::info

✨ 이 기능은 엔터프라이즈 기능입니다. 이메일 예산 알림에는 엔터프라이즈 라이선스가 필요합니다.

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[무료 7일 평가판 키 받기](https://www.litellm.ai/enterprise#trial)

:::

팀에 soft budget을 설정하고 지출이 임계값을 넘으면 이메일 알림을 받습니다. 요청은 차단하지 않습니다.

## 개요

**soft budget**은 초과 시 이메일 알림을 트리거하는 지출 임계값이지만, **요청을 차단하지는 않습니다**.
한도에 도달하면 요청을 거부하는 hard budget(`max_budget`)과 다릅니다.

<Image img={require('../../img/ui_team_soft_budget_alerts.png')} />

팀 soft budget 알림으로 다음을 할 수 있습니다.

- **조기 알림 받기** — 팀 지출이 soft budget 임계값을 넘으면 이메일 알림을 받습니다.
- **요청 흐름 유지** — hard budget과 달리 soft budget은 API 호출을 차단하지 않습니다.
- **특정 수신자 지정** — 팀 구성원뿐 아니라 팀 리드, 재무 담당자 같은 특정 이메일 주소로 알림을 보냅니다.
- **전역 알림 없이 동작** — 팀 soft budget 알림은 Slack 또는 다른 전역 알림 설정과 독립적으로 이메일로 전송됩니다.

:::warning 이메일 통합 필요
팀 soft budget 알림은 이메일로 전송됩니다. 알림을 전송하려면 프록시에 활성 이메일 통합(SendGrid, Resend 또는 SMTP)이 설정되어 있어야 합니다. 설정 방법은 [이메일 알림](./email.md)을 참고하세요.
:::

:::info 자동 활성화
팀에 soft budget과 하나 이상의 알림 이메일을 설정하면 팀 soft budget 알림은 **자동으로 활성화**됩니다. 추가 프록시 설정이나 재시작은 필요하지 않으며, 알림 조건은 모든 요청에서 확인됩니다.
:::

## 동작 방식

팀에 속한 키로 API 요청이 발생할 때마다 프록시는 다음을 확인합니다.

1. 팀에 `soft_budget`이 설정되어 있는가?
2. 팀의 현재 `spend`가 `soft_budget` 이상인가?
3. `soft_budget_alerting_emails`에 이메일이 설정되어 있는가?

세 조건이 모두 충족되면 설정된 수신자에게 이메일 알림이 전송됩니다.
알림은 **중복 제거**되므로 같은 알림은 24시간 창 안에서 한 번만 전송됩니다.

## 팀 Soft Budget 알림 설정 방법

### 1. Navigate to the 관리자 UI

관리자 UI로 이동합니다(예: `http://localhost:4000/ui` 또는 `PROXY_BASE_URL/ui`).

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/f06d75ad-25ef-4ee8-90c3-9604f8e46a1c/ascreenshot_1a6defaed1494d6da0001459511ecfd5_text_export.jpeg)

### 2. Teams로 이동

사이드바에서 **Teams**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/f06d75ad-25ef-4ee8-90c3-9604f8e46a1c/ascreenshot_2d258fa280f6463b966bf7a05bb102d5_text_export.jpeg)

### 3. 팀 선택

soft budget 알림을 설정할 팀을 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/490f09fb-6bf5-45a8-a384-676889f34c88/ascreenshot_15cceb22abe64df0bf7d7c742ecb5b2f_text_export.jpeg)

### 4. 팀 Settings 열기

팀 설정을 보려면 **Settings** 탭을 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/28dd1bc5-7d07-462f-b277-33f885bdc07e/ascreenshot_12f2b762b5d24686801d93ad5b067e06_text_export.jpeg)

### 5. Settings 편집

팀 예산 설정을 수정하려면 **Edit Settings**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/30a483ea-7e01-4fdc-ac5f-a5572388d138/ascreenshot_0915eadd9e754a798489853b82de3cb5_text_export.jpeg)

### 6. Soft Budget 설정

**Soft Budget (USD)** 필드를 클릭하고 원하는 임계값을 입력합니다. 예를 들어 테스트에는 `0.01`, 프로덕션에는 `500` 같은 더 큰 값을 입력합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/8b306d80-4943-4ad0-a51a-94b5ebdd6680/ascreenshot_5bb6e65c6428473fac2607f6a7f4b98a_text_export.jpeg)

### 7. 알림 이메일 추가

**Soft Budget Alerting Emails** 필드를 클릭하고 알림을 받을 이메일 주소를 하나 이상 쉼표로 구분해 입력합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/a97c6efa-cc93-45d7-979e-d2a533f423b9/ascreenshot_2d8223ce8e934aa1bfadfb2f78aee5fc_text_export.jpeg)

### 8. 변경사항 저장

**Save Changes**를 클릭합니다. 이제 soft budget 알림이 활성화되며, 프록시 재시작은 필요하지 않습니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/865ba6f1-3fc6-4c19-8e08-433561d6c3f7/ascreenshot_b2f0503ada3a479a83dc8b7d01c1f8da_text_export.jpeg)

### 9. 확인: 이메일 알림 수신

팀 지출이 soft budget을 넘으면 설정된 수신자에게 이메일 알림이 전송됩니다. 아래는 알림 이메일 예시입니다.

<Image img={require('../../img/ui_team_soft_budget_email_example.png')} />

## 설정 참조

| 설정                         | 설명                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Soft Budget (USD)**           | 이메일 알림을 트리거하는 지출 임계값입니다. 이 한도를 초과해도 요청은 **차단되지 않습니다**.                                |
| **Soft Budget Alerting Emails** | soft budget을 넘었을 때 알림을 받을 이메일 주소입니다. 쉼표로 구분합니다. 알림을 보내려면 이메일이 하나 이상 필요합니다. |

:::tip Soft Budget와 Max Budget 비교

- **Soft Budget**: 권고 임계값입니다. 이메일 알림을 보내지만 요청은 **차단하지 않습니다**.
- **Max Budget**: 하드 한도입니다. 예산을 초과하면 요청을 차단합니다.

같은 팀에 둘 다 설정하면 조기 경고(soft)와 강제 중지(max)를 함께 사용할 수 있습니다.
:::

## API 설정

팀을 만들거나 업데이트할 때 API로도 팀 soft budget을 설정할 수 있습니다.

```bash
curl -X POST 'http://localhost:4000/team/update' \
  --header 'Authorization: Bearer sk-1234' \
  --header 'Content-Type: application/json' \
  --data '{
    "team_id": "your-team-id",
    "soft_budget": 500.00,
    "metadata": {
      "soft_budget_alerting_emails": ["lead@example.com", "finance@example.com"]
    }
  }'
```

## 관련 문서

- [이메일 알림](./email.md) – LiteLLM Proxy용 이메일 통합(Resend, SMTP) 설정
- [Alerting](./alerting.md) – Slack 및 기타 알림 채널 설정
- [Cost Tracking](./cost_tracking.md) – 팀, 키, 사용자 전반의 지출 추적 및 관리
