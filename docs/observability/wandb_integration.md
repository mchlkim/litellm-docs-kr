import Image from '@theme/IdealImage';

# Weights & Biases - LLM 입력/출력 로깅 {#weights--biases---logging-llm-inputoutput}


:::tip

이 문서는 커뮤니티에서 유지 관리합니다. 버그가 발생하면 이슈를 만들어 주세요.
https://github.com/BerriAI/litellm

:::


Weights & Biases는 AI 개발자가 더 나은 모델을 더 빠르게 구축할 수 있도록 돕습니다. https://wandb.ai

<Image img={require('../../img/wandb.png')} />

:::info
콜백을 더 개선할 방법을 알고 싶습니다. LiteLLM [창립자](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)를 만나거나
저희 [Discord](https://discord.gg/wuPM9dRgDw)에 참여해 주세요.
::: 

## 사전 요구 사항 {#pre-requisites}
이 통합을 사용하려면 `uv add wandb`를 실행했는지 확인하세요.
```shell
uv add wandb litellm
```

## 빠른 시작
단 2줄의 코드로 **모든 제공자에서** 응답을 Weights & Biases에 즉시 기록할 수 있습니다.

```python
litellm.success_callback = ["wandb"]
```
```python
# uv add wandb 
import litellm
import os

os.environ["WANDB_API_KEY"] = ""
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set wandb as a callback, litellm will send the data to Weights & Biases
litellm.success_callback = ["wandb"] 
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

## 지원 및 창립자와 대화하기 {#support--talk-to-founders}

- [데모 일정 잡기 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
