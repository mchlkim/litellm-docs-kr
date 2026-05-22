import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Vertex AI - Anthropic, DeepSeek, Model Garden, xAI 파트너 모델

## 지원되는 파트너 제공자

| 제공자 | LiteLLM 라우트 | Vertex 문서 |
|----------|---------------|---------------|
| Anthropic (Claude) | `vertex_ai/claude-*` | [Vertex AI - Anthropic 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude) |
| DeepSeek | `vertex_ai/deepseek-ai/{MODEL}` | [Vertex AI - DeepSeek 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/maas/deepseek) |
| ZAI (GLM) | `vertex_ai/zai-org/{MODEL}` | [Vertex AI - GLM 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/maas/zaiorg/glm-47) |
| Meta/Llama | `vertex_ai/meta/{MODEL}` | [Vertex AI - Meta 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/llama) |
| Mistral | `vertex_ai/mistral-*` | [Vertex AI - Mistral 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/mistral) |
| AI21 (Jamba) | `vertex_ai/jamba-*` | [Vertex AI - AI21 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/ai21) |
| Qwen | `vertex_ai/qwen/*` | [Vertex AI - Qwen 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/maas/qwen) |
| OpenAI (GPT-OSS) | `vertex_ai/openai/gpt-oss-*` | [Vertex AI - GPT-OSS 모델](https://console.cloud.google.com/vertex-ai/publishers/openai/model-garden/) |
| xAI (Grok) | `vertex_ai/xai/{MODEL}` | [xAI 모델(Vertex 포함)](https://docs.x.ai/docs/models), [Vertex AI Model Garden](https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/explore-models) |

## Vertex AI - Anthropic (Claude)

| 모델 이름       | 함수 호출                        |
|------------------|--------------------------------------|
| claude-3-opus@20240229   | `completion('vertex_ai/claude-3-opus@20240229', messages)` |
| claude-3-5-sonnet@20240620  | `completion('vertex_ai/claude-3-5-sonnet@20240620', messages)` |
| claude-3-sonnet@20240229   | `completion('vertex_ai/claude-3-sonnet@20240229', messages)` |
| claude-3-haiku@20240307   | `completion('vertex_ai/claude-3-haiku@20240307', messages)` |
| claude-3-7-sonnet@20250219   | `completion('vertex_ai/claude-3-7-sonnet@20250219', messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

model = "claude-3-sonnet@20240229"

vertex_ai_project = "your-vertex-project" # can also set this as os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location" # can also set this as os.environ["VERTEXAI_LOCATION"]

response = completion(
    model="vertex_ai/" + model,
    messages=[{"role": "user", "content": "hi"}],
    temperature=0.7,
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
)
print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: anthropic-vertex
      litellm_params:
        model: vertex_ai/claude-3-sonnet@20240229
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
    - model_name: anthropic-vertex
      litellm_params:
        model: vertex_ai/claude-3-sonnet@20240229
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-west-1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "anthropic-vertex", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>



#### 사용법 - `thinking` / `reasoning_content`


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

resp = completion(
    model="vertex_ai/claude-3-7-sonnet-20250219",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    thinking={"type": "enabled", "budget_tokens": 1024},
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
- model_name: claude-3-7-sonnet-20250219
  litellm_params:
    model: vertex_ai/claude-3-7-sonnet-20250219
    vertex_ai_project: "my-test-project"
    vertex_ai_location: "us-west-1"
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>


**예상 응답**

```python
ModelResponse(
    id='chatcmpl-c542d76d-f675-4e87-8e5f-05855f5d0f5e',
    created=1740470510,
    model='claude-3-7-sonnet-20250219',
    object='chat.completion',
    system_fingerprint=None,
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="The capital of France is Paris.",
                role='assistant',
                tool_calls=None,
                function_call=None,
                provider_specific_fields={
                    'citations': None,
                    'thinking_blocks': [
                        {
                            'type': 'thinking',
                            'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                            'signature': 'EuYBCkQYAiJAy6...'
                        }
                    ]
                }
            ),
            thinking_blocks=[
                {
                    'type': 'thinking',
                    'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                    'signature': 'EuYBCkQYAiJAy6AGB...'
                }
            ],
            reasoning_content='The capital of France is Paris. This is a very straightforward factual question.'
        )
    ],
    usage=Usage(
        completion_tokens=68,
        prompt_tokens=42,
        total_tokens=110,
        completion_tokens_details=None,
        prompt_tokens_details=PromptTokensDetailsWrapper(
            audio_tokens=None,
            cached_tokens=0,
            text_tokens=None,
            image_tokens=None
        ),
        cache_creation_input_tokens=0,
        cache_read_input_tokens=0
    )
)
```

## VertexAI DeepSeek

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `vertex_ai/deepseek-ai/{MODEL}` |
| Vertex 문서 | [Vertex AI - DeepSeek 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/maas/deepseek) |

#### 사용법

**LiteLLM은 모든 Vertex AI DeepSeek 모델을 지원합니다.** 모든 Vertex AI DeepSeek 모델에 `vertex_ai/deepseek-ai/` 접두사를 사용해야 합니다.

| 모델 이름       | 사용법                        |
|------------------|------------------------------|
| `vertex_ai/deepseek-ai/deepseek-r1-0528-maas` | `completion('vertex_ai/deepseek-ai/deepseek-r1-0528-maas', messages)` |

## VertexAI ZAI (GLM)

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `vertex_ai/zai-org/{MODEL}` |
| Vertex 문서 | [Vertex AI - GLM 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/maas/zaiorg/glm-47) |

**LiteLLM은 모든 Vertex AI GLM 모델을 지원합니다.** 모든 Vertex AI GLM 모델에 `vertex_ai/zai-org/` 접두사를 사용해야 합니다.

| 모델 이름 | 사용법 |
|------------|-------|
| `vertex_ai/zai-org/glm-4.7-maas` | `completion('vertex_ai/zai-org/glm-4.7-maas', messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

response = completion(
    model="vertex_ai/zai-org/glm-4.7-maas",
    messages=[{"role": "user", "content": "hi"}],
    vertex_project="your-vertex-project",
    # vertex_location routes to "global"
)
print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
  - model_name: glm-4.7
    litellm_params:
      model: vertex_ai/zai-org/glm-4.7-maas
      vertex_project: "my-project"
      # vertex_location routes to "global"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "glm-4.7",
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

## VertexAI Meta/Llama API 사용 {#vertexai-meta-llama-api}
 
| 모델 이름       | 함수 호출                        |
|------------------|--------------------------------------|
| `meta/llama-3.2-90b-vision-instruct-maas` | `completion('vertex_ai/meta/llama-3.2-90b-vision-instruct-maas', messages)` |
| `meta/llama3-8b-instruct-maas` | `completion('vertex_ai/meta/llama3-8b-instruct-maas', messages)` |
| `meta/llama3-70b-instruct-maas` | `completion('vertex_ai/meta/llama3-70b-instruct-maas', messages)` |
| `meta/llama3-405b-instruct-maas`   | `completion('vertex_ai/meta/llama3-405b-instruct-maas', messages)` |
| `meta/llama-4-scout-17b-16e-instruct-maas` | `completion('vertex_ai/meta/llama-4-scout-17b-16e-instruct-maas', messages)` |
| `meta/llama-4-scout-17-128e-instruct-maas` | `completion('vertex_ai/meta/llama-4-scout-128b-16e-instruct-maas', messages)` |
| `meta/llama-4-maverick-17b-128e-instruct-maas` | `completion('vertex_ai/meta/llama-4-maverick-17b-128e-instruct-maas',messages)` |
| `meta/llama-4-maverick-17b-16e-instruct-maas` | `completion('vertex_ai/meta/llama-4-maverick-17b-16e-instruct-maas',messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

model = "meta/llama3-405b-instruct-maas"

vertex_ai_project = "your-vertex-project" # can also set this as os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location" # can also set this as os.environ["VERTEXAI_LOCATION"]

response = completion(
    model="vertex_ai/" + model,
    messages=[{"role": "user", "content": "hi"}],
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
)
print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: anthropic-llama
      litellm_params:
        model: vertex_ai/meta/llama3-405b-instruct-maas
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
    - model_name: anthropic-llama
      litellm_params:
        model: vertex_ai/meta/llama3-405b-instruct-maas
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-west-1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "anthropic-llama", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

## VertexAI Mistral API 사용 {#vertexai-mistral-api}

[**지원되는 OpenAI 매개변수**](https://github.com/BerriAI/litellm/blob/e0f3cd580cb85066f7d36241a03c30aa50a8a31d/litellm/llms/openai.py#L137)

**LiteLLM은 모든 Vertex AI Mistral 모델을 지원합니다.** 모든 Vertex AI Mistral 모델에 `vertex_ai/mistral-` 접두사를 사용해야 합니다.

개요

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `vertex_ai/mistral-{MODEL}` |
| Vertex 문서 | [Vertex AI - Mistral 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/mistral) |
 
| 모델 이름       | 함수 호출                        |
|------------------|--------------------------------------|
| mistral-large@latest   | `completion('vertex_ai/mistral-large@latest', messages)` |
| mistral-large@2407   | `completion('vertex_ai/mistral-large@2407', messages)` |
| `mistral-small-2503`   | `completion('vertex_ai/mistral-small-2503', messages)` |
| `mistral-large-2411`   | `completion('vertex_ai/mistral-large-2411', messages)` |
| mistral-nemo@latest   | `completion('vertex_ai/mistral-nemo@latest', messages)` |
| codestral@latest   | `completion('vertex_ai/codestral@latest', messages)` |
| codestral@@2405   | `completion('vertex_ai/codestral@2405', messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

model = "mistral-large@2407"

vertex_ai_project = "your-vertex-project" # can also set this as os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location" # can also set this as os.environ["VERTEXAI_LOCATION"]

response = completion(
    model="vertex_ai/" + model,
    messages=[{"role": "user", "content": "hi"}],
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
)
print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: vertex-mistral
      litellm_params:
        model: vertex_ai/mistral-large@2407
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
    - model_name: vertex-mistral
      litellm_params:
        model: vertex_ai/mistral-large@2407
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-west-1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "vertex-mistral", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>


#### 사용법 - Codestral FIM

FIM 작업에는 OpenAI [`/v1/completion`](https://platform.openai.com/docs/api-reference/completions/create) 엔드포인트를 통해 VertexAI의 Codestral을 호출하세요. 

참고: `/chat/completion`을 통해서도 Codestral을 호출할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""
# OR run `!gcloud auth print-access-token` in your terminal

model = "codestral@2405"

vertex_ai_project = "your-vertex-project" # can also set this as os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location" # can also set this as os.environ["VERTEXAI_LOCATION"]

response = text_completion(
    model="vertex_ai/" + model,
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
    prompt="def is_odd(n): \n return n % 2 == 1 \ndef test_is_odd():", 
    suffix="return True",                                              # optional
    temperature=0,                                                     # optional
    top_p=1,                                                           # optional
    max_tokens=10,                                                     # optional
    min_tokens=10,                                                     # optional
    seed=10,                                                           # optional
    stop=["return"],                                                   # optional
)

print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: vertex-codestral
      litellm_params:
        model: vertex_ai/codestral@2405
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
    - model_name: vertex-codestral
      litellm_params:
        model: vertex_ai/codestral@2405
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-west-1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl -X POST 'http://0.0.0.0:4000/completions' \
      -H 'Authorization: Bearer sk-1234' \
      -H 'Content-Type: application/json' \
      -d '{
            "model": "vertex-codestral", # 👈 the 'model_name' in config
            "prompt": "def is_odd(n): \n return n % 2 == 1 \ndef test_is_odd():", 
            "suffix":"return True",                                              # optional
            "temperature":0,                                                     # optional
            "top_p":1,                                                           # optional
            "max_tokens":10,                                                     # optional
            "min_tokens":10,                                                     # optional
            "seed":10,                                                           # optional
            "stop":["return"],                                                   # optional
        }'
```

</TabItem>
</Tabs>


## VertexAI AI21 모델
 
| 모델 이름       | 함수 호출                        |
|------------------|--------------------------------------|
| jamba-1.5-mini@001   | `completion(model='vertex_ai/jamba-1.5-mini@001', messages)` |
| jamba-1.5-large@001   | `completion(model='vertex_ai/jamba-1.5-large@001', messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

model = "meta/jamba-1.5-mini@001"

vertex_ai_project = "your-vertex-project" # can also set this as os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location" # can also set this as os.environ["VERTEXAI_LOCATION"]

response = completion(
    model="vertex_ai/" + model,
    messages=[{"role": "user", "content": "hi"}],
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
)
print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: jamba-1.5-mini
      litellm_params:
        model: vertex_ai/jamba-1.5-mini@001
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
    - model_name: jamba-1.5-large
      litellm_params:
        model: vertex_ai/jamba-1.5-large@001
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-west-1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "jamba-1.5-large",
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>


## VertexAI Qwen API

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `vertex_ai/qwen/{MODEL}` |
| Vertex 문서 | [Vertex AI - Qwen 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/maas/qwen) |

**LiteLLM은 모든 Vertex AI Qwen 모델을 지원합니다.** 모든 Vertex AI Qwen 모델에 `vertex_ai/qwen/` 접두사를 사용해야 합니다.

| 모델 이름       | 사용법                        |
|------------------|------------------------------|
| `vertex_ai/qwen/qwen3-coder-480b-a35b-instruct-maas` | `completion('vertex_ai/qwen/qwen3-coder-480b-a35b-instruct-maas', messages)` |
| `vertex_ai/qwen/qwen3-235b-a22b-instruct-2507-maas` | `completion('vertex_ai/qwen/qwen3-235b-a22b-instruct-2507-maas', messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

model = "qwen/qwen3-coder-480b-a35b-instruct-maas"

vertex_ai_project = "your-vertex-project" # can also set this as os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location" # can also set this as os.environ["VERTEXAI_LOCATION"]

response = completion(
    model="vertex_ai/" + model,
    messages=[{"role": "user", "content": "hi"}],
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
)
print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: vertex-qwen
      litellm_params:
        model: vertex_ai/qwen/qwen3-coder-480b-a35b-instruct-maas
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
    - model_name: vertex-qwen
      litellm_params:
        model: vertex_ai/qwen/qwen3-coder-480b-a35b-instruct-maas
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-west-1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "vertex-qwen", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>


## VertexAI GPT-OSS 모델

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `vertex_ai/openai/{MODEL}` |
| Vertex 문서 | [Vertex AI - GPT-OSS 모델](https://console.cloud.google.com/vertex-ai/publishers/openai/model-garden/) |

**LiteLLM은 모든 Vertex AI GPT-OSS 모델을 지원합니다.** 모든 Vertex AI GPT-OSS 모델에 `vertex_ai/openai/` 접두사를 사용해야 합니다.

| 모델 이름       | 사용법                        |
|------------------|------------------------------|
| `vertex_ai/openai/gpt-oss-20b-maas` | `completion('vertex_ai/openai/gpt-oss-20b-maas', messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

model = "openai/gpt-oss-20b-maas"

vertex_ai_project = "your-vertex-project" # can also set this as os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location" # can also set this as os.environ["VERTEXAI_LOCATION"]

response = completion(
    model="vertex_ai/" + model,
    messages=[{"role": "user", "content": "hi"}],
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
)
print("\nModel Response", response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: gpt-oss
      litellm_params:
        model: vertex_ai/openai/gpt-oss-20b-maas
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-central1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "gpt-oss", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

#### 사용법 - `reasoning_effort`

GPT-OSS 모델은 향상된 추론 기능을 위해 `reasoning_effort` 매개변수를 지원합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="vertex_ai/openai/gpt-oss-20b-maas",
    messages=[{"role": "user", "content": "Solve this complex problem step by step"}],
    reasoning_effort="low",  # Options: "minimal", "low", "medium", "high"
    vertex_ai_project="your-vertex-project",
    vertex_ai_location="us-central1",
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
- model_name: gpt-oss
  litellm_params:
    model: vertex_ai/openai/gpt-oss-20b-maas
    vertex_ai_project: "my-test-project"
    vertex_ai_location: "us-central1"
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gpt-oss",
    "messages": [{"role": "user", "content": "Solve this complex problem step by step"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

## VertexAI xAI (Grok) 사용 {#vertexai-xai-grok}

**Vertex AI Model Garden**에서 제공되는 xAI Grok 모델은 다른 Model Garden 게시자 모델과 동일한 OpenAI 호환 chat-completions 경로를 사용합니다. `vertex_ai/xai/` 접두사를 사용하세요(`XAI_API_KEY`를 사용하는 직접 xAI API인 `xai/`가 아님). [xAI 제공자](./xai.md)도 참고하세요.

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `vertex_ai/xai/{MODEL}` |
| Vertex / xAI 문서 | [xAI 모델](https://docs.x.ai/docs/models), [Model Garden](https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/explore-models) |

| 모델 이름 | 사용법 |
|------------|--------|
| `vertex_ai/xai/grok-4.1-fast-non-reasoning` | `completion('vertex_ai/xai/grok-4.1-fast-non-reasoning', messages)` |
| `vertex_ai/xai/grok-4.1-fast-reasoning` | `completion('vertex_ai/xai/grok-4.1-fast-reasoning', messages)` |
| `vertex_ai/xai/grok-4.20-non-reasoning` | `completion('vertex_ai/xai/grok-4.20-non-reasoning', messages)` |
| `vertex_ai/xai/grok-4.20-reasoning` | `completion('vertex_ai/xai/grok-4.20-reasoning', messages)` |

#### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

vertex_ai_project = "your-vertex-project"  # or os.environ["VERTEXAI_PROJECT"]
vertex_ai_location = "your-vertex-location"  # or os.environ["VERTEXAI_LOCATION"]

response = completion(
    model="vertex_ai/xai/grok-4.1-fast-non-reasoning",
    messages=[{"role": "user", "content": "hi"}],
    vertex_ai_project=vertex_ai_project,
    vertex_ai_location=vertex_ai_location,
)
print("\nModel Response", response)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 구성에 추가**

```yaml
model_list:
    - model_name: grok-vertex
      litellm_params:
        model: vertex_ai/xai/grok-4.1-fast-non-reasoning
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-central1"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "grok-vertex",
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>
