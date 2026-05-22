import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Team/Key 기반 Logging {#team-key-based-logging}

## 개요

각 key/team이 자체 Langfuse Project 또는 custom callback을 사용하도록 허용합니다. 이를 통해 logging과 규정 준수 요구사항을 세밀하게 제어할 수 있습니다.

**예제 사용 사례:**
```showLineNumbers title="Team Based Logging"
Team 1 -> Logs to Langfuse Project 1 
Team 2 -> Logs to Langfuse Project 2
Team 3 -> Disabled Logging (for GDPR compliance)
```

## 지원 Logging 통합 {#supported-logging-integrations}
- `langfuse`
- `gcs_bucket`
- `langsmith`
- `arize`


## [BETA] Team Logging {#beta-team-logging}

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [여기에서 엔터프라이즈 시작하기](https://enterprise.litellm.ai/demo)

:::

### UI 사용법

1. logging 설정이 있는 team을 생성합니다.

"AI Agents"라는 team을 생성합니다.
<Image 
  img={require('../../img/team_logging1.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />


2. team용 key를 생성합니다.

"AI Agents" team용 key를 생성합니다. 이 team에 대해 생성된 모든 key에는 team logging settings가 사용됩니다.

<Image 
  img={require('../../img/team_logging2.png')}
  style={{width: '80%', display: 'block', margin: '2rem auto', border: '1px solid #E5E7EB'}}
/>

<br />


3. 테스트 LLM API request를 보냅니다.

새 key로 테스트 LLM API request를 보냅니다. 1단계에서 설정한 logging provider에서 log가 보여야 합니다.

<Image 
  img={require('../../img/team_logging3.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

4. logging provider에서 log를 확인합니다.

설정한 logging provider로 이동하여 2단계의 log를 받았는지 확인합니다.

<Image 
  img={require('../../img/team_logging4.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

### API 사용법
### Team별 Callback 설정 {#set-callbacks-per-team}

#### 1. Team callback 설정 {#1-set-callback-for-team}

callback을 추가하려면 `POST /team/{team_id}/callback`으로 request를 보냅니다.

```shell
curl -X POST 'http:/localhost:4000/team/dbe2f686-a686-4896-864a-4c3924458709/callback' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "callback_name": "langfuse",
  "callback_type": "success",
  "callback_vars": {
    "langfuse_public_key": "pk", 
    "langfuse_secret_key": "sk_", 
    "langfuse_host": "https://cloud.langfuse.com"
    }
  
}'
```

##### 지원 값 {#supported-values}

| 필드 | 지원 값 | 참고 |
|-------|------------------|-------|
| `callback_name` | `"langfuse"`, `"gcs_bucket"`| 현재 `"langfuse"`, `"gcs_bucket"`만 지원 |
| `callback_type` | `"success"`, `"failure"`, `"success_and_failure"` | |
| `callback_vars` | | callback settings dict입니다. |
| &nbsp;&nbsp;&nbsp;&nbsp;`langfuse_public_key` | string | Langfuse에 필요 |
| &nbsp;&nbsp;&nbsp;&nbsp;`langfuse_secret_key` | string | Langfuse에 필요 |
| &nbsp;&nbsp;&nbsp;&nbsp;`langfuse_host` | string | Langfuse에서는 선택 사항입니다. 기본값은 https://cloud.langfuse.com 입니다. |
| &nbsp;&nbsp;&nbsp;&nbsp;`gcs_bucket_name` | string | GCS Bucket에 필요. GCS bucket name |
| &nbsp;&nbsp;&nbsp;&nbsp;`gcs_path_service_account` | string | GCS Bucket에 필요. service account json path |

#### 2. Team용 key 생성

<span>team <code>dbe2f686-a686-4896-864a-4c3924458709</code>에 대해 생성된 모든 key는 <a href="#1-set-callback-for-team">1단계. team callback 설정</a>에 지정된 langfuse project로 log를 보냅니다.</span>


```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_id": "dbe2f686-a686-4896-864a-4c3924458709"
}'
```


#### 3. Team용 `/chat/completion` request 보내기

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-KbUuE0WNptC0jXapyMmLBA" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
}'
```

<span>이 request는 <a href="#1-set-callback-for-team">1단계. team callback 설정</a>에 지정된 langfuse project에 log로 기록되어야 합니다.</span>


### Team Logging 비활성화

특정 team의 logging을 비활성화하려면 다음 endpoint를 사용합니다.

`POST /team/{team_id}/disable_logging`

이 endpoint는 지정된 team의 모든 success/failure callback을 제거하여 logging을 비활성화합니다.

#### 1단계. Team logging 비활성화 {#step-1-disable-team-logging}

```shell
curl -X POST 'http://localhost:4000/team/YOUR_TEAM_ID/disable_logging' \
    -H 'Authorization: Bearer YOUR_API_KEY'
```
`YOUR_TEAM_ID`를 실제 team ID로 바꿉니다.

**Response**
성공한 request는 다음과 유사한 response를 반환합니다.
```json
{
    "status": "success",
    "message": "Logging disabled for team YOUR_TEAM_ID",
    "data": {
        "team_id": "YOUR_TEAM_ID",
        "success_callbacks": [],
        "failure_callbacks": []
    }
}
```

#### 2단계. Test - `/chat/completions` {#step-2-test-chat-completions}

team = `team_id`에 대해 생성된 key를 사용합니다. 설정된 success callback(예: Langfuse)에 log가 없어야 합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-KbUuE0WNptC0jXapyMmLBA" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
}'
```

#### 디버깅 / 문제 해결 {#debugging-troubleshooting}

- `GET /team/{team_id}/callback`으로 team의 active callback을 확인합니다.

team=`team_id`에서 어떤 success/failure callback이 active 상태인지 확인할 때 사용합니다.

```shell
curl -X GET 'http://localhost:4000/team/dbe2f686-a686-4896-864a-4c3924458709/callback' \
        -H 'Authorization: Bearer sk-1234'
```

### Team Logging endpoint 목록 {#team-logging-endpoints}

- [`POST /team/{team_id}/callback` team에 success/failure callback 추가](https://litellm-api.up.railway.app/#/team%20management/add_team_callbacks_team__team_id__callback_post)
- [`GET /team/{team_id}/callback` - team의 success/failure callback과 variables 조회](https://litellm-api.up.railway.app/#/team%20management/get_team_callbacks_team__team_id__callback_get)



## Team Logging - `config.yaml` {#team-logging-configyaml}

특정 team id의 logging과 caching을 켜거나 끕니다.

**예제:**

이 config는 team id에 따라 langfuse log를 서로 다른 두 langfuse project로 보냅니다.

```yaml
litellm_settings:
  default_team_settings: 
    - team_id: "dbe2f686-a686-4896-864a-4c3924458709"
      success_callback: ["langfuse"]
      langfuse_public_key: os.environ/LANGFUSE_PUB_KEY_1 # Project 1
      langfuse_secret: os.environ/LANGFUSE_PRIVATE_KEY_1 # Project 1
    - team_id: "06ed1e01-3fa7-4b9e-95bc-f2e59b74f3a8"
      success_callback: ["langfuse"]
      langfuse_public_key: os.environ/LANGFUSE_PUB_KEY_2 # Project 2
      langfuse_secret: os.environ/LANGFUSE_SECRET_2 # Project 2
```

이제 이 team-id에 대해 [key를 생성](./virtual_keys.md)하면:

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"team_id": "06ed1e01-3fa7-4b9e-95bc-f2e59b74f3a8"}'
```

이 key로 보낸 모든 request는 team-specific logging으로 data를 기록합니다.


## [BETA] Key 기반 Logging {#beta-key-based-logging}

특정 key에 logging callback을 추가하려면 `/key/generate` 또는 `/key/update` endpoint를 사용합니다.

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [여기에서 엔터프라이즈 시작하기](https://enterprise.litellm.ai/demo)

:::

**Key 기반 logging 동작 방식:**

- **Key에 callback이 설정되지 않은 경우**, `config.yaml` 파일에 지정된 default callback을 사용합니다.
- **Key에 callback이 설정된 경우**, key에 지정된 callback을 사용합니다.


### UI 사용법 

1. logging 설정이 있는 key를 생성합니다.

key를 생성할 때 해당 key의 특정 logging setting을 구성할 수 있습니다. 이 logging setting은 이 key로 보낸 모든 request에 사용됩니다.

<Image 
  img={require('../../img/key_logging.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<br />


2. 테스트 LLM API request를 보냅니다.

새 key로 테스트 LLM API request를 보냅니다. 1단계에서 설정한 logging provider에서 log가 보여야 합니다.

<Image 
  img={require('../../img/key_logging2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

3. logging provider에서 log를 확인합니다.

설정한 logging provider로 이동하여 2단계의 log를 받았는지 확인합니다.

<Image 
  img={require('../../img/key_logging_arize.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

### API 사용법



<Tabs>
<TabItem label="Langfuse" value="langfuse">

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "logging": [{
            "callback_name": "langfuse", # "otel", "gcs_bucket"
            "callback_type": "success", # "success", "failure", "success_and_failure"
            "callback_vars": {
                "langfuse_public_key": "os.environ/LANGFUSE_PUBLIC_KEY", # [RECOMMENDED] reference key in proxy environment
                "langfuse_secret_key": "os.environ/LANGFUSE_SECRET_KEY", # [RECOMMENDED] reference key in proxy environment
                "langfuse_host": "https://cloud.langfuse.com"
            }
        }]
    }
}'

```

<iframe width="840" height="500" src="https://www.youtube.com/embed/8iF0Hvwk0YU" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

</TabItem>
<TabItem label="GCS Bucket" value="gcs_bucket">

1. 특정 GCS Bucket에 log를 보내는 Virtual Key를 생성합니다.

  environment에서 `GCS_SERVICE_ACCOUNT`를 service account json path로 설정합니다.
  ```bash
  export GCS_SERVICE_ACCOUNT=/path/to/service-account.json # GCS_SERVICE_ACCOUNT=/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json
  ```

  ```bash
  curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
      "metadata": {
          "logging": [{
              "callback_name": "gcs_bucket", # "otel", "gcs_bucket"
              "callback_type": "success", # "success", "failure", "success_and_failure"
              "callback_vars": {
                  "gcs_bucket_name": "my-gcs-bucket", # Name of your GCS Bucket to log to
                  "gcs_path_service_account": "os.environ/GCS_SERVICE_ACCOUNT" # environ variable for this service account
              }
          }]
      }
  }'

  ```

2. Test - `/chat/completions` request

  3단계의 virtual key를 사용해 `/chat/completions` request를 보냅니다.

  request가 성공하면 GCS Bucket에서 log를 확인할 수 있어야 합니다.

  ```shell
  curl -i http://localhost:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-Fxq5XSyWKeXDKfPdqXZhPg" \
    -d '{
      "model": "fake-openai-endpoint",
      "messages": [
        {"role": "user", "content": "Hello, Claude"}
      ],
      "user": "hello",
    }'
  ```

</TabItem>

<TabItem label="Langsmith" value="langsmith">

1. 특정 Langsmith Project에 log를 보내는 Virtual Key를 생성합니다.

  ```bash
  curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
      "metadata": {
          "logging": [{
              "callback_name": "langsmith", # "otel", "gcs_bucket"
              "callback_type": "success", # "success", "failure", "success_and_failure"
              "callback_vars": {
                  "langsmith_api_key": "os.environ/LANGSMITH_API_KEY", # API Key for Langsmith logging
                  "langsmith_project": "pr-brief-resemblance-72", # project name on langsmith
                  "langsmith_base_url": "https://api.smith.langchain.com"
              }
          }]
      }
  }'

  ```

2. Test - `/chat/completions` request

  3단계의 virtual key를 사용해 `/chat/completions` request를 보냅니다.

  request가 성공하면 Langsmith project에서 log를 확인할 수 있어야 합니다.

  ```shell
  curl -i http://localhost:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-Fxq5XSyWKeXDKfPdqXZhPg" \
    -d '{
      "model": "fake-openai-endpoint",
      "messages": [
        {"role": "user", "content": "Hello, Claude"}
      ],
      "user": "hello",
    }'
  ```

</TabItem>
</Tabs>

---

이 기능 개선을 위해 [여기에서 ticket](https://github.com/BerriAI/litellm/issues)을 생성해 주세요.

### Key callback 설정 확인 `/key/health` {#checking-key-callback-configuration-keyhealth}

callback setting이 올바르게 구성되었는지 확인하려면 key와 함께 `/key/health`를 호출합니다.

request header에 key를 전달합니다.

```bash
curl -X POST "http://localhost:4000/key/health" \
  -H "Authorization: Bearer <your-key>" \
  -H "Content-Type: application/json"
```

<Tabs>
<TabItem label="key가 올바르게 구성된 경우 Response" value="Response when key is configured correctly">

logging callback이 올바르게 설정된 경우의 response:

logging callback이 올바르게 설정되어 있으면 key는 **healthy**입니다.

```json
{
  "key": "healthy",
  "logging_callbacks": {
    "callbacks": [
      "gcs_bucket"
    ],
    "status": "healthy",
    "details": "No logger exceptions triggered, system is healthy. Manually check if logs were sent to ['gcs_bucket']"
  }
}
```

</TabItem>

<TabItem label="key가 잘못 구성된 경우 Response" value="Response when key is configured incorrectly">

logging callback이 올바르게 설정되지 않은 경우의 response:

logging callback이 올바르게 설정되어 있지 않으면 key는 **unhealthy**입니다.

```json
{
  "key": "unhealthy",
  "logging_callbacks": {
    "callbacks": [
      "gcs_bucket"
    ],
    "status": "unhealthy",
    "details": "Logger exceptions triggered, system is unhealthy: Failed to load vertex credentials. Check to see if credentials containing partial/invalid information."
  }
}
```

</TabItem>
</Tabs>

### Message redaction 비활성화/활성화

prompt logging을 전역으로 비활성화한 상태에서 특정 key에만 prompt logging을 활성화할 때 사용합니다.

prompt logging(message redaction)을 전역으로 비활성화한 config.yaml 예제:
```yaml
model_list:
 - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
litellm_settings:
  callbacks: ["datadog"]
  turn_off_message_logging: True # 👈 Globally logging prompt / response is disabled
```

**key에 prompt logging 활성화**

prompt logging을 활성화할 key에서 `turn_off_message_logging`을 `false`로 설정합니다. 이 값은 전역 `turn_off_message_logging` setting을 재정의합니다.

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "logging": [{
            "callback_name": "datadog",
            "callback_vars": {
                "turn_off_message_logging": false # 👈 Enable prompt logging
            }
        }]
    }
}'
```

`/key/generate` response

```json
{
    "key_alias": null,
    "key": "sk-9v6I-jf9-eYtg_PwM8OKgQ",
    "metadata": {
        "logging": [
            {
                "callback_name": "datadog",
                "callback_vars": {
                    "turn_off_message_logging": false
                }
            }
        ]
    },
    "token_id": "a53a33db8c3cf832ceb28565dbb034f19f0acd69ee7f03b7bf6752f9f804081e"
}
```

`/chat/completions` request에 key 사용

이 key는 request에 지정된 callback으로 prompt를 log합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-9v6I-jf9-eYtg_PwM8OKgQ" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "hi my name is ishaan what key alias is this"}
    ]
  }'
```
