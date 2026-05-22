---
title: SDK 빠른 시작
sidebar_label: SDK 빠른 시작
description: LiteLLM SDK로 첫 호출을 실행한 뒤, 필요한 기능 문서로 바로 이동합니다.
---

import NavigationCards from '@site/src/components/NavigationCards';

애플리케이션 코드 안에서 LiteLLM을 직접 호출하려면 이 경로부터 시작하세요.

## 1. LiteLLM 설치

```bash
uv add 'litellm==1.82.6'
```

## 2. 프로바이더 인증 정보 설정

먼저 사용할 프로바이더 하나를 고르고 필요한 환경 변수를 설정합니다.

- OpenAI: `OPENAI_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY`
- Azure OpenAI: `AZURE_API_KEY`, `AZURE_API_BASE`, `AZURE_API_VERSION`
- Bedrock: 표준 AWS credentials
- Vertex AI: `VERTEXAI_PROJECT`, `VERTEXAI_LOCATION`

아직 프로바이더를 정하지 않았다면 [지원 프로바이더 전체 목록](/litellm-docs-kr/docs/providers)을 먼저 확인하세요.

## 3. 첫 호출 실행

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)

print(response.choices[0].message.content)
```

## 4. 응답 확인

아래 줄은:

```python
print(response.choices[0].message.content)
```

어시스턴트가 반환한 텍스트를 출력합니다. 예시는 다음과 같습니다.

```text
Hello! I'm doing well, thanks for asking.
```

전체 객체를 출력하려면 다음처럼 실행합니다.

```python
print(response)
```

그러면 Python `ModelResponse(...)` 객체가 표시됩니다. OpenAI 기반 모델을 호출한 경우 예시는 다음과 같습니다.

```python
ModelResponse(
    id='chatcmpl-abc123',
    created=1773782130,
    model='gpt-4o-2024-08-06',
    object='chat.completion',
    system_fingerprint='fp_4ff89bf575',
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="Hello! I'm just a program, but I'm here to help you. How can I assist you today?",
                role='assistant',
                tool_calls=None,
                function_call=None,
                provider_specific_fields={'refusal': None},
                annotations=[]
            ),
            provider_specific_fields={}
        )
    ],
    usage=Usage(
        completion_tokens=21,
        prompt_tokens=13,
        total_tokens=34,
        completion_tokens_details=CompletionTokensDetailsWrapper(...),
        prompt_tokens_details=PromptTokensDetailsWrapper(...)
    ),
    service_tier='default'
)
```

동일한 응답은 OpenAI 스타일 구조를 따릅니다. 개념적으로는 다음 형태입니다.

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thanks for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 12,
    "total_tokens": 25
  }
}
```

`id`, `created`, 토큰 수, 메시지 텍스트는 요청마다 달라질 수 있습니다.

OpenAI 기반 모델을 호출하면 `system_fingerprint`, `service_tier`, `tool_calls`, `function_call`, `annotations`, `provider_specific_fields`, 상세 토큰 사용량 같은 추가 필드가 보일 수 있습니다. 전체 출력 형식은 [completion output](/litellm-docs-kr/docs/completion/output)을 참고하세요.

프로바이더별 예제가 더 필요하면 기본 [시작하기](/litellm-docs-kr/docs/#quick-start) 페이지를 확인하세요.

## 5. 다음 단계 선택

<NavigationCards
columns={3}
items={[
{
icon: "⚡",
title: "응답 스트리밍",
description: "stream=True로 토큰을 순차적으로 받습니다.",
to: "/litellm-docs-kr/docs/completion/stream",
},
{
icon: "🧰",
title: "도구 사용",
description: "프로바이더와 무관한 방식으로 function calling을 추가합니다.",
to: "/litellm-docs-kr/docs/completion/function_call",
},
{
icon: "📦",
title: "JSON 반환",
description: "응답을 구조화된 JSON 출력으로 제한합니다.",
to: "/litellm-docs-kr/docs/completion/json_mode",
},
{
icon: "🔀",
title: "라우팅 추가",
description: "애플리케이션 코드에서 재시도, fallback, 부하 분산을 사용합니다.",
to: "/litellm-docs-kr/docs/routing",
},
{
icon: "🌐",
title: "프로바이더 선택",
description: "프로바이더별 인증, 모델 이름, 파라미터를 확인합니다.",
to: "/litellm-docs-kr/docs/providers",
},
]}
/>

## Gateway를 써야 하는 경우

중앙 인증, 가상 키, 비용 추적, 공통 로깅, 여러 앱이 공유하는 OpenAI 호환 엔드포인트가 필요하면 LiteLLM Gateway를 사용하세요.

[Gateway 빠른 시작으로 이동 →](/litellm-docs-kr/docs/learn/gateway_quickstart)
