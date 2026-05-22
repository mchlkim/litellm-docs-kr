import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 예측 출력 {#predicted-outputs}

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | LLM 출력의 대부분을 미리 알고 있을 때 사용합니다. 예를 들어 모델에 텍스트나 코드를 약간만 변경해 다시 작성하도록 요청하는 경우, 기존 콘텐츠를 예측값으로 전달해 예측 출력을 사용하면 지연 시간을 크게 줄일 수 있습니다. |
| 지원 제공자 | `openai` |
| 예측 출력에 대한 OpenAI 문서 링크 | [Predicted Outputs ↗](https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs) |
| 지원 LiteLLM 버전 | `v1.51.4` |



## 예측 출력 사용하기 {#using-predicted-outputs}

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

이 예제에서는 C# 코드 일부를 리팩터링하고 Username 속성을 Email로 변환하려고 합니다.
```python
import litellm
os.environ["OPENAI_API_KEY"] = "your-api-key"
code = """
/// <summary>
/// Represents a user with a first name, last name, and username.
/// </summary>
public class User
{
    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's username.
    /// </summary>
    public string Username { get; set; }
}
"""

completion = litellm.completion(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "user",
            "content": "Replace the Username property with an Email property. Respond only with code, and with no markdown formatting.",
        },
        {"role": "user", "content": code},
    ],
    prediction={"type": "content", "content": code},
)

print(completion)
```

</TabItem>
<TabItem label="LiteLLM Proxy Server" value="proxy">

1. config.yaml에서 모델을 정의합니다.

```yaml
model_list:
  - model_name: gpt-4o-mini # OpenAI gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY 

```

2. 프록시 서버를 실행합니다.

```bash
litellm --config config.yaml
```

3. OpenAI Python SDK를 사용해 테스트합니다.


```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-1234
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "user",
            "content": "Replace the Username property with an Email property. Respond only with code, and with no markdown formatting.",
        },
        {"role": "user", "content": code},
    ],
    prediction={"type": "content", "content": code},
)

print(completion)
```

</TabItem>
</Tabs>
