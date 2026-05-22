import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 임베딩 - `/embeddings` {#embeddings---embeddings}

지원되는 Embedding Providers 및 모델은 [여기](https://docs.litellm.ai/docs/embedding/supported_embedding)에서 확인하세요.

## 지원되는 입력 형식 {#supported-input-formats}

`/v1/embeddings` 엔드포인트는 [OpenAI embeddings API specification](https://platform.openai.com/docs/api-reference/embeddings/create)을 따릅니다. 다음 입력 형식을 지원합니다.

| 형식 | 예제 |
|--------|---------|
| 문자열 | `"input": "Hello"` |
| 문자열 배열 | `"input": ["Hello", "World"]` |
| 토큰 배열(정수) | `"input": [1234, 5678, 9012]` |
| 토큰 배열의 배열 | `"input": [[1234, 5678], [9012, 3456]]` |

## 빠른 시작 {#quick-start}
프록시 서버에서 GPT-J embedding(sagemaker endpoint), Amazon Titan embedding(Bedrock), Azure OpenAI embedding 간에 라우팅하는 방법은 다음과 같습니다.

1. config.yaml에서 모델 설정
```yaml
model_list:
  - model_name: sagemaker-embeddings
    litellm_params: 
      model: "sagemaker/berri-benchmarking-gpt-j-6b-fp16"
  - model_name: amazon-embeddings
    litellm_params:
      model: "bedrock/amazon.titan-embed-text-v1"
  - model_name: azure-embeddings
    litellm_params: 
      model: "azure/azure-embedding-model"
      api_base: "os.environ/AZURE_API_BASE" # os.getenv("AZURE_API_BASE")
      api_key: "os.environ/AZURE_API_KEY" # os.getenv("AZURE_API_KEY")
      api_version: "2023-07-01-preview"

general_settings:
  master_key: sk-1234 # [OPTIONAL] if set all calls to proxy will require either this key or a valid generated token
```

2. 프록시 시작
```shell
$ litellm --config /path/to/config.yaml
```

3. embedding 호출 테스트

```shell
curl --location 'http://0.0.0.0:4000/v1/embeddings' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "input": "The food was delicious and the waiter..",
    "model": "sagemaker-embeddings",
}'
```
## 기본 `encoding_format` {#embedding-encoding-format}

LiteLLM의 **OpenAI 호환 embedding 경로**를 통해 라우팅되는 embedding의 경우(예: OpenAI 모델, 사용자 지정 `api_base`를 사용하는 `openai/...`, 또는 해당 경로로 전달하는 프록시 `/v1/embeddings` 라우트), 호출자가 이를 생략하면 LiteLLM이 명시적인 `encoding_format`을 전송합니다.

**해결 순서**(처음 일치하는 값 사용):

1. embedding 요청 본문의 값(JSON의 `encoding_format`).
2. `config.yaml`의 `litellm_params.encoding_format`에서 가져온 모델별 기본값.
3. 프로세스 환경 변수 **`LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT`**(예: `float` 또는 `base64`).
4. fallback **`float`**.

OpenAI 호환 클라이언트에서는 요청별로 계속 재정의할 수 있습니다.

```bash
curl --location 'http://0.0.0.0:4000/v1/embeddings' \
  --header 'Authorization: Bearer sk-1234' \
  --header 'Content-Type: application/json' \
  --data '{"model": "my-embedding-model", "input": "hello", "encoding_format": "base64"}'
```

함께 보기: [Config settings](./config_settings.md)(`LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT`).
