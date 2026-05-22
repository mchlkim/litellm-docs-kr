# /realtime - WebRTC 지원 {#realtime-webrtc-support}

브라우저/모바일 클라이언트에서 WebRTC를 통해 Realtime API에 연결합니다. LiteLLM은 인증을 처리하고, 오디오는 OpenAI/Azure로 직접 스트리밍됩니다.

**제공자:** OpenAI · Azure

:::info **WebRTC와 WebSocket**
- **WebSocket** (`/v1/realtime`) - 서버 간 통신
- **WebRTC** (`/v1/realtime/client_secrets` + `/v1/realtime/calls`) - 브라우저/모바일, 더 낮은 지연 시간
:::

## 동작 방식

LiteLLM은 토큰을 발급하고 SDP를 릴레이합니다. 오디오는 Proxy를 절대 거치지 않습니다.

```
Browser                  LiteLLM Proxy              OpenAI/Azure
  |                           |                          |
  |-- POST client_secrets --->|-- POST sessions -------->|
  |<-- encrypted_token -------|<-- ek_... ---------------|
  |-- POST calls [SDP+token] ->|-- POST calls ----------->|
  |<-- SDP answer ------------|<-- SDP answer -----------|
  |===== audio P2P direct ===============================>|
```

## Proxy 설정 {#proxy-setup}

```yaml
model_list:
  - model_name: gpt-4o-realtime
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-12-17
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```

**Azure:** `model: azure/gpt-4o-realtime-preview`, `api_key`, `api_base`.

```bash
litellm --config /path/to/config.yaml
```

## 클라이언트 사용법 {#client-사용법}

1. **토큰** - LiteLLM 키와 `{ model }`을 사용해 `POST /v1/realtime/client_secrets`를 호출합니다.
2. **WebRTC** - `RTCPeerConnection`을 만들고, 마이크와 데이터 채널 `oai-events`를 추가한 뒤, `Authorization: Bearer <token>` 및 `Content-Type: application/sdp`와 함께 SDP offer를 `POST /v1/realtime/calls`로 보냅니다.
3. **이벤트** - `session.update`와 기타 이벤트에는 데이터 채널을 사용합니다.

```javascript
const r = await fetch("http://proxy:4000/v1/realtime/client_secrets", {
  method: "POST",
  headers: { "Authorization": "Bearer sk-litellm-key", "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gpt-4o-realtime" }),
});
const token = (await r.json()).client_secret.value;

const pc = new RTCPeerConnection();
const audio = document.createElement("audio");
audio.autoplay = true;
pc.ontrack = (e) => (audio.srcObject = e.streams[0]);
const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
pc.addTrack(ms.getTracks()[0]);
const dc = pc.createDataChannel("oai-events");
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpRes = await fetch("http://proxy:4000/v1/realtime/calls", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/sdp" },
  body: offer.sdp,
});
await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });

dc.send(JSON.stringify({ type: "session.update", session: { instructions: "..." } }));
```

## 자주 묻는 질문 {#faq}

- **401 Token expired** - WebRTC offer를 만들기 직전에 새 토큰을 받으세요.
- **`/calls`에는 어떤 키를 사용하나요?** - 원본 키가 아니라 `client_secrets`에서 받은 암호화된 토큰을 사용합니다.
- **`model`을 전달하나요?** - 아니요. 토큰에 라우팅 정보가 인코딩됩니다.
- **Azure `api-version`** - `litellm_params`에 `api_version`을 설정하고 올바른 `api_base`를 사용하세요.
- **오디오가 없음** - 마이크 권한을 허용하고, `pc.ontrack`이 자동 재생 오디오를 설정하는지 확인하세요. 방화벽/WebRTC를 점검하고 콘솔을 확인하세요.
