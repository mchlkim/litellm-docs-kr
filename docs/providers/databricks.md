import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Databricks

LiteLLM은 Databricks의 모든 모델을 지원합니다.

:::tip

**모든 Databricks 모델을 지원합니다. litellm 요청을 보낼 때 `model=databricks/<any-model-on-databricks>`를 접두사로 설정하기만 하면 됩니다.**

:::

## 인증

LiteLLM은 Databricks에 대해 여러 인증 방식을 지원하며, 권장 순서는 다음과 같습니다.

### OAuth M2M (프로덕션 권장)

Service Principal 자격 증명을 사용하는 OAuth M2M 인증은 Databricks Partner 요구 사항에 따라 프로덕션 배포에 **권장되는 방식**입니다.

```python
import os
from litellm import completion

# Set OAuth credentials (Service Principal)
os.environ["DATABRICKS_CLIENT_ID"] = "your-service-principal-application-id"
os.environ["DATABRICKS_CLIENT_SECRET"] = "your-service-principal-secret"
os.environ["DATABRICKS_API_BASE"] = "https://adb-xxx.azuredatabricks.net/serving-endpoints"

response = completion(
    model="databricks/databricks-dbrx-instruct",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

### 개인 액세스 토큰 (PAT)

PAT 인증은 개발 및 테스트 시나리오에서 지원됩니다.

```python
import os
from litellm import completion

os.environ["DATABRICKS_API_KEY"] = "dapi..."  # Your Personal Access Token
os.environ["DATABRICKS_API_BASE"] = "https://adb-xxx.azuredatabricks.net/serving-endpoints"

response = completion(
    model="databricks/databricks-dbrx-instruct",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

### Databricks SDK 인증 (자동)

자격 증명이 제공되지 않으면 LiteLLM은 Databricks SDK를 사용해 자동으로 인증합니다. 이 방식은 환경에 구성된 OAuth, Azure AD 및 기타 통합 인증 방식을 지원합니다.

```python
from litellm import completion

# No environment variables needed - uses Databricks SDK unified auth
# Requires: uv add databricks-sdk
response = completion(
    model="databricks/databricks-dbrx-instruct",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

## 파트너 기여 추적을 위한 Custom User-Agent

Databricks와 통합되는 제품을 LiteLLM 위에서 빌드하는 경우, Databricks telemetry에서 올바르게 기여를 추적할 수 있도록 자체 파트너 식별자를 전달할 수 있습니다.

파트너 이름은 LiteLLM user agent 앞에 접두사로 추가됩니다.

```python
# Via parameter
response = completion(
    model="databricks/databricks-dbrx-instruct",
    messages=[{"role": "user", "content": "Hello!"}],
    user_agent="mycompany/1.0.0",
)
# Resulting User-Agent: mycompany_litellm/1.79.1

# Via environment variable
os.environ["DATABRICKS_USER_AGENT"] = "mycompany/1.0.0"
# Resulting User-Agent: mycompany_litellm/1.79.1
```

| 입력 | 결과 User-Agent |
|-------|---------------------|
| (none) | `litellm/1.79.1` |
| `mycompany/1.0.0` | `mycompany_litellm/1.79.1` |
| `partner_product/2.5.0` | `partner_product_litellm/1.79.1` |
| `acme` | `acme_litellm/1.79.1` |

**참고:** 사용자 지정 user agent의 버전은 무시되며, 항상 LiteLLM 버전이 사용됩니다.

## 보안

LiteLLM은 자격 증명 유출을 방지하기 위해 모든 디버그 로그에서 민감한 정보(토큰, 시크릿, API 키)를 자동으로 마스킹합니다. 여기에 포함되는 항목은 다음과 같습니다.

- Authorization 헤더
- API 키 및 토큰
- Client secret
- 개인 액세스 토큰 (PAT)

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### ENV VAR
```python
import os 
os.environ["DATABRICKS_API_KEY"] = ""
os.environ["DATABRICKS_API_BASE"] = ""
```

### 예제 Call

```python
from litellm import completion
import os
## set ENV variables
os.environ["DATABRICKS_API_KEY"] = "databricks key"
os.environ["DATABRICKS_API_BASE"] = "databricks base url" # e.g.: https://adb-3064715882934586.6.azuredatabricks.net/serving-endpoints

# Databricks dbrx-instruct call
response = completion(
    model="databricks/databricks-dbrx-instruct", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 모델을 추가합니다.

  ```yaml
  model_list:
    - model_name: dbrx-instruct
      litellm_params:
        model: databricks/databricks-dbrx-instruct
        api_key: os.environ/DATABRICKS_API_KEY
        api_base: os.environ/DATABRICKS_API_BASE
        user_agent: "mycompany/1.0.0"  # Optional: for partner attribution
  ```



2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml --debug
  ```

3. LiteLLM Proxy Server로 요청을 보냅니다.

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="sk-1234",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="dbrx-instruct",
      messages = [
        {
            "role": "system",
            "content": "Be a good human!"
        },
        {
            "role": "user",
            "content": "What do you know about earth?"
        }
    ]
  )

  print(response)
  ```

  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "dbrx-instruct",
      "messages": [
        {
            "role": "system",
            "content": "Be a good human!"
        },
        {
            "role": "user",
            "content": "What do you know about earth?"
        }
        ],
  }'
  ```
  </TabItem>

  </Tabs>


</TabItem>

</Tabs>

## 추가 파라미터 전달 - max_tokens, temperature 
litellm.completion에서 지원하는 모든 파라미터는 [여기](../completion/input.md#translated-openai-params)를 참고하세요.

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["DATABRICKS_API_KEY"] = "databricks key"
os.environ["DATABRICKS_API_BASE"] = "databricks api base"

# databricks dbrx call
response = completion(
    model="databricks/databricks-dbrx-instruct", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**프록시**

```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: databricks/databricks-meta-llama-3-70b-instruct
        api_key: os.environ/DATABRICKS_API_KEY
        max_tokens: 20
        temperature: 0.5
```


## 사용법 - Thinking / `reasoning_content` {#usage---thinking--reasoning_content}

LiteLLM은 OpenAI의 `reasoning_effort`를 Anthropic의 `thinking` 파라미터로 변환합니다. [Code](https://github.com/BerriAI/litellm/blob/23051d89dd3611a81617d84277059cd88b2df511/litellm/llms/anthropic/chat/transformation.py#L298)

| reasoning_effort | thinking |
| ---------------- | -------- |
| "low"            | "budget_tokens": 1024 |
| "medium"         | "budget_tokens": 2048 |
| "high"           | "budget_tokens": 4096 |


알려진 제한 사항:
- thinking block을 Claude로 다시 전달하는 기능 지원 [Issue](https://github.com/BerriAI/litellm/issues/9790)
 

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

# set ENV variables (can also be passed in to .completion() - e.g. `api_base`, `api_key`)
os.environ["DATABRICKS_API_KEY"] = "databricks key"
os.environ["DATABRICKS_API_BASE"] = "databricks base url"

resp = completion(
    model="databricks/databricks-claude-3-7-sonnet",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml을 설정합니다.

```yaml
- model_name: claude-3-7-sonnet
  litellm_params:
    model: databricks/databricks-claude-3-7-sonnet
    api_key: os.environ/DATABRICKS_API_KEY
    api_base: os.environ/DATABRICKS_API_BASE
```

2. 프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "claude-3-7-sonnet",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>


**예상 응답**

```python
ModelResponse(
    id='chatcmpl-c542d76d-f675-4e87-8e5f-05855f5d0f5e',
    created=1740470510,
    model='claude-3-7-sonnet-20250219',
    object='chat.completion',
    system_fingerprint=None,
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="The capital of France is Paris.",
                role='assistant',
                tool_calls=None,
                function_call=None,
                provider_specific_fields={
                    'citations': None,
                    'thinking_blocks': [
                        {
                            'type': 'thinking',
                            'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                            'signature': 'EuYBCkQYAiJAy6...'
                        }
                    ]
                }
            ),
            thinking_blocks=[
                {
                    'type': 'thinking',
                    'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                    'signature': 'EuYBCkQYAiJAy6AGB...'
                }
            ],
            reasoning_content='The capital of France is Paris. This is a very straightforward factual question.'
        )
    ],
    usage=Usage(
        completion_tokens=68,
        prompt_tokens=42,
        total_tokens=110,
        completion_tokens_details=None,
        prompt_tokens_details=PromptTokensDetailsWrapper(
            audio_tokens=None,
            cached_tokens=0,
            text_tokens=None,
            image_tokens=None
        ),
        cache_creation_input_tokens=0,
        cache_read_input_tokens=0
    )
)
```

### 인용

Databricks를 통해 제공되는 Anthropic 모델은 인용 메타데이터를 반환할 수 있습니다. LiteLLM은 이를
`response.choices[0].message.provider_specific_fields["citations"]`를 통해 노출합니다.

### Anthropic 모델에 `thinking` 전달하기

Anthropic 모델에 `thinking` 파라미터를 전달할 수도 있습니다.


Anthropic 모델에 `thinking` 파라미터를 전달할 수도 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

# set ENV variables (can also be passed in to .completion() - e.g. `api_base`, `api_key`)
os.environ["DATABRICKS_API_KEY"] = "databricks key"
os.environ["DATABRICKS_API_BASE"] = "databricks base url"

response = litellm.completion(
  model="databricks/databricks-claude-3-7-sonnet",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 1024},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "databricks/databricks-claude-3-7-sonnet",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>





## 지원되는 Databricks Chat Completion 모델 

:::tip

**모든 Databricks 모델을 지원합니다. litellm 요청을 보낼 때 `model=databricks/<any-model-on-databricks>`를 접두사로 설정하기만 하면 됩니다.**

:::


| 모델 이름                 | 명령                                                          |
|----------------------------|------------------------------------------------------------------|
| `databricks/databricks-claude-3-7-sonnet`    | `completion(model='databricks/databricks/databricks-claude-3-7-sonnet', messages=messages)`   | 
| `databricks-meta-llama-3-1-70b-instruct`    | `completion(model='databricks/databricks-meta-llama-3-1-70b-instruct', messages=messages)`   | 
| `databricks-meta-llama-3-1-405b-instruct`    | `completion(model='databricks/databricks-meta-llama-3-1-405b-instruct', messages=messages)`   | 
| `databricks-dbrx-instruct`    | `completion(model='databricks/databricks-dbrx-instruct', messages=messages)`   | 
| `databricks-meta-llama-3-70b-instruct`    | `completion(model='databricks/databricks-meta-llama-3-70b-instruct', messages=messages)`   | 
| `databricks-llama-2-70b-chat`    | `completion(model='databricks/databricks-llama-2-70b-chat', messages=messages)`   | 
| `databricks-mixtral-8x7b-instruct`    | `completion(model='databricks/databricks-mixtral-8x7b-instruct', messages=messages)`   | 
| `databricks-mpt-30b-instruct`    | `completion(model='databricks/databricks-mpt-30b-instruct', messages=messages)`   | 
| `databricks-mpt-7b-instruct`    | `completion(model='databricks/databricks-mpt-7b-instruct', messages=messages)`   | 


## Embedding 모델

### Databricks 전용 파라미터 전달 - 'instruction'

임베딩 모델의 경우 Databricks는 추가 파라미터 'instruction'을 전달할 수 있게 합니다. [전체 사양](https://github.com/BerriAI/litellm/blob/43353c28b341df0d9992b45c6ce464222ebd7984/litellm/llms/databricks.py#L164)


```python
# !uv add litellm
from litellm import embedding
import os
## set ENV variables
os.environ["DATABRICKS_API_KEY"] = "databricks key"
os.environ["DATABRICKS_API_BASE"] = "databricks url"

# Databricks bge-large-en call
response = litellm.embedding(
      model="databricks/databricks-bge-large-en",
      input=["good morning from litellm"],
      instruction="Represent this sentence for searching relevant passages:",
  )
```

**프록시**

```yaml
  model_list:
    - model_name: bge-large
      litellm_params:
        model: databricks/databricks-bge-large-en
        api_key: os.environ/DATABRICKS_API_KEY
        api_base: os.environ/DATABRICKS_API_BASE
        instruction: "Represent this sentence for searching relevant passages:"
```

## 지원되는 Databricks Embedding 모델 

:::tip

**모든 Databricks 모델을 지원합니다. litellm 요청을 보낼 때 `model=databricks/<any-model-on-databricks>`를 접두사로 설정하기만 하면 됩니다.**

:::


| 모델 이름                 | 명령                                                          |
|----------------------------|------------------------------------------------------------------|
| `databricks-bge-large-en`    | `embedding(model='databricks/databricks-bge-large-en', messages=messages)`   |
| `databricks-gte-large-en`    | `embedding(model='databricks/databricks-gte-large-en', messages=messages)`   |
