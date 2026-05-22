# Master Key 교체 {#rotating-master-key}

master key를 교체할 때 권장하는 절차는 다음과 같습니다.


**1. DB 백업**
암호화/복호화 과정에서 오류가 발생할 경우, 문제 없이 현재 상태로 되돌릴 수 있도록 DB를 먼저 백업하세요.

**2. 새 master key로 `/key/regenerate` 호출**

```bash
curl -L -X POST 'http://localhost:4000/key/regenerate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
  "key": "sk-1234",
  "new_master_key": "sk-PIp1h0RekR"
}'
```

이 작업은 `Proxy_ModelTable`의 모든 모델을 새 master key로 다시 암호화합니다.

기존 master key로는 새 값을 더 이상 복호화할 수 없으므로, 로그에 복호화 오류가 나타나기 시작할 수 있습니다.

```bash
   raise Exception("Unable to decrypt value={}".format(v))
Exception: Unable to decrypt value=<new-encrypted-value>
```

**3. `LITELLM_MASTER_KEY` 업데이트**

environment variable에서 `LITELLM_MASTER_KEY` 값을 2단계의 `new_master_key`로 업데이트합니다.

이렇게 하면 DB에서 값을 복호화할 때 새 key가 사용됩니다.

**4. 테스트**

LiteLLM key(새 master key 또는 virtual key)를 사용해 proxy에 저장된 모델로 테스트 request를 보내 정상 동작하는지 확인합니다.

```bash
 curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-4o-mini", # 👈 REPLACE with 'public model name' for any db-model
    "messages": [
        {
            "content": "Hey, how's it going",
            "role": "user"
        }
    ],
}'
```
