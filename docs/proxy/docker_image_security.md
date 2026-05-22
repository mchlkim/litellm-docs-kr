# Docker 이미지 보안 가이드

LiteLLM은 **v1.83.0**부터 GHCR에 게시되는 모든 Docker 이미지에 [cosign](https://docs.sigstore.dev/cosign/overview/)으로 서명합니다. 이 페이지에서는 서명 검증 방법, CI/CD에서 검증을 강제하는 방법, 권장 배포 패턴을 설명합니다.

## 서명된 이미지

`ghcr.io/berriai/`에 게시되는 모든 이미지 변형은 동일한 cosign 키로 서명됩니다.

| 이미지 | 설명 |
|---|---|
| `ghcr.io/berriai/litellm` | 핵심 Proxy |
| `ghcr.io/berriai/litellm-database` | Postgres 의존성이 포함된 Proxy |
| `ghcr.io/berriai/litellm-non_root` | non-root 변형 |
| `ghcr.io/berriai/litellm-spend_logs` | spend-logs 사이드카 |

서명 키는 [commit `0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0)에서 도입되었으며, 공개 키는 저장소의 [`cosign.pub`](https://github.com/BerriAI/litellm/blob/main/cosign.pub)에 체크인되어 있습니다.

:::info 엔터프라이즈 이미지
엔터프라이즈 이미지(`litellm-ee`)도 동일한 서명 절차를 따릅니다. 특정 엔터프라이즈 이미지 태그의 적용 여부를 확인하려면 [support@berri.ai](mailto:support@berri.ai)로 문의하세요.
:::

## 이미지 서명 검증

[공식 안내](https://docs.sigstore.dev/cosign/system_config/installation/)에 따라 cosign을 설치하세요.

### 고정된 commit hash로 검증(권장)

commit hash는 암호학적으로 변경할 수 없으므로 가장 강력한 검증 방법입니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm:v1.83.0-stable
```

이미지 참조를 서명된 다른 변형으로 바꿔 사용할 수 있습니다.

```bash
# litellm-database
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm-database:v1.83.0-stable

# litellm-non_root
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm-non_root:v1.83.0-stable
```

### release tag로 검증(편의용)

이 저장소의 tag는 보호되며 동일한 키로 해석됩니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/v1.83.0-stable/cosign.pub \
  ghcr.io/berriai/litellm-database:v1.83.0-stable
```

### 예상 출력

```
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

## CI/CD에서 검증 강제

### Kubernetes - `Sigstore Policy Controller`

[Sigstore Policy Controller](https://docs.sigstore.dev/policy-controller/overview/)는 cosign 검증에 실패한 이미지를 사용하는 Pod를 거부합니다.

1. Controller를 설치합니다.

```bash
helm repo add sigstore https://sigstore.github.io/helm-charts
helm install policy-controller sigstore/policy-controller \
  -n cosign-system --create-namespace
```

2. LiteLLM 공개 키를 사용하는 `ClusterImagePolicy`를 만듭니다.

```yaml
apiVersion: policy.sigstore.dev/v1beta1
kind: ClusterImagePolicy
metadata:
  name: litellm-signed-images
spec:
  images:
    - glob: "ghcr.io/berriai/litellm*"
  authorities:
    - key:
        data: |
          -----BEGIN PUBLIC KEY-----
          MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKi4ivqGpE231OGH50PKbqy1Y1Kkb
          POJC8+i2Wko82gBOUCe3M0Vw86H/4rhUhfoYEti4gdJ9wZbYmK0I2EE96g==
          -----END PUBLIC KEY-----
```

3. 강제 적용을 활성화하도록 namespace에 label을 지정합니다.

```bash
kubectl label namespace litellm policy.sigstore.dev/include=true
```

해당 namespace에서 서명되지 않은 `ghcr.io/berriai/litellm*` 이미지를 사용하는 Pod는 admission 단계에서 거부됩니다.

### GCP - `Binary Authorization`

[Binary Authorization](https://cloud.google.com/binary-authorization/docs)은 Cloud Run과 GKE에서 cosign 서명을 강제할 수 있습니다.

1. LiteLLM 공개 키를 사용해 cosign 기반 attestor를 만듭니다.

```bash
# Import the public key into a Cloud KMS keyring or use a PGP/PKIX attestor.
# See: https://cloud.google.com/binary-authorization/docs/creating-attestors-console
```

2. `ghcr.io/berriai/litellm*` 이미지에 attestor를 요구하는 Binary Authorization policy를 구성합니다.

3. Cloud Run service 또는 GKE cluster에서 policy를 활성화합니다.

전체 설정 단계는 [GCP Binary Authorization 문서](https://cloud.google.com/binary-authorization/docs/setting-up)를 참고하세요.

### AWS — ECS / ECR

AWS는 배포 시점에 cosign 서명을 기본으로 검증하지 않습니다. 일반적인 접근 방식은 다음과 같습니다.

- **CI/CD gate**: ECR에 push하거나 ECS task definition을 업데이트하기 전에 배포 pipeline에서 `cosign verify`를 실행합니다. 검증에 실패하면 pipeline을 실패 처리합니다.
- **EKS의 OPA/Gatekeeper**: EKS에서 실행 중이라면 위 Kubernetes 접근 방식과 동일하게 Sigstore Policy Controller를 사용합니다.

### GitHub Actions 검증 단계

배포 job 전에 검증 step을 추가합니다.

```yaml
- name: Verify LiteLLM image signature
  run: |
    cosign verify \
      --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
      ghcr.io/berriai/litellm-database:${{ env.LITELLM_VERSION }}
```

## 권장 배포 패턴

### digest로 고정

digest 고정은 tag 변경 여부와 관계없이 정확히 동일한 이미지 콘텐츠를 보장합니다.

```yaml
image: ghcr.io/berriai/litellm-database@sha256:<digest>
```

pull한 뒤 digest를 가져옵니다.

```bash
docker inspect --format='{{index .RepoDigests 0}}' \
  ghcr.io/berriai/litellm-database:v1.83.0-stable
```

cosign 검증은 digest에도 사용할 수 있습니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm-database@sha256:<digest>
```

### stable release tag 사용

workflow에 digest 고정이 너무 엄격하다면 `-stable` release tag(예: `v1.83.0-stable`)를 사용하세요. 이 tag는 덮어쓰지 않는 불변 release tag입니다.

production에서는 `main-latest` 또는 `main-stable`을 피하세요. 이러한 rolling tag는 최신 build를 가리키며 배포 사이에 변경될 수 있습니다.

### 안전한 upgrade checklist

1. **새 이미지 검증** — 새 release tag 또는 digest에 대해 `cosign verify`를 실행합니다.
2. **staging에서 테스트** — 검증된 이미지를 non-production 환경에 배포합니다.
3. **고정 참조 업데이트** — 배포 manifest의 digest 또는 tag를 변경합니다.
4. **production에 배포** — 표준 배포 절차에 따라 rollout합니다.
5. **`/health` 모니터링** — upgrade 후 Proxy가 정상 상태인지 확인합니다.

## 추가 자료

- [CI/CD v2 announcement](https://docs.litellm.ai/blog/ci-cd-v2-improvements) — LiteLLM 서명 infrastructure 배경
- [Docker deployment guide](./deploy.md) — 전체 Docker, Helm, Terraform 설정
- [cosign documentation](https://docs.sigstore.dev/cosign/overview/) — cosign 사용법과 key management
- [Sigstore Policy Controller](https://docs.sigstore.dev/policy-controller/overview/) — Kubernetes admission control
