# LLM 비용의 수수료/가격 마진

특정 공급자 또는 전체 공급자에 백분율 기반 또는 고정 금액 마진을 적용합니다. 내부 사용자에게 비용을 청구할 때 운영 오버헤드 비용을 더해야 하는 엔터프라이즈에 유용합니다.

## 이 기능을 사용할 때

Generative AI 플랫폼에 인프라 비용뿐 아니라 다양한 운영/아키텍처 오버헤드가 포함된다면, 총 LLM 비용에 추가 수수료 또는 마진을 적용하는 기능이 필요할 수 있습니다.

**일반적인 사용 사례:**
- **내부 비용 배부** - 내부 팀에 비용을 청구할 때 운영 오버헤드 비용 추가
- **비용 회수** - 인프라, 지원, 플랫폼 유지보수 비용 회수

## UI로 마진 설정

이 워크스루에서는 LiteLLM UI에서 공급자 마진을 추가하고 비용 breakdown을 확인하는 방법을 보여줍니다.

### 1단계: Settings로 이동

LiteLLM dashboard의 왼쪽 사이드바에서 **Settings**를 클릭합니다.

![Click Settings](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/a9a42382-1c93-4338-8c7e-c0ebc4ee239f/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=47,292)

### 2단계: Cost Tracking 열기

비용 설정 옵션에 접근하려면 **Cost Tracking**을 클릭합니다.

![Click Cost Tracking](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/c3ad52c0-1c8d-4be5-bd04-1e37ce186c8e/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=65,403)

### 3단계: Fee/Price Margin 선택

**Fee/Price Margin**을 클릭합니다. 이 섹션에서는 내부 과금과 비용 회수를 위해 LLM 비용에 수수료 또는 마진을 추가할 수 있습니다.

![Click Fee/Price Margin](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/0810c7bf-e927-4ab6-a55d-37c51d8c17af/ascreenshot.jpeg?tl_px=553,0&br_px=2618,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=551,220)

### 4단계: Provider Margin 추가

새 마진 설정을 만들려면 마진 추가 버튼을 클릭합니다.

![Click Add Provider Margin](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/8762b7d9-74e5-45eb-acc3-be0d9c5b799d/ascreenshot.jpeg?tl_px=553,2&br_px=2618,1155&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=929,277)

### 5단계: 공급자 선택

마진을 적용할 공급자를 선택하려면 검색 필드를 클릭합니다.

![Click search field](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/7ff01cdc-2749-43f3-a46f-4fd5543446e3/ascreenshot.jpeg?tl_px=507,0&br_px=2572,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,177)

모든 공급자에 마진을 적용하려면 전체 공급자 옵션을 선택하거나, Bedrock, OpenAI, Anthropic 같은 특정 공급자를 선택할 수 있습니다.

![Select Global](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/c9efe187-0995-45ae-9366-290cb20835a2/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=485,182)

이 예제에서는 공급자로 **Bedrock**을 선택합니다.

![Select Bedrock](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/ea1524ed-7217-4ee6-9beb-797e3ff08b3a/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1462&force_format=jpeg&q=100&width=1120.0)

### 6단계: 마진 타입 선택

마진 타입을 선택합니다. **Percentage-based**(예: 10% markup) 또는 **Fixed Amount**(예: 요청당 $0.001) 중 하나를 선택할 수 있습니다.

![Click Percentage-based](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/137ffea5-0a5e-445a-809f-a85d20701c87/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=355,259)

이 예제에서는 요청당 고정 수수료를 추가하기 위해 **Fixed Amount**를 선택합니다.

![Click Fixed Amount](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/56828562-2bae-4f69-b68e-13b1b6a03aa6/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=493,252)

### 7단계: 마진 값 입력

마진 값을 입력합니다. 이 예제에서는 요청당 $25 고정 수수료를 추가합니다.

![Enter margin value](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/80018d4b-0205-43a3-a534-9a0e39ddf139/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1462&force_format=jpeg&q=100&width=1120.0)

### 8단계: 마진 저장

설정을 저장하려면 마진 추가 버튼을 클릭합니다.

![Click Add Provider Margin](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/84a5bcb8-f475-4aef-83ec-f0b3b620613f/ascreenshot.jpeg?tl_px=553,206&br_px=2618,1359&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=636,276)

### 9단계: Playground에서 마진 테스트

요청을 보내 마진 설정을 테스트하려면 **Playground**로 이동합니다.

![Click Playground](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/cda7293a-2439-4301-bc44-211e6d6833a6/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=37,106)

모델을 선택하고 테스트 메시지를 보냅니다.

![Send test message](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/48c3e28e-a01a-483c-838d-2d1643f44be7/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1462&force_format=jpeg&q=100&width=1120.0)

메시지 필드에 프롬프트를 입력하고 제출합니다.

![Enter prompt](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/88963dbe-6bad-4aac-8bd3-7f4eac0dd995/ascreenshot.jpeg?tl_px=243,730&br_px=2308,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,451)

모델의 응답을 받게 됩니다.

![View response](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/1d69ef9c-cc22-40ad-8f10-f14a359d2fb6/ascreenshot.jpeg?tl_px=553,17&br_px=2618,1170&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=549,276)

### 10단계: 로그에서 비용 breakdown 보기

요청의 상세 비용 breakdown을 보려면 **로그**로 이동합니다.

![Click 로그](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/5cf6dd8b-0783-41ee-b23a-32f3424c2092/ascreenshot.jpeg?tl_px=0,99&br_px=2064,1252&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=32,276)

요청 세부 정보를 보려면 펼치기 아이콘을 클릭합니다.

![Click expand icon](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/3ae2900f-1515-4bb9-a4aa-328b43f13b61/ascreenshot.jpeg?tl_px=0,12&br_px=2064,1165&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=187,277)

### 11단계: 비용 breakdown 세부 정보 보기

마진을 포함해 총 비용이 어떻게 계산되었는지 보려면 **Cost Breakdown**을 클릭합니다.

![Click Cost Breakdown](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/8bce9050-58ca-4860-9e18-1b704e086cf4/ascreenshot.jpeg?tl_px=392,575&br_px=2457,1728&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,276)

비용 breakdown에는 추가된 마진 금액이 표시됩니다. 이 예제에서는 **+$25.00** 마진이 명확히 표시됩니다.

![View margin amount](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/c4a65d38-a47a-4634-baf2-608447a7d711/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=388,282)

총 비용은 기본 LLM 비용에 마진을 더한 값이며, 비용 구조를 투명하게 확인할 수 있습니다.

![View total cost](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/3b13550d-5255-4818-b3ee-3d4391991c13/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=384,323)

## 설정 파일로 마진 설정

`config.yaml` 파일에서 마진을 직접 설정할 수도 있습니다.

**1단계: config.yaml에 마진 설정 추가**

```yaml
# Apply margins to providers
litellm_settings:
  cost_margin_config:
    global: 0.05            # 5% global margin on all providers
    openai: 0.10            # 10% margin for OpenAI (overrides global)
    anthropic:
      fixed_amount: 0.001   # $0.001 fixed fee per request
```

**2단계: 프록시 시작**

```bash
litellm /path/to/config.yaml
```

설정된 공급자의 모든 비용 계산에 마진이 자동으로 적용됩니다.

## 마진 작동 방식

- 마진은 할인(설정된 경우) **이후**에 적용됩니다.
- 마진은 할인과 독립적으로 계산됩니다.
- 다음 방식을 사용할 수 있습니다.
  - **Percentage-based**: `{"openai": 0.10}` = 10% 마진
  - **Fixed amount**: `{"openai": {"fixed_amount": 0.001}}` = 요청당 $0.001
  - **Global**: `{"global": 0.05}` = 모든 공급자에 5% 마진(공급자별 마진이 없는 경우)
- 공급자별 마진은 전역 마진을 재정의합니다.
- 마진 정보는 비용 breakdown 로그에 추적됩니다.
- 마진 정보는 응답 헤더로 반환됩니다.
  - `x-litellm-response-cost-margin-amount` - USD 기준으로 추가된 총 마진
  - `x-litellm-response-cost-margin-percent` - 적용된 마진 백분율

## 마진 계산 예제

**예제 1: 백분율 마진만 사용**
```yaml
litellm_settings:
  cost_margin_config:
    openai: 0.10  # 10% margin
```
기본 비용이 $1.00이면 최종 비용 = $1.00 x 1.10 = $1.10

**예제 2: 고정 금액만 사용**
```yaml
litellm_settings:
  cost_margin_config:
    anthropic:
      fixed_amount: 0.001  # $0.001 per request
```
기본 비용이 $1.00이면 최종 비용 = $1.00 + $0.001 = $1.001

**예제 3: 공급자별 재정의가 있는 전역 마진**
```yaml
litellm_settings:
  cost_margin_config:
    global: 0.05   # 5% global margin
    openai: 0.10   # 10% margin for OpenAI (overrides global)
```
- OpenAI 요청: 10% 마진 적용
- 그 외 모든 공급자: 5% 마진 적용

## 할인과 함께 사용하는 마진

마진과 할인은 독립적으로 계산됩니다.

1. 기본 비용이 계산됩니다.
2. 할인이 적용됩니다(설정된 경우).
3. 할인된 비용에 마진이 적용됩니다.

**예제:**
```yaml
litellm_settings:
  cost_discount_config:
    openai: 0.05  # 5% discount
  cost_margin_config:
    openai: 0.10  # 10% margin
```

기본 비용이 $1.00인 경우:
- 할인 후: $1.00 x 0.95 = $0.95
- 마진 적용 후: $0.95 x 1.10 = $1.045

## 지원 프로바이더

마진은 LiteLLM이 지원하는 모든 공급자에 적용할 수 있으며, `global`을 사용해 모든 공급자에 적용할 수도 있습니다. 일반적인 예시는 다음과 같습니다.

- `global` - 모든 공급자에 적용(공급자별 마진이 없는 경우)
- `openai` - OpenAI
- `anthropic` - Anthropic
- `vertex_ai` - Google Vertex AI
- `gemini` - Google Gemini
- `azure` - Azure OpenAI
- `bedrock` - AWS Bedrock

전체 공급자 목록은 [LlmProviders](https://github.com/BerriAI/litellm/blob/main/litellm/types/utils.py) enum에서 확인하세요.
