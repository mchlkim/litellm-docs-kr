import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 지원되지 않는 매개변수 제거 {#drop-unsupported-params}

사용 중인 LLM Provider에서 지원하지 않는 OpenAI 매개변수를 제거합니다.

## 기본 동작 {#default-behavior}

**기본적으로 LiteLLM은 지원하지 않는 매개변수를 모델에 보내면 예외를 발생시킵니다.**

예를 들어 `temperature` 매개변수를 지원하지 않는 모델에 `temperature=0.2`를 보내면 LiteLLM은 예외를 발생시킵니다.

**`drop_params=True`가 설정되면**, LiteLLM은 예외를 발생시키는 대신 지원되지 않는 매개변수를 제거합니다. 이렇게 하면 각 Provider마다 매개변수를 별도로 맞추지 않아도 여러 Provider에서 코드가 원활하게 동작할 수 있습니다.

## 빠른 시작 

```python 
import litellm 
import os 

# set keys 
os.environ["COHERE_API_KEY"] = "co-.."

litellm.drop_params = True # 👈 KEY CHANGE

response = litellm.completion(
                model="command-r",
                messages=[{"role": "user", "content": "Hey, how's it going?"}],
                response_format={"key": "value"},
            )
```


LiteLLM은 provider + model별로 지원되는 모든 openai 매개변수를 매핑합니다(예: function calling은 bedrock의 anthropic에서는 지원되지만 titan에서는 지원되지 않습니다).

`litellm.get_supported_openai_params("command-r")` [**코드**](https://github.com/BerriAI/litellm/blob/main/litellm/utils.py#L3584)를 참고하세요.

provider/model이 특정 매개변수를 지원하지 않는 경우 해당 매개변수를 제거할 수 있습니다.

## OpenAI Proxy 사용법

```yaml
litellm_settings:
    drop_params: true
```

## `completion(..)`에서 drop_params 전달 {#pass-drop-params-in-completion}

특정 모델을 호출할 때만 drop_params를 적용합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python 
import litellm 
import os 

# set keys 
os.environ["COHERE_API_KEY"] = "co-.."

response = litellm.completion(
                model="command-r",
                messages=[{"role": "user", "content": "Hey, how's it going?"}],
                response_format={"key": "value"},
                drop_params=True
            )
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
- litellm_params:
    api_base: my-base
    model: openai/my-model
    drop_params: true # 👈 KEY CHANGE
  model_name: my-model
```
</TabItem>
</Tabs>

## 제거할 매개변수 지정 {#specify-params-to-drop}

provider를 호출할 때 특정 매개변수를 제거하려면(예: vllm의 'logit_bias')

`additional_drop_params`를 사용합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm 
import os 

# set keys 
os.environ["COHERE_API_KEY"] = "co-.."

response = litellm.completion(
                model="command-r",
                messages=[{"role": "user", "content": "Hey, how's it going?"}],
                response_format={"key": "value"},
                additional_drop_params=["response_format"]
            )
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
- litellm_params:
    api_base: my-base
    model: openai/my-model
    additional_drop_params: ["response_format"] # 👈 KEY CHANGE
  model_name: my-model
```
</TabItem>
</Tabs>

**additional_drop_params**: List 또는 null - 모델을 호출할 때 제거하려는 openai 매개변수 목록입니다.

### 중첩 필드 제거 {#nested-field-removal}

JSONPath와 유사한 표기법을 사용해 복잡한 객체 안의 중첩 필드를 제거합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

response = litellm.completion(
    model="bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0",
    messages=[{"role": "user", "content": "Hello"}],
    tools=[{
        "name": "search",
        "description": "Search files",
        "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}},
        "input_examples": [{"query": "test"}]  # Will be removed
    }],
    additional_drop_params=["tools[*].input_examples"]  # Remove from all tools
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: my-bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0
      additional_drop_params: ["tools[*].input_examples"]  # Remove from all tools
```

</TabItem>
</Tabs>

**지원되는 문법:**
- `field` - 최상위 필드
- `parent.child` - 중첩 객체 필드
- `array[*]` - 모든 배열 요소
- `array[0]` - 특정 배열 인덱스
- `tools[*].input_examples` - 모든 배열 요소의 필드
- `tools[0].metadata.field` - 특정 인덱스 + 중첩 필드

**예제 사용 사례:**
- 도구 정의에서 `input_examples` 제거(Claude Code + AWS Bedrock)
- 중첩 구조에서 provider별 필드 제거
- LLM으로 보내기 전에 중첩 매개변수 정리

## 요청에서 허용할 openai 매개변수 지정 {#specify-allowed-openai-params-in-a-request}

요청에서 특정 openai 매개변수를 허용하도록 litellm에 지시합니다. `litellm.UnsupportedParamsError`가 발생했고 해당 매개변수를 허용하고 싶을 때 사용하세요. LiteLLM은 해당 매개변수를 그대로 모델에 전달합니다.



<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

이 예제에서는 `tools` 매개변수를 허용하기 위해 `allowed_openai_params=["tools"]`를 전달합니다.

```python showLineNumbers title="Pass allowed_openai_params to LiteLLM Python SDK"
await litellm.acompletion(
    model="azure/o_series/<my-deployment-name>",
    api_key="xxxxx",
    api_base=api_base,
    messages=[{"role": "user", "content": "Hello! return a json object"}],
    tools=[{"type": "function", "function": {"name": "get_current_time", "description": "Get the current time in a given location.", "parameters": {"type": "object", "properties": {"location": {"type": "string", "description": "The city name, e.g. San Francisco"}}, "required": ["location"]}}}]
    allowed_openai_params=["tools"],
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

litellm proxy를 사용할 때는 두 가지 방식으로 `allowed_openai_params`를 전달할 수 있습니다.

1. 요청에서 `allowed_openai_params`를 동적으로 전달
2. 특정 모델의 config.yaml 파일에 `allowed_openai_params` 설정

#### 요청에서 allowed_openai_params 동적 전달 {#dynamically-pass-allowed-openai-params-in-a-request}
이 예제에서는 proxy에 설정된 모델로 보내는 요청에서 `tools` 매개변수를 허용하기 위해 `allowed_openai_params=["tools"]`를 전달합니다.

```python showLineNumbers title="Dynamically pass allowed_openai_params in a request"
import openai
from openai import AsyncAzureOpenAI

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ 
        "allowed_openai_params": ["tools"]
    }
)
```

#### config.yaml에 allowed_openai_params 설정 {#set-allowed-openai-params-on-config-yaml}

특정 모델의 config.yaml 파일에 `allowed_openai_params`를 설정할 수도 있습니다. 이렇게 하면 이 배포로 보내는 모든 요청에서 `tools` 매개변수를 전달할 수 있습니다.

```yaml showLineNumbers title="Set allowed_openai_params on config.yaml"
model_list:
  - model_name: azure-o1-preview
    litellm_params:
      model: azure/o_series/<my-deployment-name>
      api_key: xxxxx
      api_base: https://openai-prod-test.openai.azure.com/openai/deployments/o1/chat/completions?api-version=2025-01-01-preview
      allowed_openai_params: ["tools"]
```
</TabItem>
</Tabs>
