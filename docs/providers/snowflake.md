import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Snowflake
| 속성                       | 세부 정보                                                                                                 |
|----------------------------|-----------------------------------------------------------------------------------------------------------|
| 설명                       | Snowflake Cortex LLM REST API를 사용하면 HTTP POST 요청으로 COMPLETE 및 EMBED 함수에 액세스할 수 있습니다 |
| LiteLLM의 Provider Route   | `snowflake/`                                                                                              |
| Provider 문서 링크         | [Snowflake ↗](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-llm-rest-api)              |
| 기본 URL                   | `https://{account-id}.snowflakecomputing.com/api/v2/cortex/inference:complete`,`https://{account-id}.snowflakecomputing.com/api/v2/cortex/inference:embed`|
| 지원되는 OpenAI 엔드포인트 | `/chat/completions`, `/completions`, `/embeddings`                                                        |


## 지원되는 OpenAI 매개변수 {#supported-openai-parameters}
```
    "temperature",
    "max_tokens",
    "top_p",
    "response_format"
```

## API 키 {#api-keys}

Snowflake는 API 키를 사용하지 않습니다. 대신 JWT 토큰과 계정 식별자로 Snowflake API에 액세스합니다.

[programmatic access tokens](https://docs.snowflake.com/en/user-guide/programmatic-access-tokens) (PAT)도 사용할 수 있습니다. `pat/` 접두사를 사용해 정의할 수 있습니다.


```python
import os 
os.environ["SNOWFLAKE_JWT"] = "YOUR JWT"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "YOUR ACCOUNT IDENTIFIER"
```
## 사용법

```python
from litellm import completion, embedding

## set ENV variables
os.environ["SNOWFLAKE_JWT"] = "JWT_TOKEN"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "YOUR ACCOUNT IDENTIFIER"

# Snowflake completion call
response = completion(
    model="snowflake/mistral-7b", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)

# Snowflake embedding call
response = embedding(
    model="snowflake/mistral-7b", 
    input = ["My text"]
)

# Pass`api_key` and `account_id` as parameters
response = completion(
    model="snowflake/mistral-7b", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    account_id="AAAA-BBBB",
    api_key="JWT_TOKEN"
)

# using PAT
response = completion(
    model="snowflake/mistral-7b", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    api_key="pat/PAT_TOKEN"
)
```

## LiteLLM Proxy 사용법 {#사용법-with-litellm-proxy}

#### 1. 필수 환경 변수 {#1-required-env-variables}
```bash
export SNOWFLAKE_JWT=""
export SNOWFLAKE_ACCOUNT_ID = ""
```

#### 2. 프록시 시작 {#2-프록시-시작}
```yaml
model_list:
  - model_name: mistral-7b
    litellm_params:
        model: snowflake/mistral-7b
        api_key: YOUR_API_KEY
        api_base: https://YOUR-ACCOUNT-ID.snowflakecomputing.com/api/v2/cortex/inference:complete

```

```bash
litellm --config /path/to/config.yaml
```

#### 3. 테스트 {#3-test-it}
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "snowflake/mistral-7b",
      "messages": [
        {
          "role": "user",
          "content": "Hello, how are you?"
        }
      ]
    }
'
```
