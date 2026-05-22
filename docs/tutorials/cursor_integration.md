import Image from '@theme/IdealImage';

# Cursor 통합

통합 로깅, 예산 제어, 모든 모델 접근을 위해 Cursor IDE 요청을 LiteLLM을 통해 라우팅합니다.

:::info
**지원 모드:** Ask, Plan. Agent 모드는 아직 사용자 지정 API 키를 지원하지 않습니다.
:::

## 빠른 참조

| 설정 | 값 |
|---------|-------|
| Base URL | `<LITELLM_PROXY_BASE_URL>/cursor` |
| API Key | `LiteLLM Virtual Key` |
| Model | LiteLLM의 Public Model Name |

---

## 설정

### 1. Base URL 구성

**Cursor → Settings → Cursor Settings → 모델**을 엽니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/f725f154-588d-448d-a1d7-3c8bffaf3cf3/ascreenshot.jpeg?tl_px=0,0&br_px=1376,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=263,73)

**Override OpenAI Base URL**을 활성화하고 `/cursor`가 포함된 프록시 URL을 입력합니다.

```
https://your-litellm-proxy.com/cursor
```

![](https://colony-recorder.s3.amazonaws.com/files/2025-12-13/6580de2b-3a59-45b2-b7b6-3ab105d87e74/ascreenshot.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA2JDELI43356LVVTC%2F20251213%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Date=20251213T224156Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=5a1af4ff63d38d51e06d398ed50f10161d690e3e57e9d67c1d23ce5b7ffdefd5)

### 2. Virtual Key 생성

LiteLLM Dashboard에서 **가상 키 → + Create New Key**로 이동합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/1d8156bc-1b12-433f-936d-77f876142e3f/ascreenshot.jpeg?tl_px=0,0&br_px=1376,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=240,182)

키 이름을 지정하고 접근할 수 있는 모델을 선택합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/c45843db-b623-442b-b42b-3145ef3ba986/ascreenshot.jpeg?tl_px=0,151&br_px=1376,920&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=453,277)

**Create Key**를 클릭한 다음 즉시 복사합니다. 이 키는 다시 표시되지 않습니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/4022504d-fdba-4e17-b16e-bf8e935cbcad/ascreenshot.jpeg?tl_px=0,101&br_px=1376,870&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=512,277)

Cursor의 **OpenAI API Key** 필드에 붙여넣습니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/6b50fc92-9219-4868-aac2-a29d0c063e57/ascreenshot.jpeg?tl_px=251,235&br_px=1627,1004&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,276)

### 3. Custom Model 추가

Cursor Settings에서 **+ Add Custom Model**을 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/4e46538e-a876-44c4-a133-bdae664510f3/ascreenshot.jpeg?tl_px=192,8&br_px=1569,777&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,276)

LiteLLM Dashboard → 모델 + Endpoints에서 **Public Model Name**을 확인합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/2ee87f64-104a-4b37-8041-c92130a44896/ascreenshot.jpeg?tl_px=0,11&br_px=1376,780&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=331,277)

Cursor에 이름을 붙여넣고 토글을 활성화합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/5ab35f93-d417-423f-a359-9811ce18e2c3/ascreenshot.jpeg?tl_px=352,26&br_px=1728,795&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=786,277)

### 4. 테스트

`Cmd+L` / `Ctrl+L`로 **Ask** 모드를 열고 모델을 선택합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2025-12-13/d87ee25b-3c6d-4231-ba00-4d841d0612bc/ascreenshot.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA2JDELI43356LVVTC%2F20251213%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Date=20251213T223855Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=75316b8cd2d451f476232bd0ca459c4b6877e788637bf228bbd7d8b319fd1427)

메시지를 보냅니다. 이제 모든 요청이 LiteLLM을 통해 라우팅됩니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/05a5853a-58ed-44bf-a5c2-c14f9003eace/ascreenshot.jpeg?tl_px=0,151&br_px=1728,1117&force_format=jpeg&q=100&width=1120.0)

---

## MCP 서버 연결

LiteLLM Proxy를 통해 MCP 서버를 Cursor에 연결할 수도 있습니다.

Cursor에서 MCP 통합을 구성하는 공식 지침은 Cursor 문서를 참조하세요. [https://cursor.com/en-US/docs/context/mcp](https://cursor.com/en-US/docs/context/mcp)

1. Cursor Settings에서 "Tools & MCP" 탭으로 이동한 다음 "New MCP Server"를 클릭합니다.

2. `mcp.json`에 다음 구성을 추가합니다.

```
{
  "mcpServers": {
    "litellm": {
      "url": "http://localhost:4000/everything/mcp",
      "type": "http",
      "headers": {
        "Authorization": "Bearer sk-LITELLM_VIRTUAL_KEY"
      }
    }
  }
}
```

3. 이제 LiteLLM의 MCP가 Cursor의 "Installed MCP Servers" 아래에 표시됩니다.

<Image img={require('../../img/cursor_mcp_installed.png')} />

## 문제 해결

| 문제 | 해결 방법 |
|-------|----------|
| Model이 응답하지 않음 | Base URL이 `/cursor`로 끝나는지, 키에 모델 접근 권한이 있는지 확인합니다 |
| Auth 오류 | 키를 다시 생성하고 `sk-`로 시작하는지 확인합니다 |
| Agent 모드가 작동하지 않음 | 예상된 동작입니다. Ask 및 Plan 모드만 사용자 지정 키를 지원합니다 |
