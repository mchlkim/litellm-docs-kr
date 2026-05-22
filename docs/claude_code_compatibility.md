---
title: Claude Code 호환성
sidebar_label: Claude Code 호환성
---

import ClaudeCodeCompatibilityTable from '@site/src/components/ClaudeCodeCompatibilityTable';

# Claude Code × LiteLLM 호환성 매트릭스 {#claude-code--litellm-compatibility-matrix}

이 표는 자동 채움 작업이 매일 다시 생성합니다. 이 작업은 지원되는 각
provider에서 최신 stable LiteLLM proxy를 대상으로
[Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)를 실행하고,
Haiku 4.5, Sonnet 4.6, Opus 4.7을 병렬로 검증합니다. 세 model tier가 모두
통과한 경우에만 셀이 초록색으로 표시됩니다.

<ClaudeCodeCompatibilityTable />

## 범례 {#legend}

| 기호 | 의미 |
| --- | --- |
| ✅ | 이 `(feature, provider)` 셀에서 세 model tier가 모두 통과했습니다. |
| ❌ | 하나 이상의 model tier가 실패했습니다. upstream 오류를 보려면 마우스를 올리세요. |
| — | 이 조합에 대해 실행된 테스트가 없습니다. |
| n/a | 적용할 수 없습니다(예: provider가 이 feature를 노출하지 않음). 이유를 보려면 마우스를 올리세요. |

## 출처 {#source}

매트릭스 JSON은
[`src/data/compatibility-matrix.json`](https://github.com/BerriAI/litellm-docs/blob/main/src/data/compatibility-matrix.json).
채움 작업은 main 저장소의
[`tests/claude_code/cron_vm/`](https://github.com/BerriAI/litellm/tree/main/tests/claude_code/cron_vm)
에 있습니다.
