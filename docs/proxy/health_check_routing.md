# Health Check 기반 라우팅

사용자가 오류를 만나기 전에 비정상 deployment로 향하는 트래픽을 우회합니다. 백그라운드 health check는 설정 가능한 주기로 실행되며, 실패한 deployment는 사용자 요청이 이미 실패한 뒤가 아니라 사전에 라우팅 풀에서 제거됩니다.


## 아키텍처

<svg viewBox="0 0 860 600" xmlns="http://www.w3.org/2000/svg" style={{maxWidth: '100%', fontFamily: 'system-ui, sans-serif'}}>
  {/* Background */}
  <rect width="860" height="600" fill="#f8fafc" rx="12"/>

  {/* LEFT PANEL: Background health check loop */}
  <rect x="20" y="20" width="240" height="560" fill="#eff6ff" rx="10" stroke="#bfdbfe" strokeWidth="1.5"/>
  <text x="140" y="48" textAnchor="middle" fill="#1d4ed8" fontSize="13" fontWeight="600">백그라운드 루프</text>
  <text x="140" y="64" textAnchor="middle" fill="#3b82f6" fontSize="11">health_check_interval초마다</text>

  {/* Deployment A */}
  <rect x="40" y="82" width="200" height="50" fill="white" rx="8" stroke="#93c5fd" strokeWidth="1.5"/>
  <text x="140" y="102" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="500">Deployment A</text>
  <text x="140" y="120" textAnchor="middle" fill="#64748b" fontSize="11">ahealth_check() → 200 ✓</text>

  {/* Deployment B */}
  <rect x="40" y="148" width="200" height="50" fill="white" rx="8" stroke="#fca5a5" strokeWidth="1.5"/>
  <text x="140" y="168" textAnchor="middle" fill="#991b1b" fontSize="12" fontWeight="500">Deployment B</text>
  <text x="140" y="186" textAnchor="middle" fill="#64748b" fontSize="11">ahealth_check() → 401 ✗</text>

  {/* Deployment C */}
  <rect x="40" y="214" width="200" height="50" fill="white" rx="8" stroke="#fde68a" strokeWidth="1.5"/>
  <text x="140" y="234" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="500">Deployment C</text>
  <text x="140" y="252" textAnchor="middle" fill="#64748b" fontSize="11">ahealth_check() → 429 ⚡</text>

  {/* ignore_transient box */}
  <rect x="40" y="282" width="200" height="68" fill="#fefce8" rx="8" stroke="#fde047" strokeWidth="1.5"/>
  <text x="140" y="302" textAnchor="middle" fill="#713f12" fontSize="11" fontWeight="600">ignore_transient_errors: true</text>
  <text x="140" y="320" textAnchor="middle" fill="#92400e" fontSize="11">429 / 408 → ignored</text>
  <text x="140" y="338" textAnchor="middle" fill="#92400e" fontSize="11">캐시에 기록하지 않음</text>

  {/* allowed_fails_policy box */}
  <rect x="40" y="368" width="200" height="84" fill="#f0fdf4" rx="8" stroke="#86efac" strokeWidth="1.5"/>
  <text x="140" y="388" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="600">allowed_fails_policy</text>
  <text x="140" y="406" textAnchor="middle" fill="#15803d" fontSize="11">401 → counter 증가</text>
  <text x="140" y="424" textAnchor="middle" fill="#15803d" fontSize="11">counter &gt; threshold</text>
  <text x="140" y="442" textAnchor="middle" fill="#15803d" fontSize="11">→ cooldown 발생</text>

  {/* CENTER PANEL: Shared State */}
  <rect x="300" y="20" width="220" height="560" fill="#f5f3ff" rx="10" stroke="#c4b5fd" strokeWidth="1.5"/>
  <text x="410" y="48" textAnchor="middle" fill="#6d28d9" fontSize="13" fontWeight="600">공유 상태</text>

  {/* Health State Cache */}
  <rect x="320" y="62" width="180" height="116" fill="white" rx="8" stroke="#a78bfa" strokeWidth="1.5"/>
  <text x="410" y="84" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="600">DeploymentHealthCache</text>
  <text x="410" y="104" textAnchor="middle" fill="#64748b" fontSize="11">A → healthy ✓</text>
  <text x="410" y="122" textAnchor="middle" fill="#64748b" fontSize="11">B → unhealthy ✗</text>
  <text x="410" y="140" textAnchor="middle" fill="#64748b" fontSize="11">C → 기록 안 함(무시됨)</text>
  <text x="410" y="164" textAnchor="middle" fill="#94a3b8" fontSize="10">TTL: staleness_threshold × 1.5</text>

  {/* Cooldown Cache */}
  <rect x="320" y="196" width="180" height="104" fill="white" rx="8" stroke="#a78bfa" strokeWidth="1.5"/>
  <text x="410" y="218" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="600">Cooldown Cache</text>
  <text x="410" y="238" textAnchor="middle" fill="#64748b" fontSize="11">B → cooldown 중</text>
  <text x="410" y="256" textAnchor="middle" fill="#64748b" fontSize="11">(policy threshold 이후)</text>
  <text x="410" y="278" textAnchor="middle" fill="#94a3b8" fontSize="10">TTL: cooldown_time</text>

  {/* failed_calls counter */}
  <rect x="320" y="318" width="180" height="90" fill="white" rx="8" stroke="#a78bfa" strokeWidth="1.5"/>
  <text x="410" y="340" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="600">failed_calls counter</text>
  <text x="410" y="360" textAnchor="middle" fill="#64748b" fontSize="11">B: 2 / AuthAllowedFails: 1</text>
  <text x="410" y="378" textAnchor="middle" fill="#64748b" fontSize="11">→ threshold 초과</text>
  <text x="410" y="398" textAnchor="middle" fill="#94a3b8" fontSize="10">TTL: cooldown_time (must &gt; interval)</text>

  {/* RIGHT PANEL: Request path */}
  <rect x="560" y="20" width="280" height="560" fill="#fff7ed" rx="10" stroke="#fed7aa" strokeWidth="1.5"/>
  <text x="700" y="48" textAnchor="middle" fill="#c2410c" fontSize="13" fontWeight="600">요청 경로</text>

  {/* Incoming request */}
  <rect x="580" y="62" width="240" height="38" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="85" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="500">수신 요청</text>

  {/* All deployments */}
  <rect x="580" y="120" width="240" height="38" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="143" textAnchor="middle" fill="#9a3412" fontSize="12">All deployments [A, B, C]</text>

  <line x1="700" y1="100" x2="700" y2="120" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Health check filter */}
  <rect x="580" y="178" width="240" height="62" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="200" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="600">① Health Check 필터</text>
  <text x="700" y="218" textAnchor="middle" fill="#64748b" fontSize="11">policy 설정 시 → 우회</text>
  <text x="700" y="234" textAnchor="middle" fill="#64748b" fontSize="11">그 외 → unhealthy 제거</text>

  <line x1="700" y1="158" x2="700" y2="178" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Cooldown filter */}
  <rect x="580" y="262" width="240" height="50" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="284" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="600">② Cooldown 필터</text>
  <text x="700" y="302" textAnchor="middle" fill="#64748b" fontSize="11">cooldown 중인 deployment 제거</text>

  <line x1="700" y1="240" x2="700" y2="262" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Safety net */}
  <rect x="580" y="334" width="240" height="52" fill="#fef9c3" rx="7" stroke="#fbbf24" strokeWidth="1.5"/>
  <text x="700" y="356" textAnchor="middle" fill="#713f12" fontSize="12" fontWeight="600">안전장치</text>
  <text x="700" y="376" textAnchor="middle" fill="#713f12" fontSize="11">모두 제거되면 → 전체 반환</text>

  <line x1="700" y1="312" x2="700" y2="334" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Load balancer */}
  <rect x="580" y="408" width="240" height="38" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="431" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="600">③ Load Balancer</text>

  <line x1="700" y1="386" x2="700" y2="408" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Selected deployment */}
  <rect x="580" y="468" width="240" height="38" fill="#dcfce7" rx="7" stroke="#4ade80" strokeWidth="1.5"/>
  <text x="700" y="491" textAnchor="middle" fill="#14532d" fontSize="12" fontWeight="600">선택됨: Deployment A ✓</text>

  <line x1="700" y1="446" x2="700" y2="468" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-green)"/>

  {/* ARROWS: left → center */}
  <line x1="240" y1="107" x2="320" y2="110" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-blue)"/>
  <line x1="240" y1="173" x2="320" y2="240" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-red)"/>
  <line x1="240" y1="173" x2="320" y2="348" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-red)"/>
  <line x1="240" y1="316" x2="320" y2="130" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-yellow)"/>

  {/* ARROWS: center → right */}
  <line x1="500" y1="120" x2="580" y2="190" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-purple)"/>
  <line x1="500" y1="248" x2="580" y2="274" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-purple)"/>

  {/* Arrow markers */}
  <defs>
    <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#fb923c"/>
    </marker>
    <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6"/>
    </marker>
    <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#ef4444"/>
    </marker>
    <marker id="arrow-yellow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#eab308"/>
    </marker>
    <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#8b5cf6"/>
    </marker>
    <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#4ade80"/>
    </marker>
  </defs>
</svg>


## 어떤 문제를 해결하나요?

기본적으로 LiteLLM은 모든 deployment로 트래픽을 라우팅하고, 특정 deployment가 사용자 요청을 이미 실패시킨 뒤에야 해당 deployment로 보내는 것을 중단합니다. cooldown 시스템은 반응형입니다.

Health check 기반 라우팅은 이를 **사전 대응형**으로 바꿉니다. 백그라운드 루프가 설정 가능한 주기로 모든 deployment를 ping합니다. deployment가 health check에 실패하면 사용자 요청이 도달하기 전에 라우팅 풀에서 즉시 제거됩니다.

`allowed_fails_policy`도 설정하면 deployment가 cooldown에 들어가기 전에 오류 유형별(auth error, rate limit, timeout) health check 실패를 몇 번까지 허용할지 정확히 제어할 수 있습니다. 이를 통해 일시적인 노이즈로 인한 오탐을 줄일 수 있습니다.


## 설정

### 1단계: 백그라운드 health check 활성화

백그라운드 health check는 기본적으로 꺼져 있습니다. `general_settings`에서 활성화합니다.

```yaml
general_settings:
  background_health_checks: true
  health_check_interval: 60    # seconds between each full check cycle
```

### 2단계: health check 라우팅 활성화

```yaml
general_settings:
  background_health_checks: true
  health_check_interval: 60
  enable_health_check_routing: true  # ← route away from unhealthy deployments
```

이 시점부터 health check에 실패한 deployment는 다음 check cycle에서 정상으로 확인될 때까지 라우팅에서 즉시 제외됩니다.

### 3단계: cooldown을 유발할 실패 횟수 제어 정책 추가

정책이 없으면 첫 번째 health check 실패만으로 deployment가 unhealthy로 표시됩니다. 더 많은 허용치가 필요하다면, 예를 들어 연속 auth failure 2회 이후에만 동작하게 하려면 `allowed_fails_policy`를 사용합니다.

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5
      api_key: os.environ/ANTHROPIC_API_KEY_SECONDARY

general_settings:
  background_health_checks: true
  health_check_interval: 30
  enable_health_check_routing: true

router_settings:
  cooldown_time: 60              # how long a deployment stays in cooldown
  allowed_fails_policy:
    AuthenticationErrorAllowedFails: 1   # cooldown after 2nd auth failure
    TimeoutErrorAllowedFails: 3          # cooldown after 4th timeout
```

`allowed_fails_policy`가 설정되면 이진 health check 필터는 우회됩니다. 라우팅 제외는 cooldown 시스템만 제어하며, 설정한 threshold를 넘은 뒤에만 동작합니다.

### 4단계(선택 사항): 일시적 오류 무시

health check에서 발생한 429(rate limit)와 408(timeout)은 보통 deployment가 고장난 것이 아니라 일시적으로 과부하 상태임을 의미합니다. 이 오류가 라우팅에 영향을 주지 않게 하려면 다음을 설정합니다.

```yaml
general_settings:
  background_health_checks: true
  health_check_interval: 30
  enable_health_check_routing: true
  health_check_ignore_transient_errors: true  # 429 and 408 never affect routing
```

이 옵션을 켜면 health check의 hard failure(401, 404, 5xx)만 cooldown에 반영됩니다.


## 전체 예제

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY_SECONDARY

  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY

general_settings:
  background_health_checks: true
  health_check_interval: 30
  enable_health_check_routing: true
  health_check_ignore_transient_errors: true

router_settings:
  cooldown_time: 60
  allowed_fails_policy:
    AuthenticationErrorAllowedFails: 0   # cooldown immediately on auth failure
    TimeoutErrorAllowedFails: 2          # cooldown after 3 timeouts
    RateLimitErrorAllowedFails: 5        # cooldown after 6 rate limits (if not ignoring transients)
```


## 설정 참조

| Setting | Where | Default | 설명 |
|---|---|---|---|
| `enable_health_check_routing` | `general_settings` | `false` | health check에 실패한 deployment를 우회합니다. |
| `background_health_checks` | `general_settings` | `false` | health check 라우팅이 동작하려면 `true`여야 합니다. |
| `health_check_interval` | `general_settings` | `300` | 전체 health check cycle 사이의 초 단위 간격입니다. |
| `health_check_staleness_threshold` | `general_settings` | `interval x 2` | 캐시된 health state를 무시하기 전까지의 초 단위 시간입니다. |
| `health_check_ignore_transient_errors` | `general_settings` | `false` | health check의 429와 408을 무시합니다. 이 오류는 라우팅에 영향을 주지 않습니다. |
| `cooldown_time` | `router_settings` | `5` | threshold를 넘은 뒤 deployment가 cooldown에 머무는 초 단위 시간입니다. |
| `allowed_fails_policy` | `router_settings` | `null` | cooldown 전 오류 유형별 실패 threshold입니다. 아래를 참고하세요. |

### `allowed_fails_policy` 필드

| Field | 오류 유형 | HTTP status |
|---|---|---|
| `AuthenticationErrorAllowedFails` | 잘못된 API key | 401 |
| `TimeoutErrorAllowedFails` | 요청 timeout | 408 |
| `RateLimitErrorAllowedFails` | rate limit 초과 | 429 |
| `BadRequestErrorAllowedFails` | 잘못된 형식의 요청 | 400 |
| `ContentPolicyViolationErrorAllowedFails` | content filtering | 400 |

값은 cooldown 전에 **허용**할 실패 횟수입니다. `0`은 첫 번째 실패에서 cooldown을 의미합니다. `2`는 세 번째 실패에서 cooldown을 의미합니다.


## 유의 사항

- **Counter TTL은 health check interval보다 길어야 합니다.** `allowed_fails_policy`는 deployment별 `failed_calls` counter를 증가시키는 방식으로 동작합니다. 이 counter는 `cooldown_time`초 후 만료됩니다. `cooldown_time`이 `health_check_interval`보다 짧으면 매 check cycle 사이에 counter가 초기화되어 실패가 누적되지 않습니다. `allowed_fails_policy`를 사용할 때는 `cooldown_time`을 `health_check_interval`보다 크게 설정하세요.

  ```yaml
  router_settings:
    cooldown_time: 60       # must be > health_check_interval (30s here)

  general_settings:
    health_check_interval: 30
  ```

- **`AllowedFails: N`은 (N+1)번째 실패에서 cooldown이 발생한다는 뜻입니다.** counter 검사는 `updated_fails > allowed_fails`이므로 `0`은 1번째 실패, `1`은 2번째 실패, `2`는 3번째 실패에서 트리거됩니다.

  | `AllowedFails` | Cooldown 발생 시점 |
  |---|---|
  | `0` | 1번째 실패 |
  | `1` | 2번째 실패 |
  | `2` | 3번째 실패 |

- **`allowed_fails_policy`가 없으면 첫 번째 실패만으로 충분합니다.** 첫 번째 health check 실패는 deployment를 즉시 라우팅에서 제외합니다. 불안정한 check에 허용치를 두고 싶을 때 `allowed_fails_policy`를 사용하세요.

- **모든 deployment가 unhealthy이면 필터가 우회됩니다.** deployment가 전혀 없다고 반환하는 대신 트래픽 흐름은 유지됩니다. 요청은 실패하겠지만 router는 계속 시도합니다.

- **Health check 실패와 요청 실패는 같은 counter를 공유합니다.** `allowed_fails_policy`가 설정되면 두 소스가 동일한 `failed_calls` counter를 증가시킵니다. health check 실패가 1회 있는 deployment가 실패 요청을 1회 더 받으면 `AllowedFails: 1`의 threshold에 도달해 cooldown에 들어갑니다.


## 디버깅

`--detailed_debug`로 proxy를 실행하고 다음 로그 라인을 확인합니다.

각 health check cycle 이후(DEBUG level에 기록):
```
health_check_routing_state_updated healthy=2 unhealthy=1
```

health check 실패가 counter를 증가시키고 cooldown을 트리거할 때(DEBUG level):
```
checks 'should_run_cooldown_logic'
Attempting to add <deployment_id> to cooldown list
```

모든 deployment가 cooldown 상태라 safety net이 동작할 때:
```
All deployments in cooldown via health-check routing, bypassing cooldown filter
```

모든 deployment가 unhealthy라 safety net이 동작할 때(binary filter, `allowed_fails_policy` 없음):
```
All deployments marked unhealthy by health checks, bypassing health filter
```
