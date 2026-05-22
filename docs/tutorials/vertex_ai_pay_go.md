import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI PayGo와 Priority

## Priority PayGo

LiteLLM은 Priority PayGo를 지원합니다.  
priority header를 보내면 priority queueing을 사용하고 priority token rate로 과금됩니다.

:::info Priority PayGo를 지원하는 모델
현재 기준: `gemini/gemini-2.5-pro`, `vertex_ai/gemini-3-pro-preview`, `vertex_ai/gemini-3.1-pro-preview`, `vertex_ai/gemini-3-flash-preview` 및 해당 변형입니다.  
LiteLLM의 [model pricing JSON](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 `supports_service_tier: true`를 확인하세요.
:::

### Priority request 보내기

다음 header를 사용하세요.

`X-Vertex-AI-LLM-Shared-Request-Type: priority`

<Tabs>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python
import litellm

response = litellm.completion(
    model="vertex_ai/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "Summarize the Gettysburg Address."}],
    vertex_project="YOUR_PROJECT_ID",
    vertex_location="us-central1",
    extra_headers={"X-Vertex-AI-LLM-Shared-Request-Type": "priority"},
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy-config" label="Proxy config">

```yaml title="config.yaml"
model_list:
  - model_name: gemini-priority
    litellm_params:
      model: vertex_ai/gemini-3-pro-preview
      vertex_project: "YOUR_PROJECT_ID"
      vertex_location: "us-central1"
      vertex_credentials: os.environ/GOOGLE_APPLICATION_CREDENTIALS
      extra_headers:
        X-Vertex-AI-LLM-Shared-Request-Type: priority
```

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-your-key" \
  -H "Content-Type: application/json" \
  -d '{"model": "gemini-priority", "messages": [{"role": "user", "content": "Hello"}]}'
```

</TabItem>
<TabItem value="pass-through" label="Pass-through mode">

LiteLLM이 provider-specific header를 전달하도록 `x-pass-`를 사용하세요.

```bash
MODEL_ID="gemini-3-pro-preview-0325"
PROJECT_ID="YOUR_PROJECT_ID"

curl -X POST \
  "${LITELLM_PROXY_BASE_URL}/vertex_ai/v1/projects/${PROJECT_ID}/locations/global/publishers/google/models/${MODEL_ID}:generateContent" \
  -H "Authorization: Bearer sk-your-litellm-key" \
  -H "Content-Type: application/json" \
  -H "x-pass-X-Vertex-AI-LLM-Shared-Request-Type: priority" \
  -d '{"contents": [{"role": "user", "parts": [{"text": "Hello!"}]}]}'
```

</TabItem>
</Tabs>

### Cost tracking 동작 방식

![Vertex AI Priority PayGo 비용 추적 흐름](/img/vertex_cost_tracking_flow.svg)

**`trafficType` -> `service_tier` mapping**

| `usageMetadata.trafficType` | `service_tier` | 사용하는 pricing key |
|---|---|---|
| `ON_DEMAND` | `None` | `input_cost_per_token` |
| `ON_DEMAND_PRIORITY` | `"priority"` | `input_cost_per_token_priority` |
| `FLEX` / `BATCH` | `"flex"` | `input_cost_per_token_flex` |

tier-specific key가 없으면 LiteLLM은 standard pricing key로 fallback합니다.

---

## Standard PayGo와 Provisioned Throughput

이 header는 priority routing과 다른 header입니다.

| Header value | 동작 |
|---|---|
| `X-Vertex-AI-LLM-Request-Type: shared` | standard PayGo를 강제합니다(PT 우회) |
| `X-Vertex-AI-LLM-Request-Type: dedicated` | Provisioned Throughput만 강제합니다(소진되면 `429`) |

### Native route 예제

```python
import litellm

response = litellm.completion(
    model="vertex_ai/gemini-2.0-flash",
    messages=[{"role": "user", "content": "Hello!"}],
    vertex_project="YOUR_PROJECT_ID",
    vertex_location="us-central1",
    extra_headers={"X-Vertex-AI-LLM-Request-Type": "shared"},
)
```

### Pass-through 예제

```bash
MODEL_ID="gemini-2.0-flash-001"
PROJECT_ID="YOUR_PROJECT_ID"

curl -X POST \
  "${LITELLM_PROXY_BASE_URL}/vertex_ai/v1/projects/${PROJECT_ID}/locations/global/publishers/google/models/${MODEL_ID}:generateContent" \
  -H "Authorization: Bearer sk-your-litellm-key" \
  -H "Content-Type: application/json" \
  -H "x-pass-X-Vertex-AI-LLM-Request-Type: shared" \
  -d '{
    "contents": [{"role": "user", "parts": [{"text": "Hello!"}]}]
  }'
```

---

## 문제 해결 

**Q: `403 Permission denied` 또는 `IAM_PERMISSION_DENIED`는 무엇을 의미하나요?**  
답변: service account 또는 ADC user에 `roles/aiplatform.user` role이 없다는 의미입니다. 해결하려면 `gcloud projects add-iam-policy-binding`을 다시 실행하세요.

**Q: `429 Quota exceeded` error가 발생하면 어떻게 해야 하나요?**  
A: region별 QPM(queries per minute) 또는 TPM(tokens per minute) quota에 도달했다는 의미입니다. 다음을 시도할 수 있습니다.
- [GCP Quotas console](https://console.cloud.google.com/iam-admin/quotas)에서 quota 증가 요청
- load balancing을 위해 LiteLLM configuration에 region 추가
- 보장된 capacity가 필요하면 [Provisioned Throughput](https://cloud.google.com/vertex-ai/generative-ai/docs/provisioned-throughput)으로 upgrade

**Q: `VERTEXAI_PROJECT not set` error는 어떻게 해결하나요?**  
A: LiteLLM call에서 `vertex_project` parameter를 명시적으로 전달하거나, 코드를 실행하기 전에 `VERTEXAI_PROJECT` environment variable을 설정하세요.
