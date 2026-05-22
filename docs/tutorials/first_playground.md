# 첫 LLM playground 만들기 {#create-your-first-llm-playground}
import Image from '@theme/IdealImage';

**10분 이내에 여러 LLM Provider를 평가할 수 있는** playground를 만들어 봅니다. 실제 운영 예시를 보고 싶다면 [웹사이트](https://litellm.ai/)를 확인하세요.

**완성 모습**
<Image
  img={require('../../img/litellm_streamlit_playground.png')}
  alt="streamlit_playground"
  style={{ maxWidth: '75%', height: 'auto' }}
/>

**진행 방식**: <u>server</u>를 만들고 template frontend에 연결해, 마지막에는 동작하는 playground UI를 완성합니다.

:::info

 시작하기 전에 [environment-setup](./installation) guide를 완료했는지 확인하세요. 이 tutorial은 최소 1개 model provider(예: OpenAI)의 API key가 있다고 가정합니다.
:::

## 1. 빠른 시작 {#1-quick-start}

key가 정상 동작하는지 먼저 확인합니다. 원하는 환경(예: [Google Colab](https://colab.research.google.com/#create=true))에서 이 script를 실행하세요.

🚨 placeholder key value를 실제 key로 바꾸는 것을 잊지 마세요.

```python 
uv add litellm
```

```python
from litellm import completion

## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key" ## REPLACE THIS
os.environ["COHERE_API_KEY"] = "cohere key" ## REPLACE THIS
os.environ["AI21_API_KEY"] = "ai21 key" ## REPLACE THIS


messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(model="gpt-3.5-turbo", messages=messages)

# cohere call
response = completion("command-nightly", messages)

# ai21 call
response = completion("j2-mid", messages)
```

## 2. Server 설정 {#2-set-up-server}

backend server로 사용할 기본 Flask app을 만듭니다. completion call을 위한 전용 route를 추가합니다.

**참고**:
* 🚨 placeholder key value를 실제 key로 바꾸는 것을 잊지 마세요.
* `completion_with_retries`: 운영 환경에서는 LLM API call이 실패할 수 있습니다. 이 함수는 일반 litellm completion() call을 [tenacity](https://tenacity.readthedocs.io/en/latest/)로 감싸 실패 시 call을 retry합니다.

LiteLLM 전용 snippet:

```python 
import os
from litellm import completion_with_retries 

## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key" ## REPLACE THIS
os.environ["COHERE_API_KEY"] = "cohere key" ## REPLACE THIS
os.environ["AI21_API_KEY"] = "ai21 key" ## REPLACE THIS


@app.route('/chat/completions', methods=["POST"])
def api_completion():
    data = request.json
    data["max_tokens"] = 256 # By default let's set max_tokens to 256
    try:
        # COMPLETION CALL
        response = completion_with_retries(**data)
    except Exception as e:
        # print the error
        print(e)
    return response
```

전체 code:

```python 
import os
from flask import Flask, jsonify, request
from litellm import completion_with_retries 


## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key" ## REPLACE THIS
os.environ["COHERE_API_KEY"] = "cohere key" ## REPLACE THIS
os.environ["AI21_API_KEY"] = "ai21 key" ## REPLACE THIS

app = Flask(__name__)

# Example route
@app.route('/', methods=['GET'])
def hello():
    return jsonify(message="Hello, Flask!")

@app.route('/chat/completions', methods=["POST"])
def api_completion():
    data = request.json
    data["max_tokens"] = 256 # By default let's set max_tokens to 256
    try:
        # COMPLETION CALL
        response = completion_with_retries(**data)
    except Exception as e:
        # print the error
        print(e)

    return response

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=4000, threads=500)
```

### 테스트 {#lets-test-it}
server를 시작합니다.
```python 
python main.py
```

다음 curl command로 테스트합니다.
```curl
curl -X POST localhost:4000/chat/completions \
-H 'Content-Type: application/json' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [{
    "content": "Hello, how are you?",
    "role": "user"
  }]
}'
```

다음과 같은 결과가 표시됩니다.

<Image img={require('../../img/test_python_server_2.png')} alt="python_code_sample_2" />

## 3. Frontend template 연결 {#3-connect-to-our-frontend-template}

### 3.1 Template 다운로드 {#31-download-template}

frontend에는 [Streamlit](https://streamlit.io/)을 사용합니다. Streamlit을 사용하면 간단한 Python web-app을 만들 수 있습니다.

LiteLLM에서 만든 playground template를 다운로드합니다.

```zsh
git clone https://github.com/BerriAI/litellm_playground_fe_template.git
```

### 3.2 실행 {#32-run-it}

[2단계](#2-set-up-server)의 server가 여전히 port 4000에서 실행 중인지 확인하세요.

:::info

 다른 port를 사용했다면 playground template의 app.py에서 [이 줄](https://github.com/BerriAI/litellm_playground_fe_template/blob/411bea2b6a2e0b079eb0efd834886ad783b557ef/app.py#L7)을 바꾸면 됩니다.
:::

이제 app을 실행합니다.

```zsh
cd litellm_playground_fe_template && streamlit run app.py
```

Streamlit이 없다면 uv로 추가하세요. 또는 [설치 가이드](https://docs.streamlit.io/library/get-started/installation#install-streamlit-on-macoslinux)를 참고하세요.

```zsh
uv add streamlit
```

다음과 같은 화면이 표시됩니다.
<Image img={require('../../img/litellm_streamlit_playground.png')} alt="streamlit_playground" />


# 축하합니다 {#congratulations}

첫 LLM Playground를 만들었습니다. 이제 50개 이상의 LLM API를 호출할 수 있습니다.

다음 단계:
* [이제 추가할 수 있는 LLM Provider 전체 목록 확인](https://docs.litellm.ai/docs/providers)
