import Image from '@theme/IdealImage';

# Athina


:::tip

이 문서는 커뮤니티에서 유지보수합니다. 버그가 발생하면 이슈를 생성해 주세요.
https://github.com/BerriAI/litellm

:::


[Athina](https://athina.ai/)는 LLM 기반 앱을 위한 평가 프레임워크이자 프로덕션 모니터링 플랫폼입니다. Athina는 실시간 모니터링, 세분화된 분석, 플러그 앤 플레이 평가를 통해 AI 애플리케이션의 성능과 안정성을 높이도록 설계되었습니다.

<Image img={require('../../img/athina_dashboard.png')} />

## 시작하기

Athina를 사용하면 모든 LLM Provider(OpenAI, Azure, Anthropic, Cohere, Replicate, PaLM)의 요청을 로깅할 수 있습니다.

liteLLM은 `callbacks`를 제공하므로 응답 상태에 따라 데이터를 쉽게 로깅할 수 있습니다.

## 콜백 사용하기

먼저 [Athina dashboard](https://app.athina.ai)에서 가입하고 API_KEY를 발급받습니다.

코드 한 줄만으로 Athina를 통해 **모든 provider의** 응답을 즉시 로깅할 수 있습니다.

```python
litellm.success_callback = ["athina"]
```

### 전체 코드

```python
from litellm import completion

## set env variables
os.environ["ATHINA_API_KEY"] = "your-athina-api-key"
os.environ["OPENAI_API_KEY"]= ""

# set callback
litellm.success_callback = ["athina"]

#openai call
response = completion(
  model="gpt-3.5-turbo", 
  messages=[{"role": "user", "content": "Hi 👋 - i'm openai"}]
) 
```

## metadata에 추가 정보 전달하기
completion의 `metadata` 필드를 사용해 Athina로 추가 정보를 보낼 수 있습니다. 예를 들어 추적하려는 `customer_id`, `prompt_slug` 또는 기타 요청 관련 메타데이터를 함께 전달할 때 유용합니다.

```python
#openai call with additional metadata
response = completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  metadata={
    "environment": "staging",
    "prompt_slug": "my_prompt_slug/v1"
  }
)
```

metadata에서 허용되는 필드와 타입, 설명은 다음과 같습니다.

* `environment: Optional[str]` - 앱이 실행 중인 환경입니다(예: production, staging 등). 추론 호출을 환경별로 구분할 때 유용합니다.
* `prompt_slug: Optional[str]` - 추론에 사용된 프롬프트의 식별자입니다. 추론 호출을 프롬프트별로 구분할 때 유용합니다.
* `customer_id: Optional[str]` - 고객 ID입니다. 추론 호출을 고객별로 구분할 때 유용합니다.
* `customer_user_id: Optional[str]` - 최종 사용자 ID입니다. 추론 호출을 최종 사용자별로 구분할 때 유용합니다.
* `session_id: Optional[str]` - 세션 또는 대화 ID입니다. 서로 다른 추론을 하나의 대화나 체인으로 그룹화하는 데 사용됩니다. [자세히 보기](https://docs.athina.ai/logging/grouping_inferences)
* `external_reference_id: Optional[str]` - Athina에 로깅된 추론에 내부 식별자를 연결하려는 경우 유용합니다.
* `context: Optional[Union[dict, str]]` - 프롬프트 정보로 사용되는 컨텍스트입니다. RAG 애플리케이션에서는 "검색된" 데이터에 해당합니다. 컨텍스트는 문자열 또는 객체(dictionary)로 로깅할 수 있습니다.
* `expected_response: Optional[str]` - 평가 목적으로 비교할 기준 응답입니다. 추론 호출을 기대 응답별로 구분할 때 유용합니다.
* `user_query: Optional[str]` - 사용자 질의입니다. 대화형 애플리케이션에서는 사용자의 마지막 메시지입니다.
* `tags: Optional[list]` - 태그 목록입니다. 추론 호출을 태그별로 구분할 때 유용합니다.
* `user_feedback: Optional[str]` - 최종 사용자의 피드백입니다.
* `model_options: Optional[dict]` - 모델 옵션 dictionary입니다. 모델 동작이 최종 사용자에게 어떤 영향을 주는지 파악하는 데 유용합니다.
* `custom_attributes: Optional[dict]` - 사용자 지정 속성 dictionary입니다. 추론에 대한 추가 정보를 담을 때 유용합니다.

## Athina 자체 호스팅 배포 사용하기

Athina 자체 호스팅 배포를 사용하는 경우 `ATHINA_BASE_URL` 환경 변수를 자체 호스팅 배포 주소로 설정해야 합니다.

```python
...
os.environ["ATHINA_BASE_URL"]= "http://localhost:9000"
...
```

## Athina 팀 지원 및 문의

- [데모 예약 👋](https://cal.com/shiv-athina/30min)
- [웹사이트 💻](https://athina.ai/?utm_source=litellm&utm_medium=website)
- [문서 📖](https://docs.athina.ai/?utm_source=litellm&utm_medium=website)
- [데모 비디오 📺](https://www.loom.com/share/d9ef2c62e91b46769a39c42bb6669834?sid=711df413-0adb-4267-9708-5f29cef929e3)
- 이메일 ✉️ shiv@athina.ai, akshat@athina.ai, vivek@athina.ai
