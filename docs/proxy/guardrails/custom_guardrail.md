import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 커스텀 가드레일

커스텀 가드레일을 실행하는 코드를 작성하려면 이 방법을 사용하세요.

## 빠른 시작 

### 1. `CustomGuardrail` 클래스 작성 {#1-write-a-customguardrail-class}

커스텀 가드레일을 만드는 가장 간단한 방법은 `apply_guardrail` 메서드를 구현하는 것입니다. 이 메서드는 텍스트 콘텐츠를 검사할 때 호출되며, 예외를 발생시켜 요청을 차단할 수 있습니다.

**예제 `CustomGuardrail` 클래스**

`custom_guardrail.py`라는 새 파일을 만들고 다음 코드를 추가하세요.

```python
import os
from typing import Optional, List
from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.types.guardrails import PiiEntityType
from litellm._logging import verbose_proxy_logger
from litellm.llms.custom_httpx.http_handler import (
    get_async_httpx_client,
    httpxSpecialProvider,
)

class myCustomGuardrail(CustomGuardrail):
    def __init__(self, api_key: Optional[str] = None, api_base: Optional[str] = None, **kwargs):
        self.api_key = api_key or os.getenv("MY_GUARDRAIL_API_KEY")
        self.api_base = api_base or os.getenv("MY_GUARDRAIL_API_BASE", "https://api.myguardrail.com")
        super().__init__(**kwargs)

    async def apply_guardrail(
        self,
        text: str, # IMPORTANT: This is the text to check against your guardrail rules. It's extracted from the request or response across all LLM call types.
        language: Optional[str] = None, # ignore 
        entities: Optional[List[PiiEntityType]] = None, # ignore
        request_data: Optional[dict] = None, # ignore
    ) -> str:
        """
        Check text content against your guardrail rules.
        Raise an exception to block the request.
        Return the text (optionally modified) to allow it through.
        """
        result = await self._check_with_api(text, request_data)
        
        if result.get("action") == "BLOCK":
            raise Exception(f"Content blocked: {result.get('reason', 'Policy violation')}")
        
        return text

    async def _check_with_api(self, text: str, request_data: Optional[dict]) -> dict:
        async_client = get_async_httpx_client(llm_provider=httpxSpecialProvider.LoggingCallback)
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        
        response = await async_client.post(
            f"{self.api_base}/check",
            headers=headers,
            json={"text": text},
            timeout=5,
        )
        
        response.raise_for_status()
        return response.json()
```

:::tip 고급: 개별 이벤트 훅 사용

더 세밀하게 제어해야 한다면 `apply_guardrail` 대신 또는 함께 개별 이벤트 훅을 구현할 수 있습니다.

- `async_pre_call_hook` - LLM API 호출 전에 입력을 수정하거나 요청을 거부합니다.
- `async_moderation_hook` - 요청을 거부합니다. LLM API 호출과 병렬로 실행되어 지연 시간을 줄이는 데 도움이 됩니다.
- `async_post_call_success_hook` - LLM API 호출 후 실행되며 입력/출력에 가드레일을 적용합니다.
- `async_post_call_streaming_iterator_hook` - 전체 스트림을 가드레일에 전달합니다.

**[개별 이벤트 훅 예제 보기](#advanced-individual-event-hooks)** | **[메서드 상세 사양 보기](#customguardrail-methods)**

:::

### 2. LiteLLM `config.yaml`에 커스텀 가드레일 클래스 전달

아래 설정에서는 `guardrail: custom_guardrail.myCustomGuardrail`을 지정해 가드레일이 커스텀 가드레일을 가리키도록 합니다.

- Python 파일명: `custom_guardrail.py`
- 가드레일 클래스 이름: `myCustomGuardrail`. 1단계에서 정의한 클래스입니다.

`guardrail: custom_guardrail.myCustomGuardrail`

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "my-custom-guardrail"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail  # 👈 Key change
      mode: "during_call"               # runs apply_guardrail method
      api_key: os.environ/MY_GUARDRAIL_API_KEY
      api_base: https://api.myguardrail.com
```

:::info 모드 옵션

- `during_call` - 기본 모드입니다. `apply_guardrail` 메서드를 실행합니다. 개별 훅을 사용하는 경우 `async_moderation_hook`을 실행합니다.
- `pre_call` - 입력 수정을 위해 `async_pre_call_hook`을 실행합니다.
- `post_call` - 출력 검증을 위해 `async_post_call_success_hook`을 실행합니다.

:::

:::note 스트리밍 및 post_call 가드레일

**스트리밍 응답**에서는 모든 청크가 클라이언트에 전달된 **후** 완전히 조립된 응답에 대해 `post_call` 가드레일이 실행됩니다. 즉, 스트리밍의 `post_call` 가드레일은 **감사 전용**입니다. 완전한 응답을 검사하고 로그로 남길 수는 있지만, 콘텐츠 전달을 차단할 수는 없습니다. 가드레일 결과는 규정 준수와 감사를 위해 로깅 페이로드의 `guardrail_information`에 기록됩니다.

스트리밍 콘텐츠를 실시간으로 필터링하거나 차단하려면 청크가 도착할 때 처리하는 `async_post_call_streaming_iterator_hook`을 대신 사용하세요.

:::

<details>
<summary>고급: 개별 이벤트 훅으로 여러 모드 사용</summary>

개별 이벤트 훅을 사용하는 경우 서로 다른 모드로 여러 가드레일을 설정할 수 있습니다.

```yaml
guardrails:
  - guardrail_name: "custom-pre-guard"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail
      mode: "pre_call"                  # runs async_pre_call_hook
  - guardrail_name: "custom-during-guard"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail  
      mode: "during_call"               # runs async_moderation_hook
  - guardrail_name: "custom-post-guard"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail
      mode: "post_call"                 # runs async_post_call_success_hook
```

</details>

### 3. LiteLLM Gateway 시작

<Tabs>
<TabItem value="docker" label="Docker 실행">

LiteLLM Docker 컨테이너에 `custom_guardrail.py`를 마운트합니다.

이렇게 하면 로컬 디렉터리의 `custom_guardrail.py` 파일이 Docker 컨테이너의 `/app` 디렉터리에 마운트되어 LiteLLM Gateway에서 접근할 수 있습니다.


```shell
docker run -d \
  -p 4000:4000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  --name my-app \
  -v $(pwd)/my_config.yaml:/app/config.yaml \
  -v $(pwd)/custom_guardrail.py:/app/custom_guardrail.py \
  my-app:latest \
  --config /app/config.yaml \
  --port 4000 \
  --detailed_debug \
```

</TabItem>

<TabItem value="py" label="litellm pip">


```shell
litellm --config config.yaml --detailed_debug
```

</TabItem>

</Tabs>

### 4. 테스트

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="차단된 요청" value = "blocked">

이 요청은 가드레일 정책을 위반하면 차단됩니다.

```shell
curl -i -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-1234" \
-d '{
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": "Content that violates policy"
        }
    ],
   "guardrails": ["my-custom-guardrail"]
}'
```

차단될 때 예상 응답:

```json
{
  "error": {
    "message": "Content blocked: Policy violation",
    "type": "None",
    "param": "None",
    "code": "500"
  }
}
```

</TabItem>

<TabItem label="성공한 호출" value = "allowed">

이 요청은 가드레일을 통과합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "What is the weather like today?"}
    ],
    "guardrails": ["my-custom-guardrail"]
  }'
```

</TabItem>

</Tabs>

<details>
<summary>고급: 개별 이벤트 훅 테스트</summary>

개별 이벤트 훅을 사용하는 경우 각 모드를 별도로 테스트할 수 있습니다.

#### `"custom-pre-guard"` 테스트

<Tabs>
<TabItem label="입력 수정" value = "not-allowed">

요청을 LLM API로 보내기 전에 `litellm` 단어가 마스킹될 것으로 예상합니다. [이 작업은 `async_pre_call_hook`을 실행합니다](#advanced-individual-event-hooks).

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-1234" \
-d '{
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": "say the word - `litellm`"
        }
    ],
   "guardrails": ["custom-pre-guard"]
}'
```

</TabItem>

<TabItem label="성공한 호출" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["custom-pre-guard"]
  }'
```

</TabItem>

</Tabs>

#### `"custom-during-guard"` 테스트

<Tabs>
<TabItem label="실패한 호출" value = "not-allowed">

메시지 콘텐츠에 `litellm`이 있으므로 실패할 것으로 예상합니다. [이 작업은 `async_moderation_hook`을 실행합니다](#advanced-individual-event-hooks).

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-1234" \
-d '{
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": "say the word - `litellm`"
        }
    ],
   "guardrails": ["custom-during-guard"]
}'
```

예상 응답:

```json
{
  "error": {
    "message": "Guardrail failed words - `litellm` detected",
    "type": "None",
    "param": "None",
    "code": "500"
  }
}
```

</TabItem>

<TabItem label="성공한 호출" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["custom-during-guard"]
  }'
```

</TabItem>

</Tabs>

#### `"custom-post-guard"` 테스트

<Tabs>
<TabItem label="실패한 호출" value = "not-allowed">

응답 콘텐츠에 `coffee`가 포함될 것이므로 실패할 것으로 예상합니다. [이 작업은 `async_post_call_success_hook`을 실행합니다](#advanced-individual-event-hooks).

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-1234" \
-d '{
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": "what is coffee"
        }
    ],
   "guardrails": ["custom-post-guard"]
}'
```

예상 응답:

```json
{
  "error": {
    "message": "Guardrail failed Coffee Detected",
    "type": "None",
    "param": "None",
    "code": "500"
  }
}
```

</TabItem>

<TabItem label="성공한 호출" value = "allowed">

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-1234" \
-d '{
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": "what is tea"
        }
    ],
   "guardrails": ["custom-post-guard"]
}'
```

</TabItem>

</Tabs>

</details>

## ✨ 가드레일에 추가 파라미터 전달

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [무료 평가판 문의하기](https://enterprise.litellm.ai/demo)

:::


가드레일 API 호출에 추가 파라미터를 전달하려면 이 방법을 사용하세요. 예를 들어 성공 임곗값 같은 값을 전달할 수 있습니다.

1. `get_guardrail_dynamic_request_body_params` 사용

`get_guardrail_dynamic_request_body_params`는 요청 본문에 전달된 동적 가드레일 파라미터를 가져오는 `litellm.integrations.custom_guardrail.CustomGuardrail` 클래스의 메서드입니다.

```python
from typing import Any, Dict, List, Literal, Optional, Union
import litellm
from litellm._logging import verbose_proxy_logger
from litellm.caching.caching import DualCache
from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.proxy._types import UserAPIKeyAuth

class myCustomGuardrail(CustomGuardrail):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def async_pre_call_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        cache: DualCache,
        data: dict,
        call_type: Literal[
            "completion",
            "text_completion",
            "embeddings",
            "image_generation",
            "moderation",
            "audio_transcription",
            "pass_through_endpoint",
            "rerank"
        ],
    ) -> Optional[Union[Exception, str, dict]]:
        # Get dynamic params from request body
        params = self.get_guardrail_dynamic_request_body_params(request_data=data)
        # params will contain: {"success_threshold": 0.9}
        verbose_proxy_logger.debug("Guardrail params: %s", params)
        return data
```

2. API 요청에 파라미터 전달:

LiteLLM Proxy에서는 [`guardrails` 사양](quick_start#spec-guardrails-parameter)에 따라 요청 본문에 `guardrails`를 전달할 수 있습니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Write a short poem"}],
    extra_body={
        "guardrails": [
            "custom-pre-guard": {
                "extra_body": {
                    "success_threshold": 0.9
                }
            }
        ]
    }
)
```
</TabItem>

<TabItem value="curl" label="Curl">

```shell
curl 'http://0.0.0.0:4000/chat/completions' \
    -H 'Content-Type: application/json' \
    -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
            "role": "user",
            "content": "Write a short poem"
        }
    ],
    "guardrails": [
        "custom-pre-guard": {
            "extra_body": {
                "success_threshold": 0.9
            }
        }
    ]
}'
```
</TabItem>
</Tabs>

`get_guardrail_dynamic_request_body_params` 메서드는 다음을 반환합니다.
```json
{
    "success_threshold": 0.9
}
```

## 고급: 개별 이벤트 훅

장점: 유연성이 더 높습니다.
단점: 각 LLM 호출 유형(chat completions, text completions, embeddings, image generation, moderation, audio transcription, pass through endpoint, rerank 등)에 대해 구현해야 합니다.

가드레일이 언제, 어떻게 실행되는지 더 세밀하게 제어하려면 개별 이벤트 훅을 구현할 수 있습니다. 이를 통해 다음 작업을 유연하게 처리할 수 있습니다.
- LLM 호출 전에 입력 수정
- LLM 호출과 병렬로 검사 실행(지연 시간 감소)
- LLM 호출 후 출력 검증 또는 수정
- 스트리밍 응답 처리

### 개별 이벤트 훅 예제

```python
from typing import Any, AsyncGenerator, Literal, Optional, Union

import litellm
from litellm._logging import verbose_proxy_logger
from litellm.caching.caching import DualCache
from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.proxy._types import UserAPIKeyAuth
from litellm.types.utils import ModelResponseStream, CallTypes


class myCustomGuardrail(CustomGuardrail):
    def __init__(
        self,
        **kwargs,
    ):
        # store kwargs as optional_params
        self.optional_params = kwargs

        super().__init__(**kwargs)

    async def async_pre_call_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        cache: DualCache,
        data: dict,
        call_type: Optional[CallTypes],
    ) -> Optional[Union[Exception, str, dict]]:
        """
        Runs before the LLM API call
        Runs on only Input
        Use this if you want to MODIFY the input
        """

        # In this guardrail, if a user inputs `litellm` we will mask it and then send it to the LLM
        _messages = data.get("messages")
        if _messages:
            for message in _messages:
                _content = message.get("content")
                if isinstance(_content, str):
                    if "litellm" in _content.lower():
                        _content = _content.replace("litellm", "********")
                        message["content"] = _content

        verbose_proxy_logger.debug(
            "async_pre_call_hook: Message after masking %s", _messages
        )

        return data

    async def async_moderation_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        call_type: Literal["completion", "embeddings", "image_generation", "moderation", "audio_transcription"],
    ):
        """
        Runs in parallel to LLM API call
        Runs on only Input

        This can NOT modify the input, only used to reject or accept a call before going to LLM API
        """

        # this works the same as async_pre_call_hook, but just runs in parallel as the LLM API Call
        # In this guardrail, if a user inputs `litellm` we will mask it.
        _messages = data.get("messages")
        if _messages:
            for message in _messages:
                _content = message.get("content")
                if isinstance(_content, str):
                    if "litellm" in _content.lower():
                        raise ValueError("Guardrail failed words - `litellm` detected")

    async def async_post_call_success_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response,
    ):
        """
        Runs on response from LLM API call

        It can be used to reject a response

        If a response contains the word "coffee" -> we will raise an exception
        """
        verbose_proxy_logger.debug("async_pre_call_hook response: %s", response)
        if isinstance(response, litellm.ModelResponse):
            for choice in response.choices:
                if isinstance(choice, litellm.Choices):
                    verbose_proxy_logger.debug("async_pre_call_hook choice: %s", choice)
                    if (
                        choice.message.content
                        and isinstance(choice.message.content, str)
                        and "coffee" in choice.message.content
                    ):
                        raise ValueError("Guardrail failed Coffee Detected")

    async def async_post_call_streaming_iterator_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_data: dict,
    ) -> AsyncGenerator[ModelResponseStream, None]:
        """
        Passes the entire stream to the guardrail

        This is useful for guardrails that need to see the entire response, such as PII masking.

        See Aim guardrail implementation for an example - https://github.com/BerriAI/litellm/blob/d0e022cfacb8e9ebc5409bb652059b6fd97b45c0/litellm/proxy/guardrails/guardrail_hooks/aim.py#L168

        Triggered by mode: 'post_call'
        """
        async for item in response:
            yield item

```

## **CustomGuardrail 메서드**

| 컴포넌트 | 설명 | 선택 사항 | 검사 데이터 | 입력 수정 가능 | 출력 수정 가능 | 호출 실패 가능 |
|-----------|-------------|----------|--------------|------------------|-------------------|----------------|
| `apply_guardrail` | 텍스트를 검사하고 선택적으로 수정하는 간단한 메서드 | ✅ | INPUT 또는 OUTPUT | ✅ | ✅ | ✅ |
| `async_pre_call_hook` | LLM API 호출 전에 실행되는 훅 | ✅ | INPUT | ✅ | ❌ | ✅ |
| `async_moderation_hook` | LLM API 호출 중에 실행되는 훅 | ✅ | INPUT | ❌ | ❌ | ✅ |
| `async_post_call_success_hook` | 성공한 LLM API 호출 후 실행되는 훅입니다. 스트리밍에서는 전달 후 조립된 응답에 대해 실행됩니다(감사 전용, 차단 불가). | ✅ | INPUT, OUTPUT | ❌ | ✅ | ✅ (비스트리밍에서만) |
| `async_post_call_streaming_iterator_hook` | 스트리밍 응답을 실시간으로 처리하는 훅입니다(청크 필터링/차단 가능). | ✅ | OUTPUT | ❌ | ✅ | ✅ |


## 자주 묻는 질문

**Q. `apply_guardrail`은 요청과 응답 모두(pre_call, during_call, post_call 훅)에 적용되나요?**

**A.** 예, 하나의 함수가 양쪽 모두에서 작동합니다. 구현은 [여기](https://github.com/BerriAI/litellm/blob/0292b84dc47473ddeff29bd5a86f529bc523034b/litellm/proxy/utils.py#L825)를 참고하세요.

**Q. `apply_guardrail`의 입력으로 무엇을 받나요? 각 필드(text, language, entities, request_data)는 무엇을 의미하나요?**

**A.** 가장 중요한 것은 'text'입니다. 검증을 위해 API로 보내려는 값입니다. 구현은 [여기](https://github.com/BerriAI/litellm/blob/0292b84dc47473ddeff29bd5a86f529bc523034b/litellm/llms/anthropic/chat/guardrail_translation/handler.py#L102)를 참고하세요.

**Q. 이 함수는 LLM 제공자와 무관한가요? 예를 들어 OpenAI와 Anthropic에 동일한 값을 전달하나요?**

**A.** 예.

**Q. 내 가드레일이 실행 중인지 어떻게 확인하나요?**

**A.** `apply_guardrail`을 구현했다면 [`/apply_guardrail` API](../../apply_guardrail)를 통해 가드레일을 직접 쿼리할 수 있습니다.
