import Image from '@theme/IdealImage';

# OpenAI 호환 서버에서 프롬프트 템플릿 사용자 지정 {#customize-prompt-templates-on-openai-compatible-server}

**배울 내용:** OpenAI 호환 서버에서 사용자 지정 프롬프트 템플릿을 설정하는 방법입니다. 
**방법:** CodeLlama용 프롬프트 템플릿을 수정합니다.

## 1단계: OpenAI 호환 서버 시작 {#step-1-start-openai-compatible-server}
Huggingface의 [Text-Generation-Inference (TGI)](https://github.com/huggingface/text-generation-inference) 형식을 사용해 배포된 `codellama/CodeLlama-34b-Instruct-hf` 모델을 호출할 수 있도록 로컬 OpenAI 호환 서버를 실행합니다.

```shell
$ litellm --model huggingface/codellama/CodeLlama-34b-Instruct-hf --api_base https://my-endpoint.com

# OpenAI compatible server running on http://0.0.0.0/8000
```

새 shell에서 다음을 실행합니다. 
```shell
$ litellm --test
``` 
그러면 엔드포인트로 테스트 요청이 전송됩니다. 

이제 Huggingface로 무엇이 전송되었는지 확인합니다. 다음을 실행합니다. 
```shell
$ litellm --logs
```
가장 최근 로그가 반환됩니다. 기본적으로 로그는 `api_logs.json`이라는 로컬 파일에 저장됩니다.

보시다시피 Huggingface로 전송된 형식은 다음과 같습니다. 

<Image img={require('../../img/codellama_input.png')} />  


이는 [Huggingface 문서](https://huggingface.co/blog/codellama#conversational-instructions)를 기반으로 한 CodeLlama용 [LiteLLM 형식](https://github.com/BerriAI/litellm/blob/9932371f883c55fd0f3142f91d9c40279e8fe241/litellm/llms/prompt_templates/factory.py#L10)을 따릅니다. 

하지만 여기에는 BOS(`<s>`) 및 EOS(`</s>`) 토큰이 없습니다.

따라서 LiteLLM 기본값 대신 자체 프롬프트 템플릿을 사용해 메시지에 해당 토큰을 포함해 보겠습니다. 

## 2단계: 사용자 지정 프롬프트 템플릿 생성 {#step-2-create-custom-prompt-template}

LiteLLM 서버는 config 파일의 일부로 프롬프트 템플릿을 받습니다. 이 config에는 api keys, fallback models, prompt templates 등을 저장할 수 있습니다. [전체 config 파일 보기](../proxy_server.md)

지금은 프롬프트 템플릿을 포함한 간단한 config 파일을 만들고 서버에 알려 주겠습니다. 

`litellm_config.toml` 파일을 생성합니다.

```shell
$ touch litellm_config.toml
```
추가할 내용은 다음과 같습니다.
* 모든 System 및 Human 메시지 시작 부분에 BOS (`<s>`) 토큰
* 모든 assistant 메시지 끝부분에 EOS (`</s>`) 토큰

터미널에서 파일을 엽니다. 
```shell
$ vi litellm_config.toml
```

프롬프트 템플릿을 붙여 넣습니다.
```shell
[model."huggingface/codellama/CodeLlama-34b-Instruct-hf".prompt_template] 
MODEL_SYSTEM_MESSAGE_START_TOKEN = "<s>[INST]  <<SYS>>\n]" 
MODEL_SYSTEM_MESSAGE_END_TOKEN = "\n<</SYS>>\n [/INST]\n"

MODEL_USER_MESSAGE_START_TOKEN = "<s>[INST] " 
MODEL_USER_MESSAGE_END_TOKEN = " [/INST]\n"

MODEL_ASSISTANT_MESSAGE_START_TOKEN = ""
MODEL_ASSISTANT_MESSAGE_END_TOKEN = "</s>"
```

파일을 저장합니다(vim 기준). 
```shell
:wq
```

## 3단계: 새 템플릿 실행 {#step-3-run-new-template}

다음을 실행해 사용자 지정 템플릿을 LiteLLM 서버에 저장합니다.
```shell
$ litellm --config -f ./litellm_config.toml 
```
LiteLLM은 이 파일의 사본을 package 안에 저장하므로, 재시작 후에도 설정을 유지할 수 있습니다.

서버를 다시 시작합니다. 
```shell
$ litellm --model huggingface/codellama/CodeLlama-34b-Instruct-hf --api_base https://my-endpoint.com
```

새 shell에서 다음을 실행합니다. 
```shell
$ litellm --test
``` 

Huggingface로 전달되는 새 입력 프롬프트를 확인합니다. 

<Image img={require('../../img/codellama_formatted_input.png')} /> 

완료되었습니다.
