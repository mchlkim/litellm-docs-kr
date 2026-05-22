import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AI Hub

조직 안에서 모델과 에이전트를 공유하세요. 개발자가 다시 만들 필요 없이 사용할 수 있는 항목을 확인할 수 있습니다.

이 기능은 **v1.74.3-stable 이상**에서 사용할 수 있습니다.

## 개요

관리자는 공개 AI Hub에 노출할 모델/에이전트를 선택할 수 있습니다. 사용자는 공개 URL로 이동해 사용 가능한 항목을 확인합니다.

<Image img={require('../../img/final_public_model_hub_view.png')} />  

## 모델

### 사용 방법

#### 1. 관리자 UI로 이동 {#1-go-to-the-admin-ui}

관리자 UI에서 Model Hub 페이지(`PROXY_BASE_URL/ui/?login=success&page=model-hub-table`)로 이동합니다.

<Image img={require('../../img/model_hub_admin_view.png')} />  

#### 2. 노출할 모델 선택 {#2-select-the-models-you-want-to-expose}

`Select Model to Make Public`을 클릭하고 노출할 모델을 선택합니다.

<Image img={require('../../img/make_public_modal.png')} />  

#### 3. 변경 사항 확인 {#3-confirm-the-changes}

<Image img={require('../../img/make_public_modal_confirmation.png')} />  

#### 4. 완료 {#4-success}

공개 URL(`PROXY_BASE_URL/ui/model_hub_table`)로 이동해 사용 가능한 모델을 확인합니다.

<Image img={require('../../img/final_public_model_hub_view.png')} />  

### API 엔드포인트 {#api-endpoints}

- `GET /public/model_hub` - 공개 모델 그룹 목록을 반환합니다. 유효한 사용자 API 키가 필요합니다.
- `GET /public/model_hub/info` - 공개 Model Hub의 메타데이터(문서 제목, 버전, 유용한 링크)를 반환합니다.

## 에이전트 {#agents}

:::info
에이전트는 v1.79.4-stable 이상에서만 사용할 수 있습니다.
:::

미리 빌드한 에이전트(A2A spec)를 조직 전체에 공유하세요. 사용자는 에이전트를 다시 만들 필요 없이 찾아서 사용할 수 있습니다.

[**데모 영상**](https://drive.google.com/file/d/1r-_Rtiu04RW5Fwwu3_eshtA1oZtC3_DH/view?usp=sharing)

### 1. 에이전트 생성 {#1-create-an-agent}

[A2A spec](https://a2a.dev/)을 따르는 에이전트를 생성합니다.

<Tabs>
<TabItem value="ui" label="UI">

<Image img={require('../../img/add_agent.png')} />  

</TabItem>
<TabItem value="api" label="API">
```bash
curl -X POST 'http://0.0.0.0:4000/v1/agents' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{
  "agent_name": "hello-world-agent",
  "agent_card_params": {
    "protocolVersion": "1.0",
    "name": "Hello World Agent",
    "description": "Just a hello world agent",
    "url": "http://localhost:9999/",
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {
      "streaming": true
    },
    "skills": [
      {
        "id": "hello_world",
        "name": "Returns hello world",
        "description": "just returns hello world",
        "tags": ["hello world"],
        "examples": ["hi", "hello world"]
      }
    ]
  }
}'
```

**예상 응답**

```json
{
  "agent_id": "123e4567-e89b-12d3-a456-426614174000",
  "agent_name": "hello-world-agent",
  "agent_card_params": {
    "protocolVersion": "1.0",
    "name": "Hello World Agent",
    "description": "Just a hello world agent",
    "url": "http://localhost:9999/",
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {
      "streaming": true
    },
    "skills": [
      {
        "id": "hello_world",
        "name": "Returns hello world",
        "description": "just returns hello world",
        "tags": ["hello world"],
        "examples": ["hi", "hello world"]
      }
    ]
  },
  "created_at": "2025-11-15T10:30:00Z",
  "created_by": "user123"
}
```

</TabItem>
</Tabs>

### 2. 에이전트 공개 설정 {#2-make-agent-public}

AI Hub에서 에이전트를 찾을 수 있도록 공개 상태로 설정합니다.

<Tabs>
<TabItem value="ui" label="UI">

AI Hub 페이지의 Agents 탭으로 이동합니다.

<Image img={require('../../img/ai_hub_with_agents.png')} />  

공개할 에이전트를 선택하고 `Make Public` 버튼을 클릭합니다.

<Image img={require('../../img/make_agents_public.png')} />  

</TabItem>
<TabItem value="api" label="API">

**옵션 1: 단일 에이전트 공개**

```bash
curl -X POST 'http://0.0.0.0:4000/v1/agents/123e4567-e89b-12d3-a456-426614174000/make_public' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json'
```

**옵션 2: 여러 에이전트 공개**


```bash
curl -X POST 'http://0.0.0.0:4000/v1/agents/make_public' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{
  "agent_ids": [
    "123e4567-e89b-12d3-a456-426614174000",
    "123e4567-e89b-12d3-a456-426614174001"
  ]
}'
```

**예상 응답**

```json
{
  "message": "Successfully updated public agent groups",
  "public_agent_groups": [
    "123e4567-e89b-12d3-a456-426614174000"
  ],
  "updated_by": "user123"
}
```

</TabItem>

</Tabs>



### 3. 공개 에이전트 보기 {#3-view-public-agents}

이제 사용자는 공개 엔드포인트를 통해 에이전트를 찾을 수 있습니다.

<Tabs>
<TabItem value="ui" label="UI">

<Image img={require('../../img/public_agent_hub.png')} />  

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X GET 'http://0.0.0.0:4000/public/agent_hub' \
--header 'Authorization: Bearer <user-api-key>'
```

**예상 응답**

```json
[
  {
    "protocolVersion": "1.0",
    "name": "Hello World Agent",
    "description": "Just a hello world agent",
    "url": "http://localhost:9999/",
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {
      "streaming": true
    },
    "skills": [
      {
        "id": "hello_world",
        "name": "Returns hello world",
        "description": "just returns hello world",
        "tags": ["hello world"],
        "examples": ["hi", "hello world"]
      }
    ]
  }
]
```

</TabItem>
</Tabs>


## MCP 서버 {#mcp-servers}

### 사용 방법

#### 1. MCP 서버 추가 {#1-add-mcp-server}

설정 방법은 [MCP 개요](../mcp#adding-your-mcp)를 참고하세요.


#### 2. MCP 서버 공개 설정 {#2-make-mcp-server-public}

<Tabs>
<TabItem value="ui" label="UI">

AI Hub 페이지로 이동한 뒤 MCP 탭(`PROXY_BASE_URL/ui/?login=success&page=mcp-server-table`)을 선택합니다.

<Image img={require('../../img/mcp_server_on_ai_hub.png')} />  

</TabItem>
<TabItem value="api" label="API">

```bash
curl -L -X POST 'http://localhost:4000/v1/mcp/make_public' \
-H 'Authorization: Bearer sk-1234' \ 
-H 'Content-Type: application/json' \
-d '{"mcp_server_ids":["e856f9a3-abc6-45b1-9d06-62fa49ac293d"]}'
```

</TabItem>
</Tabs>


#### 3. 공개 MCP 서버 보기 {#3-view-public-mcp-servers}

이제 사용자는 공개 엔드포인트(`PROXY_BASE_URL/ui/model_hub_table`)를 통해 MCP 서버를 찾을 수 있습니다.

<Tabs>
<TabItem value="ui" label="UI">

<Image img={require('../../img/mcp_on_public_ai_hub.png')} />  

</TabItem>
<TabItem value="api" label="API">

```bash
curl -L -X GET 'http://0.0.0.0:4000/public/mcp_hub' \
-H 'Authorization: Bearer sk-1234'
```

**예상 응답**

```json
[
    {
        "server_id": "e856f9a3-abc6-45b1-9d06-62fa49ac293d",
        "name": "deepwiki-mcp",
        "alias": null,
        "server_name": "deepwiki-mcp",
        "url": "https://mcp.deepwiki.com/mcp",
        "transport": "http",
        "spec_path": null,
        "auth_type": "none",
        "mcp_info": {
            "server_name": "deepwiki-mcp",
            "description": "free mcp server "
        }
    },
    {
        "server_id": "a634819f-3f93-4efc-9108-e49c5b83ad84",
        "name": "deepwiki_2",
        "alias": "deepwiki_2",
        "server_name": "deepwiki_2",
        "url": "https://mcp.deepwiki.com/mcp",
        "transport": "http",
        "spec_path": null,
        "auth_type": "none",
        "mcp_info": {
            "server_name": "deepwiki_2",
            "mcp_server_cost_info": null
        }
    },
    {
        "server_id": "33f950e4-2edb-41fa-91fc-0b9581269be6",
        "name": "edc_mcp_server",
        "alias": "edc_mcp_server",
        "server_name": "edc_mcp_server",
        "url": "http://lelvdckdputildev.itg.ti.com:8085/api/mcp",
        "transport": "http",
        "spec_path": null,
        "auth_type": "none",
        "mcp_info": {
            "server_name": "edc_mcp_server",
            "mcp_server_cost_info": null
        }
    }
]
```

</TabItem>
</Tabs>
