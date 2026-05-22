# 디버깅 {#debugging}

두 가지 수준의 디버깅을 지원합니다.

- debug (info 로그 출력)
- detailed debug (debug 로그 출력)

프록시는 json 로그도 지원합니다. [여기를 참고하세요](#json-logs).

## `debug`

**cli 사용**

```bash showLineNumbers
$ litellm --debug
```

**env 사용**

```python showLineNumbers
os.environ["LITELLM_LOG"] = "INFO"
```

## `detailed debug`

**cli 사용**

```bash showLineNumbers
$ litellm --detailed_debug
```

**env 사용**

```python showLineNumbers
os.environ["LITELLM_LOG"] = "DEBUG"
```

### 상세 debug 로그 {#debug-로그}

자세한 debug 로그를 보려면 `--detailed_debug`로 프록시를 실행하세요.
```shell showLineNumbers
litellm --config /path/to/config.yaml --detailed_debug
```

요청을 보내면 Terminal 출력에서 LiteLLM이 LLM으로 보낸 POST 요청을 확인할 수 있습니다.
```shell showLineNumbers
POST Request Sent from LiteLLM:
curl -X POST \
https://api.openai.com/v1/chat/completions \
-H 'content-type: application/json' -H 'Authorization: Bearer sk-qnWGUIW9****************************************' \
-d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "this is a test request, write a short poem"}]}'
```

## 단일 요청 디버깅 {#debug-single-request}

요청 본문에 `litellm_request_debug=True`를 전달하세요.

```bash showLineNumbers
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{ 
    "model":"fake-openai-endpoint",
    "messages": [{"role": "user","content": "How many r in the word strawberry?"}],
    "litellm_request_debug": true
}'
```

그러면 로그에 **이 요청에 대해서만** LiteLLM이 API Provider로 보낸 원시 요청과 API Provider에서 받은 원시 응답이 출력됩니다.


```bash showLineNumbers
INFO:     Uvicorn running on http://0.0.0.0:4000 (Press CTRL+C to quit)
20:14:06 - LiteLLM:WARNING: litellm_logging.py:938 - 

POST Request Sent from LiteLLM:
curl -X POST \
https://exampleopenaiendpoint-production.up.railway.app/chat/completions \
-H 'Authorization: Be****ey' -H 'Content-Type: application/json' \
-d '{'model': 'fake', 'messages': [{'role': 'user', 'content': 'How many r in the word strawberry?'}], 'stream': False}'


20:14:06 - LiteLLM:WARNING: litellm_logging.py:1015 - RAW RESPONSE:
{"id":"chatcmpl-817fc08f0d6c451485d571dab39b26a1","object":"chat.completion","created":1677652288,"model":"gpt-3.5-turbo-0301","system_fingerprint":"fp_44709d6fcb","choices":[{"index":0,"message":{"role":"assistant","content":"\n\nHello there, how may I assist you today?"},"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":9,"completion_tokens":12,"total_tokens":21}}


INFO:     127.0.0.1:56155 - "POST /chat/completions HTTP/1.1" 200 OK

```


## JSON 로그 {#json-logs}

env에서 `JSON_LOGS="True"`를 설정하세요.

```bash showLineNumbers
export JSON_LOGS="True"
```
**또는**

yaml에서 `json_logs: true`를 설정하세요.

```yaml showLineNumbers
litellm_settings:
    json_logs: true
```

프록시를 시작합니다.

```bash showLineNumbers
$ litellm
```

이제 프록시는 모든 로그를 json 형식으로 출력합니다.

## 로그 출력 제어 {#control-log-output}

fastapi의 기본 'INFO' 로그를 끕니다.

1. 'json logs'를 켭니다.
```yaml showLineNumbers
litellm_settings:
    json_logs: true
```

2. `LITELLM_LOG`를 'ERROR'로 설정합니다.

오류가 발생한 경우에만 로그를 받습니다.

```bash showLineNumbers
LITELLM_LOG="ERROR"
```

3. 프록시를 시작합니다.


```bash showLineNumbers
$ litellm
```

예상 출력:

```bash showLineNumbers
# no info statements
```

## 일반적인 오류 {#common-errors}

1. 배포를 사용할 수 없다는 오류(`No available deployments...`)

```
No deployments available for selected model, Try again in 60 seconds. Passed model=claude-3-5-sonnet. pre-call-checks=False, allowed_model_region=n/a.
```

모든 모델에서 rate limit 오류가 발생해 cooldown이 작동하면 이 문제가 생길 수 있습니다.

어떻게 제어하나요?
- cooldown 시간을 조정합니다.

```yaml showLineNumbers
router_settings:
    cooldown_time: 0 # 👈 KEY CHANGE
```

- Cooldowns 비활성화 [권장하지 않음]

```yaml showLineNumbers
router_settings:
    disable_cooldowns: True
```

이 설정은 요청이 tpm/rpm 한도를 초과한 배포로 라우팅되게 만들 수 있으므로 권장하지 않습니다.
