import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLM 벤치마크 - LM Harness, FastEval, Flask {#benchmark-llms---lm-harness-fasteval-flask}

## LM Harness 벤치마크
litellm proxy의 `/completions` endpoint를 통해 TGI로 LLM을 20배 더 빠르게 평가합니다.

이 튜토리얼은 [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness/tree/big-refactor)의 `big-refactor` branch를 사용한다고 가정합니다.

참고: LM Harness는 아직 `openai 1.0.0+` 사용 방식으로 업데이트되지 않았으므로, 이를 처리하기 위해 venv에서 lm harness를 실행합니다.

**Step 1: 로컬 proxy 시작**
지원되는 model은 [여기](https://docs.litellm.ai/docs/simple_proxy)에서 확인할 수 있습니다.
```shell
$ litellm --model huggingface/bigcode/starcoder
```

사용자 지정 api base 사용

```shell
$ export HUGGINGFACE_API_KEY=my-api-key #[OPTIONAL]
$ litellm --model huggingface/tinyllama --api_base https://k58ory32yinf1ly0.us-east-1.aws.endpoints.huggingface.cloud
```
OpenAI compatible endpoint는 http://0.0.0.0:8000 에서 실행됩니다.

**Step 2: LM Harness용 Virtual Env 생성 + OpenAI 0.28.1 사용**
이제 `openai==0.28.1`이 설치된 새 virtual env에서 lm harness를 실행합니다.

```shell
python3 -m venv lmharness 
source lmharness/bin/activate
```

venv에서 openai==0.28.01을 pip install합니다.
```shell
uv add openai==0.28.01
```

**Step 3: OpenAI API Base 및 Key 설정**
```shell
$ export OPENAI_BASE_URL=http://0.0.0.0:8000
```

LM Harness에서 benchmark를 실행하려면 OpenAI API key인 `OPENAI_API_SECRET_KEY`를 설정해야 합니다.
```shell
export OPENAI_API_SECRET_KEY=anything
```

**Step 4: LM-Eval-Harness 실행**
```shell
cd lm-evaluation-harness
```

venv에서 lm harness dependencies를 uv로 추가합니다.
```
uv sync
```

```shell
python3 -m lm_eval \
  --model openai-completions \
  --model_args engine=davinci \
  --task crows_pairs_english_age

```
## FastEval

**Step 1: 로컬 proxy 시작**
지원되는 model은 [여기](https://docs.litellm.ai/docs/simple_proxy)에서 확인할 수 있습니다.
```shell
$ litellm --model huggingface/bigcode/starcoder
```

**Step 2: OpenAI API Base 및 Key 설정**
```shell
$ export OPENAI_BASE_URL=http://0.0.0.0:8000
```

proxy가 credentials를 가지고 있으므로 이 값은 아무 값으로 설정해도 됩니다.
```shell
export OPENAI_API_KEY=anything
```

**Step 3: FastEval로 실행**

**FastEval clone**
```shell
# Clone this repository, make it the current working directory
git clone --depth 1 https://github.com/FastEval/FastEval.git
cd FastEval
```

**FastEval에서 API Base 설정**

FastEval에서 `OPENAI_BASE_URL`을 설정하려면 다음 **2줄 code change**를 적용합니다.

https://github.com/FastEval/FastEval/pull/90/files
```python
try:
    api_base = os.environ["OPENAI_BASE_URL"] #changed: read api base from .env
    if api_base == None:
        api_base = "https://api.openai.com/v1"
    response = await self.reply_two_attempts_with_different_max_new_tokens(
        conversation=conversation,
        api_base=api_base, # #changed: pass api_base
        api_key=os.environ["OPENAI_API_KEY"],
        temperature=temperature,
        max_new_tokens=max_new_tokens,
```

**FastEval 실행**
`-b`를 실행하려는 benchmark로 설정합니다. 가능한 값은 `mt-bench`, `human-eval-plus`, `ds1000`, `cot`, `cot/gsm8k`, `cot/math`, `cot/bbh`, `cot/mmlu`, `custom-test-data`입니다.

LiteLLM이 OpenAI compatible proxy를 제공하므로 `-t`와 `-m`은 변경할 필요가 없습니다.
`-t`는 openai로 유지합니다.
`-m`은 gpt-3.5로 유지합니다.

```shell
./fasteval -b human-eval-plus -t openai -m gpt-3.5-turbo
```

## FLASK - 세분화된 언어 모델 평가 {#flask---fine-grained-language-model-evaluation}
litellm을 사용해 FLASK에서 모든 LLM을 평가합니다. https://github.com/kaistAI/FLASK

**Step 1: 로컬 proxy 시작**
```shell
$ litellm --model huggingface/bigcode/starcoder
```

**Step 2: OpenAI API Base 및 Key 설정**
```shell
$ export OPENAI_BASE_URL=http://0.0.0.0:8000
```

**Step 3: FLASK로 실행**

```shell
git clone https://github.com/kaistAI/FLASK
```
```shell
cd FLASK/gpt_review
```

eval을 실행합니다.
```shell
python gpt4_eval.py -q '../evaluation_set/flask_evaluation.jsonl'
```

## 디버깅 {#debugging}

### proxy에 테스트 요청 보내기 {#making-a-test-request-to-your-proxy}
이 command는 proxy server에 테스트 Completion 및 ChatCompletion request를 보냅니다.
```shell
litellm --test
```
