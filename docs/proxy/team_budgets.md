import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 팀 예산 설정


# 사전 요구 사항

- Postgres 데이터베이스를 설정해야 합니다(예: Supabase, Neon 등).


## 자동 생성된 JWT 팀의 기본 예산

`team_id_upsert: true`와 함께 JWT 인증을 사용하면 새로 생성되는 팀에 기본 예산을 자동으로 할당할 수 있습니다.

이는 `config.yaml`의 `default_team_settings`에서 설정합니다.

**예제:**
```yaml
# in your config.yaml

litellm_jwtauth:
  team_id_upsert: true
  team_id_jwt_field: "team_id"
  # ... other jwt settings

litellm_settings:
  default_team_settings: 
    - team_id: "default-settings"
      max_budget: 100.0
```
Internal Team의 지출을 추적하고 예산을 설정합니다.


## 월별 팀 예산 설정

### 1. 팀 생성
- `max_budget=000000001` 설정(팀이 사용할 수 있는 달러 금액)
- `budget_duration="1d"` 설정(예산이 갱신되는 빈도)

<Tabs>

<TabItem value="API" label="API">

새 팀을 만들고 `max_budget`과 `budget_duration`을 설정합니다.
```shell
curl -X POST 'http://0.0.0.0:4000/team/new' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
            "team_alias": "QA Prod Bot", 
            "max_budget": 0.000000001, 
            "budget_duration": "1d"
        }' 
```

응답
```shell
{
 "team_alias": "QA Prod Bot",
 "team_id": "de35b29e-6ca8-4f47-b804-2b79d07aa99a",
 "max_budget": 0.0001,
 "budget_duration": "1d",
 "budget_reset_at": "2024-06-14T22:48:36.594000Z"
}  
```
</TabItem>

<TabItem value="UI" label="관리자 UI">
<Image img={require('../../img/create_team_gif_good.gif')} />

</TabItem>


</Tabs>

`budget_duration`에 사용할 수 있는 값

| `budget_duration` | 예산이 reset되는 시점 |
| --- | --- |
| `budget_duration="1s"` | 1초마다 |
| `budget_duration="1m"` | 1분마다 |
| `budget_duration="1h"` | 1시간마다 |
| `budget_duration="1d"` | 1일마다 |
| `budget_duration="30d"` | 1개월마다 |


### 2. `team`용 키 생성

1단계에서 만든 Team=`QA Prod Bot` 및 `team_id="de35b29e-6ca8-4f47-b804-2b79d07aa99a"`에 대한 키를 생성합니다.

<Tabs>

<TabItem value="api" label="API">

💡 **Team="QA Prod Bot"의 예산이 이 팀에 적용됩니다.**

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{"team_id": "de35b29e-6ca8-4f47-b804-2b79d07aa99a"}'
```

응답

```shell
{"team_id":"de35b29e-6ca8-4f47-b804-2b79d07aa99a", "key":"sk-5qtncoYjzRcxMM4bDRktNQ"}
```
</TabItem>

<TabItem value="UI" label="관리자 UI">
<Image img={require('../../img/create_key_in_team.gif')} />
</TabItem>

</Tabs>

### 3. 테스트

2단계에서 만든 키를 사용해 이 요청을 두 번 실행합니다.
<Tabs>

<TabItem value="api" label="API">

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H 'Authorization: Bearer sk-mso-JSykEGri86KyOvgxBw' \
     -H 'Content-Type: application/json' \
     -d ' {
           "model": "llama3",
           "messages": [
             {
               "role": "user",
               "content": "hi"
             }
           ]
         }'
```

두 번째 응답에서는 다음 예외가 표시되어야 합니다.

```shell
{
 "error": {
   "message": "Budget has been exceeded! Current cost: 3.5e-06, Max budget: 1e-09",
   "type": "auth_error",
   "param": null,
   "code": 400
 }
}
```

</TabItem>

<TabItem value="UI" label="관리자 UI">
<Image img={require('../../img/test_key_budget.gif')} />
</TabItem>
</Tabs>

## 고급

### `remaining_budget`용 Prometheus metric

[Prometheus metric에 대한 자세한 정보 보기](https://docs.litellm.ai/docs/proxy/prometheus)

Proxy `config.yaml`에 다음 설정이 필요합니다.

```yaml
litellm_settings:
  success_callback: ["prometheus"]
  failure_callback: ["prometheus"]
```

팀의 remaining budget을 추적하려면 Prometheus에서 다음 metric을 확인할 수 있어야 합니다.

```shell
litellm_remaining_team_budget_metric{team_alias="QA Prod Bot",team_id="de35b29e-6ca8-4f47-b804-2b79d07aa99a"} 9.699999999999992e-06
```

## 함께 보기

- [팀별 모델 단위 TPM/RPM](./users.md#per-team-model) - 팀의 모든 키에 모델별 rate limit을 설정합니다.
