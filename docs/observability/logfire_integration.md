import Image from '@theme/IdealImage';

# Logfire

Logfire는 LLM 앱을 위한 오픈 소스 관측성 및 분석 도구입니다.
품질, 비용, 지연 시간에 대한 세분화된 보기와 상세한 프로덕션 트레이스를 제공합니다.

<Image img={require('../../img/logfire.png')} />

:::info
콜백을 더 좋게 만들 방법을 함께 찾고 싶습니다. LiteLLM [창업자와 미팅](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)하거나
[Discord](https://discord.gg/wuPM9dRgDw)에 참여해 주세요.
:::

## 사전 요구 사항

이 통합을 사용하려면 다음 패키지가 설치되어 있어야 합니다.

```shell
uv add litellm

uv add opentelemetry-api==1.25.0
uv add opentelemetry-sdk==1.25.0
uv add opentelemetry-exporter-otlp==1.25.0
```

## 빠른 시작

[Logfire](https://logfire.pydantic.dev/)에서 Logfire 토큰을 발급받습니다.

```python
litellm.callbacks = ["logfire"]
```

```python
# uv add logfire
import litellm
import os

# from https://logfire.pydantic.dev/
os.environ["LOGFIRE_TOKEN"] = ""

# Optionally customize the base url
# from https://logfire.pydantic.dev/
os.environ["LOGFIRE_BASE_URL"] = ""

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set logfire as a callback, litellm will send the data to logfire
litellm.success_callback = ["logfire"]

# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

## 지원 및 창업자와 이야기하기

- [데모 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
