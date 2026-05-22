import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 사용자 지정 프롬프트 관리 {#custom-prompt-management}

사용자 지정 훅으로 LiteLLM을 프롬프트 관리 시스템에 연결합니다.

## 개요


<Image 
  img={require('../../img/custom_prompt_management.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


## 동작 방식

## 빠른 시작

### 1. 사용자 지정 프롬프트 관리자 만들기 {#1-create-your-custom-prompt-manager}

`CustomPromptManagement`를 상속하는 클래스를 만들어 프롬프트 조회와 형식 지정을 처리합니다.

**예제 구현**

`custom_prompt.py`라는 새 파일을 만들고 이 코드를 추가합니다. 여기서 핵심 메서드는 `get_chat_completion_prompt`이며, `prompt_id`와 `prompt_variables`를 기준으로 프롬프트를 조회하고 형식을 지정하는 사용자 지정 로직을 구현할 수 있습니다.

```python
from typing import List, Tuple, Optional
from litellm.integrations.custom_prompt_management import CustomPromptManagement
from litellm.types.llms.openai import AllMessageValues
from litellm.types.utils import StandardCallbackDynamicParams

class MyCustomPromptManagement(CustomPromptManagement):
    def get_chat_completion_prompt(
        self,
        model: str,
        messages: List[AllMessageValues],
        non_default_params: dict,
        prompt_id: str,
        prompt_variables: Optional[dict],
        dynamic_callback_params: StandardCallbackDynamicParams,
    ) -> Tuple[str, List[AllMessageValues], dict]:
        """
        Retrieve and format prompts based on prompt_id.
        
        Returns:
            - model: The model to use
            - messages: The formatted messages
            - non_default_params: Optional parameters like temperature
        """
        # Example matching the diagram: Add system message for prompt_id "1234"
        if prompt_id == "1234":
            # Prepend system message while preserving existing messages
            new_messages = [
                {"role": "system", "content": "Be a good Bot!"},
            ] + messages
            return model, new_messages, non_default_params
        
        # Default: Return original messages if no prompt_id match
        return model, messages, non_default_params

prompt_management = MyCustomPromptManagement()
```

### 2. LiteLLM `config.yaml`에서 프롬프트 관리자 설정하기 {#2-configure-your-prompt-manager-in-litellm-configyaml}

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: custom_prompt.prompt_management  # sets litellm.callbacks = [prompt_management]
```

### 3. LiteLLM Gateway 시작하기 {#3-start-litellm-gateway}

<Tabs>
<TabItem value="docker" label="Docker Run">

LiteLLM Docker 컨테이너에 `custom_logger.py`를 마운트합니다.

```shell
docker run -d \
  -p 4000:4000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  --name my-app \
  -v $(pwd)/my_config.yaml:/app/config.yaml \
  -v $(pwd)/custom_logger.py:/app/custom_logger.py \
  my-app:latest \
  --config /app/config.yaml \
  --port 4000 \
  --detailed_debug \
```

</TabItem>

<TabItem value="py" label="litellm pip">

```shell
litellm --config config.yaml --detailed_debug
```

</TabItem>
</Tabs>

### 4. 사용자 지정 프롬프트 관리자 테스트하기 {#4-test-your-custom-prompt-manager}

`prompt_id="1234"`를 전달하면 사용자 지정 프롬프트 관리자가 대화에 시스템 메시지 "Be a good Bot!"을 추가합니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gemini-1.5-pro",
    messages=[{"role": "user", "content": "hi"}],
    extra_body={
        "prompt_id": "1234"
    }
)

print(response.choices[0].message.content)
```
</TabItem>

<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

chat = ChatOpenAI(
    model="gpt-4",
    openai_api_key="sk-1234",
    openai_api_base="http://0.0.0.0:4000",
    extra_body={
        "prompt_id": "1234"
    }
)

messages = []
response = chat(messages)

print(response.content)
```
</TabItem>

<TabItem value="curl" label="Curl">

```shell
curl -X POST http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-1234" \
-d '{
    "model": "gemini-1.5-pro",
    "messages": [{"role": "user", "content": "hi"}],
    "prompt_id": "1234"
}'
```
</TabItem>
</Tabs>

### LiteLLM SDK 직접 사용하기 {#using-the-litellm-sdk-directly}

Python 스크립트에서 프록시를 거치지 않고 `litellm.completion()`을 호출하는 경우, 요청을 보내기 전에 사용자 지정 프롬프트 관리자를 등록합니다.

```python

import litellm
from custom_prompt import prompt_management

litellm.callbacks = [prompt_management]
litellm.use_litellm_proxy = True

response = litellm.completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "hi"}],
    prompt_id="1234",
    prompt_variables={"user_message": "hi"},
)
```

> **참고:** SDK 스크립트에서는 `litellm.callbacks = [prompt_management]` 또는 동일한 동작의 `litellm.logging_callback_manager.add_litellm_callback(prompt_management)`가 필요합니다. 프록시는 `config.yaml`에서 `callbacks`를 자동으로 읽지만, 독립 실행형 스크립트는 그렇지 않습니다.

요청은 다음 형식에서
```json
{
    "model": "gemini-1.5-pro",
    "messages": [{"role": "user", "content": "hi"}],
    "prompt_id": "1234"
}
```

다음 형식으로 변환됩니다.
```json
{
    "model": "gemini-1.5-pro",
    "messages": [
        {"role": "system", "content": "Be a good Bot!"},
        {"role": "user", "content": "hi"}
    ]
}
```

