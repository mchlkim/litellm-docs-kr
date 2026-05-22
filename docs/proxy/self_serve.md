import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 내부 사용자 Self-Serve {#internal-user-self-serve}

## 사용자가 [Proxy UI](./ui.md)에서 직접 키를 생성하도록 허용

1. proxy에서 팀 권한이 있는 사용자를 추가합니다.

<Tabs>
<TabItem value="ui" label="UI">

`Internal Users` -> `+New User`로 이동합니다.

<Image img={require('../../img/add_internal_user.png')}  style={{ width: '800px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

LiteLLM에서 새 Internal User를 생성하고 `internal_user` role을 할당합니다.

```bash
curl -X POST '<PROXY_BASE_URL>/user/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "user_email": "krrishdholakia@gmail.com",
    "user_role": "internal_user" # 👈 THIS ALLOWS USER TO CREATE/VIEW/DELETE THEIR OWN KEYS + SEE THEIR SPEND
}'
```

예상 응답

```bash
{
    "user_id": "e9d45c7c-b20b-4ff8-ae76-3f479a7b1d7d", 👈 USE IN STEP 2
    "user_email": "<YOUR_USERS_EMAIL>",
    "user_role": "internal_user",
    ...
}
```

LiteLLM Internal User에 사용할 수 있는 UI role은 다음과 같습니다.

Admin용 Role:
  - `proxy_admin`: platform admin입니다.
  - `proxy_admin_viewer`: 로그인, 모든 키 조회, 모든 spend 조회가 가능합니다. 키 생성/삭제, 새 사용자 추가는 **불가**합니다.

Internal User용 Role:
  - `internal_user`: 로그인, 본인 키 조회/생성/삭제, 본인 spend 조회가 가능합니다. 새 사용자 추가는 **불가**합니다.
  - `internal_user_viewer`: 로그인, 본인 키 조회, 본인 spend 조회가 가능합니다. 키 생성/삭제, 새 사용자 추가는 **불가**합니다.

</TabItem>
</Tabs>

2. 초대 링크를 사용자와 공유합니다.

<Tabs>
<TabItem value="ui" label="UI">

사용자에게 전달할 초대 링크를 복사합니다.

<Image img={require('../../img/invitation_link.png')}  style={{ width: '800px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X POST '<PROXY_BASE_URL>/invitation/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "user_id": "e9d45c7c-b20b..." # 👈 USER ID FROM STEP 1
}'
```

예상 응답

```bash
{
    "id": "a2f0918f-43b0-4770-a664-96ddd192966e",
    "user_id": "e9d45c7c-b20b..",
    "is_accepted": false,
    "accepted_at": null,
    "expires_at": "2024-06-13T00:02:16.454000Z", # 👈 VALID FOR 7d
    "created_at": "2024-06-06T00:02:16.454000Z",
    "created_by": "116544810872468347480",
    "updated_at": "2024-06-06T00:02:16.454000Z",
    "updated_by": "116544810872468347480"
}
```

초대 링크:

```bash
http://0.0.0.0:4000/ui/onboarding?id=a2f0918f-43b0-4770-a664-96ddd192966e

# <YOUR_PROXY_BASE_URL>/ui/onboarding?id=<id>
```

</TabItem>
</Tabs>

:::info

[Email Notifications](./email.md)를 사용해 사용자에게 onboarding 링크를 email로 보낼 수 있습니다.

:::

3. 사용자가 email + password auth로 로그인합니다.

<Image img={require('../../img/ui_clean_login.png')}  style={{ width: '500px', height: 'auto' }} />



:::info 

LiteLLM Enterprise: [SSO login](./ui.md)을 활성화합니다.

:::

4. 이제 사용자가 본인 키를 생성할 수 있습니다.


<Image img={require('../../img/ui_self_serve_create_key.png')}  style={{ width: '800px', height: 'auto' }} />

## 사용자가 Usage 및 Caching Analytics를 조회하도록 허용 {#allowing-users-to-view-usage-caching-analytics}

1. Internal Users -> +Invite User로 이동합니다.

role을 `Admin Viewer`로 설정합니다. 이 role은 Usage와 Caching Analytics만 조회할 수 있습니다.

<Image img={require('../../img/ui_invite_user.png')}  style={{ width: '800px', height: 'auto' }} />
<br />

2. 초대 링크를 사용자와 공유합니다.


<Image img={require('../../img/ui_invite_link.png')}  style={{ width: '800px', height: 'auto' }} />
<br />

3. 사용자가 email + password auth로 로그인합니다.

<Image img={require('../../img/ui_clean_login.png')}  style={{ width: '500px', height: 'auto' }} />
<br />

4. 이제 사용자가 Usage와 Caching Analytics를 조회할 수 있습니다.

<Image img={require('../../img/ui_usage.png')}  style={{ width: '800px', height: 'auto' }} />


## 사용 가능한 Roles {#available-roles}
LiteLLM Internal User에 사용할 수 있는 UI role은 다음과 같습니다.

**Admin용 Role:**
  - `proxy_admin`: platform admin입니다.
  - `proxy_admin_viewer`: 로그인, 모든 키 조회, 모든 spend 조회가 가능합니다. 키 생성/삭제, 새 사용자 추가는 **불가**합니다.

**Internal User용 Role:**
  - `internal_user`: 로그인, 본인 키 조회/생성/삭제, 본인 spend 조회가 가능합니다. 새 사용자 추가는 **불가**합니다.
  - `internal_user_viewer`: 로그인, 본인 키 조회, 본인 spend 조회가 가능합니다. 키 생성/삭제, 새 사용자 추가는 **불가**합니다.

**Team용 Role:**
  - `admin`: 팀에 새 member 추가, Team Permissions 제어, team-only model 추가가 가능합니다(팀의 finetuned model onboarding에 유용).
  - `user`: 로그인, 본인 키 조회, 본인 spend 조회가 가능합니다. 키 생성/삭제(Team Permissions로 제어 가능), 새 사용자 추가는 **불가**합니다.


## SSO 사용자를 팀에 자동 추가 {#auto-adding-sso-users-to-teams}

이 섹션은 **Okta, Google SSO**용 SSO auto-add 설정 과정을 설명합니다.

### Okta, Google SSO

1. 사용자가 속한 팀 id를 담고 있는 JWT field를 지정합니다.

```yaml
general_settings:
  master_key: sk-1234
  litellm_jwtauth:
    team_ids_jwt_field: "groups" # 👈 CAN BE ANY FIELD
```

다음과 같은 SSO token을 가정합니다. **LiteLLM이 SSO provider에서 받은 JWT field를 확인해야 한다면 [여기](#debugging-sso-jwt-fields)의 안내를 따르세요.**

```
{
  ...,
  "groups": ["team_id_1", "team_id_2"]
}
```

2. LiteLLM에서 팀을 생성합니다.

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "team_id": "team_id_1" # 👈 MUST BE THE SAME AS THE SSO GROUP ID
}'
```

3. SSO flow를 테스트합니다.

[동작 방식 walkthrough](https://www.loom.com/share/8959be458edf41fd85937452c29a33f3?sid=7ebd6d37-569a-4023-866e-e0cde67cb23e)를 참고하세요.

### Microsoft Entra ID SSO group assignment 설정 {#microsoft-entra-id-sso-group-assignment}

[Microsoft Entra ID로 SSO 사용자를 팀에 자동 추가하는 tutorial](https://docs.litellm.ai/docs/tutorials/msft_sso)을 따르세요.

### SSO JWT field 디버깅 {#debugging-sso-jwt-fields}

[**여기로 이동**](./admin_ui_sso.md#debugging-sso-jwt-fields)


## 고급 설정
### Custom logout URL 설정 {#custom-logout-url}

사용자가 logout을 클릭했을 때 특정 URL로 redirect되게 하려면 `.env`에 `PROXY_LOGOUT_URL`을 설정합니다.

```
export PROXY_LOGOUT_URL="https://www.google.com"
```

<Image img={require('../../img/ui_logout.png')}  style={{ width: '400px', height: 'auto' }} />


### Internal user 기본 max budget 설정 {#setting-default-max-budget-for-internal-users}

internal user가 sign up할 때 사용자별 budget을 자동 적용합니다. 기본적으로 user reset을 위해 table을 10분마다 확인합니다. 이를 변경하려면 [이 문서](./users.md#reset-budgets)를 참고하세요.

```yaml
litellm_settings:
  max_internal_user_budget: 10
  internal_user_budget_duration: "1mo" # reset every month
```

이 설정은 internal user가 sign up할 때 $10 USD max budget을 설정합니다.

이 설정은 UI에서도 시각적으로 관리할 수 있습니다.

<Image img={require('../../img/default_user_settings_admin_ui.png')}  style={{ width: '700px', height: 'auto' }} />

이 budget은 해당 사용자가 만든 personal key에만 적용됩니다. UI에서는 `Default Team` 아래에서 확인할 수 있습니다.

<Image img={require('../../img/max_budget_for_internal_users.png')}  style={{ width: '500px', height: 'auto' }} />

이 budget은 non-default team 아래에서 생성된 key에는 적용되지 않습니다.


### Team max budget 설정 {#setting-team-max-budget}

[**여기로 이동**](./team_budgets.md)

### Default Team {#default-team}

<Tabs>
<TabItem value="ui" label="UI">

`Internal Users` -> `Default User Settings`로 이동하고 방금 생성한 팀을 default team으로 설정합니다.

default model도 `no-default-models`로 설정합니다. 이렇게 하면 사용자는 팀 안에서만 key를 생성할 수 있습니다.

<Image img={require('../../img/default_user_settings_with_default_team.png')}  style={{ width: '1000px', height: 'auto' }} />

</TabItem>
<TabItem value="yaml" label="YAML">

:::info
default team으로 설정하기 전에 팀이 먼저 생성되어 있어야 합니다.
:::

```yaml
litellm_settings:
  default_internal_user_params:    # Default Params used when a new user signs in Via SSO
      user_role: "internal_user"     # one of "internal_user", "internal_user_viewer", 
      models: ["no-default-models"] # Optional[List[str]], optional): models to be used by the user
      teams: # Optional[List[NewUserRequestTeam]], optional): teams to be used by the user
        - team_id: "team_id_1" # Required[str]: team_id to be used by the user
          user_role: "user" # Optional[str], optional): Default role in the team. Values: "user" or "admin". Defaults to "user"
```

</TabItem>
</Tabs>

### Team Member Budget {#team-member-budgets}

team member의 max budget을 설정합니다.

새 팀을 생성할 때 또는 기존 팀을 업데이트할 때 설정할 수 있습니다.

<Tabs>
<TabItem value="ui" label="UI">

<Image img={require('../../img/create_default_team.png')}  style={{ width: '600px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "budget_duration": "10d",
    "team_member_budget": 10
}'
```

</TabItem>
</Tabs>

### Team Member Rate Limit 설정 {#team-member-rate-limits}

개별 team member의 기본 TPM/RPM limit을 설정합니다.

새 팀을 생성할 때 또는 기존 팀을 업데이트할 때 설정할 수 있습니다.


<Tabs>
<TabItem value="ui" label="UI">

<Image img={require('../../img/create_team_member_rate_limits.png')}  style={{ width: '600px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "team_member_rpm_limit": 100,
    "team_member_tpm_limit": 1000
}'
```

</TabItem>
</Tabs>



### 새 팀의 default params 설정 {#setting-default-params-for-new-teams}

LiteLLM을 SSO provider에 연결하면 LiteLLM이 팀을 자동 생성할 수 있습니다. 이 설정은 자동 생성된 팀의 기본 `models`, `max_budget`, `budget_duration`을 지정합니다.

**동작 방식**

1. LiteLLM이 SSO provider에서 `groups`를 가져오면, 해당 group_id가 LiteLLM의 `team_id`로 존재하는지 확인합니다.
2. team_id가 없으면 LiteLLM은 설정한 default params로 팀을 자동 생성합니다.
3. team_id가 이미 있으면 LiteLLM은 해당 팀에 어떤 설정도 적용하지 않습니다.

**사용법**

```yaml showLineNumbers title="Default Params for new teams"
litellm_settings:
  default_team_params:             # Applied to all /team/new calls (including SSO auto-created teams) when the field is not explicitly set
    max_budget: 100                # Optional[float]: $100 budget for the team
    budget_duration: 30d           # Optional[str]: 30 days budget_duration for the team
    models: ["gpt-3.5-turbo"]      # Optional[List[str]]: models for the team (only applied to SSO auto-created teams)
    tpm_limit: 100000              # Optional[int]: tokens per minute limit
    rpm_limit: 1000                # Optional[int]: requests per minute limit
    team_member_permissions:       # Optional[List[str]]: permissions granted to non-admin team members
      - "/team/daily/activity"     # Allow members to view team usage
      - "/key/generate"            # Allow members to generate API keys
```


### User의 personal key 생성 제한

사용자가 특정 팀 아래에서만 key를 생성하도록 제한하고 싶을 때 유용합니다.

이 설정은 사용자가 test keys chat pane에서 session token을 사용하는 것도 방지합니다.

👉 [**이 문서 참고**](./virtual_keys.md#restricting-key-generation)

## **Self Serve / SSO Flow 전체 설정** {#all-settings-for-self-serve-sso-flow}

```yaml showLineNumbers title="All Settings for Self Serve / SSO Flow"
litellm_settings:
  max_internal_user_budget: 10        # max budget for internal users
  internal_user_budget_duration: "1mo" # reset every month

  default_internal_user_params:    # Default Params used when a new user signs in Via SSO
    user_role: "internal_user"     # one of "internal_user", "internal_user_viewer", "proxy_admin", "proxy_admin_viewer". New SSO users not in litellm will be created as this user
    max_budget: 100                # Optional[float], optional): $100 budget for a new SSO sign in user
    budget_duration: 30d           # Optional[str], optional): 30 days budget_duration for a new SSO sign in user
    models: ["gpt-3.5-turbo"]      # Optional[List[str]], optional): models to be used by a new SSO sign in user
    teams: # Optional[List[NewUserRequestTeam]], optional): teams to be used by the user
      - team_id: "team_id_1" # Required[str]: team_id to be used by the user
        max_budget_in_team: 100 # Optional[float], optional): $100 budget for the team. Defaults to None.
        user_role: "user" # Optional[str], optional): "user" or "admin". Defaults to "user"
  
  default_team_params:             # Applied to all /team/new calls (including SSO auto-created teams) when the field is not explicitly set
    max_budget: 100                # Optional[float]: $100 budget for the team
    budget_duration: 30d           # Optional[str]: 30 days budget_duration for the team
    models: ["gpt-3.5-turbo"]      # Optional[List[str]]: models for the team (only applied to SSO auto-created teams)
    tpm_limit: 100000              # Optional[int]: tokens per minute limit
    rpm_limit: 1000                # Optional[int]: requests per minute limit
    team_member_permissions:       # Optional[List[str]]: permissions granted to non-admin team members
      - "/team/daily/activity"


  upperbound_key_generate_params:    # Upperbound for /key/generate requests when self-serve flow is on
    max_budget: 100 # Optional[float], optional): upperbound of $100, for all /key/generate requests
    budget_duration: "10d" # Optional[str], optional): upperbound of 10 days for budget_duration values
    duration: "30d" # Optional[str], optional): upperbound of 30 days for all /key/generate requests
    max_parallel_requests: 1000 # (Optional[int], optional): Max number of requests that can be made in parallel. Defaults to None.
    tpm_limit: 1000 #(Optional[int], optional): Tpm limit. Defaults to None.
    rpm_limit: 1000 #(Optional[int], optional): Rpm limit. Defaults to None.

  key_generation_settings: # Restricts who can generate keys. [Further docs](./virtual_keys.md#restricting-key-generation)
    team_key_generation:
      allowed_team_member_roles: ["admin"]
    personal_key_generation: # maps to 'Default Team' on UI 
      allowed_user_roles: ["proxy_admin"]
```

## 추가 읽기 {#further-reading}

- [AI Exploration용 사용자 온보딩](../tutorials/default_team_self_serve)
