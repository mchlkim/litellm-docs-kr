import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `SAP Generative AI Hub`

LiteLLM은 SAP Generative AI Hub의 Orchestration Service를 지원합니다.

| 속성 | 세부 정보                                                                                                                                                |
|-------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| 설명 | SAP Generative AI Hub는 AI Core orchestration service를 통해 OpenAI, Anthropic, Gemini, Mistral, NVIDIA, Amazon, SAP LLM에 대한 접근을 제공합니다. |
| LiteLLM의 Provider Route | `sap/`                                                                                                                                                 |
| 지원 엔드포인트 | `/chat/completions`, `/embeddings`                                                                                                                                  |
| API 레퍼런스 | [SAP AI Core Documentation](https://help.sap.com/docs/sap-ai-core)                                                                                     |

## 사전 준비 {#prerequisites}

시작하기 전에 다음이 준비되어 있는지 확인하세요.

1. SAP AI Core에 접근할 수 있는 **SAP BTP Account**
2. subaccount에 provision된 **AI Core Service Instance**
3. AI Core instance용으로 생성된 **Service Key**(자격 증명 포함)
4. AI model이 배포된 **Resource Group**(SAP administrator에게 확인)

:::tip Credential 위치
자격 증명은 SAP BTP Cockpit에서 생성하는 **Service Key**에서 가져옵니다.

1. **Subaccount** → **`Instances and Subscriptions`** 페이지로 이동합니다.
2. **AI Core** instance를 찾아 클릭합니다.
3. **Service Keys**로 이동해 새로 생성하거나 기존 key를 사용합니다.
4. JSON에는 아래에 필요한 모든 값이 포함되어 있습니다.

service key JSON은 다음과 같습니다.

```json
{
  "clientid": "sb-abc123...",
  "clientsecret": "xyz789...",
  "url": "https://myinstance.authentication.eu10.hana.ondemand.com",
  "serviceurls": {
    "AI_API_URL": "https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com"
  }
}
```

:::info `Resource Group`
resource group은 일반적으로 service key 자체가 아니라 AI Core deployment에서 별도로 구성됩니다. `AICORE_RESOURCE_GROUP` 환경 변수로 설정할 수 있습니다(기본값: "default").
:::

## 빠른 시작 {#quick-start}

### 1단계: LiteLLM 설치 {#step-1-install-litellm}

```bash
uv add litellm
```

### 2단계: Credential 설정 {#step-2-set-up-credentials}
 
 다음 인증 방식 중 **하나**를 선택합니다.
 
> **Breaking change**: credential resolution은 "first-source-wins" 방식입니다.
> 
> Credential resolution은 더 이상 여러 source의 개별 field를 merge하지 않습니다.
> 
> resolution order:
`kwargs` → `service key` → `env (AICORE_*)` → `config` → `VCAP service`
>
> **중요 동작:** LiteLLM이 어떤 source에서 credential 값을 *하나라도* 찾으면 해당 source의 **모든** credential을 독점적으로 사용합니다(`resource_group`은 여전히 별도로 resolve될 수 있음).

 <Tabs>
 <TabItem value="service-key" label="Service Key JSON (Recommended)">

가장 간단한 방법은 전체 service key를 단일 환경 변수로 붙여 넣는 것입니다.

> **참고:** service key를 더 이상 "credentials" key로 감쌀 필요가 없습니다.

```bash
export AICORE_SERVICE_KEY='{
    "clientid": "your-client-id",
    "clientsecret": "your-client-secret",
    "url": "https://<your-instance>.authentication.sap.hana.ondemand.com",
    "serviceurls": {
      "AI_API_URL": "https://api.ai.<your-region>.aws.ml.hana.ondemand.com"
    }
}'
export AICORE_RESOURCE_GROUP="default"
```

</TabItem>
<TabItem value="individual" label="Individual Variables">

또는 위 service key 대신 각 자격 증명을 개별적으로 설정할 수 있습니다.

```bash
export AICORE_AUTH_URL="https://<your-instance>.authentication.sap.hana.ondemand.com/oauth/token"
export AICORE_CLIENT_ID="your-client-id"
export AICORE_CLIENT_SECRET="your-client-secret"
export AICORE_RESOURCE_GROUP="default"
export AICORE_BASE_URL="https://api.ai.<your-region>.aws.ml.hana.ondemand.com/v2"
```

</TabItem>
</Tabs>

### 3단계: 첫 요청 보내기 {#step-3-make-your-first-request}

```python title="test_sap.py"
from litellm import completion

response = completion(
    model="sap/gpt-4o",
    messages=[{"role": "user", "content": "Hello from LiteLLM!"}]
)
print(response.choices[0].message.content)
```

실행합니다.

```bash
python test_sap.py
```

**예상 출력:**

```text
Hello! How can I assist you today?
```

### 4단계: 설정 검증(선택 사항) {#step-4-verify-your-setup-optional}

다음 진단 script로 모든 것이 동작하는지 테스트합니다.

```python title="verify_sap_setup.py"
import os
import litellm

# Enable debug logging to see what's happening
import os
os.environ["LITELLM_LOG"] = "DEBUG"

# Either use AICORE_SERVICE_KEY (contains all credentials including resourcegroup)
# OR use individual variables (all required together)
individual_vars = ["AICORE_AUTH_URL", "AICORE_CLIENT_ID", "AICORE_CLIENT_SECRET", "AICORE_BASE_URL", "AICORE_RESOURCE_GROUP"]

print("=== SAP Gen AI Hub Setup Verification ===\n")

# Check for service key method
if os.environ.get("AICORE_SERVICE_KEY"):
    print("✓ Using AICORE_SERVICE_KEY authentication (includes resource group)")
else:
    # Check individual variables
    missing = [v for v in individual_vars if not os.environ.get(v)]
    if missing:
        print(f"✗ Missing environment variables: {missing}")
    else:
        print("✓ Using individual variable authentication")
        print(f"✓ Resource group: {os.environ.get('AICORE_RESOURCE_GROUP')}")

# Test API connection
print("\n=== Testing API Connection ===\n")
try:
    response = litellm.completion(
        model="sap/gpt-4o",
        messages=[{"role": "user", "content": "Say 'Connection successful!' and nothing else."}],
        max_tokens=20
    )
    print(f"✓ API Response: {response.choices[0].message.content}")
    print("\n🎉 Setup complete! You're ready to use SAP Gen AI Hub with LiteLLM.")
except Exception as e:
    print(f"✗ API Error: {e}")
    print("\nTroubleshooting tips:")
    print("  1. Verify your service key credentials are correct")
    print("  2. Check that 'gpt-4o' is deployed in your resource group")
    print("  3. Ensure your SAP AI Core instance is running")
```

검증을 실행합니다.

```bash
python verify_sap_setup.py
```

**성공 시 예상 출력:**

```text
=== SAP Gen AI Hub Setup Verification ===

✓ Using AICORE_SERVICE_KEY authentication
✓ Resource group: default

=== Testing API Connection ===

✓ API Response: Connection successful!

🎉 Setup complete! You're ready to use SAP Gen AI Hub with LiteLLM.
```

## 인증 {#authentication}

SAP Generative AI Hub는 인증에 OAuth2 service key를 사용합니다. 설정 방법은 [빠른 시작](#quick-start)을 참고하세요.

### Environment Variable 레퍼런스 {#environment-variable-reference}

| 변수 | 필수 여부 | 설명 |
|----------|----------|-------------|
| `AICORE_SERVICE_KEY` | 예* | 전체 service key JSON(권장 방식) |
| `AICORE_RESOURCE_GROUP` | 예 | AI Core resource group 이름 |
| `AICORE_AUTH_URL` | 예* | OAuth token URL(service key 대안) |
| `AICORE_CLIENT_ID` | 예* | OAuth client ID(service key 대안) |
| `AICORE_CLIENT_SECRET` | 예* | OAuth client secret(service key 대안) |
| `AICORE_BASE_URL` | 예* | AI Core API base URL(service key 대안) |

*`AICORE_SERVICE_KEY` 또는 개별 변수(`AICORE_AUTH_URL`, `AICORE_CLIENT_ID`, `AICORE_CLIENT_SECRET`, `AICORE_BASE_URL`) 중 하나를 선택하세요.

## 모델 명명 규칙 {#model-naming-convention}

SAP Gen AI Hub를 올바르게 사용하려면 model naming을 이해하는 것이 중요합니다. naming pattern은 SDK를 직접 사용하는지, proxy를 통해 사용하는지에 따라 다릅니다.

### Direct SDK 사용법 {#direct-sdk-usage}

LiteLLM SDK를 직접 호출할 때는 model name에 `sap/` prefix를 **반드시** 포함해야 합니다.

```python
# Correct - includes sap/ prefix
model="sap/gpt-4o"
model="sap/anthropic--claude-4.5-sonnet"
model="sap/gemini-2.5-pro"

# Incorrect - missing prefix
model="gpt-4o"  # ❌ Won't work
```
3. **Environment variables** - `.env` file에 다음 자격 증명 목록을 설정합니다.
<pre>
AICORE_AUTH_URL = "https://* * * .authentication.sap.hana.ondemand.com/oauth/token",
AICORE_CLIENT_ID  = " *** ",
AICORE_CLIENT_SECRET = " *** ",
AICORE_RESOURCE_GROUP = " *** ",
AICORE_BASE_URL = "https://api.ai.***.cfapps.sap.hana.ondemand.com/v2"
</pre>

다른 credential configuration option도 사용할 수 있습니다. 자세한 내용은 [SAP AI Core Documentation](https://help.sap.com/doc/generative-ai-hub-sdk/CLOUD/en-US/_reference/README_sphynx.html#configuration)을 참고하세요.
## 사용법 - LiteLLM Python SDK {#usage---litellm-python-sdk}

### Proxy 사용법 {#proxy-usage}

LiteLLM Proxy를 사용할 때는 configuration에 정의한 **friendly `model_name`**을 사용합니다. proxy가 `sap/` prefix routing을 자동으로 처리합니다.

```yaml
# In config.yaml, define the mapping
model_list:
  - model_name: gpt-4o          # ← Use this name in client requests
    litellm_params:
      model: sap/gpt-4o         # ← Proxy handles the sap/ prefix
```

```python
# Client request - no sap/ prefix needed
client.chat.completions.create(
    model="gpt-4o",  # ✓ Correct for proxy usage
    messages=[...]
)
```

### Anthropic 모델 특수 Syntax {#special-syntax-for-anthropic-models}

Anthropic model은 double-dash(`--`) prefix convention을 사용합니다.

| Provider | Model 예제 | LiteLLM Format |
|----------|---------------|----------------|
| OpenAI | GPT-4o | `sap/gpt-4o` |
| Anthropic | Claude 4.5 Sonnet | `sap/anthropic--claude-4.5-sonnet` |
| Google | Gemini 2.5 Pro | `sap/gemini-2.5-pro` |
| Mistral | Mistral Large | `sap/mistral-large` |

### 빠른 레퍼런스 표 {#quick-reference-table}

| 사용법 유형 | Model Format | 예제 |
|------------|--------------|---------|
| Direct SDK | `sap/<model-name>` | `sap/gpt-4o` |
| `Direct SDK (Anthropic)` | `sap/anthropic--<model>` | `sap/anthropic--claude-4.5-sonnet` |
| Proxy Client | `<friendly-name>` | `gpt-4o` 또는 `claude-sonnet` |

## Python SDK 사용 {#using-the-python-sdk}

LiteLLM Python SDK는 인증 방식을 자동으로 감지합니다. 환경 변수를 설정하고 요청을 보내면 됩니다.

```python showLineNumbers title="Basic Completion"
from litellm import completion

# Assumes AICORE_AUTH_URL, AICORE_CLIENT_ID, etc. are set
response = completion(
    model="sap/anthropic--claude-4.5-sonnet",
    messages=[{"role": "user", "content": "Explain quantum computing"}]
)
print(response.choices[0].message.content)
```

두 인증 방식(개별 변수 또는 service key JSON)은 모두 자동으로 동작하며 code 변경이 필요 없습니다.

## Proxy 서버 사용 {#using-the-proxy-server}

LiteLLM Proxy는 SAP model에 대해 통합 OpenAI-compatible API를 제공합니다.

### 설정 {#configuration}

project directory에 model mapping과 자격 증명이 포함된 `config.yaml` file을 생성합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  # OpenAI models
  - model_name: gpt-5
    litellm_params:
      model: sap/gpt-5

  # Anthropic models (note the double-dash)
  - model_name: claude-sonnet
    litellm_params:
      model: sap/anthropic--claude-4.5-sonnet

  - model_name: claude-opus
    litellm_params:
      model: sap/anthropic--claude-4.5-opus

  # Embeddings
  - model_name: text-embedding-3-small
    litellm_params:
      model: sap/text-embedding-3-small

litellm_settings:
  drop_params: true
  set_verbose: false
  request_timeout: 600
  num_retries: 2
  forward_client_headers_to_llm_api: ["anthropic-version"]

general_settings:
  master_key: "sk-1234" # Enter here your desired master key starting with 'sk-'.
  
  # UI Admin is not required but helpful including the management of keys for your team(s). If you are using a database, these parameters are required:
  database_url: "Enter you database URL."
  UI_USERNAME: "Your desired UI admin account name"
  UI_PASSWORD: "Your desired and strong pwd"

# Authentication
environment_variables:
  AICORE_SERVICE_KEY: '{"credentials": {"clientid": "...", "clientsecret": "...", "url": "...", "serviceurls": {"AI_API_URL": "..."}}}'
  AICORE_RESOURCE_GROUP: "default"
```

### Proxy 시작 {#start-proxy}

```bash showLineNumbers title="Start Proxy"
litellm --config config.yaml
```

proxy는 기본적으로 `http://localhost:4000`에서 시작됩니다.

### 요청 보내기 {#making-requests}

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Test Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-1234"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="LiteLLM SDK"
import os
import litellm

os.environ["LITELLM_PROXY_API_KEY"] = "sk-1234"
litellm.use_litellm_proxy = True

response = litellm.completion(
    model="claude-sonnet",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    api_base="http://localhost:4000"
)

print(response)
```

</TabItem>
</Tabs>

## 기능 {#features}

### Streaming Response {#streaming-response}

더 나은 사용자 경험을 위해 response를 real-time으로 stream합니다.

```python showLineNumbers title="Streaming Chat Completion"
from litellm import completion

response = completion(
    model="sap/gpt-4o",
    messages=[{"role": "user", "content": "Count from 1 to 10"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Structured Output {#structured-output}

#### JSON Schema(권장)

엄격한 validation이 있는 structured output에는 JSON Schema를 사용합니다.

```python showLineNumbers title="JSON Schema Response"
from litellm import completion

response = completion(
    model="sap/gpt-4o",
    messages=[{
        "role": "user",
        "content": "Generate info about Tokyo"
    }],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "city_info",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "population": {"type": "number"},
                    "country": {"type": "string"}
                },
                "required": ["name", "population", "country"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
)

print(response.choices[0].message.content)
# Output: {"name":"Tokyo","population":37000000,"country":"Japan"}
```

#### JSON Object Format {#json-object-format}

schema validation 없는 유연한 JSON output에는 다음을 사용합니다.

```python showLineNumbers title="JSON Object Response"
from litellm import completion

response = completion(
    model="sap/gpt-4o",
    messages=[{
        "role": "user",
        "content": "Generate a person object in JSON format with name and age"
    }],
    response_format={"type": "json_object"}
)

print(response.choices[0].message.content)
```

:::note `SAP Platform Requirement`
`json_object` type을 사용할 때 SAP orchestration service는 prompt에 "json"이라는 단어가 포함되어야 합니다. 이는 JSON formatting 의도를 명시하기 위한 조건입니다. 이 요구사항 없이 schema-validated output을 사용하려면 `json_schema`를 사용하세요(권장).
:::

### 멀티턴 대화 {#multi-turn-conversation}

여러 turn에 걸쳐 conversation context를 유지합니다.

```python showLineNumbers title="Multi-turn Conversation"
from litellm import completion

response = completion(
    model="sap/gpt-4o",
    messages=[
        {"role": "user", "content": "My name is Alice"},
        {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
        {"role": "user", "content": "What is my name?"}
    ]
)

print(response.choices[0].message.content)
# Output: Your name is Alice.
```

### Embeddings {#embeddings}

semantic search와 retrieval을 위한 vector embedding을 생성합니다.

```python showLineNumbers title="Create Embeddings"
from litellm import embedding

response = embedding(
    model="sap/text-embedding-3-small",
    input=["Hello world", "Machine learning is fascinating"]
)

print(response.data[0]["embedding"])  # Vector representation
```

### 추가 Module {#additional-modules}
SAP Gen AI Hub에는 고급 use case를 위한 추가 module이 포함됩니다.
- [Grounding](https://help.sap.com/docs/sap-ai-core/generative-ai/grounding-035c455a5a424697b60f4a24b6d791fe?locale=en-US)
- [Translation](https://help.sap.com/docs/sap-ai-core/generative-ai/translation?locale=en-US)
- [Data Masking](https://help.sap.com/docs/sap-ai-core/generative-ai/data-masking-d9a54d9ca54b40beacbd24e1663ec3b4?locale=en-US)
- [Content Filtering](https://help.sap.com/docs/sap-ai-core/generative-ai/content-filtering?locale=en-US)

#### Grounding {#grounding}
Grounding은 vector database를 사용해 grounding 및 retrieval 같은 data 관련 작업을 처리하도록 설계된 service입니다. 이러한 database를 통해 specialized data retrieval을 제공하고, 자체 external/context-relevant data로 retrieval process를 grounding합니다. Grounding은 generative AI capability와 real-time precise data 사용 능력을 결합해 특정 AI-driven business solution의 의사결정과 business operation을 개선합니다.
##### 사전 준비 {#grounding-prerequisites}
orchestration pipeline에서 Grounding module을 사용하려면 knowledge base를 미리 준비해야 합니다.

Generative AI Hub는 사용자가 data를 제공해 knowledge base를 준비하는 여러 option을 제공합니다.
- Option 1: 문서를 지원되는 data repository에 upload하고 data pipeline을 실행해 문서를 vectorize합니다.
- Option 2: Vector API를 통해 document chunk를 직접 제공합니다.

grounding을 사용하려면 다음 option 중 하나를 선택합니다.

사용 예제:
```python showLineNumbers title="Grounding Example"
from litellm import completion

grounding_config = {
    'type': 'document_grounding_service',
    'config': {
        'filters': [
            {'id': 's3-docs',
             'data_repository_type': 'vector',
             'search_config': {'max_chunk_count': 2},
             'data_repositories': ['012345-6789-0123-4567-890123456789']
             }
        ],
        'placeholders': {'input': ['user_query'], 'output': 'grounding_response'},
        'metadata_params': ['source', 'webUrl', 'title', 'mimeType', 'fileSuffix']
    }
}

response = completion(model="sap/gpt-4o",
                      messages=[
                          {"content":"""Facility Solutions Company provides services to luxury residential complexes, 
                          apartments, individual homes, and commercial properties such as office buildings, retail 
                          spaces, industrial facilities, and educational institutions. Customers are encouraged to 
                          reach out with maintenance requests, service deficiencies, follow-ups, or any issues they 
                          need by email.""", "role": "system"},
                          {"content":"""You are a helpful assistant for any queries for answering questions. 
                          Answer the request by providing relevant answers that fit to the request.
                          Request: {{ ?user_query }}
                          Context:{{ ?grounding_response }}""", "role": "user"}
                      ],
                      placeholder_values={"user_query": "Is there a complaint?"},
                      grounding=grounding_config
                      )
print(response.choices[0].message.content)
```
사용 가능한 모든 grounding configuration에 대한 자세한 내용은 [문서](https://help.sap.com/docs/sap-ai-core/generative-ai/using-grounding-module-e1c4dd100dfb42ab890e1d95f3516187?locale=en-US)를 참고하세요.

#### Translation {#translation}
translation module을 사용하면 LLM text prompt를 선택한 target language로 번역할 수 있습니다.

```python showLineNumbers title="Translation Example"
from litellm import completion

translation_config = {
    'input':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'en-US',
              'target_language': 'de-DE'}
         },
    'output':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'de-DE',
              'target_language': 'fr-FR'}
         }
}

response = completion(model="sap/gpt-4o",
                      messages=[{"role": "user", "content": "Hello world!"}],
                      translation=translation_config)

print(response.choices[0].message.content)
```
사용 가능한 모든 translation configuration에 대한 자세한 내용은 [문서](https://help.sap.com/docs/sap-ai-core/generative-ai/translation?locale=en-US)를 참고하세요.

#### Data Masking {#data-masking}
data masking module은 선택된 entity에 대해 input의 personally identifiable information을 anonymize 또는 pseudonymize합니다.

```python showLineNumbers title="Data Masking Example"
from litellm import completion, embedding
masking_config = {
            'providers':
                [
                    {
                        'type': 'sap_data_privacy_integration',
                        'method': 'anonymization',
                        'entities': [
                            {'type': 'profile-address'},
                            {'type': 'profile-email'},
                            {'type': 'profile-phone'},
                            {'type': 'profile-person'},
                            {'type': 'profile-location'}
                        ]
                    }
                ]
        }

mock_cv = "some text with personal information"

response = completion(model="sap/gpt-4o",
                      messages=[{"role": "user", "content": "Give a one sentence summary of the CV. CV: {{?cv}}?"}],
                      placeholder_values={"cv": mock_cv},
                      masking=masking_config)
print(response.choices[0].message.content)

# Data masking module also available for embedding 
response = embedding(model="sap/text-embedding-3-small",
                      input=mock_cv,
                      masking=masking_config)
print(response.data[0])
```
사용 가능한 모든 data masking configuration에 대한 자세한 내용은 [문서](https://help.sap.com/docs/sap-ai-core/generative-ai/enhancing-model-consumption-with-data-masking-66ad6f469afc4c2cbaa91a27a33f7b21?locale=en-US)를 참고하세요.





#### Content Filtering {#content-filtering}
content filtering module을 사용하면 content safety criteria에 따라 input과 output을 filter할 수 있습니다.

이 module은 두 service를 지원합니다.
* Azure Content Safety
* Llama Guard 3

```python showLineNumbers title="Content Filtering Example"
from litellm import completion

filtering_config_azure = {
    'input':
        {
            'filters':
                [
                    {'type': 'azure_content_safety',
                     'config':
                         {'hate': 0,
                          'sexual': 0,
                          'violence': 0,
                          'self_harm': 0
                          }
                     }
                ]
        },
    'output':
        {
            'filters':
                [
                    {'type': 'azure_content_safety',
                     'config': {'hate': 0,
                          'sexual': 0,
                          'violence': 0,
                          'self_harm': 0
                          }
                     }
                ]
        }
}

response = completion(model="sap/gpt-4o",
                      messages=[{"role": "user", "content": "Hello world!"}],
                      filtering=filtering_config_azure)
print(response.choices[0].message.content) 
# The model responds normally because the content does not violate any safety rules.

try:
    response = completion(model="sap/gpt-4o",
                          messages=[{"role": "user", "content": "I hate you"}],
                          filtering=filtering_config_azure)
except Exception as e:
    print(e) 
    # The service raises an error:
    # "Input Filter: Content filtered due to safety violations. Please modify the prompt and try again."
```
사용 가능한 모든 content filtering configuration에 대한 자세한 내용은 [문서](https://help.sap.com/docs/sap-ai-core/generative-ai/content-filtering?locale=en-US)를 참고하세요.

#### fallback용 module configuration 목록 {#list-of-module-configurations-for-fallback}
SAP Gen AI Hub는 error 처리를 위한 fallback mechanism을 지원합니다. 이 mechanism을 통해 error 발생 시 사용할 fallback module 목록을 지정할 수 있습니다. fallback module에는 요청 구성에 필요한 모든 parameter가 포함되어야 합니다.

필수 parameter:
- `model` 
- `messages`

선택 parameter:
- `filtering`
- `grounding`
- `translation`
- `masking`
- `tools`

- 기타 model-specific parameter.


```python showLineNumbers title="Fallback Example"
from litellm import completion

translation_config = {
    'input':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'en-US',
              'target_language': 'de-DE'}
         },
    'output':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'de-DE',
              'target_language': 'fr-FR'}
         }
}

response = completion(model="sap/gpt-4o",
                      messages=[{"role": "user", "content": "Hello world!"}],
                      translation=translation_config,
                      fallback_sap_modules=[{
                          "model":"sap/gemini-2.5-flash",
                          "messages":[{"role": "user", "content": "Hello world!"}],
                          "translation":translation_config
                      }])

# In case of error with the first configuration (model gpt-4o), the fallback module is used.

print(response.choices[0].message.content)

```


## 레퍼런스 {#reference}

### 지원 파라미터 {#supported-parameters}

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `model` | string | model identifier(SDK에서는 `sap/` prefix 사용) |
| `messages` | array | 대화 메시지 |
| `temperature` | float | randomness 제어(0-2) |
| `max_tokens` | integer | response의 최대 token 수 |
| `top_p` | float | nucleus sampling threshold 값 |
| `stream` | boolean | streaming response 활성화 |
| `response_format` | object | output format(`json_object`, `json_schema`) |
| `tools` | array | function calling tool 정의 |
| `tool_choice` | string/object | tool 선택 동작 |

### 지원 모델 {#supported-models}

SAP Gen AI Hub에서 제공하는 사용 가능 model의 최신 전체 목록은 [SAP AI Core Generative AI Hub 문서](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/models-and-scenarios-in-generative-ai-hub)를 참고하세요.

:::info `Model Availability`
model availability는 SAP deployment region과 subscription에 따라 달라집니다. 환경에서 사용할 수 있는 model은 SAP administrator에게 확인하세요.
:::

### 문제 해결 {#troubleshooting}

**인증 오류**

authentication error가 발생하면 다음을 확인하세요.

1. 모든 필수 environment variable이 올바르게 설정되었는지 확인
2. service key가 만료되지 않았는지 확인
3. resource group이 원하는 model에 접근할 수 있는지 확인
4. `AICORE_AUTH_URL`과 `AICORE_BASE_URL`이 SAP region과 일치하는지 확인

**Model Not Found**

model이 "not found"를 반환하면 다음을 확인하세요.

1. 해당 model이 SAP deployment에서 사용 가능한지 확인
2. 올바른 model name format을 사용하는지 확인(SDK는 `sap/` prefix)
3. resource group이 해당 model에 접근할 수 있는지 확인
4. Anthropic model의 경우 `anthropic--` double-dash prefix를 사용하는지 확인

**Rate Limiting**

SAP Gen AI Hub는 subscription에 따라 rate limit을 적용합니다. limit에 도달하면 다음을 검토하세요.

1. exponential backoff retry logic 구현
2. proxy의 `built-in rate limiting` 기능 사용 검토
3. SAP administrator에게 quota allocation 검토 요청
