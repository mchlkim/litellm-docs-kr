import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Audio 모델 사용 {#using-audio-models}

`/chat/completions` 엔드포인트로 오디오를 보내고 받는 방법입니다.


## 모델의 오디오 출력 {#audio-output-from-a-model}

프롬프트에 대해 사람과 비슷한 오디오 응답을 생성하는 예제입니다.

<Tabs>

<TabItem label="LiteLLM Python SDK" value="Python">

```python
import os 
import base64
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
completion = await litellm.acompletion(
    model="gpt-4o-audio-preview",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[{"role": "user", "content": "Is a golden retriever a good family dog?"}],
)

wav_bytes = base64.b64decode(completion.choices[0].message.audio.data)
with open("dog.wav", "wb") as f:
    f.write(wav_bytes)
```

</TabItem>
<TabItem label="LiteLLM Proxy Server" value="proxy">

1. `config.yaml`에 오디오 모델 정의

```yaml
model_list:
  - model_name: gpt-4o-audio-preview # OpenAI gpt-4o-audio-preview
    litellm_params:
      model: openai/gpt-4o-audio-preview
      api_key: os.environ/OPENAI_API_KEY 

```

2. 프록시 서버 실행

```bash
litellm --config config.yaml
```

3. OpenAI Python SDK로 테스트


```python
import base64
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-1234
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

completion = client.chat.completions.create(
    model="gpt-4o-audio-preview",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": "Is a golden retriever a good family dog?"
        }
    ]
)

print(completion.choices[0])

wav_bytes = base64.b64decode(completion.choices[0].message.audio.data)
with open("dog.wav", "wb") as f:
    f.write(wav_bytes)

```




</TabItem>
</Tabs>

## 모델에 오디오 입력 {#audio-input-to-a-model}


<Tabs>

<TabItem label="LiteLLM Python SDK" value="Python">

```python
import base64
import requests

url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode("utf-8")

completion = litellm.completion(
    model="gpt-4o-audio-preview",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "input_audio",
                    "input_audio": {"data": encoded_string, "format": "wav"},
                },
            ],
        },
    ],
)

print(completion.choices[0].message)
```

</TabItem>

<TabItem label="LiteLLM Proxy Server" value="proxy">


1. `config.yaml`에 오디오 모델 정의

```yaml
model_list:
  - model_name: gpt-4o-audio-preview # OpenAI gpt-4o-audio-preview
    litellm_params:
      model: openai/gpt-4o-audio-preview
      api_key: os.environ/OPENAI_API_KEY 

```

2. 프록시 서버 실행

```bash
litellm --config config.yaml
```

3. OpenAI Python SDK로 테스트


```python
import base64
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-1234
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)


# Fetch the audio file and convert it to a base64 encoded string
url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')

completion = client.chat.completions.create(
    model="gpt-4o-audio-preview",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": [
                { 
                    "type": "text",
                    "text": "What is in this recording?"
                },
                {
                    "type": "input_audio",
                    "input_audio": {
                        "data": encoded_string,
                        "format": "wav"
                    }
                }
            ]
        },
    ]
)

print(completion.choices[0].message)
```


</TabItem>
</Tabs>

## 모델이 `audio_input` 및 `audio_output`을 지원하는지 확인 {#checking-if-a-model-supports-audio_input-and-audio_output}

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

`litellm.supports_audio_output(model="")`를 사용합니다. 모델이 오디오 출력을 생성할 수 있으면 `True`를 반환합니다.

`litellm.supports_audio_input(model="")`를 사용합니다. 모델이 오디오 입력을 받을 수 있으면 `True`를 반환합니다.

```python
assert litellm.supports_audio_output(model="gpt-4o-audio-preview") == True
assert litellm.supports_audio_input(model="gpt-4o-audio-preview") == True

assert litellm.supports_audio_output(model="gpt-3.5-turbo") == False
assert litellm.supports_audio_input(model="gpt-3.5-turbo") == False
```
</TabItem>

<TabItem label="LiteLLM Proxy Server" value="proxy">


1. `config.yaml`에 오디오 지원 모델 정의

```yaml
model_list:
  - model_name: gpt-4o-audio-preview # OpenAI gpt-4o-audio-preview
    litellm_params:
      model: openai/gpt-4o-audio-preview
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_audio_output: True        # set supports_audio_output to True so /model/info returns this attribute as True
      supports_audio_input: True         # set supports_audio_input to True so /model/info returns this attribute as True
```

2. 프록시 서버 실행

```bash
litellm --config config.yaml
```

3. 모델이 오디오를 지원하는지 확인하려면 `/model_group/info` 호출

```shell
curl -X 'GET' \
  'http://localhost:4000/model_group/info' \
  -H 'accept: application/json' \
  -H 'x-api-key: sk-1234'
```

예상 응답

```json
{
  "data": [
    {
      "model_group": "gpt-4o-audio-preview",
      "providers": ["openai"],
      "max_input_tokens": 128000,
      "max_output_tokens": 16384,
      "mode": "chat",
      "supports_audio_output": true, # 👈 supports_audio_output is true
      "supports_audio_input": true, # 👈 supports_audio_input is true
    },
    {
      "model_group": "llava-hf",
      "providers": ["openai"],
      "max_input_tokens": null,
      "max_output_tokens": null,
      "mode": null,
      "supports_audio_output": true, # 👈 supports_audio_output is true
      "supports_audio_input": true, # 👈 supports_audio_input is true
    }
  ]
}
```

</TabItem>
</Tabs>


## 오디오 포함 응답 형식 {#response-format-with-audio}

아래는 모델에 오디오 입력을 보낼 때 `/chat/completions` 엔드포인트에서 받을 수 있는 `message`의 JSON 데이터 구조 예시입니다.

```json
{
  "index": 0,
  "message": {
    "role": "assistant",
    "content": null,
    "refusal": null,
    "audio": {
      "id": "audio_abc123",
      "expires_at": 1729018505,
      "data": "<bytes omitted>",
      "transcript": "Yes, golden retrievers are known to be ..."
    }
  },
  "finish_reason": "stop"
}
```
- `audio`: 오디오 출력 modality가 요청된 경우 이 객체에는 모델의 오디오 응답 데이터가 포함됩니다.
    - `audio.id`: 오디오 응답의 고유 식별자입니다.
    - `audio.expires_at`: 멀티턴 대화에서 사용할 수 있도록 서버에 저장된 이 오디오 응답에 더 이상 접근할 수 없게 되는 Unix timestamp(초)입니다.
    - `audio.data`: 요청에 지정된 형식으로 모델이 생성한 Base64 인코딩 오디오 바이트입니다.
    - `audio.transcript`: 모델이 생성한 오디오의 전사 텍스트입니다.
