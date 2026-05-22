# [DEPRECATED] Team 기반 Routing {#team-based-routing}

:::info

이 기능은 deprecated 상태입니다. 대신 [Tag Based Routing](./tag_routing.md)을 사용하세요.

:::


## Routing {#routing}
`team-id`를 기준으로 호출을 서로 다른 model group으로 route합니다.

### model group이 포함된 Config {#config-with-model-group}

2개의 model group과 연결된 postgres db를 포함하는 `config.yaml`을 생성합니다.

```yaml
model_list: 
  - model_name: gpt-3.5-turbo-eu # 👈 Model Group 1
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE_EU
      api_key: os.environ/AZURE_API_KEY_EU
      api_version: "2023-07-01-preview"
  - model_name: gpt-3.5-turbo-worldwide # 👈 Model Group 2
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"

general_settings: 
    master_key: sk-1234
    database_url: "postgresql://..." # 👈 Connect proxy to DB
```

프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

### Model Alias가 있는 Team 생성 {#create-team-with-model-alias}

```bash
curl --location 'http://0.0.0.0:4000/team/new' \
--header 'Authorization: Bearer sk-1234' \ # 👈 Master Key
--header 'Content-Type: application/json' \
--data '{
  "team_alias": "my-new-team_4",
  "model_aliases": {"gpt-3.5-turbo": "gpt-3.5-turbo-eu"}
}'

# Returns team_id: my-team-id
```

### Team Key 생성 {#create-team-key}

```bash 
curl --location 'http://localhost:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "team_id": "my-team-id",  # 👈 YOUR TEAM ID
}'
```

### alias로 Model 호출 {#call-model-with-alias}

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-A1L0C3Px2LJl53sF_kTF9A' \
--data '{
  "model": "gpt-3.5-turbo", # 👈 MODEL 
  "messages": [{"role": "system", "content": "You'\''re an expert at writing poems"}, {"role": "user", "content": "Write me a poem"}, {"role": "user", "content": "What'\''s your name?"}],
  "user": "usha"
}'
```
