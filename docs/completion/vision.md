import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vision 모델 사용하기 {#using-vision}

## 빠른 시작
모델에 이미지를 전달하는 예제입니다.


<Tabs>

<TabItem label="LiteLLMPython SDK" value="Python">

```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "gpt-4-vision-preview", 
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```

</TabItem>
<TabItem label="LiteLLM Proxy Server" value="proxy">

1. config.yaml에 vision 모델을 정의합니다.

```yaml
model_list:
  - model_name: gpt-4-vision-preview # OpenAI gpt-4-vision-preview
    litellm_params:
      model: openai/gpt-4-vision-preview
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_vision: True        # set supports_vision to True so /model/info returns this attribute as True

```

2. proxy server를 실행합니다.

```bash
litellm --config config.yaml
```

3. OpenAI Python SDK로 테스트합니다.


```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # your litellm proxy api key
)

response = client.chat.completions.create(
    model = "gpt-4-vision-preview",  # use model="llava-hf" to test your custom OpenAI endpoint
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```




</TabItem>
</Tabs>



## 모델이 `vision`을 지원하는지 확인하기 {#checking-if-a-model-supports-vision}

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

`litellm.supports_vision(model="")`를 사용합니다. 모델이 `vision`을 지원하면 `True`를 반환하고, 지원하지 않으면 `False`를 반환합니다.

```python
assert litellm.supports_vision(model="openai/gpt-4-vision-preview") == True
assert litellm.supports_vision(model="vertex_ai/gemini-1.0-pro-vision") == True
assert litellm.supports_vision(model="openai/gpt-3.5-turbo") == False
assert litellm.supports_vision(model="xai/grok-2-vision-latest") == True
assert litellm.supports_vision(model="xai/grok-2-latest") == False
```
</TabItem>

<TabItem label="LiteLLM Proxy Server" value="proxy">


1. config.yaml에 vision 모델을 정의합니다.

```yaml
model_list:
  - model_name: gpt-4-vision-preview # OpenAI gpt-4-vision-preview
    litellm_params:
      model: openai/gpt-4-vision-preview
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_vision: True        # set supports_vision to True so /model/info returns this attribute as True
```

2. proxy server를 실행합니다.

```bash
litellm --config config.yaml
```

3. 모델이 `vision`을 지원하는지 확인하려면 `/model_group/info`를 호출합니다.

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
      "model_group": "gpt-4-vision-preview",
      "providers": ["openai"],
      "max_input_tokens": 128000,
      "max_output_tokens": 4096,
      "mode": "chat",
      "supports_vision": true, # 👈 supports_vision is true
      "supports_function_calling": false
    },
    {
      "model_group": "llava-hf",
      "providers": ["openai"],
      "max_input_tokens": null,
      "max_output_tokens": null,
      "mode": null,
      "supports_vision": true, # 👈 supports_vision is true
      "supports_function_calling": false
    }
  ]
}
```

</TabItem>
</Tabs>


## 이미지 유형 명시적으로 지정하기 {#explicitly-specify-image-type}

mime-type이 없는 이미지가 있거나 litellm이 이미지의 mime type을 잘못 추론하는 경우(예: vertex ai에서 `gs://` url을 호출하는 경우), `format` param으로 이를 명시적으로 설정할 수 있습니다.

```python
"image_url": {
  "url": "gs://my-gs-image",
  "format": "image/jpeg"
}
```

LiteLLM은 mime-type 지정을 지원하는 모든 API endpoint(예: anthropic/bedrock/vertex ai)에 이 값을 사용합니다.

그 외의 경우(예: openai)에는 이 값이 무시됩니다.

<Tabs>
<TabItem label="SDK" value="sdk">

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "claude-3-7-sonnet-latest", 
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                  "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png",
                                  "format": "image/jpeg"
                                }
                            }
                        ]
        }
    ],
)

```

</TabItem>
<TabItem label="PROXY" value="proxy">

1. config.yaml에 vision 모델을 정의합니다.

```yaml
model_list:
  - model_name: gpt-4-vision-preview # OpenAI gpt-4-vision-preview
    litellm_params:
      model: openai/gpt-4-vision-preview
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_vision: True        # set supports_vision to True so /model/info returns this attribute as True

```

2. proxy server를 실행합니다.

```bash
litellm --config config.yaml
```

3. OpenAI Python SDK로 테스트합니다.


```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # your litellm proxy api key
)

response = client.chat.completions.create(
    model = "gpt-4-vision-preview",  # use model="llava-hf" to test your custom OpenAI endpoint
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png",
                                "format": "image/jpeg"
                                }
                            }
                        ]
        }
    ],
)

```




</TabItem>
</Tabs>



## 사양 {#spec}

```
"image_url": str

OR 

"image_url": {
  "url": "url OR base64 encoded str",
  "detail": "openai-only param", 
  "format": "specify mime-type of image"
}
```
