import Image from '@theme/IdealImage';

# LLM 벤치마크
다음 항목을 확인하면서 특정 질문에 대해 LLM을 쉽게 벤치마크할 수 있습니다.
* 응답
* 응답 비용
* 응답 시간

### 벤치마크 출력
<Image img={require('../../img/bench_llm.png')} />

## 설정:
```
git clone https://github.com/BerriAI/litellm
```
`litellm/cookbook/benchmark` 디렉터리로 이동합니다.

위치는 다음과 같습니다.
https://github.com/BerriAI/litellm/tree/main/cookbook/benchmark
```
cd litellm/cookbook/benchmark
```

### 의존성 설치
```
uv add litellm click tqdm tabulate termcolor
```

### `benchmark.py`에서 LLM API 키와 LLM 설정
`benchmark/benchmark.py`에서 사용할 LLM, LLM API 키, 질문을 선택합니다.

지원되는 LLM: https://docs.litellm.ai/docs/providers

```python
# 벤치마크할 모델 목록을 정의합니다.
models = ['gpt-3.5-turbo', 'claude-2']

# LLM API 키를 입력합니다.
os.environ['OPENAI_API_KEY'] = ""
os.environ['ANTHROPIC_API_KEY'] = ""

# 벤치마크할 질문 목록입니다. 필요한 질문으로 바꾸세요.
questions = [
    "When will BerriAI IPO?",
    "When will LiteLLM hit $100M ARR?"
]

```

## `benchmark.py` 실행
```
python3 benchmark.py
```

## 예상 출력
```
Running question: When will BerriAI IPO? for model: claude-2: 100%|████████████████████████████████████████████████████████████████████████████████████| 3/3 [00:13<00:00,  4.41s/it]

Benchmark Results for 'When will BerriAI IPO?':
+-----------------+----------------------------------------------------------------------------------+---------------------------+------------+
| Model           | Response                                                                         | Response Time (seconds)   | Cost ($)   |
+=================+==================================================================================+===========================+============+
| gpt-3.5-turbo   | As an AI language model, I cannot provide up-to-date information or predict      | 1.55 seconds              | $0.000122  |
|                 | future events. It is best to consult a reliable financial source or contact      |                           |            |
|                 | BerriAI directly for information regarding their IPO plans.                      |                           |            |
+-----------------+----------------------------------------------------------------------------------+---------------------------+------------+
| togethercompute | I'm not able to provide information about future IPO plans or dates for BerriAI  | 8.52 seconds              | $0.000531  |
| r/llama-2-70b-c | or any other company. IPO (Initial Public Offering) plans and timelines are      |                           |            |
| hat             | typically kept private by companies until they are ready to make a public        |                           |            |
|                 | announcement.  It's important to note that IPO plans can change and are subject  |                           |            |
|                 | to various factors, such as market conditions, financial performance, and        |                           |            |
|                 | regulatory approvals. Therefore, it's difficult to predict with certainty when   |                           |            |
|                 | BerriAI or any other company will go public.  If you're interested in staying    |                           |            |
|                 | up-to-date with BerriAI's latest news and developments, you may want to follow   |                           |            |
|                 | their official social media accounts, subscribe to their newsletter, or visit    |                           |            |
|                 | their website periodically for updates.                                          |                           |            |
+-----------------+----------------------------------------------------------------------------------+---------------------------+------------+
| claude-2        | I do not have any information about when or if BerriAI will have an initial      | 3.17 seconds              | $0.002084  |
|                 | public offering (IPO). As an AI assistant created by Anthropic to be helpful,    |                           |            |
|                 | harmless, and honest, I do not have insider knowledge about Anthropic's business |                           |            |
|                 | plans or strategies.                                                             |                           |            |
+-----------------+----------------------------------------------------------------------------------+---------------------------+------------+
```
## 지원
**🤝 1:1 세션 예약:** 문제를 논의하거나 피드백을 제공하거나 LiteLLM을 어떻게 개선할 수 있을지 살펴보려면 창립자인 Krrish와 Ishaan과의 [1:1 세션](https://enterprise.litellm.ai/demo)을 예약하세요.


<!-- 
## 사전 요구 사항:
``` python
!uv add litellm
```

## 예제 사용 사례 1 - 코드 생성기

### 시스템 프롬프트와 질문 입력
```` python
# 시스템 프롬프트가 있으면 입력합니다.
system_prompt = """
당신은 사용자가 litellm을 사용할 수 있도록 돕는 코딩 어시스턴트입니다.
litellm은 OpenAI, Azure, Cohere, Anthropic, Huggingface API 엔드포인트 호출을 단순화하는 가벼운 패키지입니다.
--
사용 예:
```
uv add litellm
import litellm # litellm을 가져옵니다.
## ENV 변수를 설정합니다.
os.environ["OPENAI_API_KEY"] = "openai key"
os.environ["COHERE_API_KEY"] = "cohere key"
messages = [{ "content": "Hello, how are you?","role": "user"}]
# openai 호출
response = litellm.completion(model="gpt-3.5-turbo", messages=messages) # 호출
# cohere 호출
response = litellm.completion("command-nightly", messages) # 호출
```

"""


# LLM에서 실행할 질문/로그입니다.
questions = [
    "what is litellm?",
    "why should I use LiteLLM",
    "does litellm support Anthropic LLMs",
    "write code to make a litellm completion call",
]
````

### 질문 실행

### 여기에서 100개 이상의 LLM을 선택하세요: <https://docs.litellm.ai/docs/providers> {#select-from-100-llms-here-httpsdocslitellmaidocsproviders}

``` python
import litellm
from litellm import completion, completion_cost
import os
import time

# 선택 사항: 로그를 보려면 litellm 대시보드를 사용합니다.
# litellm.use_client = True
# litellm.token = "ishaan_2@berri.ai" # 이메일을 설정합니다.


# API 키를 설정합니다.
os.environ['TOGETHERAI_API_KEY'] = ""
os.environ['OPENAI_API_KEY'] = ""
os.environ['ANTHROPIC_API_KEY'] = ""


# 벤치마크할 LLM을 선택합니다.
# llama2에는 https://api.together.xyz/playground 를 사용합니다.
# 지원되는 LLM은 여기에서 시도할 수 있습니다: https://docs.litellm.ai/docs/providers

models = ['togethercomputer/llama-2-70b-chat', 'gpt-3.5-turbo', 'claude-instant-1.2']
data = []

for question in questions: # 질문별로 그룹화합니다.
  for model in models:
    print(f"running question: {question} for model: {model}")
    start_time = time.time()
    # 각 질문의 응답, 응답 시간, 비용을 표시합니다.
    response = completion(
        model=model,
        max_tokens=500,
        messages = [
            {
              "role": "system", "content": system_prompt
            },
            {
              "role": "user", "content": question
            }
        ],
    )
    end = time.time()
    total_time = end-start_time # 응답 시간
    # print(response)
    cost = completion_cost(response) # completion 비용
    raw_response = response['choices'][0]['message']['content'] # 응답 문자열


    # pandas df에 로그를 추가합니다.
    data.append(
        {
            'Model': model,
            'Question': question,
            'Response': raw_response,
            'ResponseTime': total_time,
            'Cost': cost
        })
```

### LLM 벤치마크 보기
``` python
from IPython.display import display
from IPython.core.interactiveshell import InteractiveShell
InteractiveShell.ast_node_interactivity = "all"
from IPython.display import HTML
import pandas as pd

df = pd.DataFrame(data)
grouped_by_question = df.groupby('Question')

for question, group_data in grouped_by_question:
    print(f"Question: {question}")
    HTML(group_data.to_html())
```

<table border="1" class="dataframe">
  <thead>
    <tr>
      <th></th>
      <th>Model</th>
      <th>Question</th>
      <th>Response</th>
      <th>ResponseTime</th>
      <th>Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>togethercomputer/llama-2-70b-chat</td>
      <td>what is litellm?</td>
      <td>Litellm is a lightweight Python package that simplifies calling various AI API endpoints, including OpenAI, Azure, Cohere, Anthropic, and Hugging Face. It provides a convenient interface for making requests to these APIs, allowing developers to easily integrate them into their applications. With Litellm, developers can quickly and easily interact with multiple AI models and services, without having to handle the details of authentication, API calls, and response parsing. This makes it easier to build and deploy AI-powered applications, and can help developers save time and effort.</td>
      <td>13.479644</td>
      <td>0.000870</td>
    </tr>
    <tr>
      <th>1</th>
      <td>gpt-3.5-turbo</td>
      <td>what is litellm?</td>
      <td>litellm is a light package that provides a simplified interface for making API calls to various language models and APIs. It abstracts away the complexities of handling network requests, authentication, and response parsing, making it easier for developers to integrate powerful language models into their applications.\n\nWith litellm, you can quickly make API calls to models like OpenAI's GPT-3.5 Turbo, Azure's Text Analytics, Cohere's Command API, Anthropic's API, and Huggingface's models. It also supports additional functionality like conversational AI, summarization, translation, and more.\n\nBy using litellm, you can focus on your application logic without getting tangled in the details of API integration, allowing you to quickly build intelligent and conversational applications.</td>
      <td>8.324332</td>
      <td>0.000566</td>
    </tr>
    <tr>
      <th>2</th>
      <td>claude-instant-1.2</td>
      <td>what is litellm?</td>
      <td>litellm is a Python library that simplifies calling various AI API endpoints like OpenAI, Azure, Cohere, Anthropic, and Huggingface. \n\nSome key things to know about litellm:\n\n- It provides a consistent interface for completing prompts and generating responses from different AI models through a single method called completion().\n\n- You specify the API (e.g. OpenAI, Cohere etc.) and model either by name or by setting environment variables before making the completion call.\n\n- This avoids having to use different SDKs or APIs for each provider and standardizes the call structure. \n\n- It handles things like setting headers, encoding inputs, parsing responses so the user doesn't have to deal with those details.\n\n- The goal is to make it easy to try different AI APIs and models without having to change code or learn different interfaces.\n\n- It's lightweight with no other dependencies required besides what's needed for each API (e.g. openai, azure SDKs etc.).\n\nSo in summary, litellm is a small library that provides a common way to interact with multiple conversational AI APIs through a single Python method, avoiding the need to directly use each provider's specific SDK.</td>
      <td>10.316488</td>
      <td>0.001603</td>
    </tr>
  </tbody>
</table>

## 예제 사용 사례 2 - 사용자 입력을 간결하게 다시 쓰기

``` python
# 시스템 프롬프트가 있으면 입력합니다.
system_prompt = """
For a given user input, rewrite the input to make be more concise.
"""

# 다시 쓸 사용자 입력 질문입니다.
questions = [
    "LiteLLM is a lightweight Python package that simplifies the process of making API calls to various language models. Here are some reasons why you should use LiteLLM:nn1. **Simplified API Calls**: LiteLLM abstracts away the complexity of making API calls to different language models. It provides a unified interface for invoking models from OpenAI, Azure, Cohere, Anthropic, Huggingface, and more.nn2. **Easy Integration**: LiteLLM seamlessly integrates with your existing codebase. You can import the package and start making API calls with just a few lines of code.nn3. **Flexibility**: LiteLLM supports a variety of language models, including GPT-3, GPT-Neo, chatGPT, and more. You can choose the model that suits your requirements and easily switch between them.nn4. **Convenience**: LiteLLM handles the authentication and connection details for you. You just need to set the relevant environment variables, and the package takes care of the rest.nn5. **Quick Prototyping**: LiteLLM is ideal for rapid prototyping and experimentation. With its simple API, you can quickly generate text, chat with models, and build interactive applications.nn6. **Community Support**: LiteLLM is actively maintained and supported by a community of developers. You can find help, share ideas, and collaborate with others to enhance your projects.nnOverall, LiteLLM simplifies the process of making API calls to language models, saving you time and effort while providing flexibility and convenience",
    "Hi everyone! I'm [your name] and I'm currently working on [your project/role involving LLMs]. I came across LiteLLM and was really excited by how it simplifies working with different LLM providers. I'm hoping to use LiteLLM to [build an app/simplify my code/test different models etc]. Before finding LiteLLM, I was struggling with [describe any issues you faced working with multiple LLMs]. With LiteLLM's unified API and automatic translation between providers, I think it will really help me to [goals you have for using LiteLLM]. Looking forward to being part of this community and learning more about how I can build impactful applications powered by LLMs!Let me know if you would like me to modify or expand on any part of this suggested intro. I'm happy to provide any clarification or additional details you need!",
    "Traceloop is a platform for monitoring and debugging the quality of your LLM outputs. It provides you with a way to track the performance of your LLM application; rollout changes with confidence; and debug issues in production. It is based on OpenTelemetry, so it can provide full visibility to your LLM requests, as well vector DB usage, and other infra in your stack."
]
```

### 질문 실행

``` python
import litellm
from litellm import completion, completion_cost
import os
import time

# 선택 사항: 로그를 보려면 litellm 대시보드를 사용합니다.
# litellm.use_client = True
# litellm.token = "ishaan_2@berri.ai" # 이메일을 설정합니다.

os.environ['TOGETHERAI_API_KEY'] = ""
os.environ['OPENAI_API_KEY'] = ""
os.environ['ANTHROPIC_API_KEY'] = ""

models = ['togethercomputer/llama-2-70b-chat', 'gpt-3.5-turbo', 'claude-instant-1.2'] # 벤치마크할 llm을 입력합니다.
data_2 = []

for question in questions: # 질문별로 그룹화합니다.
  for model in models:
    print(f"running question: {question} for model: {model}")
    start_time = time.time()
    # 각 질문의 응답, 응답 시간, 비용을 표시합니다.
    response = completion(
        model=model,
        max_tokens=500,
        messages = [
            {
              "role": "system", "content": system_prompt
            },
            {
              "role": "user", "content": "User input:" + question
            }
        ],
    )
    end = time.time()
    total_time = end-start_time # 응답 시간
    # print(response)
    cost = completion_cost(response) # completion 비용
    raw_response = response['choices'][0]['message']['content'] # 응답 문자열
    #print(raw_response, total_time, cost)

    # pandas df에 추가합니다.
    data_2.append(
        {
            'Model': model,
            'Question': question,
            'Response': raw_response,
            'ResponseTime': total_time,
            'Cost': cost
        })


```
### 로그 보기 - 질문별 그룹화
``` python
from IPython.display import display
from IPython.core.interactiveshell import InteractiveShell
InteractiveShell.ast_node_interactivity = "all"
from IPython.display import HTML
import pandas as pd

df = pd.DataFrame(data_2)
grouped_by_question = df.groupby('Question')

for question, group_data in grouped_by_question:
    print(f"Question: {question}")
    HTML(group_data.to_html())
```

#### 사용자 질문
    질문: 안녕하세요! 저는 [이름]이고 현재 [LLM 관련 프로젝트/역할]을 진행하고 있습니다. LiteLLM이 여러 LLM 제공업체와 작업하는 과정을 단순화한다는 점이 흥미로워 사용해 보려고 합니다. LiteLLM으로 [앱 빌드/코드 단순화/여러 모델 테스트 등]을 하고 싶습니다. LiteLLM을 찾기 전에는 [여러 LLM을 다루며 겪은 문제]로 어려움을 겪었습니다. LiteLLM의 통합 API와 제공업체 간 자동 변환이 [LiteLLM 사용 목표]를 달성하는 데 큰 도움이 될 것 같습니다. 이 커뮤니티에 참여해 LLM 기반 애플리케이션을 만드는 방법을 더 배우고 싶습니다. 이 소개 문구에서 수정하거나 확장할 부분이 있으면 알려주세요. 필요한 설명이나 추가 세부 정보도 제공할 수 있습니다.
#### 로그
<table border="1" class="dataframe">
  <thead>
    <tr>
      <th></th>
      <th>Model</th>
      <th>Response</th>
      <th>ResponseTime</th>
      <th>Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3</th>
      <td>togethercomputer/llama-2-70b-chat</td>
      <td>n다음은 사용자 입력을 더 간결하게 다시 쓴 버전입니다:nn"안녕하세요! 저는 [이름]이고 [LLM 관련 프로젝트/역할]을 진행하고 있습니다. 최근 LiteLLM을 알게 되었고 [앱 빌드/코드 단순화/여러 모델 테스트 등]에 활용해 보고 싶습니다. LiteLLM 이전에는 [여러 LLM을 다루며 겪은 문제]로 어려움을 겪었습니다. LiteLLM의 통합 API와 자동 변환 기능으로 목표를 달성하고 싶습니다. LLM 기반 애플리케이션을 만드는 방법을 더 배우고 이 커뮤니티에 참여하고 싶습니다. 질문이나 추가 설명이 필요하면 알려주세요."nn이 수정 버전에서는 핵심 정보만 남기고 불필요한 표현을 줄였습니다. 일부 문장도 더 간결하고 읽기 쉽게 바꾸었습니다.</td>
      <td>18.300620</td>
      <td>0.001200</td>
    </tr>
    <tr>
      <th>4</th>
      <td>gpt-3.5-turbo</td>
      <td>사용자 입력: 안녕하세요. 저는 [이름]이고 LiteLLM으로 여러 LLM 제공업체와의 작업을 단순화할 수 있다는 점이 기대됩니다. LiteLLM을 찾기 전에는 여러 LLM을 다루는 데 어려움이 있었습니다. LiteLLM의 통합 API와 자동 변환이 [목표 작성]을 달성하는 데 도움이 될 것 같습니다. 이 커뮤니티에 참여해 LLM으로 영향력 있는 애플리케이션을 만드는 방법을 배우고 싶습니다. 추가 설명이나 세부 정보가 필요하면 알려주세요.</td>
      <td>7.385472</td>
      <td>0.000525</td>
    </tr>
    <tr>
      <th>5</th>
      <td>claude-instant-1.2</td>
      <td>다음은 사용자 입력을 더 간결하게 다시 쓴 버전입니다:nn안녕하세요, 저는 [이름]입니다. 현재 [프로젝트/역할]을 진행하고 있으며, 통합 API로 여러 LLM 작업을 단순화하는 LiteLLM을 알게 되었습니다. 이전에 [문제]로 어려움을 겪었기 때문에 LiteLLM으로 [앱 빌드/코드 단순화/모델 테스트]를 해보고 싶습니다. LiteLLM의 제공업체 간 자동 변환은 [목표]를 달성하고 LLM 애플리케이션을 만드는 데 도움이 될 것입니다. 이 커뮤니티에서 더 배우고 싶습니다. LiteLLM 사용 계획에 대해 설명이 필요하면 알려주세요.</td>
      <td>8.628217</td>
      <td>0.001022</td>
    </tr>
  </tbody>
</table> -->
