import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 요청의 생명주기 {#life-of-a-request}

## 상위 수준 아키텍처 {#high-level-architecture}

<Image img={require('../../img/litellm_gateway.png')} style={{ width: '100%', maxWidth: '4000px' }} />


### 요청 흐름 {#request-flow}

1. **사용자가 요청 전송**: 사용자가 LiteLLM Proxy Server(Gateway)에 요청을 보내면 프로세스가 시작됩니다.

2. [**가상 키**](../virtual_keys): 이 단계에서는 요청의 `Bearer` 토큰이 유효하고 예산 범위 안에 있는지 확인합니다. [각 요청마다 실행되는 검사 목록](https://github.com/BerriAI/litellm/blob/ba41a72f92a9abf1d659a87ec880e8e319f87481/litellm/proxy/auth/auth_checks.py#L43)을 참고하세요.
    - 2.1 Virtual Key가 Redis Cache 또는 In Memory Cache에 있는지 확인
    - 2.2 **Cache에 없으면** DB에서 Virtual Key 조회

3. **Rate Limiting**: [MaxParallelRequestsHandler](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/hooks/parallel_request_limiter.py)가 다음 구성 요소의 **rate limit(rpm/tpm)**을 확인합니다.
    - `Global Server Rate Limit`
    - `Virtual Key Rate Limit`
    - User Rate Limit
    - Team Limit

4. **LiteLLM `proxy_server.py`**: `/chat/completions` 및 `/embeddings` 엔드포인트를 포함합니다. 이 엔드포인트로 들어온 요청은 LiteLLM Router를 거쳐 전달됩니다.

5. [**LiteLLM Router**](../routing): LiteLLM Router는 LLM API 배포에 대한 로드 밸런싱, fallback, retry를 처리합니다.

6. [**litellm.completion() / litellm.embedding()**:](../index#litellm-python-sdk) litellm Python SDK를 사용해 OpenAI API 형식으로 LLM을 호출합니다(변환 및 파라미터 매핑).

7. **요청 후 처리**: 응답이 클라이언트로 반환된 뒤 다음 **비동기** 작업이 수행됩니다.
   - [Lunary, MLflow, LangFuse 또는 기타 로깅 대상에 로그 전송](./logging)
   - [MaxParallelRequestsHandler](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/hooks/parallel_request_limiter.py)가 다음 항목의 rpm/tpm 사용량을 갱신합니다.
        - `Global Server Rate Limit`
        - `Virtual Key Rate Limit`
        - User Rate Limit
        - Team Limit
    - `_ProxyDBLogger`가 LiteLLM 데이터베이스의 spend / usage를 갱신합니다. [요청별로 DB에 추적되는 전체 항목](https://github.com/BerriAI/litellm/blob/ba41a72f92a9abf1d659a87ec880e8e319f87481/schema.prisma#L172)을 참고하세요.

## 자주 묻는 질문 {#frequently-asked-questions}

1. DB 트랜잭션이 요청 생명주기에 묶이나요?
    - 아니요. DB 트랜잭션은 요청 생명주기에 묶이지 않습니다.
    - 가상 키 유효성 검사는 캐시에 없을 때 DB 읽기에 의존합니다.
    - 그 외 모든 DB 트랜잭션은 백그라운드 작업에서 비동기로 수행됩니다.
