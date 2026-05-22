---
title: 운영과 문제 해결
sidebar_label: 운영 / 문제 해결
---

# 운영과 문제 해결

LiteLLM은 단순 SDK로도 사용할 수 있지만, Proxy를 운영 환경에 배포하면 Gateway 자체가 중요한 운영 컴포넌트가 됩니다. 배포 전후로 확인할 항목을 정리합니다.

## 배포 전 확인

- 어떤 프로바이더와 모델을 노출할지 정합니다.
- 외부에 노출할 `model_name`과 내부 실제 모델 이름을 구분합니다.
- provider API key를 환경 변수 또는 secret manager로 주입합니다.
- `LITELLM_MASTER_KEY`를 설정합니다.
- virtual key, 예산, rate limit 정책을 정합니다.
- Postgres가 필요한 기능을 쓸지 결정합니다.
- 로그와 비용 추적 저장 위치를 정합니다.
- health check endpoint를 로드밸런서나 오케스트레이션에 연결합니다.

## 운영 중 확인할 지표

- 요청 수, 성공률, 오류율
- 모델별 지연 시간
- provider별 rate limit 발생 수
- fallback 발생 수
- token 사용량과 비용
- key/team/user별 예산 소진율
- DB 연결 오류
- Redis/cache 오류
- guardrail 차단률과 오탐률

## 자주 보는 오류

### 인증 오류

증상:

- 401 또는 authentication 관련 오류
- provider API key 오류
- virtual key가 거부됨

확인:

- provider API key 환경 변수가 실제 프로세스에 들어갔는지 확인합니다.
- Proxy 호출 시 `Authorization: Bearer <key>` 형식인지 확인합니다.
- virtual key가 만료되었거나 예산을 초과하지 않았는지 확인합니다.
- Azure는 `api_base`, `api_version`, deployment 이름이 맞는지 확인합니다.

### 모델을 찾을 수 없음

증상:

- model not found
- `deployment not found`
- Proxy에서 등록되지 않은 모델이라고 응답

확인:

- SDK라면 `provider/model-name` prefix가 맞는지 확인합니다.
- Proxy라면 `config.yaml`의 `model_name`과 요청의 `model` 값이 일치하는지 확인합니다.
- Azure는 실제 모델명이 아니라 deployment 이름을 써야 합니다.
- config 변경 후 Proxy reload 또는 재시작이 필요한지 확인합니다.

### Rate limit

증상:

- 429 오류
- 특정 provider에서만 실패
- 짧은 시간에 요청이 몰릴 때 오류 증가

대응:

- retry 횟수와 backoff를 조정합니다.
- 같은 모델 그룹에 deployment를 추가합니다.
- load balancing과 fallback을 설정합니다.
- 서비스별 virtual key rate limit을 조정합니다.

### DB 연결 오류

증상:

- 관리자 UI, virtual key, spend tracking 관련 기능 실패
- DB migration 오류
- `Not connected to DB` 류의 메시지

확인:

- `DATABASE_URL`이 설정되어 있는지 확인합니다.
- Proxy 컨테이너에서 DB hostname과 port에 접근 가능한지 확인합니다.
- DB migration이 정상 적용되었는지 확인합니다.
- DB connection pool과 timeout을 운영 트래픽에 맞게 조정합니다.

### 비용이 예상과 다름

확인:

- 모델 가격 정보가 최신인지 확인합니다.
- 요청에 실제 사용한 모델과 fallback 모델을 구분합니다.
- streaming 요청의 usage 집계 방식을 확인합니다.
- custom pricing을 쓰는 경우 설정 단위와 currency를 확인합니다.
- team/key/user aggregation 기준을 확인합니다.

## 장애 대응 절차

1. Proxy health endpoint를 확인합니다.
2. 최근 배포, config 변경, provider 장애 여부를 확인합니다.
3. 실패가 특정 key, team, model, provider에 한정되는지 분리합니다.
4. Proxy 로그에서 provider 응답 코드와 LiteLLM 내부 오류를 확인합니다.
5. fallback이 동작했는지 확인합니다.
6. 필요하면 문제 모델을 임시 제거하거나 traffic을 다른 deployment로 우회합니다.

## 참고 문서

- [문제 해결](/litellm-docs-kr/docs/troubleshoot)
- [Proxy Health](/litellm-docs-kr/docs/proxy/health)
- [Proxy Debugging](/litellm-docs-kr/docs/proxy/debugging)
- [Cost Discrepancy](/litellm-docs-kr/docs/troubleshoot/cost_discrepancy)
- [Latency Overhead](/litellm-docs-kr/docs/troubleshoot/latency_overhead)
