import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 원시 요청/응답 로깅 {#raw-requestresponse-logging}


## 로깅 {#logging}
로깅 제공업체(OTEL/Langfuse 등)에서 LiteLLM이 보낸 원시 요청/응답을 확인합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
# uv add langfuse 
import litellm
import os

# log raw request/response
litellm.log_raw_request_response = True

# from https://cloud.langfuse.com/
os.environ["LANGFUSE_PUBLIC_KEY"] = ""
os.environ["LANGFUSE_SECRET_KEY"] = ""
# Optional, defaults to https://cloud.langfuse.com
os.environ["LANGFUSE_HOST"] # optional

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langfuse as a callback, litellm will send the data to langfuse
litellm.success_callback = ["langfuse"] 
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```


</TabItem>
<TabItem value="proxy" label="PROXY">


```yaml
litellm_settings:
  log_raw_request_response: True
```


</TabItem>
</Tabs>

**예상 로그**

<Image img={require('../../img/raw_request_log.png')}/>


## 원시 응답 헤더 반환 {#return-raw-response-headers}

LLM 제공업체의 원시 응답 헤더를 반환합니다.

현재 openai에서만 지원됩니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
import os

litellm.return_response_headers = True

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)

print(response._hidden_params)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/GROQ_API_KEY

litellm_settings:
  return_response_headers: true
```

2. 테스트합니다!

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "model": "gpt-3.5-turbo",
    "messages": [
        { "role": "system", "content": "Use your tools smartly"},
        { "role": "user", "content": "What time is it now? Use your tool"}
    ]
}'
```
</TabItem>
</Tabs>


**예상 응답**

<Image img={require('../../img/raw_response_headers.png')}/>
