# MAX_CALLBACKS 제한 {#max_callbacks-limit}

## 오류 메시지 {#error-message}

```
Cannot add callback - would exceed MAX_CALLBACKS limit of 30. Current callbacks: 30
```

## 의미 {#what-this-means}

LiteLLM은 성능 저하를 방지하기 위해 등록할 수 있는 callback 수를 제한합니다. 각 callback은 모든 LLM request에서 실행되므로 callback이 너무 많으면 CPU 사용량이 급증하고 proxy가 느려질 수 있습니다.

기본 제한은 **callback 30개**입니다.

## 이 제한에 도달할 수 있는 경우 {#when-you-might-hit-this-limit}

- 팀이 많고 각 팀마다 자체 guardrail이 있는 **대규모 enterprise deployment**
- custom callback과 함께 여러 **logging integration**을 조합한 경우
- 조직 전체에서 누적되는 **팀별 callback configuration**

## 재정의 방법 {#how-to-override}

제한을 늘리려면 `LITELLM_MAX_CALLBACKS` environment variable을 설정하세요.

```bash
# Docker
docker run -e LITELLM_MAX_CALLBACKS=100 ...

# Docker Compose
environment:
  - LITELLM_MAX_CALLBACKS=100

# Kubernetes
env:
  - name: LITELLM_MAX_CALLBACKS
    value: "100"

# Direct
export LITELLM_MAX_CALLBACKS=100
litellm --config config.yaml
```

## 권장 사항 {#recommendations}

1. **보수적으로 시작하세요** - 필요한 만큼만 늘리세요. guardrail이 있는 팀이 60개라면 여유를 두기 위해 `LITELLM_MAX_CALLBACKS=75`부터 시도하세요.

2. **성능을 모니터링하세요** - callback이 많아질수록 request당 처리량이 늘어납니다. 제한을 높인 뒤 CPU 사용량과 response latency를 확인하세요.

3. **가능하면 통합하세요** - 여러 팀이 동일한 guardrail을 사용한다면 팀별 중복 configuration 대신 공유 callback configuration 사용을 고려하세요.

## 예제: 대규모 엔터프라이즈 설정 {#example-large-enterprise-setup}

각 팀에 guardrail callback이 있는 60개 이상 팀 규모의 조직 예시입니다.

```yaml
# config.yaml
litellm_settings:
  callbacks: ["prometheus", "langfuse"]  # 2 global callbacks

# Each team adds 1 guardrail callback = 60+ callbacks
# Total: 62+ callbacks needed
```

environment variable을 설정하세요.

```bash
export LITELLM_MAX_CALLBACKS=100
```
