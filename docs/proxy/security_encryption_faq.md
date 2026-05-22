# LiteLLM 자체 호스팅 보안 및 암호화 FAQ

## 전송 중 데이터 암호화

### 제품은 전송 중 데이터를 암호화하나요?

**예**, LiteLLM은 TLS/SSL을 사용해 전송 중 데이터를 암호화합니다.

### OSS와 엔터프라이즈 모두에서 사용할 수 있나요?

**예**, TLS 암호화는 오픈 소스와 엔터프라이즈 버전 모두에서 사용할 수 있습니다.

### 호출 클라이언트와 제품 사이의 전송도 암호화되나요?

**예**, SSL 인증서 설정을 통해 HTTPS/TLS를 지원합니다.

**설정:**
```bash
# CLI
litellm --ssl_keyfile_path /path/to/key.pem --ssl_certfile_path /path/to/cert.pem

# Environment Variables
export SSL_KEYFILE_PATH="/path/to/key.pem"
export SSL_CERTFILE_PATH="/path/to/cert.pem"
```

**문서 참조:** `docs/my-website/docs/guides/security_settings.md`

### 제품과 LLM provider 사이의 전송도 암호화되나요?

**예**, LLM provider로 향하는 모든 연결은 기본적으로 TLS 암호화를 사용합니다.

**구현 세부 정보:**
- Python의 `ssl.create_default_context()`를 사용합니다.
- SSL/TLS가 활성화된 HTTPX 및 aiohttp 라이브러리를 활용합니다.
- SSL 검증에는 기본적으로 certifi CA 번들을 사용합니다.

**코드 참조:** `litellm/llms/custom_httpx/http_handler.py` (43-105행)

### LLM provider로 향하는 TCP 세션은 공유되나요?

**예**, TCP 연결은 풀링되어 재사용됩니다.

**세부 정보:**
- 연결 풀링은 기본적으로 활성화됩니다.
- 기본값: keepalive가 적용된 최대 동시 연결 1000개
- 동일 provider에 대한 요청 간 세션이 유지됩니다.
- TLS handshake 오버헤드를 줄입니다.

**코드 참조:** `litellm/llms/custom_httpx/http_handler.py` (704-712행)

### 같은 LLM provider에 대한 연속 호출마다 새 TLS 세션을 협상하나요?

**아니요**, TLS 세션은 연결 풀링을 통해 재사용됩니다. 모든 요청마다 새 TLS handshake가 수행되지는 않습니다.

### 어떻게 암호화되나요?

**TLS 1.2 및 TLS 1.3**

TLS 1.2와 TLS 1.3을 모두 지원하는 Python 기본 SSL context를 사용합니다. 실제로 협상되는 버전은 다음에 따라 달라집니다.
- Python 버전
- 시스템 SSL 라이브러리(일반적으로 OpenSSL)
- 서버 기능

**구현:** Python의 `ssl.create_default_context()`

### 제품 설정에 어떻게 추가하나요?

#### x.509 인증서

**방법 1: CLI 인수**
```bash
litellm --ssl_certfile_path /path/to/certificate.pem
```

**방법 2: 환경 변수**
```bash
export SSL_CERTFILE_PATH="/path/to/certificate.pem"
```

#### 개인 키

**방법 1: CLI 인수**
```bash
litellm --ssl_keyfile_path /path/to/private_key.pem
```

**방법 2: 환경 변수**
```bash
export SSL_KEYFILE_PATH="/path/to/private_key.pem"
```

#### 인증서 번들/체인

**client에서 proxy로 향하는 연결:**
certfile에 중간 인증서를 함께 묶은 표준 SSL 인증서 설정을 사용합니다.

**proxy에서 LLM provider로 향하는 연결:**

**방법 1: Config YAML**
```yaml
litellm_settings:
  ssl_verify: "/path/to/ca_bundle.pem"
```

**방법 2: 환경 변수**
```bash
export SSL_CERT_FILE="/path/to/ca_bundle.pem"
```

**방법 3: 클라이언트 인증서 인증**
```yaml
litellm_settings:
  ssl_certificate: "/path/to/client_certificate.pem"
```

또는

```bash
export SSL_CERTIFICATE="/path/to/client_certificate.pem"
```

### 문서 범위

**주요 문서:**
- `docs/my-website/docs/guides/security_settings.md` - SSL/TLS 설정 가이드

**추가 참조:**
- `litellm/proxy/proxy_cli.py` (455-467행) - CLI 옵션
- `docs/my-website/docs/completion/http_handler_config.md` - 사용자 지정 HTTP handler 설정

---

## 저장 데이터 암호화

### 제품은 저장 데이터를 암호화하나요?

**부분적으로만** 암호화합니다. 특정 민감 데이터만 저장 시 암호화됩니다.

### 어떤 데이터가 암호화된 형태로 저장되나요?

#### 암호화되는 데이터:
1. **LLM API 키** - `LiteLLM_ProxyModelTable.litellm_params`의 모델 자격 증명
2. **Provider 자격 증명** - `LiteLLM_CredentialsTable.credential_values`에 저장
3. **설정 secret** - `LiteLLM_Config` 테이블의 민감한 설정 값
4. **가상 키** - secret managers를 사용하는 경우(선택 기능)

#### 암호화되지 않는 데이터:
1. **Spend 로그** - `LiteLLM_Spend로그`의 request/response 데이터
2. **Audit 로그** - `LiteLLM_AuditLog`의 변경 이력
3. **사용자/팀/조직 데이터** - metadata와 설정
4. **캐시된 프롬프트와 completions** - 캐시 데이터는 plaintext로 저장

### 캐시된 프롬프트와 completions도 암호화되나요?

**아니요**, 캐시된 프롬프트와 completions는 **암호화되지 않습니다**.

Cache backend(Redis, S3, local disk)는 데이터를 plaintext JSON으로 저장합니다.

**코드 참조:**
- `litellm/caching/redis_cache.py`
- `litellm/caching/s3_cache.py`
- `litellm/caching/caching.py`

### 설정 데이터는 암호화되나요?

**부분적으로 암호화됩니다**.

#### 암호화되는 항목:
- 모델 설정의 LLM API 키와 자격 증명
- `LiteLLM_Config` 테이블의 민감 값
- `LiteLLM_CredentialsTable`의 자격 증명 값

#### 암호화되지 않는 항목:
- 모델 이름과 alias
- rate limit 및 budget 설정
- 사용자/팀/조직 metadata
- 민감하지 않은 설정 parameter

**코드 참조:** `litellm/proxy/management_endpoints/model_management_endpoints.py` (275-308행)

### 로그 데이터는 암호화되나요?

**아니요**, 로그 데이터는 **암호화되지 않습니다**.

데이터베이스 테이블에 저장되는 로그 데이터는 plaintext입니다.
- `LiteLLM_Spend로그` - request/response 데이터, tokens, spend 포함
- `LiteLLM_Error로그` - 오류 정보
- `LiteLLM_AuditLog` - 변경 audit trail

**참고:** 민감 데이터 저장을 피하려면 logging을 비활성화할 수 있습니다.

```yaml
general_settings:
  disable_spend_logs: True   # Disable writing spend logs to DB
  disable_error_logs: True   # Disable writing error logs to DB
```

**문서:** `docs/my-website/docs/proxy/db_info.md` (52-60행)

### 어디에 저장되나요?

#### DB에 저장되나요?

**예**, 암호화된 데이터는 PostgreSQL 데이터베이스에 저장됩니다.

**암호화된 데이터를 포함하는 주요 테이블:**
- `LiteLLM_ProxyModelTable` - 암호화된 API 키를 포함한 모델 설정
- `LiteLLM_CredentialsTable` - 자격 증명 값
- `LiteLLM_Config` - 설정 secret

**스키마 참조:** `schema.prisma`

#### 파일시스템에 저장되나요?

**아니요**, 암호화된 데이터는 기본적으로 파일시스템에 저장되지 않습니다.

**참고:** disk cache(`disk_cache_dir`)를 사용하면 캐시 데이터는 암호화되지 않은 상태로 저장됩니다.

#### 다른 곳에 저장되나요?

**선택 사항:** secret managers(AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)를 사용하는 경우 암호화된 데이터를 외부에 저장할 수 있습니다.

**설정:**
```yaml
general_settings:
  key_management_system: "aws_secret_manager"  # or "azure_key_vault", "hashicorp_vault"
```

**문서:** `docs/my-website/docs/secret.md`

### 어떻게 암호화되나요?

**알고리즘:** NaCl SecretBox (XSalsa20-Poly1305 AEAD)

**AES-256이 아닙니다** - LiteLLM은 다음을 제공하는 NaCl(Networking and Cryptography Library)을 사용합니다.
- XSalsa20 스트림 암호
- 인증용 Poly1305 MAC
- AES-256과 동등한 보안 수준

**키 파생:**
1. `LITELLM_SALT_KEY`를 사용합니다(salt key가 없으면 `LITELLM_MASTER_KEY`).
2. SHA-256으로 해시해 256-bit 암호화 키를 파생합니다.
3. 인증 암호화에 NaCl SecretBox를 사용합니다.

**코드 참조:** `litellm/proxy/common_utils/encrypt_decrypt_utils.py` (69-112행)

**구현:**
```python
import hashlib
import nacl.secret

# Derive 256-bit key from salt
hash_object = hashlib.sha256(signing_key.encode())
hash_bytes = hash_object.digest()

# Create SecretBox and encrypt
box = nacl.secret.SecretBox(hash_bytes)
encrypted = box.encrypt(value_bytes)
```

### 암호화 키 설정

**필수 환경 변수:**
```bash
export LITELLM_SALT_KEY="your-strong-random-key-here"
```

**중요 참고:**
- ⚠️ **모델을 추가하기 전에 반드시 설정해야 합니다.**
- ⚠️ **이 키를 절대 변경하지 마세요** - 암호화된 데이터를 복구할 수 없게 됩니다.
- ⚠️ 강력한 임의 키를 사용하세요(권장: https://1password.com/password-generator/)
- 설정하지 않으면 `LITELLM_MASTER_KEY`로 fallback합니다.

**문서:** `docs/my-website/docs/proxy/prod.md` (8절, 184-196행)

### 문서 범위

**주요 문서:**
- `docs/my-website/docs/proxy/prod.md` (8절) - `LITELLM_SALT_KEY` 설정
- `docs/my-website/docs/secret.md` - Secret 관리 시스템
- `docs/my-website/docs/proxy/db_info.md` - 데이터베이스 정보

**추가 참조:**
- `security.md` - 일반 보안 조치
- `docs/my-website/docs/data_security.md` - 데이터 privacy 개요
- `schema.prisma` - 암호화 필드를 포함한 데이터베이스 스키마

---

## 보안 기능 요약

### ✅ 기본 제공

1. client에서 proxy로 향하는 연결용 **TLS/SSL 암호화**
2. proxy에서 LLM provider로 향하는 연결용 **TLS 암호화**(connection pooling 포함)
3. LLM API 키와 자격 증명의 **암호화 저장**
4. **TLS 1.2 및 TLS 1.3 지원**
5. TLS handshake 오버헤드를 줄이기 위한 **connection pooling**

### ⚠️ 중요한 제한 사항

1. **캐시 데이터는 암호화되지 않습니다**(Redis, S3, disk cache).
2. **로그 데이터는 암호화되지 않습니다**(spend logs, audit logs).
3. **로그의 request/response payload는 암호화되지 않습니다.**
4. **AES-256이 아니라 NaCl SecretBox를 사용합니다**(동등한 보안 수준).
5. **TLS 버전은 명시적으로 설정되지 않습니다** - Python/system defaults를 사용합니다.

### 🔧 설정 요구 사항

**프로덕션 배포:**

1. 모델을 추가하기 전에 **LITELLM_SALT_KEY 설정**
2. HTTPS client 연결용 **SSL 인증서 설정**
3. 민감 데이터가 포함될 수 있으면 **logs 비활성화 검토**
4. 보안 강화를 위해 **secret managers 사용**(선택)
5. custom certificates를 사용하는 경우 **CA 번들 설정**

---

## 빠른 시작 보안 체크리스트

```bash
# 1. Generate a strong salt key
export LITELLM_SALT_KEY="$(openssl rand -base64 32)"

# 2. Set up SSL certificates (for HTTPS)
export SSL_KEYFILE_PATH="/path/to/private_key.pem"
export SSL_CERTFILE_PATH="/path/to/certificate.pem"

# 3. Configure database
export DATABASE_URL="postgresql://user:password@host:port/dbname"

# 4. (Optional) Disable logs if they contain sensitive data
# Add to config.yaml:
# general_settings:
#   disable_spend_logs: True
#   disable_error_logs: True

# 5. Start LiteLLM Proxy
litellm --config config.yaml
```

---

## 추가 리소스

- **LiteLLM 문서:** https://docs.litellm.ai/
- **보안 설정 가이드:** https://docs.litellm.ai/docs/guides/security_settings
- **프로덕션 배포:** https://docs.litellm.ai/docs/proxy/prod
- **Secret 관리:** https://docs.litellm.ai/docs/secret

보안 문의: support@berri.ai
