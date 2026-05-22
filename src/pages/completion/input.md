# Completion 함수 - completion()
입력 매개변수는 
<a href="https://platform.openai.com/docs/api-reference/chat/create" target="_blank" rel="noopener noreferrer">OpenAI Create chat completion</a>와 **완전히 동일**하며, 같은 형식으로 **Azure OpenAI, Anthropic, Cohere, Replicate, OpenRouter, Novita AI** 모델을 호출할 수 있습니다. 

또한 liteLLM에서는 다음 **선택 사항** liteLLM 인수를 전달할 수 있습니다.
`force_timeout`, `azure`, `logger_fn`, `verbose`

## 입력 - 요청 본문
# 요청 본문

**필수 필드**

- `model`: *string* - 사용할 모델의 ID입니다. Chat API와 함께 사용할 수 있는 모델에 대한 자세한 내용은 모델 엔드포인트 호환성 표를 참조하세요.
  
- `messages`: *array* - 지금까지의 대화를 구성하는 메시지 목록입니다.

*참고* - 배열의 각 메시지는 다음 속성을 포함합니다.

    - `role`: *string* - 메시지 작성자의 역할입니다. 역할은 system, user, assistant 또는 function일 수 있습니다.
    
    - `content`: *string or null* - 메시지 내용입니다. 모든 메시지에 필요하지만, 함수 호출이 있는 assistant 메시지에서는 null일 수 있습니다.
    
    - `name`: *string (optional)* - 메시지 작성자의 이름입니다. role이 "function"인 경우 필수입니다. 이름은 content에 표시된 함수 이름과 일치해야 합니다. 문자(a-z, A-Z, 0-9)와 밑줄을 포함할 수 있으며, 최대 길이는 64자입니다.
    
    - `function_call`: *object (선택 사항)* - 모델이 생성한, 호출해야 하는 함수의 이름과 인수입니다.


**선택 필드**

- `functions`: *array* - 모델이 JSON 입력을 생성하는 데 사용할 수 있는 함수 목록입니다. 각 함수에는 다음 속성이 있어야 합니다.

    - `name`: *string* - 호출할 함수의 이름입니다. a-z, A-Z, 0-9, 밑줄 및 대시를 포함할 수 있으며, 최대 길이는 64자입니다.
    
    - `description`: *string (선택 사항)* - 함수가 수행하는 작업을 설명하는 설명입니다. 모델이 함수를 언제 어떻게 호출할지 결정하는 데 도움이 됩니다.
    
    - `parameters`: *object* - 함수가 허용하는 매개변수이며, JSON Schema 객체로 설명됩니다.
    
    - `function_call`: *string 또는 object (선택 사항)* - 모델이 함수 호출에 응답하는 방식을 제어합니다.

- `temperature`: *number 또는 null (선택 사항)* - 사용할 샘플링 temperature로, 0부터 2 사이의 값입니다. 0.8처럼 높은 값은 더 무작위적인 출력을 만들고, 0.2처럼 낮은 값은 더 집중적이고 결정적인 출력을 만듭니다. 

- `top_p`: *number 또는 null (선택 사항)* - temperature를 사용하는 샘플링의 대안입니다. 모델이 top_p 확률을 가진 토큰 결과를 고려하도록 지시합니다. 예를 들어 0.1은 상위 10% 확률 질량을 구성하는 토큰만 고려한다는 뜻입니다.

- `n`: *integer 또는 null (선택 사항)* - 각 입력 메시지에 대해 생성할 chat completion 선택지 수입니다.

- `stream`: *boolean 또는 null (선택 사항)* - true로 설정하면 부분 메시지 델타를 전송합니다. 토큰은 사용 가능해지는 즉시 전송되며, 스트림은 [DONE] 메시지로 종료됩니다.

- `stop`: *string/ array/ null (선택 사항)* - API가 추가 토큰 생성을 중지할 최대 4개의 시퀀스입니다.

- `max_tokens`: *integer (선택 사항)* - chat completion에서 생성할 최대 토큰 수입니다.

- `presence_penalty`: *number 또는 null (선택 사항)* - 지금까지의 텍스트에 존재하는지 여부를 기준으로 새 토큰에 패널티를 주는 데 사용됩니다.

- `frequency_penalty`: *number 또는 null (선택 사항)* - 지금까지의 텍스트에서의 빈도를 기준으로 새 토큰에 패널티를 주는 데 사용됩니다.

- `logit_bias`: *map (선택 사항)* - completion에 특정 토큰이 나타날 확률을 수정하는 데 사용됩니다.

- `user`: *string (선택 사항)* - 최종 사용자를 나타내는 고유 식별자입니다. OpenAI가 악용을 모니터링하고 감지하는 데 도움이 될 수 있습니다.
