import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# W&B Inference
https://weave-docs.wandb.ai/quickstart-inference

:::tip

Litellm은 W&B Inference 서비스의 모든 모델을 지원합니다. 모델을 사용하려면 LiteLLM 요청에서 `model=wandb/<any-model-on-wandb-inference-dashboard>` 접두사를 설정하세요. 지원 모델 전체 목록은 https://docs.wandb.ai/guides/inference/models/ 에서 확인할 수 있습니다.

:::

## API 키 {#api-key}

W&B Inference용 API 키는 https://wandb.ai/authorize 에서 발급할 수 있습니다.

```python
import os
# env variable
os.environ['WANDB_API_KEY']
```

## 샘플 사용법: 텍스트 생성 {#sample-usage-text-generation}
```python
from litellm import completion
import os

os.environ['WANDB_API_KEY'] = "insert-your-wandb-api-key"
response = completion(
    model="wandb/Qwen/Qwen3-235B-A22B-Instruct-2507",
    messages=[
        {
            "role": "user",
            "content": "What character was Wall-e in love with?",
        }
    ],
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-usage---streaming}
```python
from litellm import completion
import os

os.environ['WANDB_API_KEY'] = ""
response = completion(
    model="wandb/Qwen/Qwen3-235B-A22B-Instruct-2507",
    messages=[
        {
            "role": "user",
            "content": "What character was Wall-e in love with?",
        }
    ],
    stream=True,
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
)

for chunk in response:
    print(chunk)
```

:::tip

모델이 오프라인 상태가 되면 위 예제가 동작하지 않을 수 있습니다. 사용 가능한 모델 전체 목록은 https://docs.wandb.ai/guides/inference/models/ 에서 확인하세요.

:::

## LiteLLM Proxy Server로 사용 {#usage-with-litellm-proxy-server}

LiteLLM Proxy Server로 W&B Inference 모델을 호출하는 방법은 다음과 같습니다.

1. `config.yaml` 수정

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: wandb/<your-model-name>  # add wandb/ prefix to use W&B Inference as provider
        api_key: api-key                 # api key to send your model
  ```
2. 프록시 시작 
  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server로 요청 전송

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="litellm-proxy-key",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="my-model",
      messages = [
          {
              "role": "user",
              "content": "What character was Wall-e in love with?"
          }
      ],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: litellm-proxy-key' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "my-model",
      "messages": [
          {
          "role": "user",
          "content": "What character was Wall-e in love with?"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>

## 지원 파라미터

W&B Inference 공급자는 다음 매개변수를 지원합니다.

### Chat Completion 매개변수 {#chat-completion-parameters}

| 매개변수 | 타입 | 설명 |
| --------- | ---- | ----------- |
| frequency_penalty | number | 텍스트 내 빈도를 기준으로 새 토큰에 페널티를 적용합니다. |
| function_call | string/object | 모델이 함수를 호출하는 방식을 제어합니다. |
| functions | array | 모델이 JSON 입력을 생성할 수 있는 함수 목록입니다. |
| logit_bias | map | 지정한 토큰의 생성 가능성을 조정합니다. |
| max_tokens | integer | 생성할 최대 토큰 수입니다. |
| n | integer | 생성할 completion 수입니다. |
| presence_penalty | number | 지금까지 텍스트에 등장했는지를 기준으로 토큰에 페널티를 적용합니다. |
| response_format | object | 응답 형식입니다. 예: `{"type": "json"}` |
| seed | integer | 결정적 결과를 위한 샘플링 시드입니다. |
| stop | string/array | API가 토큰 생성을 중단할 시퀀스입니다. |
| stream | boolean | 응답을 스트리밍할지 여부입니다. |
| temperature | number | 무작위성을 제어합니다(0-2). |
| top_p | number | nucleus sampling을 제어합니다. |


## 오류 처리 {#error-handling}

이 통합은 표준 LiteLLM 오류 처리를 사용합니다. 추가로 W&B Inference API에서 자주 발생하는 오류는 다음과 같습니다.

| 오류 코드 | 메시지 | 원인 | 해결 방법 |
| ---------- | ------- | ----- | -------- |
| 401 | 인증 실패 | 인증 자격 증명이 잘못되었거나 W&B 프로젝트 entity 및/또는 이름이 잘못되었습니다. | 올바른 API 키를 사용 중인지, W&B 프로젝트 이름과 entity가 올바른지 확인하세요. |
| 403 | Country, region, or territory not supported | 지원되지 않는 위치에서 API에 접근했습니다. | [Geographic restrictions](https://docs.wandb.ai/guides/inference/usage-limits/#geographic-restrictions)를 확인하세요. |
| 429 | Concurrency limit reached for requests | 동시 요청이 너무 많습니다. | 동시 요청 수를 줄이거나 제한을 늘리세요. 자세한 내용은 [사용량 정보 및 제한](https://docs.wandb.ai/guides/inference/usage-limits/)을 확인하세요. |
| 429 | You exceeded your current quota, please check your plan and billing details | 크레딧이 없거나 월간 지출 한도에 도달했습니다. | 크레딧을 추가하거나 한도를 늘리세요. 자세한 내용은 [사용량 정보 및 제한](https://docs.wandb.ai/guides/inference/usage-limits/)을 확인하세요. |
| 429 | `W&B Inference isn't available for personal accounts.` | 개인 계정에서는 W&B Inference를 사용할 수 없습니다. | 아래 [지침](#error-429-personal-entities-unsupported)을 따라 우회 방법을 적용하세요. |
| 500 | `The server had an error while processing your request` | 내부 서버 오류입니다. | 잠시 후 재시도하고, 계속 발생하면 지원팀에 문의하세요. |
| 503 | `The engine is currently overloaded, please try again later` | 서버 트래픽이 높습니다. | 짧은 지연 후 요청을 재시도하세요. |


### 오류 429: 개인 entity 미지원 {#error-429-personal-entities-unsupported}

사용자가 W&B Inference 접근 권한이 없는 개인 계정에 있습니다. 개인 계정이 아닌 계정이 없다면 Team을 생성해 비개인 계정을 만드세요.

완료한 뒤 아래와 같이 요청에 `openai-project` 헤더를 추가합니다.

```python
response = completion(
    model="...",
    extra_headers={"openai-project": "team_name/project_name"},
    ...
```

자세한 내용은 [Personal entities unsupported](https://docs.wandb.ai/guides/inference/usage-limits/#personal-entities-unsupported)를 확인하세요.

LiteLLM에서 커스텀 헤더를 사용하는 더 많은 방법은 https://docs.litellm.ai/docs/proxy/request_headers 에서 확인할 수 있습니다.
