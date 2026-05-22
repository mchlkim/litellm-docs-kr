import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 서비스 계정 {#service-accounts}

특정 사용자가 소유하지 않고 프로덕션 프로젝트용으로 생성되는 가상 키를 만들고 싶을 때 사용하세요.

서비스 계정 키를 사용하는 이유는 무엇인가요?
  - 사용자가 삭제될 때 키가 함께 삭제되지 않도록 방지합니다.
  - 키에 팀 멤버 한도가 아니라 팀 한도를 적용합니다.

## 서비스 계정 키와 일반 키 비교 {#service-account-vs-regular-keys}

| 기능 | 일반 키 | 서비스 계정 키 |
|---------|------------|-------------------|
| `user_id` | 선택 사항 | 항상 `null` |
| `team_id` | 선택 사항 | 필수 |
| 적용되는 한도 | 사용자 + 팀 한도 | 팀 한도만 |
| 사용자가 삭제될 때 키도 삭제되나요? | 예 | 아니요 — 유지됨 |
| `metadata`의 `service_account_id` | 설정되지 않음 | 한 번 설정되면 변경 불가 |
| `team_member_key_duration` | 상속함 | 상속하지 않음 |

## 예산 및 한도 {#budgets--limits}

서비스 계정 키는 사용자별 또는 키 멤버별이 아니라 **팀 수준**에서 예산과 요청 속도 제한을 적용합니다.

- 키 자체에 `max_budget`, `tpm_limit`, `rpm_limit`을 설정하거나 팀에서 상속받으세요.
- 팀 멤버 키가 유지되는 기간을 제어하는 엔터프라이즈 기능인 `team_member_key_duration`은 서비스 계정 키에 적용되지 않습니다.

## 사용법

서비스 계정 키를 생성하려면 `/key/service-account/generate` 엔드포인트를 사용하세요.


```bash
curl -L -X POST 'http://localhost:4000/key/service-account/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "my-unique-team"
}'
```

### `service_account_id` 필드 {#service_account_id-field}

키에 안정적이고 사람이 읽을 수 있는 식별자를 부여하려면 선택적으로 `metadata` 안에 `service_account_id`를 제공할 수 있습니다.

```bash
curl -L -X POST 'http://localhost:4000/key/service-account/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "my-unique-team",
    "metadata": {
        "service_account_id": "my-ci-pipeline"
    }
}'
```

**불변성 규칙** — `service_account_id`가 한 번 설정되면 변경할 수 없습니다.

| 작업 | 결과 |
|-----------|--------|
| 다른 값으로 덮어쓰기 | `400` 오류 |
| 명시적으로 `null`로 설정 | `400` 오류 |
| `metadata: null` 전송(값을 지우게 됨) | `400` 오류 |
| 업데이트 시 `metadata` 전체 생략 | 안전함 — 기존 값이 보존됨 |
| 같은 값 다시 전송 | 허용됨(동작 없음) |

## 예제 - 모든 서비스 계정 요청에 `user` 파라미터 요구 {#example---require-user-param-for-all-service-account-requests}


### 1. 서비스 계정 설정 구성 {#1-set-settings-for-service-accounts}

서비스 계정 키에만 적용되는 설정을 만들려면 `service_account_settings`를 설정하세요.

```yaml
general_settings:
    service_account_settings: 
        enforced_params: ["user"] # this means the "user" param is enforced for all requests made through any service account keys
```

### 2. LiteLLM Proxy 관리자 UI에서 서비스 계정 키 생성 {#2-create-service-account-key-on-litellm-proxy-admin-ui}

<Image img={require('../../img/create_service_account.png')} />

### 3. 서비스 계정 키 테스트 {#3-test-service-account-key}

<Tabs>

<TabItem value="Unsuccessful call" label="실패한 호출">


```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer <sk-your-service-account>' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "hello"
        }
    ]
}'
```

예상 응답

```json
{
  "error": {
    "message": "BadRequest please pass param=user in request body. This is a required param for service account",
    "type": "bad_request_error",
    "param": "user",
    "code": "400"
  }
}
```

</TabItem>

<TabItem value="Successful call" label="성공한 호출">


```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer <sk-your-service-account>' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "hello"
        }
    ],
    "user": "test-user"
}'
```

예상 응답

```json
{
  "id": "chatcmpl-ad9595c7e3784a6783b469218d92d95c",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "\n\nHello there, how may I assist you today?",
        "role": "assistant",
        "tool_calls": null,
        "function_call": null
      }
    }
  ],
  "created": 1677652288,
  "model": "gpt-3.5-turbo-0125",
  "object": "chat.completion",
  "system_fingerprint": "fp_44709d6fcb",
  "usage": {
    "completion_tokens": 12,
    "prompt_tokens": 9,
    "total_tokens": 21,
    "completion_tokens_details": null
  },
  "service_tier": null
}
```

</TabItem>

</Tabs>
