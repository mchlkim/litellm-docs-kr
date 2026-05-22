import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';


# LiteLLM Content Filter(내장 Guardrail) {#litellm-content-filter-built-in-guardrail}

regex pattern과 keyword matching으로 민감 정보를 감지하고 필터링하는 **내장 guardrail**입니다. 외부 dependency가 필요하지 않습니다.

**언제 사용하나요?** 민감 정보 감지에 ML model이 필요하지 않은 경우에 적합합니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | regex pattern과 keyword matching으로 민감 정보를 감지하고 필터링하는 기기 내 guardrail입니다. LiteLLM에 내장되어 있으며 외부 dependency가 없습니다. |
| Guardrail 이름 | `litellm_content_filter` |
| 감지 방법 | Prebuilt regex pattern, custom regex, keyword matching |
| 작업 | `BLOCK`(요청 거부), `MASK`(content redaction) |
| 지원 Mode | `pre_call`, `post_call`, `during_call`(streaming) |
| 성능 | 빠름 - 로컬에서 실행되며 외부 API call이 없습니다. |

## 빠른 시작

## LiteLLM UI

### Step 1: LiteLLM Content Filter 선택 {#step-1-select-litellm-content-filter}

"Add New Guardrail"을 클릭하고 guardrail provider로 "LiteLLM Content Filter"를 선택합니다.

<Image img={require('../../../img/create_guard.gif')} alt="LiteLLM Content Filter 선택" />

### Step 2: Pattern Detection 설정 {#step-2-configure-pattern-detection}

차단하거나 mask할 prebuilt entity를 선택합니다. 이 예제에서는 email address를 감지하고 차단하기 위해 "Email"을 선택합니다.

custom entity를 차단해야 한다면 "Add custom regex"를 클릭해 custom regex pattern을 추가할 수 있습니다.

<Image img={require('../../../img/add_Guard2.gif')} alt="prebuilt entity 선택 또는 custom regex 추가" />

### Step 3: 차단 Keyword 추가 {#step-3-add-blocked-keywords}

차단할 특정 keyword를 입력합니다. 특정 단어나 문구를 차단해야 하는 policy가 있을 때 유용합니다.

<Image img={require('../../../img/create_guard3.gif')} alt="차단 keyword 추가" />

### Step 4: Guardrail 테스트 {#step-4-test-guardrail}

Guardrail을 만든 뒤 "Test Playground"로 이동해 테스트합니다. 방금 만든 guardrail을 선택하세요.

테스트 예시:
- **차단 keyword test**: "blue"를 blocked keyword로 설정했으므로 "hi blue"를 입력하면 block이 trigger됩니다.
- **Pattern detection test**: "Hi ishaan@berri.ai"를 입력하면 email pattern detector가 trigger됩니다.

<Image img={require('../../../img/add_guard5.gif')} alt="playground에서 guardrail 테스트" />

## LiteLLM Config.yaml 설정

### Step 1: config.yaml에 Guardrail 정의 {#step-1-define-guardrail-in-configyaml}

<Tabs>
<TabItem label="유해 콘텐츠 감지" value="harmful">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "harmful-content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      # Enable harmful content categories
      categories:
        - category: "harmful_self_harm"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "harmful_illegal_weapons"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
```

</TabItem>

<TabItem label="PII 보호" value="pii">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "content-filter-pre"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      # Prebuilt patterns for common PII
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "BLOCK"
        
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
      
      # Custom blocked keywords
      blocked_words:
        - keyword: "confidential"
          action: "BLOCK"
          description: "Sensitive internal information"
```

</TabItem>

<TabItem label="조합 예시" value="combined">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "comprehensive-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      # Harmful content categories
      categories:
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"
      
      # PII patterns
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "BLOCK"
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
      
      # Custom keywords
      blocked_words:
        - keyword: "confidential"
          action: "BLOCK"
```

</TabItem>
</Tabs>

### Step 2: LiteLLM Gateway 시작 {#step-2-start-litellm-gateway}

```shell
litellm --config config.yaml
```

### Step 3: 요청 테스트 {#step-3-test-requests}

<Tabs>
<TabItem label="SSN 차단" value="ssn-blocked">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "My SSN is 123-45-6789"}
    ],
    "guardrails": ["content-filter-pre"]
  }'
```

**응답: HTTP 400 Error**
```json
{
  "error": {
    "message": {
      "error": "Content blocked: us_ssn pattern detected",
      "pattern": "us_ssn"
    },
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="Email Masking" value="email-masked">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Contact me at john@example.com"}
    ],
    "guardrails": ["content-filter-pre"]
  }'
```

Email이 mask된 상태로 요청이 LLM에 전송됩니다.
```
Contact me at [EMAIL_REDACTED]
```

</TabItem>
</Tabs>

## 설정

### 지원 Mode

- **`pre_call`** - LLM 호출 전에 실행되어 input message를 필터링합니다.
- **`post_call`** - LLM 호출 후에 실행되어 output response를 필터링합니다.
- **`during_call`** - streaming 중 실행되어 각 chunk를 real-time으로 필터링합니다.

### 작업 {#actions}

- **`BLOCK`** - HTTP 400 error로 요청을 거부합니다.
- **`MASK`** - 민감 content를 redaction tag로 교체합니다. 예: `[EMAIL_REDACTED]`

## 사전 제공 Pattern {#prebuilt-pattern}

### 사용 가능한 Pattern {#available-patterns}

| Pattern 이름 | 설명 | 예제 |
|-------------|-------------|---------|
| `us_ssn` | 미국 Social Security Number | `123-45-6789` |
| `email` | Email address | `user@example.com` |
| `phone` | 전화번호 | `+1-555-123-4567` |
| `visa` | Visa 신용카드 | `4532-1234-5678-9010` |
| `mastercard` | Mastercard 신용카드 | `5425-2334-3010-9903` |
| `amex` | American Express 카드 | `3782-822463-10005` |
| `aws_access_key` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `aws_secret_key` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfi...` |
| `github_token` | GitHub token | `example-github-token-123` |

### 사전 제공 Pattern 사용 {#using-prebuilt-patterns}

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "BLOCK"
        
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
        
        - pattern_type: "prebuilt"
          pattern_name: "aws_access_key"
          action: "BLOCK"
```

## 사용자 정의 Regex Pattern {#custom-regex-pattern}

domain-specific 민감 데이터를 위한 자체 regex pattern을 정의합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "custom-patterns"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      patterns:
        # Custom employee ID format
        - pattern_type: "regex"
          pattern: '\b[A-Z]{3}-\d{4}\b'
          name: "employee_id"
          action: "MASK"
        
        # Custom project code format
        - pattern_type: "regex"
          pattern: 'PROJECT-\d{6}'
          name: "project_code"
          action: "BLOCK"
```

## Keyword 필터링 {#keyword-filtering}

특정 keyword를 차단하거나 mask합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "keyword-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      blocked_words:
        - keyword: "confidential"
          action: "BLOCK"
          description: "Internal confidential information"
        
        - keyword: "proprietary"
          action: "MASK"
          description: "Proprietary company data"
        
        - keyword: "secret_project"
          action: "BLOCK"
```

### File에서 Keyword 로드 {#load-keywords-from-file}

keyword 목록이 큰 경우 YAML file을 사용합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "keyword-file-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      blocked_words_file: "/path/to/sensitive_keywords.yaml"
```

```yaml showLineNumbers title="sensitive_keywords.yaml"
blocked_words:
  - keyword: "project_apollo"
    action: "BLOCK"
    description: "Confidential project codename"
  
  - keyword: "internal_api"
    action: "MASK"
    description: "Internal API references"
  
  - keyword: "customer_database"
    action: "BLOCK"
    description: "Protected database name"
```

## Streaming 지원 {#streaming-support}

Content filter는 각 chunk를 확인하여 streaming response에서도 동작합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "streaming-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "during_call"  # Check each streaming chunk
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
```

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me about yourself"}],
    stream=True,
    extra_body={"guardrails": ["streaming-filter"]}
)

for chunk in response:
    print(chunk.choices[0].delta.content)
    # Emails automatically masked in real-time
```

## Image 콘텐츠 필터링 {#image-content-filtering}

Content filter는 image description을 생성한 뒤 text description에 filter를 적용해 image를 분석할 수 있습니다.

:::warning

vision-capable model의 속도에 따라 요청에 상당한 latency가 추가될 수 있습니다.

image가 포함된 각 요청이 description 생성을 위해 vision-capable model로 전송되기 때문입니다.

:::

### 설정


```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4-vision
    litellm_params:
      model: openai/gpt-4-vision-preview
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "image-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      image_model: "gpt-4-vision"  # value is `model_name` of the vision-capable model
      
      # Apply same filters to image descriptions
      categories:
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
      
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
```

### 동작 방식

1. Image가 text description 생성을 위해 vision model로 전송됩니다.
2. Content filter가 description에 적용됩니다.
3. harmful content가 감지되면 image에 대한 context와 함께 요청이 차단됩니다.

**예제:**

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="gpt-4-vision",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    }],
    extra_body={"guardrails": ["image-filter"]}
)
```

Image description에 filtered content가 포함되어 있으면 다음 응답을 받습니다.

```json
{
  "error": "Content blocked: harmful_violence category keyword 'weapon' detected (severity: high) (Image description): The image shows..."
}
```

## Redaction Tag 사용자 지정 {#redaction-tag-customizing}

`MASK` action을 사용하면 민감 content가 redaction tag로 교체됩니다. 이 tag의 표시 방식을 custom할 수 있습니다.

### 기본 동작

**Pattern:** 각 pattern type은 pattern name에 따라 자체 tag를 받습니다.
```
Input:  "My email is john@example.com and SSN is 123-45-6789"
Output: "My email is [EMAIL_REDACTED] and SSN is [US_SSN_REDACTED]"
```

**Keyword:** 모든 keyword는 동일한 generic tag를 사용합니다.
```
Input:  "This is confidential and proprietary information"
Output: "This is [KEYWORD_REDACTED] and [KEYWORD_REDACTED] information"
```

### Tag 사용자 지정 {#tag-customizing}

`pattern_redaction_format`과 `keyword_redaction_tag`를 사용해 redaction format을 변경합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "custom-redaction"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      pattern_redaction_format: "***{pattern_name}***"  # Use {pattern_name} placeholder
      keyword_redaction_tag: "***REDACTED***"
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "MASK"
      blocked_words:
        - keyword: "confidential"
          action: "MASK"
```

**출력:**
```
Input:  "Email john@example.com, SSN 123-45-6789, confidential data"
Output: "Email ***EMAIL***, SSN ***US_SSN***, ***REDACTED*** data"
```

**핵심 사항:**
- `pattern_redaction_format`에는 `{pattern_name}` placeholder가 반드시 포함되어야 합니다.
- Pattern name은 자동으로 uppercase 처리됩니다. 예: `email` → `EMAIL`
- `keyword_redaction_tag`는 fixed string입니다(placeholder 없음).

## Content Category {#content-category}

Prebuilt category는 harmful content, bias, inappropriate advice를 감지하기 위해 **keyword matching**을 사용합니다. keyword는 word boundary(단일 단어) 또는 substring(여러 단어 문구)으로 matching되며 대소문자를 구분하지 않습니다.

### 사용 가능한 Category {#available-categories}

| Category | 설명 |
|----------|-------------|
| **유해 콘텐츠** | |
| `harmful_self_harm` | 자해, suicide, eating disorder |
| `harmful_violence` | 폭력, criminal planning, attack |
| `harmful_illegal_weapons` | 불법 무기, explosive, dangerous material |
| **Bias 감지** | |
| `bias_gender` | gender 기반 차별, stereotype |
| `bias_sexual_orientation` | LGBTQ+ 차별, homophobia, transphobia |
| `bias_racial` | racial/ethnic 차별, stereotype |
| `bias_religious` | 종교 차별, stereotype |
| **거부된 조언** | |
| `denied_financial_advice` | 개인화된 금융 조언, 투자 추천 |
| `denied_medical_advice` | 의료 조언, 진단, 치료 추천 |
| `denied_legal_advice` | 법률 조언, 대리, 법률 전략 |

:::info Bias Detection 고려 사항

Bias detection은 **복잡하고 context-dependent**합니다. Rule-based system은 명시적인 discriminatory language를 잡아내지만 legitimate discussion에서 false positive를 만들 수 있습니다. **high severity threshold**로 시작해 충분히 테스트하세요. mission-critical bias detection에는 AI-based guardrail(예: HiddenLayer, Lakera)과의 조합을 고려하세요.

:::

### 설정

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      categories:
        - category: "harmful_self_harm"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"  # Blocks medium+ severity
        
        - category: "bias_gender"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"  # Only explicit discrimination
        
        - category: "denied_financial_advice"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
```

**Severity Threshold:**
- `"high"` - high severity item만 차단합니다.
- `"medium"` - medium 및 high severity를 차단합니다(기본값).
- `"low"` - 모든 severity level을 차단합니다.

### 사용자 정의 Category File {#custom-category-file}

custom keyword list로 기본 category를 override합니다.

```yaml showLineNumbers title="config.yaml"
categories:
  - category: "harmful_self_harm"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
    category_file: "/path/to/custom.yaml"
```

```yaml showLineNumbers title="custom.yaml"
category_name: "harmful_self_harm"
description: "Custom self-harm detection"
default_action: "BLOCK"

keywords:
  - keyword: "suicide"
    severity: "high"
  - keyword: "harm myself"
    severity: "high"

exceptions:
  - "suicide prevention"
  - "mental health"
```

## 사용 사례 {#use-case}

### 1. Harmful Content 감지 {#1-harmful-content-detection}

harmful, illegal, dangerous content가 포함된 요청을 차단하거나 감지합니다.

```yaml
categories:
  - category: "harmful_self_harm"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
  - category: "harmful_violence"
    enabled: true
    action: "BLOCK"
    severity_threshold: "high"
  - category: "harmful_illegal_weapons"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
```

### 2. Bias 및 차별 감지 {#2-bias-and-discrimination-detection}

여러 차원에서 biased, discriminatory, hateful content를 감지하고 차단합니다.

```yaml
categories:
  # Gender-based discrimination
  - category: "bias_gender"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
  
  # LGBTQ+ discrimination
  - category: "bias_sexual_orientation"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
  
  # Racial/ethnic discrimination
  - category: "bias_racial"
    enabled: true
    action: "BLOCK"
    severity_threshold: "high"  # Only explicit to reduce false positives
  
  # Religious discrimination
  - category: "bias_religious"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
```

**Sensitivity Tuning:**

bias detection에서는 safety와 legitimate discourse의 균형을 맞추기 위해 severity threshold가 중요합니다.

```yaml
# Conservative (low false positives, may miss subtle bias)
categories:
  - category: "bias_racial"
    severity_threshold: "high"  # Only blocks explicit discriminatory language

# Balanced (recommended)
categories:
  - category: "bias_gender"
    severity_threshold: "medium"  # Blocks stereotypes and explicit discrimination

# Strict (high safety, may have more false positives)
categories:
  - category: "bias_sexual_orientation"
    severity_threshold: "low"  # Blocks all potentially problematic content
```



### 3. PII 보호 {#3-pii-protection}
LLM으로 전송하기 전에 personally identifiable information을 차단하거나 mask합니다.

```yaml
patterns:
  - pattern_type: "prebuilt"
    pattern_name: "us_ssn"
    action: "BLOCK"
  - pattern_type: "prebuilt"
    pattern_name: "email"
    action: "MASK"
```

### 2. Credential 감지 {#2-credential-detection}
API key와 secret이 노출되지 않도록 방지합니다.

```yaml
patterns:
  - pattern_type: "prebuilt"
    pattern_name: "aws_access_key"
    action: "BLOCK"
  - pattern_type: "prebuilt"
    pattern_name: "github_token"
    action: "BLOCK"
```

### 3. 민감한 내부 데이터 보호 {#3-sensitive-internal-data-protection}
confidential internal project, codename, proprietary information에 대한 reference를 차단하거나 mask합니다.

```yaml
blocked_words:
  - keyword: "project_titan"
    action: "BLOCK"
    description: "Confidential project codename"
  - keyword: "internal_api"
    action: "MASK"
    description: "Internal system references"
```

민감 용어 목록이 큰 경우 file을 사용합니다.
```yaml
blocked_words_file: "/path/to/sensitive_terms.yaml"
```

### 4. Consumer Application을 위한 안전한 AI {#4-safe-ai-for-consumer-applications}

consumer-facing AI에는 harmful content와 bias detection을 결합합니다.

```yaml
guardrails:
  - guardrail_name: "safe-consumer-ai"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      categories:
        # Harmful content - strict
        - category: "harmful_self_harm"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        # Bias detection - balanced
        - category: "bias_gender"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"  # Avoid blocking legitimate gender discussions
        
        - category: "bias_sexual_orientation"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "bias_racial"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"  # Education and news may discuss race
```

**적합한 용도:**
- Chatbot 및 virtual assistant
- 교육용 AI 도구
- 고객 서비스 AI
- 콘텐츠 생성 플랫폼
- 공개 사용자 대상 AI application

### 5. Compliance {#5-compliance}
민감한 data type을 필터링해 regulatory compliance를 보장합니다.

```yaml
# Categories checked first (high priority)
# Category keywords are matched first
categories:
  - category: "harmful_self_harm"
    severity_threshold: "high"

# Then regex patterns
patterns:
  - pattern_type: "prebuilt"
    pattern_name: "visa"
    action: "BLOCK"
  - pattern_type: "prebuilt"
    pattern_name: "us_ssn"
    action: "BLOCK"
```
