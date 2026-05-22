# Callbacks

## Callbacks로 출력 데이터를 Posthog, Sentry 등으로 보내기

liteLLM은 `input_callbacks`, `success_callbacks`, `failure_callbacks`를 제공하므로 응답 상태에 따라 특정 provider로 데이터를 쉽게 보낼 수 있습니다.

:::tip
**LiteLLM Callbacks가 처음인가요?**

- 프록시/서버 로깅과 관측성은 [Proxy Logging Guide](https://docs.litellm.ai/docs/proxy/logging)를 참고하세요.
- 직접 callback 로직을 작성하려면 [Custom Callbacks Guide](https://docs.litellm.ai/docs/observability/custom_callback)를 참고하세요.
:::


### 지원되는 Callback 통합

- [Lunary](https://lunary.ai/docs)
- [Langfuse](https://langfuse.com/docs)
- [LangSmith](https://www.langchain.com/langsmith)
- [Helicone](https://docs.helicone.ai/introduction)
- [Traceloop](https://traceloop.com/docs)
- [Athina](https://docs.athina.ai/)
- [Sentry](https://docs.sentry.io/platforms/python/)
- [PostHog](https://posthog.com/docs/libraries/python)
- [Slack](https://slack.dev/bolt-python/concepts)
- [Arize](https://docs.arize.com/)
- [PromptLayer](https://docs.promptlayer.com/)

이 목록은 **전체 목록이 아닙니다**. 모든 로깅 통합은 드롭다운에서 확인하세요.

### 관련 Cookbooks
코드 스니펫과 대화형 데모는 다음 cookbooks에서 확인할 수 있습니다.

- [Langfuse Callback 예제 (Colab)](https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/logging_observability/LiteLLM_Langfuse.ipynb)
- [Lunary Callback 예제 (Colab)](https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/logging_observability/LiteLLM_Lunary.ipynb)
- [Arize Callback 예제 (Colab)](https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/logging_observability/LiteLLM_Arize.ipynb)
- [Proxy + Langfuse Callback 예제 (Colab)](https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/logging_observability/LiteLLM_Proxy_Langfuse.ipynb)
- [PromptLayer Callback 예제 (Colab)](https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_PromptLayer.ipynb)

### 빠른 시작

```python
from litellm import completion

# set callbacks
litellm.input_callback=["sentry"] # for sentry breadcrumbing - logs the input being sent to the api
litellm.success_callback=["posthog", "helicone", "langfuse", "lunary", "athina"]
litellm.failure_callback=["sentry", "lunary", "langfuse"]

## set env variables
os.environ['LUNARY_PUBLIC_KEY'] = ""
os.environ['SENTRY_DSN'], os.environ['SENTRY_API_TRACE_RATE']= ""
os.environ['POSTHOG_API_KEY'], os.environ['POSTHOG_API_URL'] = "api-key", "api-url"
os.environ["HELICONE_API_KEY"] = ""
os.environ["TRACELOOP_API_KEY"] = ""
os.environ["LUNARY_PUBLIC_KEY"] = ""
os.environ["ATHINA_API_KEY"] = ""
os.environ["LANGFUSE_PUBLIC_KEY"] = ""
os.environ["LANGFUSE_SECRET_KEY"] = ""
os.environ["LANGFUSE_HOST"] = ""

response = completion(model="gpt-3.5-turbo", messages=messages)
```
