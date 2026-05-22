# Claude Code - 프롬프트 캐시 라우팅 {#claude-code---prompt-cache-routing}

Claude의 [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) 기능은 프롬프트를 캐시하고 이후 API 호출에서 캐시된 프롬프트를 재사용하도록 시도하여 API 사용량을 최적화하는 데 도움이 됩니다. Claude Code는 이 기능을 사용합니다.

LiteLLM [load balancing](../proxy/load_balancing.md)이 활성화되어 있을 때 Claude Code에서 이 prompt caching 기능이 계속 작동하도록 하려면 LiteLLM이 `PromptCachingDeploymentCheck` pre-call check를 사용하도록 구성해야 합니다. 이 pre-call check는 prompt caching을 사용한 API 호출을 기억하고, 이후 해당 prompt caching을 사용하려는 API 호출이 캐시 쓰기가 발생했던 동일한 모델 배포로 라우팅되도록 보장합니다.

## 설정 {#set-up}

1. 라우터가 `PromptCachingDeploymentCheck`를 사용하도록 구성하고(`optional_pre_call_checks` 속성 설정을 통해), 모델이 여러 Claude 배포에 접근할 수 있도록 구성합니다. 아래에서는 여러 AWS 계정(`aws_profile_name` 속성을 사용하며 `account-1` 및 `account-2`로 지칭)에 대한 예시를 보여줍니다.
```yaml
router_settings:
  optional_pre_call_checks: ["prompt_caching"]

model_list:
- litellm_params:
    model: us.anthropic.claude-sonnet-4-5-20250929-v1:0
    aws_profile_name: account-1
    aws_region_name: us-west-2
  model_info:
    litellm_provider: bedrock
  model_name: us.anthropic.claude-sonnet-4-5-20250929-v1:0
- litellm_params:
    model: us.anthropic.claude-sonnet-4-5-20250929-v1:0
    aws_profile_name: account-2
    aws_region_name: us-west-2
  model_info:
    litellm_provider: bedrock
  model_name: us.anthropic.claude-sonnet-4-5-20250929-v1:0
```
2. Claude Code를 사용합니다.
   1. Claude Code를 실행합니다. 그러면 warm-up prompt와 system prompt를 캐시하려는 warm-up API 호출이 수행됩니다.
   2. 몇 초 기다린 다음 Claude Code를 종료하고 다시 엽니다.
   3. warm-up API 호출에서 cache hit가 성공적으로 발생하는 것을 확인할 수 있습니다. VS Code 같은 IDE에서 Claude Code를 사용하는 경우, 여기의 2.1단계와 2.2단계 사이에 아무 작업도 하지 않아야 합니다. 그렇지 않으면 cache hit가 발생하지 않을 수 있습니다.
      1. 관리자 UI에서 [LiteLLM Request Logs page](../proxy/ui_logs.md)로 이동합니다.
      2. 개별 요청을 클릭하여 (a) cache creation 및 cache read tokens, (b) Model ID를 확인합니다. 특히 2.1단계의 API 호출에는 cache write가 표시되어야 하고, 2.2단계의 API 호출에는 cache read가 표시되어야 합니다. 또한 Model ID가 같아야 합니다. 이는 API 호출이 동일한 AWS 계정으로 전달되고 있음을 의미합니다.

## 관련 문서 {#related}

- [Claude Code - 빠른 시작](./claude_responses_api.md)
- [Claude Code - 고객 추적](./claude_code_customer_tracking.md)
- [Claude Code - Plugin Marketplace 안내](./claude_code_plugin_marketplace.md)
- [Claude Code - WebSearch 안내](./claude_code_websearch.md)
- [Proxy - 로드 밸런싱](../proxy/load_balancing.md)
