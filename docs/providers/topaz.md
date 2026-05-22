# Topaz

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | AI 기반 전문가급 사진 및 동영상 편집입니다. |
| LiteLLM의 공급자 라우트 | `topaz/` |
| 공급자 문서 | [Topaz ↗](https://www.topazlabs.com/enhance-api) |
| 공급자 API 엔드포인트 | https://api.topazlabs.com |
| 지원되는 OpenAI 엔드포인트 | `/image/variations` |


## 빠른 시작

```python
from litellm import image_variation
import os 

os.environ["TOPAZ_API_KEY"] = ""
response = image_variation(
    model="topaz/Standard V2", image=image_url
)
```

## 지원되는 OpenAI 매개변수 {#supported-openai-params}

- `response_format`
- `size` (너비x높이)
