import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Braintrust - 평가 + 로깅 {#braintrust---evals--logging}

[Braintrust](https://www.braintrust.dev/)는 AI 제품을 위한 평가, 로깅, 프롬프트 플레이그라운드, 데이터 관리를 제공합니다.

## 빠른 시작

```python
# uv add braintrust
import litellm
import os

# set env
os.environ["BRAINTRUST_API_KEY"] = ""
os.environ["BRAINTRUST_API_BASE"] = "https://api.braintrustdata.com/v1"
os.environ['OPENAI_API_KEY']=""

# set braintrust as a callback, litellm will send the data to braintrust
litellm.callbacks = ["braintrust"]

# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

## OpenAI Proxy 사용법

1. 환경 변수에 키를 추가합니다.

```env
BRAINTRUST_API_KEY=""
BRAINTRUST_API_BASE="https://api.braintrustdata.com/v1"
```

2. callbacks에 braintrust를 추가합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["braintrust"]
```

3. 테스트합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "model": "groq-llama3",
    "messages": [
        { "role": "system", "content": "Use your tools smartly"},
        { "role": "user", "content": "What time is it now? Use your tool"}
    ]
}'
```

## 고급 - Project ID 또는 이름 전달 {#advanced---pass-project-id-or-name}

트레이스가 올바른 Braintrust 프로젝트에 기록되도록 `project_id` 또는 `project_name`을 포함하는 것이 좋습니다.

### 사용자 지정 Span 이름 {#custom-span-names}

metadata에 `span_name`을 전달해 Braintrust 로깅의 span 이름을 사용자 지정할 수 있습니다. 기본 span 이름은 "Chat Completion"입니다.

### 사용자 지정 Span 속성 {#custom-span-attributes}

metadata에 `span_id`, `root_span_id`, `span_parents`를 전달해 Braintrust 로깅의 span ID, 루트 span 이름, span 부모를 사용자 지정할 수 있습니다.
`span_parents`는 span ID 목록을 `,`로 연결한 문자열이어야 합니다.


<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  metadata={
    "project_id": "1234",
    # passing project_name will try to find a project with that name, or create one if it doesn't exist
    # if both project_id and project_name are passed, project_id will be used
    # "project_name": "my-special-project",
    # custom span name for this operation (default: "Chat Completion")
    "span_name": "User Greeting Handler"
  }
)
```

참고: SDK를 사용할 때는 여기에 다른 `metadata`도 포함할 수 있습니다.

```python
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  metadata={
    "project_id": "1234",
    "span_name": "Custom Operation",
    "item1": "an item",
    "item2": "another item"
  }
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

**Curl**

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "model": "groq-llama3",
    "messages": [
        { "role": "system", "content": "Use your tools smartly"},
        { "role": "user", "content": "What time is it now? Use your tool"}
    ],
    "metadata": {
        "project_id": "my-special-project",
        "span_name": "Tool Usage Request"
    }
}'
```

**OpenAI SDK**

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ # pass in any provider-specific param, if not supported by openai, https://docs.litellm.ai/docs/completion/input#provider-specific-params
        "metadata": { # 👈 use for logging additional params (e.g. to braintrust)
            "project_id": "my-special-project",
            "span_name": "Poetry Generation"
        }
    }
)

print(response)
```

더 많은 예시는 [**여기**](../proxy/user_keys.md#chatcompletions)를 참고하세요.

</TabItem>
</Tabs>

`BRAINTRUST_API_BASE`를 사용해 자체 호스팅 Braintrust 데이터 플레인을 가리킬 수 있습니다. 자세한 내용은 [여기](https://www.braintrust.dev/docs/guides/self-hosting)를 참고하세요.

## 전체 API 사양 {#full-api-spec}

Braintrust 요청의 metadata에 전달할 수 있는 모든 항목은 다음과 같습니다.

`braintrust_*` - _proxy request headers_에서 metadata를 추가하는 경우 `braintrust_`로 시작하는 모든 metadata 필드는 로깅 요청의 metadata로 전달됩니다. SDK를 사용하는 경우 일반적인 방식으로 metadata를 전달하면 됩니다(예: `metadata={"project_name": "my-test-project", "item1": "an item", "item2": "another item"}`).

`project_id` - Braintrust 호출의 프로젝트 ID를 설정합니다. 기본값은 `litellm`입니다.

`project_name` - Braintrust 호출의 프로젝트 이름을 설정합니다. 해당 이름의 프로젝트를 찾고, 존재하지 않으면 새로 생성하려고 시도합니다. `project_id`와 `project_name`을 모두 전달하면 `project_id`가 사용됩니다.

`span_name` - 작업에 사용할 사용자 지정 span 이름을 설정합니다. 기본값은 `"Chat Completion"`입니다. 애플리케이션의 여러 작업 유형에 더 설명적인 이름을 부여할 때 사용하세요(예: "User Query", "Document Summary", "Code Generation").
