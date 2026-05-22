# CyberArk Conjur {#cyberark-conjur}

import Image from '@theme/IdealImage';

:::info

✨ **이 기능은 엔터프라이즈 기능입니다**

[엔터프라이즈 요금](https://www.litellm.ai/#pricing)

[무료 평가판을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

| 기능 | 지원 | 설명 |
|---------|----------|-------------|
| 시크릿 읽기 | ✅ | `OPENAI_API_KEY` 같은 시크릿을 읽습니다 |
| 시크릿 쓰기 | ✅ | `가상 키` 같은 시크릿을 저장합니다 |
| 시크릿 삭제 | ❌ | 시크릿은 정책 업데이트를 통해 제거해야 합니다 |

[CyberArk Conjur](https://www.cyberark.com/products/secrets-management/)(셀프 호스팅 시크릿 관리자)에서 시크릿을 읽고 씁니다.

**1단계.** 환경에 CyberArk Conjur 세부 정보를 추가합니다.

LiteLLM은 두 가지 인증 방식을 지원합니다.

1. API 키 인증 - `CYBERARK_API_KEY`(권장)
2. 인증서 인증 - `CYBERARK_CLIENT_CERT` 및 `CYBERARK_CLIENT_KEY`

```bash title="환경 변수" showLineNumbers
CYBERARK_API_BASE="http://your-conjur-instance:8080"
CYBERARK_ACCOUNT="default"
CYBERARK_USERNAME="admin"

# Authentication via API key (recommended)
CYBERARK_API_KEY="your-api-key-here"

# OR - Authentication via certificate
CYBERARK_CLIENT_CERT="path/to/client.pem"
CYBERARK_CLIENT_KEY="path/to/client.key"

# OPTIONAL
CYBERARK_REFRESH_INTERVAL="300" # defaults to 300 seconds (5 minutes), frequency of token refresh
CYBERARK_SSL_VERIFY="true" # defaults to true, set to "false" to disable SSL verification (for self-signed certificates)
```

**2단계.** 프록시 `config.yaml`에 추가합니다.

```yaml title="프록시 구성" showLineNumbers
general_settings:
  key_management_system: "cyberark"

  # [OPTIONAL SETTINGS]
  key_management_settings: 
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL. If set, this prefix will be used for stored virtual keys in the secret manager
    access_mode: "read_and_write" # Literal["read_only", "write_only", "read_and_write"]
```

**3단계.** 프록시를 시작하고 테스트합니다.

```bash title="프록시 시작" showLineNumbers
$ litellm --config /path/to/config.yaml
```

[프록시 빠른 테스트](../proxy/user_keys)

## CyberArk에 가상 키 쓰기 {#writing-가상-키-to-cyberark}

LiteLLM UI에서 가상 키를 만들면 CyberArk Conjur에 자동으로 저장됩니다.

**1단계:** LiteLLM 관리자 UI에서 가상 키를 만듭니다.

이 예시에서는 `litellm-cyber-ark-secret-key`라는 이름의 키를 만듭니다.

<Image img={require('../../img/cyberark1.png')} alt="LiteLLM UI에서 가상 키 만들기" />

**2단계:** CyberArk에 시크릿이 있는지 확인합니다.

시크릿 API를 쿼리하여 가상 키가 CyberArk에 저장되었는지 확인할 수 있습니다.

```bash title="CyberArk에서 시크릿 확인" showLineNumbers
TOKEN=$(curl -s -X POST http://0.0.0.0:8080/authn/default/admin/authenticate \
  -d "your-api-key" | base64 | tr -d '\n')

curl -H "Authorization: Token token=\"$TOKEN\"" \
  "http://0.0.0.0:8080/resources/default/variable" | jq .
```

응답에는 `litellm-cyber-ark-secret-key`가 CyberArk에 있음을 보여줍니다.

<Image img={require('../../img/cyberark2.png')} alt="CyberArk API에 저장된 가상 키" />

가상 키는 전체 경로 `default:variable:litellm/litellm-cyber-ark-secret-key`로 저장됩니다.

## 동작 방식

**인증**

CyberArk Conjur는 2단계 인증 프로세스를 사용합니다.

1. LiteLLM이 API 키로 인증하여 세션 토큰을 가져옵니다.
2. 세션 토큰(base64로 인코딩됨)은 이후 API 요청에 사용됩니다.
3. 토큰은 약 8분 후 만료되므로 LiteLLM이 이를 캐시하고 자동으로 갱신합니다.

**시크릿 읽기**

LiteLLM은 다음 URL 형식을 사용하여 CyberArk Conjur에서 시크릿을 읽습니다.

```
{CYBERARK_API_BASE}/secrets/{ACCOUNT}/variable/{SECRET_NAME}
```

예를 들어 다음 값이 있다면:
- `CYBERARK_API_BASE="http://conjur.example.com:8080"`
- `CYBERARK_ACCOUNT="default"`
- 시크릿 이름: `AZURE_API_KEY`

LiteLLM은 다음 주소를 조회합니다.
```
http://conjur.example.com:8080/secrets/default/variable/AZURE_API_KEY
```

**시크릿 쓰기**

LiteLLM에서 가상 키가 생성되면 다음 작업이 자동으로 수행됩니다.

1. LiteLLM이 Conjur에 변수를 정의하는 정책 항목을 만듭니다(없는 경우).
2. LiteLLM이 Conjur API를 통해 시크릿 값을 설정합니다.

LiteLLM은 `prefix_for_stored_virtual_keys` 경로 아래에 시크릿을 저장합니다(기본값: `litellm/`).

예를 들어 가상 키는 `litellm/virtual-key-name` 형식으로 저장됩니다.

**중요 참고 사항**

- 변수 값을 설정하기 전에 Conjur 정책에 변수가 정의되어 있어야 합니다.
- LiteLLM은 새 시크릿을 쓸 때 정책 항목을 자동으로 만듭니다.
- 슬래시가 포함된 시크릿 이름(예: `litellm/key`)은 자동으로 URL 인코딩됩니다.
- API 호출을 최소화하기 위해 세션 토큰은 기본적으로 5분 동안 캐시됩니다.

## 문제 해결

LiteLLM 통합에 문제가 있다면 먼저 CyberArk Conjur 인스턴스가 정상 작동하는지 확인하세요. 다음 curl 명령을 CyberArk 엔드포인트에 직접 실행하여 연결성과 인증을 확인합니다.

**1단계: 인증하고 토큰 받기**

`http://conjur.example.com:8080`을 `CYBERARK_API_BASE` 값으로 바꾸고 실제 자격 증명을 사용하세요.

```bash title="인증" showLineNumbers
TOKEN=$(curl -s -X POST http://conjur.example.com:8080/authn/default/admin/authenticate \
  -d "your-api-key" | base64 | tr -d '\n')
```

**2단계: 시크릿 읽기 테스트**

```bash title="시크릿 읽기" showLineNumbers
curl -H "Authorization: Token token=\"$TOKEN\"" \
  "http://conjur.example.com:8080/secrets/default/variable/test-secret"
```

**3단계: 시크릿 쓰기 테스트**

```bash title="시크릿 쓰기" showLineNumbers
curl -X POST \
  -H "Authorization: Token token=\"$TOKEN\"" \
  --data "my-secret-value" \
  "http://conjur.example.com:8080/secrets/default/variable/test-secret"
```

이 명령들이 CyberArk 인스턴스에서 성공적으로 실행되면 CyberArk는 정상 작동 중이며 문제는 LiteLLM 구성에 있습니다. 다음 항목을 확인하세요.
- 환경 변수가 올바르게 설정되어 있는지
- LiteLLM 인스턴스에서 `CYBERARK_API_BASE` URL에 접근할 수 있는지
- API 키 또는 인증서에 CyberArk에서 필요한 권한이 있는지

### SSL 인증서 오류 {#ssl-certificate-errors}

다음과 같은 SSL 인증서 검증 오류가 발생하는 경우:

```
RuntimeError: Could not authenticate to CyberArk Conjur: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self-signed certificate in certificate chain
```

이는 일반적으로 CyberArk Conjur 인스턴스가 자체 서명 인증서를 사용할 때 발생합니다. 다음 설정으로 SSL 검증을 비활성화할 수 있습니다.

```bash
CYBERARK_SSL_VERIFY="false"
```

:::warning
SSL 검증 비활성화는 안전하지 않으며 자체 서명 인증서를 사용하는 테스트 또는 개발 환경에서만 사용해야 합니다. 프로덕션에서는 인증서 체인을 올바르게 구성하거나 `CYBERARK_CLIENT_CERT` 및 `CYBERARK_CLIENT_KEY`를 사용하는 인증서 기반 인증을 사용하세요.
:::

## 동영상 안내 {#video-walkthrough}

이 동영상은 CyberArk Conjur를 LiteLLM의 시크릿 관리자로 사용하는 과정을 안내합니다. LiteLLM 관리자 UI에서 가상 키를 만들고 CyberArk에 존재하는지 확인합니다. 그런 다음 시크릿 키를 교체하고 CyberArk에 존재하는지 다시 확인합니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/e9892ae6cb9545d1b709b82e8695db91" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
