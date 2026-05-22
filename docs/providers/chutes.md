# Chutes

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Chutes는 vLLM, SGLang 같은 popular framework용 pre-built template을 사용해 OpenAI 호환 API로 LLM application을 deploy, run, scale할 수 있는 cloud-native AI deployment platform입니다. |
| LiteLLM Provider 경로 | `chutes/` |
| Provider Doc 링크 | [Chutes Website ↗](https://chutes.ai) |
| Base URL | `https://llm.chutes.ai/v1/` |
| 지원 작업 | [`/chat/completions`](#sample-usage), Embeddings |

<br />

## Chutes란?

Chutes는 다음 기능을 제공하는 AI deployment 및 serving platform입니다.
- **Pre-built Templates**: vLLM, SGLang, diffusion model, embedding용 ready-to-use 설정
- **OpenAI 호환 API**: 표준 OpenAI SDK와 client 사용
- **Multi-GPU Scaling**: 여러 GPU에 걸친 large model 지원
- **Streaming Responses**: 실시간 model output
- **Custom 설정**: 필요에 맞게 모든 parameter override
- **Performance Optimization**: 미리 구성된 optimization setting

## Required Variables

```python showLineNumbers title="Environment Variables"
os.environ["CHUTES_API_KEY"] = ""  # your Chutes API key
```

[chutes.ai](https://chutes.ai)에서 Chutes API key를 가져옵니다.

## 사용법 - LiteLLM Python SDK

### Non-streaming

```python showLineNumbers title="Chutes Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["CHUTES_API_KEY"] = ""  # your Chutes API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Chutes call
response = completion(
    model="chutes/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### Streaming

```python showLineNumbers title="Chutes Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["CHUTES_API_KEY"] = ""  # your Chutes API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Chutes call with streaming
response = completion(
    model="chutes/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 사용법 - LiteLLM Proxy Server

### 1. 환경에 key 저장

```bash
export CHUTES_API_KEY=""
```

### 2. 프록시 시작

```yaml
model_list:
  - model_name: chutes-model
    litellm_params:
      model: chutes/model-name  # Replace with actual model name
      api_key: os.environ/CHUTES_API_KEY
```

## 지원 OpenAI Parameter

Chutes는 모든 표준 OpenAI 호환 parameter를 지원합니다.

| Parameter | Type | 설명 |
|-----------|------|-------------|
| `messages` | array | **Required**. `role`과 `content`를 가진 message object 배열 |
| `model` | string | **Required**. Model ID 또는 HuggingFace model identifier |
| `stream` | boolean | Optional. streaming response 활성화 |
| `temperature` | float | Optional. sampling 온도 |
| `top_p` | float | Optional. nucleus sampling parameter 값 |
| `max_tokens` | integer | Optional. 생성할 최대 token 수 |
| `frequency_penalty` | float | Optional. 자주 등장하는 token에 penalty 적용 |
| `presence_penalty` | float | Optional. presence 기반 token penalty 적용 |
| `stop` | string/array | Optional. stop sequence 값 |
| `tools` | array | Optional. 사용 가능한 tool/function 목록 |
| `tool_choice` | string/object | Optional. tool/function calling 제어 |
| `response_format` | object | Optional. response format 지정 |

## 지원 Framework

Chutes는 popular AI framework에 최적화된 template을 제공합니다.

### vLLM (고성능 LLM Serving)
- OpenAI 호환 endpoint
- Multi-GPU scaling 지원
- 고급 optimization setting
- production workload에 적합

### SGLang (고급 LLM Serving)
- structured generation 기능
- 고급 feature와 control
- custom configuration 선택지
- 복잡한 use case에 적합

### Diffusion 모델 (Image Generation)
- 미리 구성된 image generation template
- 최상의 결과를 위한 optimized setting
- popular diffusion model 지원

### Embedding 모델
- text embedding용 template
- vector search 최적화
- popular embedding model 지원

## 인증

Chutes는 여러 authentication method를 지원합니다.
- `X-API-Key` header를 통한 API key
- `Authorization` header를 통한 bearer token

LiteLLM 예제(environment variable 사용):
```python
os.environ["CHUTES_API_KEY"] = "your-api-key"
```

## Performance 최적화

Chutes는 hardware 선택과 optimization을 제공합니다.
- **Small 모델 (7B-13B)**: 24GB VRAM GPU 1개
- **Medium 모델 (30B-70B)**: 각 80GB VRAM GPU 4개
- **Large 모델 (100B+)**: 각 140GB+ VRAM GPU 8개

performance fine-tuning을 위한 engine optimization parameter를 사용할 수 있습니다.

## Deployment Options

Chutes는 유연한 deployment를 제공합니다.
- **Quick Setup**: 즉시 deployment할 수 있는 pre-built template 사용
- **Custom Images**: custom Docker image로 deploy
- **Scaling**: max instance와 auto-scaling threshold 설정
- **Hardware**: 특정 GPU type과 configuration 선택

## 추가 Resource

- [Chutes Documentation](https://chutes.ai/docs)
- [Chutes 시작하기](https://chutes.ai/docs/getting-started/running-a-chute)
- [Chutes API Reference](https://chutes.ai/docs/sdk-reference)
