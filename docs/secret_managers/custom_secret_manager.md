import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 커스텀 시크릿 매니저 {#custom-secret-manager}

사용자 지정 시크릿 관리 시스템을 LiteLLM과 통합합니다.

## 빠른 시작

### 1. 시크릿 매니저 클래스 생성 {#1-create-your-secret-manager-class}

인메모리 시크릿 저장소가 있는 새 파일 `my_secret_manager.py`를 생성합니다.

```python showLineNumbers title="my_secret_manager.py"
from typing import Optional, Union
import httpx
from litellm.integrations.custom_secret_manager import CustomSecretManager

class InMemorySecretManager(CustomSecretManager):
    def __init__(self):
        super().__init__(secret_manager_name="in_memory_secrets")
        # Store your secrets in memory
        self.secrets = {
            "OPENAI_API_KEY": "sk-...",
            "ANTHROPIC_API_KEY": "sk-ant-...",
        }

    async def async_read_secret(
        self,
        secret_name: str,
        optional_params: Optional[dict] = None,
        timeout: Optional[Union[float, httpx.Timeout]] = None,
    ) -> Optional[str]:
        """Read secret asynchronously"""
        return self.secrets.get(secret_name)

    def sync_read_secret(
        self,
        secret_name: str,
        optional_params: Optional[dict] = None,
        timeout: Optional[Union[float, httpx.Timeout]] = None,
    ) -> Optional[str]:
        """Read secret synchronously"""
        return self.secrets.get(secret_name)
```

### 2. Proxy 설정 {#2-configure-proxy}

`config.yaml`에서 커스텀 시크릿 매니저를 참조합니다.

```yaml showLineNumbers title="config.yaml"
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  key_management_system: custom  # 👈 KEY CHANGE
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager  # 👈 KEY CHANGE

model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY  # Read from custom secret manager
```

### 3. LiteLLM Proxy 시작 {#3-start-litellm-proxy}

<Tabs>
<TabItem value="docker" label="Docker">

커스텀 시크릿 매니저 파일을 컨테이너에 마운트합니다.

```bash showLineNumbers
docker run -d \
  -p 4000:4000 \
  -e LITELLM_MASTER_KEY=$LITELLM_MASTER_KEY \
  --name litellm-proxy \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -v $(pwd)/my_secret_manager.py:/app/my_secret_manager.py \
  docker.litellm.ai/berriai/litellm:main-latest \
  --config /app/config.yaml \
  --port 4000 \
  --detailed_debug
```

</TabItem>

<TabItem value="pip" label="Python 패키지">

```bash
litellm --config config.yaml --detailed_debug
```

</TabItem>
</Tabs>

## 설정 옵션 {#configuration-options}

`config.yaml`에서 시크릿 매니저 동작을 사용자 지정합니다.

<Tabs>
<TabItem value="read_only" label="키 읽기만">

```yaml showLineNumbers title="config.yaml"
general_settings:
  key_management_system: custom
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager
    hosted_keys: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]  # Only check these keys
```

</TabItem>

<TabItem value="write_only" label="가상 키 저장">

LiteLLM Proxy 가상 키를 시크릿 매니저에 저장합니다.

```yaml showLineNumbers title="config.yaml"
general_settings:
  key_management_system: custom
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager
    access_mode: "write_only"
    store_virtual_keys: true
    prefix_for_stored_virtual_keys: "litellm/"
    description: "LiteLLM virtual key"
    tags:
      Environment: "Production"
      Team: "AI"
```

</TabItem>

<TabItem value="read_and_write" label="읽기 + 쓰기">

```yaml showLineNumbers title="config.yaml"
general_settings:
  key_management_system: custom
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager
    access_mode: "read_and_write"
    hosted_keys: ["OPENAI_API_KEY"]
    store_virtual_keys: true
    prefix_for_stored_virtual_keys: "litellm/"
```

</TabItem>
</Tabs>

### 사용 가능한 설정 {#available-settings}

| 설정 | 설명 | 기본값 |
|---------|-------------|---------|
| `custom_secret_manager` | 커스텀 시크릿 매니저 클래스 경로 | 필수 |
| `access_mode` | `"read_only"`, `"write_only"` 또는 `"read_and_write"` | `"read_only"` |
| `hosted_keys` | 시크릿 매니저에서 확인할 특정 키 목록 | 모든 키 |
| `store_virtual_keys` | LiteLLM 가상 키를 시크릿 매니저에 저장 | `false` |
| `prefix_for_stored_virtual_keys` | 저장된 가상 키에 붙일 접두사 | `"litellm/"` |
| `description` | 저장된 시크릿에 대한 설명 | `None` |
| `tags` | 저장된 시크릿에 적용할 태그 | `None` |

## 필수 메서드 {#required-methods}

커스텀 시크릿 매니저는 다음 두 메서드를 **반드시** 구현해야 합니다.

### `async_read_secret()`

```python showLineNumbers
async def async_read_secret(
    self,
    secret_name: str,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
) -> Optional[str]:
    """
    Read a secret asynchronously.
    
    Returns:
        Secret value if found, None otherwise
    """
    pass
```

### `sync_read_secret()`

```python showLineNumbers
def sync_read_secret(
    self,
    secret_name: str,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
) -> Optional[str]:
    """
    Read a secret synchronously.
    
    Returns:
        Secret value if found, None otherwise
    """
    pass
```

## 선택적 메서드 {#optional-methods}

추가 기능이 필요하면 다음 메서드를 구현합니다.

### `async_write_secret()`

```python showLineNumbers
async def async_write_secret(
    self,
    secret_name: str,
    secret_value: str,
    description: Optional[str] = None,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
    tags: Optional[Union[dict, list]] = None,
) -> dict:
    """Write a secret to your secret manager"""
    pass
```

### `async_delete_secret()`

```python showLineNumbers
async def async_delete_secret(
    self,
    secret_name: str,
    recovery_window_in_days: Optional[int] = 7,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
) -> dict:
    """Delete a secret from your secret manager"""
    pass
```

## 사용 사례 {#use-cases}

✅ 독자적인 볼트 시스템  
✅ 커스텀 인증(mTLS, OAuth)  
✅ 조직별 보안 정책  
✅ 레거시 시크릿 저장 시스템  
✅ 다중 리전 시크릿 복제  
✅ 시크릿 버전 관리 및 교체  
✅ 컴플라이언스 요구사항(HIPAA, SOC2)  

## 예제

[cookbook/litellm_proxy_server/secret_manager/my_secret_manager.py](https://github.com/BerriAI/litellm/blob/main/cookbook/litellm_proxy_server/secret_manager/my_secret_manager.py)에서 다음을 포함한 완전한 동작 예제를 확인할 수 있습니다.

- 인메모리 시크릿 매니저 구현  
- LiteLLM Proxy 통합  
- 읽기, 쓰기, 삭제 작업
