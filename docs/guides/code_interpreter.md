import Image from '@theme/IdealImage';

# Code Interpreter {#code-interpreter}

OpenAI의 Code Interpreter 도구를 사용해 안전한 샌드박스 환경에서 Python 코드를 실행합니다.

| 기능 | 지원 여부 |
|---------|-----------|
| `LiteLLM Python SDK` | ✅ |
| `LiteLLM AI Gateway` | ✅ |
| 지원 프로바이더 | `openai` |

## `LiteLLM AI Gateway`

### API (OpenAI SDK)

OpenAI SDK가 LiteLLM Gateway를 바라보도록 설정해 사용합니다.

```python showLineNumbers title="code_interpreter_gateway.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",  # Your LiteLLM API key
    base_url="http://localhost:4000"
)

response = client.responses.create(
    model="openai/gpt-4o",
    tools=[{"type": "code_interpreter"}],
    input="Calculate the first 20 fibonacci numbers and plot them"
)

print(response)
```

#### 스트리밍 {#streaming}

```python showLineNumbers title="code_interpreter_streaming.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

stream = client.responses.create(
    model="openai/gpt-4o",
    tools=[{"type": "code_interpreter"}],
    input="Generate sample sales data CSV and create a visualization",
    stream=True
)

for event in stream:
    print(event)
```

#### 생성된 파일 콘텐츠 가져오기 {#get-generated-file-content}

```python showLineNumbers title="get_file_content_gateway.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

# 1. Run code interpreter
response = client.responses.create(
    model="openai/gpt-4o",
    tools=[{"type": "code_interpreter"}],
    input="Create a scatter plot and save as PNG"
)

# 2. Get container_id from response
container_id = response.output[0].container_id

# 3. List files
files = client.containers.files.list(container_id=container_id)

# 4. Download file content
for file in files.data:
    content = client.containers.files.content(
        container_id=container_id,
        file_id=file.id
    )
    
    with open(file.filename, "wb") as f:
        f.write(content.read())
    print(f"Downloaded: {file.filename}")
```

### AI Gateway UI

LiteLLM 관리자 UI에는 Code Interpreter 지원이 기본으로 포함되어 있습니다.

<Image img={require('../../img/code_interp.png')} />

**단계:**

1. LiteLLM UI에서 **Playground**로 이동합니다.
2. **OpenAI model**을 선택합니다. 예: `openai/gpt-4o`
3. **Endpoint Type**에서 엔드포인트로 `/v1/responses`를 선택합니다.
4. 왼쪽 패널에서 **Code Interpreter**를 켭니다.
5. 코드 실행 또는 파일 생성을 요청하는 프롬프트를 전송합니다.

UI에는 다음 항목이 표시됩니다.
- 실행된 Python 코드(접기 가능)
- 인라인으로 표시되는 생성 이미지
- 파일 다운로드 링크(CSV 등)

## `LiteLLM Python SDK`

### Code Interpreter 실행 {#run-code-interpreter}

```python showLineNumbers title="code_interpreter.py"
import litellm

response = litellm.responses(
    model="openai/gpt-4o",
    input="Generate a bar chart of quarterly sales and save as PNG",
    tools=[{"type": "code_interpreter"}]
)

print(response)
```

### 생성된 파일 콘텐츠 가져오기 {#get-generated-file-content-1}

Code Interpreter 실행이 끝나면 생성된 파일을 가져옵니다.

```python showLineNumbers title="get_file_content.py"
import litellm

# 1. Run code interpreter
response = litellm.responses(
    model="openai/gpt-4o",
    input="Create a pie chart of market share and save as PNG",
    tools=[{"type": "code_interpreter"}]
)

# 2. Extract container_id from response
container_id = response.output[0].container_id  # e.g. "cntr_abc123..."

# 3. List files in container
files = litellm.list_container_files(
    container_id=container_id,
    custom_llm_provider="openai"
)

# 4. Download each file
for file in files.data:
    content = litellm.retrieve_container_file_content(
        container_id=container_id,
        file_id=file.id,
        custom_llm_provider="openai"
    )
    
    with open(file.filename, "wb") as f:
        f.write(content)
    print(f"Downloaded: {file.filename}")
```


## 관련 문서 {#related}

- [Containers API](/litellm-docs-kr/docs/containers) - 컨테이너 관리
- [Container Files API](/litellm-docs-kr/docs/container_files) - 컨테이너 내 파일 관리
- [OpenAI Code Interpreter 문서](https://platform.openai.com/docs/guides/tools-code-interpreter) - 공식 OpenAI 문서
