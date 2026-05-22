---
slug: video_characters_api
title: "새 Video Characters, Edit, Extension API 지원"
date: 2026-03-16T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM은 이제 여러 video generation에서 재사용 가능한 video character 생성, 조회, 관리를 지원합니다."
tags: [videos, characters, proxy, routing, video-api]
hide_table_of_contents: false
---

LiteLLM은 이제 video character, edit, extension API를 지원합니다.

{/* truncate */}

## 새로운 기능

video character 작업을 위한 네 가지 endpoint가 추가되었습니다.
- **Create character** - video를 업로드해 재사용 가능한 asset 생성
- **Get character** - character metadata 조회
- **Edit video** - 생성된 video 수정
- **Extend video** - character consistency를 유지하며 clip 연장

**사용 가능 버전:** LiteLLM v1.83.0+

## Quick 예제

```python
import litellm

# Create character from video
character = litellm.avideo_create_character(
    name="Luna",
    video=open("luna.mp4", "rb"),
    custom_llm_provider="openai",
    model="sora-2"
)
print(f"Character: {character.id}")

# Use in generation
video = litellm.avideo(
    model="sora-2",
    prompt="Luna dances through a magical forest.",
    characters=[{"id": character.id}],
    seconds="8"
)

# Get character info
fetched = litellm.avideo_get_character(
    character_id=character.id,
    custom_llm_provider="openai"
)

# Edit with character preserved
edited = litellm.avideo_edit(
    video_id=video.id,
    prompt="Add warm golden lighting"
)

# Extend sequence
extended = litellm.avideo_extension(
    video_id=video.id,
    prompt="Luna waves goodbye",
    seconds="5"
)
```

## Proxy 사용

```bash
# Create character
curl -X POST "http://localhost:4000/v1/videos/characters" \
  -H "Authorization: Bearer sk-litellm-key" \
  -F "video=@luna.mp4" \
  -F "name=Luna"

# Get character
curl -X GET "http://localhost:4000/v1/videos/characters/char_abc123def456" \
  -H "Authorization: Bearer sk-litellm-key"

# Edit video
curl -X POST "http://localhost:4000/v1/videos/edits" \
  -H "Authorization: Bearer sk-litellm-key" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {"id": "video_xyz789"},
    "prompt": "Add warm golden lighting and enhance colors"
  }'

# Extend video
curl -X POST "http://localhost:4000/v1/videos/extensions" \
  -H "Authorization: Bearer sk-litellm-key" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {"id": "video_xyz789"},
    "prompt": "Luna waves goodbye and walks into the sunset",
    "seconds": "5"
  }'
```

## 관리형 Character ID

LiteLLM은 provider 및 model metadata를 character ID에 자동으로 encode합니다.

**동작 방식:**
```
Upload character "Luna" with model "sora-2" on OpenAI
  ↓
LiteLLM creates: char_abc123def456 (contains provider + model_id)
  ↓
When you reference it later, LiteLLM decodes automatically
  ↓
Router knows exactly which deployment to use
```

**내부 동작:**
- Character ID 형식: `character_<base64_encoded_metadata>`
- Metadata 포함 항목: provider, model_id, original_character_id
- 사용자에게는 투명하게 처리됩니다. ID만 사용하면 LiteLLM이 routing을 처리합니다.
