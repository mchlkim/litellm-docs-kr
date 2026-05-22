import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /fine_tuning


:::info

이 엔드포인트는 엔터프라이즈 전용입니다. [여기에서 엔터프라이즈를 시작하세요](https://enterprise.litellm.ai/demo)

:::

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 지원 프로바이더 | OpenAI, Azure OpenAI, Vertex AI | - |

#### ⚡️지원되는 모델과 프로바이더의 전체 목록은 [models.litellm.ai](https://models.litellm.ai/)에서 확인하세요.
| 비용 추적 | 🟡 | [필요한 경우 알려주세요](https://github.com/BerriAI/litellm/issues) |
| 로깅 | ✅ | 모든 로깅 통합에서 작동합니다 |


파인튜닝 엔드포인트를 사용하려면 litellm config.yaml에 `finetune_settings`와 `files_settings`를 추가하세요.
## `finetune_settings` 및 `files_settings`용 config.yaml 예제
```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

# For /fine_tuning/jobs endpoints
finetune_settings:
  - custom_llm_provider: azure
    api_base: https://exampleopenaiendpoint-production.up.railway.app
    api_key: os.environ/AZURE_API_KEY
    api_version: "2023-03-15-preview"
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_API_KEY
  - custom_llm_provider: "vertex_ai"
    vertex_project: "adroit-crow-413218"
    vertex_location: "us-central1"
    vertex_credentials: "/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json"

# for /files endpoints
files_settings:
  - custom_llm_provider: azure
    api_base: https://exampleopenaiendpoint-production.up.railway.app
    api_key: fake-key
    api_version: "2023-03-15-preview"
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_API_KEY
```

## 파인튜닝용 파일 생성

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
client = AsyncOpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000") # base_url is your litellm proxy url

file_name = "openai_batch_completions.jsonl"
response = await client.files.create(
    extra_headers={"custom-llm-provider": "azure"}, # tell litellm proxy which provider to use
    file=open(file_name, "rb"),
    purpose="fine-tune",
)
```
</TabItem>
<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer sk-1234" \
    -H "custom-llm-provider: azure" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```
</TabItem>
</Tabs>

## 파인튜닝 작업 생성

<Tabs>
<TabItem value="azure" label="Azure OpenAI">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
ft_job = await client.fine_tuning.jobs.create(
    model="gpt-35-turbo-1106",                   # Azure OpenAI model you want to fine-tune
    training_file="file-abc123",                 # file_id from create file response
    extra_headers={"custom-llm-provider": "azure"}, # tell litellm proxy which provider to use
)
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/fine_tuning/jobs \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-1234" \
    -H "custom-llm-provider: azure" \
    -d '{
    "model": "gpt-35-turbo-1106",
    "training_file": "file-abc123"
    }'
```
</TabItem>
</Tabs>

</TabItem>

</Tabs>

### 요청 본문

<Tabs>
<TabItem value="params" label="지원 파라미터">

* `model`

    **유형:** string  
    **필수:** 예  
    파인튜닝할 모델의 이름

* `custom_llm_provider`

    **유형:** `Literal["azure", "openai", "vertex_ai"]`

    **필수:** 예
    파인튜닝할 모델의 이름입니다. [**지원 프로바이더**](#supported-providers) 중 하나를 선택할 수 있습니다.

* `training_file`

    **유형:** string  
    **필수:** 예  
    학습 데이터가 포함된 업로드된 파일의 ID입니다.
    - 파일 업로드 방법은 **파일 업로드**를 참고하세요.
    - 데이터셋은 JSONL 파일 형식이어야 합니다.

* `hyperparameters`

    **유형:** object  
    **필수:** 아니요  
    파인튜닝 작업에 사용되는 하이퍼파라미터입니다.
    > #### 지원 `hyperparameters`
    > #### batch_size
    **유형:** string 또는 integer  
    **필수:** 아니요  
    각 배치의 예제 수입니다. 배치 크기가 클수록 모델 파라미터가 덜 자주 업데이트되지만 분산은 낮아집니다.
    > #### learning_rate_multiplier
    **유형:** string 또는 number  
    **필수:** 아니요  
    학습률의 스케일링 계수입니다. 더 작은 학습률은 과적합을 방지하는 데 유용할 수 있습니다.

    > #### n_epochs
    **유형:** string 또는 integer  
    **필수:** 아니요  
    모델을 학습할 epoch 수입니다. epoch는 학습 데이터셋을 한 번 완전히 순회하는 것을 의미합니다.

* `suffix`
    **유형:** string 또는 null  
    **필수:** 아니요  
    **기본값:** null  
    파인튜닝된 모델 이름에 추가될 최대 18자의 문자열입니다.
    예제: `suffix`가 "custom-model-name"이면 `ft:gpt-4o-mini:openai:custom-model-name:7p4lURel` 같은 모델 이름이 생성됩니다.

* `validation_file`
    **유형:** string 또는 null  
    **필수:** 아니요  
    검증 데이터가 포함된 업로드된 파일의 ID입니다.
    - 제공된 경우 이 데이터는 파인튜닝 중 주기적으로 검증 메트릭을 생성하는 데 사용됩니다.


* `integrations`
    **유형:** array 또는 null  
    **필수:** 아니요  
    파인튜닝 작업에 활성화할 통합 목록입니다.

* `seed`
    **유형:** integer 또는 null  
    **필수:** 아니요  
    seed는 작업의 재현성을 제어합니다. 동일한 seed와 작업 파라미터를 전달하면 같은 결과가 생성되어야 하지만, 드문 경우 달라질 수 있습니다. seed를 지정하지 않으면 자동으로 하나가 생성됩니다.

</TabItem>
<TabItem value="example" label="요청 본문 예제">

```json
{
  "model": "gpt-4o-mini",
  "training_file": "file-abcde12345",
  "hyperparameters": {
    "batch_size": 4,
    "learning_rate_multiplier": 0.1,
    "n_epochs": 3
  },
  "suffix": "custom-model-v1",
  "validation_file": "file-fghij67890",
  "seed": 42
}
```
</TabItem>
</Tabs>

## 파인튜닝 작업 취소

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
# cancel specific fine tuning job
cancel_ft_job = await client.fine_tuning.jobs.cancel(
    fine_tuning_job_id="123",                          # fine tuning job id
    extra_headers={"custom-llm-provider": "azure"},       # tell litellm proxy which provider to use
)

print("response from cancel ft job={}".format(cancel_ft_job))
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl -X POST http://localhost:4000/v1/fine_tuning/jobs/ftjob-abc123/cancel \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -H "custom-llm-provider: azure"
```
</TabItem>

</Tabs>

## 파인튜닝 작업 나열

<Tabs>

<TabItem value="openai" label="OpenAI Python SDK">

```python
list_ft_jobs = await client.fine_tuning.jobs.list(
    extra_headers={"custom-llm-provider": "azure"}   # tell litellm proxy which provider to use
)

print("list of ft jobs={}".format(list_ft_jobs))
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl -X GET 'http://localhost:4000/v1/fine_tuning/jobs' \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer sk-1234" \
     -H "custom-llm-provider: azure"
```
</TabItem>

</Tabs>



## [👉 Proxy API 참조](https://litellm-api.up.railway.app/#/fine-tuning)
