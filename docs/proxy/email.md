import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 이메일 알림

<Image 
  img={require('../../img/email_2_0.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  LiteLLM 이메일 알림
</p>

## 개요

특정 이벤트가 발생했을 때 LiteLLM Proxy 사용자에게 이메일을 보냅니다.

| 범주 | 세부 정보 |
|----------|---------|
| 지원 이벤트 | • LiteLLM Proxy에 사용자 추가<br/>• 사용자용 Proxy API Key 생성<br/>• 사용자용 Proxy API Key rotation |
| 지원 이메일 통합 | • Resend API<br/>• SMTP |

## 사용법

:::info

LiteLLM Cloud: 이 기능은 모든 LiteLLM Cloud 사용자에게 활성화되어 있으므로 별도 설정이 필요 없습니다.

:::

### 1. 이메일 통합 설정

<Tabs>
  <TabItem value="smtp" label="SMTP">

설정을 위해 SMTP 자격 증명을 준비합니다.

```yaml showLineNumbers title="proxy_config.yaml"
litellm_settings:
    callbacks: ["smtp_email"]
```

프록시 환경 변수에 다음 값을 추가합니다.

```shell showLineNumbers
SMTP_HOST="smtp.resend.com"
SMTP_TLS="True"
SMTP_PORT="587"
SMTP_USERNAME="resend"
SMTP_SENDER_EMAIL="notifications@alerts.litellm.ai"
SMTP_PASSWORD="xxxxx"
```

  </TabItem>
  <TabItem value="resend" label="Resend API">

프록시 `config.yaml`의 `litellm_settings` 아래에 `resend_email`을 추가합니다.

다음 환경 변수를 설정합니다.

```shell showLineNumbers
RESEND_API_KEY="re_1234"
```

```yaml showLineNumbers title="proxy_config.yaml"
litellm_settings:
    callbacks: ["resend_email"]
```

  </TabItem>
  <TabItem value="sendgrid" label="SendGrid API">

프록시 `config.yaml`의 `litellm_settings` 아래에 `sendgrid_email`을 추가합니다.

다음 환경 변수를 설정합니다.

```shell showLineNumbers
SENDGRID_API_KEY="SG.1234"
SENDGRID_SENDER_EMAIL="notifications@your-domain.com"
```

```yaml showLineNumbers title="proxy_config.yaml"
litellm_settings:
  callbacks: ["sendgrid_email"]
```

  </TabItem>
</Tabs>

### 2. 새 사용자 생성

LiteLLM Proxy UI에서 users > create a new user로 이동합니다.

새 사용자를 생성하면 사용자 생성 시 지정한 이메일 주소로 초대 이메일이 전송됩니다.

### 3. Budget 알림 설정(선택)

프록시 설정의 `alerts` 목록에 "email"을 추가하면 budget 알림 이메일을 활성화할 수 있습니다.

```yaml showLineNumbers title="proxy_config.yaml"
general_settings:
  alerts: ["email"]
```

#### Budget 알림 유형

**Soft Budget 알림**: 키가 soft budget limit을 초과하면 자동으로 트리거됩니다. 이 알림은 중요한 임계값에 도달하기 전에 지출을 모니터링하는 데 도움이 됩니다.

**Max Budget 알림**: 키가 최대 예산의 지정된 비율(기본값: 80%)에 도달하면 자동으로 트리거됩니다. 이 알림은 예산 소진에 가까워졌을 때 경고합니다.

두 알림 유형 모두 스팸을 방지하기 위해 24시간 동안 최대 한 번만 이메일을 보냅니다.

#### 설정 옵션

다음 환경 변수로 budget 알림 동작을 커스터마이즈할 수 있습니다.

```yaml showLineNumbers title=".env"
# Percentage of max budget that triggers alerts (as decimal: 0.8 = 80%)
EMAIL_BUDGET_ALERT_MAX_SPEND_ALERT_PERCENTAGE=0.8

# Time-to-live for alert deduplication in seconds (default: 24 hours)
EMAIL_BUDGET_ALERT_TTL=86400
```

## 이메일 템플릿


### 1. LiteLLM Proxy에 사용자 추가

LiteLLM Proxy에서 새 사용자를 생성할 때 이 이메일이 전송됩니다.

<Image 
  img={require('../../img/email_event_1.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

**이 이벤트를 트리거하는 방법**

LiteLLM Proxy UI에서 Users > Create User > 사용자의 이메일 주소 입력 > Create User로 이동합니다.

<Image 
  img={require('../../img/new_user_email.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

### 2. 사용자용 Proxy API Key 생성

LiteLLM Proxy에서 사용자용 새 API 키를 생성할 때 이 이메일이 전송됩니다.

<Image 
  img={require('../../img/email_event_2.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

**이 이벤트를 트리거하는 방법**

LiteLLM Proxy UI에서 가상 키 > Create API Key > Select User ID로 이동합니다.

<Image 
  img={require('../../img/key_email.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

Create Key 모달에서 Advanced Settings를 선택한 뒤 Send Email을 True로 설정합니다.

<Image 
  img={require('../../img/key_email_2.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

### 3. 사용자용 Proxy API Key rotation

LiteLLM Proxy에서 사용자의 API 키를 rotate할 때 이 이메일이 전송됩니다.

<Image 
  img={require('../../img/email_regen2.png')}
  style={{maxHeight: '600px', width: 'auto', display: 'block', margin: '0 0 2rem 0'}}
/>

**이 이벤트를 트리거하는 방법**

LiteLLM Proxy UI에서 가상 키 > 키 클릭 > "Regenerate Key" 클릭으로 이동합니다.

:::info

키에 `user_id`가 연결되어 있는지 확인하세요. 이 값은 키 생성 시 설정되었어야 합니다.

:::

<Image 
  img={require('../../img/email_regen.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

키를 재생성하면 사용자는 다음 내용을 포함한 이메일 알림을 받습니다.
- rotation에 대한 보안 중심 메시지
- 새 API 키(`EMAIL_INCLUDE_API_KEY=false`인 경우 placeholder)
- 애플리케이션 업데이트 안내
- 보안 모범 사례

## 이메일 커스터마이징

:::info

이메일 브랜딩 커스터마이징은 엔터프라이즈 기능입니다. [무료 평가판 문의](https://enterprise.litellm.ai/demo)

:::

LiteLLM은 이메일 알림의 여러 요소를 커스터마이즈할 수 있게 해줍니다. 아래는 커스터마이즈 가능한 모든 필드의 전체 참조입니다.

| 필드 | 환경 변수 | 유형 | 기본값 | 예제 | 설명 |
|-------|-------------------|------|---------------|---------|-------------|
| Logo URL | `EMAIL_LOGO_URL` | string | LiteLLM logo | `"https://your-company.com/logo.png"` | 회사 로고의 공개 URL |
| Support Contact | `EMAIL_SUPPORT_CONTACT` | string | support@berri.ai | `"support@your-company.com"` | 사용자 지원용 이메일 주소 |
| Email Signature | `EMAIL_SIGNATURE` | string (HTML) | 표준 LiteLLM footer | `"<p>Best regards,<br/>Your Team</p><p><a href='https://your-company.com'>Visit us</a></p>"` | 모든 이메일에 적용되는 HTML 형식 footer |
| Invitation Subject | `EMAIL_SUBJECT_INVITATION` | string | "LiteLLM: New User Invitation" | `"Welcome to Your Company!"` | 초대 이메일 제목 |
| Key Creation Subject | `EMAIL_SUBJECT_KEY_CREATED` | string | "LiteLLM: API Key Created" | `"Your New API Key is Ready"` | 키 생성 이메일 제목 |
| Key Rotation Subject | `EMAIL_SUBJECT_KEY_ROTATED` | string | "LiteLLM: API Key Rotated" | `"Your API Key Has Been Rotated"` | 키 rotation 이메일 제목 |
| Include API Key | `EMAIL_INCLUDE_API_KEY` | boolean | true | `"false"` | 이메일에 실제 API 키를 포함할지 여부(보안 강화를 위해 false로 설정) |
| Proxy Base URL | `PROXY_BASE_URL` | string | http://0.0.0.0:4000 | `"https://proxy.your-company.com"` | LiteLLM Proxy의 base URL(이메일 링크에 사용) |


## Email Signature의 HTML 지원

`EMAIL_SIGNATURE` 필드는 풍부한 브랜드 이메일 footer를 만들 수 있도록 HTML 형식을 지원합니다. 포함할 수 있는 예시는 다음과 같습니다.

```html
<p>Best regards,<br/>The LiteLLM Team</p>
<p>
  <a href='https://docs.litellm.ai'>Documentation</a> |
  <a href='https://github.com/BerriAI/litellm'>GitHub</a>
</p>
<p style='font-size: 12px; color: #666;'>
  This is an automated message from LiteLLM Proxy
</p>
```

지원되는 HTML 기능:
- 텍스트 서식(굵게, 기울임 등)
- 줄바꿈(`<br/>`)
- 링크(`<a href='...'>`)
- 문단(`<p>`)
- 기본 inline styling
- 회사 정보와 소셜 미디어 링크
- 법적 고지 또는 서비스 약관 링크

## 환경 변수

환경 변수를 통해 이메일의 다음 요소를 커스터마이즈할 수 있습니다.

```bash
# Email Branding
EMAIL_LOGO_URL="https://your-company.com/logo.png"  # Custom logo URL
EMAIL_SUPPORT_CONTACT="support@your-company.com"     # Support contact email
EMAIL_SIGNATURE="<p>Best regards,<br/>Your Company Team</p><p><a href='https://your-company.com'>Visit our website</a></p>"  # Custom HTML footer/signature

# Email Subject Lines
EMAIL_SUBJECT_INVITATION="Welcome to Your Company!"  # Subject for invitation emails
EMAIL_SUBJECT_KEY_CREATED="Your API Key is Ready"    # Subject for key creation emails
EMAIL_SUBJECT_KEY_ROTATED="Your API Key Has Been Rotated"  # Subject for key rotation emails

# Security Settings
EMAIL_INCLUDE_API_KEY="false"  # Set to false to hide API keys in emails (default: true)

# Proxy Configuration
PROXY_BASE_URL="https://proxy.your-company.com"      # Base URL for the LiteLLM Proxy (used in email links)
```

## 보안: 이메일에서 API 키 숨기기

보안 강화를 위해 LiteLLM이 이메일 알림에 실제 API 키를 **포함하지 않도록** 설정할 수 있습니다. 다음 경우에 유용합니다.

- 이메일 가로채기를 통한 키 노출 위험을 줄이고 싶은 경우
- 보안 정책상 키를 보안 dashboard에서만 조회해야 하는 경우
- 이메일 forwarding 또는 저장 보안이 우려되는 경우

비활성화하면 이메일에는 실제 API 키 대신 `[Key hidden for security - retrieve from dashboard]`가 표시됩니다.

**설정:**

```bash
# Hide API keys in emails (enhanced security)
EMAIL_INCLUDE_API_KEY="false"

# Include API keys in emails (default behavior)
EMAIL_INCLUDE_API_KEY="true"  # or omit this variable
```

**동작:**

| 설정 | 키 생성 이메일 | 키 rotation 이메일 |
|---------|------------------|-------------------|
| `true` (기본값) | 실제 `sk-xxxxx` 키 표시 | 실제 `sk-xxxxx` 키 표시 |
| `false` | placeholder 메시지 표시 | placeholder 메시지 표시 |

사용자는 언제든지 LiteLLM Proxy dashboard에서 자신의 키를 조회할 수 있습니다.

## Email Signature의 HTML 지원

`EMAIL_SIGNATURE` 환경 변수는 HTML 형식을 지원하므로 풍부한 브랜드 이메일 footer를 만들 수 있습니다. 다음을 포함할 수 있습니다.

- 텍스트 서식(굵게, 기울임 등)
- `<br/>`을 사용한 줄바꿈
- `<a href='...'>`를 사용한 링크
- `<p>`를 사용한 문단
- 회사 정보와 소셜 미디어 링크
- 법적 고지 또는 서비스 약관 링크

HTML signature 예시:
```html
<p>Best regards,<br/>The LiteLLM Team</p>
<p>
  <a href='https://docs.litellm.ai'>Documentation</a> |
  <a href='https://github.com/BerriAI/litellm'>GitHub</a>
</p>
<p style='font-size: 12px; color: #666;'>
  This is an automated message from LiteLLM Proxy
</p>
```

## 기본 템플릿

환경 변수가 설정되지 않으면 LiteLLM은 기본 템플릿을 사용합니다.

- 기본 로고: LiteLLM logo
- 기본 지원 연락처: support@berri.ai
- 기본 signature: 표준 LiteLLM footer
- 기본 제목: "LiteLLM: \{event_message\}"(실제 이벤트 메시지로 치환됨)

## 템플릿 변수

커스텀 이메일 제목을 설정할 때 실제 값으로 치환되는 템플릿 변수를 사용할 수 있습니다.

```bash
# Examples of template variable usage
EMAIL_SUBJECT_INVITATION="Welcome to \{company_name\}!"
EMAIL_SUBJECT_KEY_CREATED="Your \{company_name\} API Key"
```

시스템은 이메일을 보낼 때 `\{event_message\}`와 다른 템플릿 변수를 실제 값으로 자동 치환합니다.

## FAQ 

### 이메일 링크에 `http://0.0.0.0:4000`이 보이는 이유는 무엇인가요?

`PROXY_BASE_URL` 환경 변수는 이메일 링크를 구성하는 데 사용됩니다. 로컬 환경에서 LiteLLM Proxy를 사용 중이면 이메일 링크에 `http://0.0.0.0:4000`이 표시됩니다.

프로덕션 환경에서 LiteLLM Proxy를 사용 중이면 LiteLLM Proxy의 실제 base URL이 표시됩니다.

`PROXY_BASE_URL` 환경 변수를 LiteLLM Proxy의 실제 base URL로 설정할 수 있습니다.

```bash
PROXY_BASE_URL="https://proxy.your-company.com"
```
