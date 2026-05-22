import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Open WebUI

이 가이드는 Open WebUI를 LiteLLM에 연결하는 방법을 안내합니다. LiteLLM을 Open WebUI와 함께 사용하면 팀은 다음을 수행할 수 있습니다.
- Open WebUI에서 100개 이상의 LLM에 접근
- spend/사용량 추적 및 budget limit 설정
- Request/Response 로그를 langfuse, s3, gcs buckets 같은 logging destination으로 전송
- 접근 제어 설정. 예: Open WebUI가 접근할 수 있는 model 제어

## 빠른 시작

- [LiteLLM 시작하기 Guide](https://docs.litellm.ai/docs/proxy/docker_quick_start)에 따라 LiteLLM을 먼저 설정하세요.


## 1. LiteLLM 및 Open WebUI 시작

- Open WebUI는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.
- LiteLLM은 [http://localhost:4000](http://localhost:4000)에서 실행됩니다.


## 2. LiteLLM에서 Virtual Key 생성

Virtual Key는 LiteLLM Proxy에 인증할 수 있게 해 주는 API key입니다. 여기서는 Open WebUI가 LiteLLM에 접근할 수 있도록 Virtual Key를 생성합니다.

### 2.1 LiteLLM User Management 계층

LiteLLM에서는 Organizations, Teams, Users, Virtual Keys를 만들 수 있습니다. 이 튜토리얼에서는 Team과 Virtual Key를 생성합니다.

- `Organization` - Team의 그룹입니다. 예: US Engineering, EU Developer Tools
- `Team` - User의 그룹입니다. 예: Open WebUI Team, Data Science Team 등
- `User` - 개별 사용자입니다. 예: 직원, 개발자, `krrish@litellm.ai`
- `Virtual Key` - LiteLLM Proxy에 인증할 수 있게 해 주는 API key입니다. Virtual Key는 User 또는 Team에 연결됩니다.

Team이 생성되면 User를 Team에 초대할 수 있습니다. LiteLLM User Management에 대한 자세한 내용은 [여기](https://docs.litellm.ai/docs/proxy/user_management_heirarchy)에서 확인할 수 있습니다.

### 2.2 LiteLLM에서 Team 생성

[http://localhost:4000/ui](http://localhost:4000/ui)로 이동해 새 team을 생성합니다.

<Image img={require('../../img/litellm_create_team.gif')} />

### 2.3 LiteLLM에서 Virtual Key 생성

[http://localhost:4000/ui](http://localhost:4000/ui)로 이동해 새 virtual key를 생성합니다.

LiteLLM에서는 key가 접근할 수 있는 model을 지정해 Open WebUI에서 사용할 수 있는 model을 제한할 수 있습니다.

<Image img={require('../../img/create_key_in_team_oweb.gif')} />

## 3. Open WebUI를 LiteLLM에 연결

Open WebUI에서 Settings -> Connections로 이동해 LiteLLM에 대한 새 connection을 생성합니다.

다음 정보를 입력합니다.
- URL: `http://localhost:4000`(LiteLLM proxy 기본 URL)
- Key: `your-virtual-key`(이전 단계에서 생성한 key)

<Image img={require('../../img/litellm_setup_openweb.gif')} />

### 3.1 요청 테스트

왼쪽 상단에서 model을 선택합니다. 2단계에서 key에 접근 권한을 부여한 model만 보여야 합니다.

model을 선택한 뒤 메시지 내용을 입력하고 `Submit`을 클릭합니다.

<Image img={require('../../img/basic_litellm.gif')} />

### 3.2 사용량 및 Spend 추적

#### 기본 추적

요청을 보낸 뒤 LiteLLM UI의 `로그` 섹션으로 이동하면 Model, 사용량, Cost 정보를 확인할 수 있습니다.

#### 사용자별 추적 {#per-user-tracking}

Open WebUI 사용자별 spend와 usage를 추적하려면 Open WebUI와 LiteLLM을 모두 설정합니다.

1. **Open WebUI에서 User Info Headers 활성화**
   
  Open WebUI가 request header에 사용자 정보를 포함하도록 다음 environment variable을 설정합니다.
  ```dotenv
  ENABLE_FORWARD_USER_INFO_HEADERS=True
  ```

  자세한 내용은 [Environment Variable 설정 Guide](https://docs.openwebui.com/getting-started/env-configuration/#enable_forward_user_info_headers)를 참고하세요.

2. **LiteLLM이 User Header를 파싱하도록 설정**
   
  사용자 추적용 request header mapping을 지정하려면 LiteLLM `config.yaml`에 다음을 추가합니다.

  ```yaml
  general_settings:
    user_header_mappings:
      - header_name: X-OpenWebUI-User-Id
        litellm_user_role: internal_user
      - header_name: X-OpenWebUI-User-Email
        litellm_user_role: customer
  ```

  ⓘ 사용 가능한 추적 옵션

  `user_header_mappings`의 `header_name`에는 다음 header를 사용할 수 있습니다.
  - `X-OpenWebUI-User-Id`
  - `X-OpenWebUI-User-Email`
  - `X-OpenWebUI-User-Name`
  
  잘 아는 소규모 사용자 그룹을 호스팅하는 경우, 이 값들은 가독성과 사용자 귀속 판단을 더 쉽게 해 줄 수 있습니다.

  필요에 따라 선택하되, Open WebUI에서는 다음 사항에 유의하세요.
  - 사용자는 자신의 username을 수정할 수 있습니다.
  - 관리자는 모든 account의 username과 email을 모두 수정할 수 있습니다.

이 비디오는 Open WebUI header를 LiteLLM user role에 매핑하는 방법을 설명합니다.

<iframe src="https://www.loom.com/embed/a1b6a4635fc0478ba4fd34cae16e2ffd?sid=791c2dcc-7e65-45be-bf7f-27d2601c123e" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen width="840" height="500"></iframe>

<br/>
<br/>


## Open WebUI에서 `thinking` content 렌더링 {#render-thinking-content-on-open-webui}

Open WebUI는 reasoning/thinking content를 `<think></think>` tag로 렌더링해야 합니다. 특정 model에서 이를 렌더링하려면 `merge_reasoning_content_in_choices` LiteLLM 파라미터를 사용할 수 있습니다.

예제 litellm config.yaml:

```yaml
model_list:
  - model_name: thinking-anthropic-claude-3-7-sonnet # Bedrock Anthropic
    litellm_params:
      model: bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0
      thinking: {"type": "enabled", "budget_tokens": 1024}
      max_tokens: 1080
      merge_reasoning_content_in_choices: true
  - model_name: vertex_ai/gemini-2.5-pro # Vertex AI Gemini
    litellm_params:
      model: vertex_ai/gemini-2.5-pro
      thinking: {"type": "enabled", "budget_tokens": 1024}
      merge_reasoning_content_in_choices: true
```

### Open WebUI에서 테스트

model dropdown에서 `thinking-anthropic-claude-3-7-sonnet`을 선택합니다.

<Image img={require('../../img/litellm_thinking_openweb.gif')} />

## 추가 리소스

- Windows Localhost에서 LiteLLM 및 Open WebUI 실행: 종합 가이드 [https://www.tanyongsheng.com/note/running-litellm-and-openwebui-on-windows-localhost-a-comprehensive-guide/](https://www.tanyongsheng.com/note/running-litellm-and-openwebui-on-windows-localhost-a-comprehensive-guide/)
- [User-Agent Header 기반으로 Guardrail 실행](../proxy/guardrails/quick_start#-tag-based-guardrail-modes)


## 비용 추적에 Custom Header 추가

spend와 usage를 추적하려면 request에 custom header를 추가할 수 있습니다.

```yaml
litellm_settings:
  extra_spend_tag_headers:
    - "x-custom-header"
```

spend와 usage를 추적하려면 request에 custom header를 추가할 수 있습니다.

<Image img={require('../../img/custom_tag_headers.png')} />
