# Exception Mapping

LiteLLM은 모든 provider의 exception을 대응되는 OpenAI exception으로 매핑합니다.

모든 exception은 `litellm`에서 import할 수 있습니다. 예: `from litellm import BadRequestError`

## LiteLLM Exception

| Status Code | Error Type               | 상속 대상 | 설명 |
|-------------|--------------------------|---------------|-------------|
| 400         | `BadRequestError`          | `openai.BadRequestError` |
| 400 | `UnsupportedParamsError` | `litellm.BadRequestError` | 지원되지 않는 parameter가 전달될 때 발생 |
| 400         | `ContextWindowExceededError`| `litellm.BadRequestError` | context window 초과 error message용 특수 error type입니다. context window fallback을 활성화합니다. |
| 400         | `ContentPolicyViolationError`| `litellm.BadRequestError` | content policy violation error message용 특수 error type입니다. content policy fallback을 활성화합니다. |
| 400         | `ImageFetchError` | `litellm.BadRequestError` | image fetch 또는 processing 중 error가 발생할 때 발생 |
| 400 | `InvalidRequestError` | `openai.BadRequestError` | Deprecated error입니다. 대신 `BadRequestError`를 사용하세요. |
| 401         | `AuthenticationError`      | `openai.AuthenticationError` |
| 403         | `PermissionDeniedError`    | `openai.PermissionDeniedError` |
| 404         | `NotFoundError`            | `openai.NotFoundError` | 잘못된 model이 전달될 때 발생합니다. 예: `gpt-8` |
| 408 | `Timeout` | `openai.APITimeoutError` | timeout 발생 시 발생 |
| 422         | `UnprocessableEntityError` | `openai.UnprocessableEntityError` |
| 429         | `RateLimitError`           | `openai.RateLimitError` |
| 500         | `APIConnectionError`       | `openai.APIConnectionError` | 매핑되지 않은 error가 반환되면 이 error를 반환합니다. |
| 500         | `APIError` | `openai.APIError` | 일반적인 500 status code error | 
| 503 | `ServiceUnavailableError` | `openai.APIStatusError` | provider가 service unavailable error를 반환하면 이 error가 발생합니다. |
| >=500       | `InternalServerError`      | `openai.InternalServerError` | 매핑되지 않은 500 status code error가 반환되면 이 error가 발생합니다. |
| N/A         | `APIResponseValidationError` | `openai.APIResponseValidationError` | Rules가 사용되고 request/response가 rule을 통과하지 못하면 이 error가 발생합니다. |
| N/A | `BudgetExceededError` | `Exception` | proxy에서 budget이 초과되었을 때 발생 |
| N/A | `JSONSchemaValidationError` | `litellm.APIResponseValidationError` | response가 예상 json schema와 일치하지 않을 때 발생합니다. `response_schema` parameter가 `enforce_validation=True`와 함께 전달된 경우 사용됩니다. |
| N/A | `MockException` | `Exception` | mock_completion class에서 발생하는 internal exception입니다. 직접 사용하지 마세요. | 
| N/A | `OpenAIError` | `openai.OpenAIError` | Deprecated internal exception이며 `openai.OpenAIError`를 상속합니다. |



기본 case에서는 APIConnectionError를 반환합니다.

모든 LiteLLM exception은 OpenAI exception type을 상속하므로, 기존 OpenAI용 error handling은 LiteLLM에서도 바로 동작합니다.

모든 경우 반환되는 exception은 원래 OpenAI Exception을 상속하지만, 다음 3개 attribute를 추가로 포함합니다.

* `status_code` - exception의 HTTP status code
* `message` - error message
* `llm_provider` - exception을 발생시킨 provider

## 사용법

```python 
import litellm
import openai

try:
    response = litellm.completion(
                model="gpt-4",
                messages=[
                    {
                        "role": "user",
                        "content": "hello, write a 20 pageg essay"
                    }
                ],
                timeout=0.01, # this will raise a timeout exception
            )
except openai.APITimeoutError as e:
    print("Passed: Raised correct exception. Got openai.APITimeoutError\nGood Job", e)
    print(type(e))
    pass
```

## 사용법 - Streaming Exception 처리
```python
import litellm
try:
    response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": "hello, write a 20 pg essay"
            }
        ],
        timeout=0.0001, # this will raise an exception
        stream=True,
    )
    for chunk in response:
        print(chunk)
except openai.APITimeoutError as e:
    print("Passed: Raised correct exception. Got openai.APITimeoutError\nGood Job", e)
    print(type(e))
    pass
except Exception as e:
    print(f"Did not raise error `openai.APITimeoutError`. Instead raised error type: {type(e)}, Error: {e}")

```

## 사용법 - Exception 재시도 여부 판단

```
import litellm
import openai

try:
    response = litellm.completion(
                model="gpt-4",
                messages=[
                    {
                        "role": "user",
                        "content": "hello, write a 20 pageg essay"
                    }
                ],
                timeout=0.01, # this will raise a timeout exception
            )
except openai.APITimeoutError as e:
    should_retry = litellm._should_retry(e.status_code)
    print(f"should_retry: {should_retry}")
```

## 고급

### Provider별 Error Detail 접근

LiteLLM exception에는 각 provider에 특화된 추가 error 정보를 담는 `provider_specific_fields` attribute가 포함됩니다. 특히 상세한 content filtering 정보를 제공하는 Azure OpenAI에서 유용합니다.

#### Azure OpenAI - Content Policy Violation inner error 접근

Azure OpenAI가 content policy violation을 반환하면 `innererror` field를 통해 상세 content filtering 결과에 접근할 수 있습니다.

```python
import litellm
from litellm.exceptions import ContentPolicyViolationError

try:
    response = litellm.completion(
        model="azure/gpt-4",
        messages=[
            {
                "role": "user", 
                "content": "Some content that might violate policies"
            }
        ]
    )
except ContentPolicyViolationError as e:
    # Access Azure-specific error details
    if e.provider_specific_fields and "innererror" in e.provider_specific_fields:
        innererror = e.provider_specific_fields["innererror"]
        
        # Access content filter results
        content_filter_result = innererror.get("content_filter_result", {})
        
        print(f"Content filter code: {innererror.get('code')}")
        print(f"Hate filtered: {content_filter_result.get('hate', {}).get('filtered')}")
        print(f"Violence severity: {content_filter_result.get('violence', {}).get('severity')}")
        print(f"Sexual content filtered: {content_filter_result.get('sexual', {}).get('filtered')}")
```

**예제 Response 구조:**

LiteLLM proxy를 호출할 때 content policy violation이 발생하면 상세 filtering 정보가 반환됩니다.

```json
{
  "error": {
    "message": "litellm.ContentPolicyViolationError: AzureException - The response was filtered due to the prompt triggering Azure OpenAI's content management policy...",
    "type": null,
    "param": null,
    "code": "400",
    "provider_specific_fields": {
      "innererror": {
        "code": "ResponsibleAIPolicyViolation",
        "content_filter_result": {
          "hate": {
            "filtered": true,
            "severity": "high"
          },
          "jailbreak": {
            "filtered": false,
            "detected": false
          },
          "self_harm": {
            "filtered": false,
            "severity": "safe"
          },
          "sexual": {
            "filtered": false,
            "severity": "safe"
          },
          "violence": {
            "filtered": true,
            "severity": "medium"
          }
        }
      }
    }
  }
}
```

## 세부 정보 

구현 방식은 [코드](https://github.com/BerriAI/litellm/blob/a42c197e5a6de56ea576c73715e6c7c6b19fa249/litellm/utils.py#L1217)를 확인하세요.

exception mapping을 개선하고 싶다면 [issue를 생성](https://github.com/BerriAI/litellm/issues/new)하거나 [PR을 제출](https://github.com/BerriAI/litellm/pulls)하세요.

**참고** OpenAI와 Azure의 경우 원래 exception을 반환합니다. 둘 다 OpenAI Error type이기 때문입니다. 다만 여기에 `llm_provider` attribute를 추가합니다. [code 보기](https://github.com/BerriAI/litellm/blob/a42c197e5a6de56ea576c73715e6c7c6b19fa249/litellm/utils.py#L1221)

## Custom mapping 목록

기본 case에서는 `litellm.APIConnectionError` exception을 반환합니다. 이 exception은 OpenAI의 `APIConnectionError` exception을 상속합니다.

| `custom_llm_provider`        | `Timeout` | `ContextWindowExceededError` | `BadRequestError` | `NotFoundError` | `ContentPolicyViolationError` | `AuthenticationError` | `APIError` | `RateLimitError` | `ServiceUnavailableError` | `PermissionDeniedError` | `UnprocessableEntityError` |
|----------------------------|---------|----------------------------|------------------|---------------|-----------------------------|---------------------|----------|----------------|-------------------------|-----------------------|-------------------------|
| `openai`                     | ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| `watsonx`                     |       | | | | | | |✓| | | |
| `text-completion-openai`     | ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| `custom_openai`              | ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| `openai_compatible_providers`| ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| `anthropic`                  | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          |                | ✓                       | ✓                     |                           |
| `replicate`                  | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          | ✓              | ✓                       |                       |                           |
| `bedrock`                    | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          | ✓              | ✓                       | ✓                     |                           |
| `sagemaker`                  |         | ✓                          | ✓                |               |                             |                     |          |                |                         |                       |                           |
| `vertex_ai`                  | ✓       |                            | ✓                |               |                             |                     | ✓        |                |                         |                       | ✓                         |
| `palm`                       | ✓       | ✓                          |                  |               |                             |                     | ✓        |                |                         |                       |                           |
| `gemini`                     | ✓       | ✓                          |                  |               |                             |                     | ✓        |                |                         |                       |                           |
| `cloudflare`                 |         |                            | ✓                |               |                             | ✓                   |          |                |                         |                       |                           |
| `cohere`                     |         | ✓                          | ✓                |               |                             | ✓                   |          |                | ✓                       |                       |                           |
| `cohere_chat`                |         | ✓                          | ✓                |               |                             | ✓                   |          |                | ✓                       |                       |                           |
| `huggingface`                | ✓       | ✓                          | ✓                |               |                             | ✓                   |          | ✓              | ✓                       |                       |                           |
| `ai21`                       | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          | ✓              |                         |                       |                           |
| `nlp_cloud`                  | ✓       | ✓                          | ✓                |               |                             | ✓                   | ✓        | ✓              | ✓                       |                       |                           |
| `together_ai`                | ✓       | ✓                          | ✓                |               |                             | ✓                   |          |                |                         |                       |                           |
| `aleph_alpha`                |         |                            | ✓                |               |                             | ✓                   |          |                |                         |                       |                           |
| `ollama`                     | ✓       |                            | ✓                |               |                             |                     |          |                | ✓                       |                       |                           |
| `ollama_chat`                | ✓       |                            | ✓                |               |                             |                     |          |                | ✓                       |                       |                           |
| `vllm`                       |         |                            |                  |               |                             | ✓                   | ✓        |                |                         |                       |                           |
| `azure`                      | ✓       | ✓                          | ✓                | ✓             | ✓                           | ✓                   |          |                | ✓                       |                       |                           |

- "✓"는 지정된 `custom_llm_provider`가 해당 exception을 발생시킬 수 있음을 의미합니다.
- 빈 cell은 연결이 없거나, 해당 provider가 그 특정 exception type을 발생시키지 않음을 의미합니다.


> 이러한 exception을 더 깊이 이해하려면 [이 구현](https://github.com/BerriAI/litellm/blob/d7e58d13bf9ba9edbab2ab2f096f3de7547f35fa/litellm/utils.py#L1544)을 참고하세요.

`ContextWindowExceededError`는 `InvalidRequestError`의 subclass입니다. exception handling 시나리오에서 더 세밀한 처리를 제공하기 위해 도입되었습니다. 자세한 내용은 [이 issue](https://github.com/BerriAI/litellm/issues/228)를 참고하세요.

exception mapping 개선 기여는 [환영합니다](https://github.com/BerriAI/litellm#contributing).
