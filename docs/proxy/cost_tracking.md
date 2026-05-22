import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 비용 추적

100개 이상의 LLM에서 키, 사용자, 팀별 지출을 추적합니다.

LiteLLM은 알려진 모든 모델의 지출을 자동으로 추적합니다. [모델 비용 맵](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)을 참고하세요.

응답에 티어 메타데이터가 포함되면 제공자별 비용 추적(예: [Vertex AI PayGo / priority pricing](../providers/vertex.md), [Bedrock service tiers](../providers/bedrock.md), [Azure base model mapping](./custom_pricing.md))이 자동으로 적용됩니다.

:::tip 가격 데이터 최신 상태 유지
정확한 비용 추적을 위해 [GitHub에서 모델 가격 데이터를 동기화](./sync_models_github.md)하세요.
:::

:::info 비용이 제공자 청구서와 일치하지 않나요?
[비용 불일치 디버깅](../troubleshoot/cost_discrepancy)의 단계별 워크플로를 사용하세요. 시간 범위를 맞추고, 캐시를 포함한 토큰 범주를 비교한 뒤, 차이가 수집, 계산식, 모델 맵 가격 중 어디에서 생겼는지 판단합니다.
:::

### LiteLLM으로 지출 추적하기 {#how-to-track-spend}

**1단계**

👉 [데이터베이스와 함께 LiteLLM 설정](https://docs.litellm.ai/docs/proxy/virtual_keys#setup)

**2단계** `/chat/completions` 요청 보내기

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python title="Send Request with Spend Tracking" showLineNumbers
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="llama3",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    user="palantir", # OPTIONAL: pass user to track spend by user
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"] # ENTERPRISE: pass tags to track spend by tags
        }
    }
)

print(response)
```

</TabItem>

<TabItem value="Curl" label="Curl 요청">

요청 본문 일부로 `metadata`를 전달합니다.

```shell title="Curl Request with Spend Tracking" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "user": "palantir", # OPTIONAL: pass user to track spend by user
    "metadata": {
        "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"] # ENTERPRISE: pass tags to track spend by tags
    }
}'
```

</TabItem>
<TabItem value="langchain" label="Langchain">

```python title="Langchain with Spend Tracking" showLineNumbers
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage
import os

os.environ["OPENAI_API_KEY"] = "sk-1234"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "llama3",
    user="palantir",
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"] # ENTERPRISE: pass tags to track spend by tags
        }
    }
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>
</Tabs>

**3단계 - 지출 추적 확인**
이제 지출이 추적되었는지 확인합니다.

<Tabs>
<TabItem value="curl" label="응답 헤더">

응답 헤더에 계산된 비용과 함께 `x-litellm-response-cost`가 표시되어야 합니다.

<Image img={require('../../img/response_cost_img.png')} />

</TabItem>
<TabItem value="db" label="DB + UI">

다음 지출 정보가 `LiteLLM_Spend로그` 테이블에 기록됩니다.

```json title="Spend Log Entry Format" showLineNumbers
{
  "api_key": "fe6b0cab4ff5a5a8df823196cc8a450*****",                            # Hash of API Key used
  "user": "default_user",                                                       # Internal User (LiteLLM_UserTable) that owns `api_key=sk-1234`.
  "team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32",                            # Team (LiteLLM_TeamTable) that owns `api_key=sk-1234`
  "request_tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"],# Tags sent in request
  "end_user": "palantir",                                                       # Customer - the `user` sent in the request
  "model_group": "llama3",                                                      # "model" passed to LiteLLM
  "api_base": "https://api.groq.com/openai/v1/",                                # "api_base" of model used by LiteLLM
  "spend": 0.000002,                                                            # Spend in $
  "total_tokens": 100,
  "completion_tokens": 80,
  "prompt_tokens": 20,

}
```

LiteLLM UI(https://your-proxy-endpoint/ui)의 사용법 탭으로 이동하여 `사용법` 아래에 지출이 추적되는지 확인합니다.

<Image img={require('../../img/admin_ui_spend.png')} />

</TabItem>
</Tabs>

### 프록시 관리자가 아닌 사용자의 `/spend` 엔드포인트 접근 허용

프록시 관리자가 아닌 사용자에게 `/spend` 엔드포인트 접근 권한을 주려면 이 설정을 사용합니다.

:::info

[엔터프라이즈 라이선스 발급 상담 일정을 예약](https://enterprise.litellm.ai/demo)하세요.

:::

##### 키 생성

`permissions={"get_spend_routes": true}`를 포함해 키를 생성합니다.

```shell title="Generate Key with Spend Route Permissions" showLineNumbers
curl --location 'http://0.0.0.0:4000/key/generate' \
        --header 'Authorization: Bearer sk-1234' \
        --header 'Content-Type: application/json' \
        --data '{
            "permissions": {"get_spend_routes": true}
    }'
```

##### 생성된 키를 `/spend` 엔드포인트에서 사용

새로 생성한 키로 지출 관련 라우트에 접근합니다.

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30' \
  -H 'Authorization: Bearer sk-H16BKvrSNConSsBYLGc_7A'
```

#### 팀 및 API 키 지출 초기화 - MASTER KEY 전용

다음이 필요할 때 `/global/spend/reset`을 사용합니다.

- 모든 API 키와 팀의 지출을 초기화합니다. `LiteLLM_TeamTable` 및 `LiteLLM_VerificationToken`의 모든 팀과 키에 대한 `spend`가 `spend=0`으로 설정됩니다.

- LiteLLM은 감사를 위해 `LiteLLMSpend로그`의 모든 로그를 유지합니다.

##### 요청

설정한 `LITELLM_MASTER_KEY`만 이 라우트에 접근할 수 있습니다.

```shell
curl -X POST \
  'http://localhost:4000/global/spend/reset' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json'
```

##### 예상 응답

```shell
{"message":"Spend for all API Keys and Teams reset successfully","status":"success"}
```

## 사용자별 총 지출

최종 사용자에게 키를 발급하고 키에 해당 사용자의 `user_id`를 설정했다면, 이 API로 사용량을 확인할 수 있습니다.

```shell title="Get User Spend - API Request" showLineNumbers
curl -L -X GET 'http://localhost:4000/user/info?user_id=jane_smith' \
-H 'Authorization: Bearer sk-...'
```

```json title="Total for a user API Response" showLineNumbers
{
  "user_id": "jane_smith",
  "user_info": {
    "spend": 0.1
  },
  "keys": [
    {
      "token": "6e952b0efcafbb6350240db25ed534b4ec6011b3e1ba1006eb4f903461fd36f6",
      "key_name": "sk-...KE_A",
      "key_alias": "user-01882d6b-e090-776a-a587-21c63e502670-01983ddb-872f-71a3-8b3a-f9452c705483",
      "soft_budget_cooldown": false,
      "spend": 0.1,
      "expires": "2025-07-31T19:14:13.968000+00:00",
      "models": [],
      "aliases": {},
      "config": {},
      "user_id": "01982d6b-e090-776a-a587-21c63e502660",
      "team_id": "f2044fde-2293-482f-bf35-a8dab4e85c5f",
      "permissions": {},
      "max_parallel_requests": null,
      "metadata": {},
      "blocked": null,
      "tpm_limit": null,
      "rpm_limit": null,
      "max_budget": null,
      "budget_duration": null,
      "budget_reset_at": null,
      "allowed_cache_controls": [],
      "allowed_routes": [],
      "model_spend": {},
      "model_max_budget": {},
      "budget_id": null,
      "organization_id": null,
      "object_permission_id": null,
      "created_at": "2025-07-24T19:14:13.970000Z",
      "created_by": "582b168f-fc11-4e14-ad6a-cf4bb3656ddc",
      "updated_at": "2025-07-24T19:14:13.970000Z",
      "updated_by": "582b168f-fc11-4e14-ad6a-cf4bb3656ddc",
      "litellm_budget_table": null,
      "litellm_organization_table": null,
      "object_permission": null,
      "team_alias": null
    }
  ],
  "teams": []
}
```

**경고**
최종 사용자는 요청 본문에 `user` 파라미터를 직접 제공할 수 있습니다. 이렇게 하면 해당 API가 보고하는 키 소유 사용자가 아니라 `/customer/info?end_user_id=self-declared-user`에 보고되는 비용이 증가합니다. 따라서 사용자가 이 방식으로 지출 추적을 우회할 수 있습니다.
사용자 지출을 추적해야 하고 최종 사용자에게 API 키를 제공한다면, API 키 생성 시 항상 `user_id`를 설정해야 합니다. 또한 백엔드 서비스에서 해당 사용자를 대신해 LLM 호출을 수행할 때마다 그 사용자에게 발급된 키를 사용해야 지출이 추적됩니다.

## 일별 지출 분석 API {#daily-spend-breakdown-api}

단일 엔드포인트로 사용자별 일별 사용량 데이터를 모델, 제공자, API 키 단위로 상세 조회합니다.

예제 Request:

```shell title="Daily Spend Breakdown API" showLineNumbers
curl -L -X GET 'http://localhost:4000/user/daily/activity?start_date=2025-03-20&end_date=2025-03-27' \
-H 'Authorization: Bearer sk-...'
```

```json title="Daily Spend Breakdown API Response" showLineNumbers
{
    "results": [
        {
            "date": "2025-03-27",
            "metrics": {
                "spend": 0.0177072,
                "prompt_tokens": 111,
                "completion_tokens": 1711,
                "total_tokens": 1822,
                "api_requests": 11
            },
            "breakdown": {
                "models": {
                    "gpt-4o-mini": {
                        "spend": 1.095e-05,
                        "prompt_tokens": 37,
                        "completion_tokens": 9,
                        "total_tokens": 46,
                        "api_requests": 1
                },
                "providers": { "openai": { ... }, "azure_ai": { ... } },
                "api_keys": { "3126b6eaf1...": { ... } }
            }
        }
    ],
    "metadata": {
        "total_spend": 0.7274667,
        "total_prompt_tokens": 280990,
        "total_completion_tokens": 376674,
        "total_api_requests": 14
    }
}
```

### API 참조

`/user/daily/activity` 엔드포인트의 자세한 내용은 [Swagger API](https://litellm-api.up.railway.app/#/Budget%20%26%20Spend%20Tracking/get_user_daily_activity_user_daily_activity_get)를 참고하세요.

<a id="-custom-tags"></a>

## 사용자 지정 태그 {#custom-tags}

:::tip 전체 요청 태그 문서 보기
`x-litellm-tags` 헤더, 요청 본문 `tags`, 구성 기반 태그를 포함한 모든 태그 옵션의 전체 문서는 별도 [Request Tags](./request_tags.md) 페이지를 참고하세요.
:::

요구 사항:

- 가상 키와 데이터베이스가 설정되어 있어야 합니다. [virtual keys](https://docs.litellm.ai/docs/proxy/virtual_keys)를 참고하세요.

**참고:** 기본적으로 LiteLLM은 비용 추적을 위해 `User-Agent`를 사용자 지정 태그로 기록합니다. 이를 통해 Claude Code, Gemini CLI 같은 도구의 사용량을 볼 수 있습니다.

<Image img={require('../../img/claude_cli_tag_usage.png')} />

### 클라이언트 측 지출 태그

<Tabs>
<TabItem value="key" label="키에 설정">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "tags": ["tag1", "tag2", "tag3"]
    }
}

'
```

</TabItem>
<TabItem value="team" label="팀에 설정">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "tags": ["tag1", "tag2", "tag3"]
    }
}

'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

전달하려는 `metadata`를 `extra_body={"metadata": { }}`에 설정합니다.

```python
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
        "metadata": {
            "tags": ["model-anthropic-claude-v2.1", "app-ishaan-prod"] # 👈 Key Change
        }
    }
)

print(response)
```

</TabItem>

<TabItem value="openai js" label="OpenAI JS">

```js
const openai = require("openai");

async function runOpenAI() {
  const client = new openai.OpenAI({
    apiKey: "sk-1234",
    baseURL: "http://0.0.0.0:4000",
  });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "this is a test request, write a short poem",
        },
      ],
      metadata: {
        tags: ["model-anthropic-claude-v2.1", "app-ishaan-prod"], // 👈 Key Change
      },
    });
    console.log(response);
  } catch (error) {
    console.log("got this exception from server");
    console.error(error);
  }
}

// Call the asynchronous function
runOpenAI();
```

</TabItem>

<TabItem value="Curl" label="Curl 요청">

요청 본문 일부로 `metadata`를 전달합니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {"tags": ["model-anthropic-claude-v2.1", "app-ishaan-prod"]}
}'
```

</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "gpt-3.5-turbo",
    temperature=0.1,
    extra_body={
        "metadata": {
            "tags": ["model-anthropic-claude-v2.1", "app-ishaan-prod"]
        }
    }
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>
</Tabs>

### 지출 추적에 사용자 지정 헤더 추가

요청에 사용자 지정 헤더를 추가하여 지출과 사용량을 추적할 수 있습니다.

```yaml
litellm_settings:
  extra_spend_tag_headers:
    - "x-custom-header"
```

### user-agent 추적 비활성화

`litellm_settings.disable_add_user_agent_to_request_tags`를 `true`로 설정하여 user-agent 추적을 비활성화할 수 있습니다.

```yaml
litellm_settings:
  disable_add_user_agent_to_request_tags: true
```

## ✨ (엔터프라이즈) 지출 보고서 생성 {#-enterprise-generate-spend-reports}

다른 팀, 고객, 사용자에게 비용을 청구할 때 사용합니다.

지출 보고서를 가져오려면 `/global/spend/report` 엔드포인트를 사용합니다.

<Tabs>

<TabItem value="per team" label="팀별 지출">

#### 예제 Request

👉 핵심 변경: `group_by=team`을 지정합니다.

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30&group_by=team' \
  -H 'Authorization: Bearer sk-1234'
```

#### 예제 Response

<Tabs>

<TabItem value="response" label="예상 응답">

```shell
[
    {
        "group_by_day": "2024-04-30T00:00:00+00:00",
        "teams": [
            {
                "team_name": "Prod Team",
                "total_spend": 0.0015265,
                "metadata": [ # see the spend by unique(key + model)
                    {
                        "model": "gpt-4",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "88dc28.." # the hashed api key
                    },
                    {
                        "model": "gpt-4",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "a73dc2.." # the hashed api key
                    },
                    {
                        "model": "chatgpt-v-2",
                        "spend": 0.000214,
                        "total_tokens": 122,
                        "api_key": "898c28.." # the hashed api key
                    },
                    {
                        "model": "gpt-3.5-turbo",
                        "spend": 0.0000825,
                        "total_tokens": 85,
                        "api_key": "84dc28.." # the hashed api key
                    }
                ]
            }
        ]
    }
]
```

</TabItem>

<TabItem value="py-script" label="Script to Parse Response (Python)">

```python
import requests
url = 'http://localhost:4000/global/spend/report'
params = {
    'start_date': '2023-04-01',
    'end_date': '2024-06-30'
}

headers = {
    'Authorization': 'Bearer sk-1234'
}

# Make the GET request
response = requests.get(url, headers=headers, params=params)
spend_report = response.json()

for row in spend_report:
  date = row["group_by_day"]
  teams = row["teams"]
  for team in teams:
      team_name = team["team_name"]
      total_spend = team["total_spend"]
      metadata = team["metadata"]

      print(f"Date: {date}")
      print(f"Team: {team_name}")
      print(f"Total Spend: {total_spend}")
      print("Metadata: ", metadata)
      print()
```

스크립트 출력

```shell
# Date: 2024-05-11T00:00:00+00:00
# Team: local_test_team
# Total Spend: 0.003675099999999999
# Metadata:  [{'model': 'gpt-3.5-turbo', 'spend': 0.003675099999999999, 'api_key': 'b94d5e0bc3a71a573917fe1335dc0c14728c7016337451af9714924ff3a729db', 'total_tokens': 3105}]

# Date: 2024-05-13T00:00:00+00:00
# Team: Unassigned Team
# Total Spend: 3.4e-05
# Metadata:  [{'model': 'gpt-3.5-turbo', 'spend': 3.4e-05, 'api_key': '9569d13c9777dba68096dea49b0b03e0aaf4d2b65d4030eda9e8a2733c3cd6e0', 'total_tokens': 50}]

# Date: 2024-05-13T00:00:00+00:00
# Team: central
# Total Spend: 0.000684
# Metadata:  [{'model': 'gpt-3.5-turbo', 'spend': 0.000684, 'api_key': '0323facdf3af551594017b9ef162434a9b9a8ca1bbd9ccbd9d6ce173b1015605', 'total_tokens': 498}]

# Date: 2024-05-13T00:00:00+00:00
# Team: local_test_team
# Total Spend: 0.0005715000000000001
# Metadata:  [{'model': 'gpt-3.5-turbo', 'spend': 0.0005715000000000001, 'api_key': 'b94d5e0bc3a71a573917fe1335dc0c14728c7016337451af9714924ff3a729db', 'total_tokens': 423}]
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="per customer" label="고객별 지출">

:::info

고객은 `/chat/completions` 요청에 전달되는 `user`입니다.

- [LiteLLM API key](virtual_keys.md)

:::

#### 예제 Request

👉 핵심 변경: `group_by=customer`를 지정합니다.

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30&group_by=customer' \
  -H 'Authorization: Bearer sk-1234'
```

#### 예제 Response

```shell
[
    {
        "group_by_day": "2024-04-30T00:00:00+00:00",
        "customers": [
            {
                "customer": "palantir",
                "total_spend": 0.0015265,
                "metadata": [ # see the spend by unique(key + model)
                    {
                        "model": "gpt-4",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "88dc28.." # the hashed api key
                    },
                    {
                        "model": "gpt-4",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "a73dc2.." # the hashed api key
                    },
                    {
                        "model": "chatgpt-v-2",
                        "spend": 0.000214,
                        "total_tokens": 122,
                        "api_key": "898c28.." # the hashed api key
                    },
                    {
                        "model": "gpt-3.5-turbo",
                        "spend": 0.0000825,
                        "total_tokens": 85,
                        "api_key": "84dc28.." # the hashed api key
                    }
                ]
            }
        ]
    }
]
```

</TabItem>

<TabItem value="per key" label="특정 API 키의 지출">

👉 핵심 변경: `api_key=sk-1234`를 지정합니다.

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30&api_key=sk-1234' \
  -H 'Authorization: Bearer sk-1234'
```

#### 예제 Response

```shell
[
  {
    "api_key": "example-api-key-123",
    "total_cost": 0.3201286305151999,
    "total_input_tokens": 36.0,
    "total_output_tokens": 1593.0,
    "model_details": [
      {
        "model": "dall-e-3",
        "total_cost": 0.31999939051519993,
        "total_input_tokens": 0,
        "total_output_tokens": 0
      },
      {
        "model": "llama3-8b-8192",
        "total_cost": 0.00012924,
        "total_input_tokens": 36,
        "total_output_tokens": 1593
      }
    ]
  }
]
```

</TabItem>

<TabItem value="per user" label="내부 사용자(키 소유자)의 지출">

:::info

내부 사용자(키 소유자)는 [`/key/generate`](https://litellm-api.up.railway.app/#/key%20management/generate_key_fn_key_generate_post) 호출 시 전달되는 `user_id` 값입니다.

:::

👉 핵심 변경: `internal_user_id=ishaan`을 지정합니다.

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-12-30&internal_user_id=ishaan' \
  -H 'Authorization: Bearer sk-1234'
```

#### 예제 Response

```shell
[
  {
    "api_key": "example-api-key-123",
    "total_cost": 0.00013132,
    "total_input_tokens": 105.0,
    "total_output_tokens": 872.0,
    "model_details": [
      {
        "model": "gpt-3.5-turbo-instruct",
        "total_cost": 5.85e-05,
        "total_input_tokens": 15,
        "total_output_tokens": 18
      },
      {
        "model": "llama3-8b-8192",
        "total_cost": 7.282000000000001e-05,
        "total_input_tokens": 90,
        "total_output_tokens": 854
      }
    ]
  },
  {
    "api_key": "151e85e46ab8c9c7fad090793e3fe87940213f6ae665b543ca633b0b85ba6dc6",
    "total_cost": 5.2699999999999993e-05,
    "total_input_tokens": 26.0,
    "total_output_tokens": 27.0,
    "model_details": [
      {
        "model": "gpt-3.5-turbo",
        "total_cost": 5.2499999999999995e-05,
        "total_input_tokens": 24,
        "total_output_tokens": 27
      },
      {
        "model": "text-embedding-ada-002",
        "total_cost": 2e-07,
        "total_input_tokens": 2,
        "total_output_tokens": 0
      }
    ]
  },
  {
    "api_key": "60cb83a2dcbf13531bd27a25f83546ecdb25a1a6deebe62d007999dc00e1e32a",
    "total_cost": 9.42e-06,
    "total_input_tokens": 30.0,
    "total_output_tokens": 99.0,
    "model_details": [
      {
        "model": "llama3-8b-8192",
        "total_cost": 9.42e-06,
        "total_input_tokens": 30,
        "total_output_tokens": 99
      }
    ]
  }
]
```

</TabItem>

</Tabs>

## 📊 Spend 로그 API - 개별 트랜잭션 로그 {#-spend-logs-api---individual-transaction-logs}

`/spend/logs` 엔드포인트는 이제 날짜 필터 사용 시 데이터 형식을 제어하는 `summarize` 파라미터를 지원합니다.

### 주요 파라미터

| 파라미터    | 설명                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| `summarize` | **새 파라미터**: `true`(기본값) = 집계 데이터, `false` = 개별 트랜잭션 로그 |

### 예제

**개별 트랜잭션 로그 조회:**

```bash title="Get Individual Transaction Logs" showLineNumbers
curl -X GET "http://localhost:4000/spend/logs?start_date=2024-01-01&end_date=2024-01-02&summarize=false" \
-H "Authorization: Bearer sk-1234"
```

**요약 데이터 조회(기본값):**

```bash title="Get Summarized Spend Data" showLineNumbers
curl -X GET "http://localhost:4000/spend/logs?start_date=2024-01-01&end_date=2024-01-02" \
-H "Authorization: Bearer sk-1234"
```

**사용 사례:**

- `summarize=false`: 분석 대시보드, ETL 프로세스, 상세 감사 추적
- `summarize=true`: 일별 지출 보고서, 상위 수준 비용 추적(기존 동작)

<a id="-custom-spend-log-metadata"></a>

## ✨ 사용자 지정 Spend Log 메타데이터 {#custom-spend-log-metadata}

특정 키-값 쌍을 지출 로그 메타데이터의 일부로 기록합니다.

:::info

지출 로그 메타데이터에 특정 키-값 쌍을 기록하는 기능은 엔터프라이즈 기능입니다.

:::

요구 사항:

- 가상 키와 데이터베이스가 설정되어 있어야 합니다. [virtual keys](https://docs.litellm.ai/docs/proxy/virtual_keys)를 참고하세요.

#### 사용법 - 특수 지출 로그 메타데이터가 포함된 /chat/completions 요청


<Tabs>
<TabItem value="key" label="키에 설정">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
      "spend_logs_metadata": {
          "hello": "world"
      }
    }
}

'
```

</TabItem>
<TabItem value="team" label="팀에 설정">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
      "spend_logs_metadata": {
          "hello": "world"
      }
    }
}

'
```

</TabItem>

<TabItem value="openai" label="OpenAI Python v1.0.0+">

전달하려는 `metadata`를 `extra_body={"metadata": { }}`에 설정합니다.

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
        "metadata": {
            "spend_logs_metadata": {
                "hello": "world"
            }
        }
    }
)

print(response)
```

**헤더 사용:**

```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# Pass spend logs metadata via headers
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_headers={
        "x-litellm-spend-logs-metadata": '{"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}'
    }
)

print(response)
```

</TabItem>


<TabItem value="openai js" label="OpenAI JS">

```js
const openai = require('openai');

async function runOpenAI() {
  const client = new openai.OpenAI({
    apiKey: 'sk-1234',
    baseURL: 'http://0.0.0.0:4000'
  });

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: "this is a test request, write a short poem"
        },
      ],
      metadata: {
        spend_logs_metadata: { // 👈 Key Change
            hello: "world"
        }
      }
    });
    console.log(response);
  } catch (error) {
    console.log("got this exception from server");
    console.error(error);
  }
}

// Call the asynchronous function
runOpenAI();
```

**Using Headers:**

```js
const openai = require('openai');

async function runOpenAI() {
  const client = new openai.OpenAI({
    apiKey: 'sk-1234',
    baseURL: 'http://0.0.0.0:4000'
  });

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: "this is a test request, write a short poem"
        },
      ]
    }, {
      headers: {
        'x-litellm-spend-logs-metadata': '{"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}'
      }
    });
    console.log(response);
  } catch (error) {
    console.log("got this exception from server");
    console.error(error);
  }
}

// Call the asynchronous function
runOpenAI();
```

</TabItem>

<TabItem value="Curl" label="Curl 요청">

요청 본문 일부로 `metadata`를 전달합니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "spend_logs_metadata": {
            "hello": "world"
        }
    }
}'
```

</TabItem>

<TabItem value="headers" label="헤더 사용">

JSON 문자열을 포함한 요청 헤더로 `x-litellm-spend-logs-metadata`를 전달합니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'x-litellm-spend-logs-metadata: {"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "gpt-3.5-turbo",
    temperature=0.1,
    extra_body={
        "metadata": {
            "spend_logs_metadata": {
                "hello": "world"
            }
        }
    }
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>
</Tabs>


#### 사용자 지정 메타데이터가 포함된 지출 보기

#### `/spend/logs` 요청 형식 

```bash
curl -X GET "http://0.0.0.0:4000/spend/logs?request_id=<your-call-id" \ # e.g.: chatcmpl-9ZKMURhVYSi9D6r6PJ9vLcayIK0Vm
-H "Authorization: Bearer sk-1234"
```

#### `/spend/logs` 응답 형식
```bash
[
    {
        "request_id": "chatcmpl-9ZKMURhVYSi9D6r6PJ9vLcayIK0Vm",
        "call_type": "acompletion",
        "metadata": {
            "user_api_key": "example-api-key-123",
            "user_api_key_alias": null,
            "spend_logs_metadata": { # 👈 LOGGED CUSTOM METADATA
                "hello": "world"
            },
            "user_api_key_team_id": null,
            "user_api_key_user_id": "116544810872468347480",
            "user_api_key_team_alias": null
        },
    }
]
```
