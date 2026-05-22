import Image from '@theme/IdealImage';

# 🪢 Langfuse - LLM 입력/출력 로깅

## Langfuse란?

Langfuse([GitHub](https://github.com/langfuse/langfuse))는 모델 [tracing](https://langfuse.com/docs/tracing), [prompt management](https://langfuse.com/docs/prompts/get-started), 애플리케이션 [evaluation](https://langfuse.com/docs/scores/overview)을 위한 오픈 소스 LLM 엔지니어링 플랫폼입니다. Langfuse는 팀이 LLM 애플리케이션을 함께 디버그, 분석, 반복 개선할 수 있도록 돕습니다. 


LiteLLM을 통해 여러 모델을 사용하는 Langfuse 예제 trace:
<Image img={require('../../img/langfuse-example-trace-multiple-models-min.png')} />


:::info

Langfuse v3에서는 [Langfuse OTEL](./langfuse_otel_integration) 통합을 사용하는 것을 권장합니다.

:::


## LiteLLM Proxy(LLM Gateway)와 함께 사용하는 방법

👉 [**LiteLLM Proxy 서버로 langfuse에 로그를 전송하려면 이 링크를 참고하세요**](../proxy/logging)


## LiteLLM Python SDK와 함께 사용하는 방법

### 사전 요구 사항
이 통합을 위해 `uv add langfuse`를 실행했는지 확인하세요.
```shell
uv add langfuse==2.59.7 litellm
```

### 빠른 시작
단 2줄의 코드만으로 **모든 provider**의 응답을 Langfuse에 즉시 로깅할 수 있습니다.

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/logging_observability/LiteLLM_Langfuse.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Colab에서 열기"/>
</a>

https://cloud.langfuse.com/ 에서 Langfuse API Keys를 가져오세요.
```python
litellm.success_callback = ["langfuse"]
litellm.failure_callback = ["langfuse"] # logs errors to langfuse
```
```python
# uv add langfuse 
import litellm
import os

# from https://cloud.langfuse.com/
os.environ["LANGFUSE_PUBLIC_KEY"] = ""
os.environ["LANGFUSE_SECRET_KEY"] = ""
# Optional, defaults to https://cloud.langfuse.com
os.environ["LANGFUSE_HOST"] # optional

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langfuse as a callback, litellm will send the data to langfuse
litellm.success_callback = ["langfuse"] 
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

### 고급
#### Custom Generation Names 설정 및 Metadata 전달

`metadata`에 `generation_name`을 전달합니다.

```python
import litellm
from litellm import completion
import os

# from https://cloud.langfuse.com/
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-..."


# OpenAI and Cohere keys 
# You can use any of the litellm supported providers: https://docs.litellm.ai/docs/providers
os.environ['OPENAI_API_KEY']="sk-..."

# set langfuse as a callback, litellm will send the data to langfuse
litellm.success_callback = ["langfuse"] 
 
# openai call
response = completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  metadata = {
    "generation_name": "litellm-ishaan-gen", # set langfuse generation name
    # custom metadata fields
    "project": "litellm-proxy" 
  }
)
 
print(response)

```

#### Custom Trace ID, Trace User ID, Trace Metadata, Trace Version, Trace Release 및 Tags 설정

`metadata`에 `trace_id`, `trace_user_id`, `trace_metadata`, `trace_version`, `trace_release`, `tags`를 전달합니다.


```python
import litellm
from litellm import completion
import os

# from https://cloud.langfuse.com/
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-..."

os.environ['OPENAI_API_KEY']="sk-..."

# set langfuse as a callback, litellm will send the data to langfuse
litellm.success_callback = ["langfuse"] 

# set custom langfuse trace params and generation params
response = completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  metadata={
      "generation_name": "ishaan-test-generation",  # set langfuse Generation Name
      "generation_id": "gen-id22",                  # set langfuse Generation ID 
      "parent_observation_id": "obs-id9"            # set langfuse Parent Observation ID
      "version":  "test-generation-version"         # set langfuse Generation Version
      "trace_user_id": "user-id2",                  # set langfuse Trace User ID
      "session_id": "session-1",                    # set langfuse Session ID
      "tags": ["tag1", "tag2"],                     # set langfuse Tags
      "trace_name": "new-trace-name"                # set langfuse Trace Name
      "trace_id": "trace-id22",                     # set langfuse Trace ID
      "trace_metadata": {"key": "value"},           # set langfuse Trace Metadata
      "trace_version": "test-trace-version",        # set langfuse Trace Version (if not set, defaults to Generation Version)
      "trace_release": "test-trace-release",        # set langfuse Trace Release
      ### OR ### 
      "existing_trace_id": "trace-id22",            # if generation is continuation of past trace. This prevents default behaviour of setting a trace name
      ### OR enforce that certain fields are trace overwritten in the trace during the continuation ###
      "existing_trace_id": "trace-id22",
      "trace_metadata": {"key": "updated_trace_value"},            # The new value to use for the langfuse Trace Metadata
      "update_trace_keys": ["input", "output", "trace_metadata"],  # Updates the trace input & output to be this generations input & output also updates the Trace Metadata to match the passed in value
      "debug_langfuse": True,                                      # Will log the exact metadata sent to litellm for the trace/generation as `metadata_passed_to_litellm` 
  },
)

print(response)

```

`langfuse_*` prefix를 사용해 request header의 일부로 `metadata`를 전달할 수도 있습니다.

```shell
curl --location --request POST 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'langfuse_trace_id: trace-id2' \
    --header 'langfuse_trace_user_id: user-id2' \
    --header 'langfuse_trace_metadata: {"key":"value"}' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```


#### Trace 및 Generation Parameters

##### Trace 전용 Parameters

* `trace_id`       - trace의 식별자입니다. 기존 trace인 경우 `trace_id` 대신 `existing_trace_id`를 사용해야 하며, 기본값은 자동 생성됩니다.
* `trace_name`     - trace의 이름이며, 기본값은 자동 생성됩니다.
* `session_id`     - trace의 session 식별자이며, 기본값은 `None`입니다.
* `trace_version`  - trace의 version이며, 기본값은 `version` 값입니다.
* `trace_release`  - trace의 release이며, 기본값은 `None`입니다.
* `trace_metadata` - trace의 metadata이며, 기본값은 `None`입니다.
* `trace_user_id`  - trace의 user 식별자이며, 기본값은 completion 인수 `user`입니다.
* `tags`           - trace의 tags이며, 기본값은 `None`입니다.

##### Continuation에서 업데이트할 수 있는 Parameters

completion의 metadata에 있는 `update_trace_keys`에 다음 값을 전달하면 trace의 continuation에서 아래 parameters를 업데이트할 수 있습니다.

* `input`          - trace의 input을 이 latest generation의 input으로 설정합니다.
* `output`         - trace의 output을 이 generation의 output으로 설정합니다.
* `trace_version`  - trace version을 제공된 값으로 설정합니다. 대신 latest generation의 version을 사용하려면 `version`을 사용하세요.
* `trace_release`  - trace release를 제공된 값으로 설정합니다.
* `trace_metadata` - trace metadata를 제공된 값으로 설정합니다.
* `trace_user_id`  - trace user id를 제공된 값으로 설정합니다.

#### Generation 전용 Parameters

* `generation_id`         - generation의 식별자이며, 기본값은 자동 생성됩니다.
* `generation_name`       - generation의 식별자이며, 기본값은 자동 생성됩니다.
* `parent_observation_id` - parent observation의 식별자이며, 기본값은 `None`입니다.
* `prompt`                - generation에 사용되는 Langfuse prompt object이며, 기본값은 `None`입니다.


위 `litellm` completion spec에 나열되지 않았지만 metadata에 전달된 다른 key value pair는 generation의 metadata key value pair로 추가됩니다.

#### 여러 Langfuse Projects(요청별 Credentials)

`completion()` 또는 `acompletion()`에 credentials를 직접 전달하여 요청별로 다른 Langfuse projects에 trace를 보낼 수 있습니다. 이는 global env vars와 함께 또는 대신 사용할 수 있으며, 서로 다른 팀이나 비즈니스 프로세스가 다른 Langfuse projects를 사용할 때 유용합니다.

**`langfuse_public_key`**, **`langfuse_secret_key`**(또는 **`langfuse_secret`**), 선택적으로 **`langfuse_host`**를 keyword arguments로 전달합니다.

```python
import litellm
from litellm import completion

# Optional: set a default via env for requests that don't pass credentials
# os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-default..."
# os.environ["LANGFUSE_SECRET_KEY"] = "sk-default..."

litellm.success_callback = ["langfuse"]
litellm.failure_callback = ["langfuse"]

# Request 1 → Langfuse Project A
response_a = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello from team A"}],
    langfuse_public_key="pk-lf-project-a...",
    langfuse_secret_key="sk-lf-project-a...",
    langfuse_host="https://us.cloud.langfuse.com",  # optional
)

# Request 2 → Langfuse Project B (different project)
response_b = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello from team B"}],
    langfuse_public_key="pk-lf-project-b...",
    langfuse_secret_key="sk-lf-project-b...",
    langfuse_host="https://eu.cloud.langfuse.com",  # optional, can differ per project
)
```

요청별 credentials를 사용하는 async 사용법:

```python
import litellm
from litellm import acompletion

litellm.success_callback = ["langfuse"]
litellm.failure_callback = ["langfuse"]

response = await acompletion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hi"}],
    langfuse_public_key="pk-lf-...",
    langfuse_secret_key="sk-lf-...",
    langfuse_host="https://us.cloud.langfuse.com",  # optional
)
```

- **`langfuse_public_key`** – Langfuse project public key입니다. 요청별 override에 필요합니다.
- **`langfuse_secret_key`** 또는 **`langfuse_secret`** – Langfuse secret key입니다. 두 이름 모두 허용됩니다.
- **`langfuse_host`** – Langfuse host URL입니다(예: `https://us.cloud.langfuse.com`). 선택 사항이며 기본값은 env 또는 Langfuse cloud입니다.

이 값들이 전달되면 해당 요청은 Langfuse callback에 이 project와 host를 사용합니다. 생략하면 callback은 global Langfuse client를 사용합니다(env vars가 설정된 경우 해당 값 사용). LiteLLM은 모든 요청마다 새 client를 만들지 않도록 credential set별로 Langfuse client를 캐시합니다.

#### 특정 호출에서 Logging 비활성화

특정 호출에서 logging을 비활성화하려면 `no-log` flag를 사용하세요.

`completion(messages = ..., model = ...,  **{"no-log": True})`


### LangChain ChatLiteLLM + Langfuse 사용
model_kwargs에 `trace_user_id`, `session_id`를 전달합니다.
```python
import os
from langchain.chat_models import ChatLiteLLM
from langchain.schema import HumanMessage
import litellm

# from https://cloud.langfuse.com/
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-..."

os.environ['OPENAI_API_KEY']="sk-..."

# set langfuse as a callback, litellm will send the data to langfuse
litellm.success_callback = ["langfuse"] 

chat = ChatLiteLLM(
  model="gpt-3.5-turbo"
  model_kwargs={
      "metadata": {
        "trace_user_id": "user-id2", # set langfuse Trace User ID
        "session_id": "session-1" ,  # set langfuse Session ID
        "tags": ["tag1", "tag2"] 
      }
    }
  )
messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat(messages)
```

### Langfuse Logging에서 Messages 및 Response Content 마스킹 

#### 모든 Langfuse Logging에서 Messages 및 Responses 마스킹

`litellm.turn_off_message_logging=True`를 설정하세요. 이렇게 하면 messages와 responses가 langfuse에 로깅되지 않지만, request metadata는 계속 로깅됩니다.

#### 특정 Langfuse Logging에서 Messages 및 Responses 마스킹

text completion 또는 embedding calls에 일반적으로 전달되는 metadata에서 특정 keys를 설정하여 이 호출의 messages와 responses를 마스킹할 수 있습니다.

`mask_input`을 `True`로 설정하면 이 호출에서 input이 로깅되지 않도록 마스킹합니다.

`mask_output`을 `True`로 설정하면 이 호출에서 output이 로깅되지 않도록 마스킹합니다.

기존 trace를 이어서 사용하면서 `update_trace_keys`에 `input` 또는 `output`을 포함하고 해당 `mask_input` 또는 `mask_output`을 설정하면, 해당 trace의 기존 input 및/또는 output이 마스킹된 message로 대체됩니다.

## 문제 해결 & Errors
### Data가 Langfuse에 로깅되지 않나요? 
- 최신 langfuse version을 사용 중인지 확인하세요. `uv add langfuse -U`를 실행하세요. 최신 version에서는 litellm이 JSON input/outputs를 langfuse에 로깅할 수 있습니다.
- langfuse에서 traces가 보이지 않으면 [이 checklist](https://langfuse.com/faq/all/missing-traces)를 따르세요.

## 지원 및 Founders에게 문의

- [Demo 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
