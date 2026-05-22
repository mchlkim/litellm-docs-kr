# GMI Cloud

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | GMI Cloud는 OpenAI 호환 API를 통해 Claude, GPT, DeepSeek, Gemini 등 주요 AI 모델에 접근할 수 있게 해주는 GPU 클라우드 인프라 제공업체입니다. |
| LiteLLM의 Provider Route | `gmi/` |
| 제공업체 문서 링크 | [GMI Cloud 문서 ↗](https://docs.gmicloud.ai) |
| Base URL | `https://api.gmi-serving.com/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage), [`/models`](#supported-models) |

<br />

## GMI Cloud란?

GMI Cloud는 8200만 달러 이상 투자를 유치한 디지털 인프라 기업으로, 다음을 제공합니다.
- **최상위 GPU 접근**: AI 워크로드용 NVIDIA H100 GPU
- **여러 AI 모델**: Claude, GPT, DeepSeek, Gemini, Kimi, Qwen 등
- **OpenAI 호환 API**: OpenAI SDK의 드롭인 대체재
- **글로벌 인프라**: 미국(Colorado) 및 APAC(Taiwan) 데이터 센터

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["GMI_API_KEY"] = ""  # your GMI Cloud API key
```

[console.gmicloud.ai](https://console.gmicloud.ai)에서 GMI Cloud API 키를 발급받으세요.

## 사용법 - LiteLLM Python SDK {#sample-usage}

### 비스트리밍

```python showLineNumbers title="GMI Cloud Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["GMI_API_KEY"] = ""  # your GMI Cloud API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# GMI Cloud call
response = completion(
    model="gmi/deepseek-ai/DeepSeek-V3.2",
    messages=messages
)

print(response)
```

### 스트리밍

```python showLineNumbers title="GMI Cloud Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["GMI_API_KEY"] = ""  # your GMI Cloud API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# GMI Cloud call with streaming
response = completion(
    model="gmi/anthropic/claude-sonnet-4.5",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 사용법 - LiteLLM Proxy Server

### 1. 환경에 키 저장

```bash
export GMI_API_KEY=""
```

### 2. 프록시 시작

```yaml
model_list:
  - model_name: deepseek-v3
    litellm_params:
      model: gmi/deepseek-ai/DeepSeek-V3.2
      api_key: os.environ/GMI_API_KEY
  - model_name: claude-sonnet
    litellm_params:
      model: gmi/anthropic/claude-sonnet-4.5
      api_key: os.environ/GMI_API_KEY
```

## 지원 모델 {#supported-models}

| 모델 | Model ID | 컨텍스트 길이 |
|-------|----------|----------------|
| Claude Opus 4.5 | `gmi/anthropic/claude-opus-4.5` | 409K |
| Claude Sonnet 4.5 | `gmi/anthropic/claude-sonnet-4.5` | 409K |
| Claude Sonnet 4 | `gmi/anthropic/claude-sonnet-4` | 409K |
| Claude Opus 4 | `gmi/anthropic/claude-opus-4` | 409K |
| GPT-5.2 | `gmi/openai/gpt-5.2` | 409K |
| GPT-5.1 | `gmi/openai/gpt-5.1` | 409K |
| GPT-5 | `gmi/openai/gpt-5` | 409K |
| GPT-4o | `gmi/openai/gpt-4o` | 131K |
| GPT-4o-mini | `gmi/openai/gpt-4o-mini` | 131K |
| DeepSeek V3.2 | `gmi/deepseek-ai/DeepSeek-V3.2` | 163K |
| DeepSeek V3 0324 | `gmi/deepseek-ai/DeepSeek-V3-0324` | 163K |
| Gemini 3 Pro | `gmi/google/gemini-3-pro-preview` | 1M |
| Gemini 3 Flash | `gmi/google/gemini-3-flash-preview` | 1M |
| Kimi K2 Thinking | `gmi/moonshotai/Kimi-K2-Thinking` | 262K |
| MiniMax M2.1 | `gmi/MiniMaxAI/MiniMax-M2.1` | 196K |
| Qwen3-VL 235B | `gmi/Qwen/Qwen3-VL-235B-A22B-Instruct-FP8` | 262K |
| GLM-4.7 | `gmi/zai-org/GLM-4.7-FP8` | 202K |

## 지원되는 OpenAI 파라미터

GMI Cloud는 모든 표준 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. 'role'과 'content'가 포함된 메시지 객체 배열 |
| `model` | string | **필수**. 사용 가능한 모델의 Model ID |
| `stream` | boolean | 선택 사항. 스트리밍 응답 활성화 |
| `temperature` | float | 선택 사항. 샘플링 temperature |
| `top_p` | float | 선택 사항. Nucleus sampling 파라미터 |
| `max_tokens` | integer | 선택 사항. 생성할 최대 토큰 수 |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 토큰에 페널티 적용 |
| `presence_penalty` | float | 선택 사항. 존재 여부를 기준으로 토큰에 페널티 적용 |
| `stop` | string/array | 선택 사항. 중지 시퀀스 |
| `response_format` | object | 선택 사항. `{"type": "json_object"}`를 사용하는 JSON 모드 |

## 추가 자료

- [GMI Cloud 웹사이트](https://www.gmicloud.ai)
- [GMI Cloud 문서](https://docs.gmicloud.ai)
- [GMI Cloud Console](https://console.gmicloud.ai)
