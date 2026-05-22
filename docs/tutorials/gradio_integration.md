# Gradio 챗봇 + LiteLLM 튜토리얼 {#gradio-chatbot--litellm-tutorial}
스트리밍 Gradio 챗봇 데모에 LiteLLM completion 호출을 통합하는 간단한 튜토리얼입니다.

### 종속성 설치 및 가져오기 {#install--import-dependencies}
```python
!uv add gradio litellm
import gradio
import litellm
```

### 추론 함수 정의 {#define-inference-function}
LLM을 호스팅하는 서버에서 요구하는 값에 맞게 `model`과 `api_base`를 설정해야 합니다.
```python
def inference(message, history):
    try:
        flattened_history = [item for sublist in history for item in sublist]
        full_message = " ".join(flattened_history + [message])
        messages_litellm = [{"role": "user", "content": full_message}] # litellm message format
        partial_message = ""
        for chunk in litellm.completion(model="huggingface/meta-llama/Llama-2-7b-chat-hf",
                                        api_base="x.x.x.x:xxxx",
                                        messages=messages_litellm,
                                        max_new_tokens=512,
                                        temperature=.7,
                                        top_k=100,
                                        top_p=.9,
                                        repetition_penalty=1.18,
                                        stream=True):
            partial_message += chunk['choices'][0]['delta']['content'] # extract text from streamed litellm chunks
            yield partial_message
    except Exception as e:
        print("Exception encountered:", str(e))
        yield f"An Error occurred please 'Clear' the error and try your question again"
```

### 채팅 인터페이스 정의 {#define-chat-interface}
```python
gr.ChatInterface(
    inference,
    chatbot=gr.Chatbot(height=400),
    textbox=gr.Textbox(placeholder="Enter text here...", container=False, scale=5),
    description=f"""
    CURRENT PROMPT TEMPLATE: {model_name}.
    An incorrect prompt template will cause performance to suffer.
    Check the API specifications to ensure this format matches the target LLM.""",
    title="Simple Chatbot Test Application",
    examples=["Define 'deep learning' in once sentence."],
    retry_btn="Retry",
    undo_btn="Undo",
    clear_btn="Clear",
    theme=theme,
).queue().launch()
```
### Gradio 앱 실행 {#launch-gradio-app}
1. 명령줄에서 `python app.py` 또는 `gradio app.py`를 실행합니다. 후자는 실시간 배포 업데이트를 활성화합니다.
2. 브라우저에서 제공된 하이퍼링크로 이동합니다.
3. 원격 LLM 서버와 프롬프트에 종속되지 않는 방식으로 상호작용합니다.

### 권장 확장 {#recommended-extensions}
* 대상 모델 및 추론 엔드포인트를 정의할 수 있도록 명령줄 인수를 추가합니다.

이 튜토리얼은 [ZQ](https://x.com/ZQ_Dev)에게 크레딧을 돌립니다.
