import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sumo Logic

관측성, 모니터링, 분석을 위해 LiteLLM 로그를 Sumo Logic으로 전송합니다.

Sumo Logic은 애플리케이션과 인프라에 대한 실시간 인사이트를 제공하는 클라우드 네이티브 머신 데이터 분석 플랫폼입니다.
https://www.sumologic.com/

:::info
콜백을 더 개선할 방법을 알고 싶습니다. LiteLLM [창립자](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)를 만나거나
[Discord](https://discord.gg/wuPM9dRgDw)에 참여해 주세요.
:::

## 사전 요구 사항

1. https://www.sumologic.com/ 에서 Sumo Logic 계정을 만듭니다.
2. Sumo Logic에서 HTTP 로그 및 메트릭 Source를 설정합니다.
   - **Manage Data** > **Collection** > **Collection**으로 이동합니다.
   - Hosted Collector 옆의 **Add Source**를 클릭합니다.
   - **HTTP Logs & Metrics**를 선택합니다.
   - 생성된 URL을 복사합니다. 이 URL에는 인증 토큰이 포함되어 있습니다.

자세한 내용은 [HTTP Logs & Metrics Source](https://www.sumologic.com/help/docs/send-data/hosted-collectors/http-source/logs-metrics/) 문서를 참고하세요.

```shell
uv add litellm
```

## 빠른 시작

코드 두 줄만으로 LLM 응답을 Sumo Logic에 바로 로깅할 수 있습니다.

Sumo Logic HTTP Source URL에는 인증 토큰이 포함되어 있으므로 별도의 API 키가 필요하지 않습니다.

<Tabs>
<TabItem value="python" label="SDK">

```python
litellm.callbacks = ["sumologic"]
```

```python
import litellm
import os

# Sumo Logic HTTP Source URL (includes auth token)
os.environ["SUMOLOGIC_WEBHOOK_URL"] = "https://collectors.sumologic.com/receiver/v1/http/your-token-here"

# LLM API Keys
os.environ['OPENAI_API_KEY'] = ""

# Set sumologic as a callback
litellm.callbacks = ["sumologic"]

# OpenAI call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - I'm testing Sumo Logic integration"}
  ]
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. config.yaml을 설정합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["sumologic"]

environment_variables:
  SUMOLOGIC_WEBHOOK_URL: os.environ/SUMOLOGIC_WEBHOOK_URL
```

2. LiteLLM Proxy를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

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

## 로깅되는 데이터

LiteLLM은 [Standard Logging Payload](https://docs.litellm.ai/docs/proxy/logging_spec)를 Sumo Logic으로 전송하며, 여기에는 다음 항목이 포함됩니다.

- **요청 세부 정보**: 모델, 메시지, 파라미터
- **응답 세부 정보**: 완성 텍스트, 토큰 사용량, 지연 시간
- **메타데이터**: 사용자 ID, 사용자 지정 메타데이터, 타임스탬프
- **비용 추적**: 토큰 사용량을 기준으로 한 응답 비용

예제 payload는 다음과 같습니다.

```json
{
  "id": "chatcmpl-123",
  "call_type": "litellm.completion",
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "response": {
    "choices": [{
      "message": {
        "role": "assistant",
        "content": "Hi there!"
      }
    }]
  },
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 5,
    "total_tokens": 15
  },
  "response_cost": 0.0001,
  "start_time": "2024-01-01T00:00:00",
  "end_time": "2024-01-01T00:00:01"
}
```

## 고급 설정

### 로그 형식

Sumo Logic 통합은 기본적으로 **NDJSON (newline-delimited JSON)** 형식을 사용합니다. 이 형식은 Sumo Logic의 파싱 기능에 적합하며, Field Extraction Rules가 수집 시점에 동작하도록 합니다.

#### NDJSON 형식

각 로그 항목은 HTTP 요청에서 별도의 줄로 전송됩니다.
```
{"id":"chatcmpl-1","model":"gpt-3.5-turbo","response_cost":0.0001,...}
{"id":"chatcmpl-2","model":"gpt-4","response_cost":0.0003,...}
{"id":"chatcmpl-3","model":"gpt-3.5-turbo","response_cost":0.0001,...}
```

#### Field Extraction Rules (FERs)의 이점

NDJSON 형식을 사용하면 Field Extraction Rules를 직접 만들 수 있습니다.

```
_sourceCategory=litellm/logs
| json field=_raw "model", "response_cost", "user" as model, cost, user
```

**NDJSON 이전**(JSON 배열 형식 사용):
- `parse regex ... multi` 우회 방법이 필요했습니다.
- FERs가 수집 시점에 파싱할 수 없었습니다.
- 쿼리 시점 파싱이 대시보드 성능에 영향을 주었습니다.

**NDJSON 이후**:
- FERs가 수집 시점에 필드를 파싱합니다.
- 쿼리 시점 우회 방법이 필요하지 않습니다.
- 대시보드 성능이 향상됩니다.
- 쿼리 구문이 더 단순해집니다.

#### 로그 형식 변경(고급)

로그 형식을 변경해야 하는 경우에는 다음과 같이 설정합니다. Sumo Logic에서는 권장하지 않습니다.

```yaml
callback_settings:
  sumologic:
    callback_type: generic_api
    callback_name: sumologic
    log_format: json_array  # Override to use JSON array instead
```

### 배치 설정

LiteLLM이 로그를 Sumo Logic으로 전송하기 전에 배치로 묶는 방식을 제어합니다.

<Tabs>
<TabItem value="python" label="SDK">

```python
import litellm

os.environ["SUMOLOGIC_WEBHOOK_URL"] = "https://collectors.sumologic.com/receiver/v1/http/your-token"

litellm.callbacks = ["sumologic"]

# Configure batch settings (optional)
# These are inherited from CustomBatchLogger
# Default batch_size: 100
# Default flush_interval: 60 seconds
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

```yaml
litellm_settings:
  callbacks: ["sumologic"]

environment_variables:
  SUMOLOGIC_WEBHOOK_URL: os.environ/SUMOLOGIC_WEBHOOK_URL
```

</TabItem>
</Tabs>

### 압축 데이터

Sumo Logic은 압축 데이터(gzip 또는 deflate)를 지원합니다. LiteLLM은 압축이 유리한 경우 자동으로 처리합니다.

이점:
- 네트워크 사용량 감소
- 더 빠른 메시지 전달
- 더 낮은 데이터 전송 비용

### Sumo Logic에서 로그 쿼리

로그가 Sumo Logic으로 전송되기 시작하면 Sumo Logic Query Language를 사용해 쿼리할 수 있습니다.

```sql
_sourceCategory=litellm
| json "model", "response_cost", "usage.total_tokens" as model, cost, tokens
| sum(cost) by model
```

예제 쿼리는 다음과 같습니다.

**모델별 총 비용:**
```sql
_sourceCategory=litellm
| json "model", "response_cost" as model, cost
| sum(cost) as total_cost by model
| sort by total_cost desc
```

**평균 응답 시간:**
```sql
_sourceCategory=litellm
| json "start_time", "end_time" as start, end
| parse regex field=start "(?<start_ms>\d+)"
| parse regex field=end "(?<end_ms>\d+)"
| (end_ms - start_ms) as response_time_ms
| avg(response_time_ms) as avg_response_time
```

**사용자별 요청 수:**
```sql
_sourceCategory=litellm
| json "model_parameters.user" as user
| count by user
```

## 인증

Sumo Logic HTTP Source URL에는 인증 토큰이 포함되어 있으므로 `SUMOLOGIC_WEBHOOK_URL` 환경 변수만 설정하면 됩니다.

**보안 권장 사항:**
- HTTP Source URL은 인증 토큰을 포함하므로 비공개로 유지합니다.
- 환경 변수 또는 보안 정보 관리 시스템에 저장합니다.
- URL이 유출된 경우 Sumo Logic UI에서 URL을 다시 생성합니다.
- 환경(dev, staging, prod)별로 별도의 HTTP Sources를 사용합니다.

## Sumo Logic URL 가져오기

1. [Sumo Logic](https://www.sumologic.com/)에 로그인합니다.
2. **Manage Data** > **Collection** > **Collection**으로 이동합니다.
3. Hosted Collector 옆의 **Add Source**를 클릭합니다.
4. **HTTP Logs & Metrics**를 선택합니다.
5. 소스를 구성합니다.
   - **Name**: LiteLLM 로그
   - **Source Category**: litellm(선택 사항이지만 쿼리에 도움이 됩니다)
6. **Save**를 클릭합니다.
7. 표시된 URL을 복사합니다. 다음과 같은 형식입니다.
   ```
   https://collectors.sumologic.com/receiver/v1/http/ZaVnC4dhaV39Tn37...
   ```

## 문제 해결

### Sumo Logic에 로그가 표시되지 않음

1. **URL 확인**: `SUMOLOGIC_WEBHOOK_URL`이 올바르게 설정되었는지 확인합니다.
2. **HTTP Source 확인**: Sumo Logic UI에서 활성 상태인지 확인합니다.
3. **배치 대기**: 로그는 배치로 전송되므로 60초 정도 기다립니다.
4. **오류 확인**: LiteLLM에서 디버그 로깅을 활성화합니다.
   ```python
   litellm.set_verbose = True
   ```

### URL 형식

URL은 Sumo Logic의 전체 HTTP Source URL이어야 합니다.
- 올바른 예: `https://collectors.sumologic.com/receiver/v1/http/ZaVnC4dhaV39Tn37...`

### 인증 오류가 발생하는 경우

인증 오류가 발생하면 Sumo Logic에서 HTTP Source URL을 다시 생성합니다.
1. Sumo Logic에서 해당 HTTP Source로 이동합니다.
2. 설정 아이콘을 클릭합니다.
3. **Show URL**을 클릭합니다.
4. **Regenerate URL**을 클릭합니다.
5. `SUMOLOGIC_WEBHOOK_URL` 환경 변수를 업데이트합니다.

## 지원 및 창립자와 대화

- [데모 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
