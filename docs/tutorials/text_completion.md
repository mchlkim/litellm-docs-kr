# Text Completion 형식 사용 - Completion()과 함께 {#using-text-completion-format-with-completion}

OpenAI Text Completion 형식으로 연동하려는 경우, 이 tutorial은 해당 형식으로 LiteLLM을 사용하는 방법을 설명합니다.
```python
response = openai.Completion.create(
    model="text-davinci-003",
    prompt='Write a tagline for a traditional bavarian tavern',
    temperature=0,
    max_tokens=100)
```

## Text Completion 형식에서 LiteLLM 사용 {#using-litellm-in-the-text-completion-format}
### gpt-3.5-turbo 사용 {#with-gpt-35-turbo}
```python
from litellm import text_completion
response = text_completion(
    model="gpt-3.5-turbo",
    prompt='Write a tagline for a traditional bavarian tavern',
    temperature=0,
    max_tokens=100)
```

### text-davinci-003 사용 {#with-text-davinci-003}
```python
response = text_completion(
    model="text-davinci-003",
    prompt='Write a tagline for a traditional bavarian tavern',
    temperature=0,
    max_tokens=100)
```

### llama2 사용 {#with-llama2}
```python
response = text_completion(
    model="togethercomputer/llama-2-70b-chat",
    prompt='Write a tagline for a traditional bavarian tavern',
    temperature=0,
    max_tokens=100)
```
