# 기여하기 - UI

LiteLLM UI에 기여해 주셔서 감사합니다. 이 가이드는 로컬 개발 환경을 설정하는 데 필요한 절차를 안내합니다.


## 1. 저장소 클론

```bash
git clone https://github.com/BerriAI/litellm.git
cd litellm
```

## 2. Proxy 시작

설정 파일을 만듭니다. 예: `config.yaml`

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o

general_settings:
  master_key: sk-1234
  database_url: postgresql://<user>:<password>@<host>:<port>/<dbname>
  store_model_in_db: true
```

4000번 포트에서 프록시를 시작합니다.

```bash
uv run litellm --config config.yaml --port 4000
```

UI는 저장소에 미리 빌드된 상태로 포함되어 있습니다. `http://localhost:4000/ui`에서 접근합니다.

## 3. UI 개발

UI 개발에는 두 가지 옵션이 있습니다.

### 옵션 A: 개발 모드(Hot Reload)

이 방식은 UI를 3000번 포트에서 hot reload로 실행합니다. 프록시는 4000번 포트에서 실행됩니다.

```bash
cd ui/litellm-dashboard
npm install
npm run dev
```

**로그인 흐름:**
1. `http://localhost:3000`으로 이동합니다.
2. 로그인을 위해 `http://localhost:4000/ui`로 리디렉션됩니다.
3. 로그인 후 `http://localhost:3000/`으로 직접 다시 이동합니다.
4. 이제 인증된 상태에서 hot reload로 개발할 수 있습니다.

:::note
리디렉션 루프나 인증 문제가 발생하면 localhost 브라우저 쿠키를 지우거나 Build Mode를 대신 사용하세요.
:::

### 옵션 B: Build Mode

이 방식은 UI를 빌드한 뒤 프록시로 복사합니다. 변경 사항을 반영하려면 다시 빌드해야 합니다.

1. `ui/litellm-dashboard/src/`에서 코드를 변경합니다.

2. UI를 빌드합니다.
```bash
cd ui/litellm-dashboard
npm install
npm run build
```

빌드 후 출력물을 프록시로 복사합니다.

```bash
cp -r out/* ../../litellm/proxy/_experimental/out/
```

그런 다음 프록시를 재시작하고 `http://localhost:4000/ui`에서 UI에 접근합니다.

## 4. PR 제출 전 체크리스트

Pull Request를 제출하기 전에 `ui/litellm-dashboard/`에서 다음 항목이 로컬로 통과하는지 확인하세요.

**변경 사항과 관련된 테스트 실행:**

```bash
npx vitest run src/components/path/to/YourComponent.test.tsx
```

테스트는 컴포넌트와 같은 위치에 있습니다. 예: `TeamInfo.tsx` -> `TeamInfo.test.tsx`. 새 컴포넌트를 추가했다면 옆에 대응되는 `.test.tsx` 파일도 추가하세요.

**빌드 실행:**

```bash
npm run build
```

이 항목들은 `ui_tests` 및 `ui_build` CI 체크와 대응됩니다.

## 5. PR 제출

1. 변경 사항을 위한 새 브랜치를 만듭니다.
```bash
git checkout -b feat/your-feature-name
```

2. 변경 사항을 스테이징하고 커밋합니다.
```bash
git add .
git commit -m "feat: description of your changes"
```

3. 본인의 fork로 푸시합니다.
```bash
git push origin feat/your-feature-name
```

4. [PR template](https://github.com/BerriAI/litellm/blob/main/.github/pull_request_template.md)에 따라 GitHub에서 Pull Request를 만듭니다.
