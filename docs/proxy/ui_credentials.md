import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLM 자격 증명 추가 {#adding-llm-credentials}

UI에서 LLM 공급자 자격 증명을 추가할 수 있습니다. 자격 증명을 추가하면 새 모델을 추가할 때 재사용할 수 있습니다.

## 자격 증명 및 모델 추가 {#add-a-credential--model}

### 1. LLM Credentials 페이지로 이동 {#1-navigate-to-llm-credentials-page}

모델 -> LLM Credentials -> Add Credential로 이동합니다.

<Image img={require('../../img/ui_cred_add.png')} />

### 2. 자격 증명 추가 {#2-add-credentials}

LLM 공급자를 선택하고 API Key를 입력한 다음 "Add Credential"을 클릭합니다.

**참고: 자격 증명은 공급자를 기준으로 합니다. Vertex AI를 선택하면 `Vertex Project`, `Vertex Location`, `Vertex Credentials` 필드가 표시됩니다.**

<Image img={require('../../img/ui_add_cred_2.png')} />


### 3. 모델 추가 시 자격 증명 사용 {#3-use-credentials-when-adding-a-model}

Add Model -> Existing Credentials로 이동한 다음 드롭다운에서 자격 증명을 선택합니다.

<Image img={require('../../img/ui_cred_3.png')} />


## 기존 모델에서 자격 증명 생성 {#create-a-credential-from-an-existing-model}

이미 모델을 생성했으며 나중에 사용할 수 있도록 모델 자격 증명을 저장하려는 경우 이 방법을 사용합니다.

### 1. 자격 증명을 생성할 모델 선택 {#1-select-model-to-create-a-credential-from}

모델 -> Select your model -> Credential -> Create Credential로 이동합니다.

<Image img={require('../../img/ui_cred_4.png')} />

### 2. 모델 추가 시 새 자격 증명 사용 {#2-use-new-credential-when-adding-a-model}

Add Model -> Existing Credentials로 이동한 다음 드롭다운에서 자격 증명을 선택합니다.

<Image img={require('../../img/use_model_cred.png')} />

## 사용량 추적 {#usage-tracking}

재사용 가능한 자격 증명에 연결된 모델은 사용법 페이지에서 자동으로 추적됩니다. 각 요청에는 `Credential: <name>` 태그가 지정되고 **Tag** 보기에도 표시되므로 추가 설정 없이 자격 증명별 지출과 사용량을 필터링할 수 있습니다. 자세한 내용은 [Credential 사용법 Tracking](./credential_usage_tracking.md)을 참조하세요.

## 자주 묻는 질문 {#frequently-asked-questions}


자격 증명은 어떻게 저장되나요?
DB의 자격 증명은 `LITELLM_SALT_KEY`가 설정되어 있으면 이 값을 사용해 암호화/복호화됩니다. 설정되어 있지 않으면 `LITELLM_MASTER_KEY`를 사용해 암호화됩니다. 이 키는 비밀로 유지해야 하며 다른 사람과 공유하면 안 됩니다.

