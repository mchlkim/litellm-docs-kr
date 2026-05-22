import Image from '@theme/IdealImage';

# UI Spend Log 설정

관리자 UI에서 spend log 동작을 직접 설정할 수 있습니다. config 파일을 수정하거나 proxy를 재시작할 필요가 없습니다. config 업데이트가 어렵거나 긴 릴리스 절차가 필요한 cloud 배포에서 특히 유용합니다.

## 개요

이전에는 요청/응답 내용 저장 여부와 보존 기간 같은 spend log 옵션을 `proxy_config.yaml`의 `general_settings` 아래에 설정해야 했습니다. 값을 변경하려면 config를 수정하고 proxy를 재시작해야 했기 때문에, config에 쉽게 접근할 수 없거나 배포 절차 때문에 config 업데이트가 느린 cloud 환경 사용자에게 불편했습니다.

<Image img={require('../../img/ui_spend_logs_settings.png')} />

**UI Spend Log 설정**으로 다음을 수행할 수 있습니다.

- **spend log에 prompt 저장** - spend logs 테이블에 요청 및 응답 내용을 저장할지 켜거나 끕니다. 설정 변경 이후 생성되는 로그에만 적용됩니다.
- **보존 기간 설정** - 자동 정리 전까지 spend log를 얼마나 오래 보관할지 설정합니다(예: `7d`, `30d`).
- **변경 사항 즉시 적용** - proxy 재시작이 필요 없습니다. 저장하는 즉시 새 요청에 설정이 적용됩니다.

:::warning UI가 config를 덮어씁니다
UI에서 변경한 설정은 config 파일의 값을 **덮어씁니다**. 예를 들어 `general_settings`에서 `store_prompts_in_spend_logs`가 명시적으로 `false`여도, UI에서 켜면 prompt 저장이 활성화됩니다. 재배포 없이 런타임에서 제어하고 싶을 때 UI를 사용하세요.
:::

## 설정할 수 있는 항목

| 설정                         | 설명                                                                                                                                                                                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`Store Prompts in Spend 로그`** | 활성화하면 **새** spend log에 요청 메시지와 응답 내용이 저장되어 로그 UI에서 확인할 수 있습니다. 활성화 전에 생성된 로그에는 요청/응답 내용이 추가되지 않습니다. 비활성화하면 새 로그에는 메타데이터(예: token, cost, model)만 저장됩니다. |
| **`Retention Period`**            | spend log가 자동 삭제되기 전까지 유지되는 최대 기간입니다(예: `7d`, `30d`). 선택 사항이며, 설정하지 않으면 config 또는 기본 동작에 따라 로그가 보존됩니다.                                                                                                         |

[general_settings](./config_settings.md#general_settings---reference)의 config에서도 동일한 옵션(`store_prompts_in_spend_logs`, `maximum_spend_logs_retention_period`)을 설정할 수 있습니다. UI에서 설정한 값이 우선합니다.

## UI에서 Spend Log 설정하는 방법

### 1. 로그 페이지 열기

관리자 UI(예: `http://localhost:4000/ui` 또는 `PROXY_BASE_URL/ui`)로 이동한 다음 **로그**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/815f4ab2-4b8c-4dfe-be39-689fd6e12167/ascreenshot_eaaeba1507b441408e0df8bf94bc70cc_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/815f4ab2-4b8c-4dfe-be39-689fd6e12167/ascreenshot_666628f5e62443688a58b7cee7d7559b_text_export.jpeg)

### 2. 로그 설정 열기

로그 페이지에서 **Settings**(톱니바퀴) 아이콘을 클릭해 spend log 설정 패널을 엽니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/303077bd-80a0-4f3b-9dc1-4abb90af117f/ascreenshot_63f5dc21a545489ea9266f3bd3dc8455_text_export.jpeg)

### 3. prompt 저장 활성화(선택 사항)

새 요청의 요청/응답 내용을 저장하고 해당 로그 항목을 열 때 확인하고 싶다면 **`Store Prompts in Spend 로그`**를 켜세요. 이 설정은 활성화 이후 생성된 로그에만 영향을 줍니다. 기존 로그에는 요청/응답 내용이 추가되지 않습니다. 메타데이터(token, cost, model 등)만 필요하다면 꺼 둡니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/a25d0051-4b34-4270-99d6-6e8ae0d2936a/ascreenshot_374605862aad42c89a98da7bad910f58_text_export.jpeg)

### 4. 보존 기간 설정(선택 사항)

필요하면 **`Retention Period`**(예: `7d`, `30d`)를 설정해 자동 정리 전까지 spend log를 얼마나 오래 보관할지 제어합니다. config 옵션 `maximum_spend_logs_retention_period`와 같은 형식을 사용합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/87086197-b082-4339-b798-37410f47d9ac/ascreenshot_564da14f492540ae8b0b782cfedceff9_text_export.jpeg)

### 5. 설정 저장

**`Save Settings`**를 클릭합니다. 변경 사항은 새 요청에 즉시 적용되며 proxy 재시작은 필요 없습니다. 기존 로그는 업데이트되지 않습니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/8cfd82c1-0ff4-4561-a806-33a7998cf0fd/ascreenshot_673f6155b17f45ee9b80fabdfc42a4ee_text_export.jpeg)

### 6. 확인: 로그에서 요청과 응답 보기

**`Store Prompts in Spend 로그`**를 활성화한 뒤 proxy를 통해 새 요청을 보내고 해당 로그 항목(또는 설정 활성화 후 생성된 다른 로그)을 엽니다. 로그 상세 화면에 요청 및 응답 내용이 포함됩니다. 설정을 켜기 전에 존재하던 로그에는 이 내용이 없습니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/0fbec553-9a11-4f4f-8a1d-f969bb316c70/ascreenshot_62ecbcea97ea4a4abaa460d76e2cf924_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/30e7ea4d-2c03-4b96-88a9-eeee565eaf16/ascreenshot_c00ad6aa75b54b4988a1450647a76f6b_text_export.jpeg)

## 사용 사례

### Cloud 및 managed 배포

proxy가 managed 또는 cloud 환경에서 실행되는 경우 config가 별도 repo에 있거나 긴 릴리스가 필요하거나 다른 팀이 관리할 수 있습니다. UI를 사용하면 그 절차 없이 spend log 동작을 변경할 수 있습니다. 예를 들어 디버깅을 위해 prompt 저장을 켜거나 보존 기간을 설정할 수 있습니다.

### 디버깅용 빠른 토글

디버깅 중 새 요청의 요청/응답 내용을 확인하려면 **`Store Prompts in Spend 로그`**를 임시로 켜고, config 수정이나 재시작 없이 UI에서 다시 끄면 됩니다. 설정이 켜져 있는 동안 생성된 로그에만 해당 내용이 포함됩니다.

### 재배포 없는 보존 기간 조정

spend log 보존 기간을 조정합니다. 예를 들어 저장 공간을 줄이기 위해 짧게 하거나 규정 준수를 위해 늘릴 수 있습니다. 새 보존 기간과 cleanup job은 즉시 적용됩니다.

## 관련 문서

- [UI 로그 시작하기](./ui_logs.md) - 어떤 항목이 기록되는지와 config 기반 옵션 개요
- [Config Settings](./config_settings.md) - `general_settings`의 `store_prompts_in_spend_logs`, `disable_spend_logs`, `maximum_spend_logs_retention_period`
- [Spend 로그 삭제](./spend_logs_deletion.md) - 보존 기간과 cleanup 동작 방식
