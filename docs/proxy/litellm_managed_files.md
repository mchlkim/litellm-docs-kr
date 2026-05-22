import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import Image from '@theme/IdealImage';

# [BETA] LiteLLM 관리형 파일

- 서로 다른 프로바이더에서 같은 파일을 재사용합니다.
- `list` 및 `retrieve` 호출에서 접근 권한이 없는 파일이 사용자에게 보이지 않도록 합니다.

:::info

이 기능은 무료 LiteLLM 엔터프라이즈 기능입니다.

`litellm` docker 이미지를 통해 사용할 수 있습니다. pip 패키지를 사용하는 경우 [`litellm-enterprise`](https://pypi.org/project/litellm-enterprise/)를 설치해야 합니다.

:::


| 속성 | 값 | 설명 |
| --- | --- | --- |
| Proxy | ✅ |  |
| SDK | ❌ | 파일 ID를 저장하려면 postgres DB가 필요합니다. |
| 모든 프로바이더에서 사용 가능 | ✅ |  |
| 지원되는 엔드포인트 | `/chat/completions`, `/batch`, `/fine_tuning`, `/responses` |  |

## 사용법

### 1. config.yaml 설정

```yaml
model_list:
    - model_name: "gemini-2.0-flash"
      litellm_params:
        model: vertex_ai/gemini-2.0-flash
        vertex_project: my-project-id
        vertex_location: us-central1
    - model_name: "gpt-4o-mini-openai"
      litellm_params:
        model: gpt-4o-mini
        api_key: os.environ/OPENAI_API_KEY

general_settings: 
  master_key: sk-1234  # alternatively use the env var - LITELLM_MASTER_KEY
  database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # alternatively use the env var - DATABASE_URL
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

### 3. 테스트

서로 다른 프로바이더에서 같은 파일 ID를 사용하려면 `target_model_names`를 지정합니다. 이는 config.yaml에서 설정한 model_name 목록 또는 UI의 'public_model_names' 목록입니다.

```python
target_model_names="gpt-4o-mini-openai, gemini-2.0-flash" # 👈 Specify model_names
```

키에서 사용할 수 있는 모델 이름 목록을 확인하려면 `/v1/models`를 확인합니다.

#### **PDF 파일 저장**

```python
from openai import OpenAI

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-1234", max_retries=0)


# Download and save the PDF locally 
url = (
    "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"
)
response = requests.get(url)
response.raise_for_status()

# Save the PDF locally
with open("2403.05530.pdf", "wb") as f:
    f.write(response.content)

file = client.files.create(
    file=open("2403.05530.pdf", "rb"),
    purpose="user_data", # can be any openai 'purpose' value
    extra_body={"target_model_names": "gpt-4o-mini-openai, gemini-2.0-flash"}, # 👈 Specify model_names
)

print(f"file id={file.id}")
```

#### **서로 다른 프로바이더에서 같은 파일 ID 사용**

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
completion = client.chat.completions.create(
    model="gpt-4o-mini-openai",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ]
)

print(completion.choices[0].message)
```


</TabItem>
<TabItem value="vertex" label="Vertex AI">

```python
completion = client.chat.completions.create(
    model="gemini-2.0-flash",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ]
)

print(completion.choices[0].message)

```

</TabItem>
</Tabs>

### 전체 예제

```python   
import base64
import requests
from openai import OpenAI

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-1234", max_retries=0)


# Download and save the PDF locally
url = (
    "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"
)
response = requests.get(url)
response.raise_for_status()

# Save the PDF locally
with open("2403.05530.pdf", "wb") as f:
    f.write(response.content)

# Read the local PDF file
file = client.files.create(
    file=open("2403.05530.pdf", "rb"),
    purpose="user_data", # can be any openai 'purpose' value
    extra_body={"target_model_names": "gpt-4o-mini-openai, vertex_ai/gemini-2.0-flash"},
)

print(f"file.id: {file.id}") # 👈 Unified file id

## GEMINI CALL ### 
completion = client.chat.completions.create(
    model="gemini-2.0-flash",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ]
)

print(completion.choices[0].message)


### OPENAI CALL ### 
completion = client.chat.completions.create(
    model="gpt-4o-mini-openai",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ],
)

print(completion.choices[0].message)

```

## 파일 권한 {#file-permissions}

`list` 및 `retrieve` 호출에서 접근 권한이 없는 파일이 사용자에게 보이지 않도록 합니다.

### 1. config.yaml 설정

```yaml
model_list:
    - model_name: "gpt-4o-mini-openai"
      litellm_params:
        model: gpt-4o-mini
        api_key: os.environ/OPENAI_API_KEY

general_settings: 
  master_key: sk-1234  # alternatively use the env var - LITELLM_MASTER_KEY
  database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # alternatively use the env var - DATABASE_URL
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

### 3. 사용자에게 키 발급

ID가 `user_123`인 사용자를 생성합니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/user/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"models": ["gpt-4o-mini-openai"], "user_id": "user_123"}'
```

응답에서 키를 가져옵니다.

```json
{
    "key": "sk-..."
}
```

### 4. 사용자가 파일 생성

#### 4a. 파일 생성

```jsonl
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already."}]}
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?"}]}
```

#### 4b. 파일 업로드

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-...", # 👈 Use the key you generated in step 3
    max_retries=0
)

# Upload file
finetuning_input_file = client.files.create(
    file=open("./fine_tuning.jsonl", "rb"), # {"model": "azure-gpt-4o"} <-> {"model": "gpt-4o-my-special-deployment"}
    purpose="fine-tune",
    extra_body={"target_model_names": "gpt-4.1-openai"} # 👈 Tells litellm which regions/projects to write the file in. 
)
print(finetuning_input_file) # file.id = "litellm_proxy/..." = {"model_name": {"deployment_id": "deployment_file_id"}}
```

### 5. 사용자가 파일 조회

<Tabs>
<TabItem value="has_access" label="사용자가 생성한 파일">

```python
from openai import OpenAI

... # User created file (3b)

file = client.files.retrieve(
    file_id=finetuning_input_file.id
)

print(file) # File retrieved successfully
```

</TabItem>
<TabItem value="no_access" label="사용자가 생성하지 않은 파일">

```python
from openai import OpenAI

... # User created file (3b)

try: 
    file = client.files.retrieve(
        file_id="bGl0ZWxsbV9wcm94eTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07dW5pZmllZF9pZCwyYTgzOWIyYS03YzI1LTRiNTUtYTUxYS1lZjdhODljNzZkMzU7dGFyZ2V0X21vZGVsX25hbWVzLGdwdC00by1iYXRjaA"
    )
except Exception as e:
    print(e) # User does not have access to this file

```

</TabItem>
</Tabs>




## 지원되는 엔드포인트

#### 파일 생성 - `/files`

```python
from openai import OpenAI

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-1234", max_retries=0)

# Download and save the PDF locally
url = (
    "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"
)
response = requests.get(url)
response.raise_for_status()

# Save the PDF locally
with open("2403.05530.pdf", "wb") as f:
    f.write(response.content)

# Read the local PDF file
file = client.files.create(
    file=open("2403.05530.pdf", "rb"),
    purpose="user_data", # can be any openai 'purpose' value
    extra_body={"target_model_names": "gpt-4o-mini-openai, vertex_ai/gemini-2.0-flash"},
)
```

#### 파일 조회 - `/files/{file_id}`

```python
client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-1234", max_retries=0)

file = client.files.retrieve(file_id=file.id)
```

#### 파일 삭제 - `/files/{file_id}/delete`

```python
client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-1234", max_retries=0)

file = client.files.delete(file_id=file.id)
```

#### 파일 목록 조회 - `/files`

```python
client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-1234", max_retries=0)

files = client.files.list(extra_body={"target_model_names": "gpt-4o-mini-openai"})

print(files) # All files user has created
```

파일 목록 조회의 Pre-GA 제한 사항:
 - 다중 모델 미지원: 현재는 모델 이름 1개만 지원됩니다.
 - 다중 배포 미지원: 현재는 모델 배포 1개만 지원됩니다. 예를 들어 `gpt-4o-mini-openai` 공개 모델 이름에 배포가 2개 있으면, 그중 하나를 선택하고 해당 배포의 모든 파일을 반환합니다.

Pre-GA 제한 사항은 관리형 파일 기능의 GA 전에 수정될 예정입니다.

## FAQ

**1. LiteLLM이 파일을 저장하나요?**

아니요. LiteLLM은 파일을 저장하지 않습니다. postgres DB에는 파일 ID만 저장합니다.

**2. LiteLLM은 주어진 파일 ID에 어떤 파일을 사용할지 어떻게 알 수 있나요?**

LiteLLM은 litellm 파일 ID와 모델별 파일 ID의 매핑을 postgres DB에 저장합니다. 요청이 들어오면 LiteLLM은 모델별 파일 ID를 조회하고, 프로바이더에 보내는 요청에서 해당 ID를 사용합니다.

**3. 파일 삭제는 어떻게 동작하나요?**

파일이 삭제되면 LiteLLM은 postgres DB의 매핑과 각 프로바이더에 있는 파일을 삭제합니다.

**4. 사용자가 다른 사용자가 생성한 파일 ID를 호출할 수 있나요?**

아니요. `v1.71.2`부터 사용자는 자신이 생성한 파일만 조회, 수정, 삭제할 수 있습니다.



## 아키텍처





<Image img={require('../../img/managed_files_arch.png')}  style={{ width: '800px', height: 'auto' }} />

## 함께 보기

- [Finetuning API를 사용하는 관리형 파일](../../docs/proxy/managed_finetuning)
- [Batch API를 사용하는 관리형 파일](../../docs/proxy/managed_batches)
