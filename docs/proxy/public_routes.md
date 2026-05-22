import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 공개 및 비공개 라우트 제어 {#control-public--private-routes}

:::info

LiteLLM 엔터프라이즈 라이선스가 필요합니다. [무료 체험 시작하기](https://enterprise.litellm.ai/demo).

:::

인증이 필요한 라우트와 공개적으로 접근할 수 있는 라우트를 제어합니다.

## 라우트 유형 {#route-types}

| 라우트 유형 | 인증 필요 | 설명 |
|------------|---------------|-------------|
| `public_routes` | 아니요 | 인증 없이 접근할 수 있는 라우트 |
| `admin_only_routes` | 예(Admin 전용) | [Proxy Admin](./self_serve#available-roles)만 접근할 수 있는 라우트 |
| `allowed_routes` | 예 | 프록시에 노출되는 라우트입니다. 설정하지 않으면 모든 라우트가 노출됩니다. |

## 빠른 시작

### 라우트 공개 설정 {#make-routes-public}

특정 라우트를 인증 없이 접근할 수 있도록 허용합니다.

```yaml
general_settings:
  master_key: sk-1234
  public_routes: ["LiteLLMRoutes.public_routes", "/spend/calculate"]
```

### 라우트를 Admin 전용으로 제한 {#restrict-routes-to-admin-only}

특정 라우트를 Proxy Admin만 접근할 수 있도록 제한합니다.

```yaml
general_settings:
  master_key: sk-1234
  admin_only_routes: ["/key/generate", "/key/delete"]
```

### 사용 가능한 라우트 제한 {#limit-available-routes}

프록시에서 특정 라우트만 노출합니다.

```yaml
general_settings:
  master_key: sk-1234
  allowed_routes: ["/chat/completions", "/embeddings", "LiteLLMRoutes.public_routes"]
```

## 사용법 예제

### 공개, Admin 전용, 허용 라우트 정의 {#define-public-admin-only-and-allowed-routes}

```yaml
general_settings:
  master_key: sk-1234
  public_routes: ["LiteLLMRoutes.public_routes", "/spend/calculate"]
  admin_only_routes: ["/key/generate"]
  allowed_routes: ["/chat/completions", "/spend/calculate", "LiteLLMRoutes.public_routes"]
```

`LiteLLMRoutes.public_routes`는 LiteLLM의 기본 공개 라우트에 해당하는 ENUM입니다. [소스 보기](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_types.py).

### 테스트 {#testing}

<Tabs>

<TabItem value="public" label="Test public_routes">

```shell
curl --request POST \
  --url 'http://localhost:4000/spend/calculate' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hey, how'\''s it going?"}]
  }'
```

이 엔드포인트는 `Authorization` 헤더 없이 동작합니다.

</TabItem>

<TabItem value="admin_only_routes" label="Test admin_only_routes">

**성공한 요청(Admin)**

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{}'
```

**실패한 요청(Non-Admin)**

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <virtual-key-from-non-admin>' \
--header 'Content-Type: application/json' \
--data '{"user_role": "internal_user"}'
```

**예상 응답**

```json
{
  "error": {
    "message": "user not allowed to access this route. Route=/key/generate is an admin only route",
    "type": "auth_error",
    "param": "None",
    "code": "403"
  }
}
```

</TabItem>

<TabItem value="allowed_routes" label="Test allowed_routes">

**성공한 요청**

```shell
curl http://localhost:4000/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-1234" \
-d '{
"model": "fake-openai-endpoint",
"messages": [
    {"role": "user", "content": "Hello, Claude"}
]
}'
```

**실패한 요청(허용되지 않은 라우트)**

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
--header 'Content-Type: application/json' \
-H "Authorization: Bearer sk-1234" \
--data '{
"model": "text-embedding-ada-002",
"input": ["write a litellm poem"]
}'
```

**예상 응답**

```json
{
  "error": {
    "message": "Route /embeddings not allowed",
    "type": "auth_error",
    "param": "None",
    "code": "403"
  }
}
```

</TabItem>

</Tabs>

## 고급: 와일드카드 패턴 {#advanced-wildcard-patterns}

와일드카드 패턴을 사용해 여러 라우트를 한 번에 일치시킬 수 있습니다.

### 구문 {#syntax}

| 패턴 | 설명 | 예제 |
|---------|-------------|---------|
| `/path/*` | `/path/`로 시작하는 모든 라우트와 일치합니다. | `/api/*`는 `/api/users`, `/api/users/123`와 일치합니다. |


### 예제

#### 경로 아래의 모든 라우트 공개 {#make-all-routes-under-a-path-public}

```yaml
general_settings:
  master_key: sk-1234
  public_routes:
    - "LiteLLMRoutes.public_routes"
    - "/api/v1/*"      # All routes under /api/v1/
    - "/health/*"       # All health check routes
```

#### 와일드카드로 Admin 라우트 제한 {#restrict-admin-routes-with-wildcards}

```yaml
general_settings:
  master_key: sk-1234
  admin_only_routes:
    - "/admin/*"        # All admin routes
    - "/internal/*"     # All internal routes
```

### 와일드카드 라우트 테스트 {#testing-wildcard-routes}

**설정:**
```yaml
general_settings:
  master_key: sk-1234
  public_routes:
    - "/public/*"
```

**테스트:**
```shell
# This works without auth (matches /public/*)
curl http://localhost:4000/public/status

# This also works without auth (matches /public/*)
curl http://localhost:4000/public/health/detailed

# This requires auth (doesn't match /public/*)
curl http://localhost:4000/private/data
```
