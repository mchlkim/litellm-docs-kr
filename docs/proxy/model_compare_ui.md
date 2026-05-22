import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 모델 비교 Playground UI

대화형 Playground 인터페이스에서 여러 LLM 모델을 나란히 비교합니다. 모델 응답, 성능 지표, 비용을 평가해 사용 사례에 가장 적합한 모델을 판단할 수 있습니다.

이 기능은 **v1.80.0-stable 이상에서 사용할 수 있습니다**.

## 개요

Model Compare Playground UI를 사용하면 최대 3개의 서로 다른 LLM 모델을 동시에 나란히 비교할 수 있습니다. 모델, 파라미터, 테스트 프롬프트를 설정하고 지연 시간, 토큰 사용량, 비용 같은 상세 지표로 모델 응답을 평가하고 비교합니다.

<Image img={require('../../img/ui_model_compare_overview.png')} />

## 시작하기

### Model Compare UI 접속

#### 1. Playground로 이동

관리자 UI에서 Playground 페이지(`PROXY_BASE_URL/ui/?login=success&page=llm-playground`)로 이동합니다.

<Image img={require('../../img/ui_playground_navigation.png')} />

#### 2. Compare 탭으로 전환

Playground 인터페이스에서 **Compare** 탭을 클릭합니다.

## 설정

### 모델 설정

#### 1. 비교할 모델 선택

최대 3개의 모델을 동시에 비교할 수 있습니다. 각 비교 패널에서 다음을 수행합니다.

- 모델 드롭다운을 클릭해 사용 가능한 모델을 확인합니다.
- 설정된 엔드포인트에서 모델을 선택합니다.
- 모델은 LiteLLM 프록시 설정에서 로드됩니다.

<Image img={require('../../img/ui_model_compare_select_model.png')} />

#### 2. 모델 파라미터 설정

각 모델 패널은 개별 파라미터 설정을 지원합니다.

**기본 파라미터:**

- **Temperature**: 무작위성을 제어합니다(0.0~2.0).
- **Max Tokens**: 응답의 최대 토큰 수입니다.

**고급 파라미터:**

- 추가 모델별 파라미터를 설정하려면 "고급 파라미터 사용"(`Use Advanced Params`)을 활성화합니다.
- 선택한 모델/프로바이더에서 사용 가능한 모든 파라미터를 지원합니다.

<Image img={require('../../img/ui_model_compare_model_parameters.png')} />

#### 3. 모델 간 파라미터 적용

"Sync Settings Across 모델" 토글을 사용하면 일관된 테스트를 위해 모든 비교 패널에서 파라미터(태그, 가드레일, temperature, max tokens 등)를 동기화할 수 있습니다.

<Image img={require('../../img/ui_model_compare_sync_across_models.png')} />

### 가드레일

Playground에서 가드레일을 직접 설정하고 테스트합니다.

1. 모델 패널에서 가드레일 선택기를 클릭합니다.
2. 설정된 목록에서 하나 이상의 가드레일을 선택합니다.
3. 여러 모델이 가드레일 필터링에 어떻게 반응하는지 테스트합니다.
4. 모델 간 가드레일 동작을 비교합니다.

<Image img={require('../../img/ui_model_compare_guardrails_config.png')} />

### 태그

비교를 정리하고 필터링하기 위해 태그를 적용합니다.

1. 태그 드롭다운에서 태그를 선택합니다.
2. 태그는 다양한 테스트 시나리오를 분류하고 추적하는 데 도움이 됩니다.

<Image img={require('../../img/ui_model_compare_tags_config.png')} />

### Vector Stores

RAG(Retrieval Augmented Generation) 비교를 위해 vector store 검색을 설정합니다.

1. 드롭다운에서 vector store를 선택합니다.
2. 여러 모델이 검색된 컨텍스트를 어떻게 활용하는지 비교합니다.
3. 모델 간 RAG 성능을 평가합니다.

<Image img={require('../../img/ui_model_compare_vector_stores_config.png')} />

## 비교 실행

### 1. 프롬프트 입력

메시지 입력 영역에 테스트 프롬프트를 입력합니다. 다음을 사용할 수 있습니다.

- 모든 모델에 보낼 단일 메시지
- 빠른 테스트를 위한 추천 프롬프트
- 멀티턴 대화 구성

<Image img={require('../../img/ui_model_compare_enter_prompt.png')} />

### 2. 요청 전송

전송 버튼을 클릭하거나 Enter를 눌러 비교를 시작합니다. 선택한 모든 모델이 요청을 동시에 처리합니다.

### 3. 응답 확인

응답은 각 모델 패널에 나란히 표시되어 쉽게 비교할 수 있습니다.

- 응답 품질과 내용
- 응답 길이와 구조
- 모델별 형식

<Image img={require('../../img/ui_model_compare_responses.png')} />

## 비교 지표

각 비교 패널은 모델 성능 평가에 도움이 되는 상세 지표를 표시합니다.

### 첫 토큰까지 걸리는 시간(TTFT)

요청 제출부터 첫 토큰 수신까지의 지연 시간을 측정합니다. 값이 낮을수록 초기 응답이 빠릅니다.

### Token 사용량

- **Input Tokens**: 프롬프트/요청의 토큰 수
- **Output Tokens**: 모델 응답의 토큰 수
- **Reasoning Tokens**: 추론에 사용된 토큰 수(해당하는 경우, 예: o1 모델)

### 전체 지연 시간

스트리밍 시간을 포함해 요청부터 최종 응답까지 걸린 전체 시간입니다.

### 비용

LiteLLM 설정에서 비용 추적이 활성화되어 있으면 다음을 볼 수 있습니다.

- 요청당 비용
- 입력/출력 토큰별 비용 세부 내역
- 모델 간 비용 비교

<Image img={require('../../img/ui_model_compare_cost_metrics.png')} />

## 사용 사례

### 모델 선택

동일한 프롬프트에서 여러 모델을 비교해 특정 사용 사례에 가장 적합한 모델을 판단합니다.

- 응답 품질
- 응답 시간
- 비용 효율
- 토큰 사용량

### 파라미터 튜닝

최적 설정을 찾기 위해 모델별로 다른 파라미터 구성을 테스트합니다.

- Temperature 변화
- 최대 토큰 제한
- 고급 파라미터 조합

### 가드레일 테스트

여러 모델이 안전 필터와 가드레일에 어떻게 반응하는지 평가합니다.

- 필터 효과
- 오탐률
- 모델별 가드레일 동작

### A/B 테스트

태그와 여러 비교를 사용해 구조화된 A/B 테스트를 실행합니다.

- 모델 버전 비교
- 프롬프트 변형 테스트
- 기능 롤아웃 평가

---

## 관련 기능

- [Playground Chat UI](./ui.md) - 단일 모델 테스트 인터페이스
- [Model Management](./model_management.md) - 모델 설정 및 관리
- [가드레일](./guardrails/quick_start.md) - 안전 필터 설정
- [AI Hub](./ai_hub.md) - 조직 내 모델과 에이전트 공유
