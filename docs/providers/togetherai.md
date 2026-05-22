import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Together AI 
LiteLLM은 Together AI의 모든 모델을 지원합니다.

## API 키

```python 
import os 
os.environ["TOGETHERAI_API_KEY"] = "your-api-key"
```
## 샘플 사용법 {#sample-usage}

```python
from litellm import completion 

os.environ["TOGETHERAI_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

completion(model="together_ai/togethercomputer/Llama-2-7B-32K-Instruct", messages=messages)
```

## Together AI 모델
LiteLLM은 https://api.together.xyz/ 의 모든 모델에 대해 `non-streaming` 및 `streaming` 요청을 지원합니다.

TogetherAI 사용 예시 - 참고: LiteLLM은 TogetherAI에 배포된 모든 모델을 지원합니다.


### Llama LLM - 채팅 {#llama-llms---chat}
| 모델명                        | 함수 호출                                                           | 필수 OS 환경 변수              |
|-----------------------------------|-------------------------------------------------------------------------|------------------------------------|
| `togethercomputer/llama-2-70b-chat` | `completion('together_ai/togethercomputer/llama-2-70b-chat', messages)` | `os.environ['TOGETHERAI_API_KEY']` |

### Llama LLM - 언어 / Instruct {#llama-llms---language--instruct}
| 모델명                               | 함수 호출                                                                  | 필수 OS 환경 변수              |
|------------------------------------------|--------------------------------------------------------------------------------|------------------------------------|
| `togethercomputer/llama-2-70b`             | `completion('together_ai/togethercomputer/llama-2-70b', messages)`             | `os.environ['TOGETHERAI_API_KEY']` |
| `togethercomputer/LLaMA-2-7B-32K`          | `completion('together_ai/togethercomputer/LLaMA-2-7B-32K', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| `togethercomputer/Llama-2-7B-32K-Instruct` | `completion('together_ai/togethercomputer/Llama-2-7B-32K-Instruct', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| `togethercomputer/llama-2-7b`              | `completion('together_ai/togethercomputer/llama-2-7b', messages)`              | `os.environ['TOGETHERAI_API_KEY']` |

### Falcon LLM {#falcon-llms}
| 모델명                           | 함수 호출                                                              | 필수 OS 환경 변수              |
|--------------------------------------|----------------------------------------------------------------------------|------------------------------------|
| `togethercomputer/falcon-40b-instruct` | `completion('together_ai/togethercomputer/falcon-40b-instruct', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| `togethercomputer/falcon-7b-instruct`  | `completion('together_ai/togethercomputer/falcon-7b-instruct', messages)`  | `os.environ['TOGETHERAI_API_KEY']` |

### Alpaca LLM {#alpaca-llms}
| 모델명                 | 함수 호출                                                    | 필수 OS 환경 변수              |
|----------------------------|------------------------------------------------------------------|------------------------------------|
| `togethercomputer/alpaca-7b` | `completion('together_ai/togethercomputer/alpaca-7b', messages)` | `os.environ['TOGETHERAI_API_KEY']` |

### 기타 채팅 LLM {#other-chat-llm}
| 모델명                   | 함수 호출                                                      | 필수 OS 환경 변수              |
|------------------------------|--------------------------------------------------------------------|------------------------------------|
| `HuggingFaceH4/starchat-alpha` | `completion('together_ai/HuggingFaceH4/starchat-alpha', messages)` | `os.environ['TOGETHERAI_API_KEY']` |

### Code LLM {#code-llms}
| 모델명                              | 함수 호출                                                                 | 필수 OS 환경 변수              |
|-----------------------------------------|-------------------------------------------------------------------------------|------------------------------------|
| `togethercomputer/CodeLlama-34b`          | `completion('together_ai/togethercomputer/CodeLlama-34b', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| `togethercomputer/CodeLlama-34b-Instruct` | `completion('together_ai/togethercomputer/CodeLlama-34b-Instruct', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| `togethercomputer/CodeLlama-34b-Python`   | `completion('together_ai/togethercomputer/CodeLlama-34b-Python', messages)`   | `os.environ['TOGETHERAI_API_KEY']` |
| `defog/sqlcoder`                          | `completion('together_ai/defog/sqlcoder', messages)`                          | `os.environ['TOGETHERAI_API_KEY']` |
| `NumbersStation/nsql-llama-2-7B`          | `completion('together_ai/NumbersStation/nsql-llama-2-7B', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| `WizardLM/WizardCoder-15B-V1.0`           | `completion('together_ai/WizardLM/WizardCoder-15B-V1.0', messages)`           | `os.environ['TOGETHERAI_API_KEY']` |
| `WizardLM/WizardCoder-Python-34B-V1.0`    | `completion('together_ai/WizardLM/WizardCoder-Python-34B-V1.0', messages)`    | `os.environ['TOGETHERAI_API_KEY']` |

### 언어 LLM {#language-llms}
| 모델명                          | 함수 호출                                                             | 필수 OS 환경 변수              |
|-------------------------------------|---------------------------------------------------------------------------|------------------------------------|
| `NousResearch/Nous-Hermes-Llama2-13b` | `completion('together_ai/NousResearch/Nous-Hermes-Llama2-13b', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| `Austism/chronos-hermes-13b`          | `completion('together_ai/Austism/chronos-hermes-13b', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| `upstage/SOLAR-0-70b-16bit`           | `completion('together_ai/upstage/SOLAR-0-70b-16bit', messages)`           | `os.environ['TOGETHERAI_API_KEY']` |
| `WizardLM/WizardLM-70B-V1.0`          | `completion('together_ai/WizardLM/WizardLM-70B-V1.0', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |


## 프롬프트 템플릿 {#prompt-templates}

자체 프롬프트 형식을 가진 Together AI 채팅 모델을 사용하나요?

### Llama2 Instruct 모델 사용
Together AI의 Llama2 변형(`model=togethercomputer/llama-2..-instruct`)을 사용하는 경우 LiteLLM은 OpenAI 프롬프트 형식과 TogetherAI Llama2 형식(`[INST]..[/INST]`) 사이를 자동 변환할 수 있습니다.

```python
from litellm import completion 

# set env variable 
os.environ["TOGETHERAI_API_KEY"] = ""

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

completion(model="together_ai/togethercomputer/Llama-2-7B-32K-Instruct", messages=messages)
```

### 다른 모델 사용

LiteLLM에서 사용자 지정 프롬프트 템플릿을 만들 수 있습니다. 메인 저장소에 추가하는 [PR도 환영합니다](https://github.com/BerriAI/litellm).

`OpenAssistant/llama2-70b-oasst-sft-v10`용 템플릿을 만들어 보겠습니다.

허용되는 템플릿 형식은 다음과 같습니다. [참고 자료](https://huggingface.co/OpenAssistant/llama2-70b-oasst-sft-v10-)
```
"""
<|im_start|>system
{system_message}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
"""
```

사용자 지정 프롬프트 템플릿을 등록합니다. [구현 코드](https://github.com/BerriAI/litellm/blob/64f3d3c56ef02ac5544983efc78293de31c1c201/litellm/llms/prompt_templates/factory.py#L77)
```python
import litellm 

litellm.register_prompt_template(
	    model="OpenAssistant/llama2-70b-oasst-sft-v10",
	    roles={
            "system": {
                "pre_message": "[<|im_start|>system",
                "post_message": "\n"
            },
            "user": {
                "pre_message": "<|im_start|>user",
                "post_message": "\n"
            }, 
            "assistant": {
                "pre_message": "<|im_start|>assistant",
                "post_message": "\n"
            }
        }
    )
```

이제 사용해 봅니다.

```python
from litellm import completion 

# set env variable 
os.environ["TOGETHERAI_API_KEY"] = ""

messages=[{"role":"user", "content": "Write me a poem about the blue sky"}]

completion(model="together_ai/OpenAssistant/llama2-70b-oasst-sft-v10", messages=messages)
```

**전체 코드**

```python
import litellm 
from litellm import completion

# set env variable 
os.environ["TOGETHERAI_API_KEY"] = ""

litellm.register_prompt_template(
	    model="OpenAssistant/llama2-70b-oasst-sft-v10",
	    roles={
            "system": {
                "pre_message": "[<|im_start|>system",
                "post_message": "\n"
            },
            "user": {
                "pre_message": "<|im_start|>user",
                "post_message": "\n"
            }, 
            "assistant": {
                "pre_message": "<|im_start|>assistant",
                "post_message": "\n"
            }
        }
    )

messages=[{"role":"user", "content": "Write me a poem about the blue sky"}]

response = completion(model="together_ai/OpenAssistant/llama2-70b-oasst-sft-v10", messages=messages)

print(response)
```

**출력**
```json
{
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": ".\n\nThe sky is a canvas of blue,\nWith clouds that drift and move,",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "created": 1693941410.482018,
  "model": "OpenAssistant/llama2-70b-oasst-sft-v10",
  "usage": {
    "prompt_tokens": 7,
    "completion_tokens": 16,
    "total_tokens": 23
  },
  "litellm_call_id": "f21315db-afd6-4c1e-b43a-0b5682de4b06"
}
```


## Rerank {#rerank}

### 사용법



<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 사용법">

```python
from litellm import rerank
import os

os.environ["TOGETHERAI_API_KEY"] = "sk-.."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="together_ai/rerank-english-v3.0",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy 사용법">

LiteLLM은 Rerank 호출을 위해 Cohere API와 호환되는 `/rerank` 엔드포인트를 제공합니다.

**설정**

LiteLLM Proxy `config.yaml`에 다음을 추가합니다.

```yaml
model_list:
  - model_name: Salesforce/Llama-Rank-V1
    litellm_params:
      model: together_ai/Salesforce/Llama-Rank-V1
      api_key: os.environ/TOGETHERAI_API_KEY
```

LiteLLM 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

테스트 요청

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Salesforce/Llama-Rank-V1",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
  }'
```

</TabItem>
</Tabs>
