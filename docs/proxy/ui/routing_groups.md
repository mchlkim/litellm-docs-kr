import Image from '@theme/IdealImage';

# Routing Group 관리

Routing group을 사용하면 같은 router 안에서도 모델별로 다른 routing strategy를 적용할 수 있습니다. 예를 들어 `gpt-4o`에는 latency-based routing을 사용하고, 더 저렴한 모델에는 simple-shuffle을 사용할 수 있습니다. `proxy_config.yaml`을 직접 수정하지 않고 LiteLLM dashboard에서 관리할 수 있습니다.

개념 설명과 전체 strategy reference는 [Routing Groups - Per-Model Strategies](../../routing.md#routing-groups---per-model-strategies)를 참고하세요.

> 아래 스크린샷을 클릭하면 전체 Scribe walkthrough를 열 수 있습니다.

## UI에서 설정

### Routing Group 설정

사이드바에서 **General Settings**로 이동한 뒤 **Routing Groups** 섹션을 선택합니다.

[![Routing Groups 설정 열기](../../../static/img/routing-groups/access-rg-settings.png)](https://scribehow.com/viewer/Accessing_Routing_Groups_in_Settings__hxNoFOtLQeSfOvcLYgzXzA)

### Routing Group 생성

**Add Routing Group**을 클릭한 뒤 다음 값을 입력합니다.

- **Group name** — 고유 식별자입니다(예: `anthropic-latency`). `default` 이름은 예약되어 있습니다.
- **모델** — 모델 목록에 있는 하나 이상의 `model_name`입니다. 각 모델은 최대 하나의 group에만 속할 수 있습니다.
- **Routing strategy** — 이 group에 적용할 strategy입니다(예: `latency-based-routing`, `usage-based-routing-v2`, `simple-shuffle`).
- **Routing strategy args** *(선택 사항)* — `ttl`, `rpm`, `tpm` 같은 strategy별 override입니다.

**Save**를 클릭해 group을 생성합니다.

[![Routing group 생성](../../../static/img/routing-groups/create-rg.png)](https://scribehow.com/viewer/Create_a_New_Latency_Based_Routing_Group__y3EoV7U7QOaNdR1YrD-03w)

### Routing Group 수정

테이블에서 group 행을 클릭해 연 뒤 필요한 필드를 수정합니다. 예를 들어 **Routing strategy args**의 `ttl`을 바꾸면 strategy가 latency 변화에 얼마나 빠르게 반응할지 조정할 수 있습니다. 적용하려면 **Save**를 클릭합니다.

[![Routing group 수정](../../../static/img/routing-groups/update-rg.png)](https://scribehow.com/viewer/How_To_Configure_Strategy_Arguments_In_Router_Settings__u98H3SRAQKK-qHOa1Tbx9g)

### Routing Group 삭제

Group 행의 **Delete** 동작을 클릭하고 확인합니다. 삭제된 group에 있던 모델은 즉시 기본 routing strategy로 fallback합니다.

[![Routing group 삭제](../../../static/img/routing-groups/delete-rg.png)](https://scribehow.com/viewer/How_To_Delete_A_Router_Setting__O96ij__rQj6QjOurwOqSFA)

## `proxy_config.yaml`에서 설정

Proxy 구성 파일에서도 routing group을 정의할 수 있습니다. UI에서 구성한 설정은 저장되며 여기에서 정의한 값을 override합니다.

```yaml
router_settings:
  # 명시적 group에 속하지 않은 모델의 fallback strategy
  routing_strategy: simple-shuffle

  routing_groups:
    - group_name: anthropic-latency
      models: [claude-sonnet, claude-opus]
      routing_strategy: latency-based-routing
      routing_strategy_args:
        ttl: 3600
```

전체 schema, multi-group 예제, runtime update 동작은 [Routing Groups - Per-Model Strategies](../../routing.md#routing-groups---per-model-strategies)를 참고하세요.

## 요청 테스트

Group을 구성한 뒤, group에 속한 모델로 들어오는 요청이 실제로 해당 group의 strategy에 따라 routing되는지 확인합니다. LiteLLM은 모든 요청마다 선택된 `routing_group`, `model`, `strategy`를 log로 남기므로, 요청을 보낸 뒤 proxy log를 확인하면 됩니다.

### 1. 요청 전송

Routing group에 포함된 `model_name`으로 요청을 보냅니다.

```bash
curl -X POST 'http://localhost:4000/v1/chat/completions' \
  -H 'Authorization: Bearer <your-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "claude-sonnet",
    "messages": [{"role": "user", "content": "ping"}]
  }'
```

![요청 전송](../../../static/img/routing-groups/model-request.png)

### 2. Proxy log 확인

각 요청은 `routing_group=<name> model=<model> strategy=<strategy>`가 포함된 log line을 남깁니다.

**Plain logs** — proxy stdout을 직접 grep합니다.

```bash
kubectl logs -n litellm -l app=litellm --tail=200 | grep routing_group=
```

**Loki (LogQL)** — 필드를 추출하고 보기 좋게 다시 포맷합니다.

```logql
{namespace="litellm", pod=~"<your-litellm-pod-regex>"} |= "routing_group="
| regexp `routing_group=(?P<routing_group>\S+) model=(?P<model>\S+) strategy=(?P<strategy>\S+)`
| line_format `{{.routing_group}} {{.model}} {{.strategy}}`
```

![Log에서 routing group 확인](../../../static/img/routing-groups/verify-rg.png)

`anthropic-latency claude-sonnet latency-based-routing` 같은 행이 보이면 요청이 예상한 group에 도달한 것입니다. 대신 `default <strategy>`가 보이면 해당 모델이 group에 포함되지 않은 상태이므로 group의 **모델** 목록을 확인하세요.

## 참고

- 각 `model_name`은 **최대 하나의** routing group에만 속할 수 있습니다. 중복은 거부됩니다.
- Group 이름 `default`는 암시적 fallback group용으로 예약되어 있습니다.
- 업데이트는 즉시 적용됩니다. 저장 시 group별 상태가 다시 생성됩니다.
