# Completion 함수 - completion()
litellm `completion` 호출에서 기대할 수 있는 정확한 JSON 출력은 다음과 같습니다.

```python 
{'choices': [{'finish_reason': 'stop',
   'index': 0,
   'message': {'role': 'assistant',
    'content': " I'm doing well, thank you for asking. I am Claude, an AI assistant created by Anthropic."}}],
 'created': 1691429984.3852863,
 'model': 'claude-instant-1',
 'usage': {'prompt_tokens': 18, 'completion_tokens': 23, 'total_tokens': 41}}
```
