import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Budget Manager

직접 LLM API를 호출하거나 사용자가 호출할 때 과도한 청구가 발생하지 않도록 제어하려면 이 기능을 사용하세요.

:::info

사용자 키, 예산 등을 서버에서 관리하려면 [LiteLLM Proxy Server](./proxy/virtual_keys.md)를 사용하세요.

:::

LiteLLM은 다음을 제공합니다.
* `litellm.max_budget`: 모든 litellm 호출에 적용할 최대 예산(USD)을 설정하는 전역 변수입니다. 예산을 초과하면 `BudgetExceededError`를 발생시킵니다.
* `BudgetManager`: 사용자별 예산 설정을 돕는 클래스입니다. `BudgetManager`는 사용자를 key로, 현재 비용과 모델별 비용을 object로 갖는 dictionary를 만들어 사용자 예산을 관리합니다.
* `LiteLLM Proxy Server`: OpenAI 호환 엔드포인트로 100개 이상의 LLM을 호출하는 서버입니다. 사용자 예산, 지출 추적, 로드 밸런싱 등을 관리합니다.

## 빠른 시작 {#quick-start}

```python 
import litellm, os 
from litellm import completion

# set env variable 
os.environ["OPENAI_API_KEY"] = "your-api-key"

litellm.max_budget = 0.001 # sets a max budget of $0.001

messages = [{"role": "user", "content": "Hey, how's it going"}]
completion(model="gpt-4", messages=messages)
print(litellm._current_cost)
completion(model="gpt-4", messages=messages)
```

## 사용자 기반 rate limiting {#user-based-rate-limiting}
<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_User_Based_Rate_Limits.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

```python
from litellm import BudgetManager, completion 

budget_manager = BudgetManager(project_name="test_project")

user = "1234"

# create a budget if new user user
if not budget_manager.is_valid_user(user):
    budget_manager.create_budget(total_budget=10, user=user)

# check if a given call can be made
if budget_manager.get_current_cost(user=user) <= budget_manager.get_total_budget(user):
    response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hey, how's it going?"}])
    budget_manager.update_cost(completion_obj=response, user=user)
else:
    response = "Sorry - no budget!"
```

[**구현 코드**](https://github.com/BerriAI/litellm/blob/main/litellm/budget_manager.py)

## Text Input / Output으로 사용 {#use-with-text-input-output}

텍스트 입력/출력과 모델 이름만 전달해 비용을 업데이트할 수 있습니다.

```python
from litellm import BudgetManager

budget_manager = BudgetManager(project_name="test_project")
user = "12345"
budget_manager.create_budget(total_budget=10, user=user, duration="daily")

input_text = "hello world"
output_text = "it's a sunny day in san francisco"
model = "gpt-3.5-turbo"

budget_manager.update_cost(user=user, model=model, input_text=input_text, output_text=output_text) # 👈
print(budget_manager.get_current_cost(user))
```

## 고급 사용법 {#advanced-usage}
프로덕션에서는 다음이 필요합니다.
* 사용자 예산을 데이터베이스에 저장
* 설정된 기간을 기준으로 사용자 예산 재설정



### LiteLLM API

LiteLLM API는 두 가지를 모두 제공합니다. 사용자 객체를 hosted DB에 저장하고, 매일 cron job을 실행해 설정된 기간을 기준으로 사용자 예산을 재설정합니다(예: 일/주/월 단위 예산 재설정).

**사용법**
```python
budget_manager = BudgetManager(project_name="<my-unique-project>", client_type="hosted")
```

**전체 코드**
```python
from litellm import BudgetManager, completion 

budget_manager = BudgetManager(project_name="<my-unique-project>", client_type="hosted")

user = "1234"

# create a budget if new user user
if not budget_manager.is_valid_user(user):
    budget_manager.create_budget(total_budget=10, user=user, duration="monthly") # 👈 duration = 'daily'/'weekly'/'monthly'/'yearly'

# check if a given call can be made
if budget_manager.get_current_cost(user=user) <= budget_manager.get_total_budget(user):
    response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hey, how's it going?"}])
    budget_manager.update_cost(completion_obj=response, user=user)
else:
    response = "Sorry - no budget!"
```

### Self-hosted

자체 DB를 사용하려면 `BudgetManager` client type을 `hosted`로 설정하고 `api_base`도 설정하세요.

API는 `/get_budget` 및 `/set_budget` 엔드포인트를 노출해야 합니다. 자세한 내용은 [코드](https://github.com/BerriAI/litellm/blob/27f1051792176a7eb1fe3b72b72bccd6378d24e9/litellm/budget_manager.py#L7)를 확인하세요.

**사용법**
```python
budget_manager = BudgetManager(project_name="<my-unique-project>", client_type="hosted", api_base="your_custom_api")
```
**전체 코드**
```python
from litellm import BudgetManager, completion 

budget_manager = BudgetManager(project_name="<my-unique-project>", client_type="hosted", api_base="your_custom_api")

user = "1234"

# create a budget if new user user
if not budget_manager.is_valid_user(user):
    budget_manager.create_budget(total_budget=10, user=user, duration="monthly") # 👈 duration = 'daily'/'weekly'/'monthly'/'yearly'

# check if a given call can be made
if budget_manager.get_current_cost(user=user) <= budget_manager.get_total_budget(user):
    response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hey, how's it going?"}])
    budget_manager.update_cost(completion_obj=response, user=user)
else:
    response = "Sorry - no budget!"
```

## Budget Manager 클래스 {#budget-manager-class}
`BudgetManager` 클래스는 사용자별 예산을 관리하는 데 사용합니다. 예산 정보를 생성, 업데이트, 조회하는 여러 함수를 제공합니다.

아래는 Budget Manager 클래스가 노출하는 public 함수와 입출력 목록입니다.

### __init__
```python
def __init__(self, project_name: str, client_type: str = "local", api_base: Optional[str] = None)
```
- `project_name` (str): 프로젝트 이름입니다.
- `client_type` (str): 클라이언트 타입(`"local"` 또는 `"hosted"`). 기본값은 `"local"`입니다.
- `api_base` (Optional[str]): API의 base URL입니다. 기본값은 `None`입니다.


### create_budget
```python
def create_budget(self, total_budget: float, user: str, duration: Literal["daily", "weekly", "monthly", "yearly"], created_at: float = time.time())
```
사용자의 예산을 생성합니다.

- `total_budget` (float): 사용자의 총 예산입니다.
- `user` (str): 사용자 ID입니다.
- `duration` (Literal["daily", "weekly", "monthly", "yearly"]): 예산 기간입니다.
- `created_at` (float): 생성 시간입니다. 기본값은 현재 시간입니다.

### projected_cost
```python
def projected_cost(self, model: str, messages: list, user: str)
```
세션의 예상 비용을 계산합니다.

- `model` (str): 모델 이름입니다.
- `messages` (list): 메시지 목록입니다.
- `user` (str): 사용자 ID입니다.

### get_total_budget
```python
def get_total_budget(self, user: str)
```
사용자의 총 예산을 반환합니다.

- `user` (str): 사용자 ID입니다.

### update_cost
```python
def update_cost(self, completion_obj: ModelResponse, user: str)
```
사용자의 비용을 업데이트합니다.

- `completion_obj` (ModelResponse): 모델에서 받은 completion 객체입니다.
- `user` (str): 사용자 ID입니다.

### get_current_cost
```python
def get_current_cost(self, user: str)
```
사용자의 현재 비용을 반환합니다.

- `user` (str): 사용자 ID입니다.

### get_model_cost 
```python
def get_model_cost(self, user: str)
```
사용자의 모델별 비용을 반환합니다.

- `user` (str): 사용자 ID입니다.

### is_valid_user 
```python
def is_valid_user(self, user: str) -> bool
```
사용자가 유효한지 확인합니다.

- `user` (str): 사용자 ID입니다.

### get_users 
```python
def get_users(self)
```
모든 사용자 목록을 반환합니다.

### reset_cost 
```python
def reset_cost(self, user: str)
```
사용자의 비용을 재설정합니다.

- `user` (str): 사용자 ID입니다.

### reset_on_duration 
```python
def reset_on_duration(self, user: str)
```
기간을 기준으로 사용자의 비용을 재설정합니다.

- `user` (str): 사용자 ID입니다.

### update_budget_all_users 
```python
def update_budget_all_users(self)
```
모든 사용자의 예산을 업데이트합니다.

### save_data 
```python
def save_data(self)
```
사용자 dictionary를 저장합니다.
