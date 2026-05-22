# CodeLlama - 코드 채우기 {#codellama---code-infilling}

이 튜토리얼에서는 CodeLlama(Huggingface PRO Inference Endpoints에서 호스팅)를 호출해 코드를 채우는 방법을 보여줍니다.

이는 코드 모델에 특화된 작업입니다. 모델은 기존 접두사와 접미사에 가장 잘 맞는 코드(주석 포함)를 생성하도록 학습되었습니다.

이 작업은 **7B** 및 **13B** CodeLlama 모델의 base 및 instruction 변형에서 사용할 수 있습니다. 34B 모델이나 Python 버전에서는 사용할 수 없습니다.

# 사용법 {#usage}

```python 
import os
from litellm import longer_context_model_fallback_dict, ContextWindowExceededError, completion

os.environ["HUGGINGFACE_API_KEY"] = "your-hf-token" # https://huggingface.co/docs/hub/security-tokens

## CREATE THE PROMPT
prompt_prefix = 'def remove_non_ascii(s: str) -> str:\n    """ '
prompt_suffix = "\n    return result"

### set <pre> <suf> to indicate the string before and after the part you want codellama to fill 
prompt = f"<PRE> {prompt_prefix} <SUF>{prompt_suffix} <MID>"

messages = [{"content": prompt, "role": "user"}]
model = "huggingface/codellama/CodeLlama-34b-Instruct-hf" # specify huggingface as the provider 'huggingface/'
response = completion(model=model, messages=messages, max_tokens=500)
```

# 출력 {#output}
```python
def remove_non_ascii(s: str) -> str:
    """ Remove non-ASCII characters from a string.

    Args:
        s (str): The string to remove non-ASCII characters from.

    Returns:
        str: The string with non-ASCII characters removed.
    """
    result = ""
    for c in s:
        if ord(c) < 128:
            result += c
    return result
```
