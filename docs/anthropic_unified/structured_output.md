import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 구조화된 출력 /v1/messages {#structured-output-v1messages}

LiteLLM을 사용해 `/v1/messages` 엔드포인트로 Anthropic의 구조화된 출력 기능을 호출합니다.

## 지원 프로바이더

| Provider | 지원 여부 | 참고 |
|----------|-----------|-------|
| Anthropic | ✅ | 네이티브 지원 |
| Azure AI (Anthropic models) | ✅ | Azure AI의 Claude models |
| Bedrock (Converse Anthropic models) | ✅ | Bedrock Converse API를 통한 Claude models |
| Bedrock (Invoke Anthropic models) | ✅ | Bedrock Invoke API를 통한 Claude models |

## 사용법

### LiteLLM Proxy 서버 {#litellm-proxy-server}

<Tabs>
<TabItem value="anthropic" label="Anthropic">

1. config.yaml 설정

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```

</TabItem>

<TabItem value="azure_ai" label="Azure AI (Anthropic)">

1. config.yaml 설정

```yaml
model_list:
  - model_name: azure-claude-sonnet
    litellm_params:
      model: azure_ai/claude-sonnet-4-5-20250514
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: https://your-endpoint.inference.ai.azure.com
```

2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "azure-claude-sonnet",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```

</TabItem>

<TabItem value="bedrock" label="Bedrock (Converse)">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-sonnet
    litellm_params:
      model: bedrock/global.anthropic.claude-sonnet-4-5-20250929-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "bedrock-claude-sonnet",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```

</TabItem>

<TabItem value="bedrock_invoke" label="Bedrock (Invoke)">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-invoke
    litellm_params:
      model: bedrock/invoke/global.anthropic.claude-sonnet-4-5-20250929-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "bedrock-claude-invoke",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```


</TabItem>
</Tabs>

## 예제 응답 {#example-response}

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "{\"name\":\"John Smith\",\"email\":\"john@example.com\",\"plan_interest\":\"Enterprise\",\"demo_requested\":true}"
    }
  ],
  "model": "claude-sonnet-4-5-20250514",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 75,
    "output_tokens": 28
  }
}
```

## 요청 형식

### output_format

`output_format` 파라미터는 구조화된 출력 형식을 지정합니다.

```json
{
  "output_format": {
    "type": "json_schema",
    "schema": {
      "type": "object",
      "properties": {
        "field_name": {"type": "string"},
        "another_field": {"type": "integer"}
      },
      "required": ["field_name", "another_field"],
      "additionalProperties": false
    }
  }
}
```

#### 필드 {#fields}

- **type** (string): 반드시 `"json_schema"`여야 합니다.
- **schema** (object): 예상 출력 구조를 정의하는 JSON Schema 객체입니다.
  - **type** (string): 루트 타입이며, 일반적으로 `"object"`입니다.
  - **properties** (object): 필드와 각 필드의 타입을 정의합니다.
  - **required** (array): 필수 필드 이름 목록입니다.
  - **additionalProperties** (boolean): 엄격한 스키마 준수를 강제하려면 `false`로 설정합니다.
