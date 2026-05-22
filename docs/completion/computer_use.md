import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 컴퓨터 사용 {#computer-use}

컴퓨터 사용을 통해 모델은 스크린샷을 찍고 클릭, 입력, 스크롤 같은 작업을 수행하면서 컴퓨터 인터페이스와 상호작용할 수 있습니다. 이를 통해 AI 모델이 데스크톱 환경을 자율적으로 조작할 수 있습니다.

**지원 프로바이더:**
- Anthropic API (`anthropic/`)
- Bedrock (Anthropic) (`bedrock/`)
- Vertex AI (Anthropic) (`vertex_ai/`)

**지원 툴 유형:**
- `computer` - 디스플레이 매개변수를 포함한 컴퓨터 상호작용 툴
- `bash` - Bash 셸 툴
- `text_editor` - 텍스트 편집기 툴
- `web_search` - 웹 검색 툴

LiteLLM은 지원되는 모든 프로바이더에서 컴퓨터 사용 툴을 표준화합니다.

## 빠른 시작 {#quick-start}

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# Computer use tool
    tools = [
        {
            "type": "computer_20241022",
            "name": "computer",
            "display_height_px": 768,
            "display_width_px": 1024,
            "display_number": 0,
        }
    ]
    
    messages = [
        {
            "role": "user", 
            "content": [
                {
                    "type": "text",
                "text": "Take a screenshot and tell me what you see"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                }
            }
        ]
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy Server">

1. config.yaml에 컴퓨터 사용 모델을 정의합니다.

```yaml
model_list:
  - model_name: claude-3-5-sonnet-latest # Anthropic claude-3-5-sonnet-latest
    litellm_params:
      model: anthropic/claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: claude-bedrock         # Bedrock Anthropic model
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
    model_info:
      supports_computer_use: True        # set supports_computer_use to True so /model/info returns this attribute as True
```

2. 프록시 서버를 실행합니다.

```bash
litellm --config config.yaml
```

3. OpenAI Python SDK로 테스트합니다.

```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # your litellm proxy api key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet-latest",
    messages=[
        {
            "role": "user", 
            "content": [
                {
                    "type": "text",
                    "text": "Take a screenshot and tell me what you see"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    }
                }
            ]
        }
    ],
    tools=[
        {
            "type": "computer_20241022",
            "name": "computer",
            "display_height_px": 768,
            "display_width_px": 1024,
            "display_number": 0,
        }
    ]
)

print(response)
```

</TabItem>
</Tabs>

## 모델이 `computer use`를 지원하는지 확인하기 {#checking-if-a-model-supports-computer-use}

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

`litellm.supports_computer_use(model="")`를 사용합니다. 모델이 컴퓨터 사용을 지원하면 `True`, 지원하지 않으면 `False`를 반환합니다.

```python
import litellm

assert litellm.supports_computer_use(model="anthropic/claude-3-5-sonnet-latest") == True
assert litellm.supports_computer_use(model="anthropic/claude-3-7-sonnet-20250219") == True
assert litellm.supports_computer_use(model="bedrock/anthropic.claude-haiku-4-5-20251001:0") == True
assert litellm.supports_computer_use(model="vertex_ai/claude-3-5-sonnet") == True
assert litellm.supports_computer_use(model="openai/gpt-4") == False
```
</TabItem>

<TabItem label="LiteLLM Proxy Server" value="proxy">

1. config.yaml에 컴퓨터 사용 모델을 정의합니다.

```yaml
model_list:
  - model_name: claude-3-5-sonnet-latest # Anthropic claude-3-5-sonnet-latest
    litellm_params:
      model: anthropic/claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: claude-bedrock         # Bedrock Anthropic model
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
    model_info:
      supports_computer_use: True        # set supports_computer_use to True so /model/info returns this attribute as True
```

2. 프록시 서버를 실행합니다.

```bash
litellm --config config.yaml
```

3. 모델이 `computer use`를 지원하는지 확인하려면 `/model_group/info`를 호출합니다.

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
      "model_group": "claude-3-5-sonnet-latest",
      "providers": ["anthropic"],
      "max_input_tokens": 200000,
      "max_output_tokens": 8192,
      "mode": "chat",
      "supports_computer_use": true, # 👈 supports_computer_use is true
      "supports_vision": true,
      "supports_function_calling": true
    },
    {
      "model_group": "claude-bedrock",
      "providers": ["bedrock"],
      "max_input_tokens": 200000,
      "max_output_tokens": 8192,
      "mode": "chat",
      "supports_computer_use": true, # 👈 supports_computer_use is true
      "supports_vision": true,
      "supports_function_calling": true
    }
  ]
}
```

</TabItem>
</Tabs>

## 여러 툴 유형 {#different-tool-types}

컴퓨터 사용은 다양한 상호작용 모드를 위해 여러 툴 유형을 지원합니다.

<Tabs>
<TabItem value="computer" label="컴퓨터 툴">

`computer_20241022` 툴은 직접적인 화면 상호작용 기능을 제공합니다.

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "computer_20241022", 
        "name": "computer",
        "display_height_px": 768,
        "display_width_px": 1024,
        "display_number": 0,
    }
]

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text", 
                "text": "Click on the search button in the screenshot"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                }
            }
        ]
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="bash" label="Bash 툴">

`bash_20241022` 툴은 명령줄 인터페이스 접근 기능을 제공합니다.

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "bash_20241022",
        "name": "bash"
    }
]

messages = [
    {
        "role": "user",
        "content": "List the files in the current directory using bash"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="text_editor" label="텍스트 편집기 툴">

`text_editor_20250124` 툴은 텍스트 파일 편집 기능을 제공합니다.

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "text_editor_20250124",
        "name": "str_replace_editor"
    }
]

messages = [
    {
        "role": "user",
        "content": "Create a simple Python hello world script"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
</Tabs>

## 여러 툴을 함께 사용하는 고급 사용법 {#advanced-usage-with-multiple-tools}

하나의 요청에서 여러 컴퓨터 사용 툴을 함께 사용할 수 있습니다.

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "computer_20241022",
        "name": "computer", 
        "display_height_px": 768,
        "display_width_px": 1024,
        "display_number": 0,
    },
    {
        "type": "bash_20241022",
        "name": "bash"
    },
    {
        "type": "text_editor_20250124", 
        "name": "str_replace_editor"
    }
]

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Take a screenshot, then create a file describing what you see, and finally use bash to show the file contents"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    }
                }
            ]
        }
    ]
    
response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
            messages=messages,
            tools=tools,
)

print(response)
```

## 사양 {#spec}

### 컴퓨터 툴 (`computer_20241022`) {#computer-tool-computer_20241022}

```json
{
  "type": "computer_20241022",
  "name": "computer",
  "display_height_px": 768,    // Required: Screen height in pixels  
  "display_width_px": 1024,    // Required: Screen width in pixels
  "display_number": 0          // Optional: Display number (default: 0)
}
```

### Bash 툴 (`bash_20241022`) {#bash-tool-bash_20241022}

```json
{
  "type": "bash_20241022", 
  "name": "bash"              // Required: Tool name
}
```

### 텍스트 편집기 툴 (`text_editor_20250124`) {#text-editor-tool-text_editor_20250124}

```json
{
  "type": "text_editor_20250124",
  "name": "str_replace_editor"  // Required: Tool name
}
```

### 웹 검색 툴 (`web_search_20250305`) {#web-search-tool-web_search_20250305}

```json
{
  "type": "web_search_20250305",
  "name": "web_search"         // Required: Tool name
}
```
