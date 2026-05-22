import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenMeter - 사용량 기반 결제 {#openmeter---usage-based-billing}

[OpenMeter](https://openmeter.io/)는 AI/Cloud 애플리케이션을 위한 오픈 소스 사용량 기반 결제 솔루션입니다. 간편한 결제를 위해 Stripe와 통합됩니다.

<Image img={require('../../img/openmeter.png')} />

:::info
콜백을 더 개선할 방법을 알고 싶습니다! LiteLLM [창립자](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)를 만나거나
[Discord](https://discord.gg/wuPM9dRgDw)에 참여하세요.
::: 


## 빠른 시작
단 2줄의 코드만으로 OpenMeter를 사용해 **모든 제공업체**의 응답을 즉시 기록할 수 있습니다.

OpenMeter API 키는 https://openmeter.cloud/meters 에서 가져오세요.

```python
litellm.callbacks = ["openmeter"] # logs cost + usage of successful calls to openmeter
```


<Tabs>
<TabItem value="sdk" label="SDK">

```python
# uv add openmeter 
import litellm
import os

# from https://openmeter.cloud
os.environ["OPENMETER_API_ENDPOINT"] = ""
os.environ["OPENMETER_API_KEY"] = ""

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set openmeter as a callback, litellm will send the data to openmeter
litellm.callbacks = ["openmeter"] 
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. Config.yaml에 추가합니다.
```yaml
model_list:
- litellm_params:
    api_base: https://openai-function-calling-workers.tasslexyz.workers.dev/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  callbacks: ["openmeter"] # 👈 KEY CHANGE
```

2. 프록시를 시작합니다.

```
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```

</TabItem>
</Tabs>


<Image img={require('../../img/openmeter_img_2.png')} />
