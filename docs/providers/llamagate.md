# LlamaGate

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | LlamaGate는 크레딧 기반 과금이 적용되는 오픈 소스 LLM용 OpenAI 호환 API 게이트웨이입니다. Llama, Mistral, DeepSeek, Qwen을 포함한 26개 이상의 오픈 소스 모델을 경쟁력 있는 가격으로 사용할 수 있습니다. |
| LiteLLM의 공급자 라우트 | `llamagate/` |
| 공급자 문서 링크 | [LlamaGate 문서 ↗](https://llamagate.dev/docs) |
| 기본 URL | `https://api.llamagate.dev/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage), [`/embeddings`](#embeddings) |

<br />

## LlamaGate란 무엇인가요?

LlamaGate는 OpenAI 호환 API를 통해 오픈 소스 LLM에 접근할 수 있도록 합니다.
- **26개 이상의 오픈 소스 모델**: Llama 3.1/3.2, Mistral, Qwen, DeepSeek R1 등
- **OpenAI 호환 API**: OpenAI SDK를 그대로 대체할 수 있습니다.
- **비전 모델**: 멀티모달 작업을 위한 Qwen VL, LLaVA, olmOCR, UI-TARS
- **추론 모델**: 복잡한 문제 해결을 위한 DeepSeek R1, OpenThinker
- **코드 모델**: CodeLlama, DeepSeek Coder, Qwen Coder, StarCoder2
- **임베딩 모델**: RAG와 검색을 위한 Nomic, Qwen3 Embedding
- **경쟁력 있는 가격**: 100만 토큰당 $0.02-$0.55

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key
```

[llamagate.dev](https://llamagate.dev)에서 API 키를 발급받으세요.

## 지원 모델

### 범용
| 모델 | 모델 ID |
|-------|----------|
| Llama 3.1 8B | `llamagate/llama-3.1-8b` |
| Llama 3.2 3B | `llamagate/llama-3.2-3b` |
| Mistral 7B v0.3 | `llamagate/mistral-7b-v0.3` |
| Qwen 3 8B | `llamagate/qwen3-8b` |
| Dolphin 3 8B | `llamagate/dolphin3-8b` |

### 추론 모델
| 모델 | 모델 ID |
|-------|----------|
| `DeepSeek R1 8B` | `llamagate/deepseek-r1-8b` |
| `DeepSeek R1 Distill Qwen 7B` | `llamagate/deepseek-r1-7b-qwen` |
| OpenThinker 7B | `llamagate/openthinker-7b` |

### 코드 모델
| 모델 | 모델 ID |
|-------|----------|
| Qwen 2.5 Coder 7B | `llamagate/qwen2.5-coder-7b` |
| `DeepSeek Coder 6.7B` | `llamagate/deepseek-coder-6.7b` |
| CodeLlama 7B | `llamagate/codellama-7b` |
| CodeGemma 7B | `llamagate/codegemma-7b` |
| StarCoder2 7B | `llamagate/starcoder2-7b` |

### 비전 모델
| 모델 | 모델 ID |
|-------|----------|
| Qwen 3 VL 8B | `llamagate/qwen3-vl-8b` |
| LLaVA 1.5 7B | `llamagate/llava-7b` |
| Gemma 3 4B | `llamagate/gemma3-4b` |
| olmOCR 7B | `llamagate/olmocr-7b` |
| UI-TARS 1.5 7B | `llamagate/ui-tars-7b` |

### 임베딩 모델
| 모델 | 모델 ID |
|-------|----------|
| Nomic Embed Text | `llamagate/nomic-embed-text` |
| `Qwen 3 Embedding 8B` | `llamagate/qwen3-embedding-8b` |
| `EmbeddingGemma 300M` | `llamagate/embeddinggemma-300m` |

## 사용법 - LiteLLM Python SDK

### 비스트리밍

```python showLineNumbers title="LlamaGate Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# LlamaGate call
response = completion(
    model="llamagate/llama-3.1-8b",
    messages=messages
)

print(response)
```

### 스트리밍

```python showLineNumbers title="LlamaGate Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# LlamaGate call with streaming
response = completion(
    model="llamagate/llama-3.1-8b",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 비전

```python showLineNumbers title="LlamaGate Vision Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key

messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    }
]

# LlamaGate vision call
response = completion(
    model="llamagate/qwen3-vl-8b",
    messages=messages
)

print(response)
```

### 임베딩

```python showLineNumbers title="LlamaGate Embeddings"
import os
import litellm
from litellm import embedding

os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key

# LlamaGate embedding call
response = embedding(
    model="llamagate/nomic-embed-text",
    input=["Hello world", "How are you?"]
)

print(response)
```

## 사용법 - LiteLLM 프록시 서버

### 1. 환경에 키 저장

```bash
export LLAMAGATE_API_KEY=""
```

### 2. 프록시 시작

```yaml
model_list:
  - model_name: llama-3.1-8b
    litellm_params:
      model: llamagate/llama-3.1-8b
      api_key: os.environ/LLAMAGATE_API_KEY
  - model_name: deepseek-r1
    litellm_params:
      model: llamagate/deepseek-r1-8b
      api_key: os.environ/LLAMAGATE_API_KEY
  - model_name: qwen-coder
    litellm_params:
      model: llamagate/qwen2.5-coder-7b
      api_key: os.environ/LLAMAGATE_API_KEY
```

## 지원되는 OpenAI 파라미터

LlamaGate는 모든 표준 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 유형 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. `role`과 `content`가 있는 메시지 객체 배열 |
| `model` | string | **필수**. 모델 ID |
| `stream` | boolean | 선택 사항. 스트리밍 응답 활성화 |
| `temperature` | float | 선택 사항. 샘플링 온도(0-2) |
| `top_p` | float | 선택 사항. 뉴클리어스 샘플링 파라미터 |
| `max_tokens` | integer | 선택 사항. 생성할 최대 토큰 수 |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 토큰에 페널티 적용 |
| `presence_penalty` | float | 선택 사항. 등장 여부를 기준으로 토큰에 페널티 적용 |
| `stop` | string/array | 선택 사항. 중지 시퀀스 |
| `tools` | array | 선택 사항. 사용 가능한 도구/함수 목록 |
| `tool_choice` | string/object | 선택 사항. 도구/함수 호출 제어 |
| `response_format` | object | 선택 사항. JSON 모드 또는 JSON 스키마 |

## 가격

LlamaGate는 경쟁력 있는 토큰당 가격을 제공합니다.

| 모델 범주 | 입력(100만 토큰당) | 출력(100만 토큰당) |
|----------------|----------------|-----------------|
| 임베딩 | $0.02 | - |
| 소형(3-4B) | $0.03-$0.04 | $0.08 |
| 중형(7-8B) | $0.03-$0.15 | $0.05-$0.55 |
| 코드 모델 | $0.06-$0.10 | $0.12-$0.20 |
| 추론 | $0.08-$0.10 | $0.15-$0.20 |

## 추가 리소스

- [LlamaGate 문서](https://llamagate.dev/docs)
- [LlamaGate 가격](https://llamagate.dev/pricing)
- [LlamaGate API 참조](https://llamagate.dev/docs/api)
