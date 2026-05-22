---
title: "Model Provider로 통합하기"
---

## OpenAI 호환 Provider 빠른 시작

API가 OpenAI와 호환된다면 단일 JSON 파일만 수정해 지원을 추가할 수 있습니다. 간단한 방식은 [OpenAI 호환 Provider 추가](/docs/contributing/adding_openai_compatible_providers)를 참고하세요.

---

이 가이드는 chat provider로 동작하는 데 필요한 클래스와 설정을 구성하는 방법에 초점을 둡니다.

먼저 이 가이드를 읽고, embedding이나 image-generation처럼 다른 provider 유형으로 동작하는 방법은 코드베이스의 기존 구현을 함께 확인하세요.

---

### 개요

provider 관점에서 liteLLM이 동작하는 방식은 단순합니다.

liteLLM은 wrapper처럼 동작합니다. OpenAI 형식 요청을 받아 provider API로 라우팅한 뒤, provider의 출력을 표준 출력 형식으로 변환합니다.

provider로 통합하려면 API를 연결하고 LiteLLM API와 provider API 사이의 adapter로 동작하는 모듈을 작성해야 합니다.

작성할 모듈은 설정 역할과 요청/응답 변환 역할을 함께 수행합니다.

목표는 입력을 provider API에 맞게 변환하고, 출력을 호출 측 LiteLLM 코드가 기대하는 형식으로 변환하는 모듈을 구현하는 것입니다.

이 모듈에는 다음 메서드가 포함됩니다.

- 요청을 검증합니다.
- 요청을 provider API로 보낼 형식으로 변환합니다.
- provider API의 응답을 호출 측 LiteLLM 코드로 반환할 응답 형식으로 변환합니다.
- 그 외 몇 가지 보조 메서드를 구현합니다.

---

### 1. Config 클래스 생성

provider 이름으로 새 디렉터리를 생성합니다.

#### `litellm/llms/your_provider_name_here`

그 안에 chat 설정 파일을 추가합니다.

#### `litellm/llms/your_provider_name_here/chat/transformation.py`

`transformation.py` 파일에는 provider API가 LiteLLM API에 어떻게 연결되는지 정의하는 설정 클래스가 들어갑니다.

`BaseConfig`를 확장해 config 클래스를 정의합니다.

```python
from litellm.llms.base_llm.chat.transformation import BaseConfig

class MyProviderChatConfig(BaseConfig):
    def __init__(self):
        ...
```

추상 메서드는 뒤 단계에서 채웁니다.

---

### 2. 코드베이스의 여러 위치에 provider 등록

LiteLLM은 이 절차를 계속 개선하고 있지만, 현재는 다음 작업이 필요합니다.

#### `litellm/__init__.py`

파일 상단의 key 목록에 provider key를 옵션으로 추가합니다.

```py
azure_key: Optional[str] = None
anthropic_key: Optional[str] = None
replicate_key: Optional[str] = None
bytez_key: Optional[str] = None
cohere_key: Optional[str] = None
infinity_key: Optional[str] = None
clarifai_key: Optional[str] = None
```

config를 import합니다.

```
from .llms.bytez.chat.transformation import BytezChatConfig
from .llms.custom_llm import CustomLLM
from .llms.bedrock.chat.converse_transformation import AmazonConverseConfig
from .llms.openai_like.chat.handler import OpenAILikeChatConfig
```

#### `litellm/main.py`

요청이 config 클래스로 라우팅될 수 있도록 `main.py`에 provider를 추가합니다.

```py
from .llms.bedrock.chat import BedrockConverseLLM, BedrockLLM
from .llms.bedrock.embed.embedding import BedrockEmbedding
from .llms.bedrock.image.image_handler import BedrockImageGeneration
from .llms.bytez.chat.transformation import BytezChatConfig
from .llms.codestral.completion.handler import CodestralTextCompletion
from .llms.cohere.embed import handler as cohere_embed
from .llms.custom_httpx.aiohttp_handler import BaseLLMAIOHTTPHandler

base_llm_http_handler = BaseLLMHTTPHandler()
base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler()
sagemaker_chat_completion = SagemakerChatHandler()
bytez_transformation = BytezChatConfig()
```

그다음 파일 아래쪽의 분기에도 추가합니다.

```py
elif custom_llm_provider == "bytez":
    api_key = (
        api_key
        or litellm.bytez_key
        or get_secret_str("BYTEZ_API_KEY")
        or litellm.api_key
    )

    response = base_llm_http_handler.completion(
        model=model,
        messages=messages,
        headers=headers,
        model_response=model_response,
        api_key=api_key,
        api_base=api_base,
        acompletion=acompletion,
        logging_obj=logging,
        optional_params=optional_params,
        litellm_params=litellm_params,
        timeout=timeout,  # type: ignore
        client=client,
        custom_llm_provider=custom_llm_provider,
        encoding=encoding,
        stream=stream,
    )

    pass
```

참고: LiteLLM은 `.completion()` 호출을 통해 각 args/kwargs를 config로 전달하므로 이 흐름을 활용할 수 있습니다.

#### `litellm/constants.py`

`LITELLM_CHAT_PROVIDERS` 목록에 provider를 추가합니다.

```py
LITELLM_CHAT_PROVIDERS = [
    "openai",
    "openai_like",
    "bytez",
    "xai",
    "custom_openai",
    "text-completion-openai",
```

여기의 provider if 문 체인에도 provider를 추가합니다.

#### `litellm/litellm_core_utils/get_llm_provider_logic.py`

```py
elif model == "*":
    custom_llm_provider = "openai"
# bytez models
elif model.startswith("bytez/"):
    custom_llm_provider = "bytez"
if not custom_llm_provider:
    if litellm.suppress_debug_info is False:
        print()  # noqa
```

#### `litellm/litellm_core_utils/streaming_handler.py`

#### streaming을 커스텀 처리한다면 이 파일도 업데이트해야 합니다. 예시는 다음과 같습니다.

```py
    def handle_bytez_chunk(self, chunk):
        try:
            is_finished = False
            finish_reason = ""

            return {
                "text": chunk,
                "is_finished": is_finished,
                "finish_reason": finish_reason,
            }
        except Exception as e:
            raise e
```

그다음 파일 아래쪽에 다음 분기를 추가합니다.

```
elif self.custom_llm_provider and self.custom_llm_provider == "bytez":
    response_obj = self.handle_bytez_chunk(chunk)
    completion_obj["content"] = response_obj["text"]
    if response_obj["is_finished"]:
        self.received_finish_reason = response_obj["finish_reason"]
    pass
```

---

### 3. 코드를 반복 검증할 테스트 파일 작성

프로젝트 어딘가에 테스트 파일 `tests/test_litellm/llms/my_provider/chat/test.py`를 추가합니다.

다음 내용을 작성합니다.

```python
import os
from litellm import completion

os.environ["MY_PROVIDER_KEY"] = "KEY_GOES_HERE"

completion(model="my_provider/your-model", messages=[...], api_key="...")
```

VS Code debugger로 실행하려면 다음 설정 파일을 사용할 수 있습니다. 권장 방식입니다.

`.vscode/launch.json`

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python Debugger: Current File",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "env": {
        "PYTHONPATH": "${workspaceFolder}",
        "MY_PROVIDER_API_KEY": "YOUR_API_KEY"
      }
    }
  ]
}
```

debugger로 실행하고 `"MY_PROVIDER_API_KEY": "YOUR_API_KEY"`를 업데이트했다면 테스트 스크립트에서 다음 줄은 제거할 수 있습니다.

`os.environ["MY_PROVIDER_KEY"] = "KEY_GOES_HERE"`

---

### 4. 필수 메서드 구현

`litellm/llms/custom_httpx/llm_http_handler.py`의 `completion()` 흐름을 따라가면 구현 방향을 잡기 좋습니다.

이 함수가 base class에 정의된 각 메서드를 호출하는 것을 확인할 수 있습니다.

debugger를 적극적으로 활용하세요.

###### `validate_environment`

헤더를 설정하고 key/model을 검증합니다.

```python
def validate_environment(...):
    headers.update({
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    })
    return headers
```

###### `get_complete_url`

최종 요청 URL을 반환합니다.

```python
def get_complete_url(...):
    return f"{api_base}/{model}"
```

###### `transform_request`

OpenAI 스타일 입력을 provider별 형식으로 변환합니다.

```python
def transform_request(...):
    data = {"messages": messages, "params": optional_params}
    return data
```

###### `transform_response`

원시 provider 응답을 처리하고 매핑합니다.

```python
def transform_response(...):
    json = raw_response.json()
    model_response.model = model
    model_response.choices[0].message.content = json.get("output")
    return model_response
```

###### `get_sync_custom_stream_wrapper` / `get_async_custom_stream_wrapper`

필요한 경우 이 메서드들을 사용할 수 있습니다. 사용 방법을 더 잘 이해하려면 `litellm/llms/sagemaker/chat/transformation.py` 또는 `litellm/llms/bytez/chat/transformation.py` 구현을 참고하세요.

content를 yield하려면 `CustomStreamWrapper`와 `httpx` streaming client를 함께 사용합니다.

---

### 🧪 테스트

`tests/test_litellm/llms/my_provider/chat/test.py`에 테스트를 만들고, 품질에 만족할 때까지 반복하세요.

---

### 추가 팁

막히면 다른 provider 구현을 확인하세요. `ctrl + shift + f`와 `ctrl + p`가 도움이 됩니다.

또한 [Discord feedback channel](https://discord.gg/wuPM9dRgDw)을 방문할 수 있습니다.
