import Image from '@theme/IdealImage';

# A2A Agent 비용 추적

LiteLLM은 A2A agent에 대한 사용자 지정 비용 추적 추가를 지원합니다. 다음을 설정할 수 있습니다.

- **쿼리당 고정 비용** - agent request마다 부과되는 고정 비용
- **입력/출력 토큰 기준 비용** - token 사용량 기반의 가변 비용

이를 통해 조직 전체의 agent 사용 비용을 추적하고 귀속할 수 있으며, team 또는 project별 agent call 지출을 쉽게 확인할 수 있습니다.

## 빠른 시작

### 1. Agents로 이동

사이드바에서 "Agents"를 클릭해 agent 관리 페이지를 엽니다.

![Agents로 이동](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/f9ac0752-6936-4dda-b7ed-f536fefcc79a/ascreenshot.jpeg?tl_px=208,326&br_px=2409,1557&force_format=jpeg&q=100&width=1120.0)

### 2. 새 Agent 생성

"+ Add New Agent"를 클릭해 생성 양식을 엽니다. 몇 가지 기본 정보를 입력해야 합니다.

- **Agent Name** - agent의 고유 식별자(API call에 사용)
- **Display Name** - UI에 표시되는 사람이 읽기 쉬운 이름

![Agent Name 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/f5bacfeb-67a0-4644-a400-b3d50b6b9ce5/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

![Display Name 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/6db6422b-fe85-4a8b-aa5c-39319f0d4621/ascreenshot.jpeg?tl_px=0,27&br_px=2617,1490&force_format=jpeg&q=100&width=1120.0)

### 3. Cost 설정 구성

아래로 스크롤한 뒤 "Cost 설정"을 클릭해 비용 설정 패널을 펼칩니다. 여기에서 agent 사용량에 얼마를 부과할지 정의합니다.

![Cost 설정 클릭](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/a3019ae8-629c-431b-b2d8-2743cc517be7/ascreenshot.jpeg?tl_px=0,653&br_px=2201,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=388,416)

### 4. Cost Per Query 설정

쿼리당 비용 금액을 달러 단위로 입력합니다. 예를 들어 `0.05`를 입력하면 이 agent로 보내는 각 request에 $0.05가 부과됩니다.

![Cost Per Query 설정](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/91159f8a-1f66-4555-a166-600e4bdecc68/ascreenshot.jpeg?tl_px=0,653&br_px=2201,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=372,281)

![비용 금액 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/2add2f69-fd72-462e-9335-1e228c7150da/ascreenshot.jpeg?tl_px=0,420&br_px=2617,1884&force_format=jpeg&q=100&width=1120.0)

### 5. Agent 생성

모든 설정을 마쳤으면 "Create Agent"를 클릭해 저장합니다. 이제 비용 추적이 활성화된 상태로 agent를 사용할 수 있습니다.

![Agent 생성](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/1876cf29-b8a7-4662-b944-2b86a8b7cd2e/ascreenshot.jpeg?tl_px=416,653&br_px=2618,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=706,523)

## 비용 추적 테스트

Playground를 통해 테스트 request를 보내 비용 추적이 동작하는지 확인합니다.

### 1. Playground로 이동

사이드바에서 "Playground"를 클릭해 대화형 테스트 인터페이스를 엽니다.

![Playground로 이동](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/7d5d8338-6393-49a5-b255-86aef5bf5dfa/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=41,98)

### 2. A2A Endpoint 선택

기본적으로 Playground는 채팅 완성 엔드포인트를 사용합니다. agent를 테스트하려면 "Endpoint Type"을 클릭하고 드롭다운에서 `/v1/a2a/message/send`를 선택합니다.

![Endpoint Type 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/4d066510-0878-4e0b-8abf-0b074fe2a560/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=325,238)

![A2A Endpoint 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/fe2f8957-4e8a-4331-b177-d5093480cf60/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=333,261)

### 3. Agent 선택

agent 드롭다운에서 방금 만든 agent를 선택합니다. 표시 이름으로 목록에 표시됩니다.

![Agent 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/8c7add70-fe72-48cb-ba33-9f53b989fcad/ascreenshot.jpeg?tl_px=0,150&br_px=2201,1381&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=287,277)

### 4. 테스트 메시지 전송

메시지를 입력하고 send를 누릅니다. 제안 프롬프트를 사용하거나 직접 작성할 수 있습니다.

![Message 전송](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/2c16acb1-4016-447e-88e9-c4522e408ea2/ascreenshot.jpeg?tl_px=15,653&br_px=2216,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,443)

agent가 응답하면 request가 설정한 비용과 함께 로깅됩니다.

![Agent 응답](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/2dcf7109-0be4-4d03-8333-ef45759c70c9/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=494,273)

## 로그에서 비용 보기

이제 비용이 실제로 추적되었는지 확인합니다.

### 1. 로그로 이동

사이드바에서 "로그"를 클릭해 최근 request를 모두 확인합니다.

![로그로 이동](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/c96abf3c-f06a-4401-ada6-04b6e8040453/ascreenshot.jpeg?tl_px=0,118&br_px=2201,1349&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=41,277)

### 2. 비용 귀속 확인

목록에서 agent request를 찾습니다. 비용 열에 설정한 금액이 표시됩니다. 이 비용은 request를 보낸 API key에 귀속되므로 team 또는 project별 지출을 추적할 수 있습니다.

![로그에서 비용 확인](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/1ae167ec-1a43-48a3-9251-43d4cb3e57f5/ascreenshot.jpeg?tl_px=335,11&br_px=2536,1242&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,277)

## 사용법 페이지에서 지출 확인

agent 수준 지출 분석을 보려면 관리자 UI의 Agent 사용법 탭으로 이동합니다.

### 1. Agent 사용법 접근

관리자 UI의 사용법 페이지(`PROXY_BASE_URL/ui/?login=success&page=new_usage`)로 이동한 뒤 **Agent 사용법** 탭을 클릭합니다.

<Image img={require('../img/agent_usage_ui_navigation.png')} />

### 2. Agent 분석 확인

Agent 사용법 대시보드는 다음을 제공합니다.

- **Agent별 총 지출**: 모든 agent의 집계 지출 확인
- **일별 지출 추이**: 시간에 따른 agent 지출 변화 확인
- **모델 사용량 분석**: 각 agent가 사용하는 model 파악
- **활동 지표**: agent별 request, token, 성공률 추적

<Image img={require('../img/agent_usage_analytics.png')} />

### 3. Agent로 필터링

특정 agent의 지출을 보려면 agent 필터 드롭다운을 사용합니다.

- 드롭다운에서 하나 이상의 agent ID 선택
- 필터링된 분석, 지출 로그, 활동 지표 확인
- 서로 다른 agent 간 지출 비교

<Image img={require('../img/agent_usage_filter.png')} />

## 비용 설정 옵션

가격 책정 모델에 따라 다음 옵션을 조합할 수 있습니다.

| 필드                         | 설명                                      |
| ----------------------------- | ----------------------------------------- |
| **쿼리당 비용($)**        | agent request마다 부과되는 고정 비용 |
| **입력 토큰당 비용($)**  | 처리된 입력 token당 비용 |
| **출력 토큰당 비용($)** | 생성된 출력 token당 비용 |

대부분의 사용 사례에서는 쿼리당 고정 비용이 가장 단순합니다. 입력/출력 길이에 따라 agent 비용이 크게 달라진다면 token 기반 가격 책정을 사용하세요.

## 관련 문서

- [A2A Agent Gateway](./a2a.md)
- [비용 추적](./proxy/cost_tracking.md)
