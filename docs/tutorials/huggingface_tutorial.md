# Llama2 - Huggingface 튜토리얼
[Huggingface](https://huggingface.co/)는 머신 러닝 모델을 배포하기 위한 오픈 소스 플랫폼입니다.

## Huggingface Inference Endpoints로 Llama2 호출하기
LiteLLM을 사용하면 공개, 비공개 또는 기본 huggingface 엔드포인트를 쉽게 호출할 수 있습니다.

여기서는 다음 3개 모델을 호출해 보겠습니다.

| 모델                                   | 엔드포인트 유형 |
| --------------------------------------- | ---------------- |
| deepset/deberta-v3-large-squad2         | [기본 Huggingface 엔드포인트](#case-1) |
| meta-llama/Llama-2-7b-hf                | [공개 엔드포인트](#case-2)              |
| meta-llama/Llama-2-7b-chat-hf           | [비공개 엔드포인트](#case-3)             |

<a id="case-1-call-default-huggingface-endpoint"></a>

### 케이스 1: 기본 huggingface 엔드포인트 호출하기 {#case-1}

전체 예시는 다음과 같습니다.

```python
from litellm import completion 

model = "deepset/deberta-v3-large-squad2"
messages = [{"role": "user", "content": "Hey, how's it going?"}] # LiteLLM follows the OpenAI format 

### CALLING ENDPOINT
completion(model=model, messages=messages, custom_llm_provider="huggingface")
```

어떤 일이 일어나나요?
- model: huggingface에 배포된 모델의 이름입니다.
- messages: 입력값입니다. OpenAI chat 형식을 받습니다. huggingface의 경우 기본적으로 목록을 순회하면서 message["content"]를 prompt에 추가합니다. [관련 코드](https://github.com/BerriAI/litellm/blob/6aff47083be659b80e00cb81eb783cb24db2e183/litellm/llms/huggingface_restapi.py#L46)
- custom_llm_provider: 선택적 매개변수입니다. Azure, Replicate, Huggingface, Together-ai처럼 직접 모델을 배포하는 플랫폼에만 필요한 선택적 플래그입니다. 이를 통해 litellm이 해당 모델에 맞는 올바른 공급자로 라우팅할 수 있습니다.

<a id="case-2-call-llama2-public-huggingface-endpoint"></a>

### 케이스 2: Llama2 공개 Huggingface 엔드포인트 호출하기 {#case-2}

`meta-llama/Llama-2-7b-hf`를 공개 엔드포인트 `https://ag3dkq4zui5nu8g3.us-east-1.aws.endpoints.huggingface.cloud` 뒤에 배포했습니다.

실행해 보겠습니다.
```python
from litellm import completion 

model = "meta-llama/Llama-2-7b-hf"
messages = [{"role": "user", "content": "Hey, how's it going?"}] # LiteLLM follows the OpenAI format 
api_base = "https://ag3dkq4zui5nu8g3.us-east-1.aws.endpoints.huggingface.cloud"

### CALLING ENDPOINT
completion(model=model, messages=messages, custom_llm_provider="huggingface", api_base=api_base)
```

어떤 일이 일어나나요?
- api_base: 선택적 매개변수입니다. 이 예시는 [기본 huggingface 추론 엔드포인트](https://github.com/BerriAI/litellm/blob/6aff47083be659b80e00cb81eb783cb24db2e183/litellm/llms/huggingface_restapi.py#L35)가 아니라 배포된 엔드포인트를 사용하므로, 해당 값을 LiteLLM에 전달합니다.

<a id="case-3-call-llama2-private-huggingface-endpoint"></a>

### 케이스 3: Llama2 비공개 Huggingface 엔드포인트 호출하기 {#case-3}

공개 엔드포인트와의 유일한 차이는 여기에 `api_key`가 필요하다는 점입니다.

LiteLLM에서 api_key를 전달하는 방법은 3가지입니다.

환경 변수로 전달하거나, 패키지 변수로 설정하거나, `completion()`을 호출할 때 전달할 수 있습니다.

**환경 변수로 설정하기**  
추가해야 하는 코드는 다음 1줄입니다.
```python
os.environ["HF_TOKEN"] = "..."
```

전체 코드는 다음과 같습니다.
```python
from litellm import completion 

os.environ["HF_TOKEN"] = "..."

model = "meta-llama/Llama-2-7b-hf"
messages = [{"role": "user", "content": "Hey, how's it going?"}] # LiteLLM follows the OpenAI format 
api_base = "https://ag3dkq4zui5nu8g3.us-east-1.aws.endpoints.huggingface.cloud"

### CALLING ENDPOINT
completion(model=model, messages=messages, custom_llm_provider="huggingface", api_base=api_base)
```

**패키지 변수로 설정하기**  
추가해야 하는 코드는 다음 1줄입니다.
```python
litellm.huggingface_key = "..."
```

전체 코드는 다음과 같습니다.
```python
import litellm
from litellm import completion 

litellm.huggingface_key = "..."

model = "meta-llama/Llama-2-7b-hf"
messages = [{"role": "user", "content": "Hey, how's it going?"}] # LiteLLM follows the OpenAI format 
api_base = "https://ag3dkq4zui5nu8g3.us-east-1.aws.endpoints.huggingface.cloud"

### CALLING ENDPOINT
completion(model=model, messages=messages, custom_llm_provider="huggingface", api_base=api_base)
```

**completion 호출 시 전달하기**  
```python
completion(..., api_key="...")
```

전체 코드는 다음과 같습니다.

```python
from litellm import completion 

model = "meta-llama/Llama-2-7b-hf"
messages = [{"role": "user", "content": "Hey, how's it going?"}] # LiteLLM follows the OpenAI format 
api_base = "https://ag3dkq4zui5nu8g3.us-east-1.aws.endpoints.huggingface.cloud"

### CALLING ENDPOINT
completion(model=model, messages=messages, custom_llm_provider="huggingface", api_base=api_base, api_key="...")
```
