import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';


# ✨ 감사 로그

<Image 
  img={require('../../img/release_notes/ui_audit_log.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


Proxy Admin은 엔터티(key, team, user, model)가 생성, 업데이트, 삭제 또는 재생성되었는지와 그 시점, 그리고 작업을 수행한 사용자를 확인할 수 있습니다. 이는 감사와 컴플라이언스에 유용합니다.

LiteLLM은 다음 엔터티와 작업의 변경 사항을 추적합니다.

- **엔터티:** 키, 팀, 사용자, 모델
- **작업:** 생성, 업데이트, 삭제, 재생성

:::tip

엔터프라이즈 라이선스가 필요합니다. [여기](https://enterprise.litellm.ai/demo)로 문의하세요.

:::

## 사용법

### 1. 감사 로그 켜기
litellm config.yaml에 `store_audit_logs`를 추가한 다음 프록시를 시작합니다.
```shell
litellm_settings:
  store_audit_logs: true
```

### 2. 엔터티 변경하기

이 예제에서는 key를 삭제합니다.

```shell
curl -X POST 'http://0.0.0.0:4000/key/delete' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{
        "key": "d5265fc73296c8fea819b4525590c99beab8c707e465afdf60dab57e1fa145e4"
    }'
```

### 3. LiteLLM UI에서 감사 로그 보기

LiteLLM UI에서 로그 -> 감사 로그로 이동합니다. key 삭제에 대한 감사 로그가 표시됩니다.

<Image 
  img={require('../../img/key_delete.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


## 감사 로그를 외부 스토리지로 내보내기

감사 로그는 데이터베이스에 저장하는 것 외에도 외부 스토리지 백엔드(예: S3)로 내보낼 수 있습니다. 로그는 배치 처리되어 비동기로 업로드되므로 프록시 요청을 차단하지 않습니다.

### S3 예제

`litellm_settings`에 `audit_log_callbacks`와 `s3_callback_params`를 추가합니다.

```yaml
litellm_settings:
  store_audit_logs: true
  audit_log_callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: my-audit-logs-bucket     # AWS Bucket Name
    s3_region_name: us-west-2                # AWS Region
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: litellm-audit                   # [OPTIONAL] prefix path in the bucket
```

감사 로그는 JSON 파일로 다음 위치에 기록됩니다.

```
s3://<bucket>/audit_logs/<YYYY-MM-DD>/<HH-MM-SS>_<audit-log-id>.json
# or, when s3_path is set:
s3://<bucket>/<s3_path>/audit_logs/<YYYY-MM-DD>/<HH-MM-SS>_<audit-log-id>.json
```

:::info

`store_audit_logs: true`와 `audit_log_callbacks`를 모두 설정해야 합니다. `store_audit_logs`가 활성화되어 있지 않으면 콜백이 실행되지 않습니다.

:::

### 감사 로그를 별도 S3 버킷으로 보내기

`callbacks: ["s3_v2"]`를 통해 일반 요청/응답 로그도 S3로 보내는 경우, 기본적으로 두 스트림은 `s3_callback_params`를 공유하고 같은 버킷에 저장됩니다. 감사 로그를 다른 버킷(예: 더 엄격한 접근 제어 또는 더 긴 보존 기간이 적용되는 컴플라이언스 전용 버킷)으로 보내려면 `s3_audit_callback_params` 블록을 추가합니다. 이 블록은 `s3_callback_params`와 동일한 필드를 받으며 감사 로그에만 적용됩니다.

```yaml
litellm_settings:
  store_audit_logs: true
  callbacks: ["s3_v2"]                       # normal request logs
  audit_log_callbacks: ["s3_v2"]             # audit logs

  s3_callback_params:                        # used for normal logs
    s3_bucket_name: my-llm-logs-bucket
    s3_region_name: us-west-2
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: litellm-logs

  s3_audit_callback_params:                  # used for audit logs only
    s3_bucket_name: my-audit-logs-bucket
    s3_region_name: us-east-1                # different region OK
    s3_aws_access_key_id: os.environ/AWS_AUDIT_ACCESS_KEY_ID  # different creds OK
    s3_aws_secret_access_key: os.environ/AWS_AUDIT_SECRET_ACCESS_KEY
    s3_path: litellm-audit
```

## 고급

### 관리 작업 변경 사항을 사용자에게 귀속하기

사용자를 대신해 관리 엔드포인트를 호출합니다. 프록시를 개발 플랫폼에 연결할 때 유용합니다.

## 1. 요청 헤더에 `LiteLLM-Changed-By` 설정하기

관리 엔드포인트를 호출할 때 요청 헤더에 'user_id'를 설정합니다. [전체 목록 보기](https://litellm-api.up.railway.app/#/team%20management).

- 마스터 키로 팀 예산을 업데이트합니다.
- 변경 사항을 'krrish@berri.ai'에게 귀속합니다.

**👉 주요 변경 사항:** `-H 'LiteLLM-Changed-By: krrish@berri.ai'` 전달

```shell
curl -X POST 'http://0.0.0.0:4000/team/update' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'LiteLLM-Changed-By: krrish@berri.ai' \
    -H 'Content-Type: application/json' \
    -d '{
        "team_id" : "8bf18b11-7f52-4717-8e1f-7c65f9d01e52",
        "max_budget": 2000
    }'
```

## 2. 생성된 감사 로그

```bash
{
   "id": "bd136c28-edd0-4cb6-b963-f35464cf6f5a",
   "updated_at": "2024-06-08 23:41:14.793",
   "changed_by": "krrish@berri.ai", # 👈 CHANGED BY
   "changed_by_api_key": "example-api-key-123",
   "action": "updated",
   "table_name": "LiteLLM_TeamTable",
   "object_id": "8bf18b11-7f52-4717-8e1f-7c65f9d01e52",
   "before_value": {
     "spend": 0,
     "max_budget": 0,
   },
   "updated_values": {
     "team_id": "8bf18b11-7f52-4717-8e1f-7c65f9d01e52",
     "max_budget": 2000 # 👈 CHANGED TO
   },
 }
```

## 감사 로그 API 사양


### `id`
- **타입:** `String`
- **설명:** 각 감사 로그 항목의 고유 식별자입니다. 기본적으로 UUID(범용 고유 식별자)로 자동 생성됩니다.

### `updated_at`
- **타입:** `DateTime`
- **설명:** 감사 로그 항목이 생성되거나 업데이트된 시점의 타임스탬프를 저장하는 필드입니다. 기본적으로 현재 날짜와 시간으로 자동 설정됩니다.

### `changed_by`
- **타입:** `String`
- **설명:** 감사 대상 작업을 수행한 `user_id`입니다. `LiteLLM-Changed-By` 헤더가 전달되면 `changed_by=<LiteLLM-Changed-By 헤더로 전달된 값>`이 됩니다.

### `changed_by_api_key`
- **타입:** `String`
- **설명:** 감사 대상 작업을 수행하는 데 사용된 해시된 API key를 저장하는 필드입니다. 비워 두면 기본값은 빈 문자열입니다.

### `action`
- **타입:** `String`
- **설명:** 수행된 작업의 유형입니다. "create", "update", "delete" 중 하나입니다.

### `table_name`
- **타입:** `String`
- **설명:** 감사 대상 작업의 영향을 받은 테이블 이름을 저장하는 필드입니다. 다음 값 중 하나일 수 있습니다. `LiteLLM_TeamTable`, `LiteLLM_UserTable`, `LiteLLM_VerificationToken`


### `object_id`
- **타입:** `String`
- **설명:** 감사 대상 작업의 영향을 받은 객체의 ID를 저장하는 필드입니다. key ID, team ID, user ID일 수 있습니다.

### `before_value`
- **타입:** `Json?`
- **설명:** 감사 대상 작업이 수행되기 전 행 값을 저장하는 필드입니다. 선택 사항이며 null일 수 있습니다.

### `updated_values`
- **타입:** `Json?`
- **설명:** 감사 대상 작업이 수행된 후 업데이트된 행 값을 저장하는 필드입니다.
