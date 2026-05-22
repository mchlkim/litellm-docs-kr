import Image from '@theme/IdealImage';

# UI - Key와 Team의 Router Settings

Key와 team 수준에서 router settings를 구성해 라우팅 동작, fallback, retry 및 기타 router 설정을 세밀하게 제어합니다. 전역 설정에 영향을 주지 않고 특정 key 또는 team의 라우팅 동작을 사용자 지정할 수 있습니다.

## 개요

Key와 Team의 Router Settings를 사용하면 서로 다른 세분화 수준에서 router 동작을 구성할 수 있습니다. 이전에는 router settings를 전역으로만 구성할 수 있어서, 전체 프록시 인스턴스의 모든 요청에 동일한 라우팅 전략, fallback, timeout, retry 정책이 적용되었습니다.

이제 key 수준 및 team 수준 router settings로 다음을 수행할 수 있습니다.

- Key 또는 team별 **라우팅 전략 사용자 지정**(예: 우선순위가 높은 key에는 `least-busy`, 다른 key에는 `latency-based-routing` 사용)
- Key 또는 team별 **서로 다른 fallback chain 구성**
- Key별 또는 team별 **timeout 및 retry 정책 설정**
- Key 또는 team별 **서로 다른 안정성 설정** 적용(cooldown, 허용 실패 수)
- 특정 사용 사례에 필요할 때 **전역 설정 재정의**

<Image img={require('../../img/ui_granular_router_settings.png')} />

## 요약

Router settings는 **Keys > Teams > Global**의 **계층적 해석 순서**를 따릅니다. 요청이 들어오면:

1. **Key-level settings**를 먼저 확인합니다. 사용 중인 API key에 router settings가 구성되어 있으면 해당 설정을 적용합니다.
2. 그다음 **Team-level settings**를 확인합니다. Key가 team에 속하고 해당 team에 router settings가 있으면 key-level settings가 없을 때 그 설정을 사용합니다.
3. 마지막 fallback으로 **Global settings**를 사용합니다. Key나 team 설정을 찾지 못하면 프록시 구성의 전역 router settings를 적용합니다.

이 계층 구조는 가장 구체적인 설정이 우선하도록 보장합니다. 따라서 전역 수준에서는 합리적인 기본값을 유지하면서 개별 key 또는 team의 라우팅 동작을 세밀하게 조정할 수 있습니다.

## Router Settings 해석 방식

Router settings는 다음 우선순위로 해석됩니다.

### 해석 순서: Key > Team > Global

1. **Key-level router settings**(가장 높은 우선순위)
   - API key에 router settings가 직접 구성된 경우 적용됩니다.
   - 다른 모든 설정보다 우선합니다.
   - 개별 key 사용자 지정에 유용합니다.

2. **Team-level router settings**(중간 우선순위)
   - API key가 router settings를 가진 team에 속할 때 적용됩니다.
   - key-level settings가 없을 때만 사용됩니다.
   - Team 안의 여러 key에 일관된 설정을 적용할 때 유용합니다.

3. **Global router settings**(가장 낮은 우선순위)
   - 프록시 구성 파일 또는 데이터베이스에서 적용됩니다.
   - Key나 team 설정을 찾지 못했을 때 기본값으로 사용됩니다.
   - 이전에는 이 방식만 사용할 수 있었습니다.

## Router Settings 구성 방법

### Key용 Router Settings 구성

API key의 router settings를 구성하려면 다음 단계를 따릅니다.

1. [http://localhost:4000/ui/?login=success](http://localhost:4000/ui/?login=success)로 이동합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/61889da3-32de-4ebf-9cf3-7dc1db2fc993/ascreenshot_2492cf6d916a4ab98197cc8336e3a371_text_export.jpeg)

2. "+ Create New Key"를 클릭합니다(또는 기존 key를 편집합니다).

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/61889da3-32de-4ebf-9cf3-7dc1db2fc993/ascreenshot_5a25380cf5044b4f93c146139d84403a_text_export.jpeg)

3. "Optional Settings"를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/e5eb5858-1cc1-4273-90bd-19ad139feebd/ascreenshot_33888989cfb9445bb83660f702ba32e0_text_export.jpeg)

4. "Router Settings"를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/d9eeca83-1f76-4fcf-bf61-d89edf3454d3/ascreenshot_825c7993f4b24949aee9b31d4a788d8a_text_export.jpeg)

5. 원하는 router settings를 구성합니다. 예를 들어 fallback 모델을 구성하려면 "Fallbacks"를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/30ff647f-0254-4410-8311-660eef7ec0c4/ascreenshot_16966c8a0160473eb03e0f2c3b5c3afa_text_export.jpeg)

6. "fallback 구성을 시작할 모델 선택"(`Select a model to begin configuring fallbacks`)을 클릭하고 fallback chain을 구성합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/918f1b5b-c656-4864-98bd-d8c58924b6d9/ascreenshot_79ca6cd93be04033929f080e0c8d040a_text_export.jpeg)

### Team용 Router Settings 구성

Team의 router settings를 구성하려면 다음 단계를 따릅니다.

1. [http://localhost:4000/ui/?login=success](http://localhost:4000/ui/?login=success)로 이동합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/60a33a8c-2e48-4788-a1a2-e5bcffa98cca/ascreenshot_9e255ba48f914c72ae57db7d3c1c7cd5_text_export.jpeg)

2. "Teams"를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/60a33a8c-2e48-4788-a1a2-e5bcffa98cca/ascreenshot_070934fa9c17453987f21f58117e673b_text_export.jpeg)

3. "+ Create New Team"을 클릭합니다(또는 기존 team을 편집합니다).

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/6f964ce2-f458-4719-a070-1af444ad92f5/ascreenshot_10f427f3106a4032a65d1046668880bd_text_export.jpeg)

4. "Router Settings"를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/a923c4ae-29f2-42b5-93ae-12f62d442691/ascreenshot_144520f2dd2f419dad79dffb1579ec04_text_export.jpeg)

5. 원하는 router settings를 구성합니다. 예를 들어 fallback 모델을 구성하려면 "Fallbacks"를 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/b062ecfa-bf5b-4c99-93a1-84b8b56fdb4c/ascreenshot_ea9acbc4e75448709b64a22addfb4157_text_export.jpeg)

6. "fallback 구성을 시작할 모델 선택"(`Select a model to begin configuring fallbacks`)을 클릭하고 fallback chain을 구성합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/67ca2655-4e82-4f93-be9a-7244ad22640f/ascreenshot_4fdbed826cd546d784e8738626be835d_text_export.jpeg)

## 사용 사례

### Key별 서로 다른 라우팅 전략

사용 사례에 따라 서로 다른 라우팅 전략을 구성합니다.

- **우선순위가 높은 운영 key**: 최적 성능을 위해 `latency-based-routing` 사용
- **개발 key**: 단순성을 위해 `simple-shuffle` 사용
- **비용 민감 key**: 비용 최소화를 위해 `cost-based-routing` 사용

### Team 수준 일관성

Team의 모든 key에 일관된 router settings를 적용합니다.

- 안정성을 위해 team 전체 fallback chain 설정
- Team별 timeout 정책 구성
- Team 구성원 전체에 동일한 retry 정책 적용

### 전역 설정 재정의

특정 시나리오에서 전역 설정을 재정의합니다.

- 운영 key는 개발 key보다 더 엄격한 timeout 정책이 필요할 수 있습니다.
- 특정 team은 다른 fallback 모델이 필요할 수 있습니다.
- 개별 key에는 특정 사용 사례에 맞춘 retry 정책이 필요할 수 있습니다.

### 점진적 rollout

새 router settings를 전역 적용 전에 특정 key 또는 team에서 테스트합니다.

- 먼저 테스트 key에 새 라우팅 전략을 구성합니다.
- 전역 rollout 전에 작은 team에서 fallback chain을 검증합니다.
- 서로 다른 key에서 timeout 값을 A/B 테스트합니다.

## 관련 기능

- [Router Settings Reference](./config_settings.md#router_settings---reference) - 모든 router settings의 전체 참조
- [Load Balancing](./load_balancing.md) - 라우팅 전략과 load balancing 학습
- [Reliability](./reliability.md) - fallback, retry, 오류 처리 구성
- [Keys](./virtual_keys.md) - API key와 해당 설정 관리
- [Teams](./multi_tenant_architecture.md) - key를 team으로 구성
