import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 모델 액세스 제한 {#restrict-model-access}

## **Virtual Key로 모델 제한** {#restrict-models-by-virtual-key}

`models` 매개변수를 사용해 키에 허용할 모델을 설정합니다.


```shell
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["gpt-3.5-turbo", "gpt-4"]}'
```

:::info

이 키는 `gpt-3.5-turbo` 또는 `gpt-4`인 `models`에만 요청할 수 있습니다.

:::

다음으로 올바르게 설정되었는지 확인합니다.

<Tabs>
<TabItem label="허용된 액세스" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>

<TabItem label="허용되지 않은 액세스" value = "not-allowed">

:::info

생성된 키의 `models`에 gpt-4o가 없으므로 이 요청은 실패해야 합니다.

:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>

</Tabs>


### [API 참고 문서](https://litellm-api.up.railway.app/#/key%20management/generate_key_fn_key_generate_post)

## **`team_id`로 모델 제한** {#restrict-models-by-team_id}
`litellm-dev`는 `azure-gpt-3.5`에만 액세스할 수 있습니다.

**1. `/team/new`를 통해 팀 생성**
```shell
curl --location 'http://localhost:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_alias": "litellm-dev",
  "models": ["azure-gpt-3.5"]
}' 

# returns {...,"team_id": "my-unique-id"}
```

**2. 팀용 키 생성**
```shell
curl --location 'http://localhost:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data-raw '{"team_id": "my-unique-id"}'
```

**3. 테스트**
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-qo992IjKOC2CHKZGRoJIGA' \
    --data '{
        "model": "BEDROCK_GROUP",
        "messages": [
            {
                "role": "user",
                "content": "hi"
            }
        ]
    }'
```

```shell
{"error":{"message":"Invalid model for team litellm-dev: BEDROCK_GROUP.  Valid models for team are: ['azure-gpt-3.5']\n\n\nTraceback (most recent call last):\n  File \"/Users/ishaanjaffer/Github/litellm/litellm/proxy/proxy_server.py\", line 2298, in chat_completion\n    _is_valid_team_configs(\n  File \"/Users/ishaanjaffer/Github/litellm/litellm/proxy/utils.py\", line 1296, in _is_valid_team_configs\n    raise Exception(\nException: Invalid model for team litellm-dev: BEDROCK_GROUP.  Valid models for team are: ['azure-gpt-3.5']\n\n","type":"None","param":"None","code":500}}%            
```         

### [API 참고 문서](https://litellm-api.up.railway.app/#/team%20management/new_team_team_new_post)


## **사용 가능한 Fallback 모델 조회** {#view-available-fallback-models}

`/v1/models` 엔드포인트를 사용해 특정 모델에 사용할 수 있는 fallback 모델을 확인합니다. 기본 모델을 사용할 수 없거나 제한된 경우 어떤 백업 모델을 사용할 수 있는지 파악하는 데 도움이 됩니다.

:::info 확장 지점

`include_metadata` 매개변수는 앞으로 추가 모델 메타데이터를 노출하기 위한 확장 지점 역할을 합니다. 현재는 fallback 모델에 중점을 두고 있지만, 이 접근 방식은 가격 정보, 기능, 속도 제한 등 다른 모델 메타데이터까지 포함하도록 확장될 예정입니다.

:::

### 기본 사용법 {#basic-usage}

사용 가능한 모든 모델을 가져옵니다.

```shell
curl -X GET 'http://localhost:4000/v1/models' \
  -H 'Authorization: Bearer <your-api-key>'
```

### 메타데이터와 함께 Fallback 모델 가져오기 {#get-fallback-models-with-metadata}

fallback 모델 정보를 보려면 메타데이터를 포함합니다.

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true' \
  -H 'Authorization: Bearer <your-api-key>'
```

### 특정 Fallback 유형 가져오기 {#get-specific-fallback-types}

확인하려는 fallback 유형을 지정할 수 있습니다.

<Tabs>
<TabItem value="general" label="일반 Fallback">

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true&fallback_type=general' \
  -H 'Authorization: Bearer <your-api-key>'
```

general fallback은 같은 유형의 요청을 처리할 수 있는 대체 모델입니다.

</TabItem>

<TabItem value="context_window" label="컨텍스트 창 Fallback">

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true&fallback_type=context_window' \
  -H 'Authorization: Bearer <your-api-key>'
```

context window fallback은 기본 모델의 컨텍스트 제한을 초과했을 때 요청을 처리할 수 있는 더 큰 컨텍스트 창을 가진 모델입니다.

</TabItem>

<TabItem value="content_policy" label="콘텐츠 정책 Fallback">

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true&fallback_type=content_policy' \
  -H 'Authorization: Bearer <your-api-key>'
```

content policy fallback은 기본 모델이 안전 정책으로 인해 콘텐츠를 거부할 때 요청을 처리할 수 있는 모델입니다.

</TabItem>

</Tabs>

### 예제 응답 {#example-response}

`include_metadata=true`를 지정하면 응답에 fallback 정보가 포함됩니다.

```json
{
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai",
      "fallbacks": {
        "general": ["gpt-3.5-turbo", "claude-3-sonnet"],
        "context_window": ["gpt-4-turbo", "claude-3-opus"],
        "content_policy": ["claude-3-haiku"]
      }
    }
  ]
}
```

### 사용 사례 {#use-cases}

- **고가용성**: 서비스 연속성을 보장하기 위해 백업 모델을 식별합니다.
- **비용 최적화**: 기본 모델이 비쌀 때 더 저렴한 대체 모델을 찾습니다.
- **콘텐츠 필터링**: 서로 다른 콘텐츠 정책을 가진 모델을 확인합니다.
- **컨텍스트 길이**: 더 큰 입력을 처리할 수 있는 모델을 찾습니다.
- **부하 분산**: 호환되는 여러 모델에 요청을 분산합니다.

### API 매개변수 {#api-parameters}

| 매개변수 | 유형 | 설명 |
|-----------|------|-------------|
| `include_metadata` | boolean | fallback을 포함한 추가 모델 메타데이터를 포함합니다. |
| `fallback_type` | string | `general`, `context_window` 또는 `content_policy` 유형으로 fallback을 필터링합니다. |

## 고급: Model Access Groups {#advanced-model-access-groups}

고급 사용 사례에서는 [Model Access Groups](./model_access_groups)를 사용해 프록시를 다시 시작하지 않고 여러 모델을 동적으로 그룹화하고 액세스를 관리합니다.

## [역할 기반 접근 제어(RBAC)](./jwt_auth_arch) {#role-based-access-control-rbac}
