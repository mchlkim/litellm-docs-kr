import Image from '@theme/IdealImage';

# LiteLLM을 사용해 테스트 세트에서 LLM 비교하기 {#comparing-llms-on-a-test-set-using-litellm}


<div class="cell markdown" id="L-W4C3SgClxl">

LiteLLM을 사용하면 어떤 LLM이든 다음 모델의 드롭인 대체재로 사용할 수 있습니다.
`gpt-3.5-turbo`

이 노트북에서는 litellm을 사용해 주어진 테스트 세트에서 GPT-4와 Claude-2를 비교하는 방법을 단계별로 설명합니다.

## 이 튜토리얼을 마친 뒤의 출력: {#output-at-the-end-of-this-tutorial}
<Image img={require('../../img/compare_llms.png')} />
<br></br>

</div>

<div class="cell code" id="fBkbl4Qo9pvz">

``` python
!uv add litellm
```

</div>

<div class="cell code" execution_count="16" id="tzS-AXWK8lJC">

``` python
from litellm import completion
import litellm

# init your test set questions
questions = [
    "how do i call completion() using LiteLLM",
    "does LiteLLM support VertexAI",
    "how do I set my keys on replicate llama2?",
]


# set your prompt
prompt = """
You are a coding assistant helping users using litellm.
litellm is a light package to simplify calling OpenAI, Azure, Cohere, Anthropic, Huggingface API Endpoints. It manages:

"""
```

</div>

<div class="cell code" execution_count="18" id="vMlqi40x-KAA">

``` python
import os
os.environ['OPENAI_API_KEY'] = ""
os.environ['ANTHROPIC_API_KEY'] = ""
```

</div>

<div class="cell markdown" id="-HOzUfpK-H8J">

</div>

<div class="cell markdown" id="Ktn25dfKEJF1">

## 같은 질문으로 gpt-3.5-turbo와 claude-2 호출하기 {#calling-gpt-35-turbo-and-claude-2-on-the-same-questions}

## LiteLLM `completion()`으로 모든 LLM을 같은 형식으로 호출할 수 있습니다 {#litellm-completion-allows-you-to-call-all-llms-in-the-same-format}

</div>

<div class="cell code" id="DhXwRlc-9DED">

``` python
results = [] # for storing results

models = ['gpt-3.5-turbo', 'claude-2'] # define what models you're testing, see: https://docs.litellm.ai/docs/providers
for question in questions:
    row = [question]
    for model in models:
      print("Calling:", model, "question:", question)
      response = completion( # using litellm.completion
            model=model,
            messages=[
                {'role': 'system', 'content': prompt},
                {'role': 'user', 'content': question}
            ]
      )
      answer = response.choices[0].message['content']
      row.append(answer)
      print(print("Calling:", model, "answer:", answer))

    results.append(row) # save results

```

</div>

<div class="cell markdown" id="RkEXhXxCDN77">

## 결과 시각화하기 {#visualizing-results}

</div>

<div class="cell code" execution_count="15"
colab="{&quot;base_uri&quot;:&quot;https://localhost:8080/&quot;,&quot;height&quot;:761}"
id="42hrmW6q-n4s" outputId="b763bf39-72b9-4bea-caf6-de6b2412f86d">

``` python
# Create a table to visualize results
import pandas as pd

columns = ['Question'] + models
df = pd.DataFrame(results, columns=columns)

df
```
## 출력 테이블 {#output-table}
<Image img={require('../../img/compare_llms.png')} />

</div>
