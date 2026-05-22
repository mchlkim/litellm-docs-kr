import Image from '@theme/IdealImage';

# Slack - LLM 입력/출력 및 예외 로깅 {#slack---logging-llm-inputoutput-exceptions}

<Image img={require('../../img/slack.png')} />

:::info
콜백을 더 좋게 만들 방법을 알고 싶습니다! LiteLLM [창립자](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)를 만나거나
저희 [Discord](https://discord.gg/wuPM9dRgDw)에 참여하세요.
::: 

## 사전 요구 사항 {#pre-requisites}

### 단계 1 {#step-1}
```shell
uv add litellm
```

### 단계 2 {#step-2}
https://api.slack.com/messaging/webhooks 에서 Slack webhook URL을 가져옵니다.



## 빠른 시작
### Slack에 로깅하는 사용자 지정 콜백 만들기 {#create-a-custom-callback-to-log-to-slack}
Slack webhook에 로깅하려면 사용자 지정 콜백을 만듭니다. [LiteLLM의 사용자 지정 콜백](https://docs.litellm.ai/docs/observability/custom_callback)을 참고하세요.
```python
def send_slack_alert(
        kwargs,
        completion_response,
        start_time,
        end_time,
):
    print(
        "in custom slack callback func"
    )
    import requests
    import json

    # Define the Slack webhook URL
    # get it from https://api.slack.com/messaging/webhooks
    slack_webhook_url = os.environ['SLACK_WEBHOOK_URL']   # "https://hooks.slack.com/services/<>/<>/<>"

    # Remove api_key from kwargs under litellm_params
    if kwargs.get('litellm_params'):
        kwargs['litellm_params'].pop('api_key', None)
        if kwargs['litellm_params'].get('metadata'):
            kwargs['litellm_params']['metadata'].pop('deployment', None)
    # Remove deployment under metadata
    if kwargs.get('metadata'):
        kwargs['metadata'].pop('deployment', None)
    # Prevent api_key from being logged
    if kwargs.get('api_key'):
        kwargs.pop('api_key', None)

    # Define the text payload, send data available in litellm custom_callbacks
    text_payload = f"""LiteLLM Logging: kwargs: {str(kwargs)}\n\n, response: {str(completion_response)}\n\n, start time{str(start_time)} end time: {str(end_time)}
    """
    payload = {
        "text": text_payload
    }

    # Set the headers
    headers = {
        "Content-type": "application/json"
    }

    # Make the POST request
    response = requests.post(slack_webhook_url, json=payload, headers=headers)

    # Check the response status
    if response.status_code == 200:
        print("Message sent successfully to Slack!")
    else:
        print(f"Failed to send message to Slack. Status code: {response.status_code}")
        print(response.json())
```

### LiteLLM에 콜백 전달하기 {#pass-callback-to-litellm}
```python
litellm.success_callback = [send_slack_alert]
```

```python
import litellm
litellm.success_callback = [send_slack_alert] # log success
litellm.failure_callback = [send_slack_alert] # log exceptions

# this will raise an exception
response = litellm.completion(
    model="gpt-2",
    messages=[
        {
            "role": "user",
            "content": "Hi 👋 - i'm openai"
        }
    ]
)
```
## 지원 및 창립자와 대화하기 {#support--talk-to-founders}

- [데모 일정 잡기 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
