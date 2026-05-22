# /evals

LiteLLM Proxy는 OpenAI Evaluations(Evals) API를 지원합니다. 정의한 테스트 기준에 따라 모델 성능을 측정하도록 평가를 만들고, 관리하고, 실행할 수 있습니다.

## Evals란?

OpenAI Evals API는 다음을 구조적으로 수행하는 방법을 제공합니다.
- **평가 생성**: 모델 출력 평가에 사용할 테스트 기준과 데이터 소스를 정의합니다.
- **평가 실행**: 특정 모델과 데이터셋을 대상으로 평가를 실행합니다.
- **결과 추적**: 평가 진행 상황을 모니터링하고 상세 결과를 검토합니다.

## 빠른 시작

### LiteLLM Proxy 설정

먼저 LiteLLM Proxy 서버를 시작합니다.

```bash
litellm --config config.yaml

# Proxy will run on http://localhost:4000
```

### OpenAI Client 초기화

```python
from openai import OpenAI

# Point to your LiteLLM Proxy
client = OpenAI(
    api_key="sk-1234",  # Your LiteLLM proxy API key
    base_url="http://localhost:4000"  # Your proxy URL
)
```


비동기 작업에는 다음을 사용합니다.

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)
```

---

## 평가 관리

### 평가 생성

테스트 기준과 데이터 소스 구성으로 평가를 생성합니다.

#### 예제: 감성 분류 Eval

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

# Create evaluation with label model grader
eval_obj = client.evals.create(
    name="Sentiment Classification",
    data_source_config={
        "type": "stored_completions",
        "metadata": {"usecase": "chatbot"}
    },
    testing_criteria=[
        {
            "type": "label_model",
            "model": "gpt-4o-mini",
            "input": [
                {
                    "role": "developer",
                    "content": "Classify the sentiment of the following statement as one of 'positive', 'neutral', or 'negative'"
                },
                {
                    "role": "user",
                    "content": "Statement: {{item.input}}"
                }
            ],
            "passing_labels": ["positive"],
            "labels": ["positive", "neutral", "negative"],
            "name": "Sentiment Grader"
        }
    ]
)

# Note: If you want to use model-specific credentials for this evaluation, you can specify the model name in the extra body parameters.

print(f"Created eval: {eval_obj.id}")
print(f"Eval name: {eval_obj.name}")
```

#### 예제: Push Notifications 요약기 모니터링

이 예제는 push notifications 요약기에서 prompt 변경으로 인한 회귀를 모니터링하는 방법을 보여줍니다.

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

# Define data source for stored completions
data_source_config = {
    "type": "stored_completions",
    "metadata": {
        "usecase": "push_notifications_summarizer"
    }
}

# Define grader criteria
GRADER_DEVELOPER_PROMPT = """
Label the following push notification summary as either correct or incorrect.
The push notification and the summary will be provided below.
A good push notification summary is concise and snappy.
If it is good, then label it as correct, if not, then incorrect.
"""

GRADER_TEMPLATE_PROMPT = """
Push notifications: {{item.input}}
Summary: {{sample.output_text}}
"""

push_notification_grader = {
    "name": "Push Notification Summary Grader",
    "type": "label_model",
    "model": "gpt-4o-mini",
    "input": [
        {
            "role": "developer",
            "content": GRADER_DEVELOPER_PROMPT,
        },
        {
            "role": "user",
            "content": GRADER_TEMPLATE_PROMPT,
        },
    ],
    "passing_labels": ["correct"],
    "labels": ["correct", "incorrect"],
}

# Create the evaluation
eval_result = await client.evals.create(
    name="Push Notification Completion Monitoring",
    metadata={"description": "This eval monitors completions"},
    data_source_config=data_source_config,
    testing_criteria=[push_notification_grader],
)

eval_id = eval_result.id
print(f"Created eval: {eval_id}")
```

### 평가 목록 조회

페이지네이션을 지원하는 전체 평가 목록을 조회합니다.

```python
# List all evaluations
evals_response = client.evals.list(
    limit=20,
    order="desc"
)

for eval in evals_response.data:
    print(f"Eval ID: {eval.id}, Name: {eval.name}")

# Check if there are more evals
if evals_response.has_more:
    # Fetch next page
    next_evals = client.evals.list(
        after=evals_response.last_id,
        limit=20
    )
```

### 특정 평가 조회

ID로 특정 평가의 세부 정보를 조회합니다.

```python
eval = client.evals.retrieve(
    eval_id="eval_abc123"
)

print(f"Eval ID: {eval.id}")
print(f"Name: {eval.name}")
print(f"Data Source: {eval.data_source_config}")
print(f"Testing Criteria: {eval.testing_criteria}")
```

### 평가 업데이트

평가 metadata 또는 이름을 업데이트합니다.

```python
updated_eval = client.evals.update(
    eval_id="eval_abc123",
    name="Updated Evaluation Name",
    metadata={
        "version": "2.0",
        "updated_by": "user@example.com"
    }
)

print(f"Updated eval: {updated_eval.name}")
```

### 평가 삭제

평가를 영구 삭제합니다.

```python
delete_response = client.evals.delete(
    eval_id="eval_abc123"
)

print(f"Deleted: {delete_response.deleted}")  # True
```

---

## 평가 실행

### Run 생성

run을 생성해 평가를 실행합니다. run은 데이터를 모델로 처리하고 테스트 기준을 적용합니다.

#### Stored Completions 사용

먼저 metadata가 포함된 chat completions를 만들어 테스트 데이터를 생성합니다.

```python
from openai import AsyncOpenAI
import asyncio

client = AsyncOpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

# Generate test data with different prompt versions
push_notification_data = [
    """
- New message from Sarah: "Can you call me later?"
- Your package has been delivered!
- Flash sale: 20% off electronics for the next 2 hours!
""",
    """
- Weather alert: Thunderstorm expected in your area.
- Reminder: Doctor's appointment at 3 PM.
- John liked your photo on Instagram.
"""
]

PROMPTS = [
    (
        """
        You are a helpful assistant that summarizes push notifications.
        You are given a list of push notifications and you need to collapse them into a single one.
        Output only the final summary, nothing else.
        """,
        "v1"
    ),
    (
        """
        You are a helpful assistant that summarizes push notifications.
        You are given a list of push notifications and you need to collapse them into a single one.
        The summary should be longer than it needs to be and include more information than is necessary.
        Output only the final summary, nothing else.
        """,
        "v2"
    )
]

# Create completions with metadata for tracking
tasks = []
for notifications in push_notification_data:
    for (prompt, version) in PROMPTS:
        tasks.append(client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "developer", "content": prompt},
                {"role": "user", "content": notifications},
            ],
            metadata={
                "prompt_version": version,
                "usecase": "push_notifications_summarizer"
            }
        ))

await asyncio.gather(*tasks)
```

이제 서로 다른 prompt version을 평가하는 run을 생성합니다.

```python
# Grade prompt_version=v1
eval_run_result = await client.evals.runs.create(
    eval_id=eval_id,
    name="v1-run",
    data_source={
        "type": "completions",
        "source": {
            "type": "stored_completions",
            "metadata": {
                "prompt_version": "v1",
            }
        }
    }
)

print(f"Run ID: {eval_run_result.id}")
print(f"Status: {eval_run_result.status}")
print(f"Report URL: {eval_run_result.report_url}")

# Grade prompt_version=v2
eval_run_result_v2 = await client.evals.runs.create(
    eval_id=eval_id,
    name="v2-run",
    data_source={
        "type": "completions",
        "source": {
            "type": "stored_completions",
            "metadata": {
                "prompt_version": "v2",
            }
        }
    }
)

print(f"Run ID: {eval_run_result_v2.id}")
print(f"Report URL: {eval_run_result_v2.report_url}")
```

#### 서로 다른 모델로 Completions 사용

동일한 입력에서 서로 다른 모델이 어떻게 동작하는지 테스트합니다.

```python
# Test with GPT-4o using stored completions as input
tasks = []
for prompt_version in ["v1", "v2"]:
    tasks.append(client.evals.runs.create(
        eval_id=eval_id,
        name=f"gpt-4o-run-{prompt_version}",
        data_source={
            "type": "completions",
            "input_messages": {
                "type": "item_reference",
                "item_reference": "item.input",
            },
            "model": "gpt-4o",
            "source": {
                "type": "stored_completions",
                "metadata": {
                    "prompt_version": prompt_version,
                }
            }
        }
    ))

results = await asyncio.gather(*tasks)
for run in results:
    print(f"Report URL: {run.report_url}")
```

### Run 목록 조회

특정 평가의 모든 run을 조회합니다.

```python
# List all runs for an evaluation
runs_response = client.evals.runs.list(
    eval_id="eval_abc123",
    limit=20,
    order="desc"
)

for run in runs_response.data:
    print(f"Run ID: {run.id}")
    print(f"Status: {run.status}")
    print(f"Name: {run.name}")
    if run.result_counts:
        print(f"Results: {run.result_counts.passed}/{run.result_counts.total} passed")
```

### Run 세부 정보 조회

결과를 포함해 특정 run의 상세 정보를 조회합니다.

```python
run = client.evals.runs.retrieve(
    eval_id="eval_abc123",
    run_id="run_def456"
)

print(f"Run ID: {run.id}")
print(f"Status: {run.status}")
print(f"Started: {run.started_at}")
print(f"Completed: {run.completed_at}")

# Check results
if run.result_counts:
    print(f"\nOverall Results:")
    print(f"Total: {run.result_counts.total}")
    print(f"Passed: {run.result_counts.passed}")
    print(f"Failed: {run.result_counts.failed}")
    print(f"Error: {run.result_counts.errored}")

# Per-criteria results
if run.per_testing_criteria_results:
    for criteria_result in run.per_testing_criteria_results:
        print(f"\nCriteria {criteria_result.testing_criteria_index}:")
        print(f"  Passed: {criteria_result.result_counts.passed}")
        print(f"  Average Score: {criteria_result.average_score}")
```

### Run 삭제

run과 해당 결과를 영구 삭제합니다.

```python
delete_response = await client.evals.runs.delete(
    eval_id="eval_abc123",
    run_id="run_def456"
)

print(f"Deleted: {delete_response.deleted}")  # True
print(f"Run ID: {delete_response.run_id}")
```
