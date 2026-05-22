# Gemini - Lyria (음악 생성) {#gemini-lyria-music-generation}

Google Lyria 3 프리뷰 모델은 메타데이터 및 비용 추적을 위해 LiteLLM의 [모델 비용 맵](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에 `gemini/` 제공자 아래 등록되어 있습니다.

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `gemini/` |
| 모델 | `gemini/lyria-3-clip-preview`, `gemini/lyria-3-pro-preview` |
| 제공자 문서 | [Gemini API 가격 / 모델 ↗](https://ai.google.dev/gemini-api/docs/pricing) |

## 모델 {#models}

| 모델 | 참고 |
|-------|--------|
| `gemini/lyria-3-clip-preview` | 약 30초 클립. Google 가격표에서는 유료 티어가 생성된 곡당 요금으로 표시됩니다. |
| `gemini/lyria-3-pro-preview` | 전체 곡. Google 가격표에서는 유료 티어가 생성된 곡당 요금으로 표시됩니다. |

비용 맵의 입력 컨텍스트 한도: **131,072** 토큰. 모달리티, 한도, 기능은 [Google Gemini API 문서 ↗](https://ai.google.dev/gemini-api/docs/models)를 참고하세요.

## LiteLLM 동작 {#litellm-behavior}

- **비용 맵**: 곡당 유료 가격은 해당 항목의 `output_cost_per_image`에 저장됩니다(생성 단위당 고정 가격). 전용 경로가 생기기 전까지 토큰 기반 `completion` 비용은 음악 과금을 반영하지 않을 수 있습니다.
- **API 호출**: Google 문서에 설명된 대로 Gemini API를 사용하세요. LiteLLM은 Veo의 `video_generation` 같은 별도의 `music_generation` 헬퍼를 제공하지 않습니다.

## 인증 {#auth}

다른 Gemini API 모델과 동일합니다: `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`.
