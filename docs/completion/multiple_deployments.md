# 여러 배포

동일한 모델의 배포가 여러 개 있는 경우 배포 목록을 전달할 수 있으며, LiteLLM은 첫 번째 결과를 반환합니다.

## 빠른 시작

여러 공급자가 Mistral-7B-Instruct를 제공합니다.

litellm을 사용해 첫 번째 결과를 반환하는 방법은 다음과 같습니다.

```python
from litellm import completion

messages=[{"role": "user", "content": "Hey, how's it going?"}]

## All your mistral deployments ##
model_list = [{
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call 
        "model": "replicate/mistralai/mistral-7b-instruct-v0.1:83b6a56e7c828e667f21fd596c338fd4f0039b46bcfa18d973e8e70e455fda70", 
        "api_key": "replicate_api_key",
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call 
        "model": "together_ai/mistralai/Mistral-7B-Instruct-v0.1", 
        "api_key": "togetherai_api_key",
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call 
        "model": "together_ai/mistralai/Mistral-7B-Instruct-v0.1", 
        "api_key": "togetherai_api_key",
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call 
        "model": "perplexity/mistral-7b-instruct", 
		"api_key": "perplexity_api_key"
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": {
		"model": "deepinfra/mistralai/Mistral-7B-Instruct-v0.1",
		"api_key": "deepinfra_api_key"
	}
}]

## LiteLLM completion call ## returns first response 
response = completion(model="mistral-7b-instruct", messages=messages, model_list=model_list)

print(response)
```
