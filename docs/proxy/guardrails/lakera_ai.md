import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lakera AI

**지원 엔드포인트:** Lakera v2 통합은 **chat completions** 엔드포인트(`/v1/chat/completions`)만 지원합니다. Responses API, `/v1/messages`, MCP, A2A 또는 기타 프록시 엔드포인트는 지원하지 않습니다.

## 빠른 시작
### 1. LiteLLM config.yaml에 가드레일 정의하기 

`guardrails` 섹션 아래에 guardrails를 정의합니다.

```yaml showLineNumbers title="litellm config.yaml"
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "lakera-guard"
    litellm_params:
      guardrail: lakera_v2  # supported values: "aporia", "bedrock", "lakera"
      mode: "during_call"
      api_key: os.environ/LAKERA_API_KEY
      api_base: os.environ/LAKERA_API_BASE
  - guardrail_name: "lakera-pre-guard"
    litellm_params:
      guardrail: lakera_v2  # supported values: "aporia", "bedrock", "lakera"
      mode: "pre_call"
      api_key: os.environ/LAKERA_API_KEY
      api_base: os.environ/LAKERA_API_BASE
  - guardrail_name: "lakera-monitor"
    litellm_params:
      guardrail: lakera_v2
      mode: "pre_call"
      on_flagged: "monitor"  # Log violations but don't block
      api_key: os.environ/LAKERA_API_KEY
      api_base: os.environ/LAKERA_API_BASE
  
```

#### `mode`에서 지원되는 값

- `pre_call`: **LLM 호출 전** 입력에 대해 실행합니다.
- `post_call`: **LLM 호출 후** 입력과 출력에 대해 실행합니다.
- `during_call`: **LLM 호출 중** 입력에 대해 실행합니다. `pre_call`과 같지만 LLM 호출과 병렬로 실행됩니다. 가드레일 검사가 완료될 때까지 응답은 반환되지 않습니다.

### 2. LiteLLM Gateway 시작하기 


```shell
litellm --config config.yaml --detailed_debug
```

### 3. 요청 테스트하기 

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="실패하는 호출" value = "not-allowed">

요청에 포함된 `ishaan@berri.ai`가 PII이므로 실패해야 합니다.

```shell showLineNumbers title="Curl Request"
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["lakera-guard"]
  }'
```

실패 시 예상 응답

```shell
{
 "error": {
   "message": {
     "error": "Violated content safety policy",
     "lakera_ai_response": {
       "model": "lakera-guard-1",
       "results": [
         {
           "categories": {
             "prompt_injection": true,
             "jailbreak": false
           },
           "category_scores": {
             "prompt_injection": 0.999,
             "jailbreak": 0.0
           },
           "flagged": true,
           "payload": {}
         }
       ],
       "dev_info": {
         "git_revision": "cb163444",
         "git_timestamp": "2024-08-19T16:00:28+02:00",
         "version": "1.3.53"
       }
     }
   },
   "type": "None",
   "param": "None",
   "code": "400"
 }
}

```

</TabItem>

<TabItem label="성공하는 호출" value = "allowed">

```shell showLineNumbers title="Curl Request"
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["lakera-guard"]
  }'
```

</TabItem>


</Tabs>


## 지원되는 파라미터 

```yaml
guardrails:
  - guardrail_name: "lakera-guard"
    litellm_params:
      guardrail: lakera_v2  # supported values: "aporia", "bedrock", "lakera"
      mode: "during_call"
      api_key: os.environ/LAKERA_API_KEY
      api_base: os.environ/LAKERA_API_BASE
      ### OPTIONAL ### 
      # project_id: Optional[str] = None,
      # payload: Optional[bool] = True,
      # breakdown: Optional[bool] = True,
      # metadata: Optional[Dict] = None,
      # dev_info: Optional[bool] = True,
      # on_flagged: Optional[str] = "block",  # "block" or "monitor"
```

- `api_base`: (Optional[str]) Lakera 통합의 base URL입니다. 기본값은 `https://api.lakera.ai`입니다.
- `api_key`: (str) Lakera 통합용 API Key입니다.
- `project_id`: (Optional[str]) 관련 프로젝트의 ID입니다.
- `payload`: (Optional[bool]) `true`이면 감지된 PII, 욕설 또는 사용자 지정 detector regex match와 콘텐츠 내 위치를 포함하는 payload 객체를 응답에 반환합니다.
- `breakdown`: (Optional[bool]) `true`이면 정책에 정의된 실행 detector 목록과 각 detector의 감지 여부를 breakdown 목록으로 반환합니다.
- `metadata`: (Optional[Dict]) screening 요청에 metadata tag를 객체로 첨부할 수 있으며, 임의의 key-value 쌍을 포함할 수 있습니다.
- `dev_info`: (Optional[bool]) `true`이면 Lakera Guard 빌드에 대한 개발자 정보 객체를 응답에 반환합니다.
- `on_flagged`: (Optional[str]) 콘텐츠가 flagged 되었을 때 수행할 작업입니다. 기본값은 `"block"`입니다.
  - `"block"`: 위반이 감지되면 HTTP 400 예외를 발생시킵니다(기본 동작).
  - `"monitor"`: 위반 사항을 로깅하지만 요청 진행은 허용합니다. 정상 요청을 차단하지 않고 보안 정책을 조정할 때 유용합니다.
