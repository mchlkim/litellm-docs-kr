import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Claude Code Plugin Marketplace(관리형 Skills)

LiteLLM AI Gateway는 Claude Code 플러그인의 중앙 레지스트리 역할을 합니다. 관리자는 조직 전체에서 사용할 수 있는 플러그인을 관리할 수 있고, 엔지니어는 승인된 플러그인을 단일 출처에서 찾아 설치할 수 있습니다.

## 사전 준비

- 데이터베이스에 연결된 LiteLLM Proxy 실행 환경
- LiteLLM UI 관리자 접근 권한
- GitHub, GitLab 또는 git으로 접근 가능한 URL에 호스팅된 플러그인

## 관리자 가이드: Marketplace 관리

### 1단계: Claude Code Plugins로 이동

LiteLLM 관리자 UI의 왼쪽 탐색 메뉴에서 **Claude Code Plugins**를 클릭합니다.

<Image img={require('../../img/claude_code_marketplace/step1_navigate_plugins.jpeg')} style={{ width: '800px', height: 'auto' }} />

### 2단계: 플러그인 목록 확인

등록된 모든 플러그인 목록이 표시됩니다. 여기에서 플러그인을 추가, 활성화, 비활성화하거나 삭제할 수 있습니다.

<Image img={require('../../img/claude_code_marketplace/step3_plugins_list.jpeg')} style={{ width: '800px', height: 'auto' }} />

### 3단계: 새 플러그인 추가

Marketplace에 플러그인을 등록하려면 **+ Add New Plugin**을 클릭합니다.

<Image img={require('../../img/claude_code_marketplace/step4_add_plugin.jpeg')} style={{ width: '800px', height: 'auto' }} />

### 4단계: 플러그인 세부 정보 입력

플러그인 정보를 입력합니다.

- **Name**: 플러그인 식별자(kebab-case, 예: `my-plugin`)
- **Source Type**: GitHub, Git URL 또는 Git Subdir 중에서 선택
- **Repository/URL**: git 소스(GitHub의 경우 예: `org/repo`)
- **Version**: 시맨틱 버전(선택 사항)
- **Description**: 플러그인이 수행하는 작업
- **Category**: 정리를 위한 플러그인 카테고리
- **Keywords**: 검색어

<Image img={require('../../img/claude_code_marketplace/step5_plugin_form.jpeg')} style={{ width: '800px', height: 'auto' }} />

### 5단계: 플러그인 제출

세부 정보를 입력한 후 **Add Plugin**을 클릭해 등록합니다.

<Image img={require('../../img/claude_code_marketplace/step9_submit.jpeg')} style={{ width: '800px', height: 'auto' }} />

### 6단계: 플러그인 활성화/비활성화

공개 Marketplace에 표시할 항목을 제어하려면 플러그인을 켜거나 끕니다. **활성화된** 플러그인만 엔지니어에게 표시됩니다.

<Image img={require('../../img/claude_code_marketplace/step11_enable_plugin.jpeg')} style={{ width: '800px', height: 'auto' }} />

## 엔지니어 가이드: 플러그인 설치

### 1단계: LiteLLM Marketplace 추가

회사 LiteLLM Marketplace를 Claude Code에 추가합니다.

```bash
claude plugin marketplace add http://your-litellm-proxy:4000/claude-code/marketplace.json
```

<Image img={require('../../img/claude_code_marketplace/step12_cli_marketplace.jpeg')} style={{ width: '800px', height: 'auto' }} />

### 2단계: 사용 가능한 플러그인 탐색

Marketplace에서 사용 가능한 모든 플러그인을 나열합니다.

```bash
claude plugin search @litellm
```

### 3단계: 플러그인 설치

Marketplace에서 원하는 플러그인을 설치합니다.

```bash
claude plugin install my-plugin@litellm
```

<Image img={require('../../img/claude_code_marketplace/step15_cli_paste.jpeg')} style={{ width: '800px', height: 'auto' }} />

### 4단계: 설치 확인

이제 플러그인이 설치되었으며 사용할 준비가 되었습니다.

<Image img={require('../../img/claude_code_marketplace/step16_cli_complete.jpeg')} style={{ width: '800px', height: 'auto' }} />

## API 참조

### 공개 엔드포인트(인증 불필요)

#### GET `/claude-code/marketplace.json`

Claude Code 검색에 사용할 Marketplace 카탈로그를 반환합니다.

```bash
curl http://localhost:4000/claude-code/marketplace.json
```

**응답:**
```json
{
  "name": "litellm",
  "owner": {
    "name": "LiteLLM",
    "email": "support@litellm.ai"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "github",
        "repo": "org/my-plugin"
      },
      "version": "1.0.0",
      "description": "My awesome plugin",
      "category": "productivity",
      "keywords": ["automation", "tools"]
    }
  ]
}
```

### 관리자 엔드포인트(인증 필요)

#### POST `/claude-code/plugins`

새 플러그인을 등록합니다.

```bash
curl -X POST http://localhost:4000/claude-code/plugins \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-plugin",
    "source": {"source": "github", "repo": "org/my-plugin"},
    "version": "1.0.0",
    "description": "My awesome plugin",
    "category": "productivity",
    "keywords": ["automation", "tools"]
  }'
```

#### GET `/claude-code/plugins`

등록된 모든 플러그인을 나열합니다.

```bash
curl http://localhost:4000/claude-code/plugins \
  -H "Authorization: Bearer sk-..."
```

#### POST `/claude-code/plugins/{name}/enable`

플러그인을 활성화합니다.

```bash
curl -X POST http://localhost:4000/claude-code/plugins/my-plugin/enable \
  -H "Authorization: Bearer sk-..."
```

#### POST `/claude-code/plugins/{name}/disable`

플러그인을 비활성화합니다.

```bash
curl -X POST http://localhost:4000/claude-code/plugins/my-plugin/disable \
  -H "Authorization: Bearer sk-..."
```

#### DELETE `/claude-code/plugins/{name}`

플러그인을 삭제합니다.

```bash
curl -X DELETE http://localhost:4000/claude-code/plugins/my-plugin \
  -H "Authorization: Bearer sk-..."
```

## 플러그인 소스 형식

<Tabs>
<TabItem value="github" label="GitHub">

```json
{
  "name": "my-plugin",
  "source": {
    "source": "github",
    "repo": "organization/repository"
  }
}
```

</TabItem>
<TabItem value="url" label="Git URL">

```json
{
  "name": "my-plugin",
  "source": {
    "source": "url",
    "url": "https://github.com/org/repo.git"
  }
}
```

GitLab, Bitbucket 또는 자체 호스팅 git 저장소에는 이 형식을 사용합니다.

</TabItem>
<TabItem value="git-subdir" label="Git Subdir">

```json
{
  "name": "my-plugin",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/org/repo.git",
    "path": "plugins/my-plugin"
  }
}
```

플러그인이 git 저장소의 하위 디렉터리에 있는 경우 이 형식을 사용합니다. `path` 필드는 슬래시로 구분된 세그먼트의 상대 경로여야 합니다(영숫자, 점, 하이픈, 밑줄만 허용).

</TabItem>
</Tabs>

## 예제: 내부 플러그인 Marketplace 설정

### 1. 내부 플러그인 생성

플러그인 저장소를 다음과 같이 구성합니다.

```
my-company-plugin/
├── plugin.json          # Plugin manifest
├── SKILL.md            # Main skill file
├── skills/             # Additional skills
│   └── helper.md
└── README.md
```

### 2. API로 플러그인 등록

```bash
# Register your internal tools plugin
curl -X POST http://localhost:4000/claude-code/plugins \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "internal-tools",
    "source": {"source": "github", "repo": "mycompany/internal-tools"},
    "version": "1.0.0",
    "description": "Internal development tools and utilities",
    "author": {"name": "Platform Team", "email": "platform@mycompany.com"},
    "category": "internal",
    "keywords": ["internal", "tools", "utilities"]
  }'
```

### 3. Claude Code에서 사용

엔지니어에게 Marketplace URL을 전달합니다.

```bash
# One-time setup for each engineer
claude plugin marketplace add http://litellm.internal.company.com/claude-code/marketplace.json

# Install company plugins
claude plugin install internal-tools@litellm
```

## 문제 해결

**Marketplace에 플러그인이 표시되지 않음:**
- 관리자 UI에서 플러그인이 **활성화**되어 있는지 확인합니다.
- 플러그인에 유효한 `source` 필드가 있는지 확인합니다.

**설치 실패:**
- 엔지니어의 머신에서 git 저장소에 접근할 수 있는지 확인합니다.
- 비공개 저장소의 경우 엔지니어에게 적절한 git 자격 증명이 구성되어 있어야 합니다.

**데이터베이스 오류:**
- LiteLLM proxy가 데이터베이스에 연결되어 있는지 확인합니다.
- 자세한 오류 메시지는 proxy 로그에서 확인합니다.
