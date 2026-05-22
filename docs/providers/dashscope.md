# Dashscope API (Qwen 모델)
https://dashscope.console.aliyun.com/

**모든 Qwen 모델(Alibaba Cloud 제공)을 지원합니다. completion 요청을 보낼 때 `dashscope/`를 접두사로 지정하기만 하면 됩니다.**

## API 키 {#api-key}
```python
# env variable
os.environ['DASHSCOPE_API_KEY']
```

## API Base {#api-base}
지역에 따라 API base URL을 선택적으로 지정할 수 있습니다.

| 지역 | API Base |
|--------|----------|
| **국제** | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| **중국/베이징** | `https://dashscope.aliyuncs.com/compatible-mode/v1` |

```python
# Set via environment variable
os.environ['DASHSCOPE_API_BASE'] = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

# Or pass directly in the completion call
response = completion(
    model="dashscope/qwen-turbo",
    messages=[{"role": "user", "content": "hello"}],
    api_base="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)
```

## 사용 예시 {#sample-usage}
```python
from litellm import completion
import os

os.environ['DASHSCOPE_API_KEY'] = ""
response = completion(
    model="dashscope/qwen-turbo", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 사용 예시 - 스트리밍 {#sample-usage---streaming}
```python
from litellm import completion
import os

os.environ['DASHSCOPE_API_KEY'] = ""
response = completion(
    model="dashscope/qwen-turbo", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```


## 지원되는 모든 모델 {#all-supported-models}

[DashScope 모델 목록](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope?spm=a2c4g.11186623.help-menu-2400256.d_2_8_0.1efd516e2tTXBn&scm=20140722.H_2833609._.OR_help-T_cn~zh-V_1#7f9c78ae99pwz)

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| qwen-turbo | `completion(model="dashscope/qwen-turbo", messages)` | 
| qwen-plus | `completion(model="dashscope/qwen-plus", messages)` | 
| qwen-max | `completion(model="dashscope/qwen-max", messages)` | 
| qwen-turbo-latest | `completion(model="dashscope/qwen-turbo-latest", messages)` | 
| qwen-plus-latest | `completion(model="dashscope/qwen-plus-latest", messages)` | 
| qwen-max-latest | `completion(model="dashscope/qwen-max-latest", messages)` | 
| qwen-vl-plus | `completion(model="dashscope/qwen-vl-plus", messages)` |  
| qwen-vl-max | `completion(model="dashscope/qwen-vl-max", messages)` |  
| qwq-32b | `completion(model="dashscope/qwq-32b", messages)` |  
| qwq-32b-preview | `completion(model="dashscope/qwq-32b-preview", messages)` |  
| qwen3-235b-a22b | `completion(model="dashscope/qwen3-235b-a22b", messages)` |  
| qwen3-32b | `completion(model="dashscope/qwen3-32b", messages)` |  
| qwen3-30b-a3b | `completion(model="dashscope/qwen3-30b-a3b", messages)` |
