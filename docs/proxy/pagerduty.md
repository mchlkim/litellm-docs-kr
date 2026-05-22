import Image from '@theme/IdealImage';

# PagerDuty 알림 {#pagerduty-alerting}

:::info

✨ PagerDuty 알림은 LiteLLM 엔터프라이즈에서 사용할 수 있습니다

[엔터프라이즈 요금](https://www.litellm.ai/#pricing)

[무료 7일 체험 키 받기](https://www.litellm.ai/enterprise#trial)

:::

두 가지 유형의 알림을 처리합니다.
- 높은 LLM API 실패율. Y초 안에 X번 실패하면 알림이 트리거되도록 설정합니다.
- 많은 수의 지연 중인 LLM 요청. Y초 안에 X번 지연되면 알림이 트리거되도록 설정합니다.


## 빠른 시작

1. 환경 변수에 `PAGERDUTY_API_KEY="d8bxxxxx"`를 설정합니다.

```
PAGERDUTY_API_KEY="d8bxxxxx"
```

2. 설정 파일에서 PagerDuty 알림을 설정합니다.

```yaml
model_list:
  - model_name: "openai/*"
    litellm_params:
      model: "openai/*"
      api_key: os.environ/OPENAI_API_KEY

general_settings: 
  alerting: ["pagerduty"]
  alerting_args:
    failure_threshold: 1  # Number of requests failing in a window
    failure_threshold_window_seconds: 10  # Window in seconds

    # Requests hanging threshold
    hanging_threshold_seconds: 0.0000001  # Number of seconds of waiting for a response before a request is considered hanging
    hanging_threshold_window_seconds: 10  # Window in seconds
```


3. 테스트합니다


LiteLLM Proxy를 시작합니다

```shell
litellm --config config.yaml
```

### LLM API 실패 알림 {#llm-api-failure-alert}
프록시에 잘못된 요청을 보내봅니다

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data ' {
      "model": "gpt-4o",
      "user": "hi",
      "messages": [
        {
          "role": "user",
          "bad_param": "i like coffee"
        }
      ]
    }
'
```

<Image img={require('../../img/pagerduty_fail.png')} />

### LLM 지연 알림 {#llm-hanging-alert}

프록시에 지연되는 요청을 보내봅니다

지연 임계값이 0.0000001초이므로 알림이 표시됩니다.

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data ' {
      "model": "gpt-4o",
      "user": "hi",
      "messages": [
        {
          "role": "user",
          "content": "i like coffee"
        }
      ]
    }
'
```

<Image img={require('../../img/pagerduty_hanging.png')} />

