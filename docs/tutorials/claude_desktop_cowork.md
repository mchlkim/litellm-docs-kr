# Claude Desktop (Cowork) 연동 {#claude-desktop-cowork-integration}

Claude Desktop 요청을 LiteLLM Proxy를 통해 라우팅하면 통합 로깅, 예산 제어, 모든 모델에 대한 접근을 사용할 수 있습니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/adb864c1f7c74de3bfc9584ca6d32080" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

---

## 빠른 참조 {#quick-reference}

| 설정 | 값 |
|---------|-------|
| Gateway URL | `<LITELLM_PROXY_BASE_URL>` |
| API Key | LiteLLM 가상 키 |

---

## 1단계: Developer Mode 활성화 {#step-1-enable-developer-mode}

Claude Desktop에서 **Help → Claude → Help**로 이동한 다음 **개발자 모드 활성화**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/64274593-33e6-4a7b-a7f3-a08f8aea8209/ascreenshot_8a9c909a978544888dafb6e0c7e3f468_text_export.jpeg)

---

## 2단계: Configure Third-Party Inference 열기 {#step-2-open-configure-third-party-inference}

**menu bar** 아이콘을 클릭해 Claude 메뉴를 엽니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/66110720-1f11-4a1f-8a0a-a59498bc3290/ascreenshot_c674301e5a4a4ecf8cf000bbbef55aa6_text_export.jpeg)

**Developer**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/2fcad657-4f8c-4dc2-b9ff-597de4e98030/ascreenshot_241063b192ae4c75996aaefdab991f13_text_export.jpeg)

**Configure Third-Party Inference…**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/dbb36dff-bbbe-4ddd-b30e-25b2c41bff47/ascreenshot_a7516b203052432f9a1d08cbe92cd214_text_export.jpeg)

---

## 3단계: LiteLLM Gateway URL과 API Key 입력 {#step-3-enter-your-litellm-gateway-url-and-api-key}

추론 설정 대화상자가 열립니다. **Gateway URL** 필드에 LiteLLM Proxy URL을 입력합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/2d0daa12-d874-42ca-bc3e-f38c27c701e4/ascreenshot_8c8be28828974c10ab53124fa13e67c3_text_export.jpeg)

```
https://your-litellm-proxy.com
```

다음으로 LiteLLM Dashboard에서 가상 API 키를 가져옵니다. **가상 키 → + Create New Key**로 이동해 키를 복사한 다음 **API Key** 필드에 붙여넣습니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/6a5b1233-de81-48be-8a17-e026d3dd9b49/ascreenshot_23dbd432db6d4f90ab5b0d598edd5a40_text_export.jpeg)

설정을 저장합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/70e429ad-9e42-4936-a691-725701e802bc/ascreenshot_ffc156c61ed44cb7989f417dc38233b6_text_export.jpeg)

---

## 4단계: 설정 확인 {#step-4-verify-your-setup}

Claude Desktop을 다시 시작합니다. 새 대화를 열고 메시지를 보냅니다. 이제 모든 요청이 LiteLLM Proxy를 통해 라우팅됩니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-04-22/9e72faf1-0b5e-49d5-8ac4-b64dcd2b2f94/ascreenshot_813a1b584a1f4523ab7f7702f5985be0_text_export.jpeg)

LiteLLM Dashboard의 **사용법**에서 트래픽이 흐르는지 확인할 수 있습니다. 가상 키에 연결된 요청이 표시되어야 합니다.

---

## 관련 문서 {#related}

- [LiteLLM 가상 키](../proxy/virtual_keys.md)
- [Cursor 연동](cursor_integration.md)
- [Claude Code 연동](claude_responses_api.md)
