# LiteLLM Proxy로 Anthropic File API 사용하기 {#using-anthropic-file-api-with-litellm-proxy}

## 개요

이 튜토리얼에서는 LiteLLM Proxy를 통해 Anthropic의 Claude-4로 파일을 만들고 분석하는 방법을 보여줍니다.

## 사전 준비

- 실행 중인 LiteLLM Proxy
- Anthropic API 키

`.env` 파일에 다음을 추가하세요.
```
ANTHROPIC_API_KEY=sk-1234
```

## 사용법

### 1. `config.yaml` 설정 {#setup-configyaml}

```yaml
model_list:
  - model_name: claude-opus
    litellm_params:
      model: anthropic/claude-opus-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
```

## 2. 파일 만들기 {#create-a-file}

파일을 만들려면 `/anthropic` 패스스루 엔드포인트를 사용하세요.

```bash
curl -L -X POST 'http://0.0.0.0:4000/anthropic/v1/files' \
-H 'x-api-key: sk-1234' \
-H 'anthropic-version: 2023-06-01' \
-H 'anthropic-beta: files-api-2025-04-14' \
-F 'file=@"/path/to/your/file.csv"'
```

예상 응답:

```json
{
  "created_at": "2023-11-07T05:31:56Z",
  "downloadable": false,
  "filename": "file.csv",
  "id": "file-1234",
  "mime_type": "text/csv",
  "size_bytes": 1,
  "type": "file"
}
```


## 3. `/chat/completions`를 통해 Claude-4로 파일 분석하기 {#analyze-the-file-with-claude-4-via-chatcompletions}


```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_API_KEY' \
-d '{
    "model": "claude-opus",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this sheet?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": "file-1234",
                        "format": "text/csv" # 👈 IMPORTANT: This is the format of the file you want to analyze
                    }
                }
            ]
        }
    ]
}'
```
