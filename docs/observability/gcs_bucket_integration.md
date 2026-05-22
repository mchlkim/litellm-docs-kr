import Image from '@theme/IdealImage';

# Google Cloud Storage 버킷 {#google-cloud-storage-buckets}

LLM 로그를 [Google Cloud Storage 버킷](https://cloud.google.com/storage?hl=en)에 기록합니다.

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [여기에서 엔터프라이즈를 시작하세요](https://enterprise.litellm.ai/demo).

:::


### 사용법

1. LiteLLM Config.yaml에 `gcs_bucket`을 추가합니다.
```yaml
model_list:
- litellm_params:
    api_base: https://openai-function-calling-workers.tasslexyz.workers.dev/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  callbacks: ["gcs_bucket"] # 👈 KEY CHANGE # 👈 KEY CHANGE
```

2. 필수 env 변수를 설정합니다.

```shell
GCS_BUCKET_NAME="<your-gcs-bucket-name>"
GCS_PATH_SERVICE_ACCOUNT="/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json" # Add path to service account.json
```

3. Proxy를 시작합니다.

```
litellm --config /path/to/config.yaml
```

4. 테스트합니다.

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```


## GCS 버킷의 예상 로그 {#expected-로그-on-gcs-buckets}

<Image img={require('../../img/gcs_bucket.png')} />

### GCS 버킷에 기록되는 필드 {#fields-logged-on-gcs-buckets}

[**표준 로깅 객체가 GCS 버킷에 기록됩니다**](../proxy/logging)


## Google Cloud Console에서 `service_account.json` 가져오기 {#getting-service_accountjson-from-google-cloud-console}

1. [Google Cloud Console](https://console.cloud.google.com/)로 이동합니다.
2. IAM & Admin을 검색합니다.
3. Service Accounts를 클릭합니다.
4. Service Account를 선택합니다.
5. 'Keys' -> Add Key -> Create New Key -> JSON을 클릭합니다.
6. JSON 파일을 저장하고 경로를 `GCS_PATH_SERVICE_ACCOUNT`에 추가합니다.

## 지원 및 창업자와 대화하기 {#support--talk-to-founders}

- [데모 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
