# 코드 기여하기

## PR 제출 전 체크리스트

LiteLLM에 제출하는 모든 PR의 핵심 요구사항은 다음과 같습니다.

- [ ] [기여자 라이선스 계약 (CLA)](#contributor-license-agreement-cla)에 서명합니다.
- [ ] 범위를 가능한 한 분리해서 유지합니다. 변경사항은 한 번에 **하나의 특정 문제**만 다루어야 합니다.

### Proxy (Backend) PR 체크리스트

- [ ] 테스트를 추가합니다. **최소 1개 테스트는 필수 요구사항**입니다. ([자세히 보기](#2-adding-tests))
- [ ] PR이 다음 항목을 통과하는지 확인합니다.
  - [ ] [단위 테스트](#3-running-unit-tests) — `make test-unit`
  - [ ] [포매팅 / 린팅 테스트](#4-running-linting-tests) — `make lint`

### UI PR 체크리스트

- [ ] UI가 성공적으로 빌드되는지 확인합니다. — `npm run build`
- [ ] 모든 UI 단위 테스트가 통과하는지 확인합니다. — `npm run test`
- [ ] **새 컴포넌트** 또는 **새 로직**을 추가하는 경우, 그에 맞는 테스트를 추가합니다.

## 기여자 라이선스 계약 (CLA) {#contributor-license-agreement-cla}

LiteLLM에 코드를 기여하기 전에 [Contributor License Agreement (CLA)](https://cla-assistant.io/BerriAI/litellm)에 서명해야 합니다. 모든 기여가 메인 저장소에 병합되기 위한 법적 요구사항입니다. CLA는 기여가 이루어지는 조건을 명확히 정의하여 기여자와 프로젝트를 모두 보호하는 데 도움이 됩니다.

**중요:** 리뷰 과정이 지연되지 않도록 기여 작업을 시작하기 **전에** CLA에 서명하는 것을 강력히 권장합니다. CLA는 [여기](https://cla-assistant.io/BerriAI/litellm)에서 확인하고 서명할 수 있습니다.

---

## Proxy (Backend)

### 1. 로컬 개발 환경 설정

1단계: 저장소 복제

```shell
git clone https://github.com/BerriAI/litellm.git
```

2단계: 개발 의존성 설치

```shell
uv sync --group dev --extra proxy
```

### 2. 테스트 추가 {#2-adding-tests}

- 테스트는 [`tests/test_litellm/` 디렉터리](https://github.com/BerriAI/litellm/tree/main/tests/litellm)에 추가합니다.
- 이 디렉터리는 `litellm/` 디렉터리와 1:1로 대응되며, **모킹된 테스트만** 포함해야 합니다.
- 이 디렉터리에 실제 LLM API 호출을 **추가하지 마세요**.

#### `tests/test_litellm/`의 파일 이름 규칙

테스트 디렉터리는 `litellm/`과 동일한 구조를 따릅니다.

- `test_{filename}.py`는 `litellm/{filename}.py`에 대응됩니다.
- `litellm/proxy/test_caching_routes.py`는 `litellm/proxy/caching_routes.py`에 대응됩니다.

### 3. 단위 테스트 실행 {#3-running-unit-tests}

`litellm` 디렉터리의 루트에서 다음 명령어를 실행합니다.

```shell
make test-unit
```

### 4. 린팅 테스트 실행 {#4-running-linting-tests}

`litellm` 디렉터리의 루트에서 다음 명령어를 실행합니다.

```shell
make lint
```

LiteLLM은 타입 검사를 위해 `mypy`를 사용합니다. CI/CD에서는 포매팅을 위해 `black`도 실행합니다.

### 5. PR 제출

- 변경사항을 GitHub의 포크에 푸시합니다.
- 포크에서 Pull Request를 엽니다.

---

## UI

### 1. 로컬 개발 환경 설정

1단계: 저장소 복제

```shell
git clone https://github.com/BerriAI/litellm.git
```

2단계: UI 대시보드 디렉터리로 이동

```shell
cd ui/litellm-dashboard
```

3단계: 의존성 설치

```shell
npm install
```

4단계: 개발 서버 시작

```shell
npm run dev
```

### 2. 테스트 추가

**새 컴포넌트** 또는 **새 로직**을 추가하는 경우, 그에 맞는 테스트를 추가해야 합니다.

### 3. UI 단위 테스트 실행

```shell
npm run test
```

### 4. UI 빌드

PR을 제출하기 전에 UI가 성공적으로 빌드되는지 확인합니다.

```shell
npm run build
```

### 5. PR 제출

- 변경사항을 GitHub의 포크에 푸시합니다.
- 포크에서 Pull Request를 엽니다.

---

## 고급

### LiteLLM Docker 이미지 빌드

LiteLLM Docker 이미지를 직접 빌드하고 실행하려면 다음 안내를 따르세요.

1단계: 저장소 복제

```shell
git clone https://github.com/BerriAI/litellm.git
```

2단계: Docker 이미지 빌드

`Dockerfile.non_root`를 사용해 빌드합니다.

```shell
docker build -f docker/Dockerfile.non_root -t litellm_test_image .
```

3단계: Docker 이미지 실행

루트 디렉터리에 `config.yaml`이 있는지 확인합니다. 이 파일은 LiteLLM 프록시 설정 파일입니다.

```shell
docker run \
    -v $(pwd)/proxy_config.yaml:/app/config.yaml \
    -e DATABASE_URL="postgresql://xxxxxxxx" \
    -e LITELLM_MASTER_KEY="sk-1234" \
    -p 4000:4000 \
    litellm_test_image \
    --config /app/config.yaml --detailed_debug
```

### LiteLLM Proxy를 로컬에서 실행

1. `proxy/` 디렉터리로 이동합니다.

```shell
cd litellm/litellm/proxy
```

2. 프록시를 실행합니다.

```shell
python3 proxy_cli.py --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```
