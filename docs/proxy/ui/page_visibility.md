import Image from '@theme/IdealImage';

# 내부 사용자를 위한 페이지 표시 제어

LiteLLM UI에서 내부 사용자(관리자가 아닌 개발자)에게 표시할 탐색 탭과 페이지를 설정합니다.

이 기능을 사용하면 UI를 단순화하고 내부 사용자/개발자가 로그인할 때 볼 수 있는 페이지를 제어할 수 있습니다.

## 개요

기본적으로 내부 사용자가 접근할 수 있는 모든 페이지가 탐색 사이드바에 표시됩니다. 페이지 표시 제어를 사용하면 관리자가 내부 사용자에게 보이는 페이지를 제한하여 더 집중되고 간결한 경험을 제공할 수 있습니다.


## 페이지 표시 설정

### 1. 설정으로 이동

사이드바에서 **Settings** 아이콘을 클릭합니다.

![설정으로 이동](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/cbb6f272-ab18-4996-b57d-7ed4aad721ea/ascreenshot_ab80f3175b1a41b0bdabdd2cd3980573_text_export.jpeg)

### 2. Admin Settings로 이동

설정 메뉴에서 **Admin Settings**를 클릭합니다.

![Admin Settings로 이동](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/e2b327bf-1cfd-4519-a9ce-8a6ecb2de53a/ascreenshot_23bb1577b3f84d22be78e0faa58dee3d_text_export.jpeg)

### 3. UI Settings 선택

페이지 표시 제어에 접근하려면 **UI Settings**를 클릭합니다.

![UI Settings 선택](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/fff0366a-4944-457a-8f6a-e22018dde108/ascreenshot_0e268e8651654e75bb9fb40d2ed366a9_text_export.jpeg)

### 4. Page Visibility 설정 열기

설정 패널을 펼치려면 **Configure Page Visibility**를 클릭합니다.

![설정 열기](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/3a4761d6-145a-4afd-8abf-d92744b9ac9f/ascreenshot_23c16eb79c32481887b879d961f1f00a_text_export.jpeg)

### 5. 표시할 페이지 선택

내부 사용자에게 표시할 페이지의 체크박스를 선택합니다. 쉽게 탐색할 수 있도록 페이지는 카테고리별로 구성되어 있습니다.

![페이지 선택](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/b9c96b54-6c20-484f-8b0b-3a86decb5717/ascreenshot_3347ade01ebe4ea390bc7b57e53db43f_text_export.jpeg)

**사용 가능한 페이지 예시는 다음과 같습니다.**
- 가상 키
- Playground
- 모델 + Endpoints
- Agents
- MCP Servers
- Search Tools
- Vector Stores
- 로그
- Teams
- Organizations
- 사용법
- Budgets
- 기타...

### 6. 설정 저장

변경 사항을 적용하려면 **Save Page Visibility Settings**를 클릭합니다.

![설정 저장](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/8a215378-44f5-4bb8-b984-06fa2aa03903/ascreenshot_44e7aeebe25a477ba92f73a3ed3df644_text_export.jpeg)

### 7. 변경 사항 확인

이제 내부 사용자의 탐색 사이드바에는 선택한 페이지만 표시됩니다.

![변경 사항 확인](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/493a7718-b276-40b9-970f-5814054932d9/ascreenshot_ad23b8691f824095ba60256f91ad24f8_text_export.jpeg)

## 기본값으로 재설정

내부 사용자에게 모든 페이지를 다시 표시하려면 다음을 수행합니다.

1. Page Visibility 설정을 엽니다.
2. **`Reset to Default (All Pages)`**를 클릭합니다.
3. **Save Page Visibility Settings**를 클릭합니다.

이렇게 하면 제한이 제거되고 내부 사용자에게 접근 가능한 모든 페이지가 표시됩니다.

## API 설정

API를 사용해 프로그래밍 방식으로 페이지 표시를 설정할 수도 있습니다.

### 현재 설정 가져오기

```bash
curl -X GET 'http://localhost:4000/ui_settings/get' \
  -H 'Authorization: Bearer <your-admin-key>'
```

### 페이지 표시 업데이트

```bash
curl -X PATCH 'http://localhost:4000/ui_settings/update' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "enabled_ui_pages_internal_users": [
      "api-keys",
      "agents",
      "mcp-servers",
      "logs",
      "teams"
    ]
  }'
```

### 페이지 표시 제한 지우기

```bash
curl -X PATCH 'http://localhost:4000/ui_settings/update' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "enabled_ui_pages_internal_users": null
  }'
```
