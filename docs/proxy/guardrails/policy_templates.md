# 정책 템플릿 {#policy-templates}

정책 템플릿은 조직에서 시작점으로 사용할 수 있는 사전 구성된 가드레일 정책을 제공합니다. 정책과 가드레일을 수동으로 만들지 않고, 사용 사례에 맞는 템플릿을 선택해 한 번의 클릭으로 배포할 수 있습니다.

## 정책 템플릿 사용 {#using-policy-templates}

### UI에서 사용 {#using-in-the-ui}

1. LiteLLM 관리자 UI에서 **정책 → 템플릿** 탭으로 이동합니다.
2. 사용 가능한 템플릿을 살펴봅니다. 예: "PII 보호", "비용 제어", "HR 규정 준수"
3. 사용할 템플릿에서 **"템플릿 사용"**을 클릭합니다.
4. 생성될 가드레일을 검토합니다.
   - 이미 존재하는 가드레일은 초록색 체크 표시로 표시됩니다.
   - 새 가드레일은 선택하거나 선택 해제할 수 있습니다.
5. **"X개 가드레일 생성 및 템플릿 사용"**을 클릭합니다.
6. 미리 채워진 정책 양식을 검토하고 사용자 지정합니다.
7. 저장하려면 **"정책 생성"**을 클릭합니다.

### 워크플로 {#workflow}

```
Select Template → Review Guardrails → Create Selected → Edit Policy → Save
```

시스템은 자동으로 다음을 수행합니다.
- ✅ 이미 존재하는 가드레일을 감지합니다.
- ✅ 선택한 가드레일 중 누락된 것만 생성합니다.
- ✅ 템플릿 데이터로 정책 양식을 미리 채웁니다.
- ✅ 저장 전에 사용자 지정할 수 있게 합니다.

## 사용 가능한 템플릿 {#available-templates}

템플릿은 [GitHub](https://raw.githubusercontent.com/BerriAI/litellm/main/policy_templates.json)에서 가져오며, 실패 시 로컬 백업으로 자동 대체됩니다.

### 현재 템플릿 {#current-templates}

#### 1. 고급 PII 보호(호주) {#1-advanced-pii-protection-australia}
- **복잡도:** 높음
- **사용 사례:** 호주 조직을 위한 포괄적인 PII 감지
- **가드레일:**
  - 호주 세금 식별자(TFN, ABN, Medicare)
  - 호주 여권
  - 국제 PII(SSN, 여권, 국가 ID)
  - 연락처 정보(이메일, 전화번호, 주소)
  - 금융 데이터(신용카드, IBAN)
  - API 자격 증명(AWS, GitHub, Slack) - 요청을 **BLOCK**
  - 네트워크 인프라(IP 주소)
  - 보호 계층 정보(성별, 인종, 종교, 장애 등)

#### 2. 기본 PII 보호 {#2-baseline-pii-protection}
- **복잡도:** 낮음
- **사용 사례:** 내부 도구 및 테스트를 위한 기본 보호
- **가드레일:**
  - 호주 세금 식별자
  - API 자격 증명
  - 금융 데이터

## 자체 정책 템플릿 만들기 {#creating-your-own-policy-template}

전체 LiteLLM 커뮤니티가 사용할 수 있도록 정책 템플릿을 기여할 수 있습니다.

### 템플릿 구조 {#template-structure}

템플릿은 다음 구조의 JSON 형식으로 정의됩니다.

```json
{
  "id": "unique-template-id",
  "title": "Display Title",
  "description": "Detailed description of what this template protects",
  "icon": "ShieldCheckIcon",
  "iconColor": "text-purple-500",
  "iconBg": "bg-purple-50",
  "guardrails": [
    "guardrail-name-1",
    "guardrail-name-2"
  ],
  "complexity": "Low|Medium|High",
  "guardrailDefinitions": [
    {
      "guardrail_name": "example-guardrail",
      "litellm_params": {
        "guardrail": "litellm_content_filter",
        "mode": "pre_call",
        "patterns": [
          {
            "pattern_type": "prebuilt",
            "pattern_name": "email",
            "action": "MASK"
          }
        ],
        "pattern_redaction_format": "[{pattern_name}_REDACTED]"
      },
      "guardrail_info": {
        "description": "What this guardrail does"
      }
    }
  ],
  "templateData": {
    "policy_name": "policy-name",
    "description": "Policy description",
    "guardrails_add": ["guardrail-name-1", "guardrail-name-2"],
    "guardrails_remove": []
  }
}
```

### 필드 설명 {#field-descriptions}

#### 표시 필드 {#display-fields}
- **id**: 고유 식별자입니다(하이픈을 사용하는 소문자).
- **title**: UI에 표시되는 사용자 대상 이름입니다.
- **description**: 템플릿이 무엇을 보호하는지 자세히 설명합니다.
- **icon**: 아이콘 이름입니다(UI 아이콘 맵에서 사용할 수 있어야 함).
- **iconColor**: Tailwind CSS 텍스트 색상 클래스입니다.
- **iconBg**: Tailwind CSS 배경 색상 클래스입니다.
- **guardrails**: 가드레일 이름 배열입니다(표시 전용).
- **complexity**: 난이도를 표시하는 배지입니다("Low", "Medium", "High").

#### 가드레일 정의 {#guardrail-definition}
- **guardrailDefinitions**: 완전한 가드레일 구성 배열입니다.
  - 각 항목은 `/guardrails` POST 엔드포인트로 보낼 수 있는 유효한 가드레일 객체여야 합니다.
  - 가드레일이 이미 존재하면 건너뜁니다.
  - 템플릿이 기존 가드레일만 사용한다면 빈 `[]`일 수 있습니다.

#### 정책 설정 {#policy-configuration}
- **templateData**: 정책 양식을 미리 채우는 객체입니다.
  - **policy_name**: 권장 이름입니다(사용자가 수정 가능).
  - **description**: 정책 설명입니다.
  - **guardrails_add**: 포함할 가드레일 이름 배열입니다.
  - **guardrails_remove**: 제거할 배열입니다(템플릿에서는 보통 `[]`).
  - **inherit**: (선택 사항) 상속을 위한 상위 정책 이름입니다.

### 예제 템플릿 {#example-template}

다음은 HIPAA 규정 준수 템플릿의 완전한 예시입니다.

```json
{
  "id": "hipaa-compliance",
  "title": "HIPAA Compliance Policy",
  "description": "Healthcare compliance policy that masks PHI and enforces HIPAA regulations for healthcare applications.",
  "icon": "ShieldCheckIcon",
  "iconColor": "text-red-500",
  "iconBg": "bg-red-50",
  "guardrails": [
    "phi-detector",
    "medical-record-blocker",
    "patient-id-masker"
  ],
  "complexity": "High",
  "guardrailDefinitions": [
    {
      "guardrail_name": "phi-detector",
      "litellm_params": {
        "guardrail": "litellm_content_filter",
        "mode": "pre_call",
        "patterns": [
          {
            "pattern_type": "prebuilt",
            "pattern_name": "us_ssn",
            "action": "MASK"
          },
          {
            "pattern_type": "prebuilt",
            "pattern_name": "email",
            "action": "MASK"
          },
          {
            "pattern_type": "prebuilt",
            "pattern_name": "us_phone",
            "action": "MASK"
          }
        ],
        "pattern_redaction_format": "[PHI_REDACTED]"
      },
      "guardrail_info": {
        "description": "Detects and masks Protected Health Information (PHI)"
      }
    }
  ],
  "templateData": {
    "policy_name": "hipaa-compliance-policy",
    "description": "HIPAA compliance policy for healthcare applications",
    "guardrails_add": [
      "phi-detector",
      "medical-record-blocker",
      "patient-id-masker"
    ],
    "guardrails_remove": []
  }
}
```

## 템플릿 기여하기 {#contributing-templates}

모두가 사용할 수 있는 정책 템플릿을 기여하려면 다음 절차를 따릅니다.

### 1단계: 템플릿 JSON 만들기 {#step-1-create-template-json}

1. 위 구조를 따르는 JSON 파일을 만듭니다.
2. 로컬 `policy_templates.json`에 추가해 로컬에서 테스트합니다.
3. 모든 가드레일이 올바르게 동작하는지 검증합니다.
4. 설명이 명확하고 도움이 되는지 확인합니다.

### 2단계: 풀 리퀘스트 제출 {#step-2-submit-pull-request}

1. [LiteLLM 저장소](https://github.com/BerriAI/litellm)를 포크합니다.
2. 루트의 `policy_templates.json`에 템플릿을 추가합니다.
3. `litellm/policy_templates_backup.json`에도 템플릿을 추가합니다(둘을 동기화 상태로 유지).
4. 다음 내용을 포함해 풀 리퀘스트를 만듭니다.
   - 템플릿이 무엇을 보호하는지에 대한 명확한 설명
   - 사용 사례 예시
   - 관련 규정 준수 프레임워크(HIPAA, GDPR, SOC 2 등)

### 가이드라인 {#guidelines}

**권장:**
- ✅ 명확하고 설명적인 이름 사용
- ✅ 포괄적인 설명 포함
- ✅ 모든 가드레일을 충분히 테스트
- ✅ 패턴 출처 문서화. 예: "NIST 가이드라인 기반"
- ✅ 관련 가드레일을 논리적으로 그룹화
- ✅ 다양한 복잡도 수준 고려

**비권장:**
- ❌ 자격 증명 또는 시크릿 포함
- ❌ 오탐을 만들 수 있는 지나치게 넓은 패턴 사용
- ❌ 기존 템플릿 중복
- ❌ 충분한 테스트 없이 사용자 지정 코드 사용

## 오프라인에서 템플릿 사용 {#using-templates-offline}

인터넷이 차단된 환경 또는 오프라인 배포에서는 다음 환경 변수를 설정합니다.

```bash
export LITELLM_LOCAL_POLICY_TEMPLATES=true
```

이 설정은 시스템이 GitHub에서 가져오는 대신 로컬 백업(`litellm/policy_templates_backup.json`)을 강제로 사용하게 합니다.

## 템플릿 소스 {#template-source}

- **GitHub (기본값):** https://raw.githubusercontent.com/BerriAI/litellm/main/policy_templates.json
- **로컬 백업:** `litellm/policy_templates_backup.json`

템플릿은 각 요청마다 GitHub에서 자동으로 가져오며, 실패하면 로컬 백업으로 대체됩니다.

## 사용 가능한 패턴 유형 {#사용-가능한-pattern-type}

템플릿용 가드레일을 만들 때 다음 사전 빌드된 패턴을 사용할 수 있습니다.

### 신분증 문서 {#identity-documents}
- `passport_australia`, `passport_us`, `passport_uk`, `passport_germany` 등
- `us_ssn`, `us_ssn_no_dash`
- `au_tfn`, `au_abn`, `au_medicare`
- `nl_bsn_contextual`
- `br_cpf`, `br_rg`, `br_cnpj`

### 금융 {#financial}
- `visa`, `mastercard`, `amex`, `discover`, `credit_card`
- `iban`

### 연락처 정보 {#contact-information}
- `email`
- `us_phone`, `br_phone_landline`, `br_phone_mobile`
- `street_address`
- `br_cep` (브라질 우편번호)

### 자격 증명 {#credentials}
- `aws_access_key`, `aws_secret_key`
- `github_token`
- `slack_token`
- `generic_api_key`

### 네트워크 {#network}
- `ipv4`, `ipv6`

### 보호 계층 {#protected-class}
- `gender_sexual_orientation`
- `race_ethnicity_national_origin`
- `religion`
- `age_discrimination`
- `disability`
- `marital_family_status`
- `military_status`
- `public_assistance`

사용 가능한 모든 패턴은 [전체 패턴 목록](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/guardrails/guardrail_hooks/litellm_content_filter/patterns.json)을 참고하세요.

## 관련 문서 {#related-문서}

- [가드레일 정책](./guardrail_policies)
- [정책 태그](./policy_tags)
- [콘텐츠 필터 패턴](../hooks/content_filter)
- [사용자 지정 코드 가드레일](../hooks/custom_code)
