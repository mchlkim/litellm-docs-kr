import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# Comet Opik - 로깅 + 평가 {#comet-opik---logging--evals}
Opik은 개발과 프로덕션 모두에서 개발자가 LLM 프롬프트와 응답을 추적하도록 돕는 오픈 소스 엔드투엔드 [LLM Evaluation Platform](https://www.comet.com/site/products/opik/?utm_source=litelllm&utm_medium=docs&utm_content=intro_paragraph)입니다. 사용자는 평가를 정의하고 실행해 배포 전에 LLM 앱의 환각, 정확도, 컨텍스트 검색 등을 테스트할 수 있습니다!


<Image img={require('../../img/opik.png')} />

:::info
콜백을 더 개선할 방법을 알고 싶습니다! LiteLLM [창립자](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)를 만나거나
[discord](https://discord.gg/wuPM9dRgDw)에 참여하세요.
:::

## 사전 요구 사항 {#pre-requisites}

[Opik quickstart guide](https://www.comet.com/docs/opik/quickstart/)에서 Opik 설정 방법을 자세히 알아볼 수 있습니다. [self-hosting guide](https://www.comet.com/docs/opik/self-host/local_deployment)에서 Opik 자체 호스팅 방법도 확인할 수 있습니다.

## 빠른 시작
단 4줄의 코드로 **모든 provider**의 응답을 Opik에 즉시 로깅할 수 있습니다.

[여기](https://www.comet.com/signup?utm_source=litelllm&utm_medium=docs&utm_content=api_key_cell)에서 가입해 Opik API Key를 발급받으세요!

```python
import litellm
litellm.callbacks = ["opik"]
```

전체 예시:

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
import os

# Configure the Opik API key or call opik.configure()
os.environ["OPIK_API_KEY"] = ""
os.environ["OPIK_WORKSPACE"] = ""

# LLM provider API Keys:
os.environ["OPENAI_API_KEY"] = ""

# set "opik" as a callback, litellm will send the data to an Opik server (such as comet.com)
litellm.callbacks = ["opik"]

# openai call
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Why is tracking and evaluation of LLMs important?"}
    ]
)
```

Opik의 `@track` 데코레이터로 추적되는 함수 안에서 liteLLM을 사용한다면,
LLM 호출이 올바른 trace에 할당되도록 metadata 속성에 `current_span_data` 필드를 제공해야 합니다.

```python
from opik import track
from opik.opik_context import get_current_span_data
import litellm

litellm.callbacks = ["opik"]

@track()
def streaming_function(input):
    messages = [{"role": "user", "content": input}]
    response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=messages,
        metadata = {
            "opik": {
                "current_span_data": get_current_span_data(),
                "tags": ["streaming-test"],
            },
        }
    )
    return response

response = streaming_function("Why is tracking and evaluation of LLMs important?")
chunks = list(response)
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-3.5-turbo-testing
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["opik"]

environment_variables:
  OPIK_API_KEY: ""
  OPIK_WORKSPACE: ""
```

2. 프록시 실행

```bash
litellm --config config.yaml
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-3.5-turbo-testing",
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in Boston today?"
    }
  ]
}'
```

</TabItem>
</Tabs>

## Opik 전용 파라미터 {#opik-specific-parameters}

이 값들은 metadata 안에서 `opik` 키로 전달할 수 있습니다.

### 필드 {#fields}

- `project_name` - 데이터를 보낼 Opik 프로젝트 이름입니다.
- `current_span_data` - 추적에 사용할 현재 span 데이터입니다.
- `tags` - 추적에 사용할 태그입니다.
- `thread_id` - 여러 관련 trace를 함께 그룹화할 thread id입니다.

### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from opik import track
from opik.opik_context import get_current_span_data
import litellm

litellm.callbacks = ["opik"]

messages = [{"role": "user", "content": input}]
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=messages,
    metadata = {
        "opik": {
            "project_name": "your-opik-project-name",
            "current_span_data": get_current_span_data(),
            "tags": ["streaming-test"],
            "thread_id": "your-thread-id"
        },
    }
)
return response
```
</TabItem>
<TabItem value="proxy" label="프록시">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in Boston today?"
    }
  ],
  "metadata": {
    "opik": {
      "project_name": "your-opik-project-name",
      "current_span_data": "...",
      "tags": ["streaming-test"],
      "thread_id": "your-thread-id"
    },
  }
}'
``` 

</TabItem>
</Tabs>



`opik_*` prefix를 사용해 요청 헤더의 일부로 필드를 전달할 수도 있습니다.

```shell
curl --location --request POST 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'opik_project_name: your-opik-project-name' \
    --header 'opik_thread_id: your-thread-id' \
    --header 'opik_tags: ["streaming-test"]' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "What's the weather like in Boston today?"
        }
    ]
}'
```

## API Key의 자동 Metadata {#automatic-metadata-from-api-keys}

경우에 따라 요청자가 요청에 Opik metadata를 추가할 수 없거나 추가 방법을 모를 수 있습니다. Opik 관련 모든 동작이 제대로 추적되도록, LiteLLM Proxy는 요청에 metadata가 제공되지 않았을 때 사용자별 API key의 metadata를 자동으로 연결할 수 있습니다.

### 작동 방식 {#how-it-works}

LiteLLM Proxy에서 API key를 만들 때 key 자체에 Opik 전용 metadata를 연결할 수 있습니다. 요청이 자체 Opik metadata를 명시적으로 제공하지 않는 한, 이 metadata는 해당 key로 수행되는 모든 요청에 자동 적용됩니다. 요청에 포함된 metadata가 있으면 그 값이 우선합니다.


### 사용법

**1단계: 해당 API Key에 Opik Metadata 저장**
'가상 키'로 이동해 선택한 api key를 클릭하고 'Settings'를 편집합니다.
그런 다음 opik metadata를 사용자 api key metadata로 저장합니다.

<Image img={require('../../img/opik_key_metadata.png')} />

**2단계: key 사용 - Opik metadata가 자동 적용됨**

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-key-from-step-1' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in Boston today?"
    }
  ]
}'
```

이 key로 수행되는 모든 요청은 사용자가 각 요청마다 metadata를 전달하지 않아도 지정된 태그와 함께 "TestProject" Opik 프로젝트에서 자동으로 추적됩니다.


## 지원 및 창립자와 대화 {#support--talk-to-founders}

- [데모 일정 잡기 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
