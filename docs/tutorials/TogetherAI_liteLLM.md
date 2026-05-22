# Llama2 Together AI 튜토리얼 {#llama2-together-ai-tutorial}
https://together.ai/



```python
!uv add litellm
```


```python
import os
from litellm import completion
os.environ["TOGETHERAI_API_KEY"] = "" #@param
user_message = "Hello, whats the weather in San Francisco??"
messages = [{ "content": user_message,"role": "user"}]
```

## TogetherAI에서 Llama2 호출하기 {#calling-llama2-on-togetherai}
https://api.together.xyz/playground/chat?model=togethercomputer%2Fllama-2-70b-chat

```python
model_name = "together_ai/togethercomputer/llama-2-70b-chat"
response = completion(model=model_name, messages=messages)
print(response)
```


```

    {'choices': [{'finish_reason': 'stop', 'index': 0, 'message': {'role': 'assistant', 'content': "\n\nI'm not able to provide real-time weather information. However, I can suggest"}}], 'created': 1691629657.9288375, 'model': 'togethercomputer/llama-2-70b-chat', 'usage': {'prompt_tokens': 9, 'completion_tokens': 17, 'total_tokens': 26}}
```


LiteLLM은 Together AI의 Llama2 모델에 대한 프롬프트 형식 지정도 처리하며, 메시지를 필요한 
`[INST] <your instruction> [/INST]` 형식으로 변환합니다. 

[구현 코드](https://github.com/BerriAI/litellm/blob/64f3d3c56ef02ac5544983efc78293de31c1c201/litellm/llms/prompt_templates/factory.py#L17)

## 스트리밍 사용하기 {#with-streaming}


```python
response = completion(model=model_name, messages=messages, together_ai=True, stream=True)
print(response)
for chunk in response:
  print(chunk['choices'][0]['delta']) # same as openai format
```


## 사용자 지정 프롬프트 템플릿으로 Llama2 변형 사용하기 {#use-llama2-variants-with-custom-prompt-templates}

사용자 지정 프롬프트 형식 지정이 필요한 TogetherAI의 Llama2 버전을 사용하고 있나요? 

사용자 지정 프롬프트 템플릿을 만들 수 있습니다. 

`OpenAssistant/llama2-70b-oasst-sft-v10`용 템플릿을 하나 만들어 보겠습니다.

허용되는 템플릿 형식은 다음과 같습니다. [참조](https://huggingface.co/OpenAssistant/llama2-70b-oasst-sft-v10)
```
"""
<|im_start|>system
{system_message}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
"""
```

사용자 지정 프롬프트 템플릿을 등록해 보겠습니다. [구현 코드](https://github.com/BerriAI/litellm/blob/64f3d3c56ef02ac5544983efc78293de31c1c201/litellm/llms/prompt_templates/factory.py#L77)
```python
import litellm 

litellm.register_prompt_template(
    model="OpenAssistant/llama2-70b-oasst-sft-v10",
    roles={"system":"<|im_start|>system", "assistant":"<|im_start|>assistant", "user":"<|im_start|>user"}, # tell LiteLLM how you want to map the openai messages to this model
    pre_message_sep= "\n",
    post_message_sep= "\n"
)
```

이제 사용해 보겠습니다.

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
    roles={"system":"<|im_start|>system", "assistant":"<|im_start|>assistant", "user":"<|im_start|>user"}, # tell LiteLLM how you want to map the openai messages to this model
    pre_message_sep= "\n",
    post_message_sep= "\n"
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
