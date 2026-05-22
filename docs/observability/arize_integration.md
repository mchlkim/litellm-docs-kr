
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Arize AI

AI 관측성 및 평가 플랫폼

<Image img={require('../../img/arize.png')} />



## 사전 요구 사항 {#pre-requisites}
[Arize AI](https://app.arize.com/auth/login)에서 계정을 만드세요.

## 빠른 시작
코드 2줄만으로 **모든 제공업체의** 응답을 arize에 즉시 로깅할 수 있습니다.

callback 대신 instrumentor 옵션도 사용할 수 있으며, 자세한 내용은 [여기](https://docs.arize.com/arize/llm-tracing/tracing-integrations-auto/litellm)에서 확인할 수 있습니다.

```python
litellm.callbacks = ["arize"]
```

```python

import litellm
import os

os.environ["ARIZE_SPACE_KEY"] = ""
os.environ["ARIZE_API_KEY"] = ""

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set arize as a callback, litellm will send the data to arize
litellm.callbacks = ["arize"]
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

## LiteLLM Proxy와 함께 사용하기 {#using-with-litellm-proxy}

1. config.yaml 설정
```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["arize"]

general_settings:
  master_key: "sk-1234" # can also be set as an environment variable

environment_variables:
    ARIZE_SPACE_ID: "d0*****"
    ARIZE_API_KEY: "141a****"
    ARIZE_ENDPOINT: "https://otlp.arize.com/v1" # OPTIONAL - your custom arize GRPC api endpoint
    ARIZE_HTTP_ENDPOINT: "https://otlp.arize.com/v1" # OPTIONAL - your custom arize HTTP api endpoint. Set either this or ARIZE_ENDPOINT or Neither (defaults to https://otlp.arize.com/v1 on grpc)
    ARIZE_PROJECT_NAME: "my-litellm-project" # OPTIONAL - sets the arize project name
```

2. 프록시 시작

```bash
litellm --config config.yaml
```

3. 테스트하기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{ "model": "gpt-4", "messages": [{"role": "user", "content": "Hi 👋 - i'm openai"}]}'
```

## 요청별로 Arize Space/Key 전달하기 {#pass-arize-spacekey-per-request}

지원되는 파라미터:
- `arize_api_key`
- `arize_space_key` *(사용 중단됨, 대신 `arize_space_id` 사용)*
- `arize_space_id`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
import os

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set arize as a callback, litellm will send the data to arize
litellm.callbacks = ["arize"]
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  arize_api_key=os.getenv("ARIZE_API_KEY"),
  arize_space_id=os.getenv("ARIZE_SPACE_ID"),
)
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. config.yaml 설정
```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["arize"]

general_settings:
  master_key: "sk-1234" # can also be set as an environment variable
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트하기

<Tabs>
<TabItem value="curl" label="CURL">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "Hi 👋 - i'm openai"}],
  "arize_api_key": "ARIZE_API_KEY",
  "arize_space_id": "ARIZE_SPACE_ID"
}'
```
</TabItem>
<TabItem value="openai_python" label="OpenAI Python">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
      "arize_api_key": "ARIZE_API_KEY",
      "arize_space_id": "ARIZE_SPACE_ID"
    }
)

print(response)
```
</TabItem>
</Tabs>
</TabItem>
</Tabs>

## 지원 및 창립자에게 문의하기 {#support--talk-to-founders}

- [데모 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
