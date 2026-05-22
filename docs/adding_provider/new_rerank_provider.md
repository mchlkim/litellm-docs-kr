# Rerank Provider 추가하기

LiteLLM은 모든 rerank provider에 대해 **Cohere Rerank API 형식**을 따릅니다. 새 rerank provider를 추가하는 방법은 다음과 같습니다.

## 1. transformation.py 파일 만들기

[`BaseRerankConfig`](https://github.com/BerriAI/litellm/blob/main/litellm/llms/base_llm/rerank/transformation.py)를 상속하는 `<Provider><Endpoint>Config` 이름의 config class를 만듭니다.

```python
from litellm.types.rerank import OptionalRerankParams, RerankRequest, RerankResponse
class YourProviderRerankConfig(BaseRerankConfig):
    def get_supported_cohere_rerank_params(self, model: str) -> list:
        return [
            "query",
            "documents",
            "top_n",
            # ... other supported params
        ]

    def transform_rerank_request(self, model: str, optional_rerank_params: Dict, headers: dict) -> dict:
        # Transform request to RerankRequest spec
        return rerank_request.model_dump(exclude_none=True)

    def transform_rerank_response(self, model: str, raw_response: httpx.Response, ...) -> RerankResponse:
        # Transform provider response to RerankResponse
        return RerankResponse(**raw_response_json)
```


## 2. Provider 등록하기
`litellm.utils.get_provider_rerank_config()`에 provider를 추가합니다.

```python
elif litellm.LlmProviders.YOUR_PROVIDER == provider:
    return litellm.YourProviderRerankConfig()
```


## 3. `rerank_api/main.py`에 Provider 추가하기

provider가 호출될 때 처리할 코드 블록을 추가합니다. 이 provider는 `base_llm_http_handler.rerank` 메서드를 사용해야 합니다.


```python
elif _custom_llm_provider == "your_provider":
    ...
    response = base_llm_http_handler.rerank(
        model=model,
        custom_llm_provider=_custom_llm_provider,
        optional_rerank_params=optional_rerank_params,
        logging_obj=litellm_logging_obj,
        timeout=optional_params.timeout,
        api_key=dynamic_api_key or optional_params.api_key,
        api_base=api_base,
        _is_async=_is_async,
        headers=headers or litellm.headers or {},
        client=client,
        mod el_response=model_response,
    )
    ...
```

## 4. 테스트 추가하기

[`tests/llm_translation`](https://github.com/BerriAI/litellm/tree/main/tests/llm_translation)에 테스트 파일을 추가합니다.

```python
def test_basic_rerank_cohere():
    response = litellm.rerank(
        model="cohere/rerank-english-v3.0",
        query="hello",
        documents=["hello", "world"],
        top_n=3,
    )

    print("re rank response: ", response)

    assert response.id is not None
    assert response.results is not None
```


## 참고 PR
- [Infinity Rerank 추가](https://github.com/BerriAI/litellm/pull/7321)
