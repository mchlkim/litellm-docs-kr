import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# `Google AI Studio SDK`

Google AI Studio용 패스스루 엔드포인트입니다. 공급자별 엔드포인트를 네이티브 형식으로 호출합니다(변환 없음).

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ | `/generateContent` 엔드포인트의 모든 모델 지원 |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 최종 사용자 추적 | ❌ | [필요한 경우 알려주세요](https://github.com/BerriAI/litellm/issues/new) |
| 스트리밍 | ✅ | |


`https://generativelanguage.googleapis.com`를 `LITELLM_PROXY_BASE_URL/gemini`로 바꾸기만 하면 됩니다.

#### **예제 사용법**

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl 'http://0.0.0.0:4000/gemini/v1beta/models/gemini-1.5-flash:countTokens?key=sk-anything' \
-H 'Content-Type: application/json' \
-d '{
    "contents": [{
        "parts":[{
          "text": "The quick brown fox jumps over the lazy dog."
          }]
        }]
}'
```

</TabItem>
<TabItem value="js" label="Google GenAI JS SDK">

```javascript
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: "sk-1234", // litellm proxy API key
    httpOptions: {
        baseUrl: "http://localhost:4000/gemini", // http://<proxy-base-url>/gemini
    },
});

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Explain how AI works",
        });
        console.log(response.text);
    } catch (error) {
        console.error('Error:', error);
    }
}

// For streaming responses
async function main_streaming() {
    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: "Explain how AI works",
        });
        for await (const chunk of response) {
            process.stdout.write(chunk.text);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
// main_streaming();
```

</TabItem>
</Tabs>

Google AI Studio의 **모든** 엔드포인트를 지원합니다(스트리밍 포함).

[**모든 Google AI Studio 엔드포인트 보기**](https://ai.google.dev/api)

## 빠른 시작

Gemini [`/countTokens` 엔드포인트](https://ai.google.dev/api/tokens#method:-models.counttokens)를 호출해 보겠습니다.

1. 환경에 Gemini API 키 추가

```bash
export GEMINI_API_KEY=""
```

2. LiteLLM Proxy 시작

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

Google AI Studio 토큰 계산 엔드포인트를 호출해 보겠습니다.

```bash
http://0.0.0.0:4000/gemini/v1beta/models/gemini-1.5-flash:countTokens?key=anything' \
-H 'Content-Type: application/json' \
-d '{
    "contents": [{
        "parts":[{
          "text": "The quick brown fox jumps over the lazy dog."
          }]
        }]
}'
```


## 예제

`http://0.0.0.0:4000/gemini` 뒤의 모든 경로는 공급자별 라우트로 처리됩니다.

주요 변경 사항:

| **원래 엔드포인트**                                | **교체 대상**                  |
|------------------------------------------------------|-----------------------------------|
| `https://generativelanguage.googleapis.com`          | `http://0.0.0.0:4000/gemini` (LITELLM_PROXY_BASE_URL="http://0.0.0.0:4000")      |
| `key=$GOOGLE_API_KEY`                                 | `key=anything` (프록시에 가상 키가 설정되어 있으면 `key=LITELLM_VIRTUAL_KEY` 사용)                    |


### **예제 1: 토큰 계산** {#example-1-counting-tokens}

#### LiteLLM Proxy 호출 {#litellm-proxy-call}

```bash
curl http://0.0.0.0:4000/gemini/v1beta/models/gemini-1.5-flash:countTokens?key=anything \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{
        "parts":[{
          "text": "The quick brown fox jumps over the lazy dog."
          }],
        }],
      }'
```

#### 직접 Google AI Studio 호출 {#direct-google-ai-studio-call}

```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:countTokens?key=$GOOGLE_API_KEY \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{
        "parts":[{
          "text": "The quick brown fox jumps over the lazy dog."
          }],
        }],
      }'
```

### **예제 2: 콘텐츠 생성** {#example-2-generate-content}

#### LiteLLM Proxy 호출 {#litellm-proxy-call-1}

```bash
curl "http://0.0.0.0:4000/gemini/v1beta/models/gemini-1.5-flash:generateContent?key=anything" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{
        "parts":[{"text": "Write a story about a magic backpack."}]
        }]
       }' 2> /dev/null
```

#### 직접 Google AI Studio 호출 {#direct-google-ai-studio-call-1}

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GOOGLE_API_KEY" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{
        "parts":[{"text": "Write a story about a magic backpack."}]
        }]
       }' 2> /dev/null
```

### **예제 3: 캐싱**


```bash
curl -X POST "http://0.0.0.0:4000/gemini/v1beta/models/gemini-1.5-flash-001:generateContent?key=anything" \
-H 'Content-Type: application/json' \
-d '{
      "contents": [
        {
          "parts":[{
            "text": "Please summarize this transcript"
          }],
          "role": "user"
        },
      ],
      "cachedContent": "'$CACHE_NAME'"
    }'
```

#### 직접 Google AI Studio 호출 {#direct-google-ai-studio-call-2}

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=$GOOGLE_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
      "contents": [
        {
          "parts":[{
            "text": "Please summarize this transcript"
          }],
          "role": "user"
        },
      ],
      "cachedContent": "'$CACHE_NAME'"
    }'
```


## **예제 4: Veo로 동영상 생성** {#example-4-video-generation-with-veo}

LiteLLM 패스스루 라우트를 통해 Google의 Veo 모델로 동영상을 생성합니다.

[**→ 전체 Veo 동영상 생성 가이드**](../proxy/veo_video_generation.md)


## 고급 {#advanced}

사전 요구 사항
- [DB로 프록시 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 Google AI Studio 키를 제공하지 않으면서 Google AI Studio 엔드포인트를 계속 사용할 수 있게 하려면 이 방법을 사용하세요.

### 가상 키와 함께 사용 {#use-with-virtual-keys}

1. 환경 설정

```bash
export DATABASE_URL=""
export LITELLM_MASTER_KEY=""
export GEMINI_API_KEY=""
```

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

2. 가상 키 생성

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{}'
```

예상 응답

```bash
{
    ...
    "key": "sk-1234ewknldferwedojwojw"
}
```

3. 테스트


```bash
http://0.0.0.0:4000/gemini/v1beta/models/gemini-1.5-flash:countTokens?key=sk-1234ewknldferwedojwojw' \
-H 'Content-Type: application/json' \
-d '{
    "contents": [{
        "parts":[{
          "text": "The quick brown fox jumps over the lazy dog."
          }]
        }]
}'
```


### 요청 헤더로 `tags` 보내기 {#send-tags-in-request-headers}

`tags`를 LiteLLM DB와 로깅 콜백에서 추적하려면 이 방법을 사용하세요.

요청 헤더에 태그를 쉼표로 구분된 목록으로 전달합니다. 아래 예제에서는 다음 태그가 추적됩니다.

```
tags: ["gemini-js-sdk", "pass-through-endpoint"]
```

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl 'http://0.0.0.0:4000/gemini/v1beta/models/gemini-1.5-flash:generateContent?key=sk-anything' \
-H 'Content-Type: application/json' \
-H 'tags: gemini-js-sdk,pass-through-endpoint' \
-d '{
    "contents": [{
        "parts":[{
          "text": "The quick brown fox jumps over the lazy dog."
          }]
        }]
}'
```

</TabItem>
<TabItem value="js" label="Google GenAI JS SDK">

```javascript
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: "sk-1234",
    httpOptions: {
        baseUrl: "http://localhost:4000/gemini", // http://<proxy-base-url>/gemini
        headers: {
            "tags": "gemini-js-sdk,pass-through-endpoint",
        },
    },
});

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Explain how AI works",
        });
        console.log(response.text);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
```

</TabItem>
</Tabs>
