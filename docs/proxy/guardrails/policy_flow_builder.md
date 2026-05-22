# Policy Flow Builder(정책 흐름 빌더) {#policy-flow-builder}

Policy Flow Builder를 사용하면 **조건부 실행**이 있는 guardrail pipeline을 설계할 수 있습니다. guardrail을 독립적으로 실행하는 대신 순서가 있는 step으로 연결하고, 각 guardrail이 **통과**하거나 **정책 검사를 실패**하거나(content intervention), **기술 오류**(예: timeout, 연결할 수 없는 provider, 누락된 guardrail)를 만났을 때의 동작을 제어합니다.

이를 통해 두 가지 강력한 pattern을 만들 수 있습니다. 하나가 실패했을 때 다른 guardrail을 시도하는 **guardrail fallback**, 실패 시 같은 guardrail을 다시 실행하는 **동일 guardrail retry**입니다(예: 일시적 오류 처리). **`on_error`**를 사용하면 **기술적** 실패와 **정책** 실패를 다르게 처리할 수 있습니다. 예를 들어 primary API가 오류를 내면 다른 provider로 fallback하면서도, flagged content는 계속 차단할 수 있습니다.

## Flow Builder를 사용할 때

| 접근 방식 | 사용 사례 |
|----------|----------|
| **Simple policy** (`guardrails.add`) | 모든 guardrail을 병렬 실행하며, 실패가 하나라도 있으면 요청을 차단합니다. |
| **Flow Builder** (pipeline) | guardrail을 순서대로 실행하고 step별 action(next, block, allow, custom response)을 선택합니다. |

다음이 필요할 때 Flow Builder를 사용하세요.

- **Guardrail fallback** — 하나가 실패했을 때 다른 guardrail을 시도하도록 `on_fail: next` 사용(예: 빠른 filter → 더 엄격한 filter)
- **동일 guardrail retry** — 같은 guardrail을 여러 step으로 추가합니다. 실패하면 `on_fail: next`가 다음 step으로 이동하며, 그 다음 step이 같은 guardrail일 수 있습니다(일시적 API 오류 또는 rate limit에 유용).
- **조건부 routing** — 예를 들어 빠른 guardrail이 실패하면 즉시 차단하지 않고 더 고급 guardrail을 실행합니다.
- **Custom response** — guardrail 실패 시 generic block 대신 특정 message를 반환합니다.
- **Data chaining** — 수정된 데이터(예: PII 마스킹된 content)를 한 step에서 다음 step으로 전달합니다.
- **세밀한 제어** — step마다 pass와 fail에 다른 action을 지정합니다.
- **기술 오류 routing** — `on_error`를 `on_fail`과 별도로 설정해 outage나 timeout을 content violation과 섞지 않고 **allow**, **block**, **next step 이동**, **custom response** 반환으로 처리합니다.

## 개념 {#concepts}

### Pipeline

pipeline에는 다음이 포함됩니다.

- **Mode**: `pre_call`(LLM 호출 전) 또는 `post_call`(LLM 호출 후)
- **Steps**: 순서가 지정된 guardrail step 목록

### 결과: pass, fail, error

각 step 실행은 세 가지 결과 중 하나를 만듭니다.

| 결과 | 의미 | 일반적인 원인 |
|--------|---------|----------------|
| **pass** | 차단 없이 guardrail 완료 | content 허용 또는 data 수정 후 반환 |
| **fail** | 정책 개입 | guardrail이 intervention을 발생시킴(예: flagged content, blocked request) |
| **error** | 기술 실패 | timeout, network error, guardrail 미등록 또는 기타 non-intervention exception |

`on_pass`와 `on_fail`은 각각 **pass**와 **fail**에 적용됩니다. **`on_error`**는 **error**에만 적용됩니다. `on_error`가 생략되면 pipeline은 error 결과에 **`on_fail`**을 사용합니다(backward compatible).

### Step action {#step-actions}

각 step에서 **pass**, **fail**, 선택적으로 **error**에 대한 action을 선택합니다. 허용 값은 `next`, `allow`, `block`, `modify_response`입니다.

| Action | 설명 |
|--------|-------------|
| **Next Step** (`next`) | pipeline의 다음 guardrail로 계속 진행 |
| **Allow** (`allow`) | pipeline을 중지하고 요청 진행 허용 |
| **Block** (`block`) | pipeline을 중지하고 요청 차단 |
| **Custom Response** (`modify_response`) | 기본 block 대신 custom message 반환 |

### Step option {#step-options}

| Field | Type | 설명 |
|-------|------|--------------|
| `guardrail` | `string` | 실행할 guardrail 이름 |
| `on_pass` | `string` | 결과가 **pass**일 때의 action: `next`, `allow`, `block`, `modify_response` |
| `on_fail` | `string` | 결과가 **fail**(정책 개입)일 때의 action: `next`, `allow`, `block`, `modify_response` |
| `on_error` | `string` (optional) | 결과가 **error**(기술 오류)일 때의 action. 생략하면 **error**는 `on_fail`을 사용합니다. |
| `pass_data` | `boolean` | 수정된 요청 data(예: PII masking)를 다음 step으로 전달 |
| `modify_response_message` | `string` | `modify_response` action 사용 시 custom message |

## Flow Builder 사용하기(UI)

1. LiteLLM 관리자 UI에서 **Policies**로 이동합니다.
2. 기존 policy에서 **+ Create New Policy** 또는 **Edit**을 클릭합니다.
3. simple form 대신 **Flow Builder**를 선택합니다.
4. flow를 설계합니다.
   - **Trigger** — 들어오는 LLM 요청(policy가 match될 때 실행)
   - **Steps** — guardrail을 추가하고 step별 **ON PASS**, **ON FAIL**, **ON API FAILURE** / **ON ERROR** 설정(**ON API FAILURE**가 비어 있으면 기술 오류는 **ON FAIL**을 따름)
   - **End** — pipeline이 허용하면 요청이 LLM으로 진행
5. step 사이의 **+**를 사용해 다른 guardrail step을 삽입합니다(fallback, retry, 더 엄격한 2차 검사).
6. 저장 전에 **Test Pipeline**으로 sample message를 실행합니다.
7. **Save Policy**(또는 **Save**)를 클릭해 policy를 생성하거나 업데이트합니다.

### UI에서 guardrail fallback 설정하기(walkthrough)

1. **Policies**를 클릭합니다.

![Policies tab in the 관리자 UI](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/1333f4ae-d7df-4645-bd33-fee11c80cb96/ascreenshot_ce21e8bd79324c4685ad6c191e39d89e_text_export.jpeg)

2. **+ Add New Policy**를 클릭합니다.

![Add new policy](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/353c08ab-cdb5-490f-b54f-734f77c87c45/ascreenshot_223033a61071485187e87cbb8c41081e_text_export.jpeg)

3. **Flow Builder**를 클릭합니다.

![Choose Flow Builder](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/70e99d1b-fd76-4143-93f4-296b8b4c3904/ascreenshot_ef49b2e2c5dc40e39cf8da7a37f346ac_text_export.jpeg)

4. **Builder로 계속**을 클릭합니다.

![Continue to Builder](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/3de1beaf-9c52-4f03-9100-ce4d47e41967/ascreenshot_a1d64e7e58c54b6cb8a311173ffe435a_text_export.jpeg)

5. 첫 step의 **guardrail search** field를 클릭합니다.

![Select first guardrail — search field](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/640f699b-bdde-4e6d-a226-1fede9477b22/ascreenshot_27f14445b78b4e61872f3f95c1c9bacd_text_export.jpeg)

6. **Test Moderation**(또는 primary guardrail)을 선택합니다.

![Pick Test Moderation](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/d46f7ab6-4231-44fb-b377-59f817cdfbe5/ascreenshot_e3a9f8e25ffe46ad82a73641b81d157c_text_export.jpeg)

7. 한 branch(예: **ON API FAILURE**)에서 API 오류 시 pipeline이 다음 guardrail로 넘어갈 수 있도록 action을 **Next Step**으로 설정합니다.

![Set action to Next Step](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/3a7ddc2a-4317-417b-9341-ff6b0913e64b/ascreenshot_8878486dc12b4dddafe0c8ba4382a0fb_text_export.jpeg)

8. **ON PASS**에는 **Allow**를 설정합니다(허용 전 추가 step이 필요하면 **Next Step**).

![Set ON PASS to Allow](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/0e31cde8-3075-4e17-b771-b2b1696db98f/ascreenshot_b4b1d232459e4941904c9fbcf90c70ca_text_export.jpeg)

9. 다음 outcome의 search/dropdown을 엽니다(예: **ON FAIL**).

![Configure another branch — search field](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/715fc3ad-f245-4ee8-bb36-cc13400d635d/ascreenshot_395fece82c124d4d826fb5d84c9c0529_text_export.jpeg)

10. 실패한 check가 backup guardrail로 계속 진행되어야 한다면 해당 branch를 **Next Step**으로 설정합니다.

![ON FAIL or branch — Next Step](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/83156e9b-fc3f-4cc2-a6cb-2a13a5e77b06/ascreenshot_c61429bf7b354063afc57c40a6b45c7a_text_export.jpeg)

11. step 사이의 **+**를 클릭해 두 번째 guardrail을 추가합니다.

![Add step — plus control](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/e76cff13-af73-4775-90f6-4d29cb97d401/ascreenshot_52c478e7afd5410f9f63b616c753c851_text_export.jpeg)

12. 새 step에서 guardrail search field를 엽니다.

![Second step — guardrail search](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/5c1c4eea-d7da-41e5-bebd-945e97562aa5/ascreenshot_cef70e9146b148b1936e721638de0783_text_export.jpeg)

13. **Insults & Personal Attacks**(또는 fallback / 더 엄격한 guardrail)을 선택합니다.

![Pick Insults and Personal Attacks](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/e796c733-351f-494f-9261-795c27f2b519/ascreenshot_f0f778d50c2146e48829ffb203c7de92_text_export.jpeg)

14. 이 step에 필요한 대로 branch에 **Next Step** 또는 **Block**을 설정합니다.

![Second step branch — Next Step](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/c5fad953-4f4b-47ec-ab6d-81d21b2fb7b8/ascreenshot_b515fadec0534c6a9b9d66091398d82d_text_export.jpeg)

15. 이 guardrail이 pipeline을 성공적으로 완료해야 한다면 **ON PASS**를 **Allow**로 설정합니다.

![Second step — Allow on pass](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/8210f32a-8704-41b1-97cc-7d183682a2a4/ascreenshot_23361af2b7da482a8d89025ab285a72e_text_export.jpeg)

16. **Custom Response**를 원하는 branch를 엽니다(예: 마지막 step의 **ON FAIL**).

![Custom response — open branch selector](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/98ab3a2c-f22f-4478-a146-d5d26cae9b10/ascreenshot_6a3b673654e64ce29c8c93fbf30c52ed_text_export.jpeg)

17. **Custom Response**를 선택합니다.

![Select Custom Response](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/a9e69e82-d517-4426-95da-034643a2388b/ascreenshot_f8ef581fbfb440cdbf145a2e9368c8e8_text_export.jpeg)

18. **Enter custom response...**를 클릭하고 message를 입력합니다.

![Custom response text field](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/ef0f90ba-d0bc-4220-874f-4998b2dcc5f6/ascreenshot_f3e825b57fa0478a92f56840af266e03_text_export.jpeg)

19. 필요에 따라 **Enter custom response...**에서 message를 확인하거나 수정합니다.

![Custom response — confirm message](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/f9a4711d-655c-4f15-b0ea-6b7d33fe6e60/ascreenshot_5df4b465bc484d8f86a4af5a45e9ab42_text_export.jpeg)

20. **Test Pipeline**을 엽니다.

![Test Pipeline panel](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/3f9ac555-66fe-43e0-a8d8-2288a5966c73/ascreenshot_b2319dae363346ebb4da5d09180b56e8_text_export.jpeg)

21. **Run Test**를 클릭합니다.

![Run Test](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/8e21e973-8193-404b-9d97-fd85be5f90b6/ascreenshot_619ca71e3be244449ca2ab01dde3cc45_text_export.jpeg)

22. 결과에서 **Step 1**(또는 첫 guardrail row)을 펼쳐 **ERROR** / **Next Step**과 **PASS** / **Allow**를 확인합니다.

![Expand first step in test results](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/b8010e20-dd9a-4e59-b0ca-1f2ba4c7b6ac/ascreenshot_da99f5761bbf44a08af4f1e1175a95fc_text_export.jpeg)

23. **Step 2**(예: **Insults & Personal Attacks**)를 펼쳐 fallback 이후 **PASS**와 **Allow**를 확인합니다.

![Expand Step 2 — second guardrail outcome](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/cac5273c-dd4f-48a0-af58-12c428d0f0d0/ascreenshot_f74da58e280a47319a7d2fa41519f4fb_text_export.jpeg)

## Config (YAML) {#config-yaml}

policy config에서 pipeline을 정의합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: pii_masking
    litellm_params:
      guardrail: presidio
      mode: pre_call

  - guardrail_name: prompt_injection
    litellm_params:
      guardrail: lakera
      mode: pre_call

policies:
  my-pipeline-policy:
    description: "PII mask first, then check for prompt injection"
    guardrails:
      add:
        - pii_masking
        - prompt_injection
    pipeline:
      mode: pre_call
      steps:
        - guardrail: pii_masking
          on_pass: next
          on_fail: block
          pass_data: true
        - guardrail: prompt_injection
          on_pass: allow
          on_fail: block

policy_attachments:
  - policy: my-pipeline-policy
    scope: "*"
```

## Fallback과 retry {#fallback-and-retry}

### Guardrail fallback {#guardrail-fallbacks}

하나가 실패했을 때 다른 guardrail로 fallback하려면 `on_fail: next`를 사용합니다. 가벼운 guardrail을 먼저 실행하고, 실패하면 더 엄격하거나 다른 provider로 escalate합니다.

```yaml
policies:
  fallback-policy:
    guardrails:
      add:
        - fast_content_filter
        - strict_content_filter
    pipeline:
      mode: pre_call
      steps:
        - guardrail: fast_content_filter
          on_pass: allow
          on_fail: next
        - guardrail: strict_content_filter
          on_pass: allow
          on_fail: block
```

`fast_content_filter`가 pass하면 allow합니다. 실패하면 `strict_content_filter`를 실행합니다. pass하면 allow, fail하면 block합니다.

### 같은 guardrail retry {#same-guardrail-retry}

실패 시 retry하려면 같은 guardrail을 여러 step으로 추가합니다. 일시적 오류(API timeout, rate limit)에 유용합니다.

```yaml
policies:
  retry-policy:
    guardrails:
      add:
        - lakera_prompt_injection
    pipeline:
      mode: pre_call
      steps:
        - guardrail: lakera_prompt_injection
          on_pass: allow
          on_fail: next
        - guardrail: lakera_prompt_injection
          on_pass: allow
          on_fail: block
```

첫 번째 시도가 pass하면 allow합니다. 첫 번째 시도가 fail하면 같은 guardrail을 retry합니다. 두 번째가 pass하면 allow, 두 번째도 fail하면 block합니다.

## 기술 오류와 정책 실패 비교(`on_error`) {#technical-errors-vs-policy-failures-on-error}

**API/infra 문제**와 **content policy** 위반에 서로 다른 동작을 적용하려면 **`on_error`**를 사용합니다.

- **`on_fail`** — guardrail이 **개입**할 때 실행됩니다(예: toxic content, PII detected).
- **`on_error`** — step이 **error**로 끝날 때 실행됩니다(timeout, connection failure, guardrail not loaded 등). `on_error`를 생략하면 **error** 결과는 **`on_fail`**을 사용합니다.

예제: 나쁜 content는 block하지만 primary scanner가 down이면 모든 요청을 block하지 않고 두 번째 guardrail로 fallback합니다.

```yaml
policies:
  error-fallback-policy:
    guardrails:
      add:
        - primary_scanner
        - backup_scanner
    pipeline:
      mode: pre_call
      steps:
        - guardrail: primary_scanner
          on_pass: allow
          on_fail: block
          on_error: next
        - guardrail: backup_scanner
          on_pass: allow
          on_fail: block
          on_error: allow
```

`primary_scanner`가 error를 내면 `backup_scanner`를 실행합니다. `backup_scanner`도 error를 내면 요청을 allow합니다(fail-closed를 선호하면 `on_error`를 `block`으로 설정).

## 예제: fail 시 Custom response {#example-custom-response-on-fail}

generic block 대신 branded message를 반환합니다.

```yaml
policies:
  branded-block-policy:
    guardrails:
      add:
        - pii_detector
    pipeline:
      mode: pre_call
      steps:
        - guardrail: pii_detector
          on_pass: allow
          on_fail: modify_response
          modify_response_message: "Your message contains sensitive information. Please remove PII and try again."
```

## Pipeline 테스트(API) {#test-pipeline-api}

연결하기 전에 sample message로 pipeline을 테스트합니다.

```bash
curl -X POST "http://localhost:4000/policies/test-pipeline" \
  -H "Authorization: Bearer <your_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": {
      "mode": "pre_call",
      "steps": [
        {
          "guardrail": "pii_masking",
          "on_pass": "next",
          "on_fail": "block",
          "pass_data": true
        },
        {
          "guardrail": "prompt_injection",
          "on_pass": "allow",
          "on_fail": "block"
        }
      ]
    },
    "test_messages": [
      {"role": "user", "content": "What is 2+2?"},
      {"role": "user", "content": "My SSN is 123-45-6789"}
    ]
  }'
```

응답에는 step별 outcome(pass/fail/error), 수행된 action, timing이 포함됩니다.

## Pipeline과 simple policy 비교 {#pipeline-vs-simple-policy}

policy에 `pipeline`이 있으면 pipeline이 실행 순서와 action을 정의합니다. `guardrails.add` list에는 pipeline step에서 사용하는 모든 guardrail이 포함되어야 합니다.

| Policy 유형 | 실행 |
|-------------|-----------|
| Simple(`guardrails.add`만) | 모든 guardrail 실행, 실패가 하나라도 있으면 block |
| Pipeline(`pipeline` 있음) | step을 순서대로 실행하고 action이 flow 제어 |

## 관련 문서

- [Guardrail Policies](./guardrail_policies) — policy 기본, attachment, inheritance
- [Policy Templates](./policy_templates) — 사전 구성된 policy template
