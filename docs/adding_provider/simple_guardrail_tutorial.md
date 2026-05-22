import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 새 Guardrail 통합 추가 {#adding-a-new-guardrail-integration}

LLM으로 전송되기 전이나 응답이 돌아온 후 텍스트를 검사하는 클래스를 만듭니다. 규칙을 위반하면 해당 요청 또는 응답을 차단합니다.

## 작동 방식 {#how-it-works}

guardrail을 포함한 요청:

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "How do I hack a system?"}],
    "guardrails": ["my-guardrail"]
}'
```

guardrail은 입력을 검사한 다음 출력을 검사합니다. 문제가 있으면 예외를 발생시킵니다.

## Guardrail 빌드 {#build-your-guardrail}

### 디렉터리 생성 {#create-your-directory}

```bash
mkdir -p litellm/proxy/guardrails/guardrail_hooks/my_guardrail
cd litellm/proxy/guardrails/guardrail_hooks/my_guardrail
```

두 개의 파일을 만듭니다: `my_guardrail.py`(메인 클래스)와 `__init__.py`(초기화).

### 메인 클래스 작성 {#write-the-main-class}

`my_guardrail.py`:

[Custom Guardrail](../proxy/guardrails/custom_guardrail#custom-guardrail) 튜토리얼을 따르세요.

### Init 파일 생성 {#create-the-init-file}

`__init__.py`:

```python
from typing import TYPE_CHECKING

from litellm.types.guardrails import SupportedGuardrailIntegrations

from .my_guardrail import MyGuardrail

if TYPE_CHECKING:
    from litellm.types.guardrails import Guardrail, LitellmParams


def initialize_guardrail(litellm_params: "LitellmParams", guardrail: "Guardrail"):
    import litellm
    
    _my_guardrail_callback = MyGuardrail(
        api_base=litellm_params.api_base,
        api_key=litellm_params.api_key,
        guardrail_name=guardrail.get("guardrail_name", ""),
        event_hook=litellm_params.mode,
        default_on=litellm_params.default_on,
    )
    
    litellm.logging_callback_manager.add_litellm_callback(_my_guardrail_callback)
    return _my_guardrail_callback


guardrail_initializer_registry = {
    SupportedGuardrailIntegrations.MY_GUARDRAIL.value: initialize_guardrail,
}

guardrail_class_registry = {
    SupportedGuardrailIntegrations.MY_GUARDRAIL.value: MyGuardrail,
}
```

### Guardrail Type 등록 {#register-your-guardrail-type}

`litellm/types/guardrails.py`에 추가합니다:

```python
class SupportedGuardrailIntegrations(str, Enum):
    LAKERA = "lakera_prompt_injection"
    APORIA = "aporia"
    BEDROCK = "bedrock_guardrails"
    PRESIDIO = "presidio"
    ZSCALER_AI_GUARD = "zscaler_ai_guard"
    MY_GUARDRAIL = "my_guardrail"
```

## 사용법 {#usage}

### Config 파일 {#config-file}

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
    api_key: os.environ/OPENAI_API_KEY

guardrails:
    - guardrail_name: my_guardrail
        litellm_params:
        guardrail: my_guardrail
        mode: during_call
        api_key: os.environ/MY_GUARDRAIL_API_KEY
        api_base: https://api.myguardrail.com
```

### 요청별 설정 {#per-request}

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Test message"}],
    "guardrails": ["my_guardrail"]
}'
```

## 테스트 {#testing}

`test_litellm/` 폴더 안에 단위 테스트를 추가합니다.


