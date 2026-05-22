import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Bedrock - 이미지 생성 {#aws-bedrock---image-generation}

Stable Diffusion, Amazon Titan Image Generator, Amazon Nova Canvas 모델로 이미지를 생성할 때 Bedrock을 사용합니다.

## 지원되는 모델 {#supported-models}

| 모델명              | 함수 호출                               | 비용 추적 |
|-------------------------|---------------------------------------------|---------------|
| `Stable Diffusion 3 - v0` | `image_generation(model="bedrock/stability.stability.sd3-large-v1:0", prompt=prompt)` | ✅ |
| `Stable Diffusion - v0`   | `image_generation(model="bedrock/stability.stable-diffusion-xl-v0", prompt=prompt)` | ✅ |
| `Stable Diffusion - v1`   | `image_generation(model="bedrock/stability.stable-diffusion-xl-v1", prompt=prompt)` | ✅ |
| `Amazon Titan Image Generator - v1` | `image_generation(model="bedrock/amazon.titan-image-generator-v1", prompt=prompt)` | ✅ |
| `Amazon Titan Image Generator - v2` | `image_generation(model="bedrock/amazon.titan-image-generator-v2:0", prompt=prompt)` | ✅ |
| `Amazon Nova Canvas - v1` | `image_generation(model="bedrock/amazon.nova-canvas-v1:0", prompt=prompt)` | ✅ |

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### 기본 사용법 {#basic-usage}

```python
import os
from litellm import image_generation

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = image_generation(
    prompt="A cute baby sea otter",
    model="bedrock/stability.stable-diffusion-xl-v0",
)
print(f"response: {response}")
```

### 선택적 파라미터 설정하기 {#set-optional-parameters}

```python
import os
from litellm import image_generation

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = image_generation(
    prompt="A cute baby sea otter",
    model="bedrock/stability.stable-diffusion-xl-v0",
    ### OPENAI-COMPATIBLE ###
    size="128x512", # width=128, height=512
    ### PROVIDER-SPECIFIC ### see `AmazonStabilityConfig` in bedrock.py for all params
    seed=30
)
print(f"response: {response}")
```

</TabItem>
<TabItem value="proxy" label="프록시">

### 1. config.yaml 설정하기 {#1-setup-configyaml}

```yaml
model_list:
  - model_name: amazon.nova-canvas-v1:0
    litellm_params:
      model: bedrock/amazon.nova-canvas-v1:0
      aws_region_name: "us-east-1"
      aws_secret_access_key: my-key # OPTIONAL - all boto3 auth params supported
      aws_secret_access_id: my-id # OPTIONAL - all boto3 auth params supported
```

### 2. 프록시 시작하기 {#2-start-proxy}

```bash
litellm --config /path/to/config.yaml
```

### 3. 테스트 {#3-test-it}

**텍스트를 이미지로 변환:**

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
-d '{
    "model": "amazon.nova-canvas-v1:0",
    "prompt": "A cute baby sea otter"
}'
```

**색상 가이드 생성:**

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
-d '{
    "model": "amazon.nova-canvas-v1:0",
    "prompt": "A cute baby sea otter",
    "taskType": "COLOR_GUIDED_GENERATION",
    "colorGuidedGenerationParams":{"colors":["#FFFFFF"]}
}'
```

</TabItem>
</Tabs>

## Amazon Nova Canvas - 이미지 편집 {#amazon-nova-canvas---image-edit}

Bedrock Nova Canvas(`amazon.nova-canvas-v1:0`)와 함께 OpenAI 호환 `image_edit()`를 사용합니다. 요청은 생성과 동일한 `InvokeModel` API를 사용하며, LiteLLM은 입력을 [Nova Canvas 작업 유형](https://docs.aws.amazon.com/nova/latest/userguide/image-gen-access.html)에 매핑합니다.

| 시나리오 | Bedrock으로 전송되는 `taskType` |
|----------|----------------------------|
| 이미지 + 프롬프트(마스크 없음) | `IMAGE_VARIATION` |
| 이미지 + 프롬프트 + 마스크 | `INPAINTING`(`inPaintingParams.image`, `maskImage` 또는 `maskPrompt`) |
| `taskType: OUTPAINTING` + `mask` 또는 `maskPrompt` | `OUTPAINTING`(Bedrock은 둘 중 하나를 요구하며, 둘 다 없으면 LiteLLM이 명확한 오류를 발생시킵니다.) |
| `taskType: BACKGROUND_REMOVAL` | `BACKGROUND_REMOVAL` |

```python
from litellm import image_edit

response = image_edit(
    image=open("photo.png", "rb"),
    prompt="Add soft sunset lighting",
    model="bedrock/amazon.nova-canvas-v1:0",
)
```

**`BACKGROUND_REMOVAL`**의 경우 AWS 요청에 `imageGenerationConfig`가 포함되면 안 됩니다. `size`, `n`, `seed` 등을 전달하더라도 LiteLLM은 이 작업에서 해당 값을 생략합니다. 이미지 편집용 Nova Canvas 추론 ID를 추가하려면 `model_prices_and_context_window.json`에서 **`supports_nova_canvas_image_edit`: true**로 설정해야 합니다(`amazon.nova-canvas-v1:0` 참조).

## 이미지 생성에서 추론 프로필 사용 {#using-inference-profiles-with-image-generation}

이미지 생성에서 AWS Bedrock Application Inference Profiles를 사용할 때는 `model_id` 파라미터로 추론 프로필 ARN을 지정합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import image_generation

response = image_generation(
    model="bedrock/amazon.nova-canvas-v1:0",
    model_id="arn:aws:bedrock:eu-west-1:000000000000:application-inference-profile/a0a0a0a0a0a0",
    prompt="A cute baby sea otter"
)
print(f"response: {response}")
```

</TabItem>
<TabItem value="proxy" label="프록시">

```yaml
model_list:
  - model_name: nova-canvas-inference-profile
    litellm_params:
      model: bedrock/amazon.nova-canvas-v1:0
      model_id: arn:aws:bedrock:eu-west-1:000000000000:application-inference-profile/a0a0a0a0a0a0
      aws_region_name: "eu-west-1"
```

</TabItem>
</Tabs>

## 인증

이미지 생성에는 모든 표준 Bedrock 인증 방식이 지원됩니다. 자세한 내용은 [Bedrock 인증](./bedrock#boto3---authentication)을 참고하세요.
