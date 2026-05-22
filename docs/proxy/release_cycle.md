# 릴리스 주기 {#release-cycle}

Litellm Proxy는 다음 릴리스 주기를 따릅니다.

- `v1.x.x-nightly`: CI/CD를 통과한 릴리스입니다.
- `v1.x.x.rc`: CI/CD와 [수동 리뷰](https://github.com/BerriAI/litellm/discussions/8495#discussioncomment-12180711)를 통과한 릴리스입니다.
- `v1.x.x:main-stable`: CI/CD, 수동 리뷰, 3일간의 프로덕션 테스트를 통과한 릴리스입니다.

프로덕션에서는 최신 `v1.x.x:main-stable` 릴리스 사용을 권장합니다.


릴리스 노트는 [여기](https://github.com/BerriAI/litellm/releases)에서 확인할 수 있습니다.


## FAQ

### LiteLLM stable 릴리스 일정이 있나요? {#is-there-a-release-schedule-for-litellm-stable-release}

Stable 릴리스는 매주 배포됩니다(보통 일요일).

### `minor` bump와 `patch` bump는 어떻게 구분하나요? {#what-is-considered-a-minor-bump-vs-patch-bump}

- `patch` bump: 기존 기능에 영향을 주지 않고 사용자에게 보이는 기능도 추가하지 않는 매우 작은 변경입니다. 예: 데이터베이스 테이블의 `created_at` 컬럼 추가.
- `minor` bump: 하위 호환되는 새 기능이나 새 데이터베이스 테이블을 추가하는 변경입니다.
- `major` bump: 하위 호환성을 깨는 변경입니다.

### 엔터프라이즈 지원 {#enterprise-support}


- Stable 릴리스는 매주 배포됩니다. 새 릴리스가 제공되면 이전 릴리스는 더 이상 지원하지 않습니다.
- MAJOR 변경이 있는 경우(semvar 규칙 기준, 예: `1.x.x` -> `2.x.x`) 이전 stable 이미지에 대해 최대 90일까지 지원을 제공할 수 있습니다.
