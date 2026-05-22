import Image from '@theme/IdealImage';

# Literal AI - 로깅, 평가, 모니터링 {#literal-ai---log-evaluate-monitor}

[Literal AI](https://literalai.com)는 프로덕션급 LLM 앱을 구축하기 위한 협업형 관측성, 평가, 분석 플랫폼입니다.

<Image img={require('../../img/literalai.png')} />

## 사전 요구 사항 {#pre-requisites}

`literalai` 패키지가 설치되어 있는지 확인하세요.

```shell
uv add literalai litellm
```

## 빠른 시작

```python
import litellm
import os

os.environ["LITERAL_API_KEY"] = ""
os.environ['OPENAI_API_KEY']= ""
os.environ['LITERAL_BATCH_SIZE'] = "1" # You won't see logs appear until the batch is full and sent

litellm.success_callback = ["literalai"] # Log Input/Output to LiteralAI
litellm.failure_callback = ["literalai"] # Log Errors to LiteralAI

# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

## 다단계 트레이스 {#multi-step-traces}

이 통합은 Literal AI SDK 데코레이터와 호환되므로 대화 및 에이전트 트레이싱을 사용할 수 있습니다.

```py
import litellm
from literalai import LiteralClient
import os

os.environ["LITERAL_API_KEY"] = ""
os.environ['OPENAI_API_KEY']= ""
os.environ['LITERAL_BATCH_SIZE'] = "1" # You won't see logs appear until the batch is full and sent

litellm.input_callback = ["literalai"] # Support other Literal AI decorators and prompt templates
litellm.success_callback = ["literalai"] # Log Input/Output to LiteralAI
litellm.failure_callback = ["literalai"] # Log Errors to LiteralAI

literalai_client = LiteralClient()

@literalai_client.run
def my_agent(question: str):
    # agent logic here
    response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": question}
        ],
        metadata={"literalai_parent_id": literalai_client.get_current_step().id}
    )
    return response

my_agent("Hello world")

# Waiting to send all logs before exiting, not needed in a production server
literalai_client.flush()
```

[Literal AI 로깅 기능](https://docs.literalai.com/guides/logs)에 대해 자세히 알아보세요.

## 생성을 프롬프트 템플릿에 바인딩 {#bind-a-generation-to-its-prompt-template}

이 통합은 Literal AI에서 관리되는 프롬프트와 별도 설정 없이 바로 작동합니다. 즉, 특정 LLM 생성이 해당 템플릿에 바인딩됩니다.

Literal AI의 [프롬프트 관리](https://docs.literalai.com/guides/prompt-management#pull-a-prompt-template-from-literal-ai)에 대해 자세히 알아보세요.

## OpenAI Proxy 사용법

Lite LLM 프록시를 사용하는 경우 Literal AI OpenAI 계측을 사용해 호출을 로깅할 수 있습니다.

```py
from literalai import LiteralClient
from openai import OpenAI

client = OpenAI(
    api_key="anything",            # litellm proxy virtual key
    base_url="http://0.0.0.0:4000" # litellm proxy base_url
)

literalai_client = LiteralClient(api_key="")

# Instrument the OpenAI client
literalai_client.instrument_openai()

settings = {
    "model": "gpt-3.5-turbo", # model you want to send litellm proxy
    "temperature": 0,
    # ... more settings
}

response = client.chat.completions.create(
        messages=[
            {
                "content": "You are a helpful bot, you always reply in Spanish",
                "role": "system"
            },
            {
                "content": message.content,
                "role": "user"
            }
        ],
        **settings
    )

```
