# AI/ML API  
https://aimlapi.com/

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | AI/ML API는 고품질 이미지 생성을 위한 flux-pro/v1.1을 포함한 최신 AI 모델에 대한 액세스를 제공합니다. |
| LiteLLM의 Provider Route | `aiml/` |
| Provider 문서 링크 | [AI/ML API ↗](https://docs.aimlapi.com/) |
| 지원 작업 | [`/chat/completions`], [`/images/generations`](#image-generation) |

LiteLLM은 AI/ML API Image Generation 호출을 지원합니다.

## API Base 및 Key {#api-base-key}
```python
# env variable
os.environ['AIML_API_KEY'] = "your-api-key"
os.environ['AIML_API_BASE'] = "https://api.aimlapi.com"  # [optional] 
```
AI/ML API를 시작하는 과정은 간단합니다. 다음 단계에 따라 통합을 설정하세요.

### 1. API Key 받기 {#1-get-your-api-key}
시작하려면 API key가 필요합니다. 여기에서 발급받을 수 있습니다.  
🔑 [API Key 받기](https://aimlapi.com/app/keys/?utm_source=aimlapi&utm_medium=github&utm_campaign=integration)  

### 2. 사용 가능한 모델 살펴보기 {#2-explore-available-models}
다른 모델을 찾고 있나요? 지원되는 모델의 전체 목록을 확인하세요.  
📚 [전체 모델 목록](https://docs.aimlapi.com/api-overview/model-database/text-models?utm_source=aimlapi&utm_medium=github&utm_campaign=integration)  

### 3. 문서 읽기 {#3-read-the-documentation}
자세한 설정 지침과 사용 가이드는 공식 문서를 확인하세요.  
📖 [AI/ML API 문서](https://docs.aimlapi.com/quickstart/setting-up?utm_source=aimlapi&utm_medium=github&utm_campaign=integration)  

### 4. 도움이 필요하신가요? {#4-need-help}
궁금한 점이 있으면 언제든지 문의하세요. 기꺼이 도와드리겠습니다! 🚀  [Discord](https://discord.gg/hvaUsJpVJf)

## 사용법
aimlapi.com/models에서 LLama, Qwen, Flux 및 200개 이상의 기타 오픈 소스와 폐쇄형 소스 모델 중에서 선택할 수 있습니다. 예:

```python
import litellm

response = litellm.completion(
    model="aiml/meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", # The model name must include prefix "openai" + the model name from ai/ml api
    api_key="", # your aiml api-key 
    api_base="https://api.aimlapi.com/v2",
    messages=[
        {
            "role": "user",
            "content": "Hey, how's it going?",
        }
    ],
)
```

## 스트리밍 {#streaming}

```python
import litellm

response = litellm.completion(
    model="aiml/Qwen/Qwen2-72B-Instruct",  # The model name must include prefix "openai" + the model name from ai/ml api
    api_key="",  # your aiml api-key 
    api_base="https://api.aimlapi.com/v2",
    messages=[
        {
            "role": "user",
            "content": "Hey, how's it going?",
        }
    ],
    stream=True,
)
for chunk in response:
    print(chunk)
```

## 비동기 Completion {#async-completion}

```python
import asyncio

import litellm


async def main():
    response = await litellm.acompletion(
        model="aiml/anthropic/claude-3-5-haiku",  # The model name must include prefix "openai" + the model name from ai/ml api
        api_key="",  # your aiml api-key
        api_base="https://api.aimlapi.com/v2",
        messages=[
            {
                "role": "user",
                "content": "Hey, how's it going?",
            }
        ],
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
```

## 비동기 스트리밍 {#async-streaming}

```python
import asyncio
import traceback

import litellm


async def main():
    try:
        print("test acompletion + streaming")
        response = await litellm.acompletion(
            model="aiml/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF", # The model name must include prefix "openai" + the model name from ai/ml api
            api_key="", # your aiml api-key
            api_base="https://api.aimlapi.com/v2",
            messages=[{"content": "Hey, how's it going?", "role": "user"}],
            stream=True,
        )
        print(f"response: {response}")
        async for chunk in response:
            print(chunk)
    except:
        print(f"error occurred: {traceback.format_exc()}")
        pass


if __name__ == "__main__":
    asyncio.run(main())
```

## 비동기 Embedding {#async-embedding}

```python
import asyncio

import litellm


async def main():
    response = await litellm.aembedding(
        model="aiml/text-embedding-3-small", # The model name must include prefix "openai" + the model name from ai/ml api
        api_key="",  # your aiml api-key
        api_base="https://api.aimlapi.com/v1", # 👈 the URL has changed from v2 to v1
        input="Your text string",
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
```

## 비동기 Image Generation {#async-image-generation}

```python
import asyncio

import litellm


async def main():
    response = await litellm.aimage_generation(
        model="aiml/dall-e-3",  # The model name must include prefix "openai" + the model name from ai/ml api
        api_key="",  # your aiml api-key
        api_base="https://api.aimlapi.com/v1", # 👈 the URL has changed from v2 to v1
        prompt="A cute baby sea otter",
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
```
