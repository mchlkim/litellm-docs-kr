import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 입력 parameter

## 공통 parameter
LiteLLM은 모든 provider에서 [OpenAI Chat Completion params](https://platform.openai.com/docs/api-reference/chat/create)를 받고 변환합니다.

### 사용법
```python
import litellm

# set env variables
os.environ["OPENAI_API_KEY"] = "your-openai-key"

## SET MAX TOKENS - via completion() 
response = litellm.completion(
            model="gpt-3.5-turbo",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            max_tokens=10
        )

print(response)
```

### 변환되는 OpenAI parameter

특정 model + provider 조합에서 지원되는 최신 OpenAI parameter 목록은 이 함수로 확인할 수 있습니다.

```python
from litellm import get_supported_openai_params

response = get_supported_openai_params(model="anthropic.claude-3", custom_llm_provider="bedrock")

print(response) # ["max_tokens", "tools", "tool_choice", "stream"]
```

아래는 provider 간 변환되는 OpenAI parameter 목록입니다.

각 model + provider의 최신 parameter 목록은 `litellm.get_supported_openai_params()`를 사용하세요.

| Provider | temperature | max_completion_tokens | max_tokens | top_p | stream | stream_options | stop | n | presence_penalty | frequency_penalty | functions | function_call | logit_bias | user | response_format | seed| tools | tool_choice | logprobs | top_logprobs | extra_headers |
|--------------|-------------|------------------------|------------|-------|--------|----------------|------|-----|------------------|-------------------|-----------|----------------|-------------|------|------------------|-------------------|--------|--------------|----------|---------------|----------------------|
| Anthropic| ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | || | || | ✅ | ✅ | | ✅ | ✅ || | ✅|
| OpenAI | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅| ✅ | ✅| ✅| ✅ | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅| ✅|
| Azure OpenAI | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅| ✅ | ✅| ✅| ✅ | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅| ✅|
| xAI| ✅|| ✅ | ✅| ✅ | ✅ | ✅ | ✅| ✅ | ✅| || ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅||
| Replicate| ✅| ✅ | ✅ | ✅| ✅ | ✅ || || | || ||| |||| ||
| Anyscale | ✅| ✅ | ✅ | ✅| ✅ | ✅ || || | || ||| |||| ||
| Cohere | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅|| | || ||| |||| ||
| Huggingface| ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | || | || ||| |||| ||
| Openrouter | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅| ✅ | ✅| ✅|| ||| ✅| ✅ ||| ||
| AI21 | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅|| | || ||| |||| ||
| VertexAI | ✅| ✅ | ✅ | | ✅ | ✅ || || | || || ✅ | ✅|||| ||
| Bedrock| ✅| ✅ | ✅ | ✅| ✅ | ✅ || || | || || ✅ (model dependent) | |||| ||
| Sagemaker| ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | || | || ||| |||| ||
| TogetherAI | ✅| ✅ | ✅ | ✅| ✅ | ✅ || || | ✅|| || ✅ | | ✅ | ✅ || ||
| Sambanova| ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | || | || || ✅ | | ✅ | ✅ || ||
| AlephAlpha | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | || | || ||| |||| ||
| NLP Cloud| ✅| ✅ | ✅ | ✅| ✅ | ✅ || || | || ||| |||| ||
| Petals | ✅| ✅ || ✅| ✅ ||| || | || ||| |||| ||
| Ollama | ✅| ✅ | ✅ | ✅| ✅ | ✅ || ✅|| | || ✅||| | ✅ ||| ||
| Databricks | ✅| ✅ | ✅ | ✅| ✅ | ✅ || || | || ||| |||| ||
| ClarifAI | ✅| ✅ | ✅ | | ✅ | ✅ || || | || ||| |||| ||
| Github | ✅| ✅ | ✅ | ✅| ✅ | ✅ | ✅ | ✅| ✅ | ✅| ✅|| || ✅ | ✅ (model dependent) | ✅ (model dependent) || ||
| Novita AI| ✅| ✅ || ✅| ✅ | ✅ | ✅ | ✅| ✅ | ✅| || ✅||| |||| ||
| Bytez | ✅| ✅ || ✅| ✅ | | | ✅|| || || || || || ||
| `OVHCloud AI Endpoints` | ✅ | | ✅ | ✅ | ✅ | ✅ | ✅ | | | | | | | | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |

:::note

기본적으로 전달된 OpenAI parameter가 지원되지 않으면 LiteLLM은 exception을 발생시킵니다.

해당 parameter를 버리려면 `litellm.drop_params = True` 또는 `completion(..drop_params=True)`를 설정하세요.

이 설정은 **지원되지 않는 OPENAI PARAMS만 DROP**합니다.

LiteLLM은 OpenAI parameter가 아닌 값은 provider-specific parameter로 간주하고 request body의 kwarg로 전달합니다.

::: 

## 입력 parameter

```python
def completion(
    model: str,
    messages: List = [],
    # Optional OpenAI params
    timeout: Optional[Union[float, int]] = None,
    temperature: Optional[float] = None,
    top_p: Optional[float] = None,
    n: Optional[int] = None,
    stream: Optional[bool] = None,
    stream_options: Optional[dict] = None,
    stop=None,
    max_completion_tokens: Optional[int] = None,
    max_tokens: Optional[int] = None,
    presence_penalty: Optional[float] = None,
    frequency_penalty: Optional[float] = None,
    logit_bias: Optional[dict] = None,
    user: Optional[str] = None,
    # openai v1.0+ new params
    response_format: Optional[dict] = None,
    seed: Optional[int] = None,
    tools: Optional[List] = None,
    tool_choice: Optional[str] = None,
    parallel_tool_calls: Optional[bool] = None,
    logprobs: Optional[bool] = None,
    top_logprobs: Optional[int] = None,
    safety_identifier: Optional[str] = None,
    deployment_id=None,
    # soon to be deprecated params by OpenAI
    functions: Optional[List] = None,
    function_call: Optional[str] = None,
    # set api_base, api_version, api_key
    base_url: Optional[str] = None,
    api_version: Optional[str] = None,
    api_key: Optional[str] = None,
    model_list: Optional[list] = None,  # pass in a list of api_base,keys, etc.
    # Optional liteLLM function params
    **kwargs,

) -> ModelResponse:
```
### 필수 field

- `model`: *string* - 사용할 model의 ID입니다. Chat API에서 어떤 model이 동작하는지는 model endpoint compatibility table을 참고하세요.
  
- `messages`: *array* - 지금까지의 conversation을 구성하는 message list입니다.

#### `messages`의 properties
*Note* - array 안의 각 message는 다음 properties를 포함합니다.

- `role`: *string* - message 작성자의 role입니다. role은 system, user, assistant, function, tool이 될 수 있습니다.

- `content`: *string or list[dict] or null* - message content입니다. 모든 message에 필요하지만, function call이 있는 assistant message에서는 null일 수 있습니다.

- `name`: *string (optional)* - message 작성자 이름입니다. role이 "function"이면 필요합니다. name은 content가 나타내는 function 이름과 일치해야 합니다. 소문자 a-z, 대문자 A-Z, 숫자 0-9, underscore 문자를 포함할 수 있고 최대 길이는 64자입니다.

- `function_call`: *object (optional)* - model이 생성한 호출 대상 function의 name과 arguments입니다.

- `tool_call_id`: *str (optional)* - 이 message가 응답하는 tool call입니다.


[**전체 message value 보기**](https://github.com/BerriAI/litellm/blob/main/litellm/types/llms/openai.py#L664)

#### Content type

`content`는 string(text only) 또는 content block list(multimodal)일 수 있습니다.

| Type | 설명 | 문서 |
|------|-------------|------|
| `text` | text content | [Type Definition](https://github.com/BerriAI/litellm/blob/main/litellm/types/llms/openai.py#L598) |
| `image_url` | image | [Vision](./vision.md) |
| `input_audio` | audio input | [Audio](./audio.md) |
| `video_url` | video input | [Type Definition](https://github.com/BerriAI/litellm/blob/main/litellm/types/llms/openai.py#L625) |
| `file` | file | [문서 이해](./document_understanding.md) |
| `document` | document/PDF | [문서 이해](./document_understanding.md) |

**예제:**
```python
# Text
messages=[{"role": "user", "content": [{"type": "text", "text": "Hello!"}]}]

# Image
messages=[{"role": "user", "content": [{"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}]}]

# Audio
messages=[{"role": "user", "content": [{"type": "input_audio", "input_audio": {"data": "<base64>", "format": "wav"}}]}]

# Video
messages=[{"role": "user", "content": [{"type": "video_url", "video_url": {"url": "https://example.com/video.mp4"}}]}]

# File
messages=[{"role": "user", "content": [{"type": "file", "file": {"file_id": "https://example.com/doc.pdf"}}]}]

# Document
messages=[{"role": "user", "content": [{"type": "document", "source": {"type": "text", "media_type": "application/pdf", "data": "<base64>"}}]}]

# Combining multiple types (multimodal)
messages=[{"role": "user", "content": [
    {"type": "text", "text": "Generate a product description based on this image"},
    {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
]}]
```

## 선택 field

- `temperature`: *number 또는 null (optional)* - 사용할 sampling temperature입니다. 범위는 0에서 2입니다. 0.8처럼 높은 값은 더 random한 output을 만들고, 0.2처럼 낮은 값은 더 focused하고 deterministic한 output을 만듭니다.

- `top_p`: *number 또는 null (optional)* - temperature 기반 sampling의 대안입니다. model이 top_p probability에 해당하는 token 결과만 고려하도록 지시합니다. 예를 들어 0.1은 상위 10% probability mass를 구성하는 token만 고려한다는 의미입니다.

- `n`: *integer 또는 null (optional)* - 각 input message에 대해 생성할 chat completion choice 수입니다.

- `stream`: *boolean 또는 null (optional)* - true로 설정하면 partial message delta를 전송합니다. token은 사용 가능해지는 대로 전송되며 stream은 [DONE] message로 종료됩니다.

- `stream_options` *dict 또는 null (optional)* - streaming response option입니다. `stream: true`를 설정할 때만 사용하세요.

    - `include_usage` *boolean (optional)* - 설정하면 data: [DONE] message 전에 추가 chunk가 stream됩니다. 이 chunk의 usage field는 전체 request의 token usage statistics를 보여주며, choices field는 항상 empty array입니다. 다른 모든 chunk에도 usage field가 포함되지만 값은 null입니다.

- `stop`: *string/ array/ null (optional)* - API가 추가 token 생성을 멈출 sequence입니다. 최대 4개까지 지정할 수 있습니다.
  
  **Note**: OpenAI는 최대 4개의 stop sequence를 지원합니다. 4개를 초과해 제공하면 LiteLLM은 list를 처음 4개 element로 자동 truncate합니다. 이 자동 truncate를 비활성화하려면 `litellm.disable_stop_sequence_limit = True`를 설정하세요.

- `max_completion_tokens`: *integer (optional)* - completion에서 생성할 수 있는 token 수의 upper bound입니다. visible output token과 reasoning token을 포함합니다.

- `max_tokens`: *integer (optional)* - chat completion에서 생성할 최대 token 수입니다.

- `presence_penalty`: *number 또는 null (optional)* - 지금까지의 text에 존재했는지 여부를 기준으로 새 token에 penalty를 적용할 때 사용합니다.

- `response_format`: *object (optional)* - model이 출력해야 하는 format을 지정하는 object입니다.

    - `{ "type": "json_object" }`로 설정하면 JSON mode가 활성화되어 model이 생성하는 message가 valid JSON임을 보장합니다.
    
    - 중요: JSON mode를 사용할 때는 system 또는 user message로 model에게 JSON을 생성하라고 직접 지시해야 합니다. 그렇지 않으면 token limit에 도달할 때까지 whitespace가 계속 생성되어 request가 오래 실행되거나 "stuck"된 것처럼 보일 수 있습니다. 또한 `finish_reason="length"`이면 generation이 max_tokens를 초과했거나 conversation이 max context length를 초과했다는 의미이며, message content가 일부 잘릴 수 있습니다.

- `seed`: *integer 또는 null (optional)* - 이 feature는 Beta입니다. 지정하면 system은 같은 seed와 parameter를 가진 반복 request가 같은 result를 반환하도록 deterministic sampling을 best effort로 시도합니다. determinism은 보장되지 않으며 backend 변경을 monitor하려면 response parameter `system_fingerprint`를 참고해야 합니다.

- `tools`: *array (optional)* - model이 호출할 수 있는 tool list입니다. model이 JSON input을 생성할 function list를 제공할 때 사용합니다.

    - `type`: *string* - tool type입니다. `"function"` 또는 `/responses` schema와 일치하는 `"mcp"`로 설정하여 `/chat/completions`에서 LiteLLM에 등록된 MCP server를 직접 호출할 수 있습니다.

    - `function`: *object* - function tool에 필요합니다.

- `tool_choice`: *string 또는 object (optional)* - model이 어떤 function을 호출할지 제어합니다. none은 model이 function을 호출하지 않고 message를 생성한다는 의미입니다. auto는 model이 message 생성과 function call 중 선택할 수 있다는 의미입니다. `{"type": "function", "function": {"name": "my_function"}}`처럼 특정 function을 지정하면 model이 해당 function을 호출하도록 강제합니다.

    - function이 없으면 `none`이 default입니다. function이 있으면 `auto`가 default입니다.

- `parallel_tool_calls`: *boolean (optional)* - tool 사용 중 parallel function calling을 활성화할지 여부입니다. OpenAI default는 true입니다.

- `frequency_penalty`: *number 또는 null (optional)* - 지금까지의 text에 등장한 frequency를 기준으로 새 token에 penalty를 적용할 때 사용합니다.

- `logit_bias`: *map (optional)* - completion에 특정 token이 등장할 probability를 수정할 때 사용합니다.

- `user`: *string (optional)* - end-user를 나타내는 unique identifier입니다. OpenAI가 abuse를 monitor하고 detect하는 데 도움이 됩니다.

- `timeout`: *int (optional)* - completion request의 timeout 초입니다(기본값: 600초).

- `logprobs`: * bool (optional)* - output token의 log probability를 반환할지 여부입니다. true이면 message content에 반환된 각 output token의 log probability를 반환합니다.
        
- `top_logprobs`: *int (optional)* - 각 token position에서 반환할 가능성이 가장 높은 token 수를 지정하는 0에서 5 사이의 integer입니다. 각 token에는 관련 log probability가 포함됩니다. 이 parameter를 사용하려면 `logprobs`를 true로 설정해야 합니다.

- `safety_identifier`: *string (optional)* - safety-related request를 tracking하고 관리하기 위한 unique identifier입니다. 이 parameter는 safety monitoring 및 compliance tracking에 도움이 됩니다.

- `headers`: *dict (optional)* - request와 함께 보낼 header dictionary입니다.

- `extra_headers`: *dict (optional)* - `headers`의 대안으로, LLM API request에 extra header를 보낼 때 사용합니다.

#### Deprecated params
- `functions`: *array* - model이 JSON input을 생성하는 데 사용할 수 있는 function list입니다. 각 function은 다음 properties를 가져야 합니다.

- `name`: *string* - 호출할 function name입니다. 소문자 a-z, 대문자 A-Z, 숫자 0-9, underscore, dash 문자를 포함할 수 있고 최대 길이는 64자입니다.
    
    - `description`: *string (optional)* - function이 무엇을 하는지 설명합니다. model이 function을 언제 어떻게 호출할지 결정하는 데 도움이 됩니다.
    
    - `parameters`: *object* - function이 받는 parameter이며 JSON Schema object로 설명됩니다.
    
- `function_call`: *string 또는 object (optional)* - model이 function call에 어떻게 응답하는지 제어합니다.


#### LiteLLM 전용 params 

- `api_base`: *string (optional)* - model을 호출할 때 사용할 API endpoint입니다.

- `api_version`: *string (optional)* - (Azure-specific) 호출에 사용할 API version입니다.

- `num_retries`: *int (optional)* - APIError, TimeoutError, ServiceUnavailableError가 발생했을 때 API call을 retry할 횟수입니다.

- `context_window_fallback_dict`: *dict (optional)* - context window error로 call이 실패했을 때 사용할 model mapping입니다.

- `fallbacks`: *list (optional)* - initial call이 실패할 경우 사용할 model name + param list입니다.

- `metadata`: *dict (optional)* - call이 발생할 때 logging할 추가 data입니다. logging integration(예: promptlayer)으로 전송되며 custom callback function에서 접근할 수 있습니다.

**CUSTOM MODEL COST** 
- `input_cost_per_token`: *float (optional)* - completion call의 input token당 cost입니다.

- `output_cost_per_token`: *float (optional)* - completion call의 output token당 cost입니다.

**CUSTOM PROMPT TEMPLATE** (자세한 내용은 [prompt formatting](./prompt_formatting.md#format-prompt-yourself)을 참고하세요)
- `initial_prompt_value`: *string (optional)* - input message 시작 부분에 적용할 initial string입니다.

- `roles`: *dict (optional)* - `messages`로 전달된 role + message를 기준으로 prompt format 방법을 지정하는 dictionary입니다.

- `final_prompt_value`: *string (optional)* - input message 끝에 적용할 final string입니다.

- `bos_token`: *string (optional)* - sequence 시작 부분에 적용할 initial string입니다.

- `eos_token`: *string (optional)* - sequence 끝에 적용할 string입니다.

- `hf_model_name`: *string (optional)* - [Sagemaker Only] model에 대응하는 Hugging Face name입니다. 해당 model에 맞는 chat template을 가져오는 데 사용합니다.
