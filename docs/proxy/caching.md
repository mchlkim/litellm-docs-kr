import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

# 캐싱

:::note

OpenAI/Anthropic Prompt 캐싱은 [여기](../completion/prompt_caching.md)를 참고하세요.

:::

LLM 응답을 cache합니다. LiteLLM의 caching system은 LLM 응답을 저장하고 재사용해 비용을 줄이고 지연 시간을 낮춥니다. 같은 요청을 두 번 보내면 LLM API를 다시 호출하지 않고 cache된 응답을 반환합니다.

### 지원되는 Cache

- `In Memory Cache`
- `Disk Cache`
- `Redis Cache`
- `Qdrant Semantic Cache`
- `Redis Semantic Cache`
- `S3 Bucket Cache`
- `GCS Bucket Cache`

## Virtual Key 인증 Cache (Redis)

proxy가 **virtual key**(customer API key)를 검증하면, 매 요청마다 database를 조회하지 않도록 결과를 cache합니다. 기본적으로 이 cache는 **각 worker process 내부에만** 존재합니다. 따라서 deploy 이후 새 pod나 추가 Uvicorn worker가 각각 자체 cache를 예열하며, 예열이 끝날 때까지 DB read가 더 많이 발생할 수 있습니다.

`litellm_settings.enable_redis_auth_cache: true`를 설정하면 virtual-key auth data를 `litellm_settings.cache` / `cache_params` 아래에 설정된 **동일한 Redis instance**에 mirror합니다. 그러면 worker와 replica가 cluster 전체에서 cache된 auth entry를 공유합니다.

**요구 사항**

- `litellm_settings.cache`는 **`true`**여야 합니다. proxy용 Redis는 cache setup 중 초기화됩니다. [전체 설정](./config_settings)을 참고하세요.
- `cache_params.type`은 **`redis`**여야 합니다. cache 설정에 따라 Redis Cluster도 가능합니다. auth cache는 이 Redis client에 연결됩니다.
  <a href="#supported-cache_params-on-proxy-configyaml">지원되는 <code>cache_params</code></a>를 참고하세요.
- 선택적으로 **`general_settings.user_api_key_cache_ttl`**(초)을 설정합니다. Redis auth caching이 활성화되면 TTL은 in-memory와 Redis tier 모두에 적용되어 stale key가 일관되게 만료됩니다.

예제:

```yaml
litellm_settings:
  cache: true
  enable_redis_auth_cache: true
  cache_params:
    type: redis
    host: os.environ/REDIS_HOST
    port: 6379

general_settings:
  user_api_key_cache_ttl: 300 # optional; seconds
```

:::tip

startup log는 두 mode를 구분합니다. `enable_redis_auth_cache: true`이면 virtual-key lookup이 worker 간 공유된다는 message가 표시됩니다.

:::

## 빠른 시작

<Tabs>

<TabItem value="redis" label="redis cache">

`config.yaml`에 `cache` key를 추가하면 캐싱을 활성화할 수 있습니다.

#### 1단계: `config.yaml`에 `cache` 추가 {#step-1-add-cache-to-configyaml}

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
  - model_name: text-embedding-ada-002
    litellm_params:
      model: text-embedding-ada-002

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True, litellm defaults to using a redis cache
```

#### [선택 사항] 1.5단계: Redis namespace 및 기본 TTL 추가 {#optional-step-15-add-redis-namespace-and-default-ttl}

#### Namespace {#namespace}

key용 folder와 비슷한 구분자를 만들고 싶다면 다음처럼 namespace를 설정할 수 있습니다.

```yaml
litellm_settings:
  cache: true
  cache_params: # set cache params for redis
    type: redis
    namespace: "litellm.caching.caching"
```

그러면 key는 다음 형태로 저장됩니다.

```
litellm.caching.caching:<hash>
```

#### Redis Cluster {#redis-cluster}

<Tabs>

<TabItem value="redis-cluster-config" label="Set on config.yaml">

```yaml
model_list:
  - model_name: "*"
    litellm_params:
      model: "*"

litellm_settings:
  cache: True
  cache_params:
    type: redis
    redis_startup_nodes: [{ "host": "127.0.0.1", "port": "7001" }]
```

</TabItem>

<TabItem value="redis-env" label="Set on .env">

`.env`에서 `REDIS_CLUSTER_NODES`를 설정해 Redis cluster를 구성할 수 있습니다.

**예제 `REDIS_CLUSTER_NODES`** 값

```
REDIS_CLUSTER_NODES = "[{"host": "127.0.0.1", "port": "7001"}, {"host": "127.0.0.1", "port": "7003"}, {"host": "127.0.0.1", "port": "7004"}, {"host": "127.0.0.1", "port": "7005"}, {"host": "127.0.0.1", "port": "7006"}, {"host": "127.0.0.1", "port": "7007"}]"
```

:::note

`.env`에 Redis cluster node를 설정하는 Python script 예제:

```python
# List of startup nodes
startup_nodes = [
    {"host": "127.0.0.1", "port": "7001"},
    {"host": "127.0.0.1", "port": "7003"},
    {"host": "127.0.0.1", "port": "7004"},
    {"host": "127.0.0.1", "port": "7005"},
    {"host": "127.0.0.1", "port": "7006"},
    {"host": "127.0.0.1", "port": "7007"},
]

# set startup nodes in environment variables
os.environ["REDIS_CLUSTER_NODES"] = json.dumps(startup_nodes)
print("REDIS_CLUSTER_NODES", os.environ["REDIS_CLUSTER_NODES"])
```

:::

</TabItem>

</Tabs>

#### Redis Sentinel {#redis-sentinel}

<Tabs>

<TabItem value="redis-sentinel-config" label="Set on config.yaml">

```yaml
model_list:
  - model_name: "*"
    litellm_params:
      model: "*"

litellm_settings:
  cache: true
  cache_params:
    type: "redis"
    service_name: "mymaster"
    sentinel_nodes: [["localhost", 26379]]
    sentinel_password: "password" # [OPTIONAL]
```

</TabItem>

<TabItem value="redis-env" label="Set on .env">

`.env`에서 `REDIS_SENTINEL_NODES`를 설정해 Redis sentinel을 구성할 수 있습니다.

**예제 `REDIS_SENTINEL_NODES`** 값

```env
REDIS_SENTINEL_NODES='[["localhost", 26379]]'
REDIS_SERVICE_NAME = "mymaster"
REDIS_SENTINEL_PASSWORD = "password"
```

:::note

`.env`에 Redis sentinel node를 설정하는 Python script 예제:

```python
# List of startup nodes
sentinel_nodes = [["localhost", 26379]]

# set startup nodes in environment variables
os.environ["REDIS_SENTINEL_NODES"] = json.dumps(sentinel_nodes)
print("REDIS_SENTINEL_NODES", os.environ["REDIS_SENTINEL_NODES"])
```

:::

</TabItem>

</Tabs>

#### TTL

```yaml
litellm_settings:
  cache: true
  cache_params: # set cache params for redis
    type: redis
    ttl: 600 # will be cached on redis for 600s
    # default_in_memory_ttl: Optional[float], default is None. time in seconds.
    # default_in_redis_ttl: Optional[float], default is None. time in seconds.
```

#### SSL

`.env`에 `REDIS_SSL="True"`만 설정하면 LiteLLM이 이를 읽습니다.

```env
REDIS_SSL="True"
```

빠른 테스트에는 REDIS_URL도 사용할 수 있습니다. 예:

```
REDIS_URL="rediss://.."
```

하지만 production에서는 REDIS_URL 사용을 **권장하지 않습니다**. REDIS_URL을 사용할 때와 redis_host, port 등을 사용할 때 성능 차이가 관찰되었습니다.

#### GCP IAM 인증

IAM authentication을 사용하는 GCP Memorystore Redis의 경우 필요한 dependency를 설치합니다.

:::info Redis용 IAM authentication은 현재 GCP 및 Redis Cluster에서만 지원됩니다.
:::

```shell
uv add google-cloud-iam
```

<Tabs>

<TabItem value="gcp-iam-config" label="Set on config.yaml">

GCP IAM을 사용하는 Redis Cluster:

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: redis
    redis_startup_nodes:
      [{ "host": "10.128.0.2", "port": 6379 }, { "host": "10.128.0.2", "port": 11008 }]
    gcp_service_account: "projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com"
    ssl: true
    ssl_cert_reqs: null
    ssl_check_hostname: false
```

</TabItem>

<TabItem value="gcp-iam-env" label="Set on .env">

`.env`에서 GCP IAM Redis authentication을 설정할 수 있습니다.

Redis Cluster의 경우:

```env
REDIS_CLUSTER_NODES='[{"host": "10.128.0.2", "port": 6379}, {"host": "10.128.0.2", "port": 11008}]'
REDIS_GCP_SERVICE_ACCOUNT="projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com"
REDIS_GCP_SSL_CA_CERTS="./server-ca.pem"
REDIS_SSL="True"
REDIS_SSL_CERT_REQS="None"
REDIS_SSL_CHECK_HOSTNAME="False"
```

**GCP 인증 Setup**

GCP credential이 설정되어 있는지 확인합니다.

```shell
# Option 1: Service account key file
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Option 2: If running on GCP compute instance with service account attached
# No additional setup needed
```

</TabItem>

</Tabs> 
#### 2단계: `.env`에 Redis credential 추가 {#step-2-add-redis-credentials-to-env}
캐싱을 활성화하려면 OS environment에 `REDIS_URL` 또는 `REDIS_HOST`를 설정합니다.

  ```shell
  REDIS_URL = ""        # REDIS_URL='redis://username:password@hostname:port/database'
  ## OR ## 
  REDIS_HOST = ""       # REDIS_HOST='redis-18841.c274.us-east-1-3.ec2.cloud.redislabs.com'
  REDIS_PORT = ""       # REDIS_PORT='18841'
  REDIS_PASSWORD = ""   # REDIS_PASSWORD='liteLlmIsAmazing'
  REDIS_USERNAME = ""   # REDIS_USERNAME='my-redis-username' [OPTIONAL] if your redis server requires a username
  REDIS_SSL = "True"    # REDIS_SSL='True' to enable SSL by default is False
  ```

**추가 kwargs**  
:::info
모든 Redis client library parameter는 `REDIS_*` environment variable로 설정할 수 있습니다. environment variable을 Redis client kwargs로 자동 매핑하므로 Redis 설정을 전환할 때 권장되는 방식입니다.
:::

추가 `redis.Redis` argument는 다음처럼 variable과 값을 OS environment에 저장해 전달할 수 있습니다.

```shell
REDIS_<redis-kwarg-name> = ""
```

예:
```shell
REDIS_SSL = "True"
REDIS_SSL_CERT_REQS = "None" 
REDIS_CONNECTION_POOL_KWARGS = '{"max_connections": 20}'
```

:::warning
**참고**: 정수, boolean, 복합 객체 같은 문자열이 아닌 Redis parameter에는 `REDIS_*` environment variable을 사용하지 마세요. Redis client 초기화 중 실패할 수 있습니다. 이런 parameter에는 router configuration의 `cache_kwargs`를 대신 사용하세요.
:::

[**environment에서 읽는 방식 보기**](https://github.com/BerriAI/litellm/blob/4d7ff1b33b9991dcf38d821266290631d9bcd2dd/litellm/_redis.py#L40)

#### 3단계: 설정으로 proxy 실행 {#step-3-run-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>

<TabItem value="qdrant-semantic" label="Qdrant Semantic cache">

`config.yaml`에 `cache` key를 추가하면 캐싱을 활성화할 수 있습니다.

#### 1단계: `config.yaml`에 `cache` 추가 {#qdrant-step-1-add-cache-to-configyaml}

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
  - model_name: openai-embedding
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True, litellm defaults to using a redis cache
  cache_params:
    type: qdrant-semantic
    qdrant_semantic_cache_embedding_model: openai-embedding # the model should be defined on the model_list
    qdrant_collection_name: test_collection
    qdrant_quantization_config: binary
    qdrant_semantic_cache_vector_size: 1536 # vector size must match embedding model dimensionality
    similarity_threshold: 0.8 # similarity threshold for semantic cache
```

#### 2단계: `.env`에 Qdrant credential 추가 {#qdrant-step-2-add-qdrant-credentials-to-env}

```shell
QDRANT_API_KEY = "16rJUMBRx*************"
QDRANT_API_BASE = "https://5392d382-45*********.cloud.qdrant.io"
```

#### 3단계: 설정으로 proxy 실행 {#qdrant-step-3-run-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

#### 4단계. 테스트 {#qdrant-step-4-test}

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

semantic caching이 켜져 있으면 response header에서 `x-litellm-semantic-similarity`를 볼 수 있어야 합니다.

</TabItem>

<TabItem value="s3" label="s3 cache">

#### 1단계: `config.yaml`에 `cache` 추가 {#s3-step-1-add-cache-to-configyaml}

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
  - model_name: text-embedding-ada-002
    litellm_params:
      model: text-embedding-ada-002

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True
  cache_params: # set cache params for s3
    type: s3
    s3_bucket_name: cache-bucket-litellm # AWS Bucket Name for S3
    s3_region_name: us-west-2 # AWS Region Name for S3
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID # us os.environ/<variable name> to pass environment variables. This is AWS Access Key ID for S3
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY # AWS Secret Access Key for S3
    s3_endpoint_url: https://s3.amazonaws.com # [OPTIONAL] S3 endpoint URL, if you want to use Backblaze/cloudflare s3 buckets
```

#### 2단계: 설정으로 proxy 실행 {#s3-step-2-run-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>

<TabItem value="gcs" label="gcs cache">

#### 1단계: `config.yaml`에 `cache` 추가 {#gcs-step-1-add-cache-to-configyaml}

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
  - model_name: text-embedding-ada-002
    litellm_params:
      model: text-embedding-ada-002

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True
  cache_params: # set cache params for gcs
    type: gcs
    gcs_bucket_name: cache-bucket-litellm # GCS Bucket Name for caching
    gcs_path_service_account: os.environ/GCS_PATH_SERVICE_ACCOUNT # use os.environ/<variable name> to pass environment variables. This is the path to your GCS service account JSON file
    gcs_path: cache/ # [OPTIONAL] GCS path prefix for cache objects
```

#### 2단계: `.env`에 GCS credential 추가 {#gcs-step-2-add-gcs-credentials-to-env}

`.env` 파일에 GCS environment variable을 설정합니다.

```shell
GCS_BUCKET_NAME="your-gcs-bucket-name"
GCS_PATH_SERVICE_ACCOUNT="/path/to/service-account.json"
```

#### 3단계: 설정으로 proxy 실행 {#gcs-step-3-run-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>

<TabItem value="redis-sem" label="redis semantic cache">

`config.yaml`에 `cache` key를 추가하면 캐싱을 활성화할 수 있습니다.

#### 1단계: `config.yaml`에 `cache` 추가 {#redis-semantic-step-1-add-cache-to-configyaml}

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
  - model_name: azure-embedding-model
    litellm_params:
      model: azure/azure-embedding-model
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True
  cache_params:
    type: "redis-semantic"
    similarity_threshold: 0.8 # similarity threshold for semantic cache
    redis_semantic_cache_embedding_model: azure-embedding-model # set this to a model_name set in model_list
```

#### 2단계: `.env`에 Redis credential 추가 {#redis-semantic-step-2-add-redis-credentials-to-env}

캐싱을 활성화하려면 OS environment에 `REDIS_URL` 또는 `REDIS_HOST`를 설정합니다.

```shell
REDIS_URL = ""        # REDIS_URL='redis://username:password@hostname:port/database'
## OR ##
REDIS_HOST = ""       # REDIS_HOST='redis-18841.c274.us-east-1-3.ec2.cloud.redislabs.com'
REDIS_PORT = ""       # REDIS_PORT='18841'
REDIS_PASSWORD = ""   # REDIS_PASSWORD='liteLlmIsAmazing'
```

**추가 kwargs**  
추가 `redis.Redis` argument는 다음처럼 variable과 값을 OS environment에 저장해 전달할 수 있습니다.

```shell
REDIS_<redis-kwarg-name> = ""
```

#### 3단계: 설정으로 proxy 실행 {#redis-semantic-step-3-run-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>

<TabItem value="local" label="In Memory Cache">

#### 1단계: `config.yaml`에 `cache` 추가 {#local-step-1-add-cache-to-configyaml}

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: local
```

#### 2단계: 설정으로 proxy 실행 {#local-step-2-run-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>

<TabItem value="disk" label="Disk Cache">

#### 1단계: `config.yaml`에 `cache` 추가 {#disk-step-1-add-cache-to-configyaml}

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: disk
    disk_cache_dir: /tmp/litellm-cache # OPTIONAL, default to ./.litellm_cache
```

#### 2단계: 설정으로 proxy 실행 {#disk-step-2-run-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>

</Tabs>

## 사용법

### 기본 {#basic}

<Tabs>
<TabItem value="chat_completions" label="/chat/completions">

같은 요청을 두 번 보냅니다.

```shell
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "write a poem about litellm!"}],
     "temperature": 0.7
   }'

curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "write a poem about litellm!"}],
     "temperature": 0.7
   }'
```

</TabItem>
<TabItem value="embeddings" label="/embeddings">

같은 요청을 두 번 보냅니다.

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'

curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'
```

</TabItem>
</Tabs>

### 동적 Cache 제어 {#dynamic-cache-control}

| Parameter   | Type             | 설명                                                                              |
| ----------- | ---------------- | --------------------------------------------------------------------------------- |
| `ttl`       | _Optional(int)_  | 사용자가 지정한 시간(초) 동안 응답을 cache합니다. |
| `s-maxage`  | _Optional(int)_  | 사용자가 지정한 범위(초) 안에 있는 cache된 응답만 허용합니다. |
| `no-cache`  | _Optional(bool)_ | 응답을 cache에 저장하지 않습니다. |
| `no-store`  | _Optional(bool)_ | 응답을 cache하지 않습니다. |
| `namespace` | _Optional(str)_  | 사용자가 지정한 namespace 아래에 응답을 cache합니다. |

각 cache parameter는 요청별로 제어할 수 있습니다. 각 parameter 예시는 다음과 같습니다.

### `ttl`

응답을 얼마나 오래 cache할지 초 단위로 설정합니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="gpt-3.5-turbo",
    extra_body={
        "cache": {
            "ttl": 300  # Cache response for 5 minutes
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "cache": {"ttl": 300},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `s-maxage`

지정된 age(초) 이내의 cache된 응답만 허용합니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="gpt-3.5-turbo",
    extra_body={
        "cache": {
            "s-maxage": 600  # Only use cache if less than 10 minutes old
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "cache": {"s-maxage": 600},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `no-cache`

cache를 우회하고 fresh 응답을 강제합니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="gpt-3.5-turbo",
    extra_body={
        "cache": {
            "no-cache": True  # Skip cache check, get fresh response
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "cache": {"no-cache": true},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `no-store`

응답을 cache에 저장하지 않습니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="gpt-3.5-turbo",
    extra_body={
        "cache": {
            "no-store": True  # Don't cache this response
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "cache": {"no-store": true},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `namespace`

특정 cache namespace 아래에 응답을 저장합니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="gpt-3.5-turbo",
    extra_body={
        "cache": {
            "namespace": "my-custom-namespace"  # Store in custom namespace
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "cache": {"namespace": "my-custom-namespace"},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

## 실제 LLM API call에는 적용하지 않고 proxy에만 cache 설정

여러 instance 간 rate limiting 및 load balancing 같은 기능만 활성화하려는 경우 이 설정을 사용합니다.

실제 API call에서 caching을 비활성화하려면 `supported_call_types: []`를 설정합니다.

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: redis
    supported_call_types: []
```

## 캐싱 Debugging - `/cache/ping` {#debugging-caching-cacheping}

LiteLLM Proxy는 cache가 예상대로 동작하는지 테스트할 수 있는 `/cache/ping` endpoint를 제공합니다.

**사용법**

```shell
curl --location 'http://0.0.0.0:4000/cache/ping'  -H "Authorization: Bearer sk-1234"
```

**예상 응답 - cache가 정상일 때**

```shell
{
    "status": "healthy",
    "cache_type": "redis",
    "ping_response": true,
    "set_cache_response": "success",
    "litellm_cache_params": {
        "supported_call_types": "['completion', 'acompletion', 'embedding', 'aembedding', 'atranscription', 'transcription']",
        "type": "redis",
        "namespace": "None"
    },
    "redis_cache_params": {
        "redis_client": "Redis<ConnectionPool<Connection<host=redis-16337.c322.us-east-1-2.ec2.cloud.redislabs.com,port=16337,db=0>>>",
        "redis_kwargs": "{'url': 'redis://:******@redis-16337.c322.us-east-1-2.ec2.cloud.redislabs.com:16337'}",
        "async_redis_conn_pool": "BlockingConnectionPool<Connection<host=redis-16337.c322.us-east-1-2.ec2.cloud.redislabs.com,port=16337,db=0>>",
        "redis_version": "7.2.0"
    }
}
```

## 고급

### 캐싱을 켤 call type 제어 - (`/chat/completion`, `/embeddings` 등)

기본적으로 caching은 모든 call type에 대해 켜져 있습니다. `cache_params`에서 `supported_call_types`를 설정해 어떤 call type에 caching을 적용할지 제어할 수 있습니다.

**cache는 `supported_call_types`에 지정된 call type에만 적용됩니다.**

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: redis
    supported_call_types:
      ["acompletion", "atext_completion", "aembedding", "atranscription"]
      # /chat/completions, /completions, /embeddings, /audio/transcriptions
```

### `config.yaml`에서 Cache Params 설정 {#set-cache-params-in-configyaml}

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
  - model_name: text-embedding-ada-002
    litellm_params:
      model: text-embedding-ada-002

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True, litellm defaults to using a redis cache
  cache_params: # cache_params are optional
    type: "redis" # The type of cache to initialize. Can be "local", "redis", "s3", or "gcs". Defaults to "local".
    host: "localhost" # The host address for the Redis cache. Required if type is "redis".
    port: 6379 # The port number for the Redis cache. Required if type is "redis".
    password: "your_password" # The password for the Redis cache. Required if type is "redis".

    # Optional configurations
    supported_call_types:
      ["acompletion", "atext_completion", "aembedding", "atranscription"]
      # /chat/completions, /completions, /embeddings, /audio/transcriptions
```

### Cache Key 삭제 - `/cache/delete`

cache key를 삭제하려면 삭제할 `keys`와 함께 `/cache/delete`로 요청을 보냅니다.

예제

```shell
curl -X POST "http://0.0.0.0:4000/cache/delete" \
  -H "Authorization: Bearer sk-1234" \
  -d '{"keys": ["586bf3f3c1bf5aecb55bd9996494d3bbc69eb58397163add6d49537762a7548d", "key2"]}'
```

```shell
# {"status":"success"}
```

#### 응답에서 Cache Key 보기 {#view-cache-key-in-response}

response header에서 `cache_key`를 확인할 수 있습니다. cache hit 시 cache key는 `x-litellm-cache-key` response header로 전송됩니다.

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "user": "ishan",
    "messages": [
        {
        "role": "user",
        "content": "what is litellm"
        }
    ],
}'
```

litellm proxy의 응답

```json
date: Thu, 04 Apr 2024 17:37:21 GMT
content-type: application/json
x-litellm-cache-key: 586bf3f3c1bf5aecb55bd9996494d3bbc69eb58397163add6d49537762a7548d

{
    "id": "chatcmpl-9ALJTzsBlXR9zTxPvzfFFtFbFtG6T",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "I'm sorr.."
                "role": "assistant"
            }
        }
    ],
    "created": 1712252235,
}

```

### **캐싱을 Default Off로 설정 - 명시적으로 opt-in**

1. **caching에 `mode: default_off` 설정**

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

# default off mode
litellm_settings:
  set_verbose: True
  cache: True
  cache_params:
    mode: default_off # 👈 Key change cache is default_off
```

2. **cache가 default off일 때 cache 사용 opt-in**

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
import os
from openai import OpenAI

client = OpenAI(api_key=<litellm-api-key>, base_url="http://0.0.0.0:4000")

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="gpt-3.5-turbo",
    extra_body = {        # OpenAI python accepts extra args in extra_body
        "cache": {"use-cache": True}
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "cache": {"use-cache": True}
    "messages": [
      {"role": "user", "content": "Say this is a test"}
    ]
  }'
```

</TabItem>

</Tabs>


## Redis `max_connections` {#redis-max_connections}

Redis용 `cache_params`에 `max_connections` parameter를 설정할 수 있습니다. 이 값은 Redis client에 직접 전달되며 pool의 최대 동시 connection 수를 제어합니다. `No connection available` 같은 error가 보이면 이 값을 늘려보세요.

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis
    max_connections: 100
```

## proxy `config.yaml`에서 지원되는 `cache_params` {#supported-cache_params-on-proxy-configyaml}

```yaml
cache_params:
  # ttl
  ttl: Optional[float]
  default_in_memory_ttl: Optional[float]
  default_in_redis_ttl: Optional[float]
  max_connections: Optional[Int]

  # Type of cache (options: "local", "redis", "s3", "gcs")
  type: s3

  # List of litellm call types to cache for
  # Options: "completion", "acompletion", "embedding", "aembedding"
  supported_call_types:
    ["acompletion", "atext_completion", "aembedding", "atranscription"]
    # /chat/completions, /completions, /embeddings, /audio/transcriptions

  # Redis cache parameters
  host: localhost # Redis server hostname or IP address
  port: "6379" # Redis server port (as a string)
  password: secret_password # Redis server password
  namespace: Optional[str] = None,

  # GCP IAM Authentication for Redis
  gcp_service_account: "projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com" # GCP service account for IAM authentication
  gcp_ssl_ca_certs: "./server-ca.pem" # Path to SSL CA certificate file for GCP Memorystore Redis
  ssl: true # Enable SSL for secure connections
  ssl_cert_reqs: null # Set to null for self-signed certificates
  ssl_check_hostname: false # Set to false for self-signed certificates

  # S3 cache parameters
  s3_bucket_name: your_s3_bucket_name # Name of the S3 bucket
  s3_region_name: us-west-2 # AWS region of the S3 bucket
  s3_api_version: 2006-03-01 # AWS S3 API version
  s3_use_ssl: true # Use SSL for S3 connections (options: true, false)
  s3_verify: true # SSL certificate verification for S3 connections (options: true, false)
  s3_endpoint_url: https://s3.amazonaws.com # S3 endpoint URL
  s3_aws_access_key_id: your_access_key # AWS Access Key ID for S3
  s3_aws_secret_access_key: your_secret_key # AWS Secret Access Key for S3
  s3_aws_session_token: your_session_token # AWS Session Token for temporary credentials

  # GCS cache parameters
  gcs_bucket_name: your_gcs_bucket_name # Name of the GCS bucket
  gcs_path_service_account: /path/to/service-account.json # Path to GCS service account JSON file
  gcs_path: cache/ # [OPTIONAL] GCS path prefix for cache objects
```

## Provider별 Optional Parameter 캐싱

기본적으로 LiteLLM은 cache key에 표준 OpenAI parameter만 포함합니다. 하지만 Vertex AI 같은 일부 provider는 output에 영향을 주지만 표준 cache key 생성에는 포함되지 않는 추가 parameter를 사용합니다.

### Provider별 Parameter 캐싱 활성화

provider별 optional parameter를 cache key에 포함하려면 `config.yaml`에 다음 설정을 추가합니다.

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: "redis"
  enable_caching_on_provider_specific_optional_params: True  # Include provider-specific params in cache keys
```
## 고급 - user api key cache ttl 

in-memory cache가 key object를 얼마나 오래 저장할지 설정합니다. DB request를 줄이는 데 사용됩니다.

```yaml
general_settings:
  user_api_key_cache_ttl: <your-number> #time in seconds
```

기본값은 60초입니다.
