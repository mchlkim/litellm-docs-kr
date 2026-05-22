import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Batching Completion()` {#batching-completion}
LiteLLM에서는 다음 작업을 수행할 수 있습니다.
* 여러 completion 호출을 하나의 모델로 전송
* 하나의 completion 호출을 여러 모델로 전송: 가장 빠른 응답 반환
* 하나의 completion 호출을 여러 모델로 전송: 모든 응답 반환

:::info

LiteLLM Proxy에서 batch completion을 수행하려면 여기를 참고하세요: https://docs.litellm.ai/docs/proxy/user_keys#beta-batch-completions---pass-model-as-list

:::

## 여러 completion 호출을 하나의 모델로 전송 {#send-multiple-completion-calls-to-1-model}

`batch_completion` 메서드에는 `messages` 목록을 전달합니다. 각 하위 메시지 목록은 `litellm.completion()`에 전달되며, 단일 API 호출에서 여러 프롬프트를 효율적으로 처리할 수 있습니다.

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_batch_completion.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

### 예제 코드 {#example-code}
```python
import litellm
import os
from litellm import batch_completion

os.environ['ANTHROPIC_API_KEY'] = ""


responses = batch_completion(
    model="claude-2",
    messages = [
        [
            {
                "role": "user",
                "content": "good morning? "
            }
        ],
        [
            {
                "role": "user",
                "content": "what's the time? "
            }
        ]
    ]
)
```

## 하나의 completion 호출을 여러 모델로 전송: 가장 빠른 응답 반환 {#send-1-completion-call-to-many-models-return-fastest-response}
지정된 `models`에 병렬 호출을 보내고 첫 번째 응답을 반환합니다.

지연 시간을 줄이는 데 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

### 예제 Code
```python
import litellm
import os
from litellm import batch_completion_models

os.environ['ANTHROPIC_API_KEY'] = ""
os.environ['OPENAI_API_KEY'] = ""
os.environ['COHERE_API_KEY'] = ""

response = batch_completion_models(
    models=["gpt-3.5-turbo", "claude-instant-1.2", "command-nightly"], 
    messages=[{"role": "user", "content": "Hey, how's it going"}]
)
print(result)
```



</TabItem>
<TabItem value="proxy" label="PROXY">

[프록시 config 설정 방법](#example-setup)

쉼표로 구분된 모델 이름 문자열과 `fastest_response=True` 플래그를 전달하기만 하면 됩니다.

<Tabs>
<TabItem value="curl" label="curl">

```bash

curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \ 
-D '{
    "model": "gpt-4o, groq-llama", # 👈 Comma-separated models
    "messages": [
      {
        "role": "user",
        "content": "What's the weather like in Boston today?"
      }
    ],
    "stream": true,
    "fastest_response": true # 👈 FLAG
}

'
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-4o, groq-llama", # 👈 Comma-separated models
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={"fastest_response": true} # 👈 FLAG
)

print(response)
```

</TabItem>
</Tabs>

---

### 예제 설정 {#example-setup}

```yaml 
model_list: 
- model_name: groq-llama
  litellm_params:
    model: groq/llama3-8b-8192
    api_key: os.environ/GROQ_API_KEY
- model_name: gpt-4o
  litellm_params:
    model: gpt-4o
    api_key: os.environ/OPENAI_API_KEY
```

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

### 출력 {#output}
OpenAI 형식의 첫 번째 응답을 반환합니다. 다른 LLM API 호출은 취소합니다.
```json
{
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": " I'm doing well, thanks for asking! I'm an AI assistant created by Anthropic to be helpful, harmless, and honest.",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "id": "chatcmpl-23273eed-e351-41be-a492-bafcf5cf3274",
  "created": 1695154628.2076092,
  "model": "command-nightly",
  "usage": {
    "prompt_tokens": 6,
    "completion_tokens": 14,
    "total_tokens": 20
  }
}
```


## 하나의 completion 호출을 여러 모델로 전송: 모든 응답 반환 {#send-1-completion-call-to-many-models-return-all-responses}
지정된 모델에 병렬 호출을 보내고 모든 응답을 반환합니다.

요청을 동시에 처리하고 여러 모델의 응답을 받아야 할 때 사용합니다.

### 예제 코드 {#example-code-1}
```python
import litellm
import os
from litellm import batch_completion_models_all_responses

os.environ['ANTHROPIC_API_KEY'] = ""
os.environ['OPENAI_API_KEY'] = ""
os.environ['COHERE_API_KEY'] = ""

responses = batch_completion_models_all_responses(
    models=["gpt-3.5-turbo", "claude-instant-1.2", "command-nightly"], 
    messages=[{"role": "user", "content": "Hey, how's it going"}]
)
print(responses)

```

### 출력 {#output-1}

```json
[<ModelResponse chat.completion id=chatcmpl-e673ec8e-4e8f-4c9e-bf26-bf9fa7ee52b9 at 0x103a62160> JSON: {
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop_sequence",
      "index": 0,
      "message": {
        "content": " It's going well, thank you for asking! How about you?",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "id": "chatcmpl-e673ec8e-4e8f-4c9e-bf26-bf9fa7ee52b9",
  "created": 1695222060.917964,
  "model": "claude-instant-1.2",
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 9,
    "total_tokens": 23
  }
}, <ModelResponse chat.completion id=chatcmpl-ab6c5bd3-b5d9-4711-9697-e28d9fb8a53c at 0x103a62b60> JSON: {
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": " It's going well, thank you for asking! How about you?",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "id": "chatcmpl-ab6c5bd3-b5d9-4711-9697-e28d9fb8a53c",
  "created": 1695222061.0445492,
  "model": "command-nightly",
  "usage": {
    "prompt_tokens": 6,
    "completion_tokens": 14,
    "total_tokens": 20
  }
}, <OpenAIObject chat.completion id=chatcmpl-80szFnKHzCxObW0RqCMw1hWW1Icrq at 0x102dd6430> JSON: {
  "id": "chatcmpl-80szFnKHzCxObW0RqCMw1hWW1Icrq",
  "object": "chat.completion",
  "created": 1695222061,
  "model": "gpt-3.5-turbo-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm an AI language model, so I don't have feelings, but I'm here to assist you with any questions or tasks you might have. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 39,
    "total_tokens": 52
  }
}]

```
