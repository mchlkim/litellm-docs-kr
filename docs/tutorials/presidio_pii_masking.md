import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM으로 Presidio PII Masking 설정하기 - 전체 튜토리얼

이 튜토리얼은 Microsoft Presidio와 LiteLLM Gateway로 PII(Personally Identifiable Information) masking을 설정하는 과정을 안내합니다. 완료 후에는 LLM 요청에서 민감 정보를 자동으로 감지하고 masking하는 production-ready 구성을 갖추게 됩니다.

## 학습할 내용

- PII detection을 위한 Presidio container 배포
- 민감 data를 자동 masking하도록 LiteLLM 구성
- 실제 예제로 PII masking 테스트
- guardrail 실행 monitoring 및 tracing
- output parsing, language support 같은 고급 기능 구성

## PII Masking을 사용하는 이유

LLM을 사용할 때 사용자는 다음과 같은 민감 정보를 실수로 공유할 수 있습니다.
- 신용카드 번호
- email 주소
- 전화번호
- 사회보장번호
- 의료 정보(PHI)
- 개인 이름과 주소

PII masking은 이 정보가 LLM에 도달하기 전에 자동으로 감지하고 redaction합니다. 이를 통해 사용자 privacy를 보호하고 GDPR, HIPAA, CCPA 같은 규정 준수를 지원할 수 있습니다.

## 사전 준비

시작하기 전에 다음이 준비되어 있는지 확인하세요.
- 로컬 머신에 Docker 설치
- 테스트용 LiteLLM API key 또는 OpenAI API key
- YAML configuration에 대한 기본 이해
- 테스트용 `curl` 또는 유사한 HTTP client

## Part 1: Presidio Container 배포

Presidio는 두 가지 주요 service로 구성됩니다.
1. **Presidio Analyzer**: text에서 PII 감지
2. **Presidio Anonymizer**: 감지된 PII를 masking 또는 redaction

### Step 1.1: Docker로 배포

Presidio용 `docker-compose.yml` file을 생성합니다.

```yaml
version: '3.8'

services:
  presidio-analyzer:
    image: mcr.microsoft.com/presidio-analyzer:latest
    ports:
      - "5002:3000"
    environment:
      - GRPC_PORT=5001
    networks:
      - presidio-network

  presidio-anonymizer:
    image: mcr.microsoft.com/presidio-anonymizer:latest
    ports:
      - "5001:3000"
    networks:
      - presidio-network

networks:
  presidio-network:
    driver: bridge
```

### Step 1.2: Container 시작

```bash
docker-compose up -d
```

### Step 1.3: Presidio 실행 확인

analyzer endpoint를 테스트합니다.

```bash
curl -X POST http://localhost:5002/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My email is john.doe@example.com",
    "language": "en"
  }'
```

다음과 같은 응답이 표시되어야 합니다.

```json
[
  {
    "entity_type": "EMAIL_ADDRESS",
    "start": 12,
    "end": 33,
    "score": 1.0
  }
]
```

✅ **Checkpoint**: Presidio container가 실행 중이며 사용할 준비가 되었습니다.

## Part 2: LiteLLM Gateway 구성

이제 자동 PII masking에 Presidio를 사용하도록 LiteLLM을 구성합니다.

### Step 2.1: LiteLLM 설정 생성

`config.yaml` file을 생성합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "presidio-pii-guard"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"  # Run before LLM call
      presidio_score_thresholds:  # optional confidence score thresholds for detections
        CREDIT_CARD: 0.8
        EMAIL_ADDRESS: 0.6
      pii_entities_config:
        CREDIT_CARD: "MASK"
        EMAIL_ADDRESS: "MASK"
        PHONE_NUMBER: "MASK"
        PERSON: "MASK"
        US_SSN: "MASK"
```

### Step 2.2: Environment variable 설정

```bash
export OPENAI_API_KEY="your-openai-key"
export PRESIDIO_ANALYZER_API_BASE="http://localhost:5002"
export PRESIDIO_ANONYMIZER_API_BASE="http://localhost:5001"
```

### Step 2.3: LiteLLM Gateway 시작

```bash
litellm --config config.yaml --port 4000 --detailed_debug
```

guardrail이 load되었음을 나타내는 output이 표시되어야 합니다.

```
Loaded guardrails: ['presidio-pii-guard']
```

✅ **Checkpoint**: PII masking이 활성화된 LiteLLM Gateway가 실행 중입니다.

## Part 3: PII Masking 테스트

다양한 유형의 민감 data로 PII masking을 테스트합니다.

### Test 1: 기본 PII Detection

<Tabs>
<TabItem label="PII가 포함된 요청" value="pii-request">

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "My name is John Smith, my email is john.smith@example.com, and my credit card is 4111-1111-1111-1111"
      }
    ],
    "guardrails": ["presidio-pii-guard"]
  }'
```

</TabItem>

<TabItem label="LLM이 받는 내용" value="masked">

LLM은 masking된 version을 받습니다.

```
My name is <PERSON>, my email is <EMAIL_ADDRESS>, and my credit card is <CREDIT_CARD>
```

</TabItem>

<TabItem label="Response" value="response">

```json
{
  "id": "chatcmpl-123abc",
  "choices": [
    {
      "message": {
        "content": "I can see you've provided some information. However, I noticed some sensitive data placeholders. For security reasons, I recommend not sharing actual personal information like credit card numbers.",
        "role": "assistant"
      },
      "finish_reason": "stop"
    }
  ],
  "model": "gpt-3.5-turbo"
}
```

</TabItem>
</Tabs>

### Test 2: 의료 정보(PHI)

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Patient Jane Doe, DOB 01/15/1980, MRN 123456, presents with symptoms of fever."
      }
    ],
    "guardrails": ["presidio-pii-guard"]
  }'
```

환자 이름과 medical record number가 자동으로 masking됩니다.

### Test 3: PII 없음(일반 요청)

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ],
    "guardrails": ["presidio-pii-guard"]
  }'
```

PII가 감지되지 않으므로 이 요청은 변경 없이 통과합니다.

✅ **Checkpoint**: PII masking 테스트를 성공적으로 완료했습니다.

## Part 4: 고급 설정

### 민감 Entity 차단

masking 대신 특정 PII type이 포함된 요청을 완전히 차단할 수 있습니다.

```yaml
guardrails:
  - guardrail_name: "presidio-block-guard"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      pii_entities_config:
        US_SSN: "BLOCK"  # Block any request with SSN
        CREDIT_CARD: "BLOCK"  # Block credit card numbers
        MEDICAL_LICENSE: "BLOCK"
```

차단 동작을 테스트합니다.

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "My SSN is 123-45-6789"}
    ],
    "guardrails": ["presidio-block-guard"]
  }'
```

예상 응답:

```json
{
  "error": {
    "message": "Blocked PII entity detected: US_SSN by Guardrail: presidio-block-guard."
  }
}
```

### 출력 파싱(Unmasking) {#output-parsing-unmasking}

LLM 응답의 masked token을 원래 값으로 자동 치환하려면 output parsing을 활성화합니다.

```yaml
guardrails:
  - guardrail_name: "presidio-output-parse"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      output_parse_pii: true  # Enable output parsing
      pii_entities_config:
        PERSON: "MASK"
        PHONE_NUMBER: "MASK"
```

**동작 방식:**

1. **사용자 입력**: "안녕하세요, 제 이름은 Jane Doe입니다. 제 번호는 555-1234입니다."
2. **LLM이 받는 내용**: "안녕하세요, 제 이름은 `<PERSON>`입니다. 제 번호는 `<PHONE_NUMBER>`입니다."
3. **LLM 응답**: "만나서 반갑습니다, `<PERSON>`님!"
4. **사용자가 받는 내용**: "만나서 반갑습니다, Jane Doe님!" ✨

### Multi-language 지원

여러 language에 대해 PII detection을 구성합니다.

```yaml
guardrails:
  - guardrail_name: "presidio-spanish"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_language: "es"  # Spanish
      pii_entities_config:
        CREDIT_CARD: "MASK"
        PERSON: "MASK"
        
  - guardrail_name: "presidio-german"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_language: "de"  # German
      pii_entities_config:
        CREDIT_CARD: "MASK"
        PERSON: "MASK"
```

요청별로 language를 override할 수도 있습니다.

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Mi tarjeta de crédito es 4111-1111-1111-1111"}
    ],
    "guardrails": ["presidio-spanish"],
    "guardrail_config": {"language": "fr"}
  }'
```

### Logging-Only Mode

실제 LLM 요청이 아닌 log에만 PII masking을 적용합니다.

```yaml
guardrails:
  - guardrail_name: "presidio-logging"
    litellm_params:
      guardrail: presidio
      mode: "logging_only"  # Only mask in logs
      pii_entities_config:
        CREDIT_CARD: "MASK"
        EMAIL_ADDRESS: "MASK"
```

다음 경우에 유용합니다.
- production 요청에서는 PII를 허용해야 함
- 하지만 logging 규정을 준수해야 함
- Langfuse, Datadog 등과 integration 중임

## Part 5: Monitoring 및 Tracing

### LiteLLM UI에서 Guardrail 실행 보기

LiteLLM 관리자 UI를 사용 중이면 상세 guardrail trace를 볼 수 있습니다.

1. **로그** page로 이동합니다.
2. guardrail을 사용한 요청을 클릭합니다.
3. 상세 정보를 확인합니다.
   - 감지된 entity
   - detection별 confidence score
   - guardrail 실행 duration
   - 원본 content와 masked content 비교

<Image 
  img={require('../../img/presidio_4.png')}
  style={{width: '60%', display: 'block', margin: '0'}}
/>

### Langfuse 연동

Langfuse로 logging 중이면 guardrail 정보가 자동으로 포함됩니다.

```yaml
litellm_settings:
  success_callback: ["langfuse"]

environment_variables:
  LANGFUSE_PUBLIC_KEY: "your-public-key"
  LANGFUSE_SECRET_KEY: "your-secret-key"
```

<Image 
  img={require('../../img/presidio_5.png')}
  style={{width: '60%', display: 'block', margin: '0'}}
/>

### Guardrail Metadata에 Programmatic Access

custom callback에서 guardrail metadata에 access할 수 있습니다.

```python
import litellm

def custom_callback(kwargs, result, **callback_kwargs):
    # Access guardrail metadata
    metadata = kwargs.get("metadata", {})
    guardrail_results = metadata.get("guardrails", {})
    
    print(f"Masked entities: {guardrail_results}")
    
litellm.callbacks = [custom_callback]
```

## Part 6: Production 권장 사항

### 1. Performance 최적화

**pre-call guardrail에는 병렬 실행을 사용하세요.**

```yaml
guardrails:
  - guardrail_name: "presidio-guard"
    litellm_params:
      guardrail: presidio
      mode: "during_call"  # Runs in parallel with LLM call
```

### 2. Use case별 Entity Type 구성

**Healthcare Application:**

```yaml
pii_entities_config:
  PERSON: "MASK"
  MEDICAL_LICENSE: "BLOCK"
  US_SSN: "BLOCK"
  PHONE_NUMBER: "MASK"
  EMAIL_ADDRESS: "MASK"
  DATE_TIME: "MASK"  # May contain appointment dates
```

**Financial Application:**

```yaml
pii_entities_config:
  CREDIT_CARD: "BLOCK"
  US_BANK_NUMBER: "BLOCK"
  US_SSN: "BLOCK"
  PHONE_NUMBER: "MASK"
  EMAIL_ADDRESS: "MASK"
  PERSON: "MASK"
```

**Customer Support Application:**

```yaml
pii_entities_config:
  EMAIL_ADDRESS: "MASK"
  PHONE_NUMBER: "MASK"
  PERSON: "MASK"
  CREDIT_CARD: "BLOCK"  # Should never be shared
```

### 3. High Availability 구성

production 배포에서는 여러 Presidio instance를 실행합니다.

```yaml
version: '3.8'

services:
  presidio-analyzer-1:
    image: mcr.microsoft.com/presidio-analyzer:latest
    ports:
      - "5002:3000"
    deploy:
      replicas: 3
      
  presidio-anonymizer-1:
    image: mcr.microsoft.com/presidio-anonymizer:latest
    ports:
      - "5001:3000"
    deploy:
      replicas: 3
```

load balancer(nginx, HAProxy)를 사용해 요청을 분산합니다.

### 4. Custom Entity 인식 {#custom-entity-recognition}

domain-specific PII(예: 내부 employee ID)를 위해 custom recognizer를 생성합니다.

`custom_recognizers.json`을 생성합니다.

```json
[
  {
    "supported_language": "en",
    "supported_entity": "EMPLOYEE_ID",
    "patterns": [
      {
        "name": "employee_id_pattern",
        "regex": "EMP-[0-9]{6}",
        "score": 0.9
      }
    ]
  }
]
```

LiteLLM에서 구성합니다.

```yaml
guardrails:
  - guardrail_name: "presidio-custom"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_ad_hoc_recognizers: "./custom_recognizers.json"
      pii_entities_config:
        EMPLOYEE_ID: "MASK"
```

### 5. Testing Strategy

PII masking용 test case를 생성합니다.

```python
import pytest
from litellm import completion

def test_pii_masking_credit_card():
    """Test that credit cards are properly masked"""
    response = completion(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "user",
            "content": "My card is 4111-1111-1111-1111"
        }],
        api_base="http://localhost:4000",
        metadata={
            "guardrails": ["presidio-pii-guard"]
        }
    )
    
    # Verify the card number was masked
    metadata = response.get("_hidden_params", {}).get("metadata", {})
    assert "CREDIT_CARD" in str(metadata.get("guardrails", {}))

def test_pii_masking_allows_normal_text():
    """Test that normal text passes through"""
    response = completion(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "user",
            "content": "What is the weather today?"
        }],
        api_base="http://localhost:4000",
        metadata={
            "guardrails": ["presidio-pii-guard"]
        }
    )
    
    assert response.choices[0].message.content is not None
```

## Part 7: 문제 해결

### Issue: Guardrail failure: Presidio의 non-JSON response

**증상:** `expected application/json Content-Type but received text/html` 또는 유사한 error가 발생합니다.

**원인:** ingress controller 또는 reverse proxy가 `/analyze` 또는 `/anonymize` POST 요청을 JSON 대신 plain text를 반환하는 health endpoint(`/health`, `/presidio-analyzer/health` 등)로 routing하고 있을 수 있습니다.

**해결:** `PRESIDIO_ANALYZER_API_BASE`와 `PRESIDIO_ANONYMIZER_API_BASE`가 Presidio API endpoint를 직접 가리키는지 확인하세요. 또는 ingress가 path를 strip하지 않고 올바르게 route하며 plain-text health check endpoint로 잘못 forwarding하지 않는지 확인합니다.

**검증:** `curl`로 endpoint를 확인할 수 있습니다. `text/html`이 아니라 JSON array를 반환해야 합니다.
```bash
curl -sv -X POST http://your-analyzer-endpoint/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"test","language":"en"}'
```

### Issue: Presidio가 PII를 감지하지 못함

**Check 1: Language 설정**

```bash
# Verify language is set correctly
curl -X POST http://localhost:5002/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Meine E-Mail ist test@example.de",
    "language": "de"
  }'
```

**Check 2: Entity Type**

찾으려는 entity type이 config에 포함되어 있는지 확인합니다.

```yaml
pii_entities_config:
  CREDIT_CARD: "MASK"
  # Add all entity types you need
```

[지원되는 모든 entity type 보기](https://microsoft.github.io/presidio/supported_entities/)

### Issue: Presidio Container가 시작되지 않음

**log 확인:**

```bash
docker-compose logs presidio-analyzer
docker-compose logs presidio-anonymizer
```

**일반적인 문제:**
- port conflict(5001, 5002가 이미 사용 중)
- memory allocation 부족
- Docker network 문제

### Issue: 높은 Latency

**Solution 1: `during_call` mode 사용**

```yaml
mode: "during_call"  # Runs in parallel
```

**Solution 2: Presidio container scale-out**

```yaml
deploy:
  replicas: 3
```

**Solution 3: caching 활성화**

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: "redis"
```

## 결론

Presidio와 LiteLLM으로 PII masking을 성공적으로 설정했습니다. 이제 다음을 갖추었습니다.

✅ production-ready PII masking 솔루션  
✅ 민감 정보 자동 detection  
✅ 여러 configuration option(masking vs. blocking)  
✅ monitoring 및 tracing capability  
✅ multi-language 지원  
✅ production 배포 best practice  

## 다음 단계

- **[지원되는 모든 PII entity type 보기](https://microsoft.github.io/presidio/supported_entities/)**
- **[다른 LiteLLM guardrail 살펴보기](../proxy/guardrails/quick_start)**
- **[여러 guardrail 설정](../proxy/guardrails/quick_start#combining-multiple-guardrails)**
- **[key별 guardrail 구성](../proxy/virtual_keys#guardrails)**
- **[custom guardrail 학습](../proxy/guardrails/custom_guardrail)**

## 추가 자료

- [Presidio 문서](https://microsoft.github.io/presidio/)
- [LiteLLM 가드레일 Reference](../proxy/guardrails/pii_masking_v2)
- [LiteLLM GitHub Repository](https://github.com/BerriAI/litellm)
- [Issue 보고](https://github.com/BerriAI/litellm/issues)

---

**도움이 필요하신가요?** [Discord community](https://discord.com/invite/wuPM9dRgDw)에 참여하거나 GitHub issue를 열어 주세요.

### False Positive 억제

Presidio는 때때로 false positive detection을 발생시킬 수 있습니다. 예를 들어 짧은 alphanumeric string이 `US_DRIVER_LICENSE`로 잘못 flag될 수 있습니다.

`presidio_score_thresholds` 또는 `presidio_entities_deny_list`를 사용해 이러한 false positive를 억제할 수 있습니다.

```yaml
guardrails:
  - guardrail_name: presidio-pii
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_analyzer_api_base: "http://localhost:5002/"
      presidio_anonymizer_api_base: "http://localhost:5001/"
      
      # Use high score thresholds to reduce false positives
      presidio_score_thresholds:
        US_DRIVER_LICENSE: 0.85
        ALL: 0.5
      
      # Or exclude certain entity types entirely from detection
      presidio_entities_deny_list:
        - US_DRIVER_LICENSE
```
