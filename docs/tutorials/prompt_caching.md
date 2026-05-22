import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prompt 캐싱 Checkpoints 자동 주입 {#auto-inject-prompt-caching-checkpoints}

LiteLLM으로 prompt caching checkpoints를 자동 주입하여 비용을 최대 90%까지 줄일 수 있습니다.

<Image img={require('../../img/auto_prompt_caching.png')}  style={{ width: '800px', height: 'auto' }} />

지원 프로바이더 (`cache_control` marker):
- Anthropic API (`anthropic/`)
- AWS Bedrock - Claude (`bedrock/`)
- Vertex AI - Claude / Gemini (`vertex_ai/`)
- `Google AI Studio - Gemini` (`gemini/`)
- Azure AI - Claude (`azure_ai/`)
- OpenRouter - Claude, Gemini, MiniMax, GLM, z-ai 경로 (`openrouter/`)
- `Databricks - Claude` (`databricks/`)
- `DashScope / Qwen` (`dashscope/`)
- MiniMax (`minimax/`)
- Z.ai / GLM (`zai/`)

프로바이더 관리형(자동, marker 필요 없음):
- OpenAI (`openai/`)
- DeepSeek (`deepseek/`)
- xAI (`xai/`)

## 동작 방식

LiteLLM은 LLM 프로바이더로 보내는 요청에 prompt caching checkpoints를 자동으로 주입할 수 있습니다. 이를 통해 다음을 할 수 있습니다.

- **비용 절감**: 프롬프트의 길고 정적인 부분을 캐시하여 반복 처리를 피할 수 있습니다.
- **애플리케이션 코드 수정 불필요**: LiteLLM UI 또는 `litellm config.yaml` 파일에서 자동 캐싱 동작을 설정할 수 있습니다.

## 설정

모델 설정에서 `cache_control_injection_points`를 지정해야 합니다. 이 설정은 LiteLLM에 다음을 알려줍니다.
1. 캐싱 directive를 추가할 위치(`location`)
2. 대상으로 삼을 메시지(`role`)

그런 다음 LiteLLM은 요청의 지정된 메시지에 `cache_control` directive를 자동으로 추가합니다.

```json showLineNumbers title="cache_control_directive.json"
"cache_control": {
    "type": "ephemeral"
}
```

## LiteLLM Python SDK 사용법

completion 호출에서 `cache_control_injection_points` 파라미터를 사용해 캐싱 directive를 자동으로 주입합니다.

#### 기본 예제 - System Messages 캐시 {#basic-example-cache-system-messages}

```python showLineNumbers title="cache_system_messages.py"
from litellm import completion
import os

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
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
    # Auto-inject cache control to system messages
    cache_control_injection_points=[
        {
            "location": "message",
            "role": "system",
        }
    ],
)

print(response.usage)
```

**핵심 사항:**
- 캐싱을 주입할 위치를 지정하려면 `cache_control_injection_points` 파라미터를 사용합니다.
- `location: "message"`는 대화의 메시지를 대상으로 합니다.
- `role: "system"`은 모든 system messages를 대상으로 합니다.
- LiteLLM은 일치하는 메시지의 **마지막 content block**에 `cache_control`을 자동으로 추가합니다(Anthropic API specification 기준).

**LiteLLM의 수정된 요청:**

LiteLLM은 system message의 마지막 content block에 `cache_control`을 추가하여 요청을 자동으로 변환합니다.

```json showLineNumbers title="modified_request_system.json"
{
    "messages": [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents."
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement...",
                    "cache_control": {"type": "ephemeral"}  // Added by LiteLLM
                }
            ]
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?"
        }
    ]
}
```

#### Index로 특정 Messages 지정 {#target-specific-messages-by-index}

messages 배열의 index로 특정 메시지를 지정할 수 있습니다. 끝에서부터 지정하려면 음수 index를 사용합니다.

```python showLineNumbers title="cache_by_index.py"
from litellm import completion
import os

os.environ["ANTHROPIC_API_KEY"] = ""

response = completion(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages=[
        {
            "role": "user",
            "content": "First message",
        },
        {
            "role": "assistant",
            "content": "Response to first",
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Here is a long document to analyze:"},
                {"type": "text", "text": "Document content..." * 500},
            ],
        },
    ],
    # Target the last message (index -1)
    cache_control_injection_points=[
        {
            "location": "message",
            "index": -1,  # -1 targets the last message, -2 would target second-to-last, etc.
        }
    ],
)

print(response.usage)
```

**중요 참고:**
- 메시지에 여러 content blocks가 있는 경우(예: 이미지 또는 여러 text blocks), `cache_control`은 **마지막 content block**에만 추가됩니다.
- 이는 [Anthropic's API specification](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching#continuing-a-multi-turn-conversation)의 요구사항을 따릅니다. 여러 content blocks를 사용할 때는 마지막 content block에만 `cache_control`을 둘 수 있습니다.
- Anthropic은 요청당 `cache_control`이 포함된 blocks를 최대 4개까지 허용합니다.

**LiteLLM의 수정된 요청:**

LiteLLM은 대상 메시지의 마지막 content block에 `cache_control`을 추가합니다(index -1 = 마지막 메시지).

```json showLineNumbers title="modified_request_index.json"
{
    "messages": [
        {
            "role": "user",
            "content": "First message"
        },
        {
            "role": "assistant",
            "content": "Response to first"
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Here is a long document to analyze:"
                },
                {
                    "type": "text",
                    "text": "Document content...",
                    "cache_control": {"type": "ephemeral"}  // Added by LiteLLM to last content block only
                }
            ]
        }
    ]
}
```

## LiteLLM Proxy 사용법

Proxy 설정 파일에서 cache control 주입을 설정할 수 있습니다.

<Tabs>
<TabItem value="litellm config.yaml" label="litellm config.yaml">

```yaml showLineNumbers title="litellm config.yaml"
model_list:
  - model_name: anthropic-auto-inject-cache-system-message
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20240620
      api_key: os.environ/ANTHROPIC_API_KEY
      cache_control_injection_points:
        - location: message
          role: system
```
</TabItem>

<TabItem value="UI" label="LiteLLM UI">

LiteLLM UI에서 모델을 추가할 때 `Advanced Settings` 탭에 `cache_control_injection_points`를 지정할 수 있습니다.
<Image img={require('../../img/ui_auto_prompt_caching.png')}/>

</TabItem>
</Tabs>


## 자세한 예제 {#detailed-example}

### 1. LiteLLM에 보내는 원본 요청 {#1-original-request-to-litellm}

이 예제에는 매우 길고 정적인 system message와 매번 달라지는 user message가 있습니다. system message는 거의 바뀌지 않으므로 캐시하는 것이 효율적입니다.

```json showLineNumbers title="original_request.json"
{
    "messages": [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are a helpful assistant. This is a set of very long instructions that you will follow. Here is a legal document that you will use to answer the user's question."
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is the main topic of this legal document?"
                }
            ]
        }
    ]
}
```

### 2. LiteLLM의 수정된 요청 {#2-litellms-modified-request}

LiteLLM은 설정에 따라 system message에 캐싱 directive를 자동 주입합니다.

```json showLineNumbers title="modified_request.json"
{
    "messages": [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are a helpful assistant. This is a set of very long instructions that you will follow. Here is a legal document that you will use to answer the user's question.",
                    "cache_control": {"type": "ephemeral"}
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is the main topic of this legal document?"
                }
            ]
        }
    ]
}
```

모델 프로바이더가 이 요청을 처리할 때 캐싱 directive를 인식하고 system message를 한 번만 처리한 뒤 이후 요청을 위해 캐시합니다.

## 관련 문서

- [수동 Prompt 캐싱](../completion/prompt_caching.md) - 메시지에 `cache_control` directives를 수동으로 추가하는 방법을 알아봅니다.
