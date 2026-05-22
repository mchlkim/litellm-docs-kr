import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ✨ [Beta] 프로젝트 관리 UI

:::info

이 기능은 엔터프라이즈 기능입니다.
[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 체험을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

LiteLLM 관리자 UI에서 직접 프로젝트를 관리할 수 있습니다. 프로젝트는 조직 계층에서 팀과 키 사이에 위치하며, 특정 사용 사례나 애플리케이션에 대해 세밀한 액세스 제어와 예산 관리를 지원합니다.

:::info
프로젝트 관리는 베타 기능입니다. API와 UI는 변경될 수 있습니다. 전체 API 문서는 [Project Management](./project_management.md)를 참조하세요.
:::

## 개요

프로젝트를 사용하면 다음을 수행할 수 있습니다.

- 사용 사례 또는 애플리케이션별로 API 키 구성
- 프로젝트 수준의 예산 및 속도 제한 설정
- 프로젝트 수준의 지출 및 사용량 추적
- 각 프로젝트가 액세스할 수 있는 모델 제어
- 서로 다른 애플리케이션 또는 팀 간의 명확한 분리 유지

**계층 구조**: `Organizations > Teams > Projects > Keys`

프로젝트 API와 설정에 대한 자세한 내용은 [Project Management](./project_management.md)를 참조하세요.

## 사전 준비

- Admin 또는 Team Admin 액세스 권한
- 하나 이상의 팀 생성 완료(프로젝트는 팀에 속함)
- 로컬 또는 원격에서 실행 중인 LiteLLM 관리자 UI

## UI 설정에서 프로젝트 활성화

프로젝트를 만들기 전에 관리자 UI 설정에서 Projects 기능을 활성화해야 합니다.

### 단계 1: 관리자 설정 접근

관리자 UI로 이동합니다(예: `http://localhost:4000/ui/?login=success`).

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/b8de4dbf-a23b-4979-84a3-95fe17427b5a/ascreenshot_84dcb13b57a84fd589dff2d5af58adde_text_export.jpeg)

### 단계 2: 설정 메뉴 열기

상단 탐색 영역에서 **"New"** 버튼을 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/b8de4dbf-a23b-4979-84a3-95fe17427b5a/ascreenshot_447c8ea124f64d0eb18d3c9621f7cbbc_text_export.jpeg)

### 단계 3: 관리자 설정으로 이동

**"Admin Settings"**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/cc2ce9d9-d2d2-49f3-9fb8-c546fb8dfdcf/ascreenshot_fd792e9dbda24e7eb5cdb508c4f181f8_text_export.jpeg)

### 단계 4: UI 설정 열기

**"UI Settings New"**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/d667f4b4-300b-47c6-9d76-12e439519da6/ascreenshot_3f3db4df432843a48b53ae16b311e7df_text_export.jpeg)

### 단계 5: Projects 기능 활성화

토글을 클릭해 Projects 기능을 활성화합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/4819f76b-4855-4f5c-8c4b-b4c272399724/ascreenshot_9df0555ae6db425ab839d73485ee9b99_text_export.jpeg)

활성화되면 관리자 UI 탐색 영역에 Projects 섹션이 표시되며, 프로젝트를 만들고 관리할 수 있습니다.

## 프로젝트 생성 및 관리

Projects 기능을 활성화한 후 Projects 페이지에서 프로젝트를 만들 수 있습니다.

### 단계 1: Projects로 이동

사이드바에서 **"Projects New"**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/889e2e55-af7a-42f1-90d5-8bba8efaa986/ascreenshot_c42e33e2226c4e8b8e8ea83a7c8955e4_text_export.jpeg)

### 단계 2: 새 프로젝트 만들기

**"Create Project"**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/8ecb531c-8e96-443d-ba1d-1a9e04ba2da3/ascreenshot_74f1b3c1c1b84517ae51881a050df73a_text_export.jpeg)

### 단계 3: 프로젝트 이름 입력

**"Project Name"** 필드를 클릭하고 프로젝트 이름을 입력합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/83bf0612-2b19-4b28-ae02-bdb122dca4fa/ascreenshot_16ca328a71f04a79bb9641ab9c1ed6fe_text_export.jpeg)

### 단계 4: 팀 선택

이 프로젝트가 속할 팀을 선택합니다. 프로젝트는 팀 범위로 제한되므로 해당 팀에서 사용할 수 있는 모델과 기능에만 액세스할 수 있습니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/653c2f1e-5140-49b8-962f-a2b112f4834c/ascreenshot_7861310ad77d4859adcae789a9d51bd0_text_export.jpeg)

### 단계 5: 모델 액세스 설정

이 프로젝트가 액세스할 수 있는 모델을 선택합니다. 사용 가능한 모델은 팀에 허용된 모델 범위로 제한됩니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/401a5716-ea16-4744-866a-d0ed6007065d/ascreenshot_a936c3ca417a49b2b603c890dee9d0ea_text_export.jpeg)

### 단계 6: 프로젝트 생성

프로젝트를 저장하려면 **"Create Project"**를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/2f9f9ba1-df0b-4bef-b17c-77dfc38372f7/ascreenshot_933e4c1b119d43beb84161b94b17b764_text_export.jpeg)

## 사용 사례

### 팀 내 키 구성

팀 내 API 키를 사용 사례 또는 애플리케이션별로 구성합니다. 관련 키를 프로젝트로 함께 묶으면 예산, 모델 액세스, 권한을 개별 항목이 아니라 하나의 단위로 관리할 수 있습니다.

### 비용 배분

프로젝트를 서로 다른 비용 센터 또는 팀에 할당합니다. 프로젝트별 지출을 추적하고 비용을 담당 팀 또는 비즈니스 단위에 다시 배분할 수 있습니다.

### 기능 출시

새 기능 또는 실험적 사용 사례를 위한 전용 프로젝트를 만듭니다. 테스트 중에는 사용할 수 있는 모델을 제어하고 보수적인 속도 제한을 설정할 수 있습니다.

### 고객 세분화

플랫폼을 운영하는 경우 고객 세그먼트 또는 사용 사례별로 프로젝트를 만듭니다. 각 세그먼트에 대한 리소스 할당을 독립적으로 제어할 수 있습니다.

## 다음 단계

프로젝트를 만든 후에는 다음을 수행할 수 있습니다.

1. **API 키 생성** - 애플리케이션 사용을 위해 프로젝트 범위의 API 키 생성
2. **예산 설정** - [Project Management API](./project_management.md)를 통해 프로젝트 수준의 예산 한도 설정
3. **지출 추적** - 사용법 대시보드에서 프로젝트 수준의 지출 확인
4. **액세스 관리** - [Access Groups](./access_groups.md)를 사용하여 모델 및 MCP 서버 액세스 제어

## 관련 문서

- [Project Management API](./project_management.md) - 프로젝트에 대한 전체 API 참조
- [Access Groups](./access_groups.md) - 모델, MCP 서버, 에이전트에 대한 재사용 가능한 액세스 제어 정의
- [가상 키](./virtual_keys.md) - 프로젝트 범위의 API 키 생성 및 관리
- [Role-based Access Control](./access_control.md) - 조직, 팀, 사용자 역할
- [Spend 로그](./spend_logs_deletion.md) - 요청 수준의 상세 비용 및 사용량 추적
