import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /moderations


### 사용법
<Tabs>
<TabItem value="python" label="LiteLLM Python SDK">

```python
from litellm import moderation

response = moderation(
    input="hello from litellm",
    model="text-moderation-stable"
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy Server">

`/moderations` 엔드포인트의 경우, 요청이나 litellm config.yaml에서 **`model`을 지정할 필요가 없습니다**


1. config.yaml 설정
```yaml
model_list:
  - model_name: text-moderation-stable
    litellm_params:
      model: openai/omni-moderation-latest
```

2. litellm proxy server 시작

```
litellm --config /path/to/config.yaml
```


<Tabs>
<TabItem value="python" label="OpenAI Python SDK">

```python
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.moderations.create(
    input="hello from litellm",
    model="text-moderation-stable"
)

print(response)
```
</TabItem>

<TabItem value="curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/moderations' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{"input": "Sample text goes here", "model": "text-moderation-stable"}'
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

## 입력 파라미터 {#input-params}
LiteLLM은 지원되는 모든 프로바이더에서 [OpenAI Moderation params](https://platform.openai.com/docs/api-reference/moderations)를 받아 변환합니다.

### 필수 필드 {#required-fields}

- `input`: *string or array* - 분류할 입력입니다. 단일 문자열, 문자열 배열, 또는 다른 모델과 유사한 멀티모달 입력 객체 배열일 수 있습니다.
  - 문자열인 경우: moderation 분류 대상 텍스트 문자열입니다.
  - 문자열 배열인 경우: moderation 분류 대상 문자열 배열입니다.
  - 객체 배열인 경우: moderation 모델로 전달되는 멀티모달 입력 배열이며, 각 객체는 다음 중 하나일 수 있습니다.
    - 분류할 이미지를 설명하는 객체:
      - `type`: *string, required* - 항상 `image_url`
      - `image_url`: *object, required* - 이미지 URL 또는 base64로 인코딩된 이미지의 데이터 URL을 포함합니다.
    - 분류할 텍스트를 설명하는 객체:
      - `type`: *string, required* - 항상 `text`
      - `text`: *string, required* - 분류할 텍스트 문자열입니다.

### 선택 필드 {#optional-fields}

- `model`: *string (optional)* - 사용할 moderation 모델입니다. 기본값은 `omni-moderation-latest`입니다.

## 출력 형식 {#output-format}
모든 moderation 호출에서 기대할 수 있는 정확한 json 출력과 타입은 다음과 같습니다.

[**LiteLLM은 OpenAI의 출력 형식을 따릅니다**](https://platform.openai.com/docs/api-reference/moderations/object)


```python
{
  "id": "modr-AB8CjOTu2jiq12hp1AQPfeqFWaORR",
  "model": "text-moderation-007",
  "results": [
    {
      "flagged": true,
      "categories": {
        "sexual": false,
        "hate": false,
        "harassment": true,
        "self-harm": false,
        "sexual/minors": false,
        "hate/threatening": false,
        "violence/graphic": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        "harassment/threatening": true,
        "violence": true
      },
      "category_scores": {
        "sexual": 0.000011726012417057063,
        "hate": 0.22706663608551025,
        "harassment": 0.5215635299682617,
        "self-harm": 2.227119921371923e-6,
        "sexual/minors": 7.107352217872176e-8,
        "hate/threatening": 0.023547329008579254,
        "violence/graphic": 0.00003391829886822961,
        "self-harm/intent": 1.646940972932498e-6,
        "self-harm/instructions": 1.1198755256458526e-9,
        "harassment/threatening": 0.5694745779037476,
        "violence": 0.9971134662628174
      }
    }
  ]
}

```


## **지원 프로바이더**

#### ⚡️지원되는 모든 모델과 프로바이더는 [models.litellm.ai](https://models.litellm.ai/)에서 확인하세요

| 프로바이더    |
|-------------|
| OpenAI      |  
