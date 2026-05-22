import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure Sentinel

<Image img={require('../../img/sentinel.png')} />

LiteLLM은 Azure Monitor 로그 Ingestion API를 통한 Azure Sentinel 로깅을 지원합니다. Azure Sentinel은 데이터 저장에 Log Analytics workspace를 사용하므로, workspace로 전송된 로그는 보안 모니터링과 분석을 위해 Sentinel에서 사용할 수 있습니다.

## Azure Sentinel 통합

| 기능 | 세부 정보 |
|---------|---------|
| **로깅 대상** | [StandardLoggingPayload](../proxy/logging_spec) |
| **Events** | Success + Failure |
| **Product Link** | [Azure Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/overview) |
| **API Reference** | [로그 Ingestion API](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview) |

`--config`로 `litellm.callbacks = ["azure_sentinel"]`를 설정합니다. 그러면 성공 및 실패한 모든 LLM 호출이 Azure Sentinel에 기록됩니다.

**1단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `callbacks`를 설정합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  callbacks: ["azure_sentinel"] # logs llm success + failure logs to Azure Sentinel
```

**2단계**: Azure 리소스 설정

로그 Ingestion API를 사용하기 전에 Azure에서 다음을 설정해야 합니다.

1. **Log Analytics Workspace 생성**(없는 경우)
2. Log Analytics workspace에서 **Custom Table 생성**(예: `LiteLLM_CL`)
3. 다음을 포함하는 **Data Collection Rule(DCR) 생성**:
   - 데이터 구조와 일치하는 stream declaration
   - 데이터를 custom table로 매핑하는 transformation
   - app registration에 부여된 접근 권한
4. Microsoft Entra ID(Azure AD)에 다음을 가진 **Application 등록**:
   - Client ID
   - Client Secret
   - DCR에 쓸 수 있는 권한

자세한 설정 방법은 [Microsoft 로그 Ingestion API 문서](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview)를 참고하세요.

**3단계**: 필수 환경 변수 설정

Azure 자격 증명으로 다음 환경 변수를 설정합니다.

```shell showLineNumbers title="Environment Variables"
# Required: Data Collection Rule (DCR) configuration
AZURE_SENTINEL_DCR_IMMUTABLE_ID="dcr-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # DCR Immutable ID from Azure portal
AZURE_SENTINEL_STREAM_NAME="Custom-LiteLLM_CL_CL"                    # Stream name from your DCR
AZURE_SENTINEL_ENDPOINT="https://your-dcr-endpoint.eastus-1.ingest.monitor.azure.com"  # DCR logs ingestion endpoint (NOT the DCE endpoint)

# Required: OAuth2 Authentication (App Registration)
AZURE_SENTINEL_TENANT_ID="your-tenant-id"                            # Azure Tenant ID
AZURE_SENTINEL_CLIENT_ID="your-client-id"                            # Application (client) ID
AZURE_SENTINEL_CLIENT_SECRET="your-client-secret"                    # Client secret value

```

**참고**: `AZURE_SENTINEL_ENDPOINT`는 Data Collection Endpoint(DCE)가 아니라 DCR의 logs ingestion endpoint여야 합니다(DCR 개요 페이지에서 확인). DCR endpoint는 특정 DCR에 연결되며 `https://your-dcr-endpoint.{region}-1.ingest.monitor.azure.com` 형식입니다.

**4단계**: 프록시를 시작하고 테스트 요청 실행

프록시 시작

```shell showLineNumbers title="Start Proxy"
litellm --config config.yaml --debug
```

테스트 요청

```shell showLineNumbers title="Test Request"
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "your-custom-metadata": "custom-field",
    }
}'
```

**5단계**: Azure Sentinel에서 로그 확인

1. Azure portal에서 Azure Sentinel workspace로 이동합니다.
2. "로그"로 이동해 custom table(예: `LiteLLM_CL`)을 쿼리합니다.
3. 다음과 같은 쿼리를 실행합니다.

```kusto showLineNumbers title="KQL Query"
LiteLLM_CL
| where TimeGenerated > ago(1h)
| project TimeGenerated, model, status, total_tokens, response_cost
| order by TimeGenerated desc
```

Azure Workspace에서 다음과 같은 로그를 볼 수 있습니다.

<Image img={require('../../img/sentinel.png')} />

## 환경 변수

| 환경 변수 | 설명 | 기본값 | 필수 |
|---------------------|-------------|---------------|----------|
| `AZURE_SENTINEL_DCR_IMMUTABLE_ID` | Data Collection Rule(DCR) Immutable ID | None | ✅ 예 |
| `AZURE_SENTINEL_ENDPOINT` | DCR logs ingestion endpoint URL(DCR 개요 페이지에서 확인) | None | ✅ 예 |
| `AZURE_SENTINEL_STREAM_NAME` | DCR의 stream name(예: "Custom-LiteLLM_CL_CL") | "Custom-LiteLLM" | ❌ 아니요 |
| `AZURE_SENTINEL_TENANT_ID` | OAuth2 인증용 Azure Tenant ID | None(`AZURE_TENANT_ID`로 fallback) | ✅ 예 |
| `AZURE_SENTINEL_CLIENT_ID` | OAuth2 인증용 Application(client) ID | None(`AZURE_CLIENT_ID`로 fallback) | ✅ 예 |
| `AZURE_SENTINEL_CLIENT_SECRET` | OAuth2 인증용 client secret | None(`AZURE_CLIENT_SECRET`로 fallback) | ✅ 예 |

## 동작 방식

Azure Sentinel 통합은 [Azure Monitor 로그 Ingestion API](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview)를 사용해 Log Analytics workspace로 로그를 전송합니다. 이 통합은 다음을 수행합니다.

- app registration으로 OAuth2 client credentials flow 인증
- Data Collection Rule(DCR) endpoint로 로그 전송
- 효율적인 전송을 위한 로그 배치 처리
- [StandardLoggingPayload](../proxy/logging_spec) 형식으로 로그 전송
- 성공 및 실패 이벤트 자동 처리
- OAuth2 token 캐싱 및 자동 갱신

Log Analytics workspace로 전송된 로그는 Azure Sentinel에서 보안 모니터링, 위협 탐지, 분석에 자동으로 사용할 수 있습니다.

## Azure Sentinel 설정 가이드

이 단계별 가이드에 따라 LiteLLM과 Azure Sentinel을 설정합니다.

### 1단계: Log Analytics Workspace 생성

1. Navigate to [https://portal.azure.com/#home](https://portal.azure.com/#home)

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/5659f6f5-a166-4b26-a991-73352274e3bb/ascreenshot.jpeg?tl_px=0,210&br_px=2618,1673&force_format=jpeg&q=100&width=1120.0)

2. "Log Analytics workspaces"를 검색하고 "Create"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/a827ba10-a391-486a-a36a-51816c6255de/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=21,106)

3. workspace 이름을 입력합니다(예: "litellm-sentinel-prod").

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/943458f1-fd4c-47dd-a273-ea5a04734ed9/ascreenshot.jpeg?tl_px=0,420&br_px=2618,1884&force_format=jpeg&q=100&width=1120.0)

4. "Review + Create"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/c54828fb-f895-4eb7-b810-cacf437617bd/ascreenshot.jpeg?tl_px=0,420&br_px=2618,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=40,564)

### 2단계: Custom Table 생성

1. Log Analytics workspace로 이동해 "Tables"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/72d65f70-75c0-471f-95e9-947c72e173cc/ascreenshot.jpeg?tl_px=0,142&br_px=2618,1605&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=330,277)

2. "Create" → "New custom log (Direct Ingest)"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/863ad29b-2c3a-4b7c-9a6b-36d3a76c9f32/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=526,146)

3. table 이름을 입력합니다(예: "LITELLM_PROD_CL").

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/ef2f1c52-aa36-46a1-91e6-9bd868891b15/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0)

### 3단계: Data Collection Rule(DCR) 생성

1. "새 데이터 수집 규칙 만들기"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/f2abc0d3-8be8-4057-9290-946d10cfd183/ascreenshot.jpeg?tl_px=0,420&br_px=2618,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=264,404)

2. DCR 이름을 입력합니다(예: "litellm-prod").

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/79bbebdc-e4d9-46ff-a270-1930619050a1/ascreenshot.jpeg?tl_px=0,8&br_px=2618,1471&force_format=jpeg&q=100&width=1120.0)

3. Data Collection Endpoint를 선택합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/f3112e9a-551e-415c-a7f9-55aad801bc8a/ascreenshot.jpeg?tl_px=0,420&br_px=2618,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=332,480)

4. schema용 sample JSON 파일을 업로드합니다([example_standard_logging_payload.json](https://github.com/BerriAI/litellm/blob/main/litellm/integrations/azure_sentinel/example_standard_logging_payload.json) 파일 사용).

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/703c0762-840a-4f1f-a60f-876dc24b7a03/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=518,272)

5. "Next"를 클릭한 뒤 "Create"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/0bca0200-5c64-4fbd-8061-9308aa6656b8/ascreenshot.jpeg?tl_px=0,420&br_px=2618,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=128,560)

### 4단계: DCR Immutable ID와 로그 Ingestion Endpoint 확인

1. "Data Collection Rules"로 이동해 DCR을 선택합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/11c06a0d-584f-4d22-b36e-9c338d43812c/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=94,258)

2. **DCR Immutable ID**를 복사합니다(`dcr-`로 시작).

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/cd0ad69a-4d95-4b6a-9533-7720908ba809/ascreenshot.jpeg?tl_px=1160,92&br_px=2618,907&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=530,277)

3. **로그 Ingestion Endpoint** URL을 복사합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/3d3752ed-08ea-4490-8c98-a97d33947ea7/ascreenshot.jpeg?tl_px=1160,464&br_px=2618,1279&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=532,277)

### 5단계: Stream Name 확인

1. DCR에서 "JSON View"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/fd8a5504-4769-4f23-983e-520f256ee308/ascreenshot.jpeg?tl_px=1160,0&br_px=2618,814&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=965,257)

2. `streamDeclarations` 섹션에서 **Stream Name**을 찾습니다(예: "Custom-LITELLM_PROD_CL_CL").

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-17/a4052b32-2028-4d12-8930-bfcdf6f47652/ascreenshot.jpeg?tl_px=405,270&br_px=2115,1225&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=523,277)

### 6단계: App 등록 및 권한 부여

1. Go to **Microsoft Entra ID** → **App registrations** → **New registration**
2. 새 app을 만들고 **Client ID**와 **Tenant ID**를 기록합니다.
3. **인증서 및 비밀**로 이동해 새 client secret을 만들고 **Secret Value**를 복사합니다.
4. DCR로 돌아가 **Access Control (IAM)** → **Add role assignment**로 이동합니다.
5. app registration에 **"Monitoring Metrics Publisher"** role을 할당합니다.

### 요약: 각 값의 위치

| 환경 변수 | 찾을 위치 |
|---------------------|------------------|
| `AZURE_SENTINEL_DCR_IMMUTABLE_ID` | DCR 개요 page → Immutable ID(`dcr-`로 시작) |
| `AZURE_SENTINEL_ENDPOINT` | DCR 개요 page → 로그 Ingestion Endpoint |
| `AZURE_SENTINEL_STREAM_NAME` | DCR JSON View → `streamDeclarations` section |
| `AZURE_SENTINEL_TENANT_ID` | App Registration → 개요 → Directory(tenant) ID |
| `AZURE_SENTINEL_CLIENT_ID` | App Registration → 개요 → Application(client) ID |
| `AZURE_SENTINEL_CLIENT_SECRET` | App Registration → 인증서 및 비밀 → Secret Value |

자세한 내용은 [Microsoft 로그 Ingestion API 문서](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview)를 참고하세요.
