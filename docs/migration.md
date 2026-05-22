# LiteLLM v1.0.0+ 마이그레이션 가이드 {#migration-guide-litellm-v100}

호환성이 깨지는 변경 사항(예: `1.x.x`에서 `2.x.x`로 이동)이 있을 때 이곳에 문서화합니다.


## `1.0.0` 

**호환성 변경 전 마지막 릴리스**: 0.14.0

**무엇이 바뀌었나요?**

- `openai>=1.0.0` 필요
- `openai.InvalidRequestError` → `openai.BadRequestError`
- `openai.ServiceUnavailableError` → `openai.APIStatusError`
- *NEW* `api_key`를 전달할 수 있는 `litellm` 클라이언트
    - `litellm.Litellm(api_key="sk-123")`
- 응답 객체는 이제 `BaseModel`을 상속합니다(이전: `OpenAIObject`).
- *NEW* 기본 예외 - `APIConnectionError`(이전: `APIError`)
- `litellm.get_max_tokens()`는 이제 dict가 아니라 int를 반환합니다.
    ```python
    max_tokens = litellm.get_max_tokens("gpt-3.5-turbo") # returns an int not a dict 
    assert max_tokens==4097
    ```
- Streaming - OpenAI Chunk는 빈 stream chunk에 대해 이제 `None`을 반환합니다. content가 있는 stream chunk는 다음처럼 처리하세요.
    ```python
    response = litellm.completion(model="gpt-3.5-turbo", messages=messages, stream=True)
    for part in response:
        print(part.choices[0].delta.content or "")
    ```

**변경 사항을 더 잘 전달하려면 어떻게 하면 좋을까요?**
알려 주세요.
- [Discord](https://discord.com/invite/wuPM9dRgDw)
- Email (support@berri.ai)
