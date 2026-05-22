import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AI 탐색용 사용자 온보딩

v1.73.0에서는 새 사용자를 Default Team에 할당하는 기능이 추가되었습니다. 사용자가 로그인해 AI 탐색용 $10 키를 만들 수 있으므로, 회사 내부에서 LLM 실험을 훨씬 쉽게 활성화할 수 있습니다.


### 1. 팀 생성

다음 설정으로 `internal exploration` 팀을 생성합니다.
- `models`: 특정 모델에 대한 접근 권한(예: `gpt-4o`, `claude-3-5-sonnet`)
- `max budget`: 전체 팀 지출이 특정 금액을 넘지 않도록 보장하는 팀 최대 예산
- `reset budget`: 월별로 설정합니다. LiteLLM은 매월 초 예산을 재설정합니다.
- `team member max budget`: 개별 팀원의 지출이 특정 금액을 넘지 않도록 보장하는 팀원별 최대 예산

<Image img={require('../../img/create_default_team.png')}  style={{ width: '600px', height: 'auto' }} />

### 2. 팀원 권한 업데이트

방금 만든 팀을 클릭하고 `Member Permissions` 아래에서 팀원 권한을 업데이트합니다.

이 설정을 통해 모든 팀원이 키를 만들 수 있습니다.

<Image img={require('../../img/team_member_permissions.png')}  style={{ width: '600px', height: 'auto' }} />


### 3. 팀을 기본 팀으로 설정

`Internal Users` -> `Default User Settings`로 이동해 기본 팀을 방금 만든 팀으로 설정합니다.

기본 모델도 `no-default-models`로 설정합니다. 이렇게 하면 사용자는 팀 안에서만 키를 만들 수 있습니다.

<Image img={require('../../img/default_user_settings_with_default_team.png')}  style={{ width: '1000px', height: 'auto' }} />

### 4. 테스트

새 사용자를 만들고 동작을 테스트합니다.

#### a. 새 사용자 생성

이메일 `test_default_team_user@xyz.com`으로 새 사용자를 만듭니다.

<Image img={require('../../img/create_user.png')}  style={{ width: '600px', height: 'auto' }} />

`Create User`를 클릭하면 초대 링크가 생성됩니다. 이후 단계에서 사용할 수 있도록 보관합니다.

#### b. 사용자가 팀에 추가되었는지 확인

생성된 사용자를 클릭하고 해당 사용자가 팀에 추가되었는지 확인합니다.

사용자가 팀에 추가되었고 기본 모델은 없는 상태임을 확인할 수 있습니다.

<Image img={require('../../img/user_info_with_default_team.png')}  style={{ width: '1000px', height: 'auto' }} />

#### c. 사용자로 로그인

이제 4a에서 받은 초대 링크를 사용해 해당 사용자로 로그인합니다.

<Image img={require('../../img/new_user_login.png')}  style={{ width: '600px', height: 'auto' }} />

#### d. 팀을 지정하지 않으면 키를 만들 수 없는지 확인

팀을 선택해야 한다는 메시지가 표시되어야 합니다.

<Image img={require('../../img/create_key_no_team.png')}  style={{ width: '1000px', height: 'auto' }} />

#### e. 팀을 지정하면 키를 만들 수 있는지 확인

<Image img={require('../../img/create_key_with_default_team.png')}  style={{ width: '1000px', height: 'auto' }} />

성공입니다.

이제 생성된 키가 표시되어야 합니다.

<Image img={require('../../img/create_key_with_default_team_success.png')}  style={{ width: '600px', height: 'auto' }} />
