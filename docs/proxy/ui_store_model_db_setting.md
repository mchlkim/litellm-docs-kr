import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DB에 모델 저장 설정

관리자 UI에서 모델 정의를 데이터베이스에 저장할지 바로 켜거나 끌 수 있습니다. config 파일을 수정하거나 proxy를 재시작할 필요가 없습니다. config 업데이트가 어렵거나 긴 릴리스 절차가 필요한 cloud 배포 환경에서 특히 유용합니다.

## 개요

이전에는 `store_model_in_db` 설정을 `proxy_config.yaml`의 `general_settings` 아래에서 구성해야 했습니다. 설정을 바꾸려면 config를 수정하고 proxy를 재시작해야 했기 때문에, config 파일에 직접 접근할 수 없거나 재시작으로 인한 downtime을 피하려는 cloud 사용자에게는 불편했습니다.

<Image img={require('../../img/ui_store_model_in_db.png')} />

**DB에 모델 저장 설정**으로 다음을 할 수 있습니다.

- **모델의 데이터베이스 저장 켜기 또는 끄기** – 모델 정의를 데이터베이스에 cache할지 제어합니다. config 파일 크기를 줄이고 확장성을 높이는 데 유용합니다.
- **변경 사항 즉시 적용** – proxy를 재시작할 필요가 없습니다. 저장하는 즉시 새 모델 작업에 설정이 적용됩니다.

:::warning UI 설정이 config보다 우선합니다
UI에서 변경한 설정은 config 파일의 값을 **override**합니다. 예를 들어 `general_settings`에서 `store_model_in_db`가 `false`로 설정되어 있어도, UI에서 이 설정을 켜면 모델 정의가 데이터베이스에 저장됩니다. 다시 배포하지 않고 runtime에서 제어하려면 UI를 사용하세요.
:::

## DB에 모델 저장 방식

`store_model_in_db`를 켜면 LiteLLM proxy가 `proxy_config.yaml`에만 의존하지 않고 모델 정의를 데이터베이스에 저장합니다. 이 방식에는 다음과 같은 장점이 있습니다.

- **config 크기 감소** – 모델 정의를 YAML 밖으로 옮겨 유지 관리를 쉽게 합니다.
- **확장성** – database 저장 방식은 큰 YAML 파일보다 확장에 유리합니다.
- **동적 업데이트** – config 파일을 수정하지 않고 모델을 추가하거나 업데이트할 수 있습니다.
- **영속성** – 모델 정의가 proxy instance와 재시작을 넘어 유지됩니다.

이 설정은 저장한 순간부터 모든 새 모델 작업에 적용됩니다.

## UI에서 DB에 모델 저장 구성하기

### 1. 모델 + Endpoints 설정에 접근

관리자 UI(예: `http://localhost:4000/ui` 또는 사용 중인 `PROXY_BASE_URL/ui`)로 이동한 뒤 **모델 + Endpoints** 페이지로 이동합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-22/55bc71f5-730f-4b2c-8539-8a4f46b8bd10/ascreenshot_0f7ba8f1c2694e94938996fd1b4adfcc_text_export.jpeg)

### 2. 설정 열기

navigation menu에서 **모델 + Endpoints**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-22/55bc71f5-730f-4b2c-8539-8a4f46b8bd10/ascreenshot_fc2b9e4812a9480087f4eb350fa0a792_text_export.jpeg)

### 3. 설정 icon 클릭

모델 + Endpoints 페이지에서 설정(gear) icon을 찾아 configuration panel을 엽니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-22/7b394364-c281-4db8-8cad-ee322c76c935/ascreenshot_d7c8a6b234bc4e4d92aa7f09aefb13d3_text_export.jpeg)

### 4. DB에 모델 저장 켜기 또는 끄기

필요에 따라 **DB에 모델 저장** 설정을 전환합니다.

- **켜짐**: 모델 정의가 데이터베이스에 저장됩니다.
- **꺼짐**: 모델을 config 파일에서만 읽습니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-22/54a263ec-ad67-4b16-ba9f-2be57c3e4cb8/ascreenshot_501abda2a6c847f79d085efce814265d_text_export.jpeg)

### 5. 설정 저장

변경 사항을 적용하려면 **Save Settings**를 클릭합니다. proxy 재시작은 필요하지 않으며, 새 설정은 이후 모델 작업에 즉시 적용됩니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-22/7d13559a-d4e4-41f7-993b-cb20fbfa1f6e/ascreenshot_3245f3c5bd0d43cb96c5f5ff0ccb461d_text_export.jpeg)

## 사용 사례

### Cloud 및 managed 배포

proxy가 managed 또는 cloud 환경에서 실행되는 경우 config가 별도 repo에 있거나, 긴 릴리스 주기가 필요하거나, 다른 team이 관리할 수 있습니다. UI를 사용하면 배포 절차를 거치지 않고 `store_model_in_db` 설정을 변경할 수 있습니다.

### 설정 복잡도 줄이기

수백 개의 모델이 있는 대규모 배포에서는 모델 정의를 데이터베이스에 저장하면 `proxy_config.yaml`의 크기와 복잡도를 줄일 수 있어 유지 관리와 version control이 쉬워집니다.

### 동적 모델 관리

config 파일을 수정하지 않고 동적으로 모델을 추가하고 업데이트하려면 `store_model_in_db`를 켭니다. team은 proxy를 다시 배포하지 않고 UI 또는 API를 통해 모델을 관리할 수 있습니다.

### downtime 없는 업데이트

UI에서 설정을 변경하면 즉시 적용됩니다. downtime을 최소화해야 하는 production 환경에 적합합니다.

## 관련 문서

- [관리자 UI 개요](./ui.md) – LiteLLM 관리자 UI 일반 guide
- [모델 and Endpoints](./model_management.md) – 모델 및 API endpoint 관리
- [Config Settings](./config_settings.md) – `general_settings`의 `store_model_in_db`
