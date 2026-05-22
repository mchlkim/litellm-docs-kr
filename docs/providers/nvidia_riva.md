import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nvidia Riva (음성 텍스트 변환)

LiteLLM은 `/audio/transcriptions`를 통해 NVIDIA Riva 음성 텍스트 변환을 지원합니다. **NVCF 호스팅** Riva 엔드포인트(예: `build.nvidia.com`의 Parakeet)와 **셀프 호스팅** Riva 배포 모두에서 작동합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Riva는 NVIDIA의 GPU 가속 음성 AI입니다. LiteLLM은 gRPC를 통해 오디오를 Riva로 스트리밍하고 OpenAI 호환 전사 결과를 반환합니다. |
| LiteLLM의 공급자 라우트 | `nvidia_riva/` |
| 공급자 문서 | [Riva ASR 문서 ↗](https://docs.nvidia.com/deeplearning/riva/user-guide/docs/asr/asr-overview.html) |
| 전송 방식 | gRPC(HTTP 아님) |
| 지원되는 OpenAI 엔드포인트 | `/audio/transcriptions` |

:::info 선택적 설치

`nvidia_riva`에는 gRPC 클라이언트와 오디오 디코딩 라이브러리가 필요합니다. 다음 명령으로 설치하세요.

```bash
pip install 'litellm[stt-nvidia-riva]'
```

이 명령은 `nvidia-riva-client`, `soundfile`, `audioread`, `numpy`를 함께 설치합니다. 이 패키지들은 지연 로드되므로, 설치되어 있지 않아도 LiteLLM의 나머지 기능은 계속 작동합니다.

:::

## 빠른 시작

```python
from litellm import transcription
import os

os.environ["NVIDIA_RIVA_API_KEY"] = "nvapi-..."   # your nvapi key

audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(
    model="nvidia_riva/nvidia/parakeet-ctc-1_1b-asr",
    file=audio_file,
    api_base="grpc.nvcf.nvidia.com:443",
    nvcf_function_id="1598d209-5e27-4d3c-8079-4751568b1081",  # NVCF function id
)

print(response.text)
```

LiteLLM은 스트리밍 전에 오디오를 16 kHz 모노 LINEAR_PCM(Riva가 요구하는 전송 형식)으로 리샘플링하므로 mp3 / wav / flac / ogg를 바로 보낼 수 있습니다. 별도 전처리는 필요하지 않습니다.

## 배포 모드

Riva는 서로 매우 다른 두 가지 형태로 실행됩니다. LiteLLM은 `nvcf_function_id` 존재 여부를 기준으로 `use_ssl` 기본값을 정하지만, 언제든 직접 재정의할 수 있습니다.

### NVCF(NVIDIA 호스팅)

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: grpc.nvcf.nvidia.com:443
      api_key: os.environ/NVIDIA_RIVA_API_KEY     # nvapi-...
      nvcf_function_id: 1598d209-5e27-4d3c-8079-4751568b1081
```

`nvcf_function_id`가 설정되면 LiteLLM은 다음을 수행합니다.
- TLS를 활성화합니다(`use_ssl=True`).
- `function-id` gRPC 메타데이터를 첨부합니다.
- `authorization: Bearer <api_key>`를 첨부합니다.

### 셀프 호스팅(TLS 없음)

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: localhost:50051
```

### TLS ingress 뒤의 셀프 호스팅

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: riva.internal.company.com:443
      use_ssl: true
```

## LiteLLM Proxy 사용법

### 1. 구성에 모델 추가

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: grpc.nvcf.nvidia.com:443
      api_key: os.environ/NVIDIA_RIVA_API_KEY
      nvcf_function_id: 1598d209-5e27-4d3c-8079-4751568b1081
    model_info:
      mode: audio_transcription

general_settings:
  master_key: sk-1234
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 요청 보내기

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
  --header 'Authorization: Bearer sk-1234' \
  --form 'file=@"/path/to/speech.mp3"' \
  --form 'model="parakeet-asr"'
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000",
)

audio_file = open("speech.mp3", "rb")
transcript = client.audio.transcriptions.create(
    model="parakeet-asr",
    file=audio_file,
)
print(transcript.text)
```

</TabItem>
</Tabs>

## 지원되는 매개변수

Riva에 명확하게 매핑되는 OpenAI 매개변수:

| OpenAI 매개변수 | 동작 |
|---|---|
| `language` | Riva `language_code`에 매핑됩니다. `en` 같은 단순 코드는 `en-US`로 정규화됩니다. `de-DE` 같은 BCP-47 코드는 그대로 전달됩니다. |
| `response_format` | `json`(기본값)은 `{ "text": "..." }`를 반환합니다. `verbose_json`은 `duration`과 `words`(초 단위 타임스탬프)를 추가합니다. |
| `timestamp_granularities` | 단어 수준 타임스탬프를 활성화하려면 `["word"]`를 전달하세요. |

`litellm_params`에 설정하거나 `transcription(...)`에 직접 전달할 수 있는 Riva 전용 매개변수:

| 매개변수 | 기본값 | 목적 |
|---|---|---|
| `nvcf_function_id` | 미설정 | NVCF function id입니다. 설정하면 기본값으로 `use_ssl=True`가 적용되고 NVCF 메타데이터가 첨부됩니다. |
| `use_ssl` | `nvcf_function_id`가 설정되어 있으면 `True`, 아니면 `False` | TLS 사용 여부를 강제합니다. TLS ingress 뒤의 셀프 호스팅 Riva에 유용합니다. |
| `riva_model_name` | `""`(자동 선택) | 내부 Riva 모델 이름을 재정의합니다. 비워 두면 Riva가 `language_code` + `sample_rate_hertz`를 기준으로 선택합니다. 정확히 원하는 모델을 알고 있는 경우가 아니라면 권장됩니다. |
| `enable_automatic_punctuation` | `True` | 표준 Riva 플래그입니다. |
| `endpointing_config` | 미설정 | Riva의 `EndpointingConfig`(`start_threshold`, `stop_threshold`, `stop_history`, `stop_history_eou`, ...)와 같은 구조의 dict를 전달합니다. |
| `chunking_strategy` | 미설정 | OpenAI 스타일 VAD 구성(`{"type": "server_vad", "threshold": 0.5, "silence_duration_ms": 700, "prefix_padding_ms": 250}`)입니다. LiteLLM이 이를 Riva의 `EndpointingConfig`로 변환합니다. |

### `riva_model_name`이 기본적으로 비어 있는 이유

`parakeet-1.1b-en-US-asr-streaming-silero-vad-sortformer` 같은 내부 Riva 배포 이름은 NVIDIA의 배포 식별자입니다. 이러한 이름은 NIM 버전, 리전, 셀프 호스팅 빌드에 따라 달라집니다. `RecognitionConfig`에서 `model=""`로 두면 Riva가 `language_code`와 `sample_rate_hertz`를 기준으로 적절한 모델을 자동 선택하며, 대부분의 경우 이 동작이 적합합니다. 고정해야 하는 특정 배포 모델이 있을 때만 `riva_model_name`을 설정하세요.

## 오디오 형식

LiteLLM은 수신 오디오를 `soundfile`(wav / flac / ogg)로 디코딩하고, `mp3` / `m4a` / `mp4` / `webm`에는 `audioread`를 폴백으로 사용합니다. 그런 다음 Riva로 스트리밍하기 전에 오디오를 16 kHz 모노 LINEAR_PCM으로 리샘플링합니다.

디코딩에 실패하면(예: 특수 코덱, DRM 또는 `audioread` 미설치) LiteLLM은 업스트림에서 변환하라는 명확한 오류를 발생시킵니다.

```bash
ffmpeg -i input.mp3 -ac 1 -ar 16000 -sample_fmt s16 output.wav
```

## 환경 변수

| 변수 | 목적 |
|---|---|
| `NVIDIA_RIVA_API_KEY` | `authorization: Bearer ...`로 전송되는 API 키입니다. NVCF는 `nvapi-...`를 기대합니다. |
| `NVIDIA_RIVA_API_BASE` | gRPC 엔드포인트의 기본 `host:port`입니다. `litellm_params`에서 `api_base`를 설정하는 것과 같은 효과입니다. |
| `NVIDIA_NIM_API_KEY` | 대부분의 사용자가 NVCF 서비스 전반에서 동일한 `nvapi-...` 키를 재사용하므로 `NVIDIA_RIVA_API_KEY`의 폴백으로 사용됩니다. |

## 참고 및 제한 사항

- 전송 방식은 gRPC 스트리밍입니다. 현재 NVCF는 스트리밍 ASR만 지원하므로 짧은 파일도 스트림으로 전송됩니다.
- 화자 분리(`diarization_config`)와 `srt` / `vtt` 응답 형식은 아직 연결되어 있지 않습니다. 필요하면 이슈를 열어 주세요.
- 비용 계산: Riva는 토큰 사용량을 반환하지 않습니다. LiteLLM은 외부에서 비용을 산출할 수 있도록 오디오 길이를 `_hidden_params["audio_transcription_duration"]`에 저장합니다.
