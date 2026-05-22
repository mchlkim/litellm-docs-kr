---
id: container_files
title: /containers/files
---

# `Container Files API` {#container-files-api}

Code Interpreter 컨테이너 안의 파일을 관리합니다. code interpreter가 차트, CSV, 이미지 같은 출력물을 생성하면 파일이 자동으로 만들어집니다.

:::tip
Code Interpreter 사용 방법을 찾고 있다면 [Code Interpreter 가이드](/docs/guides/code_interpreter)를 참고하세요.
:::

| 기능 | 지원 여부 |
|---------|-----------|
| 비용 추적 | ✅ |
| 로깅 | ✅ |
| 지원 프로바이더 | `openai` |

## 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|----------|--------|-------------|
| `/v1/containers/{container_id}/files` | POST | 컨테이너에 파일 업로드 |
| `/v1/containers/{container_id}/files` | GET | 컨테이너 파일 목록 조회 |
| `/v1/containers/{container_id}/files/{file_id}` | GET | 파일 메타데이터 조회 |
| `/v1/containers/{container_id}/files/{file_id}/content` | GET | 파일 콘텐츠 다운로드 |
| `/v1/containers/{container_id}/files/{file_id}` | DELETE | 파일 삭제 |

## LiteLLM Python SDK

### Container File 업로드

파일을 컨테이너 세션에 직접 업로드합니다. `/chat/completions` 또는 `/responses`가 컨테이너로 파일을 보내지만 입력 파일 유형이 PDF로 제한되는 경우에 유용합니다. 이 엔드포인트를 사용하면 CSV, Excel, Python scripts 등 다른 파일 유형도 다룰 수 있습니다.

```python showLineNumbers title="upload_container_file.py"
from litellm import upload_container_file

# Upload a CSV file
file = upload_container_file(
    container_id="cntr_123...",
    file=("data.csv", open("data.csv", "rb").read(), "text/csv"),
    custom_llm_provider="openai"
)

print(f"Uploaded: {file.id}")
print(f"Path: {file.path}")
```

**Async:**

```python showLineNumbers title="aupload_container_file.py"
from litellm import aupload_container_file

file = await aupload_container_file(
    container_id="cntr_123...",
    file=("script.py", b"print('hello world')", "text/x-python"),
    custom_llm_provider="openai"
)
```

**지원 파일 형식:**
- CSV (`.csv`)
- Excel (`.xlsx`)
- Python scripts (`.py`)
- JSON (`.json`)
- Markdown (`.md`)
- Text files (`.txt`)
- 기타 형식

### Container Files 목록 조회

```python showLineNumbers title="list_container_files.py"
from litellm import list_container_files

files = list_container_files(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

for file in files.data:
    print(f"  - {file.id}: {file.filename}")
```

**Async:**

```python showLineNumbers title="alist_container_files.py"
from litellm import alist_container_files

files = await alist_container_files(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)
```

### Container File 조회

```python showLineNumbers title="retrieve_container_file.py"
from litellm import retrieve_container_file

file = retrieve_container_file(
    container_id="cntr_123...",
    file_id="cfile_456...",
    custom_llm_provider="openai"
)

print(f"File: {file.filename}")
print(f"Size: {file.bytes} bytes")
```

### 파일 콘텐츠 다운로드

```python showLineNumbers title="retrieve_container_file_content.py"
from litellm import retrieve_container_file_content

content = retrieve_container_file_content(
    container_id="cntr_123...",
    file_id="cfile_456...",
    custom_llm_provider="openai"
)

# content is raw bytes
with open("output.png", "wb") as f:
    f.write(content)
```

### Container File 삭제

```python showLineNumbers title="delete_container_file.py"
from litellm import delete_container_file

result = delete_container_file(
    container_id="cntr_123...",
    file_id="cfile_456...",
    custom_llm_provider="openai"
)

print(f"Deleted: {result.deleted}")
```

## `LiteLLM AI Gateway (Proxy)` {#litellm-ai-gateway-proxy}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### 파일 업로드

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="upload_file.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

file = client.containers.files.create(
    container_id="cntr_123...",
    file=open("data.csv", "rb")
)

print(f"Uploaded: {file.id}")
print(f"Path: {file.path}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="upload_file.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files" \
    -H "Authorization: Bearer sk-1234" \
    -F file="@data.csv"
```

</TabItem>
</Tabs>

### 파일 목록 조회

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="list_files.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

files = client.containers.files.list(
    container_id="cntr_123..."
)

for file in files.data:
    print(f"  - {file.id}: {file.filename}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="list_files.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files" \
    -H "Authorization: Bearer sk-1234"
```

</TabItem>
</Tabs>

### 파일 메타데이터 조회

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="retrieve_file.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

file = client.containers.files.retrieve(
    container_id="cntr_123...",
    file_id="cfile_456..."
)

print(f"File: {file.filename}")
print(f"Size: {file.bytes} bytes")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="retrieve_file.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files/cfile_456..." \
    -H "Authorization: Bearer sk-1234"
```

</TabItem>
</Tabs>

### 파일 콘텐츠 다운로드

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="download_content.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

content = client.containers.files.content(
    container_id="cntr_123...",
    file_id="cfile_456..."
)

with open("output.png", "wb") as f:
    f.write(content.read())
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="download_content.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files/cfile_456.../content" \
    -H "Authorization: Bearer sk-1234" \
    --output downloaded_file.png
```

</TabItem>
</Tabs>

### 파일 삭제

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="delete_file.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

result = client.containers.files.delete(
    container_id="cntr_123...",
    file_id="cfile_456..."
)

print(f"Deleted: {result.deleted}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="delete_file.sh"
curl -X DELETE "http://localhost:4000/v1/containers/cntr_123.../files/cfile_456..." \
    -H "Authorization: Bearer sk-1234"
```

</TabItem>
</Tabs>

## 파라미터

### 파일 업로드

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `container_id` | string | 예 | Container ID |
| `file` | FileTypes | 예 | 업로드할 파일입니다. `(filename, content, content_type)` 튜플, file-like object, bytes를 사용할 수 있습니다. |

### 파일 목록 조회

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `container_id` | string | 예 | Container ID |
| `after` | string | 아니요 | 페이지네이션 커서 |
| `limit` | integer | 아니요 | 반환할 항목 수입니다. 1-100 사이이며 기본값은 20입니다. |
| `order` | string | 아니요 | 정렬 순서입니다. `asc` 또는 `desc` |

### 파일 조회/삭제

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `container_id` | string | 예 | Container ID |
| `file_id` | string | 예 | File ID |

## 응답 객체

### `ContainerFileObject`

```json showLineNumbers title="ContainerFileObject"
{
  "id": "cfile_456...",
  "object": "container.file",
  "container_id": "cntr_123...",
  "bytes": 12345,
  "created_at": 1234567890,
  "filename": "chart.png",
  "path": "/mnt/data/chart.png",
  "source": "code_interpreter"
}
```

### `ContainerFileListResponse`

```json showLineNumbers title="ContainerFileListResponse"
{
  "object": "list",
  "data": [...],
  "first_id": "cfile_456...",
  "last_id": "cfile_789...",
  "has_more": false
}
```

### `DeleteContainerFileResponse`

```json showLineNumbers title="DeleteContainerFileResponse"
{
  "id": "cfile_456...",
  "object": "container.file.deleted",
  "deleted": true
}
```

## 지원 프로바이더

| Provider | Status |
|----------|--------|
| OpenAI | ✅ 지원 |

## 관련 문서

- [Containers API](/docs/containers) - 컨테이너 관리
- [Code Interpreter 가이드](/docs/guides/code_interpreter) - LiteLLM에서 Code Interpreter 사용
