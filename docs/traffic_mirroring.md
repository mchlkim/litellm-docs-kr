import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# A/B Testing - 트래픽 미러링

Traffic mirroring은 평가 목적으로 운영 트래픽을 보조(silent) 모델에 "복제"할 수 있게 합니다. silent 모델의 응답은 백그라운드에서 수집되며, 기본 요청의 지연 시간이나 결과에는 영향을 주지 않습니다.

이 기능은 다음 상황에 유용합니다.
- 전환 전에 운영 prompt로 새 모델의 성능을 테스트할 때
- 서로 다른 provider 간 비용과 지연 시간을 비교할 때
- 더 자세한 출력을 제공하는 모델로 트래픽을 mirroring해 문제를 디버깅할 때

## 빠른 시작

traffic mirroring을 활성화하려면 deployment의 `litellm_params`에 `silent_model`을 추가합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router

model_list = [
    {
        "model_name": "gpt-3.5-turbo",
        "litellm_params": {
            "model": "azure/chatgpt-v-2",
            "api_key": "...",
            "silent_model": "gpt-4" # 👈 Mirror traffic to gpt-4
        },
    },
    {
        "model_name": "gpt-4",
        "litellm_params": {
            "model": "openai/gpt-4",
            "api_key": "..."
        },
    }
]

router = Router(model_list=model_list)

# The request to "gpt-3.5-turbo" will trigger a background call to "gpt-4"
response = await router.acompletion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "How does traffic mirroring work?"}]
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

`config.yaml`에 `silent_model`을 추가합니다.

```yaml
model_list:
  - model_name: primary-model
    litellm_params:
      model: azure/gpt-35-turbo
      api_key: os.environ/AZURE_API_KEY
      silent_model: evaluation-model # 👈 Mirror traffic here
  - model_name: evaluation-model
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
</Tabs>

## 동작 방식
1. **요청 수신**: model group(예: `primary-model`)으로 요청이 들어옵니다.
2. **Deployment 선택**: LiteLLM이 group에서 deployment를 선택합니다.
3. **Primary 호출**: LiteLLM이 primary deployment를 호출합니다.
4. **Mirroring**: `silent_model`이 있으면 LiteLLM이 해당 모델에 대한 백그라운드 호출을 시작합니다.
   - **Sync** 호출: 공유 thread pool을 사용합니다.
   - **Async** 호출: `asyncio.create_task`를 사용합니다.
5. **격리**: 백그라운드 호출은 원래 요청 파라미터의 `deepcopy`를 사용하고 `metadata["is_silent_experiment"] = True`를 설정합니다. 또한 사용량 추적에서 충돌을 방지하기 위해 logging ID를 제거합니다.

## 주요 기능
- **지연 시간 격리**: primary 요청은 준비되는 즉시 반환됩니다. 백그라운드(silent) 호출은 요청을 차단하지 않습니다.
- **통합 로깅**: 백그라운드 호출은 Router를 통해 처리되므로 설정된 observability 도구(Langfuse, S3 등)에 자동으로 기록됩니다.
- **평가**: 로그의 `is_silent_experiment: True` flag를 사용해 primary 호출과 mirrored 호출의 결과를 필터링하고 비교할 수 있습니다.
