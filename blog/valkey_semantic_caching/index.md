---
slug: valkey_semantic_caching
title: "Valkey 및 AWS ElastiCache에서 Semantic Caching 지원"
date: 2026-06-17T10:00:00
authors:
  - yassin
description: "LiteLLM은 이제 AWS ElastiCache for Valkey를 포함해 valkey-search module이 실행되는 Valkey cluster에서 semantic prompt caching을 지원합니다. RediSearch, Redis Stack, Qdrant는 필요하지 않습니다."
tags: [caching, valkey, elasticache, semantic cache]
hide_table_of_contents: false
---

LiteLLM은 이제 Valkey에서 semantic prompt caching을 지원합니다. AWS ElastiCache for Valkey를 포함해 [valkey-search](https://github.com/valkey-io/valkey-search) module이 있는 Valkey cluster를 운영 중이라면, `type: valkey-semantic`으로 LiteLLM을 연결해 Redis Stack이나 별도 vector database 없이 embedding 기반 cache hit를 사용할 수 있습니다.

{/* truncate */}

## 왜 중요한가요?

Semantic caching은 prompt의 정확한 문자열 일치가 아니라 의미를 기준으로 응답을 저장합니다. 그래서 사용자가 같은 요청을 다르게 표현해도 cache에 hit되어 유료 model call을 건너뛸 수 있습니다. 지금까지 LiteLLM의 semantic cache는 RediSearch의 `FT.*` vector API에 의존하는 RedisVL 기반이었습니다. RediSearch는 Redis OSS 또는 ElastiCache for Redis OSS에서 사용할 수 없어, team들은 semantic caching만을 위해 Redis Stack이나 Qdrant를 별도로 띄워야 했습니다. Redis가 source-available license로 이동하면서 더 많은 team이 Valkey를 선택하고 있으며, ElastiCache for Valkey는 흔한 managed target입니다.

Valkey는 valkey-search module을 통해 vector search를 제공하고, ElastiCache for Valkey도 이를 노출합니다. LiteLLM의 새 backend는 Redis protocol을 통해 valkey-search와 직접 통신하므로, ElastiCache for Valkey에서 semantic caching을 사용할 때 경로에 RediSearch, Redis Stack, Qdrant가 필요하지 않습니다.

## 동작 방식

`valkey-semantic` backend는 valkey-search가 지원하는 field type으로 자체 vector index를 만듭니다. 각 cache key의 scope를 분리하는 tag field와 prompt embedding용 HNSW vector field를 만들고, lookup 시 KNN query를 실행한 뒤 cosine similarity가 threshold를 넘으면 cached response를 반환합니다. Prompt 추출, embedding 생성, response 처리는 기존 Redis semantic cache와 공유하므로 per-request scope isolation을 포함해 Redis 경로와 같은 방식으로 동작합니다. 연결 정보는 `VALKEY_HOST`, `VALKEY_PORT`, `VALKEY_PASSWORD`에서 해석하고, 없으면 `REDIS_*` 대응 값으로 fallback합니다. IAM 또는 no-auth setup을 위한 passwordless cluster도 지원합니다.

## 시작하기

`config.yaml`에 cache를 추가합니다.

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: valkey-semantic
    host: os.environ/VALKEY_HOST
    port: os.environ/VALKEY_PORT
    valkey_semantic_cache_embedding_model: openai-embedding
    similarity_threshold: 0.8
```

전송 중 암호화가 켜진 ElastiCache에서는 host와 port 대신 `cache_params.redis_url`을 통해 `rediss://` URL을 전달합니다. 로컬에서 valkey-search를 테스트하려면 module이 포함된 bundled image를 사용할 수 있습니다.

```shell
docker run -d -p 6379:6379 valkey/valkey-bundle:8.1
```

SDK 사용법과 parameter reference를 포함한 전체 설정은 [caching docs](https://docs.litellm.ai/docs/proxy/caching)를 참고하세요.
