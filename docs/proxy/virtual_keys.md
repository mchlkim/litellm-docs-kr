import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 가상 키
프록시의 가상 키로 지출을 추적하고 모델 접근을 제어합니다.

:::info

- 🔑 [키 생성, 편집, 삭제 UI(SSO 포함)](https://docs.litellm.ai/docs/proxy/ui)
- [키 관리를 포함해 LiteLLM Proxy 배포](https://docs.litellm.ai/docs/proxy/deploy#deploy-with-database)
- [LiteLLM Proxy + 키 관리용 Dockerfile.database](https://github.com/BerriAI/litellm/blob/main/docker/Dockerfile.database)


:::

## 설정 {#setup}

요구 사항:

- postgres 데이터베이스가 필요합니다(예: [Supabase](https://supabase.com/), [Neon](https://neon.tech/) 등).
- 환경 변수에 `DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>`을 설정합니다.
- `master key`를 설정합니다. 이 키는 Proxy Admin 키이며 다른 키를 생성할 때 사용할 수 있습니다(🚨 반드시 `sk-`로 시작해야 함).
  - **config.yaml에서 설정** 아래 예시처럼 `general_settings:master_key` 아래에 master key를 설정합니다.
  - **환경 변수로 설정** `LITELLM_MASTER_KEY`를 설정합니다.

(프록시 Dockerfile은 `DATABASE_URL` 설정 여부를 확인한 뒤 DB 연결을 초기화합니다.)

```shell
export DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
```


그 다음 `/key/generate` 엔드포인트를 호출해 키를 생성할 수 있습니다.

[**See code**](https://github.com/BerriAI/litellm/blob/7a669a36d2689c7f7890bc9c93e04ff3c2641299/litellm/proxy/proxy_server.py#L672)

## **빠른 시작 - 키 생성**
**1단계: postgres DB URL 저장**

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
        model: ollama/llama2
  - model_name: gpt-3.5-turbo
    litellm_params:
        model: ollama/llama2

general_settings: 
  master_key: sk-1234 
  database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # 👈 KEY CHANGE
```

**2단계: litellm 시작**

```shell
litellm --config /path/to/config.yaml
```

**3단계: 키 생성**

```shell 
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["gpt-3.5-turbo", "gpt-4"], "metadata": {"user": "ishaan@berri.ai"}}'
```

## 비용 추적 

다음 단위별 지출을 조회할 수 있습니다.
- key - `/key/info` 사용 [Swagger](https://litellm-api.up.railway.app/#/key%20management/info_key_fn_key_info_get)
- user - `/user/info` 사용 [Swagger](https://litellm-api.up.railway.app/#/user%20management/user_info_user_info_get)
- team - `/team/info` 사용 [Swagger](https://litellm-api.up.railway.app/#/team%20management/team_info_team_info_get)
- ⏳ end-users - `/end_user/info` 사용 - [end-user 비용 추적은 이 이슈에 댓글](https://github.com/BerriAI/litellm/issues/2633)

**어떻게 계산되나요?**

모델별 비용은 [여기](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에 저장되며 [`completion_cost`](https://github.com/BerriAI/litellm/blob/db7974f9f216ee50b53c53120d1e3fc064173b60/litellm/utils.py#L3771) 함수로 계산됩니다.

**어떻게 추적되나요?**

키의 지출은 `LiteLLM_VerificationTokenTable`에서 자동으로 추적됩니다. 키에 `user_id` 또는 `team_id`가 연결되어 있으면 해당 사용자의 지출은 `LiteLLM_UserTable`에서, 팀 지출은 `LiteLLM_TeamTable`에서 추적됩니다.

<Tabs>
<TabItem value="key-info" label="Key Spend">

`/key/info` 엔드포인트를 사용해 키의 지출을 가져올 수 있습니다.

```bash
curl 'http://0.0.0.0:4000/key/info?key=<user-key>' \
     -X GET \
     -H 'Authorization: Bearer <your-master-key>'
```

LiteLLM의 completion_cost() 함수를 사용해 /completions, /chat/completions, /embeddings 호출이 발생하면 이 값은 USD 기준으로 자동 업데이트됩니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/1a6ea20a0bb66491968907c2bfaabb7fe45fc064/litellm/utils.py#L1654).

**샘플 응답**

```python
{
    "key": "sk-tXL0wt5-lOOVK9sfY2UacA",
    "info": {
        "token": "sk-tXL0wt5-lOOVK9sfY2UacA",
        "spend": 0.0001065, # 👈 SPEND
        "expires": "2023-11-24T23:19:11.131000Z",
        "models": [
            "gpt-3.5-turbo",
            "gpt-4",
            "claude-2"
        ],
        "aliases": {
            "mistral-7b": "gpt-3.5-turbo"
        },
        "config": {}
    }
}
```

</TabItem>
<TabItem value="user-info" label="User Spend">

**1. 사용자 생성**

```bash
curl --location 'http://localhost:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{user_email: "krrish@berri.ai"}' 
```

**예상 응답**

```bash
{
    ...
    "expires": "2023-12-22T09:53:13.861000Z",
    "user_id": "my-unique-id", # 👈 unique id
    "max_budget": 0.0
}
```

**2. 해당 사용자용 키 생성**

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["gpt-3.5-turbo", "gpt-4"], "user_id": "my-unique-id"}'
```

키 `sk-...`를 반환합니다.

**3. 사용자 지출 확인**

```bash
curl 'http://0.0.0.0:4000/user/info?user_id=my-unique-id' \
     -X GET \
     -H 'Authorization: Bearer <your-master-key>'
```

예상 응답

```bash
{
  ...
  "spend": 0 # 👈 SPEND
}
```

</TabItem>
<TabItem value="team-info" label="Team Spend">

여러 사람이 키를 소유해야 한다면(예: 프로덕션 앱) team을 사용하세요.

**1. 팀 생성**

```bash
curl --location 'http://localhost:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"team_alias": "my-awesome-team"}' 
```

**예상 응답**

```bash
{
    ...
    "expires": "2023-12-22T09:53:13.861000Z",
    "team_id": "my-unique-id", # 👈 unique id
    "max_budget": 0.0
}
```

**2. 해당 팀용 키 생성**

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["gpt-3.5-turbo", "gpt-4"], "team_id": "my-unique-id"}'
```

키 `sk-...`를 반환합니다.

**3. 팀 지출 확인**

```bash
curl 'http://0.0.0.0:4000/team/info?team_id=my-unique-id' \
     -X GET \
     -H 'Authorization: Bearer <your-master-key>'
```

예상 응답

```bash
{
  ...
  "spend": 0 # 👈 SPEND
}
```

</TabItem>
</Tabs>


## 모델 alias {#model-aliases}

사용자가 특정 모델(예: gpt3-5)을 사용할 것으로 예상되고 다음을 원한다면:

- 요청을 업그레이드(예: GPT4)
- 또는 다운그레이드(예: Mistral)

다음과 같이 설정할 수 있습니다.

**1단계: config.yaml에 모델 그룹 생성(모델 이름, API 키 등 저장)**

```yaml
model_list:
  - model_name: my-free-tier
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8001
  - model_name: my-free-tier
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8002
  - model_name: my-free-tier
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8003
  - model_name: my-paid-tier
    litellm_params:
        model: gpt-4
        api_key: my-api-key
```

**2단계: 키 생성**

```bash
curl -X POST "https://0.0.0.0:4000/key/generate" \
-H "Authorization: Bearer <your-master-key>" \
-H "Content-Type: application/json" \
-d '{
	"models": ["my-free-tier"], 
	"aliases": {"gpt-3.5-turbo": "my-free-tier"}, # 👈 KEY CHANGE
	"duration": "30min"
}'
```

- **요청을 업그레이드/다운그레이드하려면?** alias 매핑을 변경합니다.

**3단계: 키 테스트**

```bash
curl -X POST "https://0.0.0.0:4000/key/generate" \
-H "Authorization: Bearer <user-key>" \
-H "Content-Type: application/json" \
-d '{
    "model": "gpt-3.5-turbo", 
    "messages": [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ]
}'
```


## 고급

### custom header로 LiteLLM 키 전달 {#pass-litellm-key-in-custom-header}

LiteLLM 프록시가 기본 `"Authorization"` 헤더 대신 custom header에서 가상 키를 찾도록 하려면 이 기능을 사용합니다.

**1단계** LiteLLM config.yaml에서 `litellm_key_header_name` 이름을 정의합니다.

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: sk-1234 
  litellm_key_header_name: "X-Litellm-Key" # 👈 Key Change

```

**2단계** 테스트

이 요청에서 LiteLLM은 `X-Litellm-Key` 헤더의 가상 키를 사용합니다.

<Tabs>
<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Litellm-Key: Bearer sk-1234" \
  -H "Authorization: Bearer bad-key" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
  }'
```

**예상 응답**

`X-Litellm-Key`로 전달된 키가 유효하므로 LiteLLM 프록시에서 성공 응답을 볼 수 있어야 합니다.
```shell
{"id":"chatcmpl-f9b2b79a7c30477ab93cd0e717d1773e","choices":[{"finish_reason":"stop","index":0,"message":{"content":"\n\nHello there, how may I assist you today?","role":"assistant","tool_calls":null,"function_call":null}}],"created":1677652288,"model":"gpt-3.5-turbo-0125","object":"chat.completion","system_fingerprint":"fp_44709d6fcb","usage":{"completion_tokens":12,"prompt_tokens":9,"total_tokens":21}
```

</TabItem>

<TabItem value="python" label="OpenAI Python SDK">

```python
client = openai.OpenAI(
    api_key="not-used",
    base_url="https://api-gateway-url.com/llmservc/api/litellmp",
    default_headers={
        "Authorization": f"Bearer {API_GATEWAY_TOKEN}", # (optional) For your API Gateway
        "X-Litellm-Key": f"Bearer sk-1234"              # For LiteLLM Proxy
    }
)
```
</TabItem>
</Tabs>

### Enable/Disable 가상 키

**키 비활성화**

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/block' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-H 'Content-Type: application/json' \
-d '{"key": "KEY-TO-BLOCK"}'
```

예상 응답:

```bash
{
  ...
  "blocked": true
}
```

**키 활성화**

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/unblock' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-H 'Content-Type: application/json' \
-d '{"key": "KEY-TO-UNBLOCK"}'
```


```bash
{
  ...
  "blocked": false
}
```


### Custom 키 생성 {#custom-keygenerate}

Proxy API Key를 생성하기 전에 custom logic을 추가해야 한다면 사용합니다(예: `team_id` 검증).

#### 1. custom `custom_generate_key_fn` 작성


custom_generate_key_fn 함수의 입력은 단일 파라미터 `data`입니다. [(Type: GenerateKeyRequest)](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_types.py#L125)

`custom_generate_key_fn`의 출력은 다음 구조의 딕셔너리여야 합니다.
```python
{
    "decision": False,
    "message": "This violates LiteLLM Proxy Rules. No team id provided.",
}

```

- `decision` (Type: bool): 키 생성을 허용할지(True) 여부(False)를 나타내는 boolean 값입니다.

- `message` (타입: str, 선택 사항): 결정에 대한 추가 정보를 제공하는 선택적 메시지입니다. `decision`이 False일 때 이 필드가 포함됩니다.


```python
async def custom_generate_key_fn(data: GenerateKeyRequest)-> dict:
        """
        Asynchronous function for generating a key based on the input data.

        Args:
            data (GenerateKeyRequest): The input data for key generation.

        Returns:
            dict: A dictionary containing the decision and an optional message.
            {
                "decision": False,
                "message": "This violates LiteLLM Proxy Rules. No team id provided.",
            }
        """
        
        # decide if a key should be generated or not
        print("using custom auth function!")
        data_json = data.json()  # type: ignore

        # Unpacking variables
        team_id = data_json.get("team_id")
        duration = data_json.get("duration")
        models = data_json.get("models")
        aliases = data_json.get("aliases")
        config = data_json.get("config")
        spend = data_json.get("spend")
        user_id = data_json.get("user_id")
        max_parallel_requests = data_json.get("max_parallel_requests")
        metadata = data_json.get("metadata")
        tpm_limit = data_json.get("tpm_limit")
        rpm_limit = data_json.get("rpm_limit")

        if team_id is not None and team_id == "litellm-core-infra@gmail.com":
            # only team_id="litellm-core-infra@gmail.com" can make keys
            return {
                "decision": True,
            }
        else:
            print("Failed custom auth")
            return {
                "decision": False,
                "message": "This violates LiteLLM Proxy Rules. No team id provided.",
            }
```


#### 2. 파일 경로 전달(config.yaml 기준 상대 경로)

파일 경로를 config.yaml에 전달합니다.

예를 들어 `./config.yaml`과 `./custom_auth.py`가 같은 디렉터리에 있다면 다음과 같습니다.
```yaml 
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "gpt-3.5-turbo"

litellm_settings:
  drop_params: True
  set_verbose: True

general_settings:
  custom_key_generate: custom_auth.custom_generate_key_fn
```


### /key/generate 파라미터 상한
키별로 `max_budget`, `budget_duration` 또는 임의의 `key/generate` 파라미터에 기본 상한을 설정해야 한다면 사용합니다.

Set `litellm_settings:upperbound_key_generate_params`:
```yaml
litellm_settings:
  upperbound_key_generate_params:
    max_budget: 100 # Optional[float], optional): upperbound of $100, for all /key/generate requests
    budget_duration: "10d" # Optional[str], optional): upperbound of 10 days for budget_duration values
    duration: "30d" # Optional[str], optional): upperbound of 30 days for all /key/generate requests
    max_parallel_requests: 1000 # (Optional[int], optional): Max number of requests that can be made in parallel. Defaults to None.
    tpm_limit: 1000 #(Optional[int], optional): Tpm limit. Defaults to None.
    rpm_limit: 1000 #(Optional[int], optional): Rpm limit. Defaults to None.
```

**예상 동작**

- `max_budget=200`으로 `/key/generate` 요청을 보냅니다.
- 100이 상한이므로 키는 `max_budget=100`으로 생성됩니다.

### 기본 /key/generate 파라미터
키별 기본 `max_budget` 또는 임의의 `key/generate` 파라미터를 제어해야 한다면 사용합니다.

`/key/generate` 요청이 `max_budget`을 지정하지 않으면 `default_key_generate_params`에 지정된 `max_budget`을 사용합니다.

Set `litellm_settings:default_key_generate_params`:
```yaml
litellm_settings:
  default_key_generate_params:
    max_budget: 1.5000
    models: ["azure-gpt-3.5"]
    duration:     # blank means `null`
    metadata: {"setting":"default"}
    team_id: "core-infra"
```

### ✨ 키 회전

:::info

엔터프라이즈 기능입니다.

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[Get free 7-day trial key](https://www.litellm.ai/enterprise#trial)


:::

기존 API 키를 회전하면서 선택적으로 파라미터를 업데이트합니다.

```bash

curl 'http://localhost:4000/key/sk-1234/regenerate' \
  -X POST \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "max_budget": 100,
    "metadata": {
      "team": "core-infra"
    },
    "models": [
      "gpt-4",
      "gpt-3.5-turbo"
    ],
    "grace_period": "48h"
  }'

```

**Grace period(선택 사항)**: `grace_period`(예: `"24h"`, `"2d"`, `"1w"`)를 설정하면 전환 기간 동안 이전 키를 유효하게 유지할 수 있습니다. grace period가 끝날 때까지 이전 키와 새 키가 모두 동작하므로 프로덕션 중단 없이 전환할 수 있습니다. 생략하거나 비워두면 즉시 revoke됩니다. 예약 회전에서는 `LITELLM_KEY_ROTATION_GRACE_PERIOD` 환경 변수로도 설정할 수 있습니다.

**더 읽기**

- [회전된 키를 secrets manager에 쓰기](https://docs.litellm.ai/docs/secret#aws-secret-manager)

[**👉 API REFERENCE DOCS**](https://litellm-api.up.railway.app/#/key%20management/regenerate_key_fn_key__key__regenerate_post)


### 예약 키 회전 {#scheduled-key-rotations}

LiteLLM은 사용자가 정의한 시간 간격에 따라 **가상 키를 자동으로** 회전할 수 있습니다.

#### 사전 준비

1. **데이터베이스 연결 필요** - 키 회전 일정을 추적하려면 연결된 데이터베이스가 필요합니다.
2. **회전 worker 활성화** - 환경 변수 `LITELLM_KEY_ROTATION_ENABLED=true`를 설정합니다.
3. **검사 간격 설정** - 선택적으로 `LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS`를 설정합니다(기본값: 86400초 / 24시간).

#### 동작 방식

1. 가상 키를 생성할 때 `auto_rotate: true`와 `rotation_interval`(duration string)을 설정합니다.
2. LiteLLM은 다음 회전 시간을 `now + rotation_interval`로 계산해 데이터베이스에 저장합니다.
3. 백그라운드 작업이 회전 시간이 지난 키를 주기적으로 확인합니다.
4. 키 회전 시점이 되면 LiteLLM이 자동으로 키를 다시 생성하고 이전 키 문자열을 무효화합니다.
5. 새 회전 시간이 계산되고 이 주기가 계속됩니다.

#### 자동 회전 키 생성

**API**
```bash
curl 'http://0.0.0.0:4000/key/generate' \
  -H 'Authorization: Bearer <your-master-key>' \
  -H 'Content-Type: application/json' \
  -d '{
        "models": ["gpt-4o"],
        "auto_rotate": true,
        "rotation_interval": "30d"
      }'
```

**LiteLLM UI**

LiteLLM UI에서 Keys 페이지로 이동한 뒤 `Generate Key` > `Key Lifecycle` > `Enable Auto Rotation`을 클릭합니다.
<Image 
  img={require('../../img/key_r.png')}
  style={{width: '30%', display: 'block', margin: '0'}}
/>

**유효한 rotation_interval 형식:**
- `"30s"` - 30초
- `"30m"` - 30분
- `"30h"` - 30시간
- `"30d"` - 30일
- `"90d"` - 90일

#### 기존 키에 회전 활성화

**API**

```bash
curl 'http://0.0.0.0:4000/key/update' \
  -H 'Authorization: Bearer <your-master-key>' \
  -H 'Content-Type: application/json' \
  -d '{
        "key": "sk-existing-key",
        "auto_rotate": true,
        "rotation_interval": "90d"
      }'
```

**LiteLLM UI**

LiteLLM UI에서 Keys 페이지로 이동합니다. 업데이트할 키를 선택하고 `Edit Settings` > `Auto-Rotation Settings`를 클릭합니다.

<Image 
  img={require('../../img/key_u.png')}
  style={{width: '30%', display: 'block', margin: '0'}}
/>

#### 환경 변수

프록시를 시작할 때 다음 환경 변수를 설정합니다.

| 변수 | 설명 | 기본값 |
|----------|-------------|---------|
| `LITELLM_KEY_ROTATION_ENABLED` | 회전 worker 활성화 | `false` |
| `LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS` | 회전할 키를 스캔하는 주기(초) | `86400` (24시간) |
| `LITELLM_KEY_ROTATION_GRACE_PERIOD` | 회전 후 이전 키를 유효하게 유지할 기간(예: `24h`, `2d`) | `""` (즉시 revoke) |

**예제:**
```bash
export LITELLM_KEY_ROTATION_ENABLED=true
export LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS=3600  # Check every hour
export LITELLM_KEY_ROTATION_GRACE_PERIOD=48h  # Keep old key valid for 48h during cutover

litellm --config config.yaml
```

### 임시 예산 증액 {#temporary-budget-increase}

기존 키의 예산을 늘리려면 `/key/update` 엔드포인트를 사용합니다.

```bash
curl -L -X POST 'http://localhost:4000/key/update' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"key": "sk-b3Z3Lqdb_detHXSUp4ol4Q", "temp_budget_increase": 100, "temp_budget_expiry": "10d"}'
```

[API 레퍼런스](https://litellm-api.up.railway.app/#/key%20management/update_key_fn_key_update_post)


### 키 생성 제한 {#restricting-key-generation}

누가 키를 생성할 수 있는지 제어할 때 사용합니다. 다른 사용자가 UI에서 키를 만들 수 있도록 허용할 때 유용합니다.

```yaml
litellm_settings:
  key_generation_settings:
    team_key_generation:
      allowed_team_member_roles: ["admin"]
      required_params: ["tags"] # require team admins to set tags for cost-tracking when generating a team key
    personal_key_generation: # maps to 'Default Team' on UI 
      allowed_user_roles: ["proxy_admin"]
```

#### 스펙

```python
key_generation_settings: Optional[StandardKeyGenerationConfig] = None
```

#### 타입

```python
class StandardKeyGenerationConfig(TypedDict, total=False):
    team_key_generation: TeamUIKeyGenerationConfig
    personal_key_generation: PersonalUIKeyGenerationConfig

class TeamUIKeyGenerationConfig(TypedDict):
    allowed_team_member_roles: List[str] # either 'user' or 'admin'
    required_params: List[str] # require params on `/key/generate` to be set if a team key (team_id in request) is being generated


class PersonalUIKeyGenerationConfig(TypedDict):
    allowed_user_roles: List[LitellmUserRoles] 
    required_params: List[str] # require params on `/key/generate` to be set if a personal key (no team_id in request) is being generated


class LitellmUserRoles(str, enum.Enum):
    """
    Admin Roles:
    PROXY_ADMIN: admin over the platform
    PROXY_ADMIN_VIEW_ONLY: can login, view all own keys, view all spend
    ORG_ADMIN: admin over a specific organization, can create teams, users only within their organization

    Internal User Roles:
    INTERNAL_USER: can login, view/create/delete their own keys, view their spend
    INTERNAL_USER_VIEW_ONLY: can login, view their own keys, view their own spend


    Team Roles:
    TEAM: used for JWT auth


    Customer Roles:
    CUSTOMER: External users -> these are customers

    """

    # Admin Roles
    PROXY_ADMIN = "proxy_admin"
    PROXY_ADMIN_VIEW_ONLY = "proxy_admin_viewer"

    # Organization admins
    ORG_ADMIN = "org_admin"

    # Internal User Roles
    INTERNAL_USER = "internal_user"
    INTERNAL_USER_VIEW_ONLY = "internal_user_viewer"

    # Team Roles
    TEAM = "team"

    # Customer Roles - External users of proxy
    CUSTOMER = "customer"
```


## **다음 단계 - 가상 키별 예산 및 Rate Limit 설정**

[LiteLLM에서 가상 키별 예산과 rate limiter를 설정하려면 이 문서를 따르세요](users)

## 엔드포인트 레퍼런스(스펙)

### Keys 

#### [**👉 API REFERENCE DOCS**](https://litellm-api.up.railway.app/#/key%20management/)

### Users

#### [**👉 API REFERENCE DOCS**](https://litellm-api.up.railway.app/#/user%20management/)


### Teams

#### [**👉 API REFERENCE DOCS**](https://litellm-api.up.railway.app/#/team%20management)
