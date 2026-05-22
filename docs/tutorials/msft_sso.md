import Image from '@theme/IdealImage';

# Microsoft SSO: LiteLLM과 그룹/멤버 동기화

Microsoft SSO 그룹과 멤버를 LiteLLM Teams와 동기화합니다.

<Image img={require('../../img/litellm_entra_id.png')}  style={{ width: '800px', height: 'auto' }} />

<br />
<br />


## 사전 준비

- 관리자 권한이 있는 Azure Entra ID 계정
- Azure Portal에 설정된 LiteLLM 엔터프라이즈 App
- Microsoft Entra ID(Azure AD) 접근 권한


## 이 튜토리얼 개요

1. Entra ID 그룹을 LiteLLM Teams에 자동 생성
2. Entra ID 팀 멤버십 동기화
3. LiteLLM에서 자동 생성되는 새 팀과 사용자에 기본 파라미터 설정

## 1. Entra ID 그룹을 LiteLLM Teams에 자동 생성

이 단계의 목표는 Azure Entra ID의 LiteLLM 엔터프라이즈 App에 새 그룹이 추가될 때 LiteLLM이 LiteLLM DB에 새 팀을 자동 생성하도록 하는 것입니다.

### 1.1 Entra ID에서 새 그룹 생성


[Azure Portal](https://portal.azure.com/) > Groups > New Group으로 이동해 새 그룹을 생성합니다.

<Image img={require('../../img/entra_create_team.png')}  style={{ width: '800px', height: 'auto' }} />

### 1.2 그룹을 LiteLLM 엔터프라이즈 App에 할당

Azure Portal에서 `엔터프라이즈 Applications`로 이동한 뒤 LiteLLM 앱을 선택합니다.

<Image img={require('../../img/msft_enterprise_app.png')}  style={{ width: '800px', height: 'auto' }} />

<br />
<br />

LiteLLM 앱을 선택한 뒤 `Users and Groups` > `Add user/group`을 클릭합니다.

<Image img={require('../../img/msft_enterprise_assign_group.png')}  style={{ width: '800px', height: 'auto' }} />

<br />

이제 1.1단계에서 만든 그룹을 선택해 LiteLLM 엔터프라이즈 App에 추가합니다. 이 시점에서 `Production LLM Evals Group`이 LiteLLM 엔터프라이즈 App에 추가됩니다. 다음 단계에서는 새 사용자가 로그인할 때 LiteLLM이 LiteLLM DB에 `Production LLM Evals Group`을 자동 생성하도록 합니다.

<Image img={require('../../img/msft_enterprise_select_group.png')}  style={{ width: '800px', height: 'auto' }} />


### 1.3 SSO로 LiteLLM UI에 로그인

SSO로 LiteLLM UI에 로그인합니다. Entra ID SSO 페이지로 리디렉션되어야 합니다. 이 SSO 로그인 흐름은 LiteLLM이 Azure Entra ID에서 최신 Groups와 Members를 가져오도록 트리거합니다.

<Image img={require('../../img/msft_sso_sign_in.png')}  style={{ width: '800px', height: 'auto' }} />

### 1.4 LiteLLM UI에서 새 팀 확인

LiteLLM UI에서 `Teams`로 이동합니다. LiteLLM에 자동 생성된 새 팀 `Production LLM Evals Group`을 확인할 수 있어야 합니다.

<Image img={require('../../img/msft_auto_team.png')}  style={{ width: '900px', height: 'auto' }} />

#### 동작 방식

SSO 사용자가 LiteLLM에 로그인하면:
- LiteLLM은 LiteLLM 엔터프라이즈 App 아래의 Groups를 자동으로 가져옵니다.
- LiteLLM 엔터프라이즈 App에 할당된 Production LLM Evals Group을 찾습니다.
- LiteLLM은 이 그룹 ID가 LiteLLM Teams Table에 있는지 확인합니다.
- ID가 없으면 LiteLLM은 다음 정보로 새 팀을 자동 생성합니다.
  - 이름: `Production LLM Evals Group`
  - ID: Entra ID 그룹 ID와 동일

## 2. Entra ID 팀 멤버십 동기화

이 단계에서는 Entra ID의 `Production LLM Evals` Group에 새 사용자가 추가될 때 LiteLLM이 LiteLLM DB의 `Production LLM Evals` Team에 해당 사용자를 자동 추가하도록 합니다.

### 2.1 Entra ID의 `Production LLM Evals` Group으로 이동

Entra ID에서 `Production LLM Evals` Group으로 이동합니다.

<Image img={require('../../img/msft_member_1.png')}  style={{ width: '800px', height: 'auto' }} />


### 2.2 Entra ID 그룹에 멤버 추가

Select `Members` > `Add members`

이 단계에서는 `Production LLM Evals` Team에 추가하려는 사용자를 추가합니다.

<Image img={require('../../img/msft_member_2.png')}  style={{ width: '800px', height: 'auto' }} />



### 2.3 LiteLLM UI에 새 사용자로 로그인

LiteLLM UI에 새 사용자로 로그인합니다. Entra ID SSO 페이지로 리디렉션되어야 합니다. 이 SSO 로그인 흐름은 LiteLLM이 Azure Entra ID에서 최신 Groups와 Members를 가져오도록 트리거합니다. 이 단계에서 LiteLLM은 Entra ID에서 확인되는 팀과 팀 멤버 정보를 동기화합니다.

<Image img={require('../../img/msft_sso_sign_in.png')}  style={{ width: '800px', height: 'auto' }} />



### 2.4 LiteLLM UI에서 팀 멤버십 확인

LiteLLM UI에서 `Teams`로 이동합니다. 새 팀 `Production LLM Evals Group`이 표시되어야 합니다. 이제 Entra ID에서 `Production LLM Evals Group`의 멤버이므로 LiteLLM UI에서도 새 팀 `Production LLM Evals Group`을 확인할 수 있어야 합니다.

<Image img={require('../../img/msft_member_3.png')}  style={{ width: '900px', height: 'auto' }} />

## 3. LiteLLM에서 자동 생성되는 새 팀에 기본 파라미터 설정

Azure Entra ID의 LiteLLM 엔터프라이즈 App에 새 그룹이 추가되면 LiteLLM이 LiteLLM DB에 새 팀을 자동 생성하므로, 생성되는 새 팀에 기본 파라미터를 설정할 수 있습니다.

이를 통해 새로 생성되는 팀에 기본 예산, 모델 등을 설정할 수 있습니다.

### 3.1 LiteLLM에 `default_team_params` 설정

LiteLLM config 파일로 이동해 다음 파라미터를 설정합니다.

```yaml showLineNumbers title="litellm config with default_team_params"
litellm_settings:
  default_team_params:             # Applied to all /team/new calls (including SSO auto-created teams) when the field is not explicitly set
    max_budget: 100                # Optional[float]: $100 budget for the team
    budget_duration: 30d           # Optional[str]: 30 days budget_duration for the team
    models: ["gpt-3.5-turbo"]      # Optional[List[str]]: models for the team (only applied to SSO auto-created teams)
    team_member_permissions:       # Optional[List[str]]: permissions granted to non-admin team members
      - "/team/daily/activity"     # Allow members to view team usage
```

### 3.2 LiteLLM에 새 팀 자동 생성

- 이 단계에서는 1.1단계와 동일하게 Azure Entra ID의 LiteLLM 엔터프라이즈 App에 새 그룹을 추가합니다. 이 그룹을 Azure Entra ID에서 `Default LiteLLM Prod Team`이라고 부르겠습니다.
- config로 LiteLLM proxy server를 시작합니다.
- SSO로 LiteLLM UI에 로그인합니다.
- `Teams`로 이동하면 LiteLLM에 자동 생성된 새 팀 `Default LiteLLM Prod Team`을 확인할 수 있어야 합니다.
- LiteLLM은 이 새 팀에 기본 파라미터를 설정합니다.

<Image img={require('../../img/msft_default_settings.png')}  style={{ width: '900px', height: 'auto' }} />


## 4. 사용자 권한에 Entra ID App Roles 사용

App Roles를 사용하면 Entra ID에서 사용자 역할을 직접 할당할 수 있습니다. LiteLLM은 SSO 로그인 중 JWT 토큰에서 app role을 자동으로 읽고, 해당 역할을 사용자에게 할당합니다.

### 4.1 지원 역할

LiteLLM은 다음 app role을 지원합니다(대소문자 구분 없음).

- `proxy_admin` - 전체 LiteLLM 플랫폼 관리자
- `proxy_admin_viewer` - 읽기 전용 관리자 접근 권한(모든 키와 지출 조회 가능)
- `org_admin` - 특정 조직 관리자(해당 조직 내 팀과 사용자 생성 가능)
- `internal_user` - 표준 사용자(자신의 키 생성/조회/삭제 및 지출 조회 가능)

### 4.2 Entra ID에서 App Roles 생성

1. https://portal.azure.com/ 에서 App Registration으로 이동합니다.
2. **App roles** > **Create app role**로 이동합니다.

3. app role을 구성합니다.
   - **Display name**: Proxy Admin(또는 원하는 표시 이름)
   - **Value**: `proxy_admin`(위의 지원 역할 값 중 하나 사용)
   - **Description**: LiteLLM proxy 관리자 접근 권한
   - **허용되는 member 유형**: Users/Groups


4. **Apply**를 클릭해 역할을 저장합니다.

### 4.3 사용자에게 App Roles 할당

1. https://portal.azure.com/ 에서 **엔터프라이즈 Applications**로 이동합니다.
2. LiteLLM 애플리케이션을 선택합니다.
3. **Users and groups** > **Add user/group**으로 이동합니다.
4. 사용자를 선택하고 앞에서 만든 app role 중 하나를 할당합니다.


### 4.4 역할 할당 테스트

1. app role이 할당된 사용자로 SSO를 통해 LiteLLM UI에 로그인합니다.
2. LiteLLM은 JWT 토큰에서 app role을 자동 추출합니다.
3. 데이터베이스에서 사용자에게 대응되는 LiteLLM 역할이 할당됩니다.
4. 사용자의 권한은 할당된 역할을 반영합니다.

**동작 방식:**
- 사용자가 Microsoft SSO로 로그인하면 LiteLLM은 JWT `id_token`에서 `roles` claim을 추출합니다.
- 역할 중 하나가 유효한 LiteLLM 역할과 일치하면(대소문자 구분 없음) 해당 역할이 사용자에게 할당됩니다.
- 여러 역할이 있으면 LiteLLM은 처음 발견한 유효한 역할을 사용합니다.
- 이 역할 할당은 LiteLLM 데이터베이스에 유지되며 사용자의 접근 수준을 결정합니다.

## 동영상 walkthrough

**Microsoft Entra ID**의 SSO 자동 추가 설정 과정을 안내합니다.

Microsoft Entra ID에서 이 설정을 구성하는 과정을 보려면 아래 동영상을 따라 진행하세요.

<iframe width="840" height="500" src="https://www.loom.com/embed/ea711323aa9a496d84a01fd7b2a12f54?sid=c53e238c-5bfd-4135-b8fb-b5b1a08632cf" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>











