import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { ControlPlaneArchitecture } from '@site/src/components/ControlPlaneArchitecture';

# [BETA] 고가용성 Control Plane

각각 자체 database, Redis, master key를 가진 여러 독립 LiteLLM proxy instance를 하나의 LiteLLM UI에서 관리합니다.

:::info

This is an 엔터프라이즈 feature.

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[무료 7일 trial key 받기](https://www.litellm.ai/enterprise#trial)

:::

## 이 아키텍처를 사용하는 이유

[standard multi-region setup](./control_plane_and_data_plane.md)에서는 모든 instance가 하나의 database와 master key를 공유합니다. 이 방식은 동작하지만 shared dependency가 생깁니다. database가 중단되면 모든 instance가 영향을 받습니다.

**High Availability Control Plane**은 다른 접근 방식을 사용합니다.

| | 공유 Database (표준) | 고가용성 Control Plane |
|---|---|---|
| **Database** | 모든 instance가 하나의 shared DB 사용 | 각 instance가 자체 DB 사용 |
| **Redis** | shared Redis | 각 instance가 자체 Redis 사용 |
| **Master Key** | 모든 instance가 같은 key 사용 | 각 instance가 자체 key 사용 |
| **Failure isolation** | DB outage가 모든 instance에 영향 | failure가 하나의 instance로 격리 |
| **User management** | 중앙 집중식, user table 1개 | 독립적, 각 worker가 자체 user 관리 |
| **UI** | admin instance마다 UI 1개 | 하나의 control plane UI가 모든 worker 관리 |

### 장점

- **진정한 high availability**: shared infrastructure가 없으므로 단일 장애 지점이 없습니다.
- **Blast radius 제한**: 한 worker의 misconfiguration 또는 outage가 다른 worker에 영향을 주지 않습니다.
- **Regional isolation**: data residency requirement에 따라 worker를 서로 다른 region에서 실행할 수 있습니다.
- **더 단순한 운영**: 각 worker는 self-contained LiteLLM deployment입니다.

## 아키텍처

<ControlPlaneArchitecture />

**control plane**은 admin UI를 제공하고 모든 worker 정보를 알고 있는 LiteLLM instance입니다. **router가 아닙니다**. LLM request를 proxy하거나 route하지 않습니다. admin이 하나의 UI에서 worker를 전환하고 관리할 수 있게 하는 용도로만 존재합니다.

각 **worker**는 해당 region 또는 team의 LLM request를 처리하는 완전히 독립적인 LiteLLM proxy입니다. worker는 자체 database, Redis, users, keys, teams, budgets를 가집니다. worker 간에는 infrastructure를 공유하지 않습니다.

## 설정

### 1. Control Plane 설정

control plane에는 모든 worker instance를 나열하는 `worker_registry`가 필요합니다.

```yaml title="cp_config.yaml"
model_list: []

general_settings:
  master_key: sk-1234
  database_url: os.environ/DATABASE_URL

worker_registry:
  - worker_id: "worker-a"
    name: "Worker A"
    url: "http://localhost:4001"
  - worker_id: "worker-b"
    name: "Worker B"
    url: "http://localhost:4002"
```

control plane을 시작합니다.

```bash
litellm --config cp_config.yaml --port 4000
```

### 2. Worker 설정

각 worker는 control plane UI에서 cross-origin authentication을 활성화하기 위해 `general_settings`에 `control_plane_url`이 필요합니다.

SSO callback redirect가 올바르게 resolve되도록 각 worker에 `PROXY_BASE_URL`도 설정해야 합니다.

<Tabs>
<TabItem value="worker-a" label="Worker A">

```yaml title="worker_a_config.yaml"
model_list: []

general_settings:
  master_key: sk-worker-a-1234
  database_url: os.environ/WORKER_A_DATABASE_URL
  control_plane_url: "http://localhost:4000"
```

```bash
PROXY_BASE_URL=http://localhost:4001 litellm --config worker_a_config.yaml --port 4001
```

</TabItem>
<TabItem value="worker-b" label="Worker B">

```yaml title="worker_b_config.yaml"
model_list: []

general_settings:
  master_key: sk-worker-b-1234
  database_url: os.environ/WORKER_B_DATABASE_URL
  control_plane_url: "http://localhost:4000"
```

```bash
PROXY_BASE_URL=http://localhost:4002 litellm --config worker_b_config.yaml --port 4002
```

</TabItem>
</Tabs>

:::important
각 worker는 자체 `master_key`와 `database_url`을 가져야 합니다. 이 아키텍처의 핵심은 worker가 독립적이라는 점입니다.
:::

### 3. SSO 설정 (선택 사항)

SSO는 표준 LiteLLM proxy와 같은 방식으로 **control plane** instance에 설정합니다. 전체 절차는 [SSO 설정 가이드](./admin_ui_sso.md)를 참고하세요.

SSO를 사용하는 경우 SSO provider dashboard에서 각 worker URL과 control plane URL을 allowed callback URL로 등록해야 합니다.

## 동작 방식

### Login Flow

1. 사용자가 control plane UI(`http://localhost:4000/ui`)에 접속합니다.
2. login page는 등록된 모든 worker를 나열하는 **worker selector** dropdown을 표시합니다.
3. 사용자가 worker(예: "Worker A")를 선택하고 username/password 또는 SSO로 login합니다.
4. UI는 `/v3/login` endpoint를 사용해 **선택한 worker**에 인증합니다.
5. 성공하면 UI가 worker의 JWT를 저장하고 이후 모든 API call을 해당 worker로 보냅니다.
6. 이제 사용자는 control plane UI 하나에서 해당 worker의 keys, teams, models, budgets를 관리할 수 있습니다.

### Worker 전환

login 후 사용자는 UI를 떠나지 않고 **navbar dropdown**에서 worker를 전환할 수 있습니다. 전환하면 새 worker에 인증하기 위해 login page로 redirect됩니다.

### Discovery

control plane은 UI가 load 시 읽는 `/.well-known/litellm-ui-config` endpoint를 노출합니다. 이 endpoint는 다음을 반환합니다.
- `is_control_plane: true`
- worker ID, name, URL 목록

login page는 이 정보를 통해 worker selector를 표시해야 함을 알 수 있습니다.

## Local Testing

로컬에서 테스트하려면 각 instance를 별도 terminal에서 시작합니다.

```bash
# Terminal 1: Control Plane
litellm --config cp_config.yaml --port 4000

# Terminal 2: Worker A
PROXY_BASE_URL=http://localhost:4001 litellm --config worker_a_config.yaml --port 4001

# Terminal 3: Worker B
PROXY_BASE_URL=http://localhost:4002 litellm --config worker_b_config.yaml --port 4002
```

그 다음 `http://localhost:4000/ui`를 엽니다. login page에 worker selector가 표시되어야 합니다.

## 설정 Reference

### Control Plane 설정

| Field | Location | 설명 |
|---|---|---|
| `worker_registry` | Top-level config | worker instance 목록 |
| `worker_registry[].worker_id` | Required | worker의 unique identifier |
| `worker_registry[].name` | Required | UI에 표시되는 display name |
| `worker_registry[].url` | Required | worker instance의 full URL |

### Worker Settings

| Field | Location | 설명 |
|---|---|---|
| `general_settings.control_plane_url` | Required | control plane instance URL입니다. 이 worker에서 `/v3/login` 및 `/v3/login/exchange` endpoint를 활성화합니다. |
| `PROXY_BASE_URL` | Environment variable | worker 자체 external URL입니다. SSO callback redirect에 필요합니다. |

## 관련 문서

- [Standard Multi-Region Setup](./control_plane_and_data_plane.md) - admin/worker split을 위한 shared-database architecture
- [SSO Setup](./admin_ui_sso.md) - admin UI용 SSO 설정
- [Production Deployment](./prod.md) - production 운영 모범 사례
