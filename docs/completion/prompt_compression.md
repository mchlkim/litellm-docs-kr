# 프롬프트 압축 (`compress()`)

`completion()`을 호출하기 전에 `litellm.compress()`를 사용해 긴 대화 기록을 줄일 수 있습니다.

이 함수는 관련성이 높거나 최근의 컨텍스트를 유지하고, 관련성이 낮은 콘텐츠는 가벼운 스텁으로 대체합니다. 또한 모델이 필요할 때만 전체 콘텐츠를 요청할 수 있도록 검색 도구를 반환합니다.

## 빠른 시작

```python
import litellm
from litellm.types.utils import CallTypes

messages = [
    {"role": "system", "content": "You are a coding assistant."},
    {"role": "user", "content": "# auth.py\n" + "def authenticate():\n    pass\n" * 2000},
    {"role": "user", "content": "# utils.py\n" + "def helper():\n    pass\n" * 2000},
    {"role": "user", "content": "Fix the bug in auth.py"},
]

compressed = litellm.compress(
    messages=messages,
    model="gpt-4o",
    call_type=CallTypes.completion,
    compression_trigger=1000,
    compression_target=500,
)

response = litellm.completion(
    model="gpt-4o",
    messages=compressed["messages"],
    tools=compressed["tools"],
)
```

## 반환값

`compress()`는 다음 항목이 포함된 딕셔너리를 반환합니다.

- `messages`: 압축된 대화 메시지
- `original_tokens`: 압축 전 토큰 수
- `compressed_tokens`: 압축 후 토큰 수
- `compression_ratio`: 제거된 토큰의 비율
- `cache`: 스텁 키 -> 원본 전체 콘텐츠의 키-값 매핑
- `tools`: 필요 시 복원에 사용하는 검색 도구 정의(`litellm_content_retrieve`)

## 파라미터

- `messages` (`List[dict]`, 필수): 입력 대화 메시지
- `model` (`str`, 필수): 토큰 계산에 사용할 모델 이름
- `call_type` (`CallTypes`, 기본값 `CallTypes.completion`): 이 메시지들이 따르는 메시지 스키마의 LiteLLM 호출 타입. 지원 값은 `CallTypes.completion` / `CallTypes.acompletion`(OpenAI chat-completions 형태) 및 `CallTypes.anthropic_messages`(Anthropic Messages 형태)입니다.
- `compression_trigger` (`int`, 기본값 `200000`): 입력 토큰 수가 이 값을 초과할 때만 압축합니다.
- `compression_target` (`Optional[int]`, 기본값 `compression_trigger`의 `70%`): 압축 후 목표 토큰 예산
- `embedding_model` (`Optional[str]`): 설정하면 BM25 + 임베딩 관련성 점수를 결합합니다.
- `embedding_model_params` (`Optional[dict]`): `litellm.embedding()`에 전달할 추가 kwargs
- `compression_cache` (`Optional[DualCache]`): 임베딩 점수 계산에 사용할 선택적 캐시

## 동작 참고

- `compression_trigger`보다 작은 메시지는 변경 없이 그대로 전달됩니다.
- system 메시지, 마지막 user 메시지, 마지막 assistant 메시지는 항상 보존됩니다.
- 관련 메시지가 남은 예산에 완전히 들어가지 않으면 `compress()`가 해당 메시지의 잘린 버전을 유지할 수 있습니다.
- 압축으로 제외된 콘텐츠는 손실되지 않습니다. `cache`에 저장되며 `litellm_content_retrieve`로 참조할 수 있습니다.

## 검색 도구 호출 처리

모델이 `litellm_content_retrieve`를 호출하면 `compressed["cache"]`에서 요청된 키를 찾아 해당 값을 도구 출력으로 반환합니다.

```python
import json

tool_call = response.choices[0].message.tool_calls[0]
args = json.loads(tool_call.function.arguments)
full_content = compressed["cache"][args["key"]]
```

## 서버 측 콜백 루프 (`/v1/messages`)

콜백 기반 압축 인터셉션을 활성화하면 Anthropic Messages 호출에서 검색 루프를
투명하게 처리할 수 있습니다.

```yaml
litellm_settings:
  callbacks: ["compression_interception"]
  compression_interception_params:
    enabled: true
    compression_trigger: 10000
    compression_target: 7000
```

이 기능을 활성화하면 LiteLLM은 다음 서버 측 흐름을 실행합니다.

1. 첫 provider 호출 전에 들어온 메시지를 압축합니다.
2. `litellm_content_retrieve` 도구를 주입합니다.
3. 모델 응답에서 검색 `tool_use` 블록을 감지합니다.
4. 압축 캐시에서 검색 키를 해석합니다.
5. agentic loop를 통해 모델을 다시 실행하고 최종 답변을 반환합니다.

## 성능

[SWE-bench Lite](https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite_bm25_27K)에서 벤치마크했습니다(문제마다 BM25로 검색된 약 27k 토큰의 repo 컨텍스트가 포함된 실제 GitHub 이슈).

### Claude Opus — 5개 문제, trigger=10k

| 지표 | 기준 | 압축 적용 | 차이 |
|---|---|---|---|
| 파일 겹침 | 1.000 | 1.000 | +0.000 |
| 정확한 파일 일치 | 100% | 100% | +0.0% |
| hunk 겹침 | 0.582 | 0.361 | -0.221 |
| 콘텐츠 유사도 | 0.367 | 0.373 | +0.006 |
| 평균 프롬프트 토큰 | 30,828 | 6,890 | -77.7% |
| 문제당 평균 비용 | $0.488 | $0.136 | **-72.0%** |

**핵심 요약:**

- **파일 수준 타기팅은 완전히 보존됩니다** — 압축 여부와 관계없이 모델은 동일한 파일을 편집합니다.
- **콘텐츠 유사도는 기준과 비슷합니다** — 실제로 변경된 줄은 비교 가능한 수준입니다.
- **hunk 겹침은 소폭 감소합니다**(-0.221) — 모델은 올바른 파일을 타기팅하지만 주변 컨텍스트가 줄어들어 약간 다른 줄 범위를 편집할 수 있습니다.
- 토큰을 78% 줄이면서 **72% 비용 절감**을 달성했습니다.

### 지표 설명

| 지표 | 측정 대상 |
|---|---|
| **파일 겹침** | 생성된 패치에 포함된 gold-patch 파일의 비율 |
| **정확한 파일 일치** | 생성된 패치가 정확히 동일한 파일 집합을 수정했는지 여부 |
| **hunk 겹침** | 생성된 hunk가 포함하는 gold hunk 줄 범위의 비율 |
| **콘텐츠 유사도** | gold 패치와 생성된 패치 사이 변경 줄(추가/삭제)의 Jaccard 유사도 |

### SWE-bench eval 실행

```bash
# 5-problem quick check
python tests/eval_swe_bench.py --model claude-opus-4-20250514 --problems 5

# Custom trigger/target
python tests/eval_swe_bench.py --model gpt-4o --problems 20 \
    --compression-trigger 15000 --compression-target 10000

# With embedding scoring
python tests/eval_swe_bench.py --model gpt-4o --problems 10 \
    --embedding-model text-embedding-3-small
```

### HumanEval-style eval 실행

```bash
python scripts/eval_compression.py --model gpt-4o --problems 5
```
