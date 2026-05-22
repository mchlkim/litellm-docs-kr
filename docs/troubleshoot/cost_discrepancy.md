# 비용 불일치 디버깅

LiteLLM과 provider 청구서 사이의 비용 불일치는 보통 세 영역 중 하나에서 발생합니다. token ingestion, LiteLLM이 적용하는 cost formula, 또는 model map의 오래되었거나 잘못된 pricing입니다. 이 페이지에서는 현재 상황이 어느 경우에 해당하는지 판별하는 절차를 설명합니다.

## 1단계: 시간 범위 선택 {#step-1-choose-a-time-range}

불일치가 확인되는 특정 기간을 고정합니다.

- 가능하면 최소 7일 이상의 데이터를 사용하세요.
- 일회성 급증이 비교 결과를 좌우하지 않도록 사용량이 안정적인 기간을 선택하세요.
- provider dashboard와 LiteLLM UI 양쪽에 **동일한 시작/종료 시간**을 설정하세요.

<img alt="LiteLLM dashboard 날짜 범위 선택기" src="/img/cost-discrepancy-debug/date-range-picker.png" />

## 2단계: traffic이 LiteLLM만 통과하는지 확인 {#step-2-confirm-traffic-only-goes-through-litellm}

request 중 일부가 LiteLLM을 우회해 provider를 직접 호출하면 provider 쪽 usage가 더 높게 표시됩니다. 이는 예상 동작이며 LiteLLM bug가 아닙니다.

계속하기 전에 다음을 확인하세요.

- 모든 client가 LiteLLM proxy base URL을 사용합니다.
- 비교 중인 model에 대해 어떤 SDK나 script도 provider API key로 provider를 직접 호출하지 않습니다.
- 선택한 기간 동안 해당 model은 LiteLLM을 통해서만 호출됩니다.

확실하지 않다면 전체 account와 비교하지 말고, LiteLLM이 사용하는 API key 또는 IAM principal로 provider dashboard를 필터링하세요.

## 3단계: token category 비교 {#step-3-compare-token-categories}

LiteLLM UI에서 **Model activity**(usage analytics 아래)를 열어 model별 spend와 token을 확인합니다.

<img alt="LiteLLM UI에서 Model activity로 이동" src="/img/cost-discrepancy-debug/go-to-model-activity.png" />

**Model** list를 scroll해 provider bill과 대조할 model을 선택합니다.

<img alt="Model activity 표에서 대상 model까지 scroll" src="/img/cost-discrepancy-debug/scroll-to-model.png" />

양쪽에 동일한 time range를 적용한 뒤 다음 표를 채웁니다.

| 항목 | LiteLLM | Provider | 차이 |
| --- | --- | --- | --- |
| 총 request 수 | — | — | — |
| Input token | — | — | — |
| Output token | — | — | — |
| Cache read token | — | — | — |
| Cache write token | — | — | — |

LiteLLM은 선택한 model에 대해 prompt, completion, cache-related token 같은 category별 token usage를 표시합니다.

<img alt="token category별 LiteLLM 사용량 breakdown" src="/img/cost-discrepancy-debug/token-categories.png" />

같은 기간에 대해 provider usage view(예: AWS billing tools, Azure Monitor, OpenAI usage dashboard)의 수치와 비교하세요.

### Cache token 보고 {#cache-token-reporting}

- **OpenAI:** Cache read token은 보통 보고된 input token count 안에 포함됩니다.
- **Anthropic:** Cache read token은 non-cached input token과 별도로 보고되는 경우가 많습니다.

dashboard마다 "input"을 다르게 해석할 수 있으므로 양쪽의 올바른 column을 비교하세요.

### 왜 10% threshold를 사용하나요? {#why-use-a-10-threshold}

Provider dashboard와 LiteLLM은 동일한 timestamp 기준으로 request를 bucket하지 않습니다. 오후 11:59의 call이 양쪽에서 서로 다른 일별 total에 들어갈 수 있습니다. SDK와 API 간 rounding 때문에 token count가 약간 다를 수도 있습니다. **약 10% 미만**의 delta는 boundary effect와 rounding으로 설명되는 경우가 많습니다. **약 10% 초과**의 delta는 대개 어떤 값이 잘못 count되었거나, drop되었거나, 다르게 categorize되었다는 의미입니다.

## 4단계: 맞는 path 따라가기 {#step-4-follow-the-right-path}

<svg width="100%" viewBox="0 0 680 482" role="img" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', fontFamily: 'system-ui, sans-serif' }} aria-labelledby="cost-disc-flow-title">
  <title id="cost-disc-flow-title">비용 불일치 디버깅 flowchart</title>
  <desc>Path A(token ingestion) 또는 Path B로 나뉘고, Path B는 다시 B1(formula issue)과 B2(model map issue)로 나뉘는 flowchart입니다.</desc>
  <defs>
    <marker id="cd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </marker>
  </defs>

  <rect x="215" y="24" width="250" height="44" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5" />
  <text x="340" y="47" textAnchor="middle" dominantBaseline="central" fill="#444441" fontSize="14" fontWeight="500">Provider와 LiteLLM 비교</text>

  <line x1="340" y1="68" x2="340" y2="104" stroke="#888780" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />

  <rect x="175" y="104" width="330" height="56" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5" />
  <text x="340" y="126" textAnchor="middle" dominantBaseline="central" fill="#444441" fontSize="14" fontWeight="500">10% 넘게 차이 나는 category가 있나요?</text>
  <text x="340" y="148" textAnchor="middle" dominantBaseline="central" fill="#5F5E5A" fontSize="12">requests, input, output, cache tokens</text>

  <path d="M220 132 L100 132 L100 250" fill="none" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <text x="157" y="122" textAnchor="middle" fill="#0F6E56" fontSize="12">예</text>

  <path d="M505 132 L580 132 L580 250" fill="none" stroke="#993C1D" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <text x="543" y="122" textAnchor="middle" fill="#993C1D" fontSize="12">아니요</text>

  <rect x="40" y="250" width="220" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5" />
  <text x="150" y="271" textAnchor="middle" dominantBaseline="central" fill="#085041" fontSize="14" fontWeight="500">경로 A</text>
  <text x="150" y="291" textAnchor="middle" dominantBaseline="central" fill="#0F6E56" fontSize="12">Token ingestion 문제</text>

  <rect x="420" y="250" width="220" height="56" rx="8" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5" />
  <text x="530" y="271" textAnchor="middle" dominantBaseline="central" fill="#712B13" fontSize="14" fontWeight="500">경로 B</text>
  <text x="530" y="291" textAnchor="middle" dominantBaseline="central" fill="#993C1D" fontSize="12">Quantity는 같고 cost가 다름</text>

  <line x1="150" y1="306" x2="150" y2="370" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />

  <line x1="530" y1="306" x2="530" y2="318" stroke="#854F0B" strokeWidth="1.5" />
  <line x1="435" y1="318" x2="575" y2="318" stroke="#854F0B" strokeWidth="1.5" />
  <line x1="435" y1="318" x2="435" y2="370" stroke="#854F0B" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <line x1="575" y1="318" x2="575" y2="370" stroke="#854F0B" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <text x="448" y="312" textAnchor="middle" fill="#854F0B" fontSize="11">B1</text>
  <text x="562" y="312" textAnchor="middle" fill="#854F0B" fontSize="11">B2</text>

  <rect x="40" y="370" width="220" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5" />
  <text x="150" y="391" textAnchor="middle" dominantBaseline="central" fill="#085041" fontSize="14" fontWeight="500">LiteLLM team에 보고</text>
  <text x="150" y="411" textAnchor="middle" dominantBaseline="central" fill="#0F6E56" fontSize="12">endpoints + model + screenshots</text>

  <rect x="380" y="370" width="110" height="56" rx="8" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5" />
  <text x="435" y="391" textAnchor="middle" dominantBaseline="central" fill="#633806" fontSize="14" fontWeight="500">B1</text>
  <text x="435" y="411" textAnchor="middle" dominantBaseline="central" fill="#854F0B" fontSize="12">Formula 수정</text>

  <rect x="510" y="370" width="130" height="56" rx="8" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5" />
  <text x="575" y="391" textAnchor="middle" dominantBaseline="central" fill="#633806" fontSize="14" fontWeight="500">B2</text>
  <text x="575" y="411" textAnchor="middle" dominantBaseline="central" fill="#854F0B" fontSize="12">Model map 수정</text>

  <path d="M150 426 L150 442 L340 442" fill="none" stroke="#888780" strokeWidth="0.5" strokeDasharray="4 3" />
  <path d="M340 442 L435 442 L435 428" fill="none" stroke="#888780" strokeWidth="0.5" strokeDasharray="4 3" />
  <path d="M340 442 L575 442 L575 428" fill="none" stroke="#888780" strokeWidth="0.5" strokeDasharray="4 3" />
  <text x="340" y="454" textAnchor="middle" fill="#5F5E5A" fontSize="11">어느 path로도 해결되지 않으면</text>
  <text x="340" y="470" textAnchor="middle" fill="#5F5E5A" fontSize="11">모든 data를 첨부해 GitHub issue를 여세요</text>
</svg>

## 경로 A: token quantity 불일치 {#path-a-token-quantity-mismatch}

어떤 category든 약 10% 이상 차이가 나면 LiteLLM이 해당 category를 올바르게 ingest하지 못했을 수 있습니다. 또는 provider dashboard가 token을 다르게 categorize하고 있을 수 있으니 먼저 3단계를 다시 확인하세요.

**LiteLLM team에 보낼 정보:**

1. date range가 보이는 양쪽 dashboard screenshot.
2. 어떤 category가 어긋났는지(input, output, cache reads, cache writes, request count).
3. 사용한 endpoint(예: `/chat/completions`, `/responses`, `/embeddings`).
4. request에 보낸 model name(예: `anthropic.claude-opus-4-5`, `gpt-4o`).

### Ingestion을 debugging하는 maintainer용 {#for-maintainers-debugging-ingestion}

1. verbose logging으로 proxy를 시작합니다. 예:
   ```bash
   litellm --config config.yaml --detailed_debug
   ```
2. 보고된 endpoint와 model로 단일 request를 재현합니다.
3. streaming이면 각 streamed chunk의 raw `usage` object를, 아니면 final response body의 raw `usage` object를 확인합니다.
4. 이를 standard logging object 또는 해당 call의 UI request log와 비교합니다.
5. raw provider usage와 LiteLLM이 log 또는 aggregate한 값 사이의 gap이 ingestion이 잘못되었을 가능성이 있는 지점입니다.

## 경로 B: quantity는 맞지만 cost가 잘못됨 {#path-b-quantities-match-but-cost-is-wrong}

token 및 request count가 약 10% 이내로 일치하지만 dollar amount가 다르면 cost 계산 방식에 집중하세요.

### B1: formula 문제 {#b1-formula-issue}

provider의 token breakdown과 공개 rate(per million tokens 또는 per token)를 사용해 expected cost를 수동으로 계산하세요.

provider가 적용하는 다른 billed dimension(예: cache creation, audio, tier surcharge)을 추가하세요. 수동 계산은 provider bill과 일치하지만 LiteLLM과 일치하지 않는다면, 해당 provider 또는 modality에 대한 LiteLLM implementation이 잘못되었을 수 있습니다.

### B2: model map 문제 {#b2-model-map-issue}

formula structure가 provider billing 방식과 일치한다면 LiteLLM model map의 value가 오래되었거나 잘못되었을 수 있습니다. 다음을 cross-check하세요.

- [`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)
- provider의 현재 public pricing

정확한 model id(provider prefix 포함)에 대해 `input_cost_per_token`, `output_cost_per_token`, cache-related pricing field를 확인하세요.

### Maintainer용

1. user의 provider report에서 authoritative token quantity를 가져옵니다.
2. provider line item을 재현하는 formula를 도출합니다.
3. 같은 provider와 response shape에 대한 LiteLLM cost path와 diff합니다.
4. formula는 맞지만 number가 다르면 `model_prices_and_context_window.json`의 pricing을 업데이트합니다. 이 file에 대한 project의 sync/backup rule을 따르세요.
5. code의 formula가 잘못되었다면 calculation을 수정하고 user의 token breakdown을 사용하는 regression test를 추가하세요.

## 아직 해결되지 않나요?

1. 3단계 comparison table, endpoint, model name을 포함해 [BerriAI/litellm](https://github.com/BerriAI/litellm)에 GitHub issue를 여세요.


issue에는 다음을 명확히 적으면 도움이 됩니다.

- 필요할 때 재현 가능한지, intermittent인지
- single model인지, 여러 model인지
- 시간이 지나도 steady한지, 특정 release date 또는 config change 이후 시작되었는지

### LiteLLM maintainer용

triage 후에도 Path A와 Path B로 case가 닫히지 않으면, issue를 처리하기 전에 Step 3 table과 screenshot을 준비해 **customer에게 연락하고 call을 잡아야 합니다**(support 또는 engineering).

## 체크리스트 {#checklist}

```
□ Same time range on both dashboards
□ Confirmed no direct-to-provider traffic for those models
□ Compared: requests, input tokens, output tokens, cache tokens
□ Noted cache reporting differences (OpenAI vs Anthropic, and so on)
□ If > ~10% delta on quantities → Path A: report with screenshots, endpoints, model names
□ If quantities match → Path B: verify formula (B1) and model map pricing (B2)
□ If neither path fits → open a GitHub issue.
```

## 함께 보기

- [Spend tracking](../proxy/cost_tracking)
- [GitHub에서 model pricing sync](../proxy/sync_models_github)
