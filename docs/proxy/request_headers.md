# 요청 헤더 {#request-headers}

LiteLLM이 지원하는 특수 헤더입니다.

## 헤더 전달 {#header-forwarding}

기본적으로 LiteLLM은 client header를 LLM provider API로 전달하지 않습니다. 다만 특정 model group에 대해 header forwarding을 선택적으로 활성화할 수 있습니다. [header forwarding 설정 자세히 보기](./forward_client_headers.md).

## LiteLLM 헤더 {#litellm-headers}

`x-litellm-timeout` Optional[float]: 요청 timeout(초)입니다.

`x-litellm-stream-timeout` Optional[float]: 응답의 첫 번째 chunk를 받을 때까지의 timeout(초)입니다. streaming 요청에만 적용됩니다. [데모 영상](https://www.loom.com/share/8da67e4845ce431a98c901d4e45db0e5)

`x-litellm-enable-message-redaction`: Optional[bool]: logging integration에 message content를 기록하지 않고 spend만 추적합니다. [자세히 보기](./logging#redact-messages-response-content)

`x-litellm-tags`: Optional[str]: [태그 기반 라우팅](./tag_routing) **또는** [지출 추적](./cost_tracking#custom-tags)에 사용할 tag의 쉼표 구분 목록입니다(예: `tag1,tag2,tag3`).

`x-litellm-num-retries`: Optional[int]: 요청 retry 횟수입니다.

`x-litellm-spend-logs-metadata`: Optional[str]: spend log에 포함할 custom metadata가 들어 있는 JSON 문자열입니다. 예: `{"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}`. [자세히 보기](./cost_tracking)

`x-litellm-customer-id`: Optional[str]: customer/end-user ID를 전달하는 표준 header입니다. 별도 설정 없이 항상 확인됩니다. [자세히 보기](./customers)

`x-litellm-end-user-id`: Optional[str]: customer/end-user ID를 전달하는 표준 header입니다. 별도 설정 없이 항상 확인됩니다. [자세히 보기](./customers)

## Anthropic 헤더 {#anthropic-headers}

`anthropic-version` Optional[str]: 사용할 Anthropic API 버전입니다.  
`anthropic-beta` Optional[str]: 사용할 Anthropic API beta 버전입니다.
    - `/v1/messages` 엔드포인트에서는 이 header가 항상 underlying model로 전달됩니다.
    - `/chat/completions` 엔드포인트에서는 model이 `forward_client_headers_to_llm_api`에 설정된 경우에만 전달됩니다. [자세히 보기](./forward_client_headers.md)

## OpenAI 헤더 {#openai-headers}

`openai-organization` Optional[str]: OpenAI API에 사용할 organization입니다. 현재는 `general_settings::forward_openai_org_id: true`로 활성화해야 합니다.

## 사용자 지정 헤더 {#custom-headers}

`x-`로 시작하는 custom header는 model이 `forward_client_headers_to_llm_api`에 설정된 경우 LLM provider API로 전달할 수 있습니다. [header forwarding 설정 자세히 보기](./forward_client_headers.md).
