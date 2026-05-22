import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 동적 콜백 관리

:::info

✨ 이 기능은 엔터프라이즈 기능입니다.

[LiteLLM 엔터프라이즈 시작하기](https://www.litellm.ai/enterprise)

:::

LiteLLM의 동적 콜백 관리를 사용하면 중앙 인프라를 변경하지 않고도 팀이 요청별로 로깅 동작을 제어할 수 있습니다. 이는 다음과 같은 대규모 서비스 생태계를 운영하는 조직에 필수적입니다.

- **팀별 컴플라이언스 관리** - 중앙 감독 없이도 서비스가 민감한 데이터를 적절하게 처리할 수 있습니다.
- **분산된 책임** - 각 팀은 공유 인프라를 사용하면서 자체 데이터 처리 방식을 제어합니다.

요청에 `x-litellm-disable-callbacks` 헤더를 함께 전달하면 콜백을 비활성화할 수 있으며, 팀은 데이터가 로깅되는 위치를 세밀하게 제어할 수 있습니다.

## 시작하기: 콜백 나열 및 비활성화

콜백 관리는 두 단계로 진행됩니다.

1. **먼저 활성 콜백을 나열**하여 현재 활성화된 항목을 확인합니다.
2. **그런 다음 특정 콜백을 비활성화**하여 요청에 필요한 방식으로 제어합니다.



## 1. 활성 콜백 나열

먼저 프록시에서 현재 활성화된 모든 콜백을 확인하여 비활성화할 수 있는 항목을 파악합니다.

#### 요청

```bash
curl -X 'GET' \
  'http://localhost:4000/callbacks/list' \
  -H 'accept: application/json' \
  -H 'x-litellm-api-key: sk-1234'
```

#### 응답

```json
{
  "success": [
    "deployment_callback_on_success",
    "sync_deployment_callback_on_success"
  ],
  "failure": [
    "async_deployment_callback_on_failure",
    "deployment_callback_on_failure"
  ],
  "success_and_failure": [
    "langfuse",
    "datadog"
  ]
}
```

#### 응답 필드

응답에는 활성 콜백을 분류하는 세 개의 배열이 포함됩니다.
- **`success`** - 요청이 성공적으로 완료될 때만 실행되는 콜백입니다. 이 콜백은 성공한 LLM 응답의 데이터를 수신합니다.
- **`failure`** - 요청이 실패하거나 오류가 발생할 때만 실행되는 콜백입니다. 이 콜백은 오류 정보와 실패한 요청 데이터를 수신합니다.
- **`success_and_failure`** - 성공한 요청과 실패한 요청 모두에 대해 실행되는 콜백입니다. 일반적으로 결과와 관계없이 모든 요청 데이터를 캡처해야 하는 로깅/관측성 도구입니다.

---

## 2. 콜백 비활성화

활성 콜백을 확인했으므로 이제 `x-litellm-disable-callbacks` 헤더를 사용해 선택적으로 비활성화할 수 있습니다. 위 목록 응답에 있는 모든 콜백 이름을 참조할 수 있습니다.

### 단일 콜백 비활성화

개별 요청에서 특정 콜백을 비활성화하려면 `x-litellm-disable-callbacks` 헤더를 사용합니다.

<Tabs>
<TabItem value="Curl" label="Curl 요청">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'x-litellm-disable-callbacks: langfuse' \
    --data '{
    "model": "claude-sonnet-4-20250514",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI Python SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-20250514",
    messages=[
        {
            "role": "user",
            "content": "what llm are you"
        }
    ],
    extra_headers={
        "x-litellm-disable-callbacks": "langfuse"
    }
)

print(response)
```

</TabItem>
</Tabs>

### 여러 콜백 비활성화

헤더에 쉼표로 구분된 목록을 제공하면 여러 콜백을 비활성화할 수 있습니다. `/callbacks/list` 응답에 포함된 콜백 이름을 원하는 조합으로 사용할 수 있습니다.

<Tabs>
<TabItem value="Curl" label="Curl 요청">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'x-litellm-disable-callbacks: langfuse,datadog,prometheus' \
    --data '{
    "model": "claude-sonnet-4-20250514",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI Python SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-20250514",
    messages=[
        {
            "role": "user",
            "content": "what llm are you"
        }
    ],
    extra_headers={
        "x-litellm-disable-callbacks": "langfuse,datadog,prometheus"
    }
)

print(response)
```

</TabItem>
</Tabs>

## 헤더 형식 및 대소문자 구분

### 예상 헤더 형식

`x-litellm-disable-callbacks` 헤더는 다음 형식의 콜백 이름을 허용합니다(`/callbacks/list`에서 반환된 정확한 이름을 사용하세요).

- **단일 콜백**: `x-litellm-disable-callbacks: langfuse`
- **여러 콜백**: `x-litellm-disable-callbacks: langfuse,datadog,prometheus`

여러 콜백을 지정할 때는 쉼표 주변에 공백을 넣지 않고 쉼표로 구분된 값을 사용합니다.

### 대소문자 구분

**콜백 이름 검사는 대소문자를 구분하지 않습니다.** 즉, 다음 항목은 모두 동일하게 처리됩니다.

```bash
# These are all equivalent
x-litellm-disable-callbacks: langfuse
x-litellm-disable-callbacks: LANGFUSE  
x-litellm-disable-callbacks: LangFuse
x-litellm-disable-callbacks: langFUSE
```

이는 단일 콜백과 여러 콜백 지정 모두에 적용됩니다.

```bash
# Case insensitive for multiple callbacks
x-litellm-disable-callbacks: LANGFUSE,datadog,PROMETHEUS
x-litellm-disable-callbacks: langfuse,DATADOG,prometheus
```

---

## 동적 콜백 관리 비활성화(엔터프라이즈)

일부 조직은 **모든 요청이 어떤 상황에서도 반드시 로깅되어야 하는** 컴플라이언스 요구사항을 가지고 있습니다. 이런 경우 동적 콜백 관리를 완전히 비활성화하여 사용자가 로깅 콜백을 비활성화할 수 없도록 할 수 있습니다.

### 사용 사례

이 설정은 다음과 같은 엔터프라이즈 시나리오를 위해 설계되었습니다.
- **컴플라이언스 요구사항**에 따라 모든 API 요청을 반드시 로깅해야 하는 경우
- **감사 추적**이 누락 없이 완전해야 하는 경우
- **보안 정책**상 모든 트래픽을 모니터링해야 하는 경우
- 콜백 비활성화에 대해 **예외를 허용할 수 없는** 경우

### 비활성화 방법

config.yaml에서 `allow_dynamic_callback_disabling`을 `false`로 설정합니다.

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  allow_dynamic_callback_disabling: false
```

### 효과

비활성화하면 다음과 같이 동작합니다.
- `x-litellm-disable-callbacks` 헤더가 **무시됩니다**.
- 구성된 모든 콜백이 모든 요청에 대해 **항상 실행됩니다**.
- 사용자는 헤더나 요청 메타데이터를 통해 로깅을 우회할 수 없습니다.
- 프록시 구성에 따라 모든 요청이 로깅되는 것이 보장됩니다.

### 예제: 컴플라이언스 로깅 설정

보장된 로깅이 필요한 조직을 위한 전체 예제는 다음과 같습니다.

```yaml showLineNumbers title="config.yaml"
# config.yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["langfuse", "datadog", "s3"]
  # Disable dynamic callback disabling for compliance
  allow_dynamic_callback_disabling: false
```

이 구성에서는 다음과 같이 동작합니다.
- 모든 요청이 Langfuse, Datadog, S3에 로깅됩니다.
- 사용자는 헤더를 통해 이러한 콜백을 비활성화할 수 없습니다.
- 컴플라이언스 요구사항에 맞는 완전한 감사 추적이 보장됩니다.

:::info

**기본 동작**: 동적 콜백 비활성화는 **기본적으로 활성화되어 있습니다**(`allow_dynamic_callback_disabling: true`). 보장된 로깅을 강제하려면 명시적으로 `false`로 설정해야 합니다.

:::
