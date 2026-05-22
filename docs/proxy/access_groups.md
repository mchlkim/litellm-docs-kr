import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Access Groups

Access Groups는 조직 전체에서 리소스 접근을 정의하고 관리하는 방식을 단순화합니다. 각 키나 팀마다 모델, MCP servers, agents를 따로 설정하는 대신, 허용할 리소스를 하나로 묶은 그룹을 만든 뒤 해당 그룹을 키나 팀에 연결합니다.

## 개요

**Access Groups**를 사용하면 허용된 리소스 집합(모델, MCP servers, agents)을 한곳에서 재사용 가능하게 정의할 수 있습니다. 하나의 그룹으로 세 가지 리소스 유형 모두에 대한 접근을 부여할 수 있습니다. 그룹을 키나 팀에 연결하기만 하면 해당 그룹에 정의된 모든 리소스에 접근할 수 있습니다.

- **통합 리소스 제어** – 하나의 그룹으로 모델, MCP servers, agents 접근을 함께 제어합니다.
- **재사용 가능** – 한 번 정의한 뒤 여러 키나 팀에 연결할 수 있습니다.
- **유지보수 용이** – 그룹을 업데이트하면(리소스 추가 또는 제거) 연결된 모든 키와 팀에 변경 사항이 자동으로 반영됩니다.
- **명확한 가시성** – 각 그룹이 어떤 리소스를 부여하는지, 어떤 키/팀이 사용하는지 정확히 확인할 수 있습니다.

<Image img={require('../../img/ui_access_groups.png')} />

### 작동 방식

**핵심 개념:** 그룹에 리소스 정의 → 그룹을 키 또는 팀에 연결 → 키/팀이 그룹의 모든 리소스에 접근

| 리소스 유형   | 그룹이 제어하는 항목                                              |
| --------------- | -------------------------------------------------------------------- |
| **모델**      | 키/팀이 사용할 수 있는 LLM models (예: `gpt-4`, `claude-3-opus`) |
| **MCP Servers** | Tool calling에 사용할 수 있는 MCP servers                     |
| **Agents**      | 호출할 수 있는 agents                                          |

## UI에서 Access Groups를 생성하고 사용하는 방법

### 1. Access Groups로 이동

관리자 UI(예: `http://localhost:4000/ui` 또는 사용하는 `PROXY_BASE_URL/ui`)로 이동한 뒤 사이드바에서 **Access Groups**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/d117fdb2-18c8-49e0-91e6-1f830d2d4b85/ascreenshot_f5822a0ddac64e3383124419d0c66298_text_export.jpeg)

### 2. Access Group 생성

**Create Access Group**을 클릭하고 그룹 이름을 입력합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/aefb900d-d106-4436-806c-3608ad19659f/ascreenshot_3f6fed1256604fe3b7038a0778ce3342_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/0951bb93-61bd-477e-beaf-f58810f8980b/ascreenshot_f0fb5d552fd74ff8a1080e82758fcdc2_text_export.jpeg)

### 3. 그룹에 리소스 정의

탭을 사용해 이 그룹이 접근을 부여할 models, MCP servers, agents를 선택합니다.

- **모델 tab** – LLM models를 선택합니다.
- **MCP Servers tab** – MCP servers를 선택합니다(tool calling용).
- **Agents tab** – agents를 선택합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/37398e8f-cd50-48c9-85e2-c77b2eeb994b/ascreenshot_440ec7906c8f4199b30ef91c903960b9_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/99d36543-8582-4bb7-a34d-3d5fe0fcf12f/ascreenshot_d9983240955c496892e1f7c38c074045_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/06fc5919-5c71-4fc3-999b-da7a4800af3f/ascreenshot_db93fdf742b249dc90a4b9d5991d6097_text_export.jpeg)

### 4. Access Group을 키에 연결

가상 키를 생성하거나 편집할 때 **Optional Settings**를 펼친 뒤 Access Group을 선택합니다. 해당 키는 그룹에 정의된 모든 models, MCP servers, agents 접근 권한을 상속합니다.

1. **가상 키**로 이동한 뒤 **+ Create New Key**를 클릭합니다.
2. **Optional Settings**를 펼칩니다.
3. Access Group 필드에서 생성한 그룹을 선택합니다.
4. 키를 저장합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/cdfa76ab-bf38-4ca4-a97d-2cb50fafe50b/ascreenshot_046daecb57554c28ba553cf6c01f5450_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/84f08e9c-e9d0-42aa-8317-f385190b6d7d/ascreenshot_2d239716d30f431d9ad494baf7933d6a_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/41d7b7f9-ac58-4602-b887-c35c9b419dce/ascreenshot_8abd4fef48014dd1b88848411e6d7912_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/e37b01c0-f2d7-4133-8b2f-ccc51f6769e1/ascreenshot_f495df428ad54cac9ec43b46c3dfc1b1_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/3fe33cad-6b64-46c3-a66e-6e6e073c3d7a/ascreenshot_f2dcc79ae8af47dd86ade2f85165d3c1_text_export.jpeg)

### 5. Access Group을 팀에 연결

팀을 생성하거나 편집할 때도 Access Group을 팀에 연결할 수 있습니다. 그러면 해당 팀에 연결된 모든 키가 그룹에 정의된 리소스에 접근할 수 있습니다.

## 사용 사례

### 팀 기반 접근

"Engineering", "Data Science", "Product"처럼 각 팀에 필요한 models, MCP servers, agents를 포함한 그룹을 만듭니다. 그룹을 팀에 연결하면 되므로 모든 키에 각 리소스를 따로 설정할 필요가 없습니다.

### 환경 분리

- **Production group** – Production models, 승인된 MCP servers, production agents
- **Development group** – 비용 효율적인 models, 실험용 MCP tools, dev agents

환경에 따라 적절한 그룹을 키나 팀에 연결합니다.

### 온보딩 단순화

새 개발자에게 models, MCP servers, agents를 수동으로 설정한 키를 주는 대신 Access Group이 연결된 키를 제공합니다. 알맞은 팀에 추가하거나 올바른 그룹이 연결된 키를 발급하면 됩니다.

### 중앙 집중식 업데이트

그룹에 새 model이나 MCP server를 추가하면 해당 그룹에 연결된 모든 키와 팀이 자동으로 접근 권한을 얻습니다. 그룹에서 리소스를 제거하면 모든 연결 대상에서 한 번에 권한이 회수됩니다.

## Access Group와 Model Access Groups 비교

LiteLLM에는 서로 관련된 두 가지 개념이 있습니다.

| 기능    | **Access Groups** (이 페이지)                                           | **Model Access Groups**                                 |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| 정의 | UI에서 정의합니다. 하나의 그룹에 models, MCP servers, agents를 포함할 수 있습니다. | Config 또는 API로 정의합니다. 그룹은 모델 중심입니다.  |
| 범위      | 모델 + MCP servers + agents                                           | 모델 only                                             |
| 연결 대상  | Keys, teams                                                             | Keys, teams                                             |
| 사용 시점   | UI에서 models, MCP, agents를 통합 제어하려는 경우       | Config 기반 또는 API 기반 model access control이 필요한 경우 |

`model_info`의 `access_groups`를 사용하는 config 기반 model access는 [Model Access Groups](./model_access_groups.md)를 참고하세요.

## 관련 문서

- [가상 키](./virtual_keys.md) – API keys 생성 및 관리
- [역할 기반 접근 제어](./access_control.md) – 조직, 팀, user roles
- [Model Access Groups](./model_access_groups.md) – Config 기반 model access groups
- [MCP Control](../mcp_control.md) – MCP server 설정 및 access control
