# Credential 사용량 추적

model이 [재사용 가능한 credential](./ui_credentials.md)에 연결되면 LiteLLM은 해당 model을 사용하는 모든 request에 credential name을 tag로 자동 주입합니다. 따라서 추가 설정 없이 credential 단위 spend와 usage를 추적할 수 있습니다.

## 동작 방식 {#how-it-works}

`litellm_credential_name`으로 model을 재사용 가능한 credential에 연결하면, 해당 model로 route되는 각 request에 `Credential: <name>` tag가 붙습니다(예: `Credential: xAI`). 이 tag는 `DailyTagSpend`로 전달되고 usage page의 **Tag** view에 표시되며, credential 기준으로 spend와 usage를 filter할 수 있습니다.

model에 연결된 credential이 없으면 동작은 변경되지 않으며 credential tag도 추가되지 않습니다.

## Credential 사용량 보기 {#viewing-credential-usage}

관리자 UI에서 **사용법 → Tag**로 이동한 뒤 `Credential: ` prefix가 붙은 tag를 확인합니다. 이 tag는 해당 credential을 사용한 모든 request의 누적 spend와 token usage를 나타냅니다.

## 관련 문서

- [LLM Credential 추가](./ui_credentials.md) - 재사용 가능한 credential을 만들고 model에 연결하는 방법
- [Tag Budget](./tag_budgets.md) - tag에 spend limit 설정
- [Tag Routing](./tag_routing.md) - tag 기반 request routing
