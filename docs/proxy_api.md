# 🔑 LiteLLM 키 (Claude-2, Llama2-70b 등에 액세스) {#litellm-keys-access-claude-2-llama2-70b-etc}

새 LLM 지원을 추가하면서 테스트용 액세스가 필요할 때 사용하세요. LiteLLM의 모든 provider를 테스트할 수 있도록 무료 $10 community-key를 제공합니다.

## 사용법 (community-key) {#usage-community-key}

```python
import os
from litellm import completion

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["COHERE_API_KEY"] = "your-api-key"

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(model="gpt-3.5-turbo", messages=messages)

# cohere call
response = completion("command-nightly", messages)
```

**전용 키가 필요하신가요?**
krrish@berri.ai 로 이메일을 보내주세요.

## LiteLLM Key 지원 모델 {#supported-models-for-litellm-key}
현재 "sk-litellm-.." 키로 동작하는 모델은 다음과 같습니다.

LiteLLM으로 호출할 수 있는 model/provider의 전체 목록은 [provider 목록](./providers/) 또는 [models.litellm.ai](https://models.litellm.ai/)를 확인하세요.

* OpenAI 모델 - [OpenAI 문서](./providers/openai.md)
    * gpt-4
    * gpt-3.5-turbo
    * gpt-3.5-turbo-16k
* Llama2 모델 - [TogetherAI 문서](./providers/togetherai.md)
    * togethercomputer/llama-2-70b-chat
    * togethercomputer/llama-2-70b
    * togethercomputer/LLaMA-2-7B-32K
    * togethercomputer/Llama-2-7B-32K-Instruct
    * togethercomputer/llama-2-7b
    * togethercomputer/CodeLlama-34b
    * WizardLM/WizardCoder-Python-34B-V1.0
    * NousResearch/Nous-Hermes-Llama2-13b
* Falcon 모델 - [TogetherAI 문서](./providers/togetherai.md)
    * togethercomputer/falcon-40b-instruct
    * togethercomputer/falcon-7b-instruct
* Jurassic/AI21 모델 - [AI21 문서](./providers/ai21.md)
    * j2-ultra
    * j2-mid
    * j2-light
* NLP Cloud 모델 - [NLPCloud 문서](./providers/nlp_cloud.md)
    * dolpin
    * chatdolphin 
* Anthropic 모델 - [Anthropic 문서](./providers/anthropic.md)
    * claude-2
    * claude-instant-v1


## OpenInterpreter용 {#for-openinterpreter}
이 기능은 처음에 Open Interpreter 커뮤니티를 위해 만들어졌습니다. 그곳에서 이 기능을 사용하려는 경우 아래처럼 진행할 수 있습니다.  
**참고**: [이 PR이 병합될 때까지](https://github.com/KillianLucas/open-interpreter/pull/288) Github repo를 clone하고 수정해야 합니다.

```
git clone https://github.com/krrishdholakia/open-interpreter-litellm-fork
```
실행하려면 다음을 수행하세요.
```
uv build 

# call gpt-4 - always add 'litellm_proxy/' in front of the model name
uv run interpreter --model litellm_proxy/gpt-4

# call llama-70b - always add 'litellm_proxy/' in front of the model name
uv run interpreter --model litellm_proxy/togethercomputer/llama-2-70b-chat

# call claude-2 - always add 'litellm_proxy/' in front of the model name
uv run interpreter --model litellm_proxy/claude-2
```

이것으로 끝입니다.

이제 원하는 모델을 호출할 수 있습니다.


더 많은 모델 추가를 원하시나요? [알려주세요!](https://github.com/BerriAI/litellm/issues/new/choose)
