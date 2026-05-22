import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Auto Routing {#auto-routing}

LiteLLM은 사용자가 정의한 rule을 기준으로 request에 가장 적합한 model을 자동 선택할 수 있습니다.

<Image alt="Auto Routing" img={require('../../img/auto_router.png')} style={{ borderRadius: '8px', marginBottom: '1em', maxWidth: '100%' }} />

## LiteLLM Python SDK {#litellm-python-sdk}

Auto routing을 사용하면 input content를 기준으로 request에 가장 적합한 model을 자동 선택하는 routing rule을 정의할 수 있습니다. 서로 다른 유형의 query를 전문 model로 보내는 데 유용합니다.

### 설정

1. **router configuration file 생성** (예: `router.json`):

```json
{
    "encoder_type": "openai",
    "encoder_name": "text-embedding-3-large",
    "routes": [
        {
            "name": "litellm-gpt-4.1",
            "utterances": [
                "litellm is great"
            ],
            "description": "positive affirmation",
            "function_schemas": null,
            "llm": null,
            "score_threshold": 0.5,
            "metadata": {}
        },
        {
            "name": "litellm-claude-35",
            "utterances": [
                "how to code a program in [language]"
            ],
            "description": "coding assistant",
            "function_schemas": null,
            "llm": null,
            "score_threshold": 0.5,
            "metadata": {}
        }
    ]
}
```

2. **auto routing model로 Router 구성**:

```python
from litellm import Router
import os

router = Router(
    model_list=[
        # Embedding models for routing
        {
            "model_name": "custom-text-embedding-model",
            "litellm_params": {
                "model": "text-embedding-3-large",
                "api_key": os.getenv("OPENAI_API_KEY"),
            },
        },
        # Your target models
        {
            "model_name": "litellm-gpt-4.1",
            "litellm_params": {
                "model": "gpt-4.1",
            },
            "model_info": {"id": "openai-id"},
        },
        {
            "model_name": "litellm-claude-35",
            "litellm_params": {
                "model": "claude-3-5-sonnet-latest",
            },
            "model_info": {"id": "claude-id"},
        },
        # Auto router configuration
        {
            "model_name": "auto_router1",
            "litellm_params": {
                "model": "auto_router/auto_router_1",
                "auto_router_config_path": "router.json",
                "auto_router_default_model": "gpt-4o-mini",
                "auto_router_embedding_model": "custom-text-embedding-model",
            },
        },
    ],
)
```

### 사용법

설정이 끝나면 auto router model name으로 호출해 auto router를 사용합니다.

```python
# This request will be routed to gpt-4.1 based on the utterance match
response = await router.acompletion(
    model="auto_router1",
    messages=[{"role": "user", "content": "litellm is great"}],
)

# This request will be routed to claude-3-5-sonnet-latest for coding queries
response = await router.acompletion(
    model="auto_router1",
    messages=[{"role": "user", "content": "how to code a program in python"}],
)
```

### 설정 Parameters

- **auto_router_config_path**: `router.json` configuration file path입니다.
- **auto_router_default_model**: match되는 route가 없을 때 사용할 fallback model입니다.
- **auto_router_embedding_model**: utterance와 matching할 embedding을 생성하는 데 사용할 model입니다.

### Router 설정 Schema

`router.json` file은 다음 구조를 지원합니다.

- **encoder_type**: encoder type입니다(예: "openai").
- **encoder_name**: embedding model name입니다.
- **routes**: routing rule array입니다. 각 rule은 다음 값을 가집니다.
  - **name**: target model name입니다(`model_list`의 model과 일치해야 합니다).
  - **utterances**: match할 예제 phrase/pattern입니다.
  - **description**: route에 대한 사람이 읽기 쉬운 설명입니다.
  - **score_threshold**: 이 route를 trigger할 최소 similarity score입니다(0.0-1.0).
  - **metadata**: route에 대한 additional metadata입니다.


## LiteLLM Proxy 서버 {#litellm-proxy-server}

### 설정

LiteLLM UI로 이동한 뒤 **모델+Endpoints** > **Add Model** > **Auto Router Tab**으로 이동합니다.

다음 필수 field를 설정합니다.

- **Auto Router Name** - developer가 LiteLLM에 LLM API request를 보낼 때 사용할 model name입니다.
- **Default Model** - route가 match되지 않을 때 사용할 fallback model입니다(예: "gpt-4o-mini"로 설정하면 match되지 않은 request는 gpt-4o-mini로 route됩니다).
- **Embedding Model** - input message의 embedding을 생성하는 데 사용할 model입니다. 이 embedding은 input을 route에 정의된 utterance와 semantic matching하는 데 사용됩니다.

#### Route 설정

<Image alt="Auto Router Setup" img={require('../../img/auto_router2.png')} style={{ borderRadius: '8px', marginBottom: '1em', maxWidth: '100%' }} />

<br />

<br />

새 routing rule을 만들려면 **Add Route**를 클릭합니다. 각 route는 input message와 matching되어 target model을 결정하는 utterance로 구성됩니다.

각 route에는 다음 값을 설정합니다.

- **Utterances** - 이 route를 trigger할 예제 phrase입니다. variable에는 bracket placeholder를 사용합니다.

```json
"how to code a program in [language]",
"can you explain this [language] code",
"can you explain this [language] script",
"can you convert this [language] code to [target_language]"
```

- **Description** - 이 route가 처리하는 내용을 설명하는 사람이 읽기 쉬운 description입니다.
- **Score Threshold** - 이 route를 trigger하는 데 필요한 최소 similarity score입니다(0.0-1.0).


### 사용법

추가 후 developer는 LLM API request의 `model` field에서 model=`auto_router1`을 선택해야 합니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="sk-1234", # replace with your LiteLLM API key
    base_url="http://localhost:4000"
)

# This request will be auto-routed based on the content
response = client.chat.completions.create(
    model="auto_router1",
    messages=[
        {
            "role": "user",
            "content": "how to code a program in python"
        }
    ]
)

print(response)
```
</TabItem>

<TabItem value="curl" label="Curl Request">

```shell
curl -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "auto_router1",
    "messages": [{"role": "user", "content": "how to code a program in python"}]
}'
```
</TabItem>
</Tabs>



## 동작 방식

1. request가 들어오면 LiteLLM이 input message의 embedding을 생성합니다.
2. 이 embedding을 route에 정의된 utterance와 비교합니다.
3. route의 similarity score가 threshold를 넘으면 request를 해당 model로 route합니다.
4. match되는 route가 없으면 request를 default model로 보냅니다.

---

## Complexity Router

Complexity Router는 **rule-based scoring**으로 request를 complexity에 따라 분류하고 적절한 model로 route하는 semantic routing의 대안입니다. **외부 API call 없이**, **sub-millisecond latency**로 동작합니다.

### 사용 시점

| 기능 | Semantic Auto Router | Complexity Router |
|---------|---------------------|-------------------|
| 분류 | Embedding-based matching | Rule-based scoring |
| 지연 시간 | ~100-500ms(embedding API) | &lt;1ms |
| API Calls | embedding model 필요 | 없음 |
| Training | utterance example 필요 | 바로 사용 가능 |
| Best For | intent 기반 routing | cost optimization |

다음이 필요할 때 **Complexity Router**를 사용하세요.
- simple query를 더 저렴하고 빠른 model로 route(예: gpt-4o-mini)
- complex query를 더 강력한 model로 route(예: claude-sonnet-4)
- routing decision으로 인한 latency overhead 최소화
- embedding용 additional API cost 회피

### LiteLLM Python SDK {#complexity-router-litellm-python-sdk}

```python
from litellm import Router

router = Router(
    model_list=[
        # Target models for each tier
        {
            "model_name": "gpt-4o-mini",
            "litellm_params": {"model": "gpt-4o-mini"},
        },
        {
            "model_name": "gpt-4o",
            "litellm_params": {"model": "gpt-4o"},
        },
        {
            "model_name": "claude-sonnet",
            "litellm_params": {"model": "claude-sonnet-4-20250514"},
        },
        {
            "model_name": "o1-preview",
            "litellm_params": {"model": "o1-preview"},
        },
        # Complexity router configuration
        {
            "model_name": "smart-router",
            "litellm_params": {
                "model": "auto_router/complexity_router",
                "complexity_router_config": {
                    "tiers": {
                        "SIMPLE": "gpt-4o-mini",
                        "MEDIUM": "gpt-4o",
                        "COMPLEX": "claude-sonnet",
                        "REASONING": "o1-preview",
                    },
                },
                "complexity_router_default_model": "gpt-4o",
            },
        },
    ],
)
```

#### 사용법

```python
# Simple query → routes to gpt-4o-mini
response = await router.acompletion(
    model="smart-router",
    messages=[{"role": "user", "content": "What is 2+2?"}],
)

# Complex technical query → routes to claude-sonnet or higher
response = await router.acompletion(
    model="smart-router",
    messages=[{"role": "user", "content": "Design a distributed microservice architecture with Kubernetes orchestration"}],
)

# Reasoning request → routes to o1-preview
response = await router.acompletion(
    model="smart-router",
    messages=[{"role": "user", "content": "Think step by step and reason through this problem carefully..."}],
)
```

### LiteLLM Proxy 서버 {#complexity-router-litellm-proxy-server}

`config.yaml`에 complexity router를 추가합니다.

```yaml
model_list:
  # Target models
  - model_name: gpt-4o-mini
    litellm_params:
      model: gpt-4o-mini
      
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      
  - model_name: claude-sonnet
    litellm_params:
      model: claude-sonnet-4-20250514
      
  - model_name: o1-preview
    litellm_params:
      model: o1-preview

  # Complexity router
  - model_name: smart-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE: gpt-4o-mini
          MEDIUM: gpt-4o
          COMPLEX: claude-sonnet
          REASONING: o1-preview
      complexity_router_default_model: gpt-4o
```

### 설정 Options

#### Tier Boundaries

각 tier의 score threshold를 조정합니다.

```yaml
complexity_router_config:
  tiers:
    SIMPLE: gpt-4o-mini
    MEDIUM: gpt-4o
    COMPLEX: claude-sonnet
    REASONING: o1-preview
  tier_boundaries:
    simple_medium: 0.15    # Below 0.15 → SIMPLE
    medium_complex: 0.35   # 0.15-0.35 → MEDIUM
    complex_reasoning: 0.60  # 0.35-0.60 → COMPLEX, above → REASONING
```

#### Token Thresholds

prompt가 "short" 또는 "long"으로 간주되는 기준을 조정합니다.

```yaml
complexity_router_config:
  token_thresholds:
    simple: 15   # Prompts under 15 tokens are penalized (simple indicator)
    complex: 400 # Prompts over 400 tokens get complexity boost
```

#### Dimension Weights

각 signal이 complexity score에 얼마나 기여하는지 조정합니다.

```yaml
complexity_router_config:
  dimension_weights:
    tokenCount: 0.10        # Prompt length
    codePresence: 0.30      # Code-related keywords
    reasoningMarkers: 0.25  # "step by step", "think through", etc.
    technicalTerms: 0.25    # Domain-specific complexity
    simpleIndicators: 0.05  # "what is", "define", greetings
    multiStepPatterns: 0.03 # "first...then", numbered steps
    questionComplexity: 0.02 # Multiple questions
```

### Complexity Routing 동작 방식

router는 각 request를 7개 dimension으로 scoring합니다.

| Dimension | 감지 내용 | 효과 |
|-----------|-----------------|--------|
| Token Count | 짧은(&lt;15) 또는 긴(&gt;400) prompt | short = simple, long = complex |
| Code Presence | "function", "class", "api", "database" 등 | complexity 증가 |
| Reasoning Markers | "step by step", "think through", "analyze" | REASONING tier를 trigger |
| Technical Terms | "architecture", "distributed", "encryption" | complexity 증가 |
| Simple Indicators | "what is", "define", "hello" | complexity 감소 |
| Multi-Step Patterns | "first...then", "1. 2. 3." | complexity 증가 |
| Question Complexity | 여러 question mark | complexity 증가 |

**특수 동작:** user message에서 reasoning marker가 2개 이상 감지되면 weighted score와 관계없이 request가 REASONING tier로 자동 route됩니다.
