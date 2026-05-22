# API Keys, Base, Version 설정

LiteLLM에서는 다음 항목을 지정할 수 있습니다:
* API Key
* API Base
* API Version
* API Type
* Project
* Location
* Token

유용한 Helper 함수:
* [`check_valid_key()`](#check_valid_key)
* [`get_valid_models()`](#get_valid_models)

다음 방법으로 API configs를 설정할 수 있습니다:
* 환경 변수
* litellm variables `litellm.api_key`
* `completion()`에 args 전달

## 환경 변수

### API Keys 설정

liteLLM API key 또는 특정 provider key를 설정합니다:

```python
import os 

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "Your API Key"
os.environ["ANTHROPIC_API_KEY"] = "Your API Key"
os.environ["XAI_API_KEY"] = "Your API Key"
os.environ["REPLICATE_API_KEY"] = "Your API Key"
os.environ["TOGETHERAI_API_KEY"] = "Your API Key"
```

### API Base, API Version, API Type 설정

```python
# for azure openai
os.environ['AZURE_API_BASE'] = "https://openai-gpt-4-test2-v-12.openai.azure.com/"
os.environ['AZURE_API_VERSION'] = "2023-05-15" # [OPTIONAL]
os.environ['AZURE_API_TYPE'] = "azure" # [OPTIONAL]

# for openai
os.environ['OPENAI_BASE_URL'] = "https://your_host/v1"
```

### Project, Location, Token 설정

Cloud providers의 경우:
- Azure
- Bedrock
- GCP
- Watson AI 

추가 parameters를 설정해야 할 수 있습니다. LiteLLM은 모든 providers에 매핑되는 공통 params 집합을 제공합니다.

|      | LiteLLM param | Watson       | Vertex AI    | Azure        | Bedrock      |
|------|--------------|--------------|--------------|--------------|--------------|
| Project | project | watsonx_project | vertex_project | n/a | n/a |
| Region | region_name | watsonx_region_name | vertex_location | n/a | aws_region_name |
| Token | token | watsonx_token or token | n/a | azure_ad_token | n/a |

필요하다면 provider-specific params로도 호출할 수 있습니다.

## litellm 변수

### `litellm.api_key`
이 변수는 모든 provider에 대해 확인됩니다.

```python
import litellm
# openai call
litellm.api_key = "sk-OpenAIKey"
response = litellm.completion(messages=messages, model="gpt-3.5-turbo")

# anthropic call
litellm.api_key = "sk-AnthropicKey"
response = litellm.completion(messages=messages, model="claude-2")
```

### `litellm.provider_key` (예: `litellm.openai_key`)

```python
litellm.openai_key = "sk-OpenAIKey"
response = litellm.completion(messages=messages, model="gpt-3.5-turbo")

# anthropic call
litellm.anthropic_key = "sk-AnthropicKey"
response = litellm.completion(messages=messages, model="claude-2")
```

### `litellm.api_base`

```python
import litellm
litellm.api_base = "https://hosted-llm-api.co"
response = litellm.completion(messages=messages, model="gpt-3.5-turbo")
```

### `litellm.api_version`

```python
import litellm
litellm.api_version = "2023-05-15"
response = litellm.completion(messages=messages, model="gpt-3.5-turbo")
```

### `litellm.organization`
```python
import litellm
litellm.organization = "LiteLlmOrg"
response = litellm.completion(messages=messages, model="gpt-3.5-turbo")
```

## completion()에 Args 전달 (또는 `transcription`, `embedding`, `text_completion` 등 모든 litellm endpoint)

`completion()` 호출 안에서 API key를 전달할 수 있습니다:

### api_key
```python
from litellm import completion

messages = [{ "content": "Hello, how are you?","role": "user"}]

response = completion("command-nightly", messages, api_key="Your-Api-Key")
```

### api_base

```python
from litellm import completion

messages = [{ "content": "Hello, how are you?","role": "user"}]

response = completion("command-nightly", messages, api_base="https://hosted-llm-api.co")
```

### api_version

```python
from litellm import completion

messages = [{ "content": "Hello, how are you?","role": "user"}]

response = completion("command-nightly", messages, api_version="2023-02-15")
```

## Helper 함수

### `check_valid_key()`

사용자가 호출하려는 model에 대해 유효한 key를 제출했는지 확인합니다.

```python
key = "bad-key"
response = check_valid_key(model="gpt-3.5-turbo", api_key=key)
assert(response == False)
```

### `get_valid_models()`

이 helper는 .env를 읽고 사용자가 사용할 수 있는 supported llms 목록을 반환합니다.

```python
old_environ = os.environ
os.environ = {'OPENAI_API_KEY': 'temp'} # mock set only openai key in environ

valid_models = get_valid_models()
print(valid_models)

# list of openai supported llms on litellm
expected_models = litellm.open_ai_chat_completion_models + litellm.open_ai_text_completion_models

assert(valid_models == expected_models)

# reset replicate env key
os.environ = old_environ
```

### `get_valid_models(check_provider_endpoint: True)`

이 helper는 유효한 models를 찾기 위해 provider의 endpoint를 확인합니다.

현재 다음 항목에 대해 구현되어 있습니다:
- OpenAI (OPENAI_API_KEY가 설정된 경우)
- Fireworks AI (FIREWORKS_AI_API_KEY가 설정된 경우)
- LiteLLM Proxy (LITELLM_PROXY_API_KEY가 설정된 경우)
- Gemini (GEMINI_API_KEY가 설정된 경우)
- XAI (XAI_API_KEY가 설정된 경우)   
- Anthropic (ANTHROPIC_API_KEY가 설정된 경우)

확인할 custom provider를 지정할 수도 있습니다:

**모든 providers**:
```python
from litellm import get_valid_models

valid_models = get_valid_models(check_provider_endpoint=True)
print(valid_models)
```

**특정 provider**:
```python
from litellm import get_valid_models

valid_models = get_valid_models(check_provider_endpoint=True, custom_llm_provider="openai")
print(valid_models)
```

### `validate_environment(model: str)`

이 helper는 model에 필요한 모든 환경 변수가 있는지, 없다면 무엇이 누락되었는지 알려줍니다.

```python
from litellm import validate_environment

print(validate_environment("openai/gpt-3.5-turbo"))
```
