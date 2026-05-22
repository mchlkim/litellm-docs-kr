import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 프롬프트 캐싱 {#prompt-caching}

지원 프로바이더:
- OpenAI (`openai/`)
- Anthropic API (`anthropic/`)
- `Google AI Studio` (`gemini/`)
- Vertex AI (`vertex_ai/`, `vertex_ai_beta/`)
- Bedrock (`bedrock/`, `bedrock/invoke/`, `bedrock/converse`) ([Bedrock에서 프롬프트 캐싱을 지원하는 모든 모델](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html))
- Deepseek API (`deepseek/`)
- xAI (`xai/`)

:::warning 최소 토큰 요구사항
입력이 프로바이더의 최소값보다 낮으면 프롬프트 캐싱은 조용히 건너뜁니다. **오류는 반환되지 않습니다**. 응답의 `cache_creation_input_tokens`를 확인해 캐싱이 발생했는지 항상 검증하세요.

| 프로바이더 | 최소 입력 토큰 |
|---|---|
| OpenAI | 1,024 |
| Anthropic (Claude 3.x) | 1,024 |
| Anthropic (`Claude Sonnet/Opus 4.x`) | 2,048 |
| Anthropic (`Claude Haiku 4.5+`, `Opus 4.5+`) | 4,096 |
| Bedrock (Claude 3.5, 3.7) | 1,024 |
| Bedrock (`Claude Sonnet 4.x`) | 2,048 |
| Google Gemini | 1,024 |
:::

지원되는 프로바이더에서 LiteLLM은 OpenAI 프롬프트 캐싱 usage 객체 형식을 따릅니다.

```bash
"usage": {
  "prompt_tokens": 2006,
  "completion_tokens": 300,
  "total_tokens": 2306,
  "prompt_tokens_details": {
    "cached_tokens": 1920
  },
  "completion_tokens_details": {
    "reasoning_tokens": 0
  }
  # ANTHROPIC_ONLY #
  "cache_creation_input_tokens": 0
}
```

- `prompt_tokens`: 캐시 미스 및 캐시 히트 입력 토큰을 포함한 모든 프롬프트 토큰입니다.
- `completion_tokens`: 모델이 생성한 출력 토큰입니다.
- `total_tokens`: prompt_tokens + completion_tokens의 합계입니다.
- `prompt_tokens_details`: cached_tokens를 포함하는 객체입니다.
    - `cached_tokens`: 해당 호출에서 캐시 히트된 토큰입니다.
- `completion_tokens_details`: reasoning_tokens를 포함하는 객체입니다.
- **ANTHROPIC_ONLY**: `cache_creation_input_tokens`는 캐시에 기록된 토큰 수입니다. Anthropic은 이 항목에 과금합니다.

## 빠른 시작

참고: OpenAI 캐싱은 1024개 이상의 토큰이 포함된 프롬프트에서만 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import os

os.environ["OPENAI_API_KEY"] = ""

for _ in range(2):
    response = completion(
        model="gpt-4o",
        messages=[
            # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement"
                        * 400,
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
            {
                "role": "assistant",
                "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
        ],
        temperature=0.2,
        max_tokens=10,
    )

print("response=", response)
print("response.usage=", response.usage)

assert "prompt_tokens_details" in response.usage
assert response.usage.prompt_tokens_details.cached_tokens > 0
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: gpt-4o
      litellm_params:
        model: openai/gpt-4o
        api_key: os.environ/OPENAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-1234
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

for _ in range(2):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement"
                        * 400,
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
            {
                "role": "assistant",
                "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
        ],
        temperature=0.2,
        max_tokens=10,
    )

print("response=", response)
print("response.usage=", response.usage)

assert "prompt_tokens_details" in response.usage
assert response.usage.prompt_tokens_details.cached_tokens > 0
```

</TabItem>
</Tabs>

### OpenAI `prompt_cache_key` 및 `prompt_cache_retention`

OpenAI 프롬프트 캐싱은 [**자동**](https://platform.openai.com/docs/guides/prompt-caching)으로 동작하므로 `cache_control` 메시지 주석이 필요하지 않습니다. 프롬프트 토큰이 1024개 이상인 모든 요청은 캐싱 대상이 될 수 있습니다.

OpenAI는 캐싱 동작을 더 세밀하게 제어하기 위한 선택적 매개변수 두 가지도 지원합니다.

- **`prompt_cache_key`** (string) — 긴 공통 접두사를 공유하는 요청의 캐시 히트율을 높이는 라우팅 힌트입니다. 동일한 캐시 키를 가진 요청은 같은 백엔드로 라우팅되어 캐시 히트 가능성이 높아집니다.
- **`prompt_cache_retention`** (`"in_memory"` 또는 `"24h"`) — 캐시 TTL을 제어합니다. 기본값은 `"in_memory"`(5-10분)입니다. GPU 로컬 스토리지로 KV 텐서를 오프로드하는 확장 캐싱에는 `"24h"`로 설정하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = ""

response = completion(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "You are an AI assistant tasked with analyzing legal documents. "
            + "Here is the full text of a complex legal agreement " * 400,
        },
        {
            "role": "user",
            "content": "What are the key terms and conditions?",
        },
    ],
    prompt_cache_key="legal-doc-analysis",
    prompt_cache_retention="24h",
)
print(response.usage)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",
    base_url="LITELLM_PROXY_BASE",
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "You are an AI assistant tasked with analyzing legal documents. "
            + "Here is the full text of a complex legal agreement " * 400,
        },
        {
            "role": "user",
            "content": "What are the key terms and conditions?",
        },
    ],
    extra_body={
        "prompt_cache_key": "legal-doc-analysis",
        "prompt_cache_retention": "24h",
    },
)
print(response.usage)
```

</TabItem>
</Tabs>

### Anthropic 예제 

Anthropic은 캐시 쓰기에 과금합니다.

`"cache_control": {"type": "ephemeral"}`로 캐싱할 콘텐츠를 지정하세요.

같은 형식은 [Gemini / Vertex AI](#google-ai-studio--vertex-ai-gemini-example)에서도 작동합니다. 다른 프로바이더에서는 무시됩니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python 
from litellm import completion 
import litellm 
import os 

litellm.set_verbose = True # 👈 SEE RAW REQUEST
os.environ["ANTHROPIC_API_KEY"] = "" 

response = completion(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

print(response.usage)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: claude-3-5-sonnet-20240620
      litellm_params:
        model: anthropic/claude-3-5-sonnet-20240620
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python 
from openai import OpenAI 
import os

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-1234
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet-20240620",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

print(response.usage)
```

</TabItem>
</Tabs>

:::tip 최소 토큰 (Anthropic)
최소값보다 낮은 프롬프트는 캐싱 없이 처리되며 오류는 반환되지 않습니다. 응답에서 `cache_creation_input_tokens`를 확인하세요.

| 모델 | 최소 토큰 |
|---|---|
| `Claude 3 Haiku`, `3 Sonnet`, `3 Opus` | 1,024 |
| `Claude 3.5 Sonnet`, `3.7 Sonnet` | 1,024 |
| Claude 3.5 Haiku | 2,048 |
| `Claude Sonnet 4.5`, `Sonnet 4.6`, `Opus 4` | 2,048 |
| `Claude Haiku 4.5`, `Opus 4.5+` | 4,096 |
:::

### Bedrock 예제

LiteLLM은 OpenAI 형식의 `cache_control` 마커를 Bedrock 네이티브 `cachePoint` 형식으로 자동 변환합니다. 이미 `cache_control`을 사용 중이라면 기존 코드를 변경할 필요가 없습니다.

:::tip 최소 토큰 (Bedrock)
최소값보다 낮은 프롬프트는 캐싱 없이 처리되며 오류는 반환되지 않습니다. 응답에서 `cache_creation_input_tokens`를 확인하세요.

| 모델 제품군 | 요청당 최소 토큰 |
|---|---|
| `Claude 3.5 Sonnet v2`, `Claude 3.7 Sonnet` | 1,024 |
| `Claude Sonnet 4.5`, `Sonnet 4.6` | 2,048 |
:::

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

response = litellm.completion(
    model="bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "<your large system prompt here — min 1,024 tokens for Claude 3.x, 2,048 for Claude Sonnet 4.x>",
                    "cache_control": {"type": "ephemeral"}
                }
            ]
        },
        {"role": "user", "content": "What is prompt caching?"}
    ]
)

print(response.usage)
# cache_creation_input_tokens > 0 on first call (cache written)
# cache_read_input_tokens > 0 on subsequent calls (cache hit)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "bedrock-claude-sonnet",
    "messages": [
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": "<your large system prompt here — min 1,024 tokens for Claude 3.x, 2,048 for Claude Sonnet 4.x>",
            "cache_control": {"type": "ephemeral"}
          }
        ]
      },
      {"role": "user", "content": "What is prompt caching?"}
    ]
  }'
```

</TabItem>
</Tabs>

**지원되는 Bedrock 모델:**

| 모델 | Bedrock 모델 ID | 최소 토큰 | TTL 옵션 |
|---|---|---|---|
| Claude 3.5 Sonnet v2 | `anthropic.claude-3-5-sonnet-20241022-v2:0` | 1,024 | 5분, 1시간 |
| Claude 3.7 Sonnet | `anthropic.claude-3-7-sonnet-20250219-v1:0` | 1,024 | 5분, 1시간 |
| Claude Opus 4 | `anthropic.claude-opus-4-20250514-v1:0` | 1,024 | 5분, 1시간 |
| Claude Sonnet 4.5, 4.6 | `us.anthropic.claude-sonnet-4-5-*`, `us.anthropic.claude-sonnet-4-6-*` | 2,048 | 5분, 1시간 |

위 모델에는 교차 리전 추론 프로필도 지원됩니다.

지원되는 모델 및 리전의 전체 목록은 [AWS Bedrock 프롬프트 캐싱 문서](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html)를 참고하세요.

### Google AI Studio / Vertex AI (Gemini) 예제 {#google-ai-studio--vertex-ai-gemini-example}

동일한 Anthropic 스타일 `cache_control` 형식을 사용하세요. LiteLLM이 이를 Google의 [컨텍스트 캐싱 API](https://ai.google.dev/api/caching)로 자동 변환합니다.

**내부 동작 방식:**
1. `cache_control`이 있는 메시지는 분리되어 Google의 `cachedContents` API로 전송됩니다.
2. 이후 캐시된 콘텐츠 ID가 Gemini 요청 본문의 `cachedContent`로 전달됩니다.
3. `gemini/`(Google AI Studio), `vertex_ai/`, `vertex_ai_beta/` 세 프로바이더 모두에서 작동합니다.
4. 캐시되는 콘텐츠에는 최소 **1024개 토큰**이 필요합니다. 그보다 적으면 캐싱은 조용히 건너뜁니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ""

response = completion(
    model="gemini/gemini-2.5-flash",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: gemini-2.5-flash
      litellm_params:
        model: gemini/gemini-2.5-flash
        api_key: os.environ/GEMINI_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",  # sk-1234
    base_url="LITELLM_PROXY_BASE",  # http://0.0.0.0:4000
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```

</TabItem>
</Tabs>

#### Vertex AI

Vertex AI에서는 `vertex_ai/` 접두사를 사용하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemini-2.5-flash",
    vertex_project="my-gcp-project",
    vertex_location="us-central1",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: gemini-2.5-flash
      litellm_params:
        model: vertex_ai/gemini-2.5-flash
        vertex_project: my-gcp-project
        vertex_location: us-central1
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",  # sk-1234
    base_url="LITELLM_PROXY_BASE",  # http://0.0.0.0:4000
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```

</TabItem>
</Tabs>

### Deepseek 예제

OpenAI와 동일하게 작동합니다.

```python 
from litellm import completion 
import litellm
import os 

os.environ["DEEPSEEK_API_KEY"] = "" 

litellm.set_verbose = True # 👈 SEE RAW REQUEST

model_name = "deepseek/deepseek-chat"
messages_1 = [
    {
        "role": "system",
        "content": "You are a history expert. The user will provide a series of questions, and your answers should be concise and start with `Answer:`",
    },
    {
        "role": "user",
        "content": "In what year did Qin Shi Huang unify the six states?",
    },
    {"role": "assistant", "content": "Answer: 221 BC"},
    {"role": "user", "content": "Who was the founder of the Han Dynasty?"},
    {"role": "assistant", "content": "Answer: Liu Bang"},
    {"role": "user", "content": "Who was the last emperor of the Tang Dynasty?"},
    {"role": "assistant", "content": "Answer: Li Zhu"},
    {
        "role": "user",
        "content": "Who was the founding emperor of the Ming Dynasty?",
    },
    {"role": "assistant", "content": "Answer: Zhu Yuanzhang"},
    {
        "role": "user",
        "content": "Who was the founding emperor of the Qing Dynasty?",
    },
]

message_2 = [
    {
        "role": "system",
        "content": "You are a history expert. The user will provide a series of questions, and your answers should be concise and start with `Answer:`",
    },
    {
        "role": "user",
        "content": "In what year did Qin Shi Huang unify the six states?",
    },
    {"role": "assistant", "content": "Answer: 221 BC"},
    {"role": "user", "content": "Who was the founder of the Han Dynasty?"},
    {"role": "assistant", "content": "Answer: Liu Bang"},
    {"role": "user", "content": "Who was the last emperor of the Tang Dynasty?"},
    {"role": "assistant", "content": "Answer: Li Zhu"},
    {
        "role": "user",
        "content": "Who was the founding emperor of the Ming Dynasty?",
    },
    {"role": "assistant", "content": "Answer: Zhu Yuanzhang"},
    {"role": "user", "content": "When did the Shang Dynasty fall?"},
]

response_1 = litellm.completion(model=model_name, messages=messages_1)
response_2 = litellm.completion(model=model_name, messages=message_2)

# Add any assertions here to check the response
print(response_2.usage)
```


## 비용 계산

캐시 히트된 프롬프트 토큰의 비용은 캐시 미스된 프롬프트 토큰의 비용과 다를 수 있습니다.

비용 계산에는 `completion_cost()` 함수를 사용하세요. 이 함수는 [프롬프트 캐싱 비용 계산](https://github.com/BerriAI/litellm/blob/f7ce1173f3315cc6cae06cf9bcf12e54a2a19705/litellm/llms/anthropic/cost_calculation.py#L12)도 처리합니다. [**더 많은 헬퍼 함수 보기**](./token_usage.md)

```python
cost = completion_cost(completion_response=response, model=model)
```

### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion, completion_cost
import litellm 
import os 

litellm.set_verbose = True # 👈 SEE RAW REQUEST
os.environ["ANTHROPIC_API_KEY"] = "" 
model = "anthropic/claude-3-5-sonnet-20240620"
response = completion(
    model=model,
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

print(response.usage)

cost = completion_cost(completion_response=response, model=model) 

formatted_string = f"${float(cost):.10f}"
print(formatted_string)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

LiteLLM은 계산된 비용을 응답 헤더 `x-litellm-response-cost`에 반환합니다.

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-1234..
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)
response = client.chat.completions.with_raw_response.create(
    messages=[{
        "role": "user",
        "content": "Say this is a test",
    }],
    model="gpt-3.5-turbo",
)
print(response.headers.get('x-litellm-response-cost'))

completion = response.parse()  # get the object that `chat.completions.create()` would have returned
print(completion)
```

</TabItem>
</Tabs>

## 모델 지원 여부 확인

`supports_prompt_caching()`으로 모델이 프롬프트 캐싱을 지원하는지 확인하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_prompt_caching

supports_pc: bool = supports_prompt_caching(model="anthropic/claude-3-5-sonnet-20240620")

assert supports_pc
```

</TabItem>
<TabItem value="proxy" label="PROXY">

프록시의 모델이 프롬프트 캐싱을 지원하는지 확인하려면 `/model/info` 엔드포인트를 사용하세요.

1. config.yaml 설정

```yaml
model_list:
    - model_name: claude-3-5-sonnet-20240620
      litellm_params:
        model: anthropic/claude-3-5-sonnet-20240620
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -L -X GET 'http://0.0.0.0:4000/v1/model/info' \
-H 'Authorization: Bearer sk-1234' \
```

**예상 응답**

```bash
{
    "data": [
        {
            "model_name": "claude-3-5-sonnet-20240620",
            "litellm_params": {
                "model": "anthropic/claude-3-5-sonnet-20240620"
            },
            "model_info": {
                "key": "claude-3-5-sonnet-20240620",
                ...
                "supports_prompt_caching": true # 👈 LOOK FOR THIS!
            }
        }
    ]
}
```

</TabItem>
</Tabs>

이 함수는 LiteLLM이 관리하는 [모델 정보/비용 맵](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)을 확인합니다.

## 더 보기

:::tip Auto-Inject 프롬프트 캐싱
코드를 수정하지 않고 LiteLLM이 `cache_control` 지시문을 자동으로 추가하도록 하고 싶으신가요?

[**Auto-Inject 프롬프트 캐싱 튜토리얼**](../tutorials/prompt_caching.md)에서 `cache_control_injection_points`를 사용해 시스템 메시지, 인덱스별 특정 메시지 또는 사용자 지정 주입 패턴을 자동으로 캐싱하는 방법을 알아보세요.
:::
