# 태그 기반 라우팅

태그를 기준으로 요청을 라우팅합니다.
다음과 같은 경우에 유용합니다.
- 사용자에게 무료 / 유료 티어 구현
- 팀별 모델 접근 제어. 예를 들어 Team A는 gpt-4 deployment A에, Team B는 gpt-4 deployment B에 접근할 수 있습니다(팀용 LLM 접근 제어).

:::info
## 지출 태그는 여기에서 확인하세요
- [태그별 지출 추적](cost_tracking#custom-tags)
- [가상 키 및 팀별 예산 설정](users)
:::

## 빠른 시작

### 1. config.yaml에 태그 정의

- `tags=["free"]`가 있는 요청은 `openai/fake`로 라우팅됩니다.
- `tags=["paid"]`가 있는 요청은 `openai/gpt-4o`로 라우팅됩니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["free"] # 👈 Key Change
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
      tags: ["paid"] # 👈 Key Change
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["default"] # OPTIONAL - All untagged requests will get routed to this
  

router_settings:
  enable_tag_filtering: True # 👈 Key Change
general_settings: 
  master_key: sk-1234 
```

### 2. `tags=["free"]`로 요청 보내기

이 요청에는 "tags": ["free"]가 포함되어 `openai/fake`로 라우팅됩니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ],
    "tags": ["free"]
  }'
```
**예상 응답**

정상 작동하면 다음 응답 헤더가 표시됩니다.
```shell
x-litellm-model-api-base: https://exampleopenaiendpoint-production.up.railway.app/
```

응답
```shell
{
 "id": "chatcmpl-33c534e3d70148218e2d62496b81270b",
 "choices": [
   {
     "finish_reason": "stop",
     "index": 0,
     "message": {
       "content": "\n\nHello there, how may I assist you today?",
       "role": "assistant",
       "tool_calls": null,
       "function_call": null
     }
   }
 ],
 "created": 1677652288,
 "model": "gpt-3.5-turbo-0125",
 "object": "chat.completion",
 "system_fingerprint": "fp_44709d6fcb",
 "usage": {
   "completion_tokens": 12,
   "prompt_tokens": 9,
   "total_tokens": 21
 }
}
```


### 3. `tags=["paid"]`로 요청 보내기

이 요청에는 "tags": ["paid"]가 포함되어 `openai/gpt-4`로 라우팅됩니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ],
    "tags": ["paid"]
  }'
```

**예상 응답**

정상 작동하면 다음 응답 헤더가 표시됩니다.
```shell
x-litellm-model-api-base: https://api.openai.com
```

응답
```shell
{
 "id": "chatcmpl-9maCcqQYTqdJrtvfakIawMOIUbEZx",
 "choices": [
   {
     "finish_reason": "stop",
     "index": 0,
     "message": {
       "content": "Good morning! How can I assist you today?",
       "role": "assistant",
       "tool_calls": null,
       "function_call": null
     }
   }
 ],
 "created": 1721365934,
 "model": "gpt-4o-2024-05-13",
 "object": "chat.completion",
 "system_fingerprint": "fp_c4e5b6fa31",
 "usage": {
   "completion_tokens": 10,
   "prompt_tokens": 12,
   "total_tokens": 22
 }
}
```

## 요청 헤더로 호출

요청 헤더 `x-litellm-tags`를 통해서도 호출할 수 있습니다.

```shell
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-H 'x-litellm-tags: free,my-custom-tag' \
-d '{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how'\''s it going 123456?"
    }
  ]
}'
```

## 기본 태그 설정

태그가 없는 모든 요청을 특정 배포로 라우팅하려면 이 옵션을 사용하세요.

1. yaml에 기본 태그 설정
```yaml
  model_list:
    - model_name: fake-openai-endpoint
      litellm_params:
        model: openai/fake
        api_key: fake-key
        api_base: https://exampleopenaiendpoint-production.up.railway.app/
        tags: ["default"] # 👈 Key Change - All untagged requests will get routed to this
      model_info:
        id: "default-model" # used for identifying model in response headers
```

2. 프록시 시작
```shell
$ litellm --config /path/to/config.yaml
```

3. 태그 없이 요청 보내기
```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
  }'
```

정상 작동하면 다음 응답 헤더가 표시됩니다.
```shell
x-litellm-model-id: default-model
```

## 정규식 기반 태그 라우팅(`tag_regex`)

클라이언트가 명시적으로 태그를 전달하지 않아도, 요청 헤더와 일치하는 정규식 패턴을 기준으로 요청을 라우팅하려면 `tag_regex`를 사용하세요. 클라이언트가 `User-Agent`처럼 식별 가능한 헤더를 이미 보내는 경우에 유용합니다.

**사용 사례: 모든 Claude Code 트래픽을 전용 AWS 계정으로 라우팅**

Claude Code는 항상 `User-Agent: claude-code/<version>`을 보냅니다. `tag_regex`를 사용하면 개발자별 설정 없이도 해당 트래픽을 전용 배포로 자동 라우팅할 수 있습니다.

### 1. 설정

```yaml
model_list:
  # Claude Code traffic → dedicated deployment, matched by User-Agent
  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/converse/anthropic-claude-sonnet-4-6
      aws_region_name: us-east-1
      aws_role_name: arn:aws:iam::111122223333:role/LiteLLMClaudeCode
      tag_regex:
        - "^User-Agent: claude-code\\/"   # matches claude-code/1.x, 2.x, etc.
    model_info:
      id: claude-code-deployment

  # All other traffic falls back to the default deployment
  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/converse/anthropic-claude-sonnet-4-6
      aws_region_name: us-east-1
      aws_role_name: arn:aws:iam::444455556666:role/LiteLLMDefault
      tags:
        - default
    model_info:
      id: regular-deployment

router_settings:
  enable_tag_filtering: true
  tag_filtering_match_any: true

general_settings:
  master_key: sk-1234
```

### 2. 라우팅 확인

Claude Code는 `User-Agent: claude-code/<version>`을 자동으로 설정하므로 클라이언트 설정이 필요하지 않습니다.

```shell
# Claude Code request (User-Agent set automatically by Claude Code)
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "User-Agent: claude-code/1.2.3" \
  -d '{"model": "claude-sonnet", "messages": [{"role": "user", "content": "hi"}]}'
# → x-litellm-model-id: claude-code-deployment

# Any other client (no matching User-Agent) → default deployment
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -d '{"model": "claude-sonnet", "messages": [{"role": "user", "content": "hi"}]}'
# → x-litellm-model-id: regular-deployment
```

### 매칭 방식

| 우선순위 | 조건 | 결과 |
|----------|-----------|--------|
| 1 | 요청에 `tags`가 있고 배포에도 `tags`가 있음 | 정확한 태그 매칭(`match_any` 설정 준수) |
| 2 | 배포에 `tag_regex`가 있고 요청에 `User-Agent`가 있음 | 정규식 매칭(항상 OR 로직, 패턴 하나만 일치해도 충분) |
| 3 | 배포에 `tags: [default]`가 있음 | 기본값으로 폴백 |
| 4 | 기본값이 설정되지 않음 | 정상 상태인 모든 배포 반환 |

`tag_regex`는 항상 OR 의미 체계를 사용합니다. `tag_filtering_match_any=False`는 정확한 태그 매칭에만 적용되며 정규식 패턴에는 적용되지 않습니다.

### 관측성

정규식이 일치하면 `tag_routing`이 요청 메타데이터에 기록되고 지출 로그로 전달됩니다.

```json
{
  "tag_routing": {
    "matched_via": "tag_regex",
    "matched_value": "^User-Agent: claude-code\\/",
    "user_agent": "claude-code/1.2.3",
    "request_tags": []
  }
}
```

### 보안 참고

:::caution

**`User-Agent`는 클라이언트가 제공하는 헤더이며 어떤 값으로든 설정할 수 있습니다.** 실제로 Claude Code를 사용하는지와 관계없이 모든 API 소비자가 `User-Agent: claude-code/1.0`을 보낼 수 있습니다.

접근 제어나 지출 한도를 강제하기 위해 `tag_regex` 라우팅에 의존하지 마세요. 해당 용도에는 [팀/키 기반 라우팅](./users)을 사용하세요. `tag_regex`는 **트래픽 분류 힌트**이며(청구 가시성, 용량 계획, 라우팅 편의성에 유용), 보안 경계가 아닙니다.

:::


---

## ✨ 팀 기반 태그 라우팅(엔터프라이즈)

LiteLLM Proxy는 팀 기반 태그 라우팅을 지원하므로, 특정 태그를 팀에 연결하고 그에 따라 요청을 라우팅할 수 있습니다. 예: **Team A는 gpt-4 deployment A에, Team B는 gpt-4 deployment B에 접근할 수 있습니다**(팀용 LLM 접근 제어).

:::info

이 기능은 엔터프라이즈 기능입니다. [무료 체험을 원하시면 여기로 문의하세요](https://enterprise.litellm.ai/demo).

:::

curl 명령으로 팀 기반 태그 라우팅을 설정하고 사용하는 방법은 다음과 같습니다.

1. **프록시 구성에서 태그 필터링 활성화:**

   `proxy_config.yaml`에 다음 설정이 있는지 확인하세요.

   ```yaml
   model_list:
    - model_name: fake-openai-endpoint
      litellm_params:
        model: openai/fake
        api_key: fake-key
        api_base: https://exampleopenaiendpoint-production.up.railway.app/
        tags: ["teamA"] # 👈 Key Change
      model_info:
        id: "team-a-model" # used for identifying model in response headers
    - model_name: fake-openai-endpoint
      litellm_params:
        model: openai/fake
        api_key: fake-key
        api_base: https://exampleopenaiendpoint-production.up.railway.app/
        tags: ["teamB"] # 👈 Key Change
      model_info:
        id: "team-b-model" # used for identifying model in response headers
    - model_name: fake-openai-endpoint
      litellm_params:
        model: openai/fake
        api_key: fake-key
        api_base: https://exampleopenaiendpoint-production.up.railway.app/
        tags: ["default"] # OPTIONAL - All untagged requests will get routed to this

  router_settings:
    enable_tag_filtering: True # 👈 Key Change

  general_settings: 
    master_key: sk-1234 
    ```

2. **태그가 있는 팀 생성:**

   `/team/new` 엔드포인트를 사용하여 특정 태그가 있는 팀을 생성합니다.

   ```shell
   # Create Team A
   curl -X POST http://0.0.0.0:4000/team/new \
     -H "Authorization: Bearer sk-1234" \
     -H "Content-Type: application/json" \
     -d '{"tags": ["teamA"]}'
   ```

   ```shell
   # Create Team B
   curl -X POST http://0.0.0.0:4000/team/new \
     -H "Authorization: Bearer sk-1234" \
     -H "Content-Type: application/json" \
     -d '{"tags": ["teamB"]}'
   ```

   이 명령은 각 팀의 `team_id`가 포함된 JSON 응답을 반환합니다.

3. **팀 멤버용 키 생성:**

   `/key/generate` 엔드포인트를 사용하여 특정 팀에 연결된 키를 생성합니다.

   ```shell
   # Generate key for Team A
   curl -X POST http://0.0.0.0:4000/key/generate \
     -H "Authorization: Bearer sk-1234" \
     -H "Content-Type: application/json" \
     -d '{"team_id": "team_a_id_here"}'
   ```

   ```shell
   # Generate key for Team B
   curl -X POST http://0.0.0.0:4000/key/generate \
     -H "Authorization: Bearer sk-1234" \
     -H "Content-Type: application/json" \
     -d '{"team_id": "team_b_id_here"}'
   ```

   `team_a_id_here`와 `team_b_id_here`를 2단계에서 받은 실제 팀 ID로 바꾸세요.

4. **라우팅 확인:**

   응답의 `x-litellm-model-id` 헤더를 확인하여 요청이 팀 태그에 따라 올바른 모델로 라우팅되었는지 확인합니다. 응답 헤더를 포함하려면 curl에 `-i` 플래그를 사용할 수 있습니다.
  
   Team A의 키로 요청(헤더 포함)
   ```shell
   curl -i -X POST http://0.0.0.0:4000/chat/completions \
     -H "Authorization: Bearer team_a_key_here" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "fake-openai-endpoint",
       "messages": [
         {"role": "user", "content": "Hello!"}
       ]
     }'
   ```

   응답 헤더에서 다음을 확인할 수 있습니다.
   ```
   x-litellm-model-id: team-a-model
   ```

   마찬가지로 Team B의 키를 사용하면 다음을 확인할 수 있습니다.
   ```
   x-litellm-model-id: team-b-model
   ```

이 단계와 curl 명령을 따르면 LiteLLM Proxy 설정에서 팀 기반 태그 라우팅을 구현하고 테스트할 수 있습니다. 이를 통해 각 팀이 할당된 태그에 따라 적절한 모델 또는 배포로 라우팅되도록 보장할 수 있습니다.
