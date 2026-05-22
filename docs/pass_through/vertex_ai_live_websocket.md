# Vertex AI Live API WebSocket 패스스루

LiteLLM은 이제 Vertex AI Live API용 WebSocket 패스스루를 지원하여 Gemini 모델과 실시간 양방향 통신을 할 수 있습니다.

## 개요

Vertex AI Live API WebSocket 패스스루를 사용하면 다음을 수행할 수 있습니다.
- LiteLLM 프록시를 통해 Vertex AI Live API에 연결
- 기존 Vertex AI 인증 방식 사용
- 모든 WebSocket 메시지를 양방향으로 전달
- 텍스트, 오디오, 비디오, 멀티모달 상호작용 지원
- 모든 사용 유형의 비용을 자동으로 추적

## 설정

### 환경 변수

Vertex AI 인증을 위해 다음 환경 변수를 설정합니다.

```bash
# Required
DEFAULT_VERTEXAI_PROJECT=your-project-id
DEFAULT_VERTEXAI_LOCATION=us-central1

# Optional - use one of these for authentication
DEFAULT_GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR run: gcloud auth application-default login
```

### 설정 파일

또는 `config.yaml`에서 설정합니다.

```yaml
litellm_settings:
  default_vertex_config:
    vertex_project: "your-project-id"
    vertex_location: "us-central1"
    vertex_credentials: "os.environ/GOOGLE_APPLICATION_CREDENTIALS"
```

## 사용법

### WebSocket 엔드포인트

- `ws://your-proxy-host/v1/vertex-ai/live`
- `ws://your-proxy-host/vertex-ai/live`

### 쿼리 매개변수

- `project_id`(선택 사항): Google Cloud 프로젝트 ID(config에서 설정 가능)
- `location`(선택 사항): Vertex AI 위치(config에서 설정 가능, 기본값: us-central1)

### 연결 예제

```javascript
// If project_id and location are set in config, you can connect without query params
const ws = new WebSocket('ws://localhost:4000/v1/vertex-ai/live');

// Or specify them explicitly
const ws = new WebSocket('ws://localhost:4000/v1/vertex-ai/live?project_id=your-project-id&location=us-central1');
```

## 비용 추적

WebSocket 패스스루는 [Vertex AI 가격](https://cloud.google.com/vertex-ai/generative-ai/pricing#model-optimizer-pricing)을 기준으로 모든 사용 유형의 비용을 자동으로 추적합니다.

### 지원되는 비용 추적

- **텍스트**: 모델에 따라 문자 기반 또는 토큰 기반 가격 책정
- **오디오**: 오디오 입력/출력에 대한 초 단위 가격 책정
- **비디오**: 비디오 입력에 대한 초 단위 가격 책정
- **이미지**: 이미지 입력에 대한 이미지 단위 가격 책정

### 비용 계산

비용은 LiteLLM의 다른 Vertex AI 모델과 동일한 방식으로 계산됩니다.
- Gemini 모델에는 `cost_per_character` 사용
- 파트너 모델(Claude, Llama 등)에는 `cost_per_token` 사용
- 해당하는 경우 오디오, 비디오, 이미지 비용 포함

### 비용 로깅

비용은 다음 위치에 자동으로 기록됩니다.
- LiteLLM 프록시 로그
- 데이터베이스(설정된 경우)
- 지출 추적 시스템
- 관리자 대시보드

로그 출력 예제:
```
Vertex AI Live WebSocket session cost: $0.001234 (input: $0.000800, output: $0.000434) tokens: 150, characters: 1200, duration: 45.2s
```

## API 참조

### 설정 메시지

세션을 초기화하려면 먼저 이 메시지를 보냅니다.

```json
{
  "setup": {
    "model": "projects/your-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash-live-preview-04-09",
    "generation_config": {
      "response_modalities": ["TEXT"]
    }
  }
}
```

### 텍스트 입력

```json
{
  "client_content": {
    "turns": [
      {
        "role": "user",
        "parts": [{"text": "Hello! How are you?"}]
      }
    ],
    "turn_complete": true
  }
}
```

### 오디오 입력

```json
{
  "realtime_input": {
    "media_chunks": [
      {
        "data": "base64-encoded-audio-data",
        "mime_type": "audio/pcm"
      }
    ]
  }
}
```

## 지원되는 기능

### 응답 모달리티

- **TEXT**: 텍스트 응답
- **AUDIO**: 음성 합성이 포함된 오디오 응답

### 도구

- **Function Calling**: 사용자 지정 함수 정의 및 사용
- **Code Execution**: Python 코드 실행
- **Google Search**: 웹 검색
- **Voice Activity Detection**: 사용자가 말하는 시점 감지

### 고급 기능

- **Audio Transcription**: 입력 및 출력 오디오 전사
- **Proactive Audio**: 관련이 있을 때만 모델 응답
- **Affective Dialog**: 감정 표현 이해

## 예제

### Python 클라이언트

```python
import asyncio
import json
import websockets

async def chat_with_gemini():
    uri = "ws://localhost:4000/v1/vertex-ai/live?project_id=your-project-id"
    
    async with websockets.connect(uri) as websocket:
        # Setup
        setup = {
            "setup": {
                "model": "projects/your-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash-live-preview-04-09",
                "generation_config": {"response_modalities": ["TEXT"]}
            }
        }
        await websocket.send(json.dumps(setup))
        
        # Wait for setup response
        response = await websocket.recv()
        print(f"Setup: {response}")
        
        # Send message
        message = {
            "client_content": {
                "turns": [{"role": "user", "parts": [{"text": "Hello!"}]}],
                "turn_complete": True
            }
        }
        await websocket.send(json.dumps(message))
        
        # Receive response
        async for response in websocket:
            print(f"Response: {response}")
            # Check if turn is complete
            data = json.loads(response)
            if data.get("serverContent", {}).get("turnComplete"):
                break

asyncio.run(chat_with_gemini())
```

### JavaScript 클라이언트

```javascript
const ws = new WebSocket('ws://localhost:4000/v1/vertex-ai/live?project_id=your-project-id');

ws.onopen = function() {
    // Send setup
    const setup = {
        setup: {
            model: "projects/your-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash-live-preview-04-09",
            generation_config: { response_modalities: ["TEXT"] }
        }
    };
    ws.send(JSON.stringify(setup));
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
    
    // Check if setup is complete
    if (data.setupComplete) {
        // Send a message
        const message = {
            client_content: {
                turns: [{ role: "user", parts: [{ text: "Hello!" }] }],
                turn_complete: true
            }
        };
        ws.send(JSON.stringify(message));
    }
};
```

## 오류 처리

WebSocket 연결은 다음 코드와 함께 종료될 수 있습니다.

- `4001`: Vertex AI 사용자 인증 정보가 설정되지 않음
- `4002`: 프로젝트 ID가 제공되지 않음
- `1011`: 내부 서버 오류

## 인증

WebSocket 패스스루는 다른 LiteLLM 엔드포인트와 동일한 인증을 사용합니다.

1. **API 키**: `Authorization: Bearer your-api-key` 헤더 전달
2. **Vertex AI 사용자 인증 정보**: 환경 변수 또는 config 파일 설정

## 제한 사항

- Vertex AI API가 활성화된 유효한 Google Cloud 프로젝트 필요
- WebSocket 연결은 서버 재시작 후 유지되지 않음
- Google Cloud 할당량에 따라 속도 제한 적용

## 문제 해결

### 자주 발생하는 문제

1. **인증 오류**: Vertex AI 사용자 인증 정보가 올바르게 설정되었는지 확인합니다.
2. **프로젝트를 찾을 수 없음**: 프로젝트 ID가 존재하고 Vertex AI가 활성화되어 있는지 확인합니다.
3. **연결 거부됨**: LiteLLM 프록시 서버가 실행 중인지 확인합니다.

### 디버그 모드

자세한 연결 정보를 보려면 디버그 로깅을 활성화합니다.

```bash
export LITELLM_LOG=DEBUG
```

## 관련 문서

- [Vertex AI Live API 참조](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-live)
- [LiteLLM 프록시 설정](../proxy/)
- [Vertex AI 패스스루 엔드포인트](./vertex_ai.md)
