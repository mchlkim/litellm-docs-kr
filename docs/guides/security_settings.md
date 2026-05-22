import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SSL, HTTP Proxy 보안 설정

오래된 암호화를 사용하는 구형 TTS bundle 환경이라면 이 가이드를 따르세요. 기본적으로 LiteLLM은 SSL 검증에 certifi CA bundle을 사용하며, 이는 대부분의 최신 서버와 호환됩니다.
다만 SSL 검증을 비활성화하거나 사용자 지정 CA bundle을 사용해야 하는 경우 아래 단계를 따르면 됩니다.

환경 변수는 SDK 설정보다 우선한다는 점에 유의하세요.

별도로 지정하지 않는 한 LiteLLM은 네트워크 요청에 HTTPX를 사용합니다.

## 1. 사용자 지정 CA Bundle

`SSL_CERT_FILE` 환경 변수를 사용하거나 ssl_verify 설정에 문자열을 전달해 사용자 지정 CA bundle 파일 경로를 설정할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_verify = "client.pem"
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  ssl_verify: "client.pem"
```

</TabItem>  
<TabItem value="env_var" label="Environment Variables">

```bash
export SSL_CERT_FILE="client.pem"
```
</TabItem>
</Tabs>

## 2. SSL 검증 비활성화


<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_verify = False
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  ssl_verify: false
```

</TabItem>  
<TabItem value="env_var" label="Environment Variables">

```bash
export SSL_VERIFY="False"
```
</TabItem>
</Tabs>

## 3. 보안 설정 낮추기

`ssl_security_level`을 사용하면 SSL 연결에 더 낮은 보안 수준을 설정할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_security_level = "DEFAULT@SECLEVEL=1"
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  ssl_security_level: "DEFAULT@SECLEVEL=1"
```
</TabItem>
<TabItem value="env_var" label="Environment Variables">

```bash
export SSL_SECURITY_LEVEL="DEFAULT@SECLEVEL=1"
```
</TabItem>
</Tabs>

## 4. 인증서 인증

`SSL_CERTIFICATE` 환경 변수 또는 `ssl_certificate` 속성을 사용하면 클라이언트를 서버에 인증하기 위한 client side certificate를 설정할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_certificate = "/path/to/certificate.pem"
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  ssl_certificate: "/path/to/certificate.pem"
```
</TabItem>
<TabItem value="env_var" label="Environment Variables">

```bash
export SSL_CERTIFICATE="/path/to/certificate.pem"
```

</TabItem>
</Tabs>

## 5. SSL/TLS 성능을 위한 ECDH Curve 구성

`ssl_ecdh_curve` 설정을 사용하면 SSL/TLS key exchange에 사용하는 Elliptic Curve Diffie-Hellman(ECDH) curve를 구성할 수 있습니다. PQC가 필요하지 않은 환경에서 성능 향상을 위해 Post-Quantum Cryptography(PQC)를 비활성화할 때 특히 유용합니다.

**사용 사례:** 일부 OpenSSL 3.x 시스템은 기본적으로 PQC를 활성화하며, 이로 인해 TLS handshake가 느려질 수 있습니다. ECDH curve를 `X25519`로 설정하면 PQC가 비활성화되고 연결 성능이 크게 개선될 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_ecdh_curve = "X25519"  # Disables PQC for better performance
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  ssl_ecdh_curve: "X25519"
```

</TabItem>  
<TabItem value="env_var" label="Environment Variables">

```bash
export SSL_ECDH_CURVE="X25519"
```

</TabItem>
</Tabs>

**일반적으로 유효한 Curves:**

- `X25519` - 현대적이고 빠른 curve(PQC 비활성화에 권장)
- `prime256v1` - NIST P-256 curve
- `secp384r1` - NIST P-384 curve
- `secp521r1` - NIST P-521 curve

**참고:** 유효하지 않은 curve 이름이 제공되거나 Python/OpenSSL 버전이 이 기능을 지원하지 않으면 LiteLLM은 경고를 기록하고 기본 curves로 계속 진행합니다.

## 6. HTTP_PROXY 환경 변수 사용

httpx와 aiohttp 라이브러리는 모두 환경 변수에서 `urllib.request.getproxies`를 사용합니다. 클라이언트 초기화 전에 환경 변수를 설정해 proxy와 선택 사항인 SSL_CERT_FILE을 설정할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.aiohttp_trust_env = True
```

```bash
export HTTPS_PROXY='http://username:password@proxy_uri:port'
```
</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
export HTTPS_PROXY='http://username:password@proxy_uri:port'
export AIOHTTP_TRUST_ENV='True'
```
</TabItem>
</Tabs>
## 7. 서비스별 SSL 검증

LiteLLM은 특정 서비스 또는 provider 호출에 대해 SSL 검증 설정을 override할 수 있게 합니다. 내부 guardrail과 public LLM provider처럼 서로 다른 서비스가 서로 다른 CA 인증서를 요구할 때 유용합니다.

### Bedrock (SDK)
`completion` 호출에 `ssl_verify`를 직접 전달할 수 있습니다.

```python
import litellm

response = litellm.completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[{"role": "user", "content": "hi"}],
    ssl_verify="path/to/bedrock_cert.pem" # Or False to disable
)
```

### AIM Guardrail 설정(Proxy)
`config.yaml`에서 guardrail별로 `ssl_verify`를 구성할 수 있습니다.

```yaml
guardrails:
  - guardrail_name: aim-protected-app
    litellm_params:
      guardrail: aim
      ssl_verify: "/path/to/aim_cert.pem" # Use specific cert for AIM
```

### 우선순위 로직
LiteLLM은 다음 우선순위로 `ssl_verify`를 해석합니다.
1. **명시적 파라미터**: `completion()` 또는 guardrail config에 전달된 값.
2. **환경 변수**: `SSL_VERIFY` 환경 변수.
3. **전역 설정**: `litellm.ssl_verify` 설정.
4. **시스템 표준**: `SSL_CERT_FILE` 환경 변수.
