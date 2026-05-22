import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Argilla 

Argilla는 프로젝트에 사용할 고품질 데이터셋을 구축해야 하는 AI 엔지니어와 도메인 전문가를 위한 협업형 주석 도구입니다.


## 시작하기

데이터를 Argilla에 기록하려면 먼저 Argilla 서버를 배포해야 합니다. 아직 Argilla 서버를 배포하지 않았다면 [여기](https://docs.argilla.io/latest/getting_started/quickstart/)의 안내를 따르세요.

다음으로 Argilla 데이터셋을 구성하고 생성해야 합니다.

```python
import argilla as rg

client = rg.Argilla(api_url="<api_url>", api_key="<api_key>")

settings = rg.Settings(
    guidelines="These are some guidelines.",
    fields=[
        rg.ChatField(
            name="user_input",
        ),
        rg.TextField(
            name="llm_output",
        ),
    ],
    questions=[
        rg.RatingQuestion(
            name="rating",
            values=[1, 2, 3, 4, 5, 6, 7],
        ),
    ],
)

dataset = rg.Dataset(
    name="my_first_dataset",
    settings=settings,
)

dataset.create()
```

추가 구성은 [Argilla 문서](https://docs.argilla.io/latest/how_to_guides/dataset/)를 참고하세요.


## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
import litellm
from litellm import completion

# add env vars
os.environ["ARGILLA_API_KEY"]="argilla.apikey"
os.environ["ARGILLA_BASE_URL"]="http://localhost:6900"
os.environ["ARGILLA_DATASET_NAME"]="my_first_dataset"   
os.environ["OPENAI_API_KEY"]="sk-proj-..."

litellm.callbacks = ["argilla"]

# add argilla transformation object
litellm.argilla_transformation_object = {
    "user_input": "messages", # 👈 key= argilla field, value = either message (argilla.ChatField) | response (argilla.TextField)
    "llm_output": "response"
}

## LLM CALL ## 
response = completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)
```

</TabItem>

<TabItem value="proxy" label="프록시">

```yaml
litellm_settings:
  callbacks: ["argilla"]
  argilla_transformation_object:
    user_input: "messages" # 👈 key= argilla field, value = either message (argilla.ChatField) | response (argilla.TextField)
    llm_output: "response"
```

</TabItem>
</Tabs>

## 예제 출력 {#example-output}

<Image img={require('../../img/argilla.png')} />

## Argilla 호출에 샘플링 비율 추가 {#add-sampling-rate-to-argilla-calls}

Argilla 호출 중 일부 샘플만 기록하려면 환경 변수에 `ARGILLA_SAMPLING_RATE`를 추가하세요.

```bash
ARGILLA_SAMPLING_RATE=0.1 # log 10% of calls to argilla
```
