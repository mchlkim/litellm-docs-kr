import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# Coding Tool 사용량 추적

LiteLLM을 통해 Claude Code, Roo Code, Gemini CLI, OpenAI Codex 같은 AI 기반 coding tool의 사용량과 비용을 추적합니다.

User-Agent header를 사용해 각 coding tool의 request, 비용, user engagement metric을 모니터링합니다.

<Image 
  img={require('../../img/agent_1.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


## 대상 사용자

LiteLLM을 통해 개발자에게 coding tool 접근 권한을 제공하는 중앙 AI Platform team을 위한 문서입니다. tool engagement를 모니터링하고 개별 user의 사용 패턴을 추적할 수 있습니다.

## 추적할 수 있는 항목

### Summary Metrics
- coding tool별 비용
- tool별 성공한 request와 token 사용량

### User Engagement
- 각 User-Agent의 일간, 주간, 월간 active user 

## 빠른 시작

### 1. Coding Tool을 LiteLLM에 연결

적절한 User-Agent header와 함께 LiteLLM proxy를 통해 request를 보내도록 coding tool을 설정합니다.

**설정 guide:**
- [Claude Code에서 LiteLLM 사용](../../docs/tutorials/claude_responses_api)
- [Gemini CLI에서 LiteLLM 사용](../../docs/tutorials/litellm_gemini_cli)
- [OpenAI Codex에서 LiteLLM 사용](../../docs/tutorials/openai_codex)

### 2. User-Agent Header와 함께 Request 전송

coding tool이 API request에 식별 가능한 User-Agent header를 포함하는지 확인합니다.

### 3. LiteLLM 로그에서 추적 확인

log에서 예상한 User-Agent 값이 보이는지 확인해 LiteLLM이 request를 올바르게 추적하는지 검증합니다.

<Image 
  img={require('../../img/agent_2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

### 4. 사용량 Dashboard 보기

LiteLLM dashboard에서 집계된 usage metric과 user engagement data를 확인합니다.

#### Summary Metrics

각 coding tool의 총 비용과 성공한 request를 확인합니다.

<Image 
  img={require('../../img/agent_3.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

#### 일간, 주간, 월간 Active User

각 coding tool의 active user metric을 확인합니다.

<Image 
  img={require('../../img/agent_4.png')}
  style={{width: '80%', display: 'block', margin: '2rem auto'}}
/>

## LiteLLM이 Coding Tool을 식별하는 방식

LiteLLM은 들어오는 API request(`/chat/completions`, `/responses` 등)의 `User-Agent` header를 모니터링해 coding tool을 추적합니다. 고유한 각 User-Agent는 usage analytics에서 별도로 집계됩니다.

### 예제 Request

`claude-cli`를 User-Agent로 사용하는 예제입니다.

```shell
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -H "User-Agent: claude-cli/1.0" \
  -d '{"model": "claude-3-5-sonnet-latest", "messages": [{"role": "user", "content": "Hello, how are you?"}]}' \
  http://localhost:4000/chat/completions
```
