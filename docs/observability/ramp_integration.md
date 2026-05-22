import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Ramp

자동 지출 추적을 위해 AI 사용량 및 비용 데이터를 Ramp로 전송합니다.

[Ramp](https://ramp.com/)는 기업이 비용, 법인 카드, 공급업체 결제를 관리하도록 돕는 재무 자동화 플랫폼입니다. Ramp callback 통합을 사용하면 token 수, model 비용, 요청 metadata를 포함한 LiteLLM AI 사용량이 Ramp로 자동 전송되어 실시간 지출 가시성을 제공합니다.

:::info
callback을 더 개선할 방법을 알고 싶습니다. LiteLLM [창업자](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)를 만나거나
저희 [discord](https://discord.gg/wuPM9dRgDw)에 참여해 주세요.
:::

## 사전 준비 사항 {#pre-requisites}

1. [Ramp](https://app.ramp.com/)에 로그인하고 검색 창에서 **"LiteLLM"**을 검색합니다. **LiteLLM** 통합 결과를 클릭합니다.

> **참고:** business owner와 admin만 통합에 접근하고 구성할 수 있습니다.

2. LiteLLM 통합 페이지의 오른쪽 위에서 **Connect** 버튼을 클릭합니다.

3. Connect LiteLLM drawer에서 **Generate API Key**를 클릭해 API key를 생성합니다.

> **중요:** API key는 다시 표시되지 않으므로 즉시 복사하세요. 분실한 경우 통합 설정에서 기존 key를 취소하고 새 key를 생성할 수 있습니다.

```shell
pip install litellm
```

## 빠른 시작

`RAMP_API_KEY`를 설정하고 callbacks에 `"ramp"`를 추가하면 LLM 사용량을 Ramp에 기록하기 시작합니다.

<Tabs>
<TabItem value="python" label="SDK">

```python
litellm.callbacks = ["ramp"]
```

```python
import litellm
import os

# Ramp API Key
os.environ["RAMP_API_KEY"] = "your-ramp-api-key"

# LLM API Keys
os.environ['OPENAI_API_KEY'] = ""

# Set ramp as a callback
litellm.callbacks = ["ramp"]

# OpenAI call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi - I'm testing Ramp integration"}
  ]
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["ramp"]

environment_variables:
  RAMP_API_KEY: os.environ/RAMP_API_KEY
```

2. LiteLLM Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how are you?"
    }
  ]
}'
```

</TabItem>
</Tabs>

## 어떤 데이터가 기록되나요? {#what-data-is-logged}

LiteLLM은 LLM API 호출이 성공하면 [Standard Logging Payload](https://docs.litellm.ai/docs/proxy/logging_spec)를 Ramp로 전송하며, 여기에는 다음이 포함됩니다.

- **요청 세부 정보**: Model, messages, parameters
- **응답 세부 정보**: Completion text, token usage, latency
- **Metadata**: 사용자 ID, 사용자 지정 metadata, 타임스탬프
- **비용 추적**: token 사용량 기준 응답 비용

## 인증

Ramp API key로 `RAMP_API_KEY` environment variable을 설정합니다.

| Environment Variable | 설명 |
|---|---|
| `RAMP_API_KEY` | Ramp API key(필수) |

## 지원 및 창업자와 상담하기 {#support--talk-to-founders}

- [데모 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 전화번호 📞 +1 (770) 8783-106 / ‭+1 (412) 618-6238‬
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
