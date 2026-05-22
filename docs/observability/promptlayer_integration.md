import Image from '@theme/IdealImage';

# Promptlayer 튜토리얼 {#promptlayer-tutorial}


:::tip

이 문서는 커뮤니티에서 관리합니다. 버그가 발생하면 이슈를 생성해 주세요.
https://github.com/BerriAI/litellm

:::


Promptlayer는 프롬프트 엔지니어를 위한 플랫폼입니다. OpenAI 요청을 기록하고, 사용 기록을 검색하고, 성능을 추적하고, 프롬프트 템플릿을 시각적으로 관리할 수 있습니다.

<Image img={require('../../img/promptlayer.png')} />

## Promptlayer를 사용해 모든 LLM Provider(OpenAI, Azure, Anthropic, Cohere, Replicate, PaLM)의 요청 로깅하기 {#use-promptlayer-to-log-requests-across-all-llm-providers-openai-azure-anthropic-cohere-replicate-palm}

liteLLM은 `callbacks`를 제공하므로 응답 상태에 따라 데이터를 쉽게 로깅할 수 있습니다.

### Callbacks 사용하기 {#using-callbacks}

https://promptlayer.com/ 에서 PromptLayer API Key를 가져오세요.

코드 2줄만 사용하면 promptlayer로 **모든 provider의** 응답을 즉시 로깅할 수 있습니다.

```python
litellm.success_callback = ["promptlayer"]

```

전체 코드

```python
from litellm import completion

## set env variables
os.environ["PROMPTLAYER_API_KEY"] = "your-promptlayer-key"

os.environ["OPENAI_API_KEY"], os.environ["COHERE_API_KEY"] = "", ""

# set callbacks
litellm.success_callback = ["promptlayer"]

#openai call
response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hi 👋 - i'm openai"}])

#cohere call
response = completion(model="command-nightly", messages=[{"role": "user", "content": "Hi 👋 - i'm cohere"}])
```

### 메타데이터 로깅 {#logging-metadata}

completion 호출 메타데이터도 Promptlayer에 로깅할 수 있습니다.

`metadata` 매개변수를 통해 completion 호출에 메타데이터를 추가할 수 있습니다.
```python 
completion(model,messages, metadata={"model": "ai21"})
```

**전체 코드**
```python
from litellm import completion

## set env variables
os.environ["PROMPTLAYER_API_KEY"] = "your-promptlayer-key"

os.environ["OPENAI_API_KEY"], os.environ["COHERE_API_KEY"] = "", ""

# set callbacks
litellm.success_callback = ["promptlayer"]

#openai call - log llm provider is openai
response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hi 👋 - i'm openai"}], metadata={"provider": "openai"})

#cohere call - log llm provider is cohere
response = completion(model="command-nightly", messages=[{"role": "user", "content": "Hi 👋 - i'm cohere"}], metadata={"provider": "cohere"})
```

이 제안은 [Vim-GPT](https://github.com/nsbradford/VimGPT)의 [Nick Bradford](https://github.com/nsbradford) 님이 제공해 주셨습니다.

## 지원 및 창립자와 상담하기 {#support--talk-to-founders}

- [데모 일정 잡기 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
