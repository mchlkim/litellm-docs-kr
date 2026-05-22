import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /completions

## 개요

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | 지원되는 모든 모델에서 작동 |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 최종 사용자 추적 | ✅ | |
| Streaming | ✅ | |
| Fallback | ✅ | 지원되는 모델 간에 작동 |
| 로드 밸런싱 | ✅ | 지원되는 모델 간에 작동 |
| 가드레일 | ✅ | 입력 프롬프트와 출력 텍스트에 적용됨(non-streaming만 해당) |
| 지원 프로바이더 | 모든 Chat Completion 프로바이더 | |

### 사용법
<Tabs>
<TabItem value="python" label="LiteLLM Python SDK">

```python
from litellm import text_completion

response = text_completion(
    model="gpt-3.5-turbo-instruct",
    prompt="Say this is a test",
    max_tokens=7
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy Server">

1. `config.yaml`에 모델을 정의합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo-instruct
    litellm_params:
      model: text-completion-openai/gpt-3.5-turbo-instruct # The `text-completion-openai/` prefix will call openai.completions.create
      api_key: os.environ/OPENAI_API_KEY
  - model_name: text-davinci-003
    litellm_params:
      model: text-completion-openai/text-davinci-003
      api_key: os.environ/OPENAI_API_KEY
```

2. LiteLLM Proxy Server를 시작합니다.

```
litellm --config config.yaml
```

<Tabs>
<TabItem value="python" label="OpenAI Python SDK">

```python
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt="Say this is a test",
    max_tokens=7
)

print(response)
```
</TabItem>

<TabItem value="curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{
        "model": "gpt-3.5-turbo-instruct",
        "prompt": "Say this is a test",
        "max_tokens": 7
    }'
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

## 입력 파라미터

LiteLLM은 지원되는 모든 프로바이더에서 [OpenAI Text Completion 파라미터](https://platform.openai.com/docs/api-reference/completions)를 받아 적절한 형식으로 변환합니다.

### 필수 필드

- `model`: *string* - 사용할 모델 ID
- `prompt`: *string or array* - completion을 생성할 프롬프트

### 선택 필드

- `best_of`: *integer* - 서버 측에서 `best_of` 개수만큼 completion을 생성하고 가장 좋은 하나를 반환
- `echo`: *boolean* - completion과 함께 프롬프트도 다시 반환
- `frequency_penalty`: *number* - -2.0에서 2.0 사이의 숫자. 양수 값은 기존 빈도에 따라 새 토큰에 패널티를 적용
- `logit_bias`: *map* - 지정한 토큰이 completion에 나타날 가능성을 수정
- `logprobs`: *integer* - 가능성이 높은 `logprobs` 토큰의 로그 확률을 포함. 최대값은 5
- `max_tokens`: *integer* - 생성할 최대 토큰 수
- `n`: *integer* - 각 프롬프트마다 생성할 completion 수
- `presence_penalty`: *number* - -2.0에서 2.0 사이의 숫자. 양수 값은 지금까지의 텍스트에 등장했는지 여부에 따라 새 토큰에 패널티를 적용
- `seed`: *integer* - 지정하면 시스템이 결정론적 샘플 생성을 시도
- `stop`: *string or array* - API가 토큰 생성을 중단할 최대 4개의 시퀀스
- `stream`: *boolean* - 부분 진행 결과를 스트리밍으로 반환할지 여부. 기본값은 `false`
- `suffix`: *string* - 삽입된 텍스트의 completion 뒤에 오는 접미사
- `temperature`: *number* - 사용할 sampling temperature. 0에서 2 사이
- `top_p`: *number* - temperature sampling의 대안인 nucleus sampling
- `user`: *string* - 최종 사용자를 나타내는 고유 식별자

## 출력 형식
completion 호출에서 기대할 수 있는 정확한 JSON 출력 형식은 다음과 같습니다.


[**OpenAI 출력 형식을 따릅니다**](https://platform.openai.com/docs/api-reference/completions/object)

<Tabs>

<TabItem value="non-streaming" label="Non-Streaming Response">

```python
{
  "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
  "object": "text_completion",
  "created": 1589478378,
  "model": "gpt-3.5-turbo-instruct",
  "system_fingerprint": "fp_44709d6fcb",
  "choices": [
    {
      "text": "\n\nThis is indeed a test",
      "index": 0,
      "logprobs": null,
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 7,
    "total_tokens": 12
  }
}

```
</TabItem>
<TabItem value="streaming" label="Streaming Response">

```python
{
  "id": "cmpl-7iA7iJjj8V2zOkCGvWF2hAkDWBQZe",
  "object": "text_completion",
  "created": 1690759702,
  "choices": [
    {
      "text": "This",
      "index": 0,
      "logprobs": null,
      "finish_reason": null
    }
  ],
  "model": "gpt-3.5-turbo-instruct"
  "system_fingerprint": "fp_44709d6fcb",
}

```

</TabItem>
</Tabs>


## **지원 프로바이더**

| 프로바이더    | 사용법 링크      |
|-------------|--------------------|
| OpenAI      |   [사용법](../docs/providers/text_completion_openai)                 | 
| Azure OpenAI|   [사용법](../docs/providers/azure)                 |  

