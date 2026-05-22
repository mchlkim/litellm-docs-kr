
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 비용 추적

LiteLLM은 MCP tool call 비용을 추적하는 두 가지 방법을 제공합니다.

| 방식 | 사용 시점 | 동작 |
|--------|-------------|--------------|
| **Config 기반 비용 추적** | tool/server별 고정 비용으로 단순하게 추적할 때 | 설정을 기준으로 비용을 자동 추적 |
| **Custom Post-MCP Hook** | custom logic으로 동적 비용 추적이 필요할 때 | custom 비용 계산과 응답 수정을 허용 |

### Config 기반 비용 추적

`config.yaml`에서 MCP 서버별 고정 비용을 직접 설정합니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-xxxxxxx

mcp_servers:
  zapier_server:
    url: "https://actions.zapier.com/mcp/sk-xxxxx/sse"
    mcp_info:
      mcp_server_cost_info:
        # Default cost for all tools in this server
        default_cost_per_query: 0.01
        # Custom cost for specific tools
        tool_name_to_cost_per_query:
          send_email: 0.05
          create_document: 0.03
          
  expensive_api_server:
    url: "https://api.expensive-service.com/mcp"
    mcp_info:
      mcp_server_cost_info:
        default_cost_per_query: 1.50
```

### `Custom Post-MCP Hook`

동적 비용 계산이 필요하거나 MCP 응답을 사용자에게 반환하기 전에 수정하고 싶을 때 사용합니다.

#### 1. custom MCP hook 파일 생성

```python title="custom_mcp_hook.py" showLineNumbers
from typing import Optional
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.mcp import MCPPostCallResponseObject


class CustomMCPCostTracker(CustomLogger):
    """
    Custom handler for MCP cost tracking and response modification
    """
    
    async def async_post_mcp_tool_call_hook(
        self, 
        kwargs, 
        response_obj: MCPPostCallResponseObject, 
        start_time, 
        end_time
    ) -> Optional[MCPPostCallResponseObject]:
        """
        Called after each MCP tool call. 
        Modify costs and response before returning to user.
        """
        
        # Extract tool information from kwargs
        tool_name = kwargs.get("name", "")
        server_name = kwargs.get("server_name", "")
        
        # Calculate custom cost based on your logic
        custom_cost = 42.00
        
        # Set the response cost
        response_obj.hidden_params.response_cost = custom_cost
        
  
      
        return response_obj
    

# Create instance for LiteLLM to use
custom_mcp_cost_tracker = CustomMCPCostTracker()
```

#### 2. `config.yaml`에서 설정

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-xxxxxxx

# Add your custom MCP hook
callbacks:
  - custom_mcp_hook.custom_mcp_cost_tracker

mcp_servers:
  zapier_server:
    url: "https://actions.zapier.com/mcp/sk-xxxxx/sse"
```

#### 3. 프록시 시작

```shell
$ litellm --config /path/to/config.yaml 
```

MCP tool이 호출되면 custom hook은 다음을 수행합니다.
1. custom logic을 기준으로 비용을 계산합니다.
2. 필요한 경우 응답을 수정합니다.
3. LiteLLM logging system에 비용을 기록합니다.
