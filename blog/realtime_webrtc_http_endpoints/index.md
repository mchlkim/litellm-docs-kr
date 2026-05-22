---
slug: realtime_webrtc_http_endpoints
title: "Realtime WebRTC HTTP 엔드포인트"
date: 2026-03-12T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM proxy를 사용해 OpenAI 스타일 WebRTC realtime을 HTTP로 라우팅합니다: client_secrets와 SDP exchange."
tags: [realtime, webrtc, proxy, openai]
hide_table_of_contents: false
---

import WebRTCTester from '@site/src/components/WebRTCTester';

브라우저/모바일 client에서 WebRTC로 Realtime API에 연결합니다. LiteLLM이 auth와 key 관리를 처리합니다.

{/* truncate */}

## 동작 방식

![WebRTC 흐름: 브라우저, LiteLLM Proxy, OpenAI/Azure](../../img/webrtc_flow.png)

**임시 token 생성 흐름**

![임시 token 흐름: 브라우저가 token을 요청하고, LiteLLM이 OpenAI에서 실제 token을 받아 encrypted token을 반환](../../img/ephemeral_token.png)


## Proxy 설정

```yaml
model_list:
  - model_name: gpt-4o-realtime
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-12-17
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```

**Azure:** `model: azure/gpt-4o-realtime-preview`, `api_key`, `api_base`를 사용합니다.

```bash
litellm --config /path/to/config.yaml
```

## live 테스트

<WebRTCTester />

## client 사용법

**1. Token 발급** - LiteLLM API key와 `{ model }`로 `POST /v1/realtime/client_secrets`를 호출합니다.

**2. WebRTC handshake** - `RTCPeerConnection`을 만들고, mic track을 추가한 뒤, data channel `oai-events`를 생성합니다. 이후 `Authorization: Bearer <encrypted_token>` 및 `Content-Type: application/sdp`로 SDP offer를 `POST /v1/realtime/calls`에 보냅니다.

**3. event 처리** - `session.update` 및 기타 event에는 data channel을 사용합니다.

<details>
<summary>전체 코드 예제</summary>

```javascript
// 1. Token
const r = await fetch("http://proxy:4000/v1/realtime/client_secrets", {
  method: "POST",
  headers: { "Authorization": "Bearer sk-litellm-key", "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gpt-4o-realtime" }),
});
const { client_secret } = await r.json();
const token = client_secret.value;

// 2. WebRTC
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

// 3. Events
dc.send(JSON.stringify({ type: "session.update", session: { instructions: "..." } }));
```

</details>

## FAQ

**Q: 401 token expired error가 발생하면 어떻게 하나요?**  
A: token은 short-lived입니다. WebRTC offer를 만들기 직전에 새 token을 발급받으세요.

**Q: `/v1/realtime/calls`에는 어떤 key를 사용해야 하나요?**  
A: raw API key가 아니라 `client_secrets`에서 받은 **encrypted token**을 사용하세요.

**Q: call을 만들 때 `model` parameter를 전달해야 하나요?**  
A: 아니요. encrypted token에 model을 포함한 모든 routing information이 이미 encoded되어 있습니다.

**Q: Azure `api-version` error는 어떻게 해결하나요?**  
A: 올바른 `api_base` 및 deployment 값과 함께 `litellm_params`에 올바른 `api_version`을 설정하세요. 또는 `AZURE_API_VERSION` environment variable로 설정할 수 있습니다.

**Q: audio가 나오지 않으면 어떻게 하나요?**  
A: 마이크 권한을 허용했는지 확인하고, `pc.ontrack`이 `autoplay`가 활성화된 audio element를 할당하는지 확인하세요. WebRTC traffic에 대한 network/firewall 설정을 확인하고, browser console에서 ICE 또는 SDP error를 살펴보세요.
