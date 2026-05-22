import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP Toolsets

**Toolset**은 하나 이상의 MCP 서버에서 가져온 특정 도구들을 이름이 있는 묶음으로 구성한 것입니다. 에이전트에 모든 서버의 모든 도구 접근 권한을 주는 대신, 필요한 도구만 정확히 선택해 단일 이름 아래로 묶습니다.

## 동작 방식

```
                    ┌─────────────────────────────────┐
                    │         MCP Toolset              │
                    │      "devtooling-prod"           │
                    └────────────┬────────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
     ┌────────▼────────┐                  ┌────────▼────────┐
     │  CircleCI MCP   │                  │  DeepWiki MCP   │
     │  (10+ tools)    │                  │  (3 tools)      │
     └────────┬────────┘                  └────────┬────────┘
              │                                    │
    ┌─────────┴──────────┐              ┌──────────┴──────────┐
    │ ✓ get_build_logs   │              │ ✓ read_wiki_structure│
    │ ✓ find_flaky_tests │              │ ✓ read_wiki_contents │
    │ ✓ get_pipeline_    │              │ ✗ ask_question       │
    │   status           │              └─────────────────────┘
    │ ✓ run_pipeline     │
    │ ✗ list_followed_   │
    │   projects         │
    └────────────────────┘

        Agent sees exactly 6 tools, nothing more.
```

두 서버에 걸친 13개 이상의 도구 대신, 에이전트는 실제로 필요한 6개 도구만 받습니다.

**이 기능이 중요한 이유:**
- 더 작은 도구 목록 → 더 적은 토큰, 더 빠른 응답, 더 적은 hallucination
- GitHub + Linear + CircleCI 도구를 이름이 있는 하나의 권한 묶음으로 결합
- 현재 MCP 서버를 할당하는 방식과 동일하게 key 및 team에 할당

---

## toolset 생성

### 1. MCP 페이지로 이동

왼쪽 사이드바에서 **MCP**로 이동합니다.

![Navigate to MCP](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/1a96c713-6a37-4f96-92f1-07bd58c1973c/ascreenshot_23515f386ccc4597b0633987667fe01f_text_export.jpeg)

### 2. Toolsets 탭 열기

MCP 페이지에서 **Toolsets** 탭을 클릭합니다.

![Click Toolsets tab](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/65b6986b-595a-4b28-8fdc-a7b36bc76e59/ascreenshot_ca70c18fe7ec415486f96a6b405bf550_text_export.jpeg)

### 3. "New Toolset" 클릭

![New Toolset button](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/798c55c4-5d6b-4815-a642-70ac9f34f102/ascreenshot_3f144f54a1a944e28454239c837b4e6d_text_export.jpeg)

### 4. 이름 입력

toolset 이름을 입력합니다. 에이전트가 참조할 이름이므로 용도를 알 수 있게 지정하세요.

![Enter toolset name](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/62b412e0-d38f-44c3-99e4-3693f1512f6a/ascreenshot_b678c7c988a04f8b887b0f54c4dd95a7_text_export.jpeg)

![Toolset name field](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/ba5ebc95-cab7-470b-a7c9-21f12b9b01a3/ascreenshot_a602e982a2a44890a83dca64d61c38eb_text_export.jpeg)

### 5. 첫 번째 도구 추가

드롭다운에서 MCP 서버를 선택한 다음, 해당 서버에서 포함할 도구를 선택합니다.

![Select MCP server](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/2aa5bcba-6414-42e3-9813-efb0a9078e32/ascreenshot_58fbff35ba654210a1b4dc5452aa6bd9_text_export.jpeg)

![Choose server from dropdown](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/4fd9cffb-d3ba-461a-8679-89f278bf67ad/ascreenshot_b61e9e85a51b494a8d09fe61198d63e1_text_export.jpeg)

![Select tool from server](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/60718e72-2062-494b-9a23-456992c88cbd/ascreenshot_7a1f8eeab30a4a05ba39c450e5458b78_text_export.jpeg)

### 6. 두 번째 서버의 도구 추가

**Add Tool**을 클릭하고 다른 MCP 서버를 선택한 뒤 다른 도구를 선택합니다. 필요한 만큼 반복할 수 있으며, 도구는 여러 서버에서 가져올 수 있습니다.

![Add tool from second server](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/f34e0600-cc74-4b18-8794-88d45f326144/ascreenshot_98834b14ab9343e39fb503e458d72b7c_text_export.jpeg)

![Select second server](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/75150368-2202-4da1-99f1-6f0620e9b133/ascreenshot_f94d0bc08ea147348a9cf021cce7d854_text_export.jpeg)

![Select tool from second server](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/ed2cdf6e-025d-4d50-8b12-ed68745d5c51/ascreenshot_0c1c7f76524b46c5a056fda5e6956e2b_text_export.jpeg)

### 7. toolset 생성

**Create Toolset**을 클릭해 저장합니다.

![Create Toolset](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/021ca7b3-2d9a-49a0-8758-dae3dc3bcb4d/ascreenshot_14c6434e71114a6091e359a996f20e12_text_export.jpeg)

---

## Playground에서 toolset 사용

생성된 toolset은 Playground의 **MCP Servers** 드롭다운에 MCP 서버와 함께 표시되며, 같은 방식으로 선택할 수 있습니다.

### 1. Playground로 이동

![Navigate to Playground](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/f9d4aa4c-d98e-4767-b98e-aad2890e97ca/ascreenshot_d84239c441bb4e828f229d0c9e079e3f_text_export.jpeg)

![Click Playground](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/d8a07563-97fe-453a-b974-88da46c87294/ascreenshot_ea494300a536400abb2ea6bf3bdfd5ab_text_export.jpeg)

### 2. MCP Servers에서 toolset 선택

왼쪽 패널의 **MCP Servers** 아래에서 드롭다운을 열고 toolset을 선택합니다. 모델은 toolset에 포함한 도구만 볼 수 있습니다.

![Select MCP servers dropdown](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/ee8cb38c-c4ff-4b4b-844c-22f2e40832ae/ascreenshot_e300fb39cea0434fb5e3986e912a2b8d_text_export.jpeg)

![Open MCP server picker](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/8672070c-5d07-4f63-878c-6fc7dcbc9b65/ascreenshot_326ddd0868224c99a6fa5dab2d144f1f_text_export.jpeg)

![Select toolset](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/955826ad-2bbb-403e-ab26-c1ac03ec2675/ascreenshot_13f837ad53574535986ca7ca5998d34a_text_export.jpeg)

![Toolset selected and active](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/9a59c3b9-1563-4731-838f-1c35d636ddc9/ascreenshot_c05d8fa5f37a4b3093fc46e26f293b4d_text_export.jpeg)

이제 모델은 해당 toolset 안의 도구에만 접근할 수 있으며, 그 외 도구에는 접근할 수 없습니다.

---

## API로 toolset 사용

tools 목록의 `server_url`로 toolset route를 전달합니다. LiteLLM이 서버 측에서 이를 해석하므로 public URL은 필요하지 않습니다.

<Tabs>
<TabItem value="responses" label="Responses API">

```python
import openai

client = openai.OpenAI(
    api_key="your-litellm-key",
    base_url="http://your-proxy/v1",
)

response = client.responses.create(
    model="gpt-4o",
    input="What CI/CD tools do you have?",
    tools=[
        {
            "type": "mcp",
            "server_label": "devtooling-prod",
            "server_url": "litellm_proxy/mcp/devtooling-prod",
            "require_approval": "never",
        }
    ],
)
print(response.output_text)
```

</TabItem>
<TabItem value="chat" label="Chat Completions API">

```python
import openai

client = openai.OpenAI(
    api_key="your-litellm-key",
    base_url="http://your-proxy/v1",
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What CI/CD tools do you have?"}],
    tools=[
        {
            "type": "mcp",
            "server_label": "devtooling-prod",
            "server_url": "litellm_proxy/mcp/devtooling-prod",
            "require_approval": "never",
        }
    ],
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="rest" label="REST">

```bash
curl http://your-proxy/v1/responses \
  -H "Authorization: Bearer your-litellm-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "input": "What CI/CD tools do you have?",
    "tools": [
      {
        "type": "mcp",
        "server_label": "devtooling-prod",
        "server_url": "litellm_proxy/mcp/devtooling-prod",
        "require_approval": "never"
      }
    ]
  }'
```

</TabItem>
</Tabs>

---

## API로 toolset 관리

```bash
# List all toolsets
curl http://your-proxy/v1/mcp/toolset \
  -H "Authorization: Bearer your-litellm-key"

# Create a toolset
curl -X POST http://your-proxy/v1/mcp/toolset \
  -H "Authorization: Bearer your-litellm-key" \
  -H "Content-Type: application/json" \
  -d '{
    "toolset_name": "devtooling-prod",
    "description": "CircleCI + DeepWiki tools for the dev team",
    "tools": [
      {"server_id": "<circleci-server-id>", "tool_name": "get_build_failure_logs"},
      {"server_id": "<circleci-server-id>", "tool_name": "run_pipeline"},
      {"server_id": "<deepwiki-server-id>", "tool_name": "read_wiki_structure"}
    ]
  }'

# Delete a toolset
curl -X DELETE http://your-proxy/v1/mcp/toolset/<toolset_id> \
  -H "Authorization: Bearer your-litellm-key"
```
