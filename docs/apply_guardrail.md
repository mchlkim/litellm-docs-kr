import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /guardrails/apply_guardrail

이 엔드포인트를 사용하면 LiteLLM 인스턴스에 설정된 guardrail을 직접 호출할 수 있습니다. guardrail을 직접 호출해야 하는 서비스가 있을 때 유용합니다.

## 지원되는 Guardrail 유형

이 엔드포인트는 다음을 포함한 다양한 guardrail 유형을 지원합니다.
- **Presidio** - PII 감지 및 마스킹
- **Bedrock** - 콘텐츠 조정을 위한 AWS Bedrock guardrails
- **Lakera** - AI 안전 guardrails
- **PANW Prisma AIRS** - 위협 감지, DLP 및 정책 적용
- **Custom guardrails** - 사용자 정의 guardrails

## 설정

### Bedrock Guardrail 설정

apply_guardrail 엔드포인트에서 Bedrock guardrails를 사용하려면 LiteLLM config.yaml에 guardrail을 설정하세요.

```yaml
guardrails:
  - guardrail_name: "bedrock-content-guard"
    litellm_params:
      guardrail: bedrock
      mode: "pre_call"
      guardrailIdentifier: "your-guardrail-id"  # Your actual Bedrock guardrail ID
      guardrailVersion: "DRAFT"  # or your version number
      aws_region_name: "us-east-1"  # Your AWS region
      aws_role_name: "your-role-arn"  # Your AWS role with Bedrock permissions
      default_on: true
```

**필수 AWS 설정:**
1. AWS Console에서 Bedrock guardrail을 생성합니다.
2. guardrail ID와 버전을 가져옵니다.
3. AWS credentials에 Bedrock 권한이 있는지 확인합니다.
4. LiteLLM config에 guardrail을 설정합니다.


## 사용법
---

<Tabs>
<TabItem value="presidio" label="Presidio PII Guardrail" default>

이 예제에서 `mask_pii`는 LiteLLM에 설정된 Presidio guardrail입니다.

```bash showLineNumbers title="엔드포인트 호출 예제"
curl -X POST 'http://localhost:4000/guardrails/apply_guardrail' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer your-api-key' \
-d '{
    "guardrail_name": "mask_pii",
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en",
    "entities": ["NAME", "EMAIL"]
}'
```

</TabItem>
<TabItem value="bedrock" label="Bedrock Guardrail">

이 예제에서 `bedrock-content-guard`는 LiteLLM에 설정된 Bedrock guardrail입니다.

```bash showLineNumbers title="엔드포인트 호출 예제"
curl -X POST 'http://localhost:4000/guardrails/apply_guardrail' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer your-api-key' \
-d '{
    "guardrail_name": "bedrock-content-guard",
    "text": "This is potentially harmful content that should be blocked",
    "language": "en"
}'
```

**참고**: Bedrock guardrails에서는 Bedrock이 자체 정책에 따라 콘텐츠 조정을 처리하므로 `entities` 파라미터를 사용하지 않습니다.

</TabItem>
</Tabs>


## 요청 형식
---

요청 본문은 ApplyGuardrailRequest 형식을 따라야 합니다.

#### 예제 요청 본문

```json
{
    "guardrail_name": "mask_pii",
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en",
    "entities": ["NAME", "EMAIL"]
}
```

#### 필수 필드
- **guardrail_name** (string):  
  적용할 guardrail의 식별자입니다(예: "mask_pii").
- **text** (string):  
  guardrail을 통해 처리할 입력 텍스트입니다.

#### 선택 필드
- **language** (string):  
  입력 텍스트의 언어입니다(예: 영어의 경우 "en").
- **entities** (*string array*):  
  처리하거나 필터링할 특정 entities입니다(예: ["NAME", "EMAIL"]).

## 응답 형식
---

응답에는 guardrail을 적용한 뒤 처리된 텍스트가 포함됩니다.

#### 예제 응답

<Tabs>
<TabItem value="presidio" label="Presidio 응답" default>

```json
{
    "response_text": "My name is [REDACTED] and my email is [REDACTED]"
}
```

</TabItem>
<TabItem value="bedrock" label="Bedrock 응답">

```json
{
    "response_text": "This is potentially harmful content that should be blocked"
}
```

**참고**: Bedrock guardrail이 콘텐츠를 차단하면 엔드포인트는 차단 사유와 함께 오류를 반환합니다.

</TabItem>
</Tabs>

#### 응답 필드
- **response_text** (string):  
  guardrail을 적용한 뒤의 텍스트입니다.

#### 오류 응답

guardrail이 콘텐츠를 차단하면(예: Bedrock guardrail) 엔드포인트는 오류를 반환합니다.

```json
{
    "detail": "Content blocked by Bedrock guardrail: Content violates policy"
}
```
