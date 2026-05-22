import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nvidia NIM
https://docs.api.nvidia.com/nim/reference/

:::tip

**모든 Nvidia NIM 모델을 지원합니다. LiteLLM 요청을 보낼 때 `model=nvidia_nim/<any-model-on-nvidia_nim>` 접두사만 설정하세요.**

:::

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Nvidia NIM은 AI 모델을 배포하고 사용하는 간단한 API를 제공하는 플랫폼입니다. LiteLLM은 [Nvidia NIM](https://developer.nvidia.com/nim/)의 모든 모델을 지원합니다. |
| LiteLLM의 제공자 라우트 | `nvidia_nim/` |
| 제공자 문서 | [Nvidia NIM 문서 ↗](https://developer.nvidia.com/nim/) |
| 제공자 API 엔드포인트 | https://integrate.api.nvidia.com/v1/ (chat/embeddings), https://ai.api.nvidia.com/v1/ (rerank) |
| 지원되는 OpenAI 엔드포인트 | `/chat/completions`, `/completions`, `/responses`, `/embeddings`, `/rerank` |

## API 키 {#api-key}
```python
# 환경 변수
os.environ['NVIDIA_NIM_API_KEY'] = ""
os.environ['NVIDIA_NIM_API_BASE'] = "" # [선택 사항] - 기본값은 https://integrate.api.nvidia.com/v1/
```

## 예제 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['NVIDIA_NIM_API_KEY'] = ""
response = completion(
    model="nvidia_nim/meta/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    temperature=0.2,        # 선택 사항
    top_p=0.9,              # 선택 사항
    frequency_penalty=0.1,  # 선택 사항
    presence_penalty=0.1,   # 선택 사항
    max_tokens=10,          # 선택 사항
    stop=["\n\n"],          # 선택 사항
)
print(response)
```

## 예제 사용법 - 스트리밍 {#sample-usage---streaming}
```python
from litellm import completion
import os

os.environ['NVIDIA_NIM_API_KEY'] = ""
response = completion(
    model="nvidia_nim/meta/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    temperature=0.2,        # 선택 사항
    top_p=0.9,              # 선택 사항
    frequency_penalty=0.1,  # 선택 사항
    presence_penalty=0.1,   # 선택 사항
    max_tokens=10,          # 선택 사항
    stop=["\n\n"],          # 선택 사항
)

for chunk in response:
    print(chunk)
```


## 사용법 - 임베딩 {#usage---embedding}

```python
import litellm
import os

response = litellm.embedding(
    model="nvidia_nim/nvidia/nv-embedqa-e5-v5",               # litellm이 Nvidia NIM으로 라우팅하도록 모델에 `nvidia_nim/` 접두사를 추가하세요
    input=["good morning from litellm"],
    encoding_format = "float", 
    user_id = "user-1234",

    # Nvidia NIM 전용 파라미터
    input_type = "passage", # 선택 사항
    truncate = "NONE" # 선택 사항
)
print(response)
```


## **사용법 - LiteLLM Proxy Server** {#usage---litellm-proxy-server}

LiteLLM Proxy Server로 Nvidia NIM 엔드포인트를 호출하는 방법은 다음과 같습니다.

1. `config.yaml` 수정 

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: nvidia_nim/<your-model-name>  # Nvidia NIM 제공자로 라우팅하려면 nvidia_nim/ 접두사를 추가하세요
        api_key: api-key                 # 모델로 보낼 API 키
       # api_base: "" # [선택 사항] - 기본값은 https://integrate.api.nvidia.com/v1/
  ```


2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server로 요청 전송

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="sk-1234",             # 가상 키를 사용하는 경우 LiteLLM 프록시 키를 전달하세요
      base_url="http://0.0.0.0:4000" # LiteLLM 프록시 기본 URL
  )

  response = client.chat.completions.create(
      model="my-model",
      messages = [
          {
              "role": "user",
              "content": "what llm are you"
          }
      ],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "my-model",
      "messages": [
          {
          "role": "user",
          "content": "what llm are you"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>



## 지원되는 모델 - 💥 모든 Nvidia NIM 모델 지원! {#supported-models----all-nvidia-nim-models-supported}
모든 `nvidia_nim` 모델을 지원합니다. `completion` 요청을 보낼 때 `nvidia_nim/`을 접두사로 설정하기만 하면 됩니다.

| 모델 이름 | 함수 호출 |
|------------|---------------|
| `nvidia/nemotron-4-340b-reward` | `completion(model="nvidia_nim/nvidia/nemotron-4-340b-reward", messages)` |
| `01-ai/yi-large` | `completion(model="nvidia_nim/01-ai/yi-large", messages)` |
| `aisingapore/sea-lion-7b-instruct` | `completion(model="nvidia_nim/aisingapore/sea-lion-7b-instruct", messages)` |
| `databricks/dbrx-instruct` | `completion(model="nvidia_nim/databricks/dbrx-instruct", messages)` |
| `google/gemma-7b` | `completion(model="nvidia_nim/google/gemma-7b", messages)` |
| `google/gemma-2b` | `completion(model="nvidia_nim/google/gemma-2b", messages)` |
| `google/codegemma-1.1-7b` | `completion(model="nvidia_nim/google/codegemma-1.1-7b", messages)` |
| `google/codegemma-7b` | `completion(model="nvidia_nim/google/codegemma-7b", messages)` |
| `google/recurrentgemma-2b` | `completion(model="nvidia_nim/google/recurrentgemma-2b", messages)` |
| `ibm/granite-34b-code-instruct` | `completion(model="nvidia_nim/ibm/granite-34b-code-instruct", messages)` |
| `ibm/granite-8b-code-instruct` | `completion(model="nvidia_nim/ibm/granite-8b-code-instruct", messages)` |
| `mediatek/breeze-7b-instruct` | `completion(model="nvidia_nim/mediatek/breeze-7b-instruct", messages)` |
| `meta/codellama-70b` | `completion(model="nvidia_nim/meta/codellama-70b", messages)` |
| `meta/llama2-70b` | `completion(model="nvidia_nim/meta/llama2-70b", messages)` |
| `meta/llama3-8b` | `completion(model="nvidia_nim/meta/llama3-8b", messages)` |
| `meta/llama3-70b` | `completion(model="nvidia_nim/meta/llama3-70b", messages)` |
| `microsoft/phi-3-medium-4k-instruct` | `completion(model="nvidia_nim/microsoft/phi-3-medium-4k-instruct", messages)` |
| `microsoft/phi-3-mini-128k-instruct` | `completion(model="nvidia_nim/microsoft/phi-3-mini-128k-instruct", messages)` |
| `microsoft/phi-3-mini-4k-instruct` | `completion(model="nvidia_nim/microsoft/phi-3-mini-4k-instruct", messages)` |
| `microsoft/phi-3-small-128k-instruct` | `completion(model="nvidia_nim/microsoft/phi-3-small-128k-instruct", messages)` |
| `microsoft/phi-3-small-8k-instruct` | `completion(model="nvidia_nim/microsoft/phi-3-small-8k-instruct", messages)` |
| `mistralai/codestral-22b-instruct-v0.1` | `completion(model="nvidia_nim/mistralai/codestral-22b-instruct-v0.1", messages)` |
| `mistralai/mistral-7b-instruct` | `completion(model="nvidia_nim/mistralai/mistral-7b-instruct", messages)` |
| `mistralai/mistral-7b-instruct-v0.3` | `completion(model="nvidia_nim/mistralai/mistral-7b-instruct-v0.3", messages)` |
| `mistralai/mixtral-8x7b-instruct` | `completion(model="nvidia_nim/mistralai/mixtral-8x7b-instruct", messages)` |
| `mistralai/mixtral-8x22b-instruct` | `completion(model="nvidia_nim/mistralai/mixtral-8x22b-instruct", messages)` |
| `mistralai/mistral-large` | `completion(model="nvidia_nim/mistralai/mistral-large", messages)` |
| `nvidia/nemotron-4-340b-instruct` | `completion(model="nvidia_nim/nvidia/nemotron-4-340b-instruct", messages)` |
| `seallms/seallm-7b-v2.5` | `completion(model="nvidia_nim/seallms/seallm-7b-v2.5", messages)` |
| `snowflake/arctic` | `completion(model="nvidia_nim/snowflake/arctic", messages)` |
| `upstage/solar-10.7b-instruct` | `completion(model="nvidia_nim/upstage/solar-10.7b-instruct", messages)` |
