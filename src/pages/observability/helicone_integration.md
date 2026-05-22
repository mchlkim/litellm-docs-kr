# Helicone 튜토리얼
[Helicone](https://helicone.ai/)은 OpenAI 트래픽을 프록시하고 지출, 지연 시간, 사용량에 대한 핵심 인사이트를 제공하는 오픈 소스 관측성 플랫폼입니다.

## Helicone을 사용해 모든 LLM 제공업체(OpenAI, Azure, Anthropic, Cohere, Replicate, PaLM)의 요청 로깅하기
liteLLM은 `success_callbacks`와 `failure_callbacks`를 제공하므로 응답 상태에 따라 특정 제공업체로 데이터를 쉽게 보낼 수 있습니다.

이 경우에는 요청이 성공했을 때 Helicone에 요청을 기록하려고 합니다.

### 방법 1: 콜백 사용하기
코드 한 줄만으로 **모든 제공업체의** 응답을 Helicone에 즉시 기록할 수 있습니다.
```
litellm.success_callback=["helicone"]
```

전체 코드
```python
from litellm import completion

## set env variables
os.environ["HELICONE_API_KEY"] = "your-helicone-key" 
os.environ["OPENAI_API_KEY"], os.environ["COHERE_API_KEY"] = "", ""

# set callbacks
litellm.success_callback=["helicone"]

#openai call
response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hi 👋 - i'm openai"}]) 

#cohere call
response = completion(model="command-nightly", messages=[{"role": "user", "content": "Hi 👋 - i'm cohere"}]) 
```

### 방법 2: [OpenAI + Azure 전용] Helicone을 프록시로 사용하기
Helicone은 캐싱 같은 고급 기능을 제공합니다. 현재 Helicone은 Azure와 OpenAI에 대해 이 방식을 지원합니다.

Helicone으로 OpenAI/Azure 요청을 프록시하려면 다음과 같이 설정할 수 있습니다.

- `litellm.api_url`을 통해 Helicone을 기본 URL로 설정합니다.
- `litellm.headers`를 통해 Helicone 요청 헤더를 전달합니다.

전체 코드
```
import litellm
from litellm import completion

litellm.api_base = "https://oai.hconeai.com/v1"
litellm.headers = {"Helicone-Auth": f"Bearer {os.getenv('HELICONE_API_KEY')}"}

response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "how does a court case get to the Supreme Court?"}]
)

print(response)
```
