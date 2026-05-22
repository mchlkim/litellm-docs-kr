import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prompt Management

애플리케이션을 수정하지 않고 prompt management 도구(예: Langfuse)에서 실험을 실행하거나 특정 모델을 변경할 수 있습니다(예: gpt-4o에서 gpt4o-mini finetune으로 변경).

| 지원 통합 | 링크 |
|------------------------|------|
| Native LiteLLM GitOps(.prompt 파일) | [시작하기](native_litellm_prompt) |
| Langfuse               | [시작하기](https://langfuse.com/docs/prompts/get-started) |
| Humanloop              | [시작하기](../observability/humanloop) |
| Generic Prompt Management API | [시작하기](../adding_provider/generic_prompt_management_api) |

## config.yaml로 Prompt 온보딩

`config.yaml` 파일에서 prompt를 직접 온보딩하고 초기화할 수 있습니다. 이를 통해 다음을 수행할 수 있습니다.
- 프록시 시작 시 prompt 로드
- 프록시 설정과 함께 prompt를 코드로 관리
- 지원되는 prompt 통합(dotprompt, Langfuse, BitBucket, GitLab, custom) 사용

### 기본 구조

config.yaml에 `prompts` 필드를 추가합니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

prompts:
  - prompt_id: "my_prompt_id"
    litellm_params:
      prompt_id: "my_prompt_id"
      prompt_integration: "dotprompt"  # or langfuse, bitbucket, gitlab, generic_prompt_management, custom
      # integration-specific parameters below
```

### `prompt_integration` 이해

`prompt_integration` 필드는 prompt를 어디에서 어떤 방식으로 로드할지 결정합니다.

- **`dotprompt`**: 로컬 `.prompt` 파일 또는 inline content에서 로드
- **`langfuse`**: Langfuse prompt management에서 prompt 가져오기
- **`bitbucket`**: BitBucket 저장소의 `.prompt` 파일에서 로드(팀 기반 접근 제어)
- **`gitlab`**: GitLab 저장소의 `.prompt` 파일에서 로드(팀 기반 접근 제어)
- **`generic_prompt_management`**: 간단한 API 엔드포인트로 임의의 prompt management 시스템 통합(PR 불필요)
- **`custom`**: 자체 custom prompt management 구현 사용

각 통합은 자체 설정 파라미터와 접근 제어 메커니즘을 가집니다.

### 지원 통합

<Tabs>
<TabItem value="dotprompt" label="DotPrompt (File-based)">

**옵션 1: prompt 디렉터리 사용**

```yaml
prompts:
  - prompt_id: "hello"
    litellm_params:
      prompt_id: "hello"
      prompt_integration: "dotprompt"
      prompt_directory: "./prompts"  # Directory containing .prompt files

litellm_settings:
  global_prompt_directory: "./prompts"  # Global setting for all dotprompt integrations
```

**옵션 2: inline prompt 데이터 사용**

```yaml
prompts:
  - prompt_id: "my_inline_prompt"
    litellm_params:
      prompt_id: "my_inline_prompt"
      prompt_integration: "dotprompt"
      prompt_data:
        my_inline_prompt:
          content: "Hello {{name}}! How can I help you with {{topic}}?"
          metadata:
            model: "gpt-4"
            temperature: 0.7
            max_tokens: 150
```

**옵션 3: 단일 prompt에 `dotprompt_content` 사용**

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_id: "simple_prompt"
      prompt_integration: "dotprompt"
      dotprompt_content: |
        ---
        model: gpt-4
        temperature: 0.7
        ---
        System: You are a helpful assistant.
        
        User: {{user_message}}
```

prompt 디렉터리에 `.prompt` 파일을 만듭니다.

```yaml
# prompts/hello.prompt
---
model: gpt-4
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

</TabItem>

<TabItem value="langfuse" label="Langfuse">

```yaml
prompts:
  - prompt_id: "my_langfuse_prompt"
    litellm_params:
      prompt_id: "my_langfuse_prompt"
      prompt_integration: "langfuse"
      langfuse_public_key: "os.environ/LANGFUSE_PUBLIC_KEY"
      langfuse_secret_key: "os.environ/LANGFUSE_SECRET_KEY"
      langfuse_host: "https://cloud.langfuse.com"  # optional

litellm_settings:
  langfuse_public_key: "os.environ/LANGFUSE_PUBLIC_KEY"  # Global setting
  langfuse_secret_key: "os.environ/LANGFUSE_SECRET_KEY"  # Global setting
```

</TabItem>

<TabItem value="bitbucket" label="BitBucket">

```yaml
prompts:
  - prompt_id: "my_bitbucket_prompt"
    litellm_params:
      prompt_id: "my_bitbucket_prompt"
      prompt_integration: "bitbucket"
      bitbucket_workspace: "your-workspace"
      bitbucket_repository: "your-repo"
      bitbucket_access_token: "os.environ/BITBUCKET_ACCESS_TOKEN"
      bitbucket_branch: "main"  # optional, defaults to main

litellm_settings:
  global_bitbucket_config:
    workspace: "your-workspace"
    repository: "your-repo"
    access_token: "os.environ/BITBUCKET_ACCESS_TOKEN"
    branch: "main"
```

BitBucket 저장소에는 `.prompt` 파일이 있어야 합니다.

```yaml
# prompts/my_bitbucket_prompt.prompt
---
model: gpt-4
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

</TabItem>

<TabItem value="gitlab" label="GitLab">

```yaml
prompts:
  - prompt_id: "my_gitlab_prompt"
    litellm_params:
      prompt_id: "my_gitlab_prompt"
      prompt_integration: "gitlab"
      gitlab_project: "group/sub/repo"
      gitlab_access_token: "os.environ/GITLAB_ACCESS_TOKEN"
      gitlab_branch: "main"  # optional
      gitlab_prompts_path: "prompts"  # optional, defaults to root

litellm_settings:
  global_gitlab_config:
    project: "group/sub/repo"
    access_token: "os.environ/GITLAB_ACCESS_TOKEN"
    branch: "main"
```

GitLab 저장소에는 `.prompt` 파일이 있어야 합니다.

```yaml
# prompts/my_gitlab_prompt.prompt
---
model: gpt-4
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

</TabItem>

<TabItem value="generic" label="Generic Prompt Management">

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      provider_specific_query_params:
        project_name: litellm
        slug: hello-world-prompt-2bac
      api_base: http://localhost:8080
      api_key: os.environ/GENERIC_PROMPT_API_KEY
      ignore_prompt_manager_model: true  # optional
      ignore_prompt_manager_optional_params: true  # optional
```

**구현해야 하는 항목:**

다음을 반환하는 `/beta/litellm_prompt_management` GET 엔드포인트:

```json
{
  "prompt_id": "simple_prompt",
  "prompt_template": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Help me with {task}"
    }
  ],
  "prompt_template_model": "gpt-4",
  "prompt_template_optional_params": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

**장점:**
- PR 없이 임의의 prompt management 시스템 통합
- prompt 저장소와 버전 관리에 대한 완전한 제어
- `{variable}` 문법을 사용한 변수 치환 지원
- 필터링과 접근 제어를 위한 사용자 지정 query parameter

**더 알아보기:** [Generic Prompt Management API 문서](../adding_provider/generic_prompt_management_api)

</TabItem>
</Tabs>

### 전체 예제

여러 통합을 사용하는 여러 prompt를 보여주는 전체 예제입니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

prompts:
  # File-based dotprompt
  - prompt_id: "coding_assistant"
    litellm_params:
      prompt_id: "coding_assistant"
      prompt_integration: "dotprompt"
      prompt_directory: "./prompts"
  
  # Inline dotprompt
  - prompt_id: "simple_chat"
    litellm_params:
      prompt_id: "simple_chat"
      prompt_integration: "dotprompt"
      prompt_data:
        simple_chat:
          content: "You are a {{personality}} assistant. User: {{message}}"
          metadata:
            model: "gpt-4"
            temperature: 0.8
  
  # Langfuse prompt
  - prompt_id: "langfuse_chat"
    litellm_params:
      prompt_id: "langfuse_chat"
      prompt_integration: "langfuse"
      langfuse_public_key: "os.environ/LANGFUSE_PUBLIC_KEY"
      langfuse_secret_key: "os.environ/LANGFUSE_SECRET_KEY"

litellm_settings:
  global_prompt_directory: "./prompts"
```

### 동작 방식

1. **시작 시**: 프록시가 시작되면 `config.yaml`의 `prompts` 필드를 읽습니다.
2. **초기화**: 각 prompt는 `prompt_integration` 타입에 따라 초기화됩니다.
3. **메모리 내 저장**: prompt는 `IN_MEMORY_PROMPT_REGISTRY`에 저장됩니다.
4. **접근**: 요청에 `prompt_id`를 포함해 `/v1/chat/completions` 또는 `/v1/responses`에서 이 prompt를 사용합니다.

### Config로 로드한 Prompt 사용

config.yaml로 prompt를 로드한 뒤 API 요청에서 사용할 수 있습니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-4",
    "prompt_id": "coding_assistant",
    "prompt_variables": {
        "language": "python",
        "task": "create a web scraper"
    }
}'
```

같은 `prompt_id`를 Responses API에서도 사용할 수 있습니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/responses' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-4o",
    "prompt_id": "coding_assistant",
    "prompt_variables": {
        "language": "python",
        "task": "create a web scraper"
    },
    "input": []
}'
```

### Prompt 스키마 참조

`prompts` 목록의 각 prompt에는 다음이 필요합니다.

- **`prompt_id`**(string, required): prompt의 고유 식별자
- **`litellm_params`**(object, required): prompt 설정
  - **`prompt_id`**(string, required): 최상위 `prompt_id`와 일치해야 합니다.
  - **`prompt_integration`**(string, required): `dotprompt`, `langfuse`, `bitbucket`, `gitlab`, `custom` 중 하나
  - 추가 통합별 파라미터(위 탭 참고)
- **`prompt_info`**(object, optional): prompt 메타데이터
  - **`prompt_type`**(string): config로 로드한 prompt의 기본값은 `"config"`입니다.

### 참고

- config로 로드한 prompt는 `prompt_type: "config"`를 가지며 API로 **업데이트할 수 없습니다**.
- config prompt를 업데이트하려면 `config.yaml`을 수정하고 프록시를 재시작합니다.
- API로 업데이트 가능한 동적 prompt가 필요하면 `/prompts` 엔드포인트를 대신 사용합니다.
- 지원되는 모든 통합은 config로 로드한 prompt와 함께 동작합니다.


## 빠른 시작


<Tabs>

<TabItem value="sdk" label="SDK">

```python
import os 
import litellm

os.environ["LANGFUSE_PUBLIC_KEY"] = "public_key" # [OPTIONAL] set here or in `.completion`
os.environ["LANGFUSE_SECRET_KEY"] = "secret_key" # [OPTIONAL] set here or in `.completion`

litellm.set_verbose = True # see raw request to provider

resp = litellm.completion(
    model="langfuse/gpt-3.5-turbo",
    prompt_id="test-chat-prompt",
    prompt_variables={"user_message": "this is used"}, # [OPTIONAL]
    messages=[{"role": "user", "content": "<IGNORED>"}],
)
```



</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml을 설정합니다.

```yaml
model_list:
  - model_name: my-langfuse-model
    litellm_params:
      model: langfuse/openai-model
      prompt_id: "<langfuse_prompt_id>"
      api_key: os.environ/OPENAI_API_KEY
  - model_name: openai-model
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config config.yaml --detailed_debug
```

3. 테스트합니다.

<Tabs>
<TabItem value="curl" label="CURL">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "my-langfuse-model",
    "messages": [
        {
            "role": "user",
            "content": "THIS WILL BE IGNORED"
        }
    ],
    "prompt_variables": {
        "key": "this is used"
    }
}'
```
</TabItem>
<TabItem value="OpenAI Python SDK" label="OpenAI Python SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "prompt_variables": { # [OPTIONAL]
            "key": "this is used"
        }
    }
)

print(response)
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>


**Expected 로그:**

```
POST Request Sent from LiteLLM:
curl -X POST \
https://api.openai.com/v1/ \
-d '{'model': 'gpt-3.5-turbo', 'messages': <YOUR LANGFUSE PROMPT TEMPLATE>}'
```

## 모델 설정 방법

### LiteLLM에서 모델 설정

`langfuse/<litellm_model_name>` 형식을 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
litellm.completion(
    model="langfuse/gpt-3.5-turbo", # or `langfuse/anthropic/claude-3-5-sonnet`
    ...
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: langfuse/gpt-3.5-turbo # OR langfuse/anthropic/claude-3-5-sonnet
      prompt_id: <langfuse_prompt_id>
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
</Tabs>

### Langfuse에서 모델 설정

Langfuse 설정에 모델이 지정되어 있으면 해당 모델이 사용됩니다.

<Image img={require('../../img/langfuse_prompt_management_model_config.png')} />

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/chatgpt-v-2
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
```

## 'prompt_variables'란?

- `prompt_variables`: prompt의 일부를 치환하는 데 사용할 변수 dictionary입니다.


## 'prompt_id'란?

- `prompt_id`: 요청에 사용할 prompt의 ID입니다.

<Image img={require('../../img/langfuse_prompt_id.png')} />

## 포맷된 prompt는 어떤 형태인가?

### `/chat/completions` messages

클라이언트가 보낸 `messages` 필드는 무시됩니다.

Langfuse prompt가 `messages` 필드를 대체합니다.

prompt의 일부를 치환하려면 `prompt_variables` 필드를 사용합니다. [prompt 변수가 사용되는 방식 보기](https://github.com/BerriAI/litellm/blob/017f83d038f85f93202a083cf334de3544a3af01/litellm/integrations/langfuse/langfuse_prompt_management.py#L127)

Langfuse prompt가 문자열이면 user message로 전송됩니다. 모든 provider가 system message를 지원하는 것은 아닙니다.

Langfuse prompt가 list이면 그대로 전송됩니다. Langfuse chat prompt는 OpenAI와 호환됩니다.

## Architectural 개요

<Image img={require('../../img/prompt_management_architecture_doc.png')} />

## API 참조

SDK의 `litellm.completion` 함수와 config.yaml의 `litellm_params`에 전달할 수 있는 파라미터입니다.

```
prompt_id: str # required
prompt_variables: Optional[dict] # optional
prompt_version: Optional[int] # optional
langfuse_public_key: Optional[str] # optional
langfuse_secret: Optional[str] # optional
langfuse_secret_key: Optional[str] # optional
langfuse_host: Optional[str] # optional
```
