---
title: 라우팅, 관측성, 보안
sidebar_label: 라우팅 / 관측성 / 보안
---

# 라우팅, 관측성, 보안

운영 환경에서 LiteLLM을 쓰는 핵심 이유는 호출을 중앙에서 제어할 수 있다는 점입니다. 단순 호출을 넘어 안정성, 비용, 보안 정책을 Gateway 계층에서 관리할 수 있습니다.

## 라우팅과 부하 분산

여러 `deployment`를 하나의 모델 그룹으로 묶으면 LiteLLM Router가 요청을 분산할 수 있습니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o-east
      api_base: os.environ/AZURE_EAST_API_BASE
      api_key: os.environ/AZURE_EAST_API_KEY
      api_version: "2024-02-01"

  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o-west
      api_base: os.environ/AZURE_WEST_API_BASE
      api_key: os.environ/AZURE_WEST_API_KEY
      api_version: "2024-02-01"
```

같은 `model_name`을 여러 개 등록하면 하나의 논리 모델 뒤에 여러 배포 대상을 둘 수 있습니다.

## 폴백

특정 모델 호출이 실패할 때 다른 모델로 넘길 수 있습니다.

```yaml
router_settings:
  fallbacks:
    - gpt-4o: ["claude-sonnet"]
```

폴백은 장애 대응에 유용하지만, 모델별 출력 품질과 비용이 달라질 수 있으므로 서비스별로 허용 범위를 정해야 합니다.

## 타임아웃과 재시도

운영 서비스에서는 무제한 대기보다 명확한 타임아웃이 안전합니다.

```yaml
litellm_settings:
  request_timeout: 60
  num_retries: 2
```

긴 추론 요청, 스트리밍, 파일 처리처럼 오래 걸리는 요청은 별도 모델 그룹이나 별도 타임아웃 정책으로 분리하는 편이 좋습니다.

## 비용 추적

Proxy를 사용하면 키, 사용자, 팀, 태그 기준으로 비용과 사용량을 추적할 수 있습니다.

주요 기준:

- `virtual key`
- `user`
- `team`
- `model`
- `custom metadata`
- `request tag`

운영 팁:

- 서비스마다 별도 가상 키를 발급합니다.
- 팀/서비스 단위 예산을 설정합니다.
- 요청에 메타데이터 또는 태그를 붙여 비용 분석 단위를 명확히 합니다.
- 월 단위 예산 리셋 시각과 시간대를 확인합니다.

자세한 내용은 [비용 추적](/docs/proxy/cost_tracking)을 참고합니다.

## 관측성 연동

LiteLLM은 다양한 로깅, 추적, 관측성 도구와 연동할 수 있습니다.

대표 예:

- Langfuse
- MLflow
- Helicone
- Datadog
- OpenTelemetry
- Prometheus
- Slack 알림

SDK에서는 콜백으로 붙이고, Proxy에서는 설정 기반으로 중앙 설정하는 방식이 일반적입니다.

## 가드레일

가드레일은 모델 호출 전후에 안전 정책을 적용하는 계층입니다.

적용할 수 있는 정책 예:

- PII 마스킹
- 시크릿 감지
- 프롬프트 인젝션 감지
- 콘텐츠 모더레이션
- 사용자 지정 정책 검사
- 팀 기반 가드레일

운영에서는 다음 순서로 접근하는 것이 안전합니다.

1. 어떤 요청에 어떤 정책이 필요한지 분류합니다.
2. 차단할 정책과 로깅만 할 정책을 나눕니다.
3. 팀/키/모델별 적용 범위를 정합니다.
4. 오탐과 지연 시간을 모니터링합니다.

## 보안 기본값

- 마스터 키와 프로바이더 API 키는 코드나 Git에 저장하지 않습니다.
- 운영 Proxy는 TLS 뒤에 둡니다.
- 관리자 UI는 내부망, SSO, RBAC 등으로 접근을 제한합니다.
- 가상 키는 서비스별로 분리하고 만료와 예산을 설정합니다.
- 로그에 민감 데이터가 남지 않도록 마스킹 정책을 검토합니다.
- MCP, 도구, 에이전트 게이트웨이 기능은 권한 범위를 명확히 정한 뒤 공개합니다.
