# Claude Code - 세분화된 비용 추적 {#claude-code---granular-cost-tracking}

LiteLLM 프록시를 사용해 고객 또는 태그별로 Claude Code 사용량을 추적합니다. 이를 통해 청구, 예산 관리, 분석에 필요한 세분화된 비용 귀속을 수행할 수 있습니다.

## 작동 방식 {#how-it-works}

Claude Code는 `ANTHROPIC_CUSTOM_HEADERS`를 통해 사용자 지정 헤더를 지원합니다. LiteLLM은 비용 귀속을 위해 특정 헤더가 포함된 요청을 자동으로 추적합니다.

## 추적 옵션 {#tracking-options}

비용을 어떤 기준으로 귀속할지 선택합니다.

| 추적 기준 | 헤더 | 사용 사례 |
|----------|--------|----------|
| 고객 | `x-litellm-customer-id` | 고객 청구, 사용자별 예산 |
| 태그 | `x-litellm-tags` | 프로젝트 추적, 비용 센터, 환경 |

## 환경 변수 {#environment-variables}

| 변수 | 설명 | 예제 |
|----------|-------------|---------|
| `ANTHROPIC_BASE_URL` | LiteLLM 프록시 URL | `http://localhost:4000` |
| `ANTHROPIC_API_KEY` | LiteLLM API 키 | `sk-1234` |
| `ANTHROPIC_CUSTOM_HEADERS` | 사용자 지정 헤더(`header-name: value` 형식) | 아래 예제 참고 |

## 옵션 1: 고객별 추적 {#option-1-track-by-customer}

특정 고객 또는 최종 사용자에게 비용을 귀속할 때 사용합니다.

```bash
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_API_KEY=sk-1234
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-customer-id: claude-ishaan-local"
```

## 옵션 2: 태그별 추적 {#option-2-track-by-tags}

프로젝트, 비용 센터 또는 환경에 비용을 귀속할 때 사용합니다. 쉼표로 구분된 태그를 전달합니다.

```bash
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_API_KEY=sk-1234
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-tags: project:acme,env:prod,team:backend"
```


## 빠른 시작

### 1. 환경 변수 설정 {#1-set-environment-variables}

```bash
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_API_KEY=sk-1234
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-customer-id: claude-ishaan-local"
```

### 2. Claude Code 사용 {#2-use-claude-code}

```bash
claude
```

이제 모든 요청이 고객 ID `claude-ishaan-local` 아래에서 추적됩니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-16/8f45872e-2d00-4d01-bf3d-4d6ae11d1396/ascreenshot_d2a745b8da4f4a56aaf2cac02871ef53_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-16/dd41eae3-2592-4bc9-a8d2-d6d02614cd2d/ascreenshot_43ec9ee48ad946cca49732f007e786fc_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-16/0c30309e-7117-4999-a3df-d22a2d5629c1/ascreenshot_d76a48c53b9a4fad8f6727baf4aa6a9c_text_export.jpeg)

### 3. LiteLLM UI에서 사용량 보기 {#3-view-usage-in-litellm-ui}

LiteLLM UI에서 **로그** 탭으로 이동합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-16/ff774392-69f5-483e-83e2-fb749c94ee90/ascreenshot_d264fc04c9ee47edb047f61b6eb8c4d7_text_export.jpeg)

세부 정보를 보려면 요청을 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-16/5f71589b-5fdd-4759-9b6e-e6874be0eb21/ascreenshot_92dd86dadccb4764b1169c29c10dfe65_text_export.jpeg)

고객 ID로 필터링하면 해당 고객의 모든 요청을 볼 수 있습니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-16/dd1c8aba-e75b-4714-9eee-c785e9db99af/ascreenshot_36aaec0fe12f4189b64f704a551e6729_text_export.jpeg)

## 지원되는 헤더 {#supported-headers}

| 헤더 | 설명 |
|--------|-------------|
| `x-litellm-customer-id` | 고객/최종 사용자 ID별 추적 |
| `x-litellm-end-user-id` | 대체 고객 ID 헤더 |
| `x-litellm-tags` | 비용 귀속에 사용할 쉼표 구분 태그 |

## 관련 문서 {#related}

- [Claude Code 빠른 시작](./claude_responses_api.md)
- [고객 예산](../proxy/customers.md)
- [태그 예산](../proxy/tag_budgets.md)
- [코딩 도구 사용량 추적](./cost_tracking_coding.md)
