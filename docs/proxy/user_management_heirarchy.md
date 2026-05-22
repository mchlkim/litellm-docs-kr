import Image from '@theme/IdealImage';


# 사용자 관리 계층

<Image img={require('../../img/litellm_user_heirarchy.png')} style={{ width: '100%', maxWidth: '4000px' }} />

LiteLLM은 사용자, 팀, 조직, 예산의 계층 구조를 지원합니다.

- 조직은 여러 팀을 가질 수 있습니다. [API Reference](https://litellm-api.up.railway.app/#/organization%20management)
- 팀은 여러 사용자를 가질 수 있습니다. [API Reference](https://litellm-api.up.railway.app/#/team%20management)
- 사용자는 여러 키를 가질 수 있으며 여러 팀에 속할 수 있습니다. [API Reference](https://litellm-api.up.railway.app/#/budget%20management)
- 키는 팀 또는 사용자에 속할 수 있습니다. [API Reference](https://litellm-api.up.railway.app/#/end-user%20management)


:::info

역할과 권한에 대한 자세한 내용은 [Access Control](./access_control)을 참고하세요.
:::
