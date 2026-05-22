# ✨ [BETA] Finetuning을 지원하는 LiteLLM Managed Files


:::info

이 기능은 무료 LiteLLM 엔터프라이즈 기능입니다.

`litellm[proxy]` 패키지 또는 모든 `litellm` docker 이미지에서 사용할 수 있습니다.

:::


| 속성 | 값 | 설명 |
| --- | --- | --- |
| Proxy | ✅ |  |
| SDK | ❌ | 파일 ID를 저장하려면 postgres DB가 필요합니다. |
| 모든 [Batch providers](../batches#supported-providers)에서 사용 가능 | ✅ |  |
| 지원 엔드포인트 | `/fine_tuning/jobs` |  |

## 개요

다음 용도로 사용합니다.

- OpenAI 형식으로 OpenAI/Azure/Vertex AI 전반의 Finetuning 작업을 생성합니다(추가 `custom_llm_provider` 매개변수 필요 없음).
- 키/사용자/팀별로 finetuning 모델 접근을 제어합니다(chat completion 모델과 동일).


## (Proxy Admin) 사용법

개발자에게 Finetuning 모델 접근 권한을 부여하는 방법입니다.

### 1. config.yaml 설정

`supported_endpoints` 목록에 `/fine_tuning`을 포함합니다. 이 모델이 `/fine_tuning` 엔드포인트를 지원한다는 것을 개발자에게 알려줍니다.

```yaml showLineNumbers title="litellm_config.yaml"
model_list:
  - model_name: "gpt-4.1-openai"
    litellm_params:
      model: gpt-4.1
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      supported_endpoints: ["/chat/completions", "/fine_tuning"]
```

### 2. Virtual Key 생성

```bash showLineNumbers title="create_virtual_key.sh"
curl -L -X POST 'https://{PROXY_BASE_URL}/key/generate' \
-H 'Authorization: Bearer ${PROXY_API_KEY}' \
-H 'Content-Type: application/json' \
-d '{"models": ["gpt-4.1-openai"]}'
```


이제 virtual key를 사용해 finetuning 모델에 접근할 수 있습니다(Developer 흐름 참고).

## (Developer) 사용법

LiteLLM managed file을 생성하고 해당 파일로 Finetuning CRUD 작업을 실행하는 방법입니다.

### 1. request.jsonl 생성


```json showLineNumbers title="request.jsonl"
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already."}]}
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?"}]}
```

### 2. 파일 업로드

LiteLLM managed files와 요청 검증을 활성화하려면 `target_model_names: "<model-name>"`을 지정합니다.

model-name은 request.jsonl의 model-name과 같아야 합니다.

```python showLineNumbers title="create_finetuning_job.py"
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

# Upload file
finetuning_input_file = client.files.create(
    file=open("./request.jsonl", "rb"),
    purpose="fine-tune",
    extra_body={"target_model_names": "gpt-4.1-openai"}
)
print(finetuning_input_file)

```


**파일은 어디에 기록되나요?**:

모든 gpt-4.1-openai 배포에 기록됩니다. 이렇게 하면 3단계에서 작업을 생성할 때 모든 gpt-4.1-openai 배포 전반에 loadbalancing을 사용할 수 있습니다. 작업이 생성된 후에는 모든 retrieve/list/cancel 작업이 해당 배포로 라우팅됩니다.

### 3. Finetuning Job 생성

```python showLineNumbers title="create_finetuning_job.py"
... # Step 2

file_id = finetuning_input_file.id

# Create Finetuning Job
ft_job = client.fine_tuning.jobs.create(
    model="gpt-4.1-openai",  # litellm public model name you want to finetune                  
    training_file=file_id,
)
```

### 4. Finetuning Job 조회

```python showLineNumbers title="create_finetuning_job.py"
... # Step 3

response = client.fine_tuning.jobs.retrieve(ft_job.id)
print(response)
```

### 5. Finetuning Jobs 목록 조회

```python showLineNumbers title="create_finetuning_job.py"
...

client.fine_tuning.jobs.list(extra_body={"target_model_names": "gpt-4.1-openai"})
```

### 6. Finetuning Job 취소

```python showLineNumbers title="create_finetuning_job.py"
...

cancel_ft_job = client.fine_tuning.jobs.cancel(
    fine_tuning_job_id=ft_job.id,                          # fine tuning job id
)
```



## E2E 예제

```python showLineNumbers title="create_finetuning_job.py"
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-...",
    max_retries=0
)


# Upload file
finetuning_input_file = client.files.create(
    file=open("./fine_tuning.jsonl", "rb"), # {"model": "azure-gpt-4o"} <-> {"model": "gpt-4o-my-special-deployment"}
    purpose="fine-tune",
    extra_body={"target_model_names": "gpt-4.1-openai"} # 👈 Tells litellm which regions/projects to write the file in. 
)
print(finetuning_input_file) # file.id = "litellm_proxy/..." = {"model_name": {"deployment_id": "deployment_file_id"}}

file_id = finetuning_input_file.id
# # file_id = "bGl0ZWxs..."

# ## create fine-tuning job 
ft_job = client.fine_tuning.jobs.create(
    model="gpt-4.1-openai",  # litellm model name you want to finetune                  
    training_file=file_id,
)

print(f"ft_job: {ft_job}")

ft_job_id = ft_job.id
## cancel fine-tuning job 
cancel_ft_job = client.fine_tuning.jobs.cancel(
    fine_tuning_job_id=ft_job_id,                          # fine tuning job id
)

print("response from cancel ft job={}".format(cancel_ft_job))
# list fine-tuning jobs 
list_ft_jobs = client.fine_tuning.jobs.list(
    extra_query={"target_model_names": "gpt-4.1-openai"}   # tell litellm proxy which provider to use
)

print("list of ft jobs={}".format(list_ft_jobs))

# get fine-tuning job 
response = client.fine_tuning.jobs.retrieve(ft_job.id)
print(response)
```

## FAQ

### 파일은 어디에 기록되나요?

`target_model_names`를 지정하면 파일은 `target_model_names`와 일치하는 모든 배포에 기록됩니다.

추가 인프라는 필요하지 않습니다.
