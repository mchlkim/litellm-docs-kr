import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [Beta] 요청 메타데이터 기반 라우팅 {#beta-routing-based-on-request-metadata}

요청 메타데이터를 기준으로 라우팅 규칙을 생성합니다.

## 설정 {#setup}

`litellm proxy config.yaml` 파일에 다음 설정을 추가합니다.

```yaml showLineNumbers title="litellm proxy config.yaml"
router_settings:
  enable_tag_filtering: True # 👈 Key Change
```

## 1. 태그 생성 {#1-create-a-tag}

LiteLLM UI에서 Experimental > Tag Management > Create Tag로 이동합니다.

`private-data`라는 태그를 만들고, 이 태그가 포함된 요청에 허용할 모델만 선택합니다. 생성이 완료되면 Tag Management 페이지에서 해당 태그를 확인할 수 있습니다.

<Image img={require('../../img/tag_create.png')}  style={{ width: '800px', height: 'auto' }} />


## 2. 태그 라우팅 테스트 {#2-test-tag-routing}

이제 태그 기반 라우팅 규칙을 테스트합니다.

### 2.1 유효하지 않은 모델 {#21-invalid-model}

이 요청은 `tags=private-data`를 보내지만, `gpt-4o` 모델이 `private-data` 태그의 허용 모델에 포함되어 있지 않으므로 실패합니다.

<Image img={require('../../img/tag_invalid.png')}  style={{ width: '800px', height: 'auto' }} />

<br />

다음은 OpenAI Python SDK로 동일한 요청을 보내는 예시입니다.
<Tabs>
<TabItem value="python" label="OpenAI Python SDK">

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000/v1/"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    extra_body={
        "tags": "private-data"
    }
)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "tags": "private-data"
}'
```

</TabItem>
</Tabs>

<br />

### 2.2 유효한 모델 {#22-valid-model}

이 요청은 `tags=private-data`를 보내고, `us.anthropic.claude-3-7-sonnet-20250219-v1:0` 모델이 `private-data` 태그의 허용 모델에 포함되어 있으므로 성공합니다.

<Image img={require('../../img/tag_valid.png')}  style={{ width: '800px', height: 'auto' }} />

다음은 OpenAI Python SDK로 동일한 요청을 보내는 예시입니다.

<Tabs>
<TabItem value="python" label="OpenAI Python SDK">

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000/v1/"
)

response = client.chat.completions.create(
    model="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    extra_body={
        "tags": "private-data"
    }
)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "tags": "private-data"
}'
```

</TabItem>
</Tabs>



## 추가 태그 기능 {#additional-tag-features}
- [요청 헤더로 태그 전송](https://docs.litellm.ai/docs/proxy/tag_routing#calling-via-request-header)
- [태그 기반 라우팅](https://docs.litellm.ai/docs/proxy/tag_routing)
- [태그별 지출 추적](../proxy/cost_tracking#custom-tags)
- [Virtual Key, Team별 예산 설정](users)
