# 데이터 개인정보 보호 및 보안 {#data-privacy-and-security}

LiteLLM에서는 **데이터 개인정보 보호와 보안**을 최우선으로 둡니다. 사용자가 공유하는 데이터의 중요성을 잘 알고 있으며, 가장 높은 수준의 주의로 처리합니다.

LiteLLM Cloud에서는 다음을 처리합니다.

- 배포
- 스케일링
- 업그레이드와 보안 패치
- 고가용성 보장

  <iframe
    src="https://status.litellm.ai/badge?theme=light"
    width="250"
    height="30"
    style={{
      colorScheme: "light",
      marginTop: "5px",
    }}
  ></iframe>

## 보안 조치 {#security-measures}

### LiteLLM Cloud

- 저장 데이터는 사용자의 `LITELLM_MASTER_KEY`로 암호화하고, 전송 중 데이터는 TLS로 보호합니다.
- database와 application은 GCP, AWS 인프라에서 실행되며 일부는 NeonDB가 관리합니다.
    - 미국 data region: Northern California(AWS/GCP `us-west-1`) 및 Virginia(AWS `us-east-1`)
    - EU 데이터 region: Germany/Frankfurt(AWS/GCP `eu-central-1`)
- 모든 사용자는 Google, Okta, Microsoft, KeyCloak의 OAuth 2.0을 통한 SSO(싱글 사인온)를 사용할 수 있습니다.
- retention policy가 있는 audit log
- Cloud LiteLLM Instance에 접근할 수 있는 허용 IP 주소 제어

### LiteLLM 자체 호스팅 인스턴스 {#litellm-self-hosted-instance}

- **자체 호스팅 시 LiteLLM server에는 데이터나 telemetry가 저장되지 않습니다.**
- 설치와 설정은 [Self-hosting guide](../docs/proxy/deploy.md)를 참고하세요.
- **Telemetry**: LiteLLM을 자체 호스팅할 때 telemetry를 실행하지 않습니다.

보안 문의는 support@berri.ai 로 연락해 주세요.

## **보안 인증** {#security-certifications}

| **인증** | **상태**                                                                                      |
|-------------------|-------------------------------------------------------------------------------------------------|
| SOC 2 Type I      | 인증 완료. 엔터프라이즈 plan에서 요청 시 report 제공.                                                           |
| SOC 2 Type II     | 인증 완료. 엔터프라이즈 plan에서 요청 시 report 제공.                   |
| ISO 27001          | 인증 완료. 엔터프라이즈 plan에서 요청 시 report 제공.                              |


## LiteLLM Cloud 지원 데이터 region {#supported-litellm-cloud-data-regions}

LiteLLM은 다음 data region을 지원합니다.

- 미국, Northern California (AWS/GCP `us-west-1`)
- 유럽, Frankfurt, Germany (AWS/GCP `eu-central-1`)

모든 데이터, 사용자 계정, 인프라는 이 두 region 간에 완전히 분리됩니다.

## 개인 데이터 수집 {#personal-data-collection}

### 자체 호스팅 LiteLLM 사용자: {#self-hosted-litellm-users}
- 소프트웨어를 자체 호스팅하는 경우 개인 데이터는 LiteLLM server로 수집되거나 전송되지 않습니다.
- 생성되거나 처리되는 모든 데이터는 사용자의 자체 인프라 안에만 남습니다.

### LiteLLM Cloud 사용자: {#litellm-cloud-users}
- LiteLLM Cloud는 LLM 사용 데이터를 추적합니다. API request 또는 response의 message / response content에는 접근하거나 저장하지 않습니다. 추적되는 field는 [여기](https://github.com/BerriAI/litellm/blob/main/schema.prisma#L174)에서 확인할 수 있습니다.

**개인 데이터 사용 및 공유 방식**
- proxy admin만 사용 데이터를 볼 수 있으며, 자신의 organization 사용 데이터만 확인할 수 있습니다.
- proxy admin은 다른 user / admin을 server에 초대해 각자의 사용 데이터를 보게 할 수 있습니다.
- LiteLLM Cloud는 사용 데이터를 제3자에게 판매하거나 공유하지 않습니다.


## Cookie 정보, 보안, 개인정보 보호 {#cookie-information-security-privacy}

### 자체 호스팅 LiteLLM 사용자: {#self-hosted-litellm-users-1}
- Cookie data는 사용자의 자체 인프라 안에 남습니다.
- LiteLLM은 Proxy 사용자가 LiteLLM 관리자 UI에 접근하도록 하기 위한 목적에만 최소한의 cookie를 사용합니다.
- 이 cookie는 로그인 후 사용자의 web browser에 저장됩니다.
- 광고, 추적 또는 login session 유지 외의 목적으로 cookie를 사용하지 않습니다.
- 사용되는 cookie는 app UI의 사용자 인증과 session management 유지에 필수적인 cookie뿐입니다.
- Session cookie는 browser를 닫거나 logout하거나 24시간이 지나면 만료됩니다.
- LiteLLM은 third-party cookie를 사용하지 않습니다.
- 관리자 UI는 login session 인증을 위해 cookie에 접근합니다.
- cookie는 JWT로 저장되며 system의 다른 부분에서는 접근할 수 없습니다.
- LiteLLM은 이 cookie data에 다른 목적으로 접근하거나 공유하지 않습니다.


### LiteLLM Cloud 사용자: {#litellm-cloud-users-1}
- LiteLLM은 Proxy 사용자가 LiteLLM 관리자 UI에 접근하도록 하기 위한 목적에만 최소한의 cookie를 사용합니다.
- 이 cookie는 로그인 후 사용자의 web browser에 저장됩니다.
- 광고, 추적 또는 login session 유지 외의 목적으로 cookie를 사용하지 않습니다.
- 사용되는 cookie는 app UI의 사용자 인증과 session management 유지에 필수적인 cookie뿐입니다.
- Session cookie는 browser를 닫거나 logout하거나 24시간이 지나면 만료됩니다.
- LiteLLM은 third-party cookie를 사용하지 않습니다.
- 관리자 UI는 login session 인증을 위해 cookie에 접근합니다.
- cookie는 JWT로 저장되며 system의 다른 부분에서는 접근할 수 없습니다.
- LiteLLM은 이 cookie data에 다른 목적으로 접근하거나 공유하지 않습니다.

## 보안 취약점 신고 가이드라인 {#security-vulnerability-reporting-guidelines}

시스템과 사용자를 보호하는 데 있어 보안 커뮤니티의 역할을 중요하게 생각합니다. 보안 취약점을 신고하려면:

- 상세 내용을 support@berri.ai 로 이메일로 보내 주세요.
- 문제를 재현하는 단계를 포함해 주세요.
- 관련 추가 정보를 제공해 주세요.

모든 report를 신속히 검토하겠습니다. 현재는 bug bounty program을 제공하지 않습니다.

## 취약점 스캔 {#vulnerability-scanning}

- LiteLLM은 빌드된 모든 Docker image에 대해 [`grype`](https://github.com/anchore/grype) security scan을 실행합니다.
    - [`grype litellm` CI/CD check](https://github.com/BerriAI/litellm/blob/main/.circleci/config.yml#L1099)를 참고하세요.
    - 현재 상태: ✅ Passing. High/Critical severity 취약점 0건.

## 법무/컴플라이언스 FAQ {#legalcompliance-faq}

### 조달 옵션 {#procurement-options}

1. Invoicing
2. AWS Marketplace
3. Azure Marketplace


### 공급업체 정보 {#vendor-information}

법인명: Berrie AI Incorporated

보안 incident 연락처 이메일 주소: krrish@berri.ai

일반 보안 관련 질문 연락처 이메일 주소: krrish@berri.ai 

Vendor가 audit / certification을 받았나요?
- SOC 2 Type I. 인증 완료. 엔터프라이즈 plan에서 요청 시 report 제공.
- SOC 2 Type II. 진행 중. 2025년 4월 15일까지 certificate 제공 가능.
- ISO 27001. 인증 완료. 엔터프라이즈 plan에서 요청 시 report 제공.

information security management system이 구현되어 있나요?
- 예. [CodeQL](https://codeql.github.com/)과 여러 security domain을 포함하는 포괄적인 ISMS를 운영합니다.

auth, creation, update change 같은 주요 event logging이 이루어지나요?
- 예. [audit logs](https://docs.litellm.ai/docs/proxy/multiple_admins#1-switch-on-audit-logs)가 있습니다.

Vendor에 수립된 Cybersecurity incident management program이 있나요?
- 예. 요청 시 Incident Response Policy를 제공할 수 있습니다.


vendor에 vulnerability disclosure policy가 있나요? [예](https://github.com/BerriAI/litellm?tab=security-ov-file#security-vulnerability-reporting-guidelines)

vendor가 vulnerability scan을 수행하나요?
- 예. [취약점 스캔](#취약점-스캔) 섹션에 설명된 대로 정기 vulnerability scan을 수행합니다.

서명자 이름: Krish Amit Dholakia

서명자 이메일: krrish@berri.ai
