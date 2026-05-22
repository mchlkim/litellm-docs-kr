import Image from '@theme/IdealImage';

# 🔭 DeepEval - 트레이싱이 포함된 오픈소스 평가 {#deepeval---open-source-evals-with-tracing}

### DeepEval이란? {#what-is-deepeval}
[DeepEval](https://deepeval.com)은 LLM을 위한 오픈소스 평가 프레임워크입니다([GitHub](https://github.com/confident-ai/deepeval)).

### Confident AI란? {#what-is-confident-ai}

[Confident AI](https://documentation.confident-ai.com)(***deepeval*** 플랫폼)는 팀이 LLM 애플리케이션을 추적하고 모니터링할 수 있는 Observatory를 제공합니다. LLM 앱을 위한 Datadog이라고 생각하면 됩니다. Observatory에서는 다음을 수행할 수 있습니다.

- LLM 애플리케이션의 문제를 실시간으로 감지하고 디버깅
- 강력한 필터로 과거 생성 데이터 검색 및 분석
- 모델 응답에 대한 사람의 피드백 수집
- 성능을 측정하고 개선하기 위한 평가 실행
- 리소스 사용량을 최적화하기 위한 비용 및 지연 시간 추적

<Image img={require('../../img/deepeval_dashboard.png')} />

### 빠른 시작

```python
import os
import time
import litellm


os.environ['OPENAI_API_KEY']='<your-openai-api-key>'
os.environ['CONFIDENT_API_KEY']='<your-confident-api-key>'

litellm.success_callback = ["deepeval"]
litellm.failure_callback = ["deepeval"]

try:
    response = litellm.completion(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": "What's the weather like in San Francisco?"}
        ],
    )
except Exception as e:
    print(e)

print(response)
```

:::info
`CONFIDENT_API_KEY`는 [Confident AI](https://app.confident-ai.com/project) 플랫폼에 로그인하여 받을 수 있습니다.
:::

## 지원 및 Deepeval 팀과 대화하기 {#support--talk-with-deepeval-team}
- [Confident AI 문서 📝](https://documentation.confident-ai.com)
- [플랫폼 🚀](https://confident-ai.com)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 지원 ✉️ support@confident-ai.com
