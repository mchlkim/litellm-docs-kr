---
title: v1.69.0-stable - Batch API 로드 밸런싱
slug: v1.69.0-stable
date: 2025-05-10T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

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
docker.litellm.ai/berriai/litellm:main-v1.69.0-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.69.0.post1
```
</TabItem>
</Tabs>

## 주요 하이라이트

LiteLLM v1.69.0-stable에는 다음 주요 개선 사항이 포함되어 있습니다.

- **Batch API 모델 로드 밸런싱**: LiteLLM Managed Files를 사용해 여러 azure batch 배포 간에 쉽게 로드 밸런싱할 수 있습니다.
- **Email Invites 2.0**: LiteLLM에 온보딩된 신규 사용자에게 이메일 초대를 보낼 수 있습니다.
- **Nscale**: 유럽 규정을 준수하기 위한 LLM API입니다.
- **Bedrock /v1/messages**: Anthropic의 /v1/messages 형식으로 Bedrock Anthropic 모델을 사용할 수 있습니다.

## Batch API 로드 밸런싱

<Image 
img={require('../../img/release_notes/lb_batch.png')}
  style={{width: '100%', display: 'block', margin: '0 0 2rem 0'}}
/>


이번 릴리스에서는 LiteLLM Managed File 지원을 Batches에 추가했습니다. 다음 사용자에게 유용합니다.

- Proxy Admins: 사용자가 호출할 수 있는 Batch 모델을 이제 제어할 수 있습니다.
- Developers: batch .jsonl 파일을 만들 때 더 이상 Azure 배포 이름을 알 필요가 없습니다. LiteLLM 키가 접근할 수 있는 모델만 지정하면 됩니다.

장기적으로는 대부분의 팀이 `/chat/completions`, `/batch`, `/fine_tuning` 엔드포인트 전반에서 Files를 사용할 때 LiteLLM Managed Files를 표준 방식으로 쓰게 될 것으로 예상합니다.

[자세히 보기](https://docs.litellm.ai/docs/proxy/managed_batches)


## Email Invites

<Image 
  img={require('../../img/email_2_0.png')}
  style={{width: '100%', display: 'block', margin: '0 0 2rem 0'}}
/>

이번 릴리스에는 이메일 초대 연동에 다음 개선 사항이 포함되어 있습니다.
- 사용자 초대 및 키 생성 이벤트용 새 템플릿을 추가했습니다.
- SMTP 이메일 공급자 사용 관련 문제를 수정했습니다.
- Resend API를 네이티브로 지원합니다.
- Proxy Admins가 이메일 이벤트를 제어할 수 있습니다.

LiteLLM Cloud 사용자는 인스턴스에 이 기능을 활성화하려면 문의해 주세요.

[자세히 보기](https://docs.litellm.ai/docs/proxy/email)


## 신규 모델 / 업데이트된 모델
- **Gemini ([VertexAI](https://docs.litellm.ai/docs/providers/vertex#usage-with-litellm-proxy-server) + [Google AI Studio](https://docs.litellm.ai/docs/providers/gemini))**
    - 가격 및 컨텍스트 창 정보와 함께 `gemini-2.5-pro-preview-05-06` 모델을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10597)
    - 모든 Gemini 2.5 변형의 올바른 컨텍스트 창 길이를 설정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10690)
- **[Perplexity](../../docs/providers/perplexity)**: 
    - 새 Perplexity 모델을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10652) 
    - sonar-deep-research 모델 가격을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10537)
- **[Azure OpenAI](../../docs/providers/azure)**: 
  - azure_ad_token_provider 파라미터 전달 문제를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10694)
- **[OpenAI](../../docs/providers/openai)**:
    - 'file' 파라미터에서 pdf url을 지원하도록 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10640)
- **[Sagemaker](../../docs/providers/aws_sagemaker)**:
    - `sagemaker_chat` 공급자의 content length를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10607)
- **[Azure AI Foundry](../../docs/providers/azure_ai)**: 
    - 다음 모델의 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/9956)
        - DeepSeek V3 0324
        - Llama 4 Scout
        - Llama 4 Maverick
- **[Bedrock](../../docs/providers/bedrock)**: 
    - Bedrock Llama 4 모델의 비용 추적을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10582)
    - Bedrock의 Llama 4 모델용 템플릿 변환을 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10582)
    - /v1/messages 형식으로 Bedrock Anthropic 모델을 사용할 수 있도록 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10681)
    - /v1/messages 형식의 Bedrock Anthropic 모델에 스트리밍 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10710)
- **[OpenAI](../../docs/providers/openai)**: `o3` 모델의 `reasoning_effort` 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10591)
- **[Databricks](../../docs/providers/databricks)**:
    - Databricks가 external model을 사용하고 delta가 비어 있을 수 있는 문제를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10540)
- **[Cerebras](../../docs/providers/cerebras)**: Llama-3.1-70b 모델 가격 및 컨텍스트 창을 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10648)
- **[Ollama](../../docs/providers/ollama)**: 
    - custom price 비용 추적을 수정하고 'max_completion_token' 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10636)
    - JSON response format 사용 시 발생하는 KeyError를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10611)
- 🆕 **[Nscale](../../docs/providers/nscale)**: 
    - chat 및 image generation 엔드포인트 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10638)

## LLM API 엔드포인트
- **[Messages API](../../docs/anthropic_unified)**: 
    - 🆕 /v1/messages 형식으로 Bedrock Anthropic 모델을 사용할 수 있도록 지원을 추가하고 - [PR](https://github.com/BerriAI/litellm/pull/10681), 스트리밍 지원도 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10710)
- **[Moderations API](../../docs/moderations)**: 
    - /moderations API에서 LiteLLM UI credentials를 사용할 수 있도록 버그를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10723)  
- **[Realtime API](../../docs/realtime)**: 
    - websocket auth requests에서 scope의 'headers' 설정 및 무한 루프 문제를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10679)
- **[Files API](../../docs/proxy/litellm_managed_files)**:
    - Unified File ID 출력 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10713)
    - 모든 배포에 파일을 쓸 수 있도록 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10708)
    - 대상 모델 이름 검증을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10722)
- **[Batches API](../../docs/batches)**:
    - unified batch ID 지원을 완성했습니다. jsonl의 model을 배포 모델 이름으로 교체합니다. - [PR](https://github.com/BerriAI/litellm/pull/10719)
  - batches용 unified file ID(managed files) 베타 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10650)


## 비용 추적 / Budget 개선
- 버그 수정 - DB 비용 추적의 PostgreSQL Integer Overflow Error를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10697)

## 관리 엔드포인트 / UI
- **모델**
    - UI에서 모델을 편집할 때 model info가 덮어써지는 문제를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10726)
    - team admin 모델 업데이트 및 특정 모델을 사용하는 organization 생성 문제를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10539)
- **로그**:
  - 버그 수정 - 로그 Page에서 Request/Response 복사를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10720)
  - 버그 수정 - QA 로그 page에서 log가 포커스를 유지하지 않는 문제와 error logs의 텍스트 넘침을 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10725)
  - 쿼리 성능 개선을 위해 LiteLLM_Spend로그의 session_id에 인덱스를 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10727)
- **User Management**:
  - Python client library 및 CLI에 user management 기능을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10627)
  - 버그 수정 - 관리자 UI에서 SCIM token 생성 문제를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10628)
  - 버그 수정 - 존재하지 않는 verification tokens를 삭제하려 할 때 404 응답을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10605)

## 로깅 / Guardrail 연동
- **Custom Logger API**: v2 Custom Callback API(llm logs를 custom api로 전송)를 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10575), [시작하기](https://docs.litellm.ai/docs/proxy/logging#custom-callback-apis-async)
- **OpenTelemetry**:
  - OpenTelemetry가 genai semantic conventions를 따르도록 수정하고 TTS용 'instructions' param 지원을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10608)
- ** Bedrock PII**:
  - bedrock guardrails를 사용한 PII Masking 지원을 추가했습니다. - [시작하기](https://docs.litellm.ai/docs/proxy/guardrails/bedrock#pii-masking-with-bedrock-guardrails), [PR](https://github.com/BerriAI/litellm/pull/10608)
- **문서**:
  - StandardLoggingVectorStoreRequest 문서를 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10535)

## 성능 / 안정성 개선
- **Python 호환성**:
  - Python 3.11- 지원을 추가했습니다(datetime UTC 처리 수정). - [PR](https://github.com/BerriAI/litellm/pull/10701)
  - Windows에서 litellm import 중 발생하는 UnicodeDecodeError: 'charmap'을 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10542)
- **캐싱**:
  - embedding string caching result를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10700)
  - response_format을 사용하는 Gemini 모델의 cache miss를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10635)

## 일반 Proxy 개선
- **Proxy CLI**:
  - `litellm-proxy` CLI에 `--version` 플래그를 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10704)
  - 전용 `litellm-proxy` CLI를 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10578)
- **알림**:
  - DB 사용 시 Slack alerting이 동작하지 않는 문제를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10370)
- **Email Invites**:
  - 키 생성 시 이메일 전송 수정 사항과 Resend API 지원을 포함한 V2 Emails를 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10602)
  - 사용자 초대 이메일을 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10615)
  - 이메일 설정을 관리하는 엔드포인트를 추가했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10646)
- **일반**:
  - 중복 JSON logs가 발생하던 버그를 수정했습니다. - [PR](https://github.com/BerriAI/litellm/pull/10580)


## 신규 기여자
- [@zoltan-ongithub](https://github.com/zoltan-ongithub)가 [PR #10568](https://github.com/BerriAI/litellm/pull/10568)에서 첫 기여를 했습니다.
- [@mkavinkumar1](https://github.com/mkavinkumar1)가 [PR #10548](https://github.com/BerriAI/litellm/pull/10548)에서 첫 기여를 했습니다.
- [@thomelane](https://github.com/thomelane)가 [PR #10549](https://github.com/BerriAI/litellm/pull/10549)에서 첫 기여를 했습니다.
- [@frankzye](https://github.com/frankzye)가 [PR #10540](https://github.com/BerriAI/litellm/pull/10540)에서 첫 기여를 했습니다.
- [@aholmberg](https://github.com/aholmberg)가 [PR #10591](https://github.com/BerriAI/litellm/pull/10591)에서 첫 기여를 했습니다.
- [@aravindkarnam](https://github.com/aravindkarnam)가 [PR #10611](https://github.com/BerriAI/litellm/pull/10611)에서 첫 기여를 했습니다.
- [@xsg22](https://github.com/xsg22)가 [PR #10648](https://github.com/BerriAI/litellm/pull/10648)에서 첫 기여를 했습니다.
- [@casparhsws](https://github.com/casparhsws)가 [PR #10635](https://github.com/BerriAI/litellm/pull/10635)에서 첫 기여를 했습니다.
- [@hypermoose](https://github.com/hypermoose)가 [PR #10370](https://github.com/BerriAI/litellm/pull/10370)에서 첫 기여를 했습니다.
- [@tomukmatthews](https://github.com/tomukmatthews)가 [PR #10638](https://github.com/BerriAI/litellm/pull/10638)에서 첫 기여를 했습니다.
- [@keyute](https://github.com/keyute)가 [PR #10652](https://github.com/BerriAI/litellm/pull/10652)에서 첫 기여를 했습니다.
- [@GPTLocalhost](https://github.com/GPTLocalhost)가 [PR #10687](https://github.com/BerriAI/litellm/pull/10687)에서 첫 기여를 했습니다.
- [@husnain7766](https://github.com/husnain7766)가 [PR #10697](https://github.com/BerriAI/litellm/pull/10697)에서 첫 기여를 했습니다.
- [@claralp](https://github.com/claralp)가 [PR #10694](https://github.com/BerriAI/litellm/pull/10694)에서 첫 기여를 했습니다.
- [@mollux](https://github.com/mollux)가 [PR #10690](https://github.com/BerriAI/litellm/pull/10690)에서 첫 기여를 했습니다.
