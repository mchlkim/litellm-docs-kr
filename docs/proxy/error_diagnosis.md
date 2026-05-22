# 오류 진단 - Provider와 Gateway 구분 {#diagnosing-errors---provider-vs-gateway}

오류가 **LLM Provider**(OpenAI, Anthropic 등)에서 발생했는지, 아니면 **LiteLLM AI Gateway** 자체에서 발생했는지 구분하기 어렵나요? 아래 기준으로 확인할 수 있습니다.

## 빠른 판단 기준 {#quick-rule}

**오류에 `<Provider>Exception`이 포함되어 있으면 provider에서 발생한 오류입니다.**

| 오류에 포함된 값 | 오류 발생 위치 |
|----------------|--------------|
| `AnthropicException` | Anthropic |
| `OpenAIException` | OpenAI |
| `AzureException` | Azure |
| `BedrockException` | AWS Bedrock |
| `VertexAIException` | Google Vertex AI |
| provider 이름 없음 | LiteLLM AI Gateway |

## 예제

### Provider 오류(AWS Bedrock에서 발생) {#provider-error-from-aws-bedrock}

```
{
  "error": {
    "message": "litellm.BadRequestError: BedrockException - {\"message\":\"The model returned the following errors: messages.1.content.0.type: Expected `thinking` or `redacted_thinking`, but found `text`.\"}",
    "type": "invalid_request_error",
    "param": null,
    "code": "400"
  }
}
```

이 오류는 **AWS Bedrock**에서 발생했습니다(`BedrockException` 확인). Bedrock API가 잘못된 메시지 형식 때문에 요청을 거부한 것이며, LiteLLM 문제가 아닙니다.

### Provider 오류(OpenAI에서 발생) {#provider-error-from-openai}

```
{
  "error": {
    "message": "litellm.AuthenticationError: OpenAIException - Incorrect API key provided: <my-key>. You can find your API key at https://platform.openai.com/account/api-keys.",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

이 오류는 **OpenAI**에서 발생했습니다(`OpenAIException` 확인). LiteLLM에 설정된 OpenAI API 키가 유효하지 않습니다.

### Provider 오류(Anthropic에서 발생) {#provider-error-from-anthropic}

```
{
  "error": {
    "message": "litellm.InternalServerError: AnthropicException - Overloaded. Handle with `litellm.InternalServerError`.",
    "type": "internal_server_error",
    "param": null,
    "code": "500"
  }
}
```

이 오류는 **Anthropic**에서 발생했습니다(`AnthropicException` 확인). Anthropic API에 부하가 걸린 상태이며, LiteLLM 문제가 아닙니다.

### Gateway 오류(LiteLLM에서 발생) {#gateway-error-from-litellm}

```
{
  "error": {
    "message": "Invalid API Key. Please check your LiteLLM API key.",
    "type": "auth_error",
    "param": null,
    "code": "401"
  }
}
```

이 오류는 **LiteLLM AI Gateway**에서 발생했습니다(provider 이름 없음). LiteLLM virtual key가 유효하지 않습니다.

## 어떻게 해야 하나요? {#what-to-do}

| 오류 발생 위치 | 조치 |
|--------------|--------|
| Provider 오류 | provider 상태 페이지를 확인하고, rate limit을 조정하거나 나중에 다시 시도합니다 |
| Gateway 오류 | LiteLLM 설정과 API 키를 확인하거나 [issue를 생성](https://github.com/BerriAI/litellm/issues)합니다 |

## 함께 보기 {#see-also}

- [Debugging](/litellm-docs-kr/docs/proxy/debugging) - 자세한 요청/응답 정보를 확인할 수 있도록 debug log를 활성화합니다
- [Exception Mapping](/litellm-docs-kr/docs/exception_mapping) - LiteLLM exception type 전체 목록입니다
