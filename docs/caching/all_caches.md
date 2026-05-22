import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 캐싱 - 인메모리, Redis, s3, gcs, Redis Semantic 캐시, Disk

[**코드 보기**](https://github.com/BerriAI/litellm/blob/main/litellm/caching/caching.py)

:::info

- Proxy Server용 문서는 여기에서 확인하세요: [캐싱 Proxy Server](https://docs.litellm.ai/docs/proxy/caching)

- OpenAI/Anthropic Prompt 캐싱은 [여기](../completion/prompt_caching.md)에서 확인하세요.


:::

## 캐시 초기화 - 인메모리, Redis, s3 버킷, gcs 버킷, Redis Semantic, Disk 캐시, Qdrant Semantic {#initialize-cache---in-memory-redis-s3-bucket-gcs-bucket-redis-semantic-disk-cache-qdrant-semantic}


<Tabs>

<TabItem value="redis" label="Redis 캐시">

redis를 설치합니다.
```shell
uv add redis
```

호스팅 버전의 경우 여기에서 직접 Redis DB를 설정할 수 있습니다: https://redis.io/try-free/

**기본 Redis 캐시**

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

litellm.cache = Cache(type="redis", host=<host>, port=<port>, password=<password>)

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

**GCP IAM Redis 인증**

IAM 인증을 사용하는 GCP Memorystore Redis의 경우:

```shell
uv add google-cloud-iam
```

```python
import litellm
from litellm import completion
# For Redis Cluster with GCP IAM
from litellm.caching.redis_cluster_cache import RedisClusterCache

litellm.cache = RedisClusterCache(
    startup_nodes=[
        {"host": "10.128.0.2", "port": 6379},
        {"host": "10.128.0.2", "port": 11008},
    ],
    gcp_service_account="projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com",
    ssl=True,
    ssl_cert_reqs=None,
    ssl_check_hostname=False,
)

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

**GCP IAM Redis용 환경 변수**

다음 값을 환경 변수로도 설정할 수 있습니다.

```shell
export REDIS_HOST="10.128.0.2"
export REDIS_PORT="6379"
export REDIS_GCP_SERVICE_ACCOUNT="projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com"
export REDIS_SSL="False"
```

그런 다음 간단히 초기화합니다.

```python
litellm.cache = Cache(type="redis")
```

:::info
모든 Redis 클라이언트 라이브러리 매개변수를 구성하는 기본 방식으로 `REDIS_*` 환경 변수를 사용하세요. 이 방식은 환경 변수를 Redis 클라이언트 kwargs에 자동으로 매핑하며, Redis 설정을 전환할 때 권장되는 방법입니다.
:::

:::warning
문자열이 아닌 Redis 매개변수(정수, 불리언, 복합 객체)를 전달해야 하는 경우 Redis 클라이언트 초기화 중 실패할 수 있으므로 `REDIS_*` 환경 변수 사용을 피하세요. 대신 `Cache()` 생성자에 kwargs로 직접 전달하세요.
:::

</TabItem>

<TabItem value="gcs" label="GCS 캐시">

환경 변수를 설정합니다.

```shell
GCS_BUCKET_NAME="my-cache-bucket"
GCS_PATH_SERVICE_ACCOUNT="/path/to/service_account.json"
```

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

litellm.cache = Cache(type="gcs", gcs_bucket_name="my-cache-bucket", gcs_path_service_account="/path/to/service_account.json")

response1 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

</TabItem>


<TabItem value="s3" label="S3 캐시">

boto3를 설치합니다.
```shell
uv add boto3
```

AWS 환경 변수를 설정합니다.

```shell
AWS_ACCESS_KEY_ID = "AKI*******"
AWS_SECRET_ACCESS_KEY = "WOl*****"
```

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

# pass s3-bucket name
litellm.cache = Cache(type="s3", s3_bucket_name="cache-bucket-litellm", s3_region_name="us-west-2")

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

</TabItem>

<TabItem value="azureblob" label="Azure Blob 캐시">

azure-storage-blob 및 azure-identity를 설치합니다.
```shell
uv add azure-storage-blob azure-identity
```

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
from azure.identity import DefaultAzureCredential

# pass Azure Blob Storage account URL and container name
litellm.cache = Cache(type="azure-blob", azure_account_url="https://example.blob.core.windows.net", azure_blob_container="litellm")

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

</TabItem>


<TabItem value="redis-sem" label="Redis Semantic 캐시">

redisvl 클라이언트를 설치합니다.
```shell
uv add redisvl==0.4.1
```

호스팅 버전의 경우 여기에서 직접 Redis DB를 설정할 수 있습니다: https://redis.io/try-free/

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

random_number = random.randint(
    1, 100000
)  # add a random number to ensure it's always adding / reading from cache

print("testing semantic caching")
litellm.cache = Cache(
    type="redis-semantic",
    host=os.environ["REDIS_HOST"],
    port=os.environ["REDIS_PORT"],
    password=os.environ["REDIS_PASSWORD"],
    similarity_threshold=0.8, # similarity threshold for cache hits, 0 == no similarity, 1 = exact matches, 0.5 == 50% similarity
    ttl=120,
    redis_semantic_cache_embedding_model="text-embedding-ada-002", # this model is passed to litellm.embedding(), any litellm.embedding() model is supported here
)
response1 = completion(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response1: {response1}")

random_number = random.randint(1, 100000)

response2 = completion(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response2: {response1}")
assert response1.id == response2.id
# response1 == response2, response 1 is cached
```

</TabItem>

<TabItem value="qdrant-sem" label="Qdrant Semantic 캐시">

다음 문서를 따라 자체 클라우드 Qdrant 클러스터를 설정할 수 있습니다: https://qdrant.tech/documentation/quickstart-cloud/

로컬에서 Qdrant 클러스터를 설정하려면 다음 문서를 따르세요: https://qdrant.tech/documentation/quickstart/
```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

random_number = random.randint(
    1, 100000
)  # add a random number to ensure it's always adding / reading from cache

print("testing semantic caching")
litellm.cache = Cache(
    type="qdrant-semantic",
    qdrant_api_base=os.environ["QDRANT_API_BASE"], 
    qdrant_api_key=os.environ["QDRANT_API_KEY"],
    qdrant_collection_name="your_collection_name", # any name of your collection
    similarity_threshold=0.7, # similarity threshold for cache hits, 0 == no similarity, 1 = exact matches, 0.5 == 50% similarity
    qdrant_quantization_config ="binary", # can be one of 'binary', 'product' or 'scalar' quantizations that is supported by qdrant
    qdrant_semantic_cache_embedding_model="text-embedding-ada-002", # this model is passed to litellm.embedding(), any litellm.embedding() model is supported here
    qdrant_semantic_cache_vector_size=1536, # vector size for the embedding model, must match the dimensionality of the embedding model used
)

response1 = completion(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response1: {response1}")

random_number = random.randint(1, 100000)

response2 = completion(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response2: {response2}")
assert response1.id == response2.id
# response1 == response2, response 1 is cached
```

</TabItem>

<TabItem value="in-mem" label="인메모리 캐시">

### 빠른 시작

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache()

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}],
    caching=True
)
response2 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}],
    caching=True
)

# response1 == response2, response 1 is cached

```

</TabItem>

<TabItem value="disk" label="디스크 캐시">

### 빠른 시작

디스크 캐싱 extra를 설치합니다.

```shell
uv add "litellm[caching]"
```

그런 다음 다음과 같이 디스크 캐시를 사용할 수 있습니다.

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache(type="disk")

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}],
    caching=True
)
response2 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}],
    caching=True
)

# response1 == response2, response 1 is cached

```

코드를 두 번 실행하면 `response1`은 첫 번째 실행에서 캐시 파일에 저장된 캐시를 사용합니다.

</TabItem>

</Tabs>

## LiteLLM 호출별 캐시 켜기/끄기 {#switch-cache-on--off-per-litellm-call}

LiteLLM은 4가지 cache-control을 지원합니다.

- `no-cache`: *Optional(bool)* `True`이면 캐시된 응답을 반환하지 않고 실제 엔드포인트를 호출합니다.
- `no-store`: *Optional(bool)* `True`이면 응답을 캐시하지 않습니다.
- `ttl`: *Optional(int)* 사용자가 정의한 시간(초) 동안 응답을 캐시합니다.
- `s-maxage`: *Optional(int)* 사용자가 정의한 범위(초) 안에 있는 캐시된 응답만 허용합니다.

[더 필요한 항목이 있으면 알려주세요](https://github.com/BerriAI/litellm/issues/1218)
<Tabs>
<TabItem value="no-cache" label="No-Cache">

`no-cache` 사용 예시 - `True`이면 캐시된 응답을 반환하지 않습니다.

```python
response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"no-cache": True},
    )
```

</TabItem>

<TabItem value="no-store" label="No-Store">

`no-store` 사용 예시 - `True`이면 응답을 캐시하지 않습니다.

```python
response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"no-store": True},
    )
```

</TabItem>

<TabItem value="ttl" label="ttl">
`ttl` 사용 예시 - 응답을 10초 동안 캐시합니다.

```python
response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"ttl": 10},
    )
```

</TabItem>

<TabItem value="s-maxage" label="s-maxage">
`s-maxage` 사용 예시 - 60초 동안만 캐시된 응답을 허용합니다.

```python
response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"s-maxage": 60},
    )
```

</TabItem>


</Tabs>

## 캐시 컨텍스트 매니저 - 캐시 활성화, 비활성화, 업데이트 {#cache-context-manager---enable-disable-update-cache}
컨텍스트 매니저를 사용하면 litellm 캐시를 쉽게 활성화, 비활성화, 업데이트할 수 있습니다.

### 캐시 활성화 {#enabling-cache}

빠른 시작 활성화
```python
litellm.enable_cache()
```

고급 매개변수

```python
litellm.enable_cache(
    type: Optional[Literal["local", "redis", "s3", "gcs", "disk"]] = "local",
    host: Optional[str] = None,
    port: Optional[str] = None,
    password: Optional[str] = None,
    supported_call_types: Optional[
        List[Literal["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"]]
    ] = ["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"],
    **kwargs,
)
```

### 캐시 비활성화 {#disabling-cache}

캐싱을 끕니다.
```python
litellm.disable_cache()
```

### 캐시 매개변수 업데이트(Redis Host, Port 등) {#updating-cache-params-redis-host-port-etc}

Cache 매개변수를 업데이트합니다.

```python
litellm.update_cache(
    type: Optional[Literal["local", "redis", "s3", "gcs", "disk"]] = "local",
    host: Optional[str] = None,
    port: Optional[str] = None,
    password: Optional[str] = None,
    supported_call_types: Optional[
        List[Literal["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"]]
    ] = ["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"],
    **kwargs,
)
```

## 사용자 지정 캐시 키 {#custom-cache-keys}
캐시 키를 반환하는 함수를 정의합니다.
```python
# this function takes in *args, **kwargs and returns the key you want to use for caching
def custom_get_cache_key(*args, **kwargs):
    # return key to use for your cache:
    key = kwargs.get("model", "") + str(kwargs.get("messages", "")) + str(kwargs.get("temperature", "")) + str(kwargs.get("logit_bias", ""))
    print("key for cache", key)
    return key

```

함수를 `litellm.cache.get_cache_key`로 설정합니다.
```python
from litellm.caching.caching import Cache

cache = Cache(type="redis", host=os.environ['REDIS_HOST'], port=os.environ['REDIS_PORT'], password=os.environ['REDIS_PASSWORD'])

cache.get_cache_key = custom_get_cache_key # set get_cache_key function for your cache

litellm.cache = cache # set litellm.cache to your cache 

```
## 사용자 지정 add/get 캐시 함수 작성 방법 {#how-to-write-custom-addget-cache-functions}
### 1. Cache 초기화 {#1-init-cache}
```python
from litellm.caching.caching import Cache
cache = Cache()
``` 

### 2. 사용자 지정 add/get 캐시 함수 정의 {#2-define-custom-addget-cache-functions}
```python
def add_cache(self, result, *args, **kwargs):
  your logic
  
def get_cache(self, *args, **kwargs):
  your logic
```

### 3. 캐시 add/get 함수를 사용자 지정 add/get 함수에 연결 {#3-point-cache-addget-functions-to-your-addget-functions}
```python
cache.add_cache = add_cache
cache.get_cache = get_cache
```

## 캐시 초기화 매개변수 {#cache-initialization-parameters}

```python
def __init__(
    self,
    type: Optional[Literal["local", "redis", "redis-semantic", "s3", "gcs", "disk"]] = "local",
    supported_call_types: Optional[
        List[Literal["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"]]
    ] = ["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"],
    ttl: Optional[float] = None,
    default_in_memory_ttl: Optional[float] = None,

    # redis cache params
    host: Optional[str] = None,
    port: Optional[str] = None,
    password: Optional[str] = None,
    namespace: Optional[str] = None,
    default_in_redis_ttl: Optional[float] = None,
    redis_flush_size=None,
    
    # GCP IAM Redis authentication params
    gcp_service_account: Optional[str] = None,
    gcp_ssl_ca_certs: Optional[str] = None,
    ssl: Optional[bool] = None,
    ssl_cert_reqs: Optional[Union[str, None]] = None,
    ssl_check_hostname: Optional[bool] = None,

    # redis semantic cache params
    similarity_threshold: Optional[float] = None,
    redis_semantic_cache_embedding_model: str = "text-embedding-ada-002",
    redis_semantic_cache_index_name: Optional[str] = None,

    # s3 Bucket, boto3 configuration
    s3_bucket_name: Optional[str] = None,
    s3_region_name: Optional[str] = None,
    s3_api_version: Optional[str] = None,
    s3_path: Optional[str] = None, # if you wish to save to a specific path
    s3_use_ssl: Optional[bool] = True,
    s3_verify: Optional[Union[bool, str]] = None,
    s3_endpoint_url: Optional[str] = None,
    s3_aws_access_key_id: Optional[str] = None,
    s3_aws_secret_access_key: Optional[str] = None,
    s3_aws_session_token: Optional[str] = None,
    s3_config: Optional[Any] = None,

    # disk cache params
    disk_cache_dir=None,

    # qdrant cache params
    qdrant_api_base: Optional[str] = None,
    qdrant_api_key: Optional[str] = None,
    qdrant_collection_name: Optional[str] = None,
    qdrant_quantization_config: Optional[str] = None,
    qdrant_semantic_cache_embedding_model="text-embedding-ada-002",

    qdrant_semantic_cache_vector_size: Optional[int] = None,
    **kwargs
):
```

## 로깅 {#logging}

캐시 히트는 success 이벤트에 `kwarg["cache_hit"]`로 기록됩니다.

다음은 이 값에 접근하는 예시입니다.

  ```python
  import litellm
from litellm.integrations.custom_logger import CustomLogger
from litellm import completion, acompletion, Cache

# create custom callback for success_events
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"On Success")
        print(f"Value of Cache hit: {kwargs['cache_hit']"})

async def test_async_completion_azure_caching():
    # set custom callback
    customHandler_caching = MyCustomHandler()
    litellm.callbacks = [customHandler_caching]

    # init cache 
    litellm.cache = Cache(type="redis", host=os.environ['REDIS_HOST'], port=os.environ['REDIS_PORT'], password=os.environ['REDIS_PASSWORD'])
    unique_time = time.time()
    response1 = await litellm.acompletion(model="azure/chatgpt-v-2",
                            messages=[{
                                "role": "user",
                                "content": f"Hi 👋 - i'm async azure {unique_time}"
                            }],
                            caching=True)
    await asyncio.sleep(1)
    print(f"customHandler_caching.states pre-cache hit: {customHandler_caching.states}")
    response2 = await litellm.acompletion(model="azure/chatgpt-v-2",
                            messages=[{
                                "role": "user",
                                "content": f"Hi 👋 - i'm async azure {unique_time}"
                            }],
                            caching=True)
    await asyncio.sleep(1) # success callbacks are done in parallel
  ```
