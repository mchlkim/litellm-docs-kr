import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 클라이언트 측 LLM 자격 증명


### 사용자 LLM API 키와 폴백 전달
최종 사용자가 요청을 보낼 때 자신의 모델 목록, api base, OpenAI API key(LiteLLM이 지원하는 모든 공급자)를 전달할 수 있게 합니다.

**참고** 이는 [virtual keys](./virtual_keys.md)와 관련이 없습니다. 사용자의 실제 LLM API 키를 전달하려는 경우에 사용합니다.

:::info

**litellm.RouterConfig를 `user_config`로 전달할 수 있습니다. 지원되는 모든 매개변수는 여기에서 확인하세요. https://github.com/BerriAI/litellm/blob/main/litellm/types/router.py **

:::

<Tabs>

<TabItem value="openai-py" label="OpenAI Python">

#### Step 1: 사용자 모델 목록 및 구성 정의
```python
import os

user_config = {
    'model_list': [
        {
            'model_name': 'user-azure-instance',
            'litellm_params': {
                'model': 'azure/chatgpt-v-2',
                'api_key': os.getenv('AZURE_API_KEY'),
                'api_version': os.getenv('AZURE_API_VERSION'),
                'api_base': os.getenv('AZURE_API_BASE'),
                'timeout': 10,
            },
            'tpm': 240000,
            'rpm': 1800,
        },
        {
            'model_name': 'user-openai-instance',
            'litellm_params': {
                'model': 'gpt-3.5-turbo',
                'api_key': os.getenv('OPENAI_API_KEY'),
                'timeout': 10,
            },
            'tpm': 240000,
            'rpm': 1800,
        },
    ],
    'num_retries': 2,
    'allowed_fails': 3,
    'fallbacks': [
        {
            'user-azure-instance': ['user-openai-instance']
        }
    ]
}


```

#### Step 2: `extra_body`에 user_config 전송
```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# send request to `user-azure-instance`
response = client.chat.completions.create(model="user-azure-instance", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
], 
    extra_body={
      "user_config": user_config
    }
) # 👈 User config

print(response)
```

</TabItem>

<TabItem value="openai-js" label="OpenAI JS">

#### Step 1: 사용자 모델 목록 및 구성 정의
```javascript
const os = require('os');

const userConfig = {
    model_list: [
        {
            model_name: 'user-azure-instance',
            litellm_params: {
                model: 'azure/chatgpt-v-2',
                api_key: process.env.AZURE_API_KEY,
                api_version: process.env.AZURE_API_VERSION,
                api_base: process.env.AZURE_API_BASE,
                timeout: 10,
            },
            tpm: 240000,
            rpm: 1800,
        },
        {
            model_name: 'user-openai-instance',
            litellm_params: {
                model: 'gpt-3.5-turbo',
                api_key: process.env.OPENAI_API_KEY,
                timeout: 10,
            },
            tpm: 240000,
            rpm: 1800,
        },
    ],
    num_retries: 2,
    allowed_fails: 3,
    fallbacks: [
        {
            'user-azure-instance': ['user-openai-instance']
        }
    ]
};
```

#### Step 2: `user_config`를 `openai.chat.completions.create`의 매개변수로 전송

```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-1234",
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
    user_config: userConfig // # 👈 User config
  });
}

main();
```

</TabItem>

</Tabs>

### 사용자 LLM API 키 / API Base 전달
사용자가 요청을 보낼 때 자신의 OpenAI API key/API base(LiteLLM이 지원하는 모든 공급자)를 전달할 수 있게 합니다.

방법은 다음과 같습니다.

#### 1. 공급자에 대해 구성 가능한 클라이언트 측 인증 자격 증명 활성화

```yaml
model_list:
  - model_name: "fireworks_ai/*"
    litellm_params:
      model: "fireworks_ai/*"
      configurable_clientside_auth_params: ["api_base"]
      # OR 
      configurable_clientside_auth_params: [{"api_base": "^https://litellm.*direct\.fireworks\.ai/v1$"}] # 👈 regex
```

사용자가 구성할 수 있게 하려는 인증 매개변수를 일부 또는 전부 지정합니다.

- api_base (✅ regex 지원)
- api_key
- base_url 

(공급자별 인증 매개변수는 [provider docs](../providers/)를 확인하세요. 예: `vertex_project`)


#### 2. 테스트합니다!

```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-3.5-turbo", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
], 
    extra_body={"api_key": "my-bad-key", "api_base": "https://litellm-dev.direct.fireworks.ai/v1"}) # 👈 clientside credentials

print(response)
```

더 많은 예시:
<Tabs>
<TabItem value="openai-py" label="Azure Credentials">

OpenAI 클라이언트의 `extra_body` 매개변수를 통해 litellm_params(예: api_key, api_base 등)를 전달합니다.

```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-3.5-turbo", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
], 
    extra_body={
      "api_key": "my-azure-key",
      "api_base": "my-azure-base",
      "api_version": "my-azure-version"
    }) # 👈 User Key

print(response)
```


</TabItem>
<TabItem value="openai-js" label="OpenAI JS">

JS에서는 OpenAI 클라이언트가 일반적인 방식으로 `create(..)` 본문에 매개변수를 전달받습니다.

```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-1234",
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
    api_key: "my-bad-key" // 👈 User Key
  });
}

main();
```
</TabItem>
</Tabs>

### 공급자별 매개변수 전달(예: Region, Project ID 등)

클라이언트 측에서 Vertex AI로 요청을 보낼 때 사용할 region, project id 등을 지정합니다.

Proxy의 요청 본문에 전달된 값은 LiteLLM이 매핑된 openai / litellm 인증 매개변수와 대조해 확인합니다.

매핑되지 않은 매개변수는 공급자별 매개변수로 간주되며, LLM API의 요청 본문에서 공급자로 그대로 전달됩니다.

```bash
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
    extra_body={ # pass any additional litellm_params here
        vertex_ai_location: "us-east1" 
    }
)

print(response)
```
