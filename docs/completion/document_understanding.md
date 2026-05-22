import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# PDF 입력 사용 {#using-pdf-input}

PDF 및 기타 문서 유형을 `/chat/completions` 엔드포인트로 보내고 받는 방법입니다.

- 지원 대상:
- Vertex AI 모델(Gemini + Anthropic)
- Bedrock 모델
- Anthropic API 모델
- OpenAI API 모델
- Mistral(OpenAI `file_id` 입력과 유사하게, 이미 업로드된 파일의 파일 ID만 사용)

## 빠른 시작

### url 

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_pdf_input, completion

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# model
model = "bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_id": file_url,
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": [
            {"type": "text", "text": "What's this file about?"},
            {
                "type": "file",
                "file": {
                    "file_id": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                }
            }
        ]},
    ]
}'
```
</TabItem>
</Tabs>

### base64

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_pdf_input, completion

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
image_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")
base64_url = f"data:application/pdf;base64,{encoded_file}"

# model
model = "bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_data": base64_url,
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": [
            {"type": "text", "text": "What's this file about?"},
            {
                "type": "file",
                "file": {
                    "file_data": "data:application/pdf;base64...",
                }
            }
        ]},
    ]
}'
```
</TabItem>
</Tabs>

## 형식 지정 {#specifying-format}

문서 형식을 지정하려면 `format` 파라미터를 사용할 수 있습니다.


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_pdf_input, completion

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# model
model = "bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_id": file_url,
            "format": "application/pdf",
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": [
            {"type": "text", "text": "What's this file about?"},
            {
                "type": "file",
                "file": {
                    "file_id": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    "format": "application/pdf",
                }
            }
        ]},
    ]
}'
```
</TabItem>
</Tabs>


## Mistral 예제

문서 이해에 Mistral 모델을 사용할 때의 샘플 페이로드입니다.


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import completion

# pdf file_id received from files endpoint
file_id = "fa778e5e-46ec-4562-8418-36623fe25a71"

# model
model = "mistral/mistral-large-latest"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_id": file_id,
        }
    },
]

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "mistral/mistral-large-latest",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is the content of the file?"
                },
                {
                    "type": "file",
                    "file": {
                        "file_id": "fa778e5e-46ec-4562-8418-36623fe25a71"
                    }
                }
            ]
        }
    ]
}
```
</TabItem>
</Tabs>

## 모델이 PDF 입력을 지원하는지 확인 {#checking-if-a-model-supports-pdf-input}

<Tabs>
<TabItem label="SDK" value="sdk">

`litellm.supports_pdf_input(model="bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0")`를 사용하세요. 모델이 PDF 입력을 받을 수 있으면 `True`를 반환합니다.

```python
assert litellm.supports_pdf_input(model="bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0") == True
```
</TabItem>

<TabItem label="PROXY" value="proxy">

1. config.yaml에 Bedrock 모델 정의

```yaml
model_list:
  - model_name: bedrock-model # model group name
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
    model_info: # OPTIONAL - set manually
      supports_pdf_input: True
```

2. 프록시 서버 실행

```bash
litellm --config config.yaml
```

3. 모델이 `pdf` 입력을 지원하는지 확인하려면 `/model_group/info` 호출

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
      "model_group": "bedrock-model",
      "providers": ["bedrock"],
      "max_input_tokens": 128000,
      "max_output_tokens": 16384,
      "mode": "chat",
      ...,
      "supports_pdf_input": true, # 👈 supports_pdf_input is true
    }
  ]
}
```

</TabItem>
</Tabs>
