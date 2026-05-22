import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM 프롬프트 관리 (GitOps) {#litellm-prompt-management-gitops}

프롬프트를 저장소의 `.prompt` 파일로 보관하고 LiteLLM에서 바로 사용하세요. 외부 서비스는 필요하지 않습니다.

## 지원되는 통합 {#supported-integrations}

- **File System**: `.prompt` 파일을 로컬에 저장합니다.
- **BitBucket**: 팀 기반 액세스 제어가 적용된 BitBucket 저장소에 `.prompt` 파일을 저장합니다.
- **Gitlab**: 팀 기반 액세스 제어가 적용된 Gitlab 저장소에 `.prompt` 파일을 저장합니다.
## 빠른 시작

<Tabs>

<TabItem value="sdk" label="SDK">

**1. .prompt 파일 생성**

`prompts/hello.prompt`를 생성합니다.

```yaml
---
model: gpt-4
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. LiteLLM에서 사용**

```python
import litellm

# Set the global prompt directory
litellm.global_prompt_directory = "prompts/"

response = litellm.completion(
    model="dotprompt/gpt-4",
    prompt_id="hello",
    prompt_variables={"user_message": "What is the capital of France?"}
)
```

</TabItem>
<TabItem value="bitbucket" label="BITBUCKET">

**1. BitBucket에 .prompt 파일 생성**

BitBucket 저장소에 `prompts/hello.prompt`를 생성합니다.

```yaml
---
model: gpt-4
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. BitBucket 액세스 설정**

```python
import litellm

# Configure BitBucket access
bitbucket_config = {
    "workspace": "your-workspace",
    "repository": "your-repo",
    "access_token": "your-access-token",
    "branch": "main"
}

# Set global BitBucket configuration
litellm.set_global_bitbucket_config(bitbucket_config)
```

**3. LiteLLM에서 사용**

```python
response = litellm.completion(
    model="bitbucket/gpt-4",
    prompt_id="hello",
    prompt_variables={"user_message": "What is the capital of France?"}
)
```

</TabItem>
<TabItem value="gitlab" label="GITLAB">

**1. Gitlab 저장소에 .prompt 파일 생성**

Gitlab 저장소에 `prompts/hello.prompt`를 생성합니다.

```yaml
---
model: gpt-4
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. Gitlab 액세스 설정**

```python
import litellm

# Configure gitlab access
gitlab_config = {
    "workspace": "your-workspace",
    "repository": "your-repo",
    "access_token": "your-access-token",
    "branch": "main"
}

# Set global gitlab configuration
litellm.set_global_gitlab_config(gitlab_config)
```

**3. LiteLLM에서 사용**

```python
response = litellm.completion(
    model="gitlab/gpt-4",
    prompt_id="hello",
    prompt_variables={"user_message": "What is the capital of France?"}
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

**1. .prompt 파일 생성**

`prompts/hello.prompt`를 생성합니다.

```yaml
---
model: gpt-4
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. config.yaml 설정**

```yaml
model_list:
  - model_name: my-dotprompt-model
    litellm_params:
      model: dotprompt/gpt-4
      prompt_id: "hello"
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  global_prompt_directory: "./prompts"
  # Or use BitBucket for team-based prompt management
  global_bitbucket_config:
    workspace: "your-workspace"
    repository: "your-repo"
    access_token: "your-access-token"
    branch: "main"
  # Or use Gitlab for team-based prompt management
  global_gitlab_config:
    workspace: "your-workspace"
    repository: "your-repo"
    access_token: "your-access-token"
    branch: "main"
```

**3. 프록시 시작**

```bash
litellm --config config.yaml --detailed_debug
```

**4. 테스트**

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "my-dotprompt-model",
    "messages": [{"role": "user", "content": "IGNORED"}],
    "prompt_variables": {
        "user_message": "What is the capital of France?"
    }
}'
```

</TabItem>
</Tabs>

### .prompt 파일 형식 {#prompt-file-format}

`.prompt` 파일은 메타데이터에 YAML frontmatter를 사용하며 Jinja2 템플릿을 지원합니다.

```yaml
---
model: gpt-4                    # Model to use
temperature: 0.7                # Optional parameters
max_tokens: 1000
input:
  schema:
    user_message: string        # Input validation (optional)
---
System: You are a helpful {{role}} assistant.

User: {{user_message}}
```

### 고급 기능 {#advanced-features}

**다중 역할 대화:**

```yaml
---
model: gpt-4
temperature: 0.3
---
System: You are a helpful coding assistant.

User: {{user_question}}
```

**동적 모델 선택:**

```yaml
---
model: "{{preferred_model}}"  # Model can be a variable
temperature: 0.7
---
System: You are a helpful assistant specialized in {{domain}}.

User: {{user_message}}
```

### API 참고 자료 {#api-reference}

프롬프트 통합에는 다음 파라미터를 사용합니다.

**File System (dotprompt):**
```
model: dotprompt/<base_model>     # required (e.g., dotprompt/gpt-4)
prompt_id: str                    # required - the .prompt filename without extension
prompt_variables: Optional[dict]  # optional - variables for template rendering
```

**BitBucket:**
```
model: bitbucket/<base_model>     # required (e.g., bitbucket/gpt-4)
prompt_id: str                    # required - the .prompt filename without extension
prompt_variables: Optional[dict]  # optional - variables for template rendering
bitbucket_config: Optional[dict]  # optional - BitBucket configuration (if not set globally)
```

**Gitlab:**
```
model: gitlab/<base_model>        # required (e.g., gitlab/gpt-4)
prompt_id: str                    # required - the .prompt filename without extension
prompt_variables: Optional[dict]  # optional - variables for template rendering
gitlab_config: Optional[dict]     # optional - Gitlab configuration (if not set globally)
```

**예제 API 호출:**

```python
# File system integration
response = litellm.completion(
    model="dotprompt/gpt-4",
    prompt_id="hello",
    prompt_variables={"user_message": "Hello world"},
    messages=[{"role": "user", "content": "This will be ignored"}]
)

# BitBucket integration
response = litellm.completion(
    model="bitbucket/gpt-4",
    prompt_id="hello",
    prompt_variables={"user_message": "Hello world"},
    bitbucket_config={
        "workspace": "your-workspace",
        "repository": "your-repo",
        "access_token": "your-token"
    }
)

# Gitlab integration
response = litellm.completion(
    model="gitlab/gpt-4",
    prompt_id="hello",
    prompt_variables={"user_message": "Hello world"},
    gitlab_config={
        "project": "a/b/<repo_name>",
        "access_token": "your-access-token",
        "base_url": "gitlab url",
        "prompts_path": "src/prompts", # folder to point to, defaults to root
        "branch":"main"  # optional, defaults to main
    }
)
```
