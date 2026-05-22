---
title: v1.61.20-stable
slug: v1.61.20-stable
date: 2025-03-01T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [llm translation, rerank, ui, thinking, reasoning_content, claude-3-7-sonnet]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

# v1.61.20-stable


`v1.61.13-stable` 이후 변경 사항입니다.

이번 릴리스는 주로 다음에 초점을 맞춥니다.
- LLM Translation 개선(`claude-3-7-sonnet` + `thinking`/`reasoning_content` 지원)
- UI 개선(모델 추가 흐름, 사용자 관리 등)

## 데모 인스턴스

변경 사항을 테스트할 수 있는 데모 인스턴스입니다.
- 인스턴스: https://demo.litellm.ai/
- 로그인 자격 증명:
    - 사용자 이름: admin
    - 비밀번호: sk-1234

## 새 모델 / 업데이트된 모델

1. Anthropic 3-7 sonnet 지원 및 비용 추적(Anthropic API + Bedrock + Vertex AI + OpenRouter)
    1. Anthropic API [여기에서 시작](https://docs.litellm.ai/docs/providers/anthropic#usage---thinking--reasoning_content)
    2. Bedrock API [여기에서 시작](https://docs.litellm.ai/docs/providers/bedrock#usage---thinking--reasoning-content)
    3. Vertex AI API [여기 보기](../../docs/providers/vertex#usage---thinking--reasoning_content)
    4. OpenRouter [여기 보기](https://github.com/BerriAI/litellm/blob/ba5bdce50a0b9bc822de58c03940354f19a733ed/model_prices_and_context_window.json#L5626)
2. Gpt-4.5-preview 지원 및 비용 추적 [여기 보기](https://github.com/BerriAI/litellm/blob/ba5bdce50a0b9bc822de58c03940354f19a733ed/model_prices_and_context_window.json#L79)
3. Azure AI - Phi-4 비용 추적 [여기 보기](https://github.com/BerriAI/litellm/blob/ba5bdce50a0b9bc822de58c03940354f19a733ed/model_prices_and_context_window.json#L1773)
4. Claude-3.5-sonnet - Anthropic API의 비전 지원 업데이트 [여기 보기](https://github.com/BerriAI/litellm/blob/ba5bdce50a0b9bc822de58c03940354f19a733ed/model_prices_and_context_window.json#L2888)
5. Bedrock llama 비전 지원 [여기 보기](https://github.com/BerriAI/litellm/blob/ba5bdce50a0b9bc822de58c03940354f19a733ed/model_prices_and_context_window.json#L7714)
6. Cerebras llama3.3-70b 가격 [여기 보기](https://github.com/BerriAI/litellm/blob/ba5bdce50a0b9bc822de58c03940354f19a733ed/model_prices_and_context_window.json#L2697)

## LLM Translation

1. Infinity Rerank - `return_documents=True`일 때 문서 반환 지원 [여기에서 시작](../../docs/providers/infinity#usage---returning-documents)
2. Amazon Deepseek - `<think>` 파라미터를 `reasoning_content`로 추출 [여기에서 시작](https://docs.litellm.ai/docs/providers/bedrock#bedrock-imported-models-deepseek-deepseek-r1)
3. Amazon Titan Embeddings - 요청 본문에서 `aws_` 파라미터 필터링 [여기에서 시작](https://docs.litellm.ai/docs/providers/bedrock#bedrock-embedding)
4. Anthropic `thinking` + `reasoning_content` 변환 지원(Anthropic API, Bedrock, Vertex AI) [여기에서 시작](https://docs.litellm.ai/docs/reasoning_content)
5. VLLM - `video_url` 지원 [여기에서 시작](../../docs/providers/vllm#send-video-url-to-vllm)
6. litellm SDK로 프록시 호출: embedding, image_generation, transcription, speech, rerank에 `litellm_proxy/` 지원 [여기에서 시작](https://docs.litellm.ai/docs/providers/litellm_proxy)
7. OpenAI Pass-through - `/openai` pass-through 라우트에서 Assistants GET, DELETE 사용 허용 [여기에서 시작](https://docs.litellm.ai/docs/pass_through/openai_passthrough)
8. Message Translation - role이 누락된 assistant 메시지의 openai 메시지 수정. openai는 이를 허용합니다.
9. O1/O3 - o3-mini와 o1의 `parallel_tool_calls` 파라미터에 대해 `drop_params` 지원(현재 지원되지 않음) [여기 보기](https://docs.litellm.ai/docs/completion/drop_params)

## 비용 추적 개선

1. Bedrock을 통한 rerank 비용 추적 [PR 보기](https://github.com/BerriAI/litellm/commit/b682dc4ec8fd07acf2f4c981d2721e36ae2a49c5)
2. Anthropic pass-through - 비용이 추적되지 않던 race condition 수정 [PR 보기](https://github.com/BerriAI/litellm/pull/8874)
3. Anthropic pass-through: 정확한 토큰 계산 보장 [PR 보기](https://github.com/BerriAI/litellm/pull/8880)

## 관리 엔드포인트 / UI

1. 모델 페이지 - `created at` 기준 모델 정렬 허용
2. 모델 페이지 - 모델 수정 흐름 개선
3. 모델 페이지 - UI에서 Azure, Azure AI Studio 모델 추가 문제 수정
4. 내부 사용자 페이지 - UI에서 내부 사용자 일괄 추가 허용
5. 내부 사용자 페이지 - `created at` 기준 사용자 정렬 허용
6. 가상 키 페이지 - 사용자를 팀에 할당할 때 드롭다운에서 UserID 검색 허용 [PR 보기](https://github.com/BerriAI/litellm/pull/8844)
7. 가상 키 페이지 - 키를 사용자에게 할당할 때 사용자 생성 허용 [PR 보기](https://github.com/BerriAI/litellm/pull/8844)
8. Model Hub 페이지 - 텍스트 오버플로 문제 수정 [PR 보기](https://github.com/BerriAI/litellm/pull/8749)
9. 관리자 설정 페이지 - UI에서 MSFT SSO 추가 허용
10. 백엔드 - DB에 중복 내부 사용자를 생성하지 못하도록 제한

## Helm

1. migration job에서 `ttlSecondsAfterFinished` 지원 - [PR 보기](https://github.com/BerriAI/litellm/pull/8593)
2. 추가 구성 가능한 속성으로 migrations job 개선 - [PR 보기](https://github.com/BerriAI/litellm/pull/8636)

## 로깅 / Guardrail 통합

1. Arize Phoenix 지원
2. `No-log` - embedding 호출에서 `no-log` 파라미터 지원 수정

## 성능 / 로드 밸런싱 / 안정성 개선

1. 단일 배포 cooldown 로직 - 설정된 경우 `allowed_fails` 또는 `allowed_fail_policy` 사용 [여기에서 시작](https://docs.litellm.ai/docs/routing#advanced-custom-retries-cooldowns-based-on-error-type)

## 일반 프록시 개선

1. Hypercorn - 요청 본문 읽기/파싱 수정
2. Windows - Windows에서 프록시 실행 문제 수정
3. DD-Trace - 프록시에서 dd-trace 활성화 문제 수정

## 전체 Git Diff

전체 git diff는 [여기](https://github.com/BerriAI/litellm/compare/v1.61.13-stable...v1.61.20-stable)에서 확인할 수 있습니다.
