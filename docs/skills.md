# Anthropic Skills API용 /skills

| 기능 | 지원 여부 | 
|---------|-----------|
| 비용 추적 | ✅ |
| Logging | ✅ |
| 로드 밸런싱 | ✅ |
| 지원 프로바이더 | `anthropic` |

:::tip

LiteLLM은 재사용 가능한 AI 기능을 생성, 관리, 사용하기 위해 [Anthropic Skills API](https://docs.anthropic.com/en/docs/build-with-claude/skills)를 따릅니다.

:::

## **LiteLLM Python SDK 사용법**

### 빠른 시작 - Skill 생성 {#skill-create}

```python showLineNumbers title="create_skill.py"
from litellm import create_skill
import zipfile
import os

# Create a SKILL.md file
skill_content = """---
name: test-skill
description: A custom skill for data analysis
---

# Test Skill

This skill helps with data analysis tasks.
"""

# Create skill directory and SKILL.md
os.makedirs("test-skill", exist_ok=True)
with open("test-skill/SKILL.md", "w") as f:
    f.write(skill_content)

# Create a zip file
with zipfile.ZipFile("test-skill.zip", "w") as zipf:
    zipf.write("test-skill/SKILL.md", "test-skill/SKILL.md")

# Create the skill
response = create_skill(
    display_title="My Custom Skill",
    files=[open("test-skill.zip", "rb")],
    custom_llm_provider="anthropic",
    api_key="sk-ant-..."
)

print(f"Skill created: {response.id}")
```

### Skills 목록 조회

```python showLineNumbers title="list_skills.py"
from litellm import list_skills

response = list_skills(
    custom_llm_provider="anthropic",
    api_key="sk-ant-...",
    limit=20
)

for skill in response.data:
    print(f"{skill.display_title}: {skill.id}")
```

### Skill 세부 정보 조회

```python showLineNumbers title="get_skill.py"
from litellm import get_skill

skill = get_skill(
    skill_id="skill_01...",
    custom_llm_provider="anthropic",
    api_key="sk-ant-..."
)

print(f"Skill: {skill.display_title}")
print(f"Description: {skill.description}")
```

### Skill 삭제

```python showLineNumbers title="delete_skill.py"
from litellm import delete_skill

response = delete_skill(
    skill_id="skill_01...",
    custom_llm_provider="anthropic",
    api_key="sk-ant-..."
)

print(f"Deleted: {response.id}")
```

### Async 사용법

```python showLineNumbers title="async_skills.py"
from litellm import acreate_skill, alist_skills, aget_skill, adelete_skill
import asyncio

async def manage_skills():
    # Create skill
    with open("test-skill.zip", "rb") as f:
        skill = await acreate_skill(
            display_title="My Async Skill",
            files=[f],
            custom_llm_provider="anthropic",
            api_key="sk-ant-..."
        )
    
    # List skills
    skills = await alist_skills(
        custom_llm_provider="anthropic",
        api_key="sk-ant-..."
    )
    
    # Get skill
    skill_detail = await aget_skill(
        skill_id=skill.id,
        custom_llm_provider="anthropic",
        api_key="sk-ant-..."
    )
    
    # Delete skill (if no versions exist)
    # await adelete_skill(
    #     skill_id=skill.id,
    #     custom_llm_provider="anthropic",
    #     api_key="sk-ant-..."
    # )

asyncio.run(manage_skills())
```

## **LiteLLM Proxy 사용법**

LiteLLM은 skills 관리를 위해 Anthropic 호환 `/skills` 엔드포인트를 제공합니다.

### 인증

Skills API 요청을 인증하는 방법은 두 가지입니다.

**옵션 1: 기본 ANTHROPIC_API_KEY 사용**

`ANTHROPIC_API_KEY` 환경 변수를 설정하세요. `model` 파라미터가 없는 요청은 이 기본 키를 사용합니다.

```yaml showLineNumbers title="config.yaml"
# No model_list needed - uses env var
# ANTHROPIC_API_KEY=sk-ant-...
```

```bash
# Request will use ANTHROPIC_API_KEY from environment
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

**옵션 2: Credential 선택을 위한 모델 지정**

config에 여러 모델을 정의하고 `model` 파라미터를 사용해 어떤 credential을 사용할지 지정합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
```

LiteLLM을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 기본 사용법

아래 모든 예제는 두 인증 옵션, 즉 기본 env key 또는 model 기반 routing 중 **어느 쪽에서도** 동작합니다.

#### Skill 생성

ZIP 파일을 업로드하거나 SKILL.md 파일을 직접 업로드할 수 있습니다.

**옵션 1: ZIP 파일 업로드**

```bash showLineNumbers title="create_skill_zip.sh"
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "display_title=My Skill" \
  -F "files[]=@test-skill.zip"
```

**옵션 2: SKILL.md 직접 업로드**

```bash showLineNumbers title="create_skill_md.sh"
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "display_title=My Skill" \
  -F "files[]=@test-skill/SKILL.md;filename=test-skill/SKILL.md"
```

#### Skills 목록 조회

```bash showLineNumbers title="list_skills.sh"
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

#### Skill 조회

```bash showLineNumbers title="get_skill.sh"
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true" \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

#### Skill 삭제

```bash showLineNumbers title="delete_skill.sh"
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true" \
  -X DELETE \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

### Model 기반 Routing(Multi-Account)

여러 Anthropic 계정이 있다면 model 기반 routing으로 사용할 계정을 지정할 수 있습니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-team-a
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY_TEAM_A
  
  - model_name: claude-team-b
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY_TEAM_B
```

그런 다음 `model` 파라미터를 사용해 특정 계정으로 라우팅합니다.

**Routing으로 Skill 생성**

```bash showLineNumbers title="create_with_routing.sh"
# Route to Team A - using ZIP file
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "model=claude-team-a" \
  -F "display_title=Team A Skill" \
  -F "files[]=@test-skill.zip"

# Route to Team B - using direct SKILL.md upload
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "model=claude-team-b" \
  -F "display_title=Team B Skill" \
  -F "files[]=@test-skill/SKILL.md;filename=test-skill/SKILL.md"
```

**Routing으로 Skills 목록 조회**

```bash showLineNumbers title="list_with_routing.sh"
# List Team A skills
curl "http://0.0.0.0:4000/v1/skills?beta=true&model=claude-team-a" \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"

# List Team B skills
curl "http://0.0.0.0:4000/v1/skills?beta=true&model=claude-team-b" \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

**Routing으로 Skill 조회**

```bash showLineNumbers title="get_with_routing.sh"
# Get skill from Team A
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true&model=claude-team-a" \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"

# Get skill from Team B
curl "http://0.0.0.0:4000/v1/skills/skill_01xyz?beta=true&model=claude-team-b" \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

**Routing으로 Skill 삭제**

```bash showLineNumbers title="delete_with_routing.sh"
# Delete skill from Team A
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true&model=claude-team-a" \
  -X DELETE \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"

# Delete skill from Team B
curl "http://0.0.0.0:4000/v1/skills/skill_01xyz?beta=true&model=claude-team-b" \
  -X DELETE \
  -H "X-Api-Key: sk-1234" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

## **SKILL.md 형식**

Skills에는 YAML frontmatter가 포함된 `SKILL.md` 파일이 필요합니다.

```markdown showLineNumbers title="SKILL.md"
---
name: test-skill
description: A brief description of what this skill does
license: MIT
allowed-tools:
  - computer_20250124
  - text_editor_20250124
---

# Test Skill

Detailed instructions for Claude on how to use this skill.

## Usage

Examples and best practices...
```

### YAML Frontmatter 요구 사항

| 필드 | 필수 여부 | 설명 |
|-------|----------|-------------|
| `name` | 예 | Skill 식별자입니다(소문자, 숫자, 하이픈만 허용). 디렉터리 이름과 일치해야 합니다. |
| `description` | 예 | Skill에 대한 간단한 설명 |
| `license` | 아니요 | License 유형(예: MIT, Apache-2.0) |
| `allowed-tools` | 아니요 | 이 skill이 사용할 수 있는 Claude 도구 목록 |
| `metadata` | 아니요 | 추가 사용자 지정 metadata |

**중요:** `name` 필드는 skill 디렉터리 이름과 정확히 일치해야 합니다. 예를 들어 디렉터리가 `test-skill`이면 frontmatter에는 `name: test-skill`이 있어야 합니다.

### 파일 구조

**옵션 1: ZIP 파일 구조**

Skills는 skill 이름과 일치하는 최상위 디렉터리로 패키징해야 합니다.

```
test-skill.zip
└── test-skill/         # Top-level folder (name must match skill name in SKILL.md)
    └── SKILL.md        # Required skill definition file
```

모든 파일은 같은 최상위 디렉터리 안에 있어야 하며, `SKILL.md`는 해당 디렉터리의 root에 있어야 합니다.

**옵션 2: SKILL.md 직접 업로드**

ZIP을 만들지 않고 `SKILL.md`를 직접 업로드할 때는 필요한 구조를 보존하기 위해 filename 파라미터에 skill 디렉터리 경로를 포함해야 합니다.

```bash
# The filename parameter must include the skill directory path
-F "files[]=@test-skill/SKILL.md;filename=test-skill/SKILL.md"
```

이렇게 하면 API가 `SKILL.md`가 `test-skill` 디렉터리에 속한다는 것을 알 수 있습니다.

**중요 요구 사항:**
- 폴더 이름(ZIP 또는 filename 경로 안의 이름)은 SKILL.md frontmatter의 `name` 필드와 **정확히 일치해야** 합니다.
- `SKILL.md`는 하위 디렉터리가 아니라 skill 디렉터리의 root에 있어야 합니다.
- 모든 추가 파일은 같은 skill 디렉터리 안에 있어야 합니다.

## **응답 형식**

### Skill 객체

```json showLineNumbers
{
  "id": "skill_01abc123",
  "type": "skill",
  "name": "my-skill",
  "display_title": "My Custom Skill",
  "description": "A brief description",
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z",
  "latest_version_id": "skillver_01xyz789"
}
```

### Skills 목록 응답

```json showLineNumbers
{
  "data": [
    {
      "id": "skill_01abc",
      "type": "skill",
      "name": "skill-one",
      "display_title": "Skill One",
      "description": "First skill"
    },
    {
      "id": "skill_02def",
      "type": "skill",
      "name": "skill-two",
      "display_title": "Skill Two",
      "description": "Second skill"
    }
  ],
  "has_more": false,
  "first_id": "skill_01abc",
  "last_id": "skill_02def"
}
```


## **지원 프로바이더**

| Provider | 사용법 링크 |
|----------|---------------|
| Anthropic | [사용법](#skill-create) |
