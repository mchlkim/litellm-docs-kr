# 프롬프트 포맷팅 {#prompt-formatting}

LiteLLM은 OpenAI ChatCompletions 프롬프트 형식을 다른 모델용 형식으로 자동 변환합니다. 모델에 사용자 지정 프롬프트 템플릿을 설정해 이 동작을 제어할 수도 있습니다.

## Huggingface 모델 {#huggingface-models}

LiteLLM은 [Huggingface Chat Templates](https://huggingface.co/docs/transformers/main/chat_templating)를 지원하며, 사용 중인 huggingface 모델에 등록된 채팅 템플릿이 있는지 자동으로 확인합니다. 예: [Mistral-7b](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1/blob/main/tokenizer_config.json#L32)

인기 모델(예: meta-llama/llama2)의 경우 해당 템플릿이 패키지에 포함되어 있습니다.

**저장된 템플릿**

| 모델 이름 | 적용되는 모델 | Completion 호출
| -------- | -------- | -------- |
| `mistralai/Mistral-7B-Instruct-v0.1` | `mistralai/Mistral-7B-Instruct-v0.1` | `completion(model='huggingface/mistralai/Mistral-7B-Instruct-v0.1', messages=messages, api_base="your_api_endpoint")` |
| meta-llama/Llama-2-7b-chat | 모든 meta-llama llama2 chat 모델 | `completion(model='huggingface/meta-llama/Llama-2-7b', messages=messages, api_base="your_api_endpoint")` |
| tiiuae/falcon-7b-instruct | 모든 falcon instruct 모델 | `completion(model='huggingface/tiiuae/falcon-7b-instruct', messages=messages, api_base="your_api_endpoint")` |
| mosaicml/mpt-7b-chat | 모든 mpt chat 모델 | `completion(model='huggingface/mosaicml/mpt-7b-chat', messages=messages, api_base="your_api_endpoint")` |
| codellama/CodeLlama-34b-Instruct-hf | 모든 codellama instruct 모델 | `completion(model='huggingface/codellama/CodeLlama-34b-Instruct-hf', messages=messages, api_base="your_api_endpoint")` |
| WizardLM/WizardCoder-Python-34B-V1.0 | 모든 wizardcoder 모델 | `completion(model='huggingface/WizardLM/WizardCoder-Python-34B-V1.0', messages=messages, api_base="your_api_endpoint")` |
| Phind/Phind-CodeLlama-34B-v2 | 모든 phind-codellama 모델 | `completion(model='huggingface/Phind/Phind-CodeLlama-34B-v2', messages=messages, api_base="your_api_endpoint")` |

[**코드로 이동**](https://github.com/BerriAI/litellm/blob/main/litellm/llms/prompt_templates/factory.py)

## 직접 프롬프트 포맷 지정하기 {#format-prompt-yourself}

프롬프트 형식을 직접 지정할 수도 있습니다. 방법은 다음과 같습니다.

```python 
import litellm
# Create your own custom prompt template 
litellm.register_prompt_template(
	    model="togethercomputer/LLaMA-2-7B-32K",
        initial_prompt_value="You are a good assistant" # [OPTIONAL]
	    roles={
            "system": {
                "pre_message": "[INST] <<SYS>>\n", # [OPTIONAL]
                "post_message": "\n<</SYS>>\n [/INST]\n" # [OPTIONAL]
            },
            "user": { 
                "pre_message": "[INST] ", # [OPTIONAL]
                "post_message": " [/INST]" # [OPTIONAL]
            }, 
            "assistant": {
                "pre_message": "\n" # [OPTIONAL]
                "post_message": "\n" # [OPTIONAL]
            }
        }
        final_prompt_value="Now answer as best you can:" # [OPTIONAL]
)

def test_huggingface_custom_model():
    model = "huggingface/togethercomputer/LLaMA-2-7B-32K"
    response = completion(model=model, messages=messages, api_base="https://my-huggingface-endpoint")
    print(response['choices'][0]['message']['content'])
    return response

test_huggingface_custom_model()
```

현재 Huggingface, TogetherAI, Ollama, Petals에서 지원됩니다.

다른 제공자는 고정된 프롬프트 템플릿을 사용하거나(예: Anthropic), 자체적으로 형식을 지정합니다(예: Replicate). 아직 지원 범위에 없는 제공자가 있다면 알려주세요.

## 모든 제공자 {#all-providers}

아래는 모든 제공자의 프롬프트를 포맷하는 코드 위치입니다. 더 개선할 수 있는 부분이 있으면 알려주세요.


| 제공자 | 모델 이름 | 코드 |
| -------- | -------- | -------- |
| Anthropic | `claude-instant-1`, `claude-instant-1.2`, `claude-2` | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/anthropic.py#L84)
| OpenAI Text Completion | `text-davinci-003`, `text-curie-001`, `text-babbage-001`, `text-ada-001`, `babbage-002`, `davinci-002`, | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/main.py#L442)
| Replicate | `replicate/`로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/replicate.py#L180)
| Cohere | `command-nightly`, `command`, `command-light`, `command-medium-beta`, `command-xlarge-beta`, `command-r-plus` | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/cohere.py#L115)
| Huggingface | `huggingface/`로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/huggingface_restapi.py#L186)
| OpenRouter | `openrouter/`로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/main.py#L611)
| AI21 | `j2-mid`, `j2-light`, `j2-ultra` | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/ai21.py#L107)
| VertexAI | `text-bison`, `text-bison@001`, `chat-bison`, `chat-bison@001`, `chat-bison-32k`, `code-bison`, `code-bison@001`, `code-gecko@001`, `code-gecko@latest`, `codechat-bison`, `codechat-bison@001`, `codechat-bison-32k` | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/vertex_ai.py#L89)
| Bedrock | `bedrock/`로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/bedrock.py#L183)
| Sagemaker | `sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b` | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/sagemaker.py#L89)
| TogetherAI | `together_ai/`로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/together_ai.py#L101)
| AlephAlpha | `aleph_alpha/`로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/aleph_alpha.py#L184)
| Palm | `palm/`으로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/palm.py#L95)
| NLP Cloud | `palm/`으로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/nlp_cloud.py#L120)
| Petals | `petals/`로 시작하는 모든 모델 이름 | [Code](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/petals.py#L87)
