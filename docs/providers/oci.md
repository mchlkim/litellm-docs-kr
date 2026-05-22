import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Oracle Cloud Infrastructure (OCI) 사용
LiteLLM은 OCI 온디맨드 GenAI API에서 다음 모델을 지원합니다.

[OCI 모델 목록](https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm)에서 해당 모델이 사용 중인 리전에서 제공되는지 확인하세요.

## 지원 모델

### 채팅 / 텍스트 생성

#### Meta Llama 모델
- `meta.llama-4-maverick-17b-128e-instruct-fp8`
- `meta.llama-4-scout-17b-16e-instruct`
- `meta.llama-3.3-70b-instruct`
- `meta.llama-3.3-70b-instruct-fp8-dynamic`
- `meta.llama-3.2-90b-vision-instruct`
- `meta.llama-3.2-11b-vision-instruct`
- `meta.llama-3.1-405b-instruct`
- `meta.llama-3.1-70b-instruct`

#### xAI Grok 모델
- `xai.grok-4.20`
- `xai.grok-4.20-multi-agent`
- `xai.grok-4`
- `xai.grok-4-fast`
- `xai.grok-4.1-fast`
- `xai.grok-3`
- `xai.grok-3-fast`
- `xai.grok-3-mini`
- `xai.grok-3-mini-fast`
- `xai.grok-code-fast-1`

#### Cohere 모델
- `cohere.command-latest`
- `cohere.command-a-03-2025`
- `cohere.command-a-reasoning-08-2025`
- `cohere.command-a-vision-07-2025`
- `cohere.command-a-translate-08-2025`
- `cohere.command-plus-latest`
- `cohere.command-r-08-2024`
- `cohere.command-r-plus-08-2024`

#### Google Gemini 모델(OCI 경유)
- `google.gemini-2.5-pro`
- `google.gemini-2.5-flash`
- `google.gemini-2.5-flash-lite`

### 임베딩 모델
- `cohere.embed-english-v3.0`(1024차원)
- `cohere.embed-english-light-v3.0`(384차원)
- `cohere.embed-multilingual-v3.0`(1024차원)
- `cohere.embed-multilingual-light-v3.0`(384차원)
- `cohere.embed-english-image-v3.0`(1024차원, 멀티모달)
- `cohere.embed-english-light-image-v3.0`(384차원, 멀티모달)
- `cohere.embed-multilingual-light-image-v3.0`(384차원, 멀티모달)
- `cohere.embed-v4.0`(1536차원, 멀티모달)

## 인증

LiteLLM은 OCI에 대해 두 가지 인증 방식을 지원합니다.

### 방법 1: 수동 자격 증명
개별 OCI 자격 증명을 LiteLLM에 직접 제공합니다. [Oracle 공식 튜토리얼](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm)에 따라 서명 키를 만들고 다음 매개변수를 확보하세요.

- `user`
- `fingerprint`
- `tenancy`
- `region`
- `key_file` 또는 `key`
- `compartment_id`

LiteLLM AI Gateway(LLM Proxy)가 OCI GenAI 모델에 액세스할 때 사용하는 기본 방식입니다.

### 방법 2: OCI SDK Signer
인증에 OCI SDK `Signer` 객체를 사용합니다. 이 방식은 다음을 제공합니다.
- 공식 [OCI SDK 서명 기능](https://docs.oracle.com/en-us/iaas/tools/python/latest/api/signing.html)을 활용합니다.
- 추가 인증 방식(인스턴스 주체, 워크로드 ID 등)을 지원합니다.

이 방식을 사용하려면 OCI SDK를 설치하세요.
```bash
uv add oci
```

Oracle Cloud Infrastructure(인스턴스 또는 Oracle Kubernetes Engine)에서 LiteLLM SDK를 사용할 때 선택할 수 있는 대안 방식입니다.

## 사용법

<Tabs>
<TabItem value="manual" label="수동 자격 증명" default>

OCI 서명 키 생성 과정에서 얻은 매개변수를 `completion` 함수에 입력합니다.

```python
from litellm import completion

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_region=<your_oci_region>,
    oci_user=<your_oci_user>,
    oci_fingerprint=<your_oci_fingerprint>,
    oci_tenancy=<your_oci_tenancy>,
    oci_serving_mode="ON_DEMAND",  # Optional, default is "ON_DEMAND". Other option is "DEDICATED"
    # Provide either the private key string OR the path to the key file:
    # Option 1: pass the private key as a string
    oci_key=<string_with_content_of_oci_key>,
    # Option 2: pass the private key file path
    # oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id=<oci_compartment_id>,
)
print(response)
```

</TabItem>
<TabItem value="oci-sdk" label="OCI SDK Signer">

인증에 OCI SDK `Signer`를 사용합니다.

```python
from litellm import completion
from oci.signer import Signer

# Create an OCI Signer
signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
    # Or use private_key_content="<your_private_key_content>"
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",  # Optional, defaults to us-ashburn-1
    oci_serving_mode="ON_DEMAND",  # Optional, default is "ON_DEMAND". Other option is "DEDICATED"
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

**대안: OCI 구성 파일 사용**

OCI SDK는 `~/.oci/config`에서 자격 증명을 자동으로 로드할 수 있습니다.

```python
from litellm import completion
from oci.config import from_file
from oci.signer import Signer

# Load config from file
config = from_file("~/.oci/config", "DEFAULT")  # "DEFAULT" is the profile name
signer = Signer(
    tenancy=config["tenancy"],
    user=config["user"],
    fingerprint=config["fingerprint"],
    private_key_file_location=config["key_file"],
    pass_phrase=config.get("pass_phrase")  # Optional if key is encrypted
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region=config["region"],
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

**Instance Principal 인증**

OCI 컴퓨트 인스턴스에서 실행되는 애플리케이션의 경우:

```python
from litellm import completion
from oci.auth.signers import InstancePrincipalsSecurityTokenSigner

# Use instance principal authentication
signer = InstancePrincipalsSecurityTokenSigner()

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

**Workload Identity 인증**

Oracle Kubernetes Engine(OKE)에서 실행되는 애플리케이션의 경우:

```python
from litellm import completion
from oci.auth.signers import get_oke_workload_identity_resource_principal_signer

# Use workload identity authentication
signer = get_oke_workload_identity_resource_principal_signer()

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```
</TabItem>
</Tabs>

## 사용법 - 스트리밍
completion 호출 시 `stream=True`만 설정하면 됩니다.

<Tabs>
<TabItem value="manual-stream" label="수동 자격 증명" default>

```python
from litellm import completion

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    stream=True,
    oci_region=<your_oci_region>,
    oci_user=<your_oci_user>,
    oci_fingerprint=<your_oci_fingerprint>,
    oci_tenancy=<your_oci_tenancy>,
    oci_serving_mode="ON_DEMAND",  # Optional, default is "ON_DEMAND". Other option is "DEDICATED"
    # Provide either the private key string OR the path to the key file:
    # Option 1: pass the private key as a string
    oci_key=<string_with_content_of_oci_key>,
    # Option 2: pass the private key file path
    # oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id=<oci_compartment_id>,
)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

</TabItem>
<TabItem value="oci-sdk-stream" label="OCI SDK Signer">

```python
from litellm import completion
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    stream=True,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

</TabItem>
</Tabs>

## 모델 유형별 사용 예제

### Cohere 모델 사용

<Tabs>
<TabItem value="cohere-manual" label="수동 자격 증명" default>

```python
from litellm import completion

messages = [{"role": "user", "content": "Explain quantum computing"}]
response = completion(
    model="oci/cohere.command-latest",
    messages=messages,
    oci_region="us-chicago-1",
    oci_user=<your_oci_user>,
    oci_fingerprint=<your_oci_fingerprint>,
    oci_tenancy=<your_oci_tenancy>,
    oci_key=<string_with_content_of_oci_key>,
    oci_compartment_id=<oci_compartment_id>,
)
print(response)
```

</TabItem>
<TabItem value="cohere-sdk" label="OCI SDK Signer">

```python
from litellm import completion
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

messages = [{"role": "user", "content": "Explain quantum computing"}]
response = completion(
    model="oci/cohere.command-latest",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
</Tabs>

## 전용 엔드포인트 사용

OCI는 모델 호스팅을 위한 전용 엔드포인트를 지원합니다. `oci_endpoint_id`와 함께 `oci_serving_mode="DEDICATED"` 매개변수를 사용해 엔드포인트 ID를 지정하세요.

<Tabs>
<TabItem value="dedicated-manual" label="수동 자격 증명" default>

```python
from litellm import completion

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",  # Must match the model type hosted on the endpoint
    messages=messages,
    oci_region=<your_oci_region>,
    oci_user=<your_oci_user>,
    oci_fingerprint=<your_oci_fingerprint>,
    oci_tenancy=<your_oci_tenancy>,
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",  # Your dedicated endpoint OCID
    oci_key=<string_with_content_of_oci_key>,
    oci_compartment_id=<oci_compartment_id>,
)
print(response)
```

</TabItem>
<TabItem value="dedicated-sdk" label="OCI SDK Signer">

```python
from litellm import completion
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",  # Must match the model type hosted on the endpoint
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",  # Your dedicated endpoint OCID
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
</Tabs>

**중요:** `oci_serving_mode="DEDICATED"`를 사용할 때:
- `model` 매개변수는 **전용 엔드포인트에서 호스팅되는 모델 유형과 일치해야 합니다**(예: Cohere 모델은 `"oci/cohere.command-latest"`, Grok 모델은 `"oci/xai.grok-4"` 사용).
- 모델 이름은 API 형식과 공급업체별 처리 방식(Cohere vs Generic)을 결정합니다.
- `oci_endpoint_id` 매개변수는 전용 엔드포인트의 OCID를 지정합니다.
- `oci_endpoint_id`를 제공하지 않으면 이전 버전과의 호환성을 위해 `model` 매개변수가 엔드포인트 ID로 사용됩니다.

**Cohere 전용 엔드포인트 예제:**
```python
# For a dedicated endpoint hosting a Cohere model
response = completion(
    model="oci/cohere.command-latest",  # Use Cohere model name to get Cohere API format
    messages=messages,
    oci_region="us-chicago-1",
    oci_user=<your_oci_user>,
    oci_fingerprint=<your_oci_fingerprint>,
    oci_tenancy=<your_oci_tenancy>,
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",  # Your Cohere endpoint OCID
    oci_key=<string_with_content_of_oci_key>,
    oci_compartment_id=<oci_compartment_id>,
)
```

## 선택적 매개변수

| 매개변수 | 유형 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `oci_region` | string | `us-ashburn-1` | GenAI 서비스가 배포된 OCI 리전 |
| `oci_serving_mode` | string | `ON_DEMAND` | 서비스 모드: 관리형 모델은 `ON_DEMAND`, 전용 엔드포인트는 `DEDICATED` |
| `oci_endpoint_id` | string | `model`과 동일 | (`DEDICATED` 모드용) 전용 엔드포인트의 OCID |
| `oci_compartment_id` | string | **필수** | 리소스가 포함된 OCI 컴파트먼트의 OCID |
| `oci_user` | string | - | (수동 인증) OCI 사용자의 OCID |
| `oci_fingerprint` | string | - | (수동 인증) API 서명 키의 지문 |
| `oci_tenancy` | string | - | (수동 인증) OCI 테넌시의 OCID |
| `oci_key` | string | - | (수동 인증) 문자열 형태의 프라이빗 키 내용 |
| `oci_key_file` | string | - | (수동 인증) 프라이빗 키 파일 경로 |
| `oci_signer` | object | - | (SDK 인증) 인증용 OCI SDK Signer 객체 |

## 임베딩

LiteLLM은 OCI Generative AI 임베딩 모델을 지원합니다. 이러한 모델은 위에서 설명한 것과 동일한 인증 방식을 사용합니다.

<Tabs>
<TabItem value="embed-manual" label="수동 자격 증명" default>

```python
from litellm import embedding

response = embedding(
    model="oci/cohere.embed-english-v3.0",
    input=["Hello world", "Goodbye world"],
    oci_region="us-ashburn-1",
    oci_user=<your_oci_user>,
    oci_fingerprint=<your_oci_fingerprint>,
    oci_tenancy=<your_oci_tenancy>,
    oci_key=<string_with_content_of_oci_key>,
    oci_compartment_id=<oci_compartment_id>,
)
print(response)
```

</TabItem>
<TabItem value="embed-sdk" label="OCI SDK Signer">

```python
from litellm import embedding
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

response = embedding(
    model="oci/cohere.embed-english-v3.0",
    input=["Hello world", "Goodbye world"],
    oci_signer=signer,
    oci_region="us-ashburn-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
</Tabs>

### 임베딩 선택적 매개변수

| 매개변수 | 유형 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `input_type` | string | - | 입력 유형: `search_document`, `search_query`, `classification`, `clustering` |
| `truncate` | string | `END` | 입력이 최대 토큰 수를 초과할 때의 자르기 전략: `END` 또는 `START` |

### 전용 임베딩 엔드포인트 사용

```python
response = embedding(
    model="oci/cohere.embed-english-v3.0",
    input=["Hello world"],
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",
    oci_region="us-ashburn-1",
    oci_compartment_id="<oci_compartment_id>",
    # ... auth params
)
```
