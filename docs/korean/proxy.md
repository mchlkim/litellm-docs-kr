---
title: Proxy / AI Gateway 운영
sidebar_label: Proxy / AI Gateway
---

# Proxy / AI Gateway 운영

LiteLLM Proxy는 조직 내부의 LLM 호출을 한 곳에서 제어하는 OpenAI 호환 Gateway입니다. 애플리케이션은 OpenAI 클라이언트를 계속 사용하되 `base_url`만 LiteLLM Proxy로 바꿀 수 있습니다.

## Proxy를 쓰는 이유

- 여러 프로바이더와 모델을 하나의 Gateway 뒤에 숨깁니다.
- 팀/사용자/서비스별 가상 키를 발급합니다.
- 키별 예산, rate limit, 허용 모델을 제어합니다.
- 비용과 사용량을 중앙에서 추적합니다.
- fallback, load balancing, retry, timeout을 Gateway에서 관리합니다.
- guardrail, logging, caching, 관리자 UI를 한 곳에서 운영합니다.

## 빠른 실행

CLI로 간단히 실행할 수 있습니다.

```bash
uv tool install 'litellm[proxy]'
litellm --model gpt-4o
```

기본 포트는 `4000`입니다.

```text
http://localhost:4000
```

## OpenAI 클라이언트로 호출

```python
from openai import OpenAI

client = OpenAI(
    api_key="anything",
    base_url="http://localhost:4000/v1",
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].message.content)
```

운영 환경에서는 `api_key`에 LiteLLM 가상 키를 넣습니다.

## config.yaml 기본 구조

Proxy 운영에서는 `config.yaml`에 노출할 모델 목록을 정의합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
```

애플리케이션은 `model_name`으로 요청하고, 실제 프로바이더 모델은 `litellm_params.model`에서 매핑됩니다.

## Docker 실행 예시

```bash
docker run \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -e OPENAI_API_KEY=your-key \
  -p 4000:4000 \
  docker.litellm.ai/berriai/litellm:main-latest \
  --config /app/config.yaml
```

실제 운영에서는 Postgres, Redis, master key, 관리자 계정, 로그 저장소, secret manager를 함께 검토합니다.

## 가상 키

가상 키는 LiteLLM Proxy에서 발급하는 호출용 키입니다. 서비스별로 다른 키를 발급하면 다음을 제어할 수 있습니다.

- 사용할 수 있는 모델
- 키별 예산
- 팀/사용자 소유권
- rate limit
- 만료 시간
- 태그와 metadata

자세한 설정은 [가상 키](/litellm-docs-kr/docs/proxy/virtual_keys)를 참고합니다.

## 관리자 UI

관리자 UI에서는 모델, 키, 팀, 사용자, 비용, 로그를 확인하고 일부 설정을 관리할 수 있습니다.

- 모델 등록과 credential 관리
- 키 생성과 예산 설정
- 사용량 및 비용 확인
- 로그 조회
- 팀과 프로젝트 관리

자세한 내용은 [관리자 UI](/litellm-docs-kr/docs/proxy/ui)를 참고합니다.

## 운영 체크리스트

- `LITELLM_MASTER_KEY`를 반드시 설정합니다.
- DB가 필요한 기능을 쓰는 경우 `DATABASE_URL`을 설정합니다.
- 비용 추적, 관리자 UI, 키 관리가 필요하면 Postgres 연결을 먼저 안정화합니다.
- 모델 API 키는 config 파일에 직접 쓰지 말고 환경 변수나 secret manager를 사용합니다.
- 공개 인터넷에 노출할 때는 인증, TLS, 네트워크 접근 제어를 반드시 적용합니다.
- 장애 대응을 위해 health endpoint와 로그 수집을 구성합니다.
