import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 세션 로그 {#session-로그}

요청을 세션으로 그룹화합니다. 이를 통해 관련 요청을 함께 묶을 수 있습니다.


<Image img={require('../../img/ui_session_logs.png')}/>

## 사용법 

### `/chat/completions`

여러 요청을 하나의 세션으로 그룹화하려면 각 요청의 메타데이터에 동일한 `litellm_session_id`를 전달하세요. 방법은 다음과 같습니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

**요청 1**
고유한 ID로 새 세션을 만들고 첫 번째 요청을 보냅니다. 세션 ID는 모든 관련 요청을 추적하는 데 사용됩니다.

```python showLineNumbers
import openai
import uuid

# Create a session ID
session_id = str(uuid.uuid4())

client = openai.OpenAI(
    api_key="<your litellm api key>",
    base_url="http://0.0.0.0:4000"
)

# First request in session
response1 = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": "Write a short story about a robot"
        }
    ],
    extra_body={
        "litellm_session_id": session_id  # Pass the session ID
    }
)
```

**요청 2**
동일한 세션 ID를 사용해 다른 요청을 보내 이전 요청과 연결합니다. 이렇게 하면 관련 요청을 함께 추적할 수 있습니다.

```python showLineNumbers
# Second request using same session ID
response2 = client.chat.completions.create(
    model="gpt-4o", 
    messages=[
        {
            "role": "user",
            "content": "Now write a poem about that robot"
        }
    ],
    extra_body={
        "litellm_session_id": session_id  # Reuse the same session ID
    }
)
```

</TabItem>
<TabItem value="langchain" label="Langchain">

**요청 1**
고유한 ID로 새 세션을 초기화하고 요청을 보낼 채팅 모델 인스턴스를 만듭니다. 세션 ID는 모델 구성에 포함됩니다.

```python showLineNumbers
from langchain.chat_models import ChatOpenAI
import uuid

# Create a session ID
session_id = str(uuid.uuid4())

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    model="gpt-4o",
    extra_body={
        "litellm_session_id": session_id  # Pass the session ID
    }
)

# First request in session
response1 = chat.invoke("Write a short story about a robot")
```

**요청 2**
동일한 채팅 모델 인스턴스로 다른 요청을 보내 이전에 구성한 세션 ID를 통해 세션 컨텍스트를 자동으로 유지합니다.

```python showLineNumbers
# Second request using same chat object and session ID
response2 = chat.invoke("Now write a poem about that robot")
```

</TabItem>
<TabItem value="curl" label="Curl">

**요청 1**
새 세션 ID를 생성하고 초기 API 호출을 보냅니다. 메타데이터의 세션 ID는 이 대화를 추적하는 데 사용됩니다.

```bash showLineNumbers
# Create a session ID
SESSION_ID=$(uuidgen)

# Store your API key
API_KEY="<your litellm api key>"

# First request in session
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
    "model": "gpt-4o",
    "messages": [
        {
        "role": "user",
        "content": "Write a short story about a robot"
        }
    ],
    "litellm_session_id": "'$SESSION_ID'"
}'
```

**요청 2**
동일한 세션 ID를 사용해 후속 요청을 보내 대화 컨텍스트와 추적을 유지합니다.

```bash showLineNumbers
# Second request using same session ID
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
    "model": "gpt-4o",
    "messages": [
        {
        "role": "user",
        "content": "Now write a poem about that robot"
        }
    ],
    "litellm_session_id": "'$SESSION_ID'"
}'
```

</TabItem>
<TabItem value="litellm" label="LiteLLM Python SDK">

**요청 1**
고유한 ID를 만들고 초기 요청을 보내 새 세션을 시작합니다. 이 세션 ID는 관련 요청을 함께 그룹화하는 데 사용됩니다.

```python showLineNumbers
import litellm
import uuid

# Create a session ID
session_id = str(uuid.uuid4())

# First request in session
response1 = litellm.completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a short story about a robot"}],
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    metadata={
        "litellm_session_id": session_id  # Pass the session ID
    }
)
```

**요청 2**
동일한 세션 ID로 다른 요청을 보내 이전 상호작용과 연결하면서 대화를 이어갑니다.

```python showLineNumbers
# Second request using same session ID
response2 = litellm.completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Now write a poem about that robot"}],
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    metadata={
        "litellm_session_id": session_id  # Reuse the same session ID
    }
)
```

</TabItem>
</Tabs>

### `/responses`

`/responses` 엔드포인트에서는 `previous_response_id`를 사용해 요청을 세션으로 그룹화합니다. `previous_response_id`는 각 요청의 응답에서 반환됩니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

**요청 1**
초기 요청을 보내고 후속 요청을 연결하기 위해 응답 ID를 저장합니다.

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="<your litellm api key>",
    base_url="http://0.0.0.0:4000"
)

# First request in session
response1 = client.responses.create(
    model="anthropic/claude-3-sonnet-20240229-v1:0",
    input="Write a short story about a robot"
)

# Store the response ID for the next request
response_id = response1.id
```

**요청 2**
이전 응답 ID를 사용해 후속 요청을 보내 대화 컨텍스트를 유지합니다.

```python showLineNumbers
# Second request using previous response ID
response2 = client.responses.create(
    model="anthropic/claude-3-sonnet-20240229-v1:0",
    input="Now write a poem about that robot",
    previous_response_id=response_id  # Link to previous request
)
```

</TabItem>
<TabItem value="curl" label="Curl">

**요청 1**
초기 요청을 보냅니다. 응답에는 후속 요청을 연결하는 데 사용할 수 있는 ID가 포함됩니다.

```bash showLineNumbers
# Store your API key
API_KEY="<your litellm api key>"

# First request in session
curl http://localhost:4000/v1/responses \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
        "model": "anthropic/claude-3-sonnet-20240229-v1:0",
        "input": "Write a short story about a robot"
    }'

# Response will include an 'id' field that you'll use in the next request
```

**요청 2**
이전 응답 ID를 사용해 후속 요청을 보내 대화 컨텍스트를 유지합니다.

```bash showLineNumbers
# Second request using previous response ID
curl http://localhost:4000/v1/responses \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
        "model": "anthropic/claude-3-sonnet-20240229-v1:0",
        "input": "Now write a poem about that robot",
        "previous_response_id": "resp_abc123..."  # Replace with actual response ID from previous request
    }'
```

</TabItem>
<TabItem value="litellm" label="LiteLLM Python SDK">

**요청 1**
초기 요청을 보내고 후속 요청을 연결하기 위해 응답 ID를 저장합니다.

```python showLineNumbers
import litellm

# First request in session
response1 = litellm.responses(
    model="anthropic/claude-3-sonnet-20240229-v1:0",
    input="Write a short story about a robot",
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>"
)

# Store the response ID for the next request
response_id = response1.id
```

**요청 2**
이전 응답 ID를 사용해 후속 요청을 보내 대화 컨텍스트를 유지합니다.

```python showLineNumbers
# Second request using previous response ID
response2 = litellm.responses(
    model="anthropic/claude-3-sonnet-20240229-v1:0",
    input="Now write a poem about that robot",
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    previous_response_id=response_id  # Link to previous request
)
```

</TabItem>
</Tabs>
