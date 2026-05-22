# 콜백

## 콜백을 사용해 출력 데이터를 Posthog, Sentry 등으로 보내기

liteLLM은 `success_callbacks`와 `failure_callbacks`를 제공하므로 응답 상태에 따라 특정 제공업체로 데이터를 쉽게 보낼 수 있습니다.

liteLLM은 다음을 지원합니다.

- [Lunary](https://lunary.ai/docs)
- [Helicone](https://docs.helicone.ai/introduction)
- [Sentry](https://docs.sentry.io/platforms/python/)
- [PostHog](https://posthog.com/docs/libraries/python)
- [Slack](https://slack.dev/bolt-python/concepts)

### 빠른 시작

```python
from litellm import completion

# set callbacks
litellm.success_callback=["posthog", "helicone", "lunary"]
litellm.failure_callback=["sentry", "lunary"]

## set env variables
os.environ['SENTRY_DSN'], os.environ['SENTRY_API_TRACE_RATE']= ""
os.environ['POSTHOG_API_KEY'], os.environ['POSTHOG_API_URL'] = "api-key", "api-url"
os.environ["HELICONE_API_KEY"] = ""

response = completion(model="gpt-3.5-turbo", messages=messages)
```
