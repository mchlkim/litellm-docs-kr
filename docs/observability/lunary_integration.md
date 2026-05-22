import Image from '@theme/IdealImage';

# 🌙 Lunary - GenAI 관측성 

[Lunary](https://lunary.ai/)는 팀이 LLM 챗봇을 관리하고 개선할 수 있도록 [관측성](https://lunary.ai/docs/features/observe), [프롬프트 관리](https://lunary.ai/docs/features/prompts), [분석](https://lunary.ai/docs/features/observe#analytics)을 제공하는 오픈 소스 플랫폼입니다.

언제든지 [이메일](mailto:hello@lunary.ai)로 문의하거나 직접 [데모 일정을 예약](https://lunary.ai/schedule)할 수 있습니다.

<video controls width='900' >
  <source src='https://lunary.ai/videos/demo-annotated.mp4'/>
</video>


## LiteLLM Python SDK 사용법 {#with-litellm-python-sdk}
### 사전 요구 사항 {#pre-requisites}

```shell
uv add litellm lunary
```

### 빠른 시작

먼저 [Lunary 대시보드](https://app.lunary.ai/)에서 Lunary 공개 키를 가져옵니다.

단 2줄의 코드로 **모든 제공자 전반의** 응답을 Lunary에 즉시 기록할 수 있습니다.

```python
litellm.success_callback = ["lunary"]
litellm.failure_callback = ["lunary"]
```

전체 코드:
```python
from litellm import completion

os.environ["LUNARY_PUBLIC_KEY"] = "your-lunary-public-key" # from https://app.lunary.ai/)
os.environ["OPENAI_API_KEY"] = ""

litellm.success_callback = ["lunary"]
litellm.failure_callback = ["lunary"]

response = completion(
  model="gpt-4o",
  messages=[{"role": "user", "content": "Hi there 👋"}],
  user="ishaan_litellm"
)
```

### LangChain ChatLiteLLM 사용법 {#with-langchain-chatlitellm}
```python
import os
from langchain.chat_models import ChatLiteLLM
from langchain.schema import HumanMessage
import litellm

os.environ["LUNARY_PUBLIC_KEY"] = "" # from https://app.lunary.ai/settings
os.environ['OPENAI_API_KEY']="sk-..."

litellm.success_callback = ["lunary"] 
litellm.failure_callback = ["lunary"] 

chat = ChatLiteLLM(
  model="gpt-4o"
  messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat(messages)
```


### Prompt Templates 사용법 {#with-prompt-templates}

Lunary로 [프롬프트 템플릿](https://lunary.ai/docs/features/prompts)을 관리하고, LiteLLM을 통해 모든 LLM 제공자에서 사용할 수 있습니다.

```python
from litellm import completion
from lunary

template = lunary.render_template("template-slug", {
  "name": "John", # Inject variables
})

litellm.success_callback = ["lunary"]

result = completion(**template)
```

### custom chains 사용법 {#사용법-with-custom-chains}
LLM 호출을 custom chains 안에 래핑하면 추적으로 시각화할 수 있습니다.

```python
import litellm
from litellm import completion
import lunary

litellm.success_callback = ["lunary"]
litellm.failure_callback = ["lunary"]

@lunary.chain("My custom chain name")
def my_chain(chain_input):
  chain_run_id = lunary.run_manager.current_run_id
  response = completion(
    model="gpt-4o", 
    messages=[{"role": "user", "content": "Say 1"}],
    metadata={"parent_run_id": chain_run_id},
  )

  response = completion(
    model="gpt-4o", 
    messages=[{"role": "user", "content": "Say 2"}],
    metadata={"parent_run_id": chain_run_id},
  )
  chain_output = response.choices[0].message
  return chain_output

my_chain("Chain input")
```

<Image img={require('../../img/lunary-trace.png')} />

## LiteLLM Proxy Server 사용법 {#with-litellm-proxy-server}
### 1단계: 의존성을 설치하고 환경 변수를 설정합니다 {#step1-install-dependencies-and-set-your-environment-variables}
의존성을 설치합니다.
```shell
uv add litellm lunary
```

https://app.lunary.ai/settings 에서 Lunary 공개 키를 가져옵니다.
```shell
export LUNARY_PUBLIC_KEY="<your-public-key>"
```

### 2단계: `config.yaml`을 만들고 `lunary` 콜백을 설정합니다 {#step-2-create-a-configyaml-and-set-lunary-callbacks}

```yaml
model_list:
  - model_name: "*"
    litellm_params:
      model: "*"
litellm_settings:
  success_callback: ["lunary"]
  failure_callback: ["lunary"]
```

### 3단계: LiteLLM proxy를 시작합니다 {#step-3-start-the-litellm-proxy}
```shell
litellm --config config.yaml
```

### 4단계: 요청을 보냅니다 {#step-4-make-a-request}

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

LiteLLM proxy에 요청을 보내는 여러 방법에 대한 자세한 내용은 [이 페이지](https://docs.litellm.ai/docs/proxy/user_keys)에서 확인할 수 있습니다.


## 지원 및 창업자와 대화하기 {#support--talk-to-founders}

- [데모 일정 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
