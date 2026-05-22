# AWS Polly 텍스트 음성 변환(tts) {#aws-polly-text-to-speech-tts}

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | AWS Polly의 neural 및 standard TTS 엔진을 사용해 텍스트를 자연스러운 음성으로 변환합니다 |
| LiteLLM의 Provider Route | `aws_polly/` |
| 지원 작업 | `/audio/speech` |
| Provider 문서 링크 | [AWS Polly SynthesizeSpeech ↗](https://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html) |

## 빠른 시작

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
import litellm
from pathlib import Path
import os

# Set environment variables
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-east-1"

# AWS Polly call
speech_file_path = Path(__file__).parent / "speech.mp3"
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="the quick brown fox jumped over the lazy dogs",
)
response.stream_to_file(speech_file_path)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-neural
    litellm_params:
      model: aws_polly/neural
      aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID"
      aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY"
      aws_region_name: "us-east-1"
```

## Polly 엔진 {#polly-engines}

AWS Polly는 여러 음성 합성 엔진을 지원합니다. 모델 이름에 엔진을 지정하세요.

| 모델 | 엔진 | 비용(100만 자당) | 설명 |
|-------|--------|---------------------|-------------|
| `aws_polly/standard` | Standard | $4.00 | 기존 Polly 음성으로, 더 빠르고 비용이 가장 낮습니다 |
| `aws_polly/neural` | Neural | $16.00 | 더 자연스럽고 사람 같은 음성입니다(권장) |
| `aws_polly/generative` | Generative | $30.00 | 표현력이 가장 높고 품질이 가장 좋습니다(지원 음성 제한) |
| `aws_polly/long-form` | Long-form | $100.00 | 기사처럼 긴 콘텐츠에 최적화되어 있습니다 |

### **LiteLLM SDK**

```python showLineNumbers title="Using Different Engines"
import litellm

# Neural engine (recommended)
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello world",
)

# Standard engine (lower cost)
response = litellm.speech(
    model="aws_polly/standard",
    voice="Joanna",
    input="Hello world",
)

# Generative engine (highest quality)
response = litellm.speech(
    model="aws_polly/generative",
    voice="Matthew",
    input="Hello world",
)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-neural
    litellm_params:
      model: aws_polly/neural
      aws_region_name: "us-east-1"
  - model_name: polly-standard
    litellm_params:
      model: aws_polly/standard
      aws_region_name: "us-east-1"
  - model_name: polly-generative
    litellm_params:
      model: aws_polly/generative
      aws_region_name: "us-east-1"
```

## 사용 가능한 음성 {#available-voices}

### 네이티브 Polly 음성 {#native-polly-voices}

AWS Polly는 여러 언어의 다양한 음성을 제공합니다. 다음은 자주 사용하는 미국 영어 음성입니다.

| 음성 | 성별 | 엔진 지원 |
|-------|--------|----------------|
| `Joanna` | 여성 | Neural, Standard |
| `Matthew` | 남성 | Neural, Standard, Generative |
| `Ivy` | 여성(아동) | Neural, Standard |
| `Kendra` | 여성 | Neural, Standard |
| `Amy` | 여성(영국식) | Neural, Standard |
| `Brian` | 남성(영국식) | Neural, Standard |

### **LiteLLM SDK**

```python showLineNumbers title="Using Native Polly Voices"
import litellm

# US English female
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello from Joanna",
)

# US English male
response = litellm.speech(
    model="aws_polly/neural",
    voice="Matthew",
    input="Hello from Matthew",
)

# British English female
response = litellm.speech(
    model="aws_polly/neural",
    voice="Amy",
    input="Hello from Amy",
)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-joanna
    litellm_params:
      model: aws_polly/neural
      voice: "Joanna"
      aws_region_name: "us-east-1"
  - model_name: polly-matthew
    litellm_params:
      model: aws_polly/neural
      voice: "Matthew"
      aws_region_name: "us-east-1"
```

### OpenAI 음성 매핑 {#openai-voice-mappings}

LiteLLM은 OpenAI 음성 이름도 지원하며, 해당 이름은 Polly 음성으로 자동 매핑됩니다.

| OpenAI 음성 | 매핑되는 Polly 음성 |
|--------------|---------------------|
| `alloy` | Joanna |
| `echo` | Matthew |
| `fable` | Amy |
| `onyx` | Brian |
| `nova` | Ivy |
| `shimmer` | Kendra |

### **LiteLLM SDK**

```python showLineNumbers title="Using OpenAI Voice Names"
import litellm

# These are equivalent
response = litellm.speech(
    model="aws_polly/neural",
    voice="alloy",  # Maps to Joanna
    input="Hello world",
)

response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",  # Native Polly voice
    input="Hello world",
)
```

## SSML 지원 {#ssml-support}

AWS Polly는 음성 출력의 세부 제어를 위해 SSML(Speech Synthesis Markup Language)을 지원합니다. LiteLLM은 SSML 입력을 자동으로 감지합니다.

### **LiteLLM SDK**

```python showLineNumbers title="SSML Example"
import litellm

ssml_input = """
<speak>
    Hello, <break time="500ms"/> 
    this is a test with <emphasis level="strong">emphasis</emphasis> 
    and <prosody rate="slow">slower speech</prosody>.
</speak>
"""

response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input=ssml_input,
)
```

### **LiteLLM PROXY**

```bash showLineNumbers title="cURL Request with SSML"
curl -X POST http://localhost:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "polly-neural",
    "voice": "Joanna",
    "input": "<speak>Hello <break time=\"500ms\"/> world</speak>"
  }' \
  --output speech.mp3
```

## 지원 파라미터

```python showLineNumbers title="All Parameters"
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",                    # Required: Voice selection
    input="text to convert",           # Required: Input text (or SSML)
    response_format="mp3",             # Optional: mp3, ogg_vorbis, pcm
    
    # AWS-specific parameters
    language_code="en-US",             # Optional: Language code
    sample_rate="22050",               # Optional: Sample rate in Hz
)
```

## 응답 형식 {#response-formats}

| 형식 | 설명 |
|--------|-------------|
| `mp3` | MP3 오디오(기본값) |
| `ogg_vorbis` | Ogg Vorbis 오디오 |
| `pcm` | 원시 PCM 오디오 |

### **LiteLLM SDK**

```python showLineNumbers title="Different Response Formats"
import litellm

# MP3 (default)
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    response_format="mp3",
)

# Ogg Vorbis
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    response_format="ogg_vorbis",
)
```

## AWS 인증

LiteLLM은 여러 AWS 인증 방식을 지원합니다.

### **LiteLLM SDK**

```python showLineNumbers title="Authentication Options"
import litellm
import os

# Option 1: Environment variables (recommended)
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = litellm.speech(model="aws_polly/neural", voice="Joanna", input="Hello")

# Option 2: Pass credentials directly
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_access_key_id="your-access-key",
    aws_secret_access_key="your-secret-key",
    aws_region_name="us-east-1",
)

# Option 3: IAM Role (when running on AWS)
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_region_name="us-east-1",
)

# Option 4: AWS Profile
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_profile_name="my-profile",
)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  # Using environment variables
  - model_name: polly-neural
    litellm_params:
      model: aws_polly/neural
      aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID"
      aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY"
      aws_region_name: "us-east-1"
  
  # Using IAM Role (when proxy runs on AWS)
  - model_name: polly-neural-iam
    litellm_params:
      model: aws_polly/neural
      aws_region_name: "us-east-1"
  
  # Using AWS Profile
  - model_name: polly-neural-profile
    litellm_params:
      model: aws_polly/neural
      aws_profile_name: "my-profile"
```

## 비동기 지원 {#async-support}

```python showLineNumbers title="Async Usage"
import litellm
import asyncio

async def main():
    response = await litellm.aspeech(
        model="aws_polly/neural",
        voice="Joanna",
        input="Hello from async AWS Polly",
        aws_region_name="us-east-1",
    )
    
    with open("output.mp3", "wb") as f:
        f.write(response.content)

asyncio.run(main())
```
