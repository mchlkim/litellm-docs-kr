import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM AI Gateway 프롬프트 관리 {#litellm-ai-gateway-prompt-management}

LiteLLM AI Gateway를 사용해 프롬프트를 생성하고 관리하며 버전을 지정합니다.

## 빠른 시작

### Prompts 인터페이스 접근 {#prompts-interface}

1. LiteLLM dashboard에서 **Experimental > Prompts**로 이동합니다.
2. 기존 프롬프트가 다음 열과 함께 테이블에 표시됩니다.
   - **Prompt ID**: 각 프롬프트의 고유 식별자
   - **Model**: 프롬프트에 설정된 LLM 모델
   - **Created At**: 프롬프트가 생성된 타임스탬프
   - **Updated At**: 마지막 업데이트 타임스탬프
   - **Type**: 프롬프트 유형(예: db)
   - **Actions**: 프롬프트 삭제 및 관리 옵션(admin only)

![Prompt Table](../../img/prompt_table.png)

## 프롬프트 생성 {#prompt-create}

새 프롬프트를 만들려면 **+ Add New Prompt** 버튼을 클릭합니다.

### 1단계: 모델 선택 {#step-1-select-model}

상단 드롭다운 메뉴에서 사용할 LLM 모델을 선택합니다. 설정된 모델 중 아무 모델이나 선택할 수 있습니다(예: `aws/anthropic/bedrock-claude-3-5-sonnet`, `gpt-4o` 등).

### 2단계: Developer Message 설정 {#step-2-developer-message}

**Developer message** 섹션에서는 모델에 대한 선택적 시스템 지침을 설정할 수 있습니다. 이는 모델 동작을 안내하는 시스템 프롬프트로 작동합니다.

예:

```
Respond as jack sparrow would
```

이 설정은 모델이 영화 캐리비안의 해적에 나오는 Captain Jack Sparrow 스타일로 응답하도록 지시합니다.

![Developer Message가 포함된 프롬프트 추가](../../img/add_prompt.png)

### 3단계: Prompt Messages 추가 {#step-3-prompt-messages}

**Prompt messages** 섹션에서 실제 프롬프트 콘텐츠를 추가할 수 있습니다. 프롬프트 템플릿에 추가 메시지를 넣으려면 **+ Add message**를 클릭합니다.

### 4단계: 프롬프트에서 변수 사용 {#step-4-prompt-variables}

변수를 사용하면 런타임에 사용자 지정 가능한 동적 프롬프트를 만들 수 있습니다. 프롬프트에 변수를 삽입하려면 `{{variable_name}}` 구문을 사용합니다.

예:

```
Give me a recipe for {{dish}}
```

UI는 프롬프트의 변수를 자동 감지하고 **Detected variables** 섹션에 표시합니다.

![변수가 포함된 프롬프트 추가](../../img/add_prompt_var.png)

### 5단계: 프롬프트 테스트 {#step-5-test-prompt}

저장하기 전에 UI에서 프롬프트를 직접 테스트할 수 있습니다.

1. 오른쪽 패널에서 템플릿 변수를 입력합니다(예: `dish`를 `cookies`로 설정).
2. 프롬프트를 테스트하기 위해 채팅 인터페이스에 메시지를 입력합니다.
3. 어시스턴트는 설정된 모델, developer message, 치환된 변수를 사용해 응답합니다.

![변수가 포함된 프롬프트 테스트](../../img/add_prompt_use_var1.png)

결과에는 변수가 치환된 모델 응답이 표시됩니다.

![프롬프트 테스트 결과](../../img/add_prompt_use_var.png)

### 6단계: 프롬프트 저장 {#step-6-save-prompt}

프롬프트가 만족스럽다면 오른쪽 위의 **Save** 버튼을 클릭해 프롬프트 라이브러리에 저장합니다.

## 프롬프트 사용 {#prompt-usage}

프롬프트가 게시되면 LiteLLM Proxy API를 통해 애플리케이션에서 사용할 수 있습니다. UI의 **Get Code** 버튼을 클릭하면 프롬프트에 맞게 사용자 지정된 코드 스니펫을 볼 수 있습니다.

### 기본 사용법 {#basic-usage}

프롬프트 ID와 모델만으로 프롬프트를 호출합니다.

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Basic Prompt Call"
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-4",
    "prompt_id": "your-prompt-id"
  }' | jq
```

</TabItem>
<TabItem value="python" label="Python">

```python showLineNumbers title="basic_prompt.py"
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="gpt-4",
    extra_body={
        "prompt_id": "your-prompt-id"
    }
)

print(response)
```

</TabItem>
<TabItem value="javascript" label="JavaScript">

```javascript showLineNumbers title="basicPrompt.js"
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: "sk-1234",
    baseURL: "http://localhost:4000"
});

async function main() {
    const response = await client.chat.completions.create({
        model: "gpt-4",
        prompt_id: "your-prompt-id"
    });
    
    console.log(response);
}

main();
```

</TabItem>
</Tabs>

### 사용자 지정 메시지 사용 {#custom-messages}

프롬프트에 사용자 지정 메시지를 추가합니다.

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Prompt with Custom Messages"
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-4",
    "prompt_id": "your-prompt-id",
    "messages": [
      {
        "role": "user",
        "content": "hi"
      }
    ]
  }' | jq
```

</TabItem>
<TabItem value="python" label="Python">

```python showLineNumbers title="prompt_with_messages.py"
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "hi"}
    ],
    extra_body={
        "prompt_id": "your-prompt-id"
    }
)

print(response)
```

</TabItem>
<TabItem value="javascript" label="JavaScript">

```javascript showLineNumbers title="promptWithMessages.js"
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: "sk-1234",
    baseURL: "http://localhost:4000"
});

async function main() {
    const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "user", content: "hi" }
        ],
        prompt_id: "your-prompt-id"
    });
    
    console.log(response);
}

main();
```

</TabItem>
</Tabs>

### 프롬프트 변수 사용 {#prompt-variables}

`prompt_variables`를 사용해 프롬프트 템플릿에 변수를 전달합니다.

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Prompt with Variables"
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-4",
    "prompt_id": "your-prompt-id",
    "prompt_variables": {
      "dish": "cookies"
    }
  }' | jq
```

</TabItem>
<TabItem value="python" label="Python">

```python showLineNumbers title="prompt_with_variables.py"
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="gpt-4",
    extra_body={
        "prompt_id": "your-prompt-id",
        "prompt_variables": {
            "dish": "cookies"
        }
    }
)

print(response)
```

</TabItem>
<TabItem value="javascript" label="JavaScript">

```javascript showLineNumbers title="promptWithVariables.js"
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: "sk-1234",
    baseURL: "http://localhost:4000"
});

async function main() {
    const response = await client.chat.completions.create({
        model: "gpt-4",
        prompt_id: "your-prompt-id",
        prompt_variables: {
            "dish": "cookies"
        }
    });
    
    console.log(response);
}

main();
```

</TabItem>
</Tabs>

## 프롬프트 버전 관리 {#prompt-versioning}

LiteLLM은 프롬프트를 업데이트할 때마다 자동으로 버전을 생성합니다. 이를 통해 변경 이력을 완전하게 유지하고 필요할 때 이전 버전으로 롤백할 수 있습니다.

### 프롬프트 상세 보기 {#prompt-details}

프롬프트 테이블에서 prompt ID를 클릭하면 상세 페이지를 볼 수 있습니다. 이 페이지에는 다음이 표시됩니다.
- **Prompt ID**: 프롬프트의 고유 식별자
- **Version**: 현재 버전 번호(예: v4)
- **Prompt Type**: 저장소 유형(예: db)
- **Created At**: 프롬프트가 처음 생성된 시점
- **Last Updated**: 가장 최근 업데이트 타임스탬프
- **LiteLLM Parameters**: 원시 JSON 설정

![Prompt Details](../../img/edit_prompt.png)

### Prompt 업데이트

기존 프롬프트를 업데이트하려면:

1. 프롬프트 테이블에서 업데이트할 프롬프트를 클릭합니다.
2. 오른쪽 위의 **Prompt Studio** 버튼을 클릭합니다.
3. 다음 항목을 변경합니다.
   - 모델 선택
   - Developer message(시스템 지침)
   - 프롬프트 메시지
   - 변수
4. 오른쪽 채팅 인터페이스에서 변경 사항을 테스트합니다.
5. 새 버전을 저장하려면 **Update** 버튼을 클릭합니다.

![Studio에서 프롬프트 편집](../../img/edit_prompt2.png)

**Update**를 클릭할 때마다 같은 프롬프트 ID를 유지하면서 새 버전이 생성됩니다(v1 -> v2 -> v3 등).

### 버전 기록 보기 {#version-history}

프롬프트의 모든 버전을 보려면:

1. **Prompt Studio**에서 prompt를 엽니다.
2. 오른쪽 위의 **History** 버튼을 클릭합니다.
3. 오른쪽에 **Version History** 패널이 열립니다.

![버전 기록 패널](../../img/edit_prompt3.png)

버전 기록 패널에는 다음이 표시됩니다.
- **Latest version**("Latest" 배지와 "Active" 상태로 표시)
- 모든 이전 버전(v4, v3, v2, v1 등)
- 각 버전의 타임스탬프
- 데이터베이스 저장 상태("Saved to Database")

### 이전 버전 보기 및 복원 {#previous-version-restore}

이전 버전을 보거나 복원하려면:

1. **Version History** 패널에서 이전 버전(예: v2)을 클릭합니다.
2. Prompt Studio가 해당 버전의 설정을 불러옵니다.
3. 다음을 확인할 수 있습니다.
   - 해당 버전의 developer message
   - 해당 버전의 prompt messages
   - 사용된 모델과 매개변수
   - 당시 정의된 모든 변수

![View Older Version](../../img/edit_prompt4.png)

선택한 버전은 버전 기록 패널에서 "Active" 배지로 강조 표시됩니다.

이전 버전을 복원하려면:
1. 복원하려는 이전 버전을 봅니다.
2. **Update** 버튼을 클릭합니다.
3. 이전 버전의 콘텐츠로 새 버전이 생성됩니다.

### API 호출에서 특정 버전 사용 {#specific-version-api-call}

기본적으로 API 호출은 프롬프트의 최신 버전을 사용합니다. 특정 버전을 사용하려면 `prompt_version` 매개변수를 전달합니다.

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Use Specific Prompt Version"
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-4",
    "prompt_id": "jack-sparrow",
    "prompt_version": 2,
    "messages": [
      {
        "role": "user",
        "content": "Who are u"
      }
    ]
  }' | jq
```

</TabItem>
<TabItem value="python" label="Python">

```python showLineNumbers title="prompt_version.py"
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Who are u"}
    ],
    extra_body={
        "prompt_id": "jack-sparrow",
        "prompt_version": 2
    }
)

print(response)
```

</TabItem>
<TabItem value="javascript" label="JavaScript">

```javascript showLineNumbers title="promptVersion.js"
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: "sk-1234",
    baseURL: "http://localhost:4000"
});

async function main() {
    const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "user", content: "Who are u" }
        ],
        prompt_id: "jack-sparrow",
        prompt_version: 2
    });
    
    console.log(response);
}

main();
```

</TabItem>
</Tabs>
