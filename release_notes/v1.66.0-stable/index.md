---
title: v1.66.0-stable - Realtime API 비용 추적
slug: v1.66.0-stable
date: 2025-04-12T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

tags: ["sso", "unified_file_id", "cost_tracking", "security"]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 이 버전 배포하기

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.66.0-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.66.0.post1
```
</TabItem>
</Tabs>

v1.66.0-stable이 공개되었습니다. 이번 릴리스의 주요 내용은 다음과 같습니다.

## 주요 하이라이트
- **Realtime API 비용 추적**: Realtime API 호출 비용을 추적합니다.
- **Microsoft SSO 자동 동기화**: Azure Entra ID의 그룹과 그룹 멤버를 LiteLLM으로 자동 동기화합니다.
- **xAI grok-3**: `xai/grok-3` 모델 지원을 추가했습니다.
- **보안 수정**: [CVE-2025-0330](https://www.cve.org/CVERecord?id=CVE-2025-0330) 및 [CVE-2024-6825](https://www.cve.org/CVERecord?id=CVE-2024-6825) 취약점을 수정했습니다.

자세히 살펴보겠습니다.

## Realtime API 비용 추적

<Image 
  img={require('../../img/realtime_api.png')}
  style={{width: '100%', display: 'block'}}
/>


이번 릴리스는 Realtime API 로깅과 비용 추적을 추가합니다.
- **로깅**: LiteLLM은 이제 realtime 호출의 전체 응답을 모든 로깅 통합(DB, S3, Langfuse 등)에 기록합니다.
- **비용 추적**: 이제 realtime 모델에 대해 `base_model`과 커스텀 가격을 설정할 수 있습니다. [커스텀 가격](../../docs/proxy/custom_pricing)
- **예산**: 키/사용자/팀 예산이 realtime 모델에도 적용됩니다.

시작하려면 [여기](https://docs.litellm.ai/docs/realtime)를 확인하세요.



## Microsoft SSO 자동 동기화

<Image 
  img={require('../../img/release_notes/sso_sync.png')}
  style={{width: '100%', display: 'block'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  Azure Entra ID의 그룹과 멤버를 LiteLLM으로 자동 동기화합니다.
</p>

이번 릴리스는 Microsoft Entra ID의 그룹과 멤버를 LiteLLM과 자동 동기화하는 기능을 추가합니다. LiteLLM 프록시 관리자는 팀과 멤버 관리 시간을 줄일 수 있으며, LiteLLM이 다음 작업을 처리합니다.

- Microsoft Entra ID에 존재하는 팀을 자동 생성합니다.
- Microsoft Entra ID의 팀 멤버를 LiteLLM 팀과 동기화합니다.

시작하려면 [여기](https://docs.litellm.ai/docs/tutorials/msft_sso)를 확인하세요.


## 신규 모델 / 업데이트된 모델

- **xAI**
    1. `xai/grok-3-mini-beta`에 `reasoning_effort` 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/xai#reasoning-usage)
    2. `xai/grok-3` 모델 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9920)

- **Hugging Face**
    1. inference providers 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/huggingface#serverless-inference-providers)

- **Azure**
    1. `azure/gpt-4o-realtime-audio` 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9893)

- **VertexAI**
    1. `enterpriseWebSearch` 도구 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/vertex#grounding---web-search)
    2. Vertex AI 응답 스키마가 허용하는 키만 전달하도록 변경했습니다. [PR](https://github.com/BerriAI/litellm/pull/8992)

- **Google AI Studio**
    1. `gemini-2.5-pro` 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9837)
    2. `gemini/gemini-2.5-pro-preview-03-25` 가격을 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/9896)
    3. `file_data` 전달 처리를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/9786)

- **Azure**
    1. Azure Phi-4 가격을 업데이트했습니다. [PR](https://github.com/BerriAI/litellm/pull/9862)
    2. `azure/gpt-4o-realtime-audio` 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9893)

- **Databricks**
    1. 파라미터에서 `reasoning_effort`를 제거했습니다. [PR](https://github.com/BerriAI/litellm/pull/9811)
    2. Databricks 커스텀 엔드포인트 검사를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/9925)

- **General**
    1. LLM이 reasoning을 지원하는지 추적하는 `litellm.supports_reasoning()` 유틸을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/anthropic#reasoning)
    2. Function Calling에서 message tool calls의 pydantic base model을 처리하고, `tools = []`를 처리하며, `meta.llama3-3-70b-instruct-v1:0`의 tool calls에서 fake streaming을 지원합니다. [PR](https://github.com/BerriAI/litellm/pull/9774)
    3. LiteLLM Proxy에서 client sdk를 통해 `thinking` 파라미터를 litellm proxy로 전달할 수 있게 했습니다. [PR](https://github.com/BerriAI/litellm/pull/9386)
    4. LiteLLM의 `thinking` 파라미터 변환을 올바르게 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/9904)


## 비용 추적 개선 사항
- **OpenAI, Azure**
    1. spend logs의 토큰 사용량 메트릭과 함께 Realtime API 비용 추적을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/realtime)
- **Anthropic**
    1. Claude Haiku 캐시 읽기 토큰당 가격을 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/9834)
    2. `base_model`을 사용하는 Claude 응답 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9897)
    3. Anthropic prompt caching 비용 계산을 수정하고 DB에 기록되는 메시지를 줄였습니다. [PR](https://github.com/BerriAI/litellm/pull/9838)
- **General**
    1. spend logs에 토큰 추적과 log usage 객체를 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9843)
    2. 배포 단위 커스텀 가격 처리를 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9855)


## 관리 엔드포인트 / UI

- **Test Key Tab**
    1. test key 페이지에 Reasoning content, ttft, usage metrics 렌더링을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9931)

    <Image 
    img={require('../../img/release_notes/chat_metrics.png')}
    style={{width: '100%', display: 'block'}}
    />
    <p style={{textAlign: 'left', color: '#666'}}>
    입력, 출력, reasoning tokens, ttft metrics를 확인합니다.
    </p>
- **태그 / 정책 관리**
    1. Tag/Policy Management를 추가했습니다. 요청 메타데이터 기반 라우팅 규칙을 만들 수 있습니다. 이를 통해 `tags="private"` 요청이 특정 모델로만 이동하도록 강제할 수 있습니다. [시작하기](https://docs.litellm.ai/docs/tutorials/tag_management)

    <br />

    <Image 
    img={require('../../img/release_notes/tag_management.png')}
    style={{width: '100%', display: 'block'}}
    />
    <p style={{textAlign: 'left', color: '#666'}}>
    태그를 생성하고 관리합니다.
    </p>
- **재설계된 로그인 화면**
    1. 로그인 화면을 다듬었습니다. [PR](https://github.com/BerriAI/litellm/pull/9778)
- **Microsoft SSO 자동 동기화**
    1. 관리자가 SSO JWT 필드를 디버그할 수 있도록 debug route를 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9835)
    2. MSFT Graph API를 사용해 사용자를 팀에 할당하는 기능을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9865)
    3. litellm을 Azure Entra ID Enterprise Application에 연결했습니다. [PR](https://github.com/BerriAI/litellm/pull/9872)
    4. litellm SSO가 기본 팀을 생성할 때 관리자가 `default_team_params`를 설정할 수 있게 했습니다. [PR](https://github.com/BerriAI/litellm/pull/9895)
    5. MSFT SSO가 사용자 이메일에 올바른 필드를 사용하도록 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/9886)
    6. litellm SSO가 팀을 자동 생성할 때 Default Team 설정을 지정하는 UI 지원을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9918)
- **UI 버그 수정**
    1. 스크롤할 때 team, key, org, model 숫자 값이 바뀌지 않도록 했습니다. [PR](https://github.com/BerriAI/litellm/pull/9776)
    2. key와 team 업데이트가 UI에 즉시 반영되도록 했습니다. [PR](https://github.com/BerriAI/litellm/pull/9825)

## 로깅 / Guardrail 개선 사항

- **Prometheus**
    1. cron job 일정에 따라 Key 및 Team Budget 메트릭을 내보냅니다. [시작하기](https://docs.litellm.ai/docs/proxy/prometheus#initialize-budget-metrics-on-startup)

## 보안 수정

- [CVE-2025-0330](https://www.cve.org/CVERecord?id=CVE-2025-0330)을 수정했습니다. team exception handling에서 Langfuse API keys가 노출되던 문제입니다. [PR](https://github.com/BerriAI/litellm/pull/9830)
- [CVE-2024-6825](https://www.cve.org/CVERecord?id=CVE-2024-6825)를 수정했습니다. post call rules의 remote code execution 문제입니다. [PR](https://github.com/BerriAI/litellm/pull/9826)

## Helm

- litellm-helm chart에 service annotations를 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9840)
- helm deployment에 extraEnvVars를 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9292)

## Demo

데모 인스턴스에서 [바로 사용해 보세요](https://docs.litellm.ai/docs/proxy/demo).

## 전체 Git Diff

v1.65.4-stable 이후의 전체 git diff는 [여기](https://github.com/BerriAI/litellm/releases/tag/v1.66.0-stable)에서 확인할 수 있습니다.
