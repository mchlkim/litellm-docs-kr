import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Router 아키텍처 (Fallbacks / Retries)

## 상위 수준 아키텍처 {#high-level-architecture}

<Image img={require('../img/router_architecture.png')} style={{ width: '100%', maxWidth: '4000px' }} />

### 요청 흐름 {#request-flow}

1. **사용자가 요청 전송**: 사용자가 LiteLLM Router 엔드포인트로 요청을 보내면 프로세스가 시작됩니다. 모든 통합 엔드포인트(`.completion`, `.embeddings` 등)는 LiteLLM Router에서 지원됩니다.

2. **function_with_fallbacks**: 초기 요청은 `function_with_fallbacks` 함수로 전송됩니다. 이 함수는 초기 요청을 try-except 블록으로 감싸 예외를 처리하고, 필요한 경우 fallback을 수행합니다. 이후 이 요청은 `function_with_retries` 함수로 전송됩니다.


3. **function_with_retries**: `function_with_retries` 함수는 요청을 try-except 블록으로 감싸고, 초기 요청을 기본 litellm 통합 함수(`litellm.completion`, `litellm.embeddings` 등)에 전달해 LLM API 호출을 처리합니다. `function_with_retries`는 예외를 처리하며, 필요한 경우 model group에서 retry를 수행합니다. 즉, 요청이 실패하면 model group 내에서 사용 가능한 모델로 다시 시도합니다.

4. **litellm.completion**: `litellm.completion` 함수는 LLM API 호출을 처리하는 기본 함수입니다. `function_with_retries`가 실제 LLM API 요청을 보낼 때 사용합니다.

## 범례 {#legend}

**model_group**: 동일한 `model_name`을 공유하고 같은 `model_group`에 속하며, 서로 간에 load balancing이 가능한 LLM API 배포 그룹입니다.
