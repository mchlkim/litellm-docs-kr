# Search tools (관리자 UI) {#search-tools-admin-ui}

구성된 각 web search integration(`/v1/search`)을 호출할 수 있는 team과 virtual key를 제어하고, LiteLLM spend dashboard에서 team/key level 사용량을 확인합니다.


![](/img/ui-search-tools/step-01-go-to-search-tools-tab.png)

## Step 1: Tool 등록 {#step-1-register-tools}

**Search tools** page → tool 생성(name + provider + credentials).

![](/img/ui-search-tools/step-02-add-new-search-tool.png)

## Step 2: Team 허용 목록 {#step-2-team-allowlist}

**Teams** → team 생성/수정 → **Search Tool Settings** 열기 → team에 tool 추가.

![](/img/ui-search-tools/step-03-create-or-edit-team.png)
![](/img/ui-search-tools/step-04-open-search-tool-settings.png)
![](/img/ui-search-tools/step-05-add-search-tool-to-team.png)

## Step 3: Key(선택 사항, 더 엄격한 목록) {#step-3-key-optional-stricter-list}

**Virtual keys** → 해당 team용 key 생성/수정 → **Search Tool Settings**는 team list 안에 있어야 합니다(team list가 비어 있지 않은 경우).

![](/img/ui-search-tools/step-06-create-team-key.png)

## Step 4: Search 호출 {#step-4-call-search}

```bash
curl -sS -X POST "http://localhost:4000/v1/search/YOUR_SEARCH_TOOL_NAME" \
  -H "Authorization: Bearer YOUR_VIRTUAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "hello world", "max_results": 5}'
```

![](/img/ui-search-tools/step-07-open-usage-team-usage.png)

## Step 5: Spend 확인 {#step-5-see-spend}

**로그** → **Team ID** + **Public model / search tool** = `search_tool_name`으로 filter → **Cost** column 확인.

![](/img/ui-search-tools/step-08-select-team.png)
![](/img/ui-search-tools/step-09-see-search-tool-usage.png)

## 관련 문서 {#related}

- [Search provider 및 YAML](../search/index.md)
- [Proxy config(`search_tools` row)](./config_settings.md)
