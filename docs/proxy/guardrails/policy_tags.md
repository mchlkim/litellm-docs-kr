# 태그 기반 정책 연결

특정 태그가 있는 키나 팀에 가드레일 정책을 자동으로 적용합니다. 정책을 하나씩 연결하는 대신 키에 태그를 지정하면 정책 엔진이 나머지를 처리합니다.

**예제:** 보안 팀에서 모든 의료 관련 키에 PII 마스킹과 PHI 감지를 실행하도록 요구한다고 가정해 보겠습니다. 해당 키에 `health` 태그를 지정하고 태그 기반 연결을 하나 만들면 일치하는 모든 키에 가드레일이 자동으로 적용됩니다.

## 1. 가드레일이 포함된 정책 만들기

왼쪽 사이드바에서 **Policies**로 이동합니다. 기존 정책 목록과 각 정책의 가드레일을 볼 수 있습니다.

![기존 정책과 + Add New Policy 버튼이 표시된 Policies 목록 페이지](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/d7aa1e1f-011e-40bf-a356-6dfe9d5d54f1/ascreenshot_8db95c231a7f4a79a36c2a98ba127542_text_export.jpeg)

**+ Add New Policy**를 클릭합니다. 모달에서 정책 이름(예: `high-risk-policy2`)을 입력합니다. 기존 정책을 참조하려면 기존 정책 이름을 입력해 검색할 수도 있습니다.

![정책 이름과 선택적 설명을 입력하는 Create New Policy 모달](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/18f1ff69-9b83-4a98-9aad-9892a104d3ff/ascreenshot_1c6b85231cad4ec695750b53bbbda52c_text_export.jpeg)

**추가할 가드레일**(`Guardrails to Add`)까지 아래로 스크롤합니다. 드롭다운을 클릭하면 프록시에 구성된 사용 가능한 모든 가드레일이 표시됩니다. 이 정책에서 적용할 가드레일을 선택합니다.

![OAI-moderation, phi-pre-guard, pii-pre-guard 같은 사용 가능한 가드레일이 표시된 Guardrails to Add 드롭다운](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/55cedad7-9939-44a1-8644-a184cde82ab7/ascreenshot_eab4e55b82b8411893eccb6234d60b82_text_export.jpeg)

가드레일을 선택하면 입력 필드에 칩으로 표시됩니다. 아래의 **Resolved 가드레일** 섹션에는 최종 적용될 가드레일 집합이 표시됩니다. 상위 정책에서 상속된 항목도 포함됩니다.

![testing-pl, phi-pre-guard, pii-pre-guard가 칩으로 표시되고 아래에 Resolved 가드레일 미리보기가 표시됨](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/c06d5b08-1c85-4715-b827-3e6864880428/ascreenshot_7a082e55f3ad425f9009346c68afae23_text_export.jpeg)

저장하려면 **Create Policy**를 클릭합니다.

![새 정책을 저장하기 위해 Create Policy를 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/7e6eae64-4bba-4d72-b226-d1308ac576a8/ascreenshot_22d0ed686c594221bbbd2f40df214d75_text_export.jpeg)

## 2. 정책에 태그 연결 추가하기

정책을 만든 뒤 **Attachments** 탭으로 전환합니다. 여기에서 정책이 적용될 *위치*를 정의합니다.

![연결 테이블과 범위 문서가 표시된 Attachments 탭으로 전환](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/871ae6d9-16d1-44e2-baf2-7bb8a9e72087/ascreenshot_76e124619d70462ea0e2fbb46ded1ac9_text_export.jpeg)

**+ Add New Attachment**를 클릭합니다. Attachments 페이지에는 사용 가능한 범위인 Global, Teams, Keys, 모델, **Tags**가 설명되어 있습니다.

![Tags를 포함한 범위 유형이 표시된 Attachments 페이지에서 + Add New Attachment 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/d45ab8bc-fc1e-425b-8a3f-44d18df810ec/ascreenshot_425824030f3144b7ab3c0ac570349b00_text_export.jpeg)

**Create Policy Attachment** 모달에서 먼저 방금 만든 정책을 드롭다운에서 선택합니다.

![드롭다운에서 연결할 정책 선택(예: high-risk-policy2)](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/e0dcac40-e39c-4a6a-9d9c-4bbb9ec0ee91/ascreenshot_445b19894e0b466196a13e20c8e67f2d_text_export.jpeg)

범위 유형으로 **특정 항목**(`Specific (teams, keys, models, or tags)`)을 선택합니다. 그러면 Teams, Keys, 모델, Tags 필드가 표시되도록 양식이 확장됩니다.

![Tags 필드를 표시하기 위해 Specific 범위 유형 선택](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/f685e02a-e22e-4c6c-9742-d5268746214b/ascreenshot_14d63d9d06dd4fc7854cfeb5e8d9ef85_text_export.jpeg)

**Tags** 필드까지 아래로 스크롤하고 일치시킬 태그를 입력합니다. 여기서는 `health`를 입력합니다. 임의의 문자열을 입력할 수 있으며, `health-`로 시작하는 모든 태그(예: `health-team`, `health-dev`)를 일치시키려면 `health-*` 같은 와일드카드 패턴을 사용할 수 있습니다.

![health가 입력된 Tags 필드. prod-us, prod-eu와 일치하는 prod-* 같은 와일드카드 지원](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/14581df7-732c-4ea5-b36d-58270b00e92c/ascreenshot_e734c81418f046549b61a84b9d352a29_text_export.jpeg)

## 3. 연결의 영향 확인하기

연결을 만들기 전에 **Estimate Impact**를 클릭해 영향을 받을 키와 팀 수를 미리 확인합니다. 이는 영향 범위 확인 절차입니다. 적용하기 전에 범위가 예상과 맞는지 확인하세요.

![health 태그가 입력되어 있고 미리볼 준비가 된 상태에서 Estimate Impact 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/6ccb81d7-3d11-48b0-b634-fc4d738aa530/ascreenshot_2eb89e6ff13a4b12b61004660a36c30c_text_export.jpeg)

**Impact Preview**가 인라인으로 표시되어 영향을 받을 키와 팀 수를 정확히 보여줍니다. 이 예시에서는 "This attachment would affect **1 key** and **0 teams**"라고 표시되고, 키 별칭 `hi`가 나열됩니다.

![This attachment would affect 1 key and 0 teams. 및 Keys: hi가 표시된 Impact Preview](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/8834d85a-2c15-48dd-8d6b-810cf11ee5c4/ascreenshot_d814b42ca9f34c23b0c2269bfa3e64fb_text_export.jpeg)

영향 범위가 적절하다고 판단되면 **Create Attachment**를 클릭해 저장합니다.

![완료하기 위해 Create Attachment 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/4a8918f2-eedb-4f49-a53b-4e46d0387d2a/ascreenshot_b08d490d836d4f46b4e5cbb14f61377a_text_export.jpeg)

이제 테이블에 연결이 표시되며 정책 이름 `high-risk-policy2`와 태그 `health`를 확인할 수 있습니다.

![정책 high-risk-policy2와 health 태그가 있는 새 연결이 표시된 Attachments 테이블](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/45867887-0aec-44a4-963b-b6cc6c302e3e/ascreenshot_981caeff98574ec89a8a53cd295e5043_text_export.jpeg)

## 4. 태그가 있는 키 만들기

왼쪽 사이드바에서 **가상 키**로 이동합니다. **+ Create New Key**를 클릭합니다.

![기존 키가 표시된 가상 키 페이지에서 + Create New Key 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/4c1f9448-e590-4546-9357-6f68aa395b27/ascreenshot_4a7bc5be9e4347f3a9fe46f78d938d7c_text_export.jpeg)

키 이름을 입력하고 모델을 선택합니다. 그런 다음 **Optional Settings**를 펼치고 **Tags** 필드까지 아래로 스크롤합니다.

![키 이름을 입력하는 Create New Key 모달](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/f84f7a2b-8057-4926-9f80-d68e437c77cf/ascreenshot_a277c8611b6e41059663b0759cd85cab_text_export.jpeg)

**Tags** 필드에 `health`를 입력하고 Enter를 누릅니다. 정책 엔진은 이 태그를 기준으로 일치 여부를 판단합니다.

![키 생성 화면의 Tags 필드에서 health를 입력해 태그 추가](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/3ad3bf10-76d2-4f15-9a66-ed6c99bb25c4/ascreenshot_8a8773fb65fc49329cb1716da92b2723_text_export.jpeg)

이제 `health` 태그가 Tags 필드에 칩으로 표시됩니다. 설정이 올바른지 확인합니다.

![체크 표시와 함께 health가 선택된 Tags 필드](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/de3e58a9-6013-4d0c-882e-5517ea286684/ascreenshot_c7eef1736fce4aa894ac3b118b3800a2_text_export.jpeg)

양식 하단에서 **Create Key**를 클릭합니다.

![health 태그가 있는 새 가상 키를 생성하기 위해 Create Key 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/51d419ea-ee80-4e24-8e93-b99a844881bc/ascreenshot_097d4564289943a88e30b5d2e3eab262_text_export.jpeg)

새 가상 키가 포함된 대화 상자가 표시됩니다. 다음 단계에서 테스트할 때 필요하므로 **Copy Virtual Key**를 클릭합니다.

![Save your Key 대화 상자에서 Copy Virtual Key를 클릭해 클립보드에 복사](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/e87a0cc1-4d12-4066-bfa2-973159808fd1/ascreenshot_7b616a7291d0497a9c61bdcdb59394d7_text_export.jpeg)

## 5. 키를 테스트하고 정책 적용 확인하기

키를 대화형으로 테스트하려면 왼쪽 사이드바에서 **Playground**로 이동합니다.

![사이드바에서 Playground로 이동](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/e6f8a3ee-e9e8-4107-93d1-bfca734c5ce9/ascreenshot_539bde38abe646e49148a912fff2d257_text_export.jpeg)

**가상 키 소스**(`Virtual Key Source`)에서 `Virtual Key`를 선택하고 방금 복사한 키를 입력 필드에 붙여 넣습니다.

![Playground 구성에 가상 키 붙여넣기](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/a6612c4a-d499-4e54-8019-f54fde674ad9/ascreenshot_e85ebb9051554594bab0da57823fafad_text_export.jpeg)

**Select Model** 드롭다운에서 모델을 선택합니다.

![드롭다운에서 모델 선택(예: bedrock-claude-opus-4.5)](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/325e330f-3eff-4c5e-b177-21916138a2f5/ascreenshot_693478f89c034e949e08f3ed0dd05120_text_export.jpeg)

메시지를 입력하고 Enter를 누릅니다. 가드레일이 요청을 차단하면 응답에서 확인할 수 있습니다. 이 예시에서는 `testing-pl` 가드레일이 이메일 패턴을 감지하고 403 오류를 반환하여 정책이 동작 중임을 확인합니다.

![가드레일 동작으로 요청이 Content blocked: email pattern detected 메시지와 함께 차단됨](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/2cf16809-d2e5-4eae-a7dd-6a16dfcca7ce/ascreenshot_727d7d4ed20b4a52b2b41e39fd36eccb_text_export.jpeg)

**curl 사용:**

명령줄에서도 확인할 수 있습니다. 응답 헤더를 보면 어떤 정책과 가드레일이 적용되었는지 확인할 수 있습니다.

```bash
curl -v http://localhost:4000/chat/completions \
  -H "Authorization: Bearer <your-tagged-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "say hi"}]
  }'
```

응답 헤더를 확인합니다.

```
x-litellm-applied-policies: high-risk-policy2
x-litellm-applied-guardrails: pii-pre-guard,phi-pre-guard,testing-pl
x-litellm-policy-sources: high-risk-policy2=tag:health
```

| 헤더 | 확인할 수 있는 내용 |
|--------|-------------------|
| `x-litellm-applied-policies` | 이 요청과 일치한 정책 |
| `x-litellm-applied-guardrails` | 실제로 실행된 가드레일 |
| `x-litellm-policy-sources` | 각 정책이 일치한 **이유**. `tag:health`는 태그 때문에 일치했음을 확인해 줍니다. |
