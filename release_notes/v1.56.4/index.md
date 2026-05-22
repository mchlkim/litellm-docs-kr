---
title: v1.56.4
slug: v1.56.4
date: 2024-12-29T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [deepgram, fireworks ai, vision, admin ui, dependency upgrades]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';


`deepgram`, `fireworks ai`, `vision`, `admin ui`, `dependency upgrades`

## 새 모델 {#new-models}

### Deepgram 음성 텍스트 변환 지원 {#deepgram-speech-to-text}

Deepgram 모델을 위한 새로운 음성 텍스트 변환 지원입니다. [**여기서 시작**](https://docs.litellm.ai/docs/providers/deepgram)

```python
from litellm import transcription
import os 

# set api keys 
os.environ["DEEPGRAM_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(model="deepgram/nova-2", file=audio_file)

print(f"response: {response}")
```

### 모든 모델에 대한 **Fireworks AI - Vision** 지원 {#fireworks-ai---vision-support-for-all-models}
LiteLLM은 Fireworks AI 모델에 대해 문서 인라인 처리를 지원합니다. 이는 Vision 모델은 아니지만 문서/이미지 등을 파싱해야 하는 모델에 유용합니다.
모델이 Vision 모델이 아닌 경우 LiteLLM은 image_url의 url에 `#transform=inline`을 추가합니다. [코드 보기](https://github.com/BerriAI/litellm/blob/1ae9d45798bdaf8450f2dfdec703369f3d2212b7/litellm/llms/fireworks_ai/chat/transformation.py#L114)


## Proxy 관리자 UI

- `Test Key` 탭은 응답에 사용된 `model`을 표시합니다.

<Image img={require('../../img/release_notes/ui_model.png')} />

- `Test Key` 탭은 `.md`, `.py` 형식의 콘텐츠를 렌더링합니다(모든 코드/Markdown 형식).

<Image img={require('../../img/release_notes/ui_format.png')} />


## 의존성 업그레이드 {#dependency-upgrades}

- (보안 수정) `fastapi==0.115.5`로 업그레이드 https://github.com/BerriAI/litellm/pull/7447

## 버그 수정 {#bug-fixes}

- realtime 모델에 대한 상태 확인 지원 추가 [여기](https://docs.litellm.ai/docs/proxy/health#realtime-models)
- audio_transcription 모델의 상태 확인 오류 https://github.com/BerriAI/litellm/issues/5999




