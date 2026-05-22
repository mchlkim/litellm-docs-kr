import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Langsmith - LLM 입력/출력 로깅



애플리케이션 lifecycle의 모든 단계를 위한 올인원 개발자 플랫폼입니다.
https://smith.langchain.com/

<Image img={require('../../img/langsmith_new.png')} />

:::info
callback을 더 좋게 만들 수 있는 방법을 듣고 싶습니다. LiteLLM [founders](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)를 만나거나
[discord](https://discord.gg/wuPM9dRgDw)에 참여해 주세요.
::: 

## 사전 요구 사항
```shell
uv add litellm
```

## 빠른 시작
단 2줄의 코드로 **모든 provider**의 응답을 Langsmith에 즉시 기록할 수 있습니다.

<Tabs>
<TabItem value="python" label="SDK">

```python
litellm.callbacks = ["langsmith"]
```

```python
import litellm
import os

os.environ["LANGSMITH_API_KEY"] = ""
os.environ["LANGSMITH_PROJECT"] = "" # defaults to litellm-completion
os.environ["LANGSMITH_DEFAULT_RUN_NAME"] = "" # defaults to LLMRun
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langsmith as a callback, litellm will send the data to langsmith
litellm.callbacks = ["langsmith"] 
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. `config.yaml`을 설정합니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["langsmith"]
```

2. LiteLLM Proxy를 시작합니다.
```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.
```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-eWkpOhYaHiuIZV-29JDeTQ' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how are you?"
    }
  ],
  "max_completion_tokens": 250
}'
```
</TabItem>
</Tabs>



## 고급

### 로컬 테스트 - batch size 제어

Langsmith가 한 번에 처리할 batch 크기를 설정합니다. 기본값은 512입니다.

로컬 테스트에서 로그가 빠르게 도착하는지 보려면 `langsmith_batch_size=1`로 설정하세요.

<Tabs>
<TabItem value="python" label="SDK">

```python
import litellm
import os

os.environ["LANGSMITH_API_KEY"] = ""
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langsmith as a callback, litellm will send the data to langsmith
litellm.callbacks = ["langsmith"] 
litellm.langsmith_batch_size = 1 # 👈 KEY CHANGE
 
response = litellm.completion(
    model="gpt-3.5-turbo",
     messages=[
        {"role": "user", "content": "Hi 👋 - i'm openai"}
    ]
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. `config.yaml`을 설정합니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  langsmith_batch_size: 1
  callbacks: ["langsmith"]
```

2. LiteLLM Proxy를 시작합니다.
```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.
```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-eWkpOhYaHiuIZV-29JDeTQ' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how are you?"
    }
  ],
  "max_completion_tokens": 250
}'
```



</TabItem>
</Tabs>




### Langsmith 필드 설정

```python
import litellm
import os

os.environ["LANGSMITH_API_KEY"] = ""
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langsmith as a callback, litellm will send the data to langsmith
litellm.success_callback = ["langsmith"] 
 
response = litellm.completion(
    model="gpt-3.5-turbo",
     messages=[
        {"role": "user", "content": "Hi 👋 - i'm openai"}
    ],
    metadata={
        "run_name": "litellmRUN",                                   # langsmith run name
        "project_name": "litellm-completion",                       # langsmith project name
        "run_id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",           # langsmith run id
        "parent_run_id": "f8faf8c1-9778-49a4-9004-628cdb0047e5",    # langsmith run parent run id
        "trace_id": "df570c03-5a03-4cea-8df0-c162d05127ac",         # langsmith run trace id
        "session_id": "1ffd059c-17ea-40a8-8aef-70fd0307db82",       # langsmith run session id
        "tags": ["model1", "prod-2"],                               # langsmith run tags
        "metadata": {                                               # langsmith run metadata
            "key1": "value1"
        },
        "dotted_order": "20240429T004912090000Z497f6eca-6276-4993-bfeb-53cbbbba6f08"
    }
)
print(response)
```

### LiteLLM Proxy에서 custom `LANGSMITH_BASE_URL` 사용

custom LangSmith instance를 사용 중이라면 `LANGSMITH_BASE_URL` 환경 변수를 해당 instance로 지정할 수 있습니다.
예를 들어 다음 설정으로 LiteLLM Proxy가 로컬 LangSmith instance에 로그를 남기도록 만들 수 있습니다.

```yaml
litellm_settings:
  success_callback: ["langsmith"]

environment_variables:
  LANGSMITH_BASE_URL: "http://localhost:1984"
  LANGSMITH_PROJECT: "litellm-proxy"
```

## 지원 및 founders와 대화

- [Schedule Demo 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
