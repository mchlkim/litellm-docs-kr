import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 태그 예산 설정 {#setting-tag-budgets}

태그를 사용해 API 요청의 지출을 추적하고 예산을 설정합니다. 태그를 사용하면 비용 센터, 프로젝트, 부서별로 비용을 분류하고 모니터링할 수 있습니다.

## 사전 요구 사항 {#pre-requisites}

- Postgres 데이터베이스를 설정해야 합니다(예: Supabase, Neon 등).

## 태그란 무엇인가요? {#what-are-tags}

태그는 LLM 요청에 붙일 수 있는 라벨입니다. 카테고리별 지출을 추적하고 제한하는 데 사용합니다.

**일반적인 사용 사례:**
- **비용 센터 추적**: LLM 비용을 특정 부서나 사업 단위에 배정합니다(예: `"engineering"`, `"marketing"`, `"customer-support"`).
- **프로젝트별 예산 관리**: 프로젝트나 이니셔티브별 예산을 설정합니다(예: `"project-alpha"`, `"chatbot-v2"`).
- **고객별 비용 귀속**: 고객 또는 클라이언트별 지출을 추적합니다(예: `"customer-acme"`, `"customer-techcorp"`).
- **기능별 모니터링**: 특정 기능의 비용을 모니터링합니다(예: `"feature-chat"`, `"feature-summarization"`).

태그는 각 요청의 `metadata` 필드에 추가되며, 예산 한도 추적과 적용에 사용됩니다.

## 태그 예산 설정 {#setting-tag-budgets-1}

### 1. 예산이 있는 태그 생성 {#1-create-a-tag-with-budget}

비용 센터, 프로젝트 또는 임의의 예산 카테고리를 나타내는 태그를 생성합니다. `max_budget`(허용되는 달러 금액)과 `budget_duration`(예산이 재설정되는 주기)을 설정합니다.

**예제:** Engineering 부서에 월 $500 예산을 가진 태그를 생성합니다.

#### API

새 태그를 생성하고 `max_budget`과 `budget_duration`을 설정합니다.

```shell
curl -X POST 'http://0.0.0.0:4000/tag/new' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
            "name": "engineering", 
            "description": "Engineering department cost center",
            "max_budget": 500.0, 
            "budget_duration": "30d"
        }' 
```

**요청 본문 매개변수:**

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `name` | string | 예 | 태그의 고유 이름(예: 비용 센터 이름) |
| `description` | string | 아니요 | 이 태그가 추적하는 대상 설명 |
| `models` | list[string] | 아니요 | 태그를 특정 모델로 제한 |
| `max_budget` | float | 아니요 | USD 기준 최대 예산 |
| `budget_duration` | string | 아니요 | 예산 재설정 주기(예: `"30d"`, `"1d"`) |
| `soft_budget` | float | 아니요 | 경고용 soft budget 한도 |

**Response:**

```json
{
  "name": "engineering",
  "description": "Engineering department cost center",
  "max_budget": 500.0,
  "budget_duration": "30d",
  "budget_reset_at": "2025-11-10T00:00:00Z",
  "created_at": "2025-10-11T00:00:00Z"
}  
```

#### LiteLLM 관리자 UI

**Tag Management** 페이지로 이동해 **Create New Tag**를 클릭합니다. 태그 세부 정보를 입력하고 예산을 설정합니다.

<Image 
  img={require('../../img/tag_budget1.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br />


**`budget_duration`에 사용할 수 있는 값:**

| `budget_duration` | 예산 재설정 시점 |
| --- | --- |
| `budget_duration="1s"` | 1초마다 |
| `budget_duration="1m"` | 1분마다 |
| `budget_duration="1h"` | 1시간마다 |
| `budget_duration="1d"` | 1일마다 |
| `budget_duration="7d"` | 1주마다 |
| `budget_duration="30d"` | 1개월마다 |

### 2. 요청에서 태그 사용 {#2-use-the-tag-in-your-requests}

API 요청의 `metadata` 필드에 태그를 추가합니다.

:::info API 키의 태그 예산

현재 태그 예산 적용은 요청 단위로만 지원됩니다. API 키에 태그를 설정해 모든 요청이 태그 예산을 자동 상속하게 하고 싶다면 [GitHub에서 기능 요청을 생성](https://github.com/BerriAI/litellm/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.yml&title=%5BFeat%5D%3A)해 주세요.

:::

<Tabs>

<TabItem value="openai" label="OpenAI SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",  # Your LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "metadata": {
            "tags": ["engineering"]
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="cURL">

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "gpt-4",
           "messages": [{"role": "user", "content": "Hello"}],
           "metadata": {
               "tags": ["engineering"]
           }
         }'
```

</TabItem>

</Tabs>

### 3. 테스트 {#3-test-it}

예산을 초과할 때까지 요청을 보냅니다.

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "gpt-4",
           "messages": [{"role": "user", "content": "Hello"}],
           "metadata": {
               "tags": ["engineering"]
           }
         }'
```

**예산을 초과하면 다음과 같은 응답이 표시됩니다.**

```json
{
  "error": {
    "message": "Budget has been exceeded! Tag=engineering Current cost: 505.50, Max budget: 500.0",
    "type": "budget_exceeded",
    "param": null,
    "code": "400"
  }
}
```

## 태그 관리 {#managing-tags}

### 태그 정보 조회 {#view-tag-information}

특정 태그의 정보를 가져옵니다.

```shell
curl -X POST 'http://0.0.0.0:4000/tag/info' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
           "names": ["engineering", "marketing"]
         }'
```

**Response:**

```json
{
  "engineering": {
    "name": "engineering",
    "description": "Engineering department cost center",
    "spend": 245.50,
    "max_budget": 500.0,
    "budget_duration": "30d",
    "budget_reset_at": "2025-11-10T00:00:00Z",
    "created_at": "2025-10-11T00:00:00Z",
    "updated_at": "2025-10-11T12:30:00Z"
  },
  "marketing": {
    "name": "marketing",
    "description": "Marketing department cost center",
    "spend": 89.20,
    "max_budget": 300.0,
    "budget_duration": "30d",
    "budget_reset_at": "2025-11-10T00:00:00Z",
    "created_at": "2025-10-11T00:00:00Z",
    "updated_at": "2025-10-11T12:30:00Z"
  }
}
```

### 태그 예산 업데이트 {#update-tag-budget}

기존 태그의 예산을 업데이트합니다.

```shell
curl -X POST 'http://0.0.0.0:4000/tag/update' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
           "name": "engineering",
           "max_budget": 750.0,
           "budget_duration": "30d"
         }'
```

### 태그 삭제 {#delete-tag}

```shell
curl -X POST 'http://0.0.0.0:4000/tag/delete' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
           "name": "engineering"
         }'
```

## 요청당 여러 태그 사용 {#multiple-tags-per-request}

단일 요청에 여러 태그를 적용해 여러 차원의 비용을 동시에 추적할 수 있습니다. 예를 들어 비용 센터와 특정 프로젝트를 함께 추적할 수 있습니다.

```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "metadata": {
            "tags": ["engineering", "project-alpha", "customer-acme"]
        }
    }
)
```

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H 'Authorization: Bearer sk-1234' \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "gpt-4",
           "messages": [{"role": "user", "content": "Hello"}],
           "metadata": {
               "tags": ["engineering", "project-alpha", "customer-acme"]
           }
         }'
```

**예산 적용:** 태그 중 하나라도 예산을 초과하면 요청이 거부됩니다.
