import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DataRobot
LiteLLM은 [DataRobot](https://datarobot.com)의 모든 모델을 지원합니다. 공급자로 `datarobot`을 선택하면 업스트림 [공식 OpenAI Python API 라이브러리](https://github.com/openai/openai-python/blob/main/README.md)를 사용해 `datarobot` OpenAI 호환 엔드포인트로 요청을 라우팅합니다.

## 사용법 

### 환경 변수 {#environment-variables}
```python
import os
from litellm import completion
os.environ["DATAROBOT_API_KEY"] = ""
os.environ["DATAROBOT_API_BASE"] = "" # [OPTIONAL] defaults to https://app.datarobot.com

response = completion(
            model="datarobot/openai/gpt-4o-mini",
            messages=messages,
        )

```

### Completion 호출 {#completion}
```python
import litellm
import os

response = litellm.completion(
    model="datarobot/openai/gpt-4o-mini",   # add `datarobot/` prefix to model so litellm knows to route through DataRobot
    messages=[
                {
                    "role": "user",
                    "content": "Hey, how's it going?",
                }
    ],
)
print(response)
```

## DataRobot completion 모델 {#datarobot-completion-models}

🚨 LiteLLM은 DataRobot LLM 게이트웨이의 _모든_ 모델을 지원합니다. 설치 환경과 사용자 계정에서 사용할 수 있는 목록을 확인하려면 다음 CURL 명령을 보내세요.
`curl -X GET -H "Authorization: Bearer $DATAROBOT_API_TOKEN" "$DATAROBOT_ENDPOINT/genai/llmgw/catalog/" | jq | grep 'model":'DATAROBOT_ENDPOINT/genai/llmgw/catalog/`
