import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# `Docker`, `Helm`, `Terraform` {#docker-helm-terraform}

:::info LiteLLM OSS 제한 없음
LiteLLM OSS에서 생성할 수 있는 사용자, 키, 팀 수에는 **제한이 없습니다**.
:::

LiteLLM proxy 빌드용 Dockerfile은 [여기](https://github.com/BerriAI/litellm/blob/main/Dockerfile)에서 확인할 수 있습니다.

> 참고: 프로덕션에는 최소 4 CPU 코어와 8 GB RAM이 필요합니다.

## 빠른 시작 {#quick-start}

:::info
Docker 이미지를 가져오는 데 문제가 있나요? support@berri.ai로 이메일을 보내주세요.
:::

LiteLLM 사용을 시작하려면 셸에서 다음 명령을 실행하세요.

<Tabs>

<TabItem value="docker" label="Docker">

```
docker pull docker.litellm.ai/berriai/litellm:main-latest
```

[**모든 Docker 이미지 보기**](https://github.com/orgs/BerriAI/packages)

</TabItem>

<TabItem value="cli" label="LiteLLM CLI">

```shell
$ uv tool install 'litellm[proxy]'
```

</TabItem>

<TabItem value="docker-compose" label="Docker Compose (Proxy + DB)">

이 Docker Compose 파일을 사용하면 로컬에서 실행되는 Postgres 데이터베이스와 함께 proxy를 띄울 수 있습니다.

```bash
# Get the docker compose file
curl -O https://raw.githubusercontent.com/BerriAI/litellm/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/BerriAI/litellm/main/prometheus.yml

# Add the master key - you can change this after setup
echo 'LITELLM_MASTER_KEY="sk-1234"' > .env

# Add the litellm salt key - you cannot change this after adding a model
# It is used to encrypt / decrypt your LLM API Key credentials
# We recommend - https://1password.com/password-generator/ 
# password generator to get a random hash for litellm salt key
echo 'LITELLM_SALT_KEY="sk-1234"' >> .env

# Start
docker compose up
```

</TabItem>
</Tabs>

### Docker 이미지 서명 검증

모든 LiteLLM Docker 이미지는 [cosign](https://docs.sigstore.dev/cosign/overview/)으로 서명됩니다. 모든 릴리스는 [commit `0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0)에서 도입된 동일한 키로 서명됩니다.

**고정된 커밋 해시로 검증(권장):**

커밋 해시는 암호학적으로 불변이므로 원본 서명 키를 사용 중인지 확인하는 가장 강한 방법입니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

**릴리스 태그로 검증(편의 방식):**

이 저장소의 태그는 보호되며 동일한 키로 해석됩니다. 이 옵션은 읽기 쉽지만 태그 보호 규칙에 의존합니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/<release-tag>/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

`<release-tag>`를 배포하려는 버전으로 바꾸세요. 예: `v1.83.0-stable`.

예상 출력:

```
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

LiteLLM 릴리스 서명에 대한 자세한 내용은 [CI/CD v2 발표](https://docs.litellm.ai/blog/ci-cd-v2-improvements#verify-docker-image-signatures)를 참고하세요. 모든 이미지 변형, CI/CD 강제 적용, 배포 모범 사례를 다루는 전체 가이드는 [Docker 이미지 보안 가이드](./docker_image_security.md)를 확인하세요.

### Docker 실행 {#docker-run}

#### 1단계. config.yaml 생성

예제 `litellm_config.yaml` 

```yaml
model_list:
  - model_name: azure-gpt-4o
    litellm_params:
      model: azure/<your-azure-model-deployment>
      api_base: os.environ/AZURE_API_BASE # runs os.getenv("AZURE_API_BASE")
      api_key: os.environ/AZURE_API_KEY # runs os.getenv("AZURE_API_KEY")
      api_version: "2025-01-01-preview"
```



#### 2단계. Docker 이미지 실행

```shell
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e AZURE_API_KEY=d6*********** \
    -e AZURE_API_BASE=https://openai-***********/ \
    -p 4000:4000 \
    docker.litellm.ai/berriai/litellm:main-stable \
    --config /app/config.yaml --detailed_debug
```

최신 이미지는 [여기](https://github.com/berriai/litellm/pkgs/container/litellm)에서 확인하세요.

#### 3단계. 요청 테스트

  1단계에서 설정한 `model=azure-gpt-4o`를 전달합니다.

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "azure-gpt-4o",
      "messages": [
          {
          "role": "user",
          "content": "what llm are you"
          }
      ]
  }'
  ```

### Docker 실행 - CLI 인자 {#docker-run---cli-arguments}

지원되는 모든 CLI 인자는 [여기](https://docs.litellm.ai/docs/proxy/cli)에서 확인하세요.

Docker 이미지를 실행하고 설정 파일을 `litellm`에 전달하는 방법은 다음과 같습니다.
```shell
docker run docker.litellm.ai/berriai/litellm:main-stable --config your_config.yaml
```

Docker 이미지를 실행하면서 `num_workers=8`로 `litellm`을 8002 포트에서 시작하는 방법은 다음과 같습니다.
```shell
docker run docker.litellm.ai/berriai/litellm:main-stable --port 8002 --num_workers 8
```


### LiteLLM을 기본 이미지로 사용

```shell
# Use the provided base image
FROM docker.litellm.ai/berriai/litellm:main-stable

# Set the working directory to /app
WORKDIR /app

# Copy the configuration file into the container at /app
COPY config.yaml .

# Make sure your docker/entrypoint.sh is executable
RUN chmod +x ./docker/entrypoint.sh

# Expose the necessary port
EXPOSE 4000/tcp

# Override the CMD instruction with your desired command and arguments
# WARNING: FOR PROD DO NOT USE `--detailed_debug` it slows down response times, instead use the following CMD
# CMD ["--port", "4000", "--config", "config.yaml"]

CMD ["--port", "4000", "--config", "config.yaml", "--detailed_debug"]
```

### 게시된 LiteLLM 패키지로 빌드

게시된 LiteLLM 패키지에서 Docker 컨테이너를 빌드하려면 다음 절차를 따르세요. 회사에 보안 또는 이미지 출처에 대한 엄격한 요구사항이 있다면 이 방식을 사용할 수 있습니다.

**참고:** [LiteLLM 저장소](https://github.com/BerriAI/litellm/blob/main/schema.prisma)의 `schema.prisma` 파일을 이 Dockerfile과 같은 빌드 디렉터리에 복사하세요.

Dockerfile 

```shell
FROM cgr.dev/chainguard/python:latest-dev
ARG UV_IMAGE=ghcr.io/astral-sh/uv:0.10.9

USER root
WORKDIR /app

ENV UV_TOOL_BIN_DIR=/usr/local/bin

# Install runtime dependencies
RUN apk update && \
    apk add --no-cache gcc python3-dev openssl openssl-dev

COPY --from=$UV_IMAGE /uv /usr/local/bin/uv
COPY --from=$UV_IMAGE /uvx /usr/local/bin/uvx

RUN uv tool install 'litellm[proxy,proxy-runtime,extra_proxy]==1.57.3' \
    --python python

# Copy Prisma schema file
COPY schema.prisma .

# Generate prisma client
RUN prisma generate

EXPOSE 4000/tcp

ENTRYPOINT ["litellm"]
CMD ["--port", "4000"]
```


Docker 이미지 빌드

```shell
docker build \
  -f Dockerfile \
  -t litellm-proxy-from-package-5 .
```

Docker 이미지 실행

```shell
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e OPENAI_API_KEY="sk-1222" \
    -e DATABASE_URL="postgresql://xxxxxxxxx \
    -p 4000:4000 \
    litellm-proxy-from-package-5 \
    --config /app/config.yaml --detailed_debug
```

### Terraform

[Nicholas Cecere](https://www.linkedin.com/in/nicholas-cecere-24243549/)의 LiteLLM 사용자 관리 Terraform 작업에 감사드립니다.

👉 [Terraform은 여기에서 확인하세요](https://github.com/BerriAI/terraform-provider-litellm)

### Kubernetes

config 파일 기반 LiteLLM 인스턴스는 config map을 통해 `config.yaml` 파일을 로드하는 간단한 배포만 있으면 됩니다. API key는 env var로 선언하고 실제 API key 값은 opaque secret으로 연결하는 방식을 권장합니다.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: litellm-config-file
data:
  config.yaml: |
      model_list: 
        - model_name: gpt-4o
          litellm_params:
            model: azure/gpt-4o-ca
            api_base: https://my-endpoint-canada-berri992.openai.azure.com/
            api_key: os.environ/CA_AZURE_OPENAI_API_KEY
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: litellm-secrets
data:
  CA_AZURE_OPENAI_API_KEY: bWVvd19pbV9hX2NhdA== # your api key in base64
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-deployment
  labels:
    app: litellm
spec:
  selector:
    matchLabels:
      app: litellm
  template:
    metadata:
      labels:
        app: litellm
    spec:
      containers:
      - name: litellm
        image: docker.litellm.ai/berriai/litellm:main-stable # it is recommended to fix a version generally
        args:
          - "--config"
          - "/app/proxy_server_config.yaml"
        ports:
        - containerPort: 4000
        volumeMounts:
        - name: config-volume
          mountPath: /app/proxy_server_config.yaml
          subPath: config.yaml
        envFrom:
        - secretRef:
            name: litellm-secrets
      volumes:
        - name: config-volume
          configMap:
            name: litellm-config-file
```

:::info
예측 가능성 문제, rollback 어려움, 환경 불일치를 피하려면 `litellm:main-stable` 대신 버전 또는 SHA digest를 사용하세요. 예: `litellm:main-v1.30.3` 또는 `litellm@sha256:12345abcdef...`.
:::


### Helm Chart {#helm-chart}

:::info

[BETA] Helm Chart는 BETA입니다. 문제가 있거나 피드백이 있다면 [https://github.com/BerriAI/litellm/issues](https://github.com/BerriAI/litellm/issues)에 알려주세요.

:::

LiteLLM helm chart를 다른 chart의 dependency로 사용하려면 이 방식을 사용하세요. `litellm-helm` OCI는 [https://github.com/BerriAI/litellm/pkgs/container/litellm-helm](https://github.com/BerriAI/litellm/pkgs/container/litellm-helm)에 호스팅됩니다.

#### 1단계. LiteLLM helm chart 가져오기

```bash
helm pull oci://docker.litellm.ai/berriai/litellm-helm

# Pulled: docker.litellm.ai/berriai/litellm-helm:0.1.2
# Digest: sha256:7d3ded1c99c1597f9ad4dc49d84327cf1db6e0faa0eeea0c614be5526ae94e2a
```

#### 2단계. LiteLLM helm 압축 해제
1단계에서 가져온 특정 버전의 압축을 해제합니다.

```bash
tar -zxvf litellm-helm-0.1.2.tgz
```

#### 3단계. LiteLLM helm 설치

```bash
helm install lite-helm ./litellm-helm
```

#### 4단계. service를 localhost에 노출

```bash
kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT
```

이제 LiteLLM Proxy 서버가 `http://127.0.0.1:4000`에서 실행됩니다.

**여기까지가 LiteLLM 배포 빠른 시작입니다.**

#### LLM API 요청 보내기

:::info
첫 LLM API 요청을 보내려면 [여기](user_keys)를 참고하세요.

LiteLLM은 OpenAI SDK, Anthropic SDK, Mistral SDK, LLamaIndex, Langchain (Js, Python)을 포함한 여러 SDK와 호환됩니다.

:::

## 배포 옵션

| 문서                                                                                              | 사용 시점                                                                                                                                           |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [빠른 시작](#quick-start)                                                                       | 100개 이상의 LLM 호출 + 부하 분산                                                                                                                       |
| Database로 배포                                                                                  | + 가상 키 사용 + 비용 추적. 참고: database와 함께 배포할 때는 env에 `DATABASE_URL`과 `LITELLM_MASTER_KEY`가 필요합니다. |
| [LiteLLM container + Redis](#litellm-container--redis)                                            | 여러 LiteLLM container 간 부하 분산                                                                                                     |
| [LiteLLM Database container + PostgresDB + Redis](#litellm-database-container--postgresdb--redis) | + 가상 키 사용 + 비용 추적 + 여러 LiteLLM container 간 부하 분산                                                                    |

### Database로 배포 {#deploy-with-database}
##### `Docker`, `Kubernetes`, `Helm Chart` {#docker-kubernetes-helm-chart}

:::warning 고트래픽 배포(1000+ RPS)

높은 트래픽(초당 1000개 이상의 요청)이 예상된다면 database connection 고갈과 deadlock을 방지하기 위해 **Redis가 필요합니다**.

설정에 다음을 추가하세요.
```yaml
general_settings:
  use_redis_transaction_buffer: true

litellm_settings:
  cache: true
  cache_params:
    type: redis
    host: your-redis-host
```

자세한 내용은 [DB deadlock 해결](/litellm-docs-kr/docs/proxy/db_deadlocks)를 참고하세요.

:::

요구사항:
- Postgres database가 필요합니다. 예: [Supabase](https://supabase.com/), [Neon](https://neon.tech/). env에 `DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>`를 설정하세요.
- `LITELLM_MASTER_KEY`를 설정하세요. 이는 Proxy Admin key이며 다른 key를 생성하는 데 사용할 수 있습니다. 반드시 `sk-`로 시작해야 합니다.

<Tabs>

<TabItem value="docker-deploy" label="Dockerfile">

연결된 Postgres Database와 함께 LiteLLM proxy를 실행할 때 빌드 시간을 줄이기 위해 [별도 Dockerfile](https://github.com/BerriAI/litellm/pkgs/container/litellm-database)을 유지합니다.

```shell
docker pull docker.litellm.ai/berriai/litellm-database:main-stable
```

```shell
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e LITELLM_MASTER_KEY=sk-1234 \
    -e DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname> \
    -e AZURE_API_KEY=d6*********** \
    -e AZURE_API_BASE=https://openai-***********/ \
    -p 4000:4000 \
    docker.litellm.ai/berriai/litellm-database:main-stable \
    --config /app/config.yaml --detailed_debug
```

이제 LiteLLM Proxy 서버가 `http://0.0.0.0:4000`에서 실행됩니다.

</TabItem>
<TabItem value="kubernetes-deploy" label="Kubernetes">

#### 1단계. deployment.yaml 생성

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: litellm
  template:
    metadata:
      labels:
        app: litellm
    spec:
      containers:
        - name: litellm-container
          image: docker.litellm.ai/berriai/litellm:main-stable
          imagePullPolicy: Always
          env:
            - name: AZURE_API_KEY
              value: "d6******"
            - name: AZURE_API_BASE
              value: "https://ope******"
            - name: LITELLM_MASTER_KEY
              value: "sk-1234"
            - name: DATABASE_URL
              value: "po**********"
          args:
            - "--config"
            - "/app/proxy_config.yaml"  # Update the path to mount the config file
          volumeMounts:                 # Define volume mount for proxy_config.yaml
            - name: config-volume
              mountPath: /app/proxy_config.yaml
              subPath: config.yaml      # Specify the field under data of the ConfigMap litellm-config
              readOnly: true
          livenessProbe:
            httpGet:
              path: /health/liveliness
              port: 4000
            initialDelaySeconds: 120
            periodSeconds: 15
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 4000
            initialDelaySeconds: 120
            periodSeconds: 15
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 10
      volumes:  # Define volume to mount proxy_config.yaml
        - name: config-volume
          configMap:
            name: litellm-config  

```

```bash
kubectl apply -f /path/to/deployment.yaml
```

#### 2단계. service.yaml 생성

```yaml
apiVersion: v1
kind: Service
metadata:
  name: litellm-service
spec:
  selector:
    app: litellm
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: NodePort
```

```bash
kubectl apply -f /path/to/service.yaml
```

#### 3단계. 서버 시작

```
kubectl port-forward service/litellm-service 4000:4000
```

이제 LiteLLM Proxy 서버가 `http://0.0.0.0:4000`에서 실행됩니다.

</TabItem>

<TabItem value="helm-deploy" label="Helm">



:::info

[BETA] Helm Chart는 BETA입니다. 문제가 있거나 피드백이 있다면 [https://github.com/BerriAI/litellm/issues](https://github.com/BerriAI/litellm/issues)에 알려주세요.

:::

Helm chart를 사용해 LiteLLM을 배포하려면 이 방식을 사용하세요. [LiteLLM Helm Chart](https://github.com/BerriAI/litellm/tree/main/deploy/charts/litellm-helm)를 참고하세요.

#### 1단계. 저장소 클론

```bash
git clone https://github.com/BerriAI/litellm.git
```

#### 2단계. Helm으로 배포

`litellm` 저장소 루트에서 다음 명령을 실행하세요. 이 명령은 LiteLLM proxy master key를 `sk-1234`로 설정합니다.

```bash
helm install \
  --set masterkey=sk-1234 \
  mydeploy \
  deploy/charts/litellm-helm
```

#### 3단계. service를 localhost에 노출

```bash
kubectl \
  port-forward \
  service/mydeploy-litellm-helm \
  4000:4000
```

이제 LiteLLM Proxy 서버가 `http://127.0.0.1:4000`에서 실행됩니다.


LiteLLM proxy `config.yaml`을 설정해야 한다면 [values.yaml](https://github.com/BerriAI/litellm/blob/main/deploy/charts/litellm-helm/values.yaml)에서 확인할 수 있습니다.

</TabItem>

<TabItem value="helm-oci" label="Helm OCI Registry (GHCR)">

:::info

[BETA] Helm Chart는 BETA입니다. 문제가 있거나 피드백이 있다면 [https://github.com/BerriAI/litellm/issues](https://github.com/BerriAI/litellm/issues)에 알려주세요.

:::

LiteLLM helm chart를 다른 chart의 dependency로 사용하려면 이 방식을 사용하세요. `litellm-helm` OCI는 [https://github.com/BerriAI/litellm/pkgs/container/litellm-helm](https://github.com/BerriAI/litellm/pkgs/container/litellm-helm)에 호스팅됩니다.

#### 1단계. LiteLLM helm chart 가져오기

```bash
helm pull oci://docker.litellm.ai/berriai/litellm-helm

# Pulled: docker.litellm.ai/berriai/litellm-helm:0.1.2
# Digest: sha256:7d3ded1c99c1597f9ad4dc49d84327cf1db6e0faa0eeea0c614be5526ae94e2a
```

#### 2단계. LiteLLM helm 압축 해제
1단계에서 가져온 특정 버전의 압축을 해제합니다.

```bash
tar -zxvf litellm-helm-0.1.2.tgz
```

#### 3단계. LiteLLM helm 설치

```bash
helm install lite-helm ./litellm-helm
```

#### 4단계. service를 localhost에 노출

```bash
kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT
```

이제 LiteLLM Proxy 서버가 `http://127.0.0.1:4000`에서 실행됩니다.

</TabItem>
</Tabs>

### Redis로 배포 {#litellm-container--redis}
여러 LiteLLM container 간 부하 분산이 필요할 때 Redis를 사용하세요.

필요한 변경은 `config.yaml`에 Redis를 설정하는 것뿐입니다.
LiteLLM Proxy는 여러 LiteLLM instance 간 rpm/tpm 공유를 지원합니다. 이를 활성화하려면 `redis_host`, `redis_password`, `redis_port`를 전달하세요. LiteLLM은 Redis를 사용해 rpm/tpm 사용량을 추적합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6
router_settings:
  redis_host: <your redis host>
  redis_password: <your redis password>
  redis_port: 1992
```

설정 파일로 Docker container 시작

```shell
docker run docker.litellm.ai/berriai/litellm:main-stable --config your_config.yaml
```

### Database + Redis로 배포 {#litellm-database-container--postgresdb--redis}

필요한 변경은 `config.yaml`에 Redis를 설정하는 것뿐입니다.
LiteLLM Proxy는 여러 LiteLLM instance 간 rpm/tpm 공유를 지원합니다. 이를 활성화하려면 `redis_host`, `redis_password`, `redis_port`를 전달하세요. LiteLLM은 Redis를 사용해 rpm/tpm 사용량을 추적합니다.


```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6
router_settings:
  redis_host: <your redis host>
  redis_password: <your redis password>
  redis_port: 1992
```

설정 파일로 `litellm-database` Docker container 시작

```shell
docker run --name litellm-proxy \
-e DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname> \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm-database:main-stable --config your_config.yaml
```

### (Non Root) - 인터넷 연결 없이 실행 {#non-root---run-without-internet-connection}

기본적으로 `prisma generate`는 [prisma engine binaries](https://www.prisma.io/docs/orm/reference/environment-variables-reference#custom-engine-file-locations)를 다운로드합니다. 인터넷 연결 없이 실행하면 오류가 발생할 수 있습니다.

사전 생성된 prisma binaries와 함께 LiteLLM을 배포하려면 이 Docker 이미지를 사용하세요.

```bash
docker pull docker.litellm.ai/berriai/litellm-non_root:main-stable
```

[게시된 Docker 이미지 링크](https://github.com/BerriAI/litellm/pkgs/container/litellm-non_root)

## 고급 배포 설정

### 1. 사용자 지정 서버 루트 경로(Proxy base url) {#custom-server-root-pathproxy-base-url}

자세한 내용은 [사용자 지정 Root Path](./custom_root_ui)를 참고하세요.


### 2. SSL 인증서

온프레미스 LiteLLM proxy에 SSL 인증서를 설정해야 할 때 사용하세요.

LiteLLM proxy를 시작할 때 `ssl_keyfile_path`(SSL keyfile 경로)와 `ssl_certfile_path`(SSL certfile 경로)를 전달합니다.

```shell
docker run docker.litellm.ai/berriai/litellm:main-stable \
    --ssl_keyfile_path ssl_test/keyfile.key \
    --ssl_certfile_path ssl_test/certfile.crt
```

LiteLLM proxy 서버를 시작할 때 SSL 인증서를 제공합니다.

### 3. Hypercorn으로 HTTP/2 사용

HTTP/2 지원을 위해 Hypercorn으로 proxy를 실행하려면 이 방식을 사용하세요.

1단계. Hypercorn이 포함된 사용자 지정 Docker 이미지를 빌드합니다.

```shell
# Use the provided base image
FROM docker.litellm.ai/berriai/litellm:main-stable

# Set the working directory to /app
WORKDIR /app

# Copy the configuration file into the container at /app
COPY config.yaml .

# Make sure your docker/entrypoint.sh is executable
RUN chmod +x ./docker/entrypoint.sh

# Expose the necessary port
EXPOSE 4000/tcp

# 👉 Key Change: Install hypercorn
RUN uv add hypercorn

# Override the CMD instruction with your desired command and arguments
# WARNING: FOR PROD DO NOT USE `--detailed_debug` it slows down response times, instead use the following CMD
# CMD ["--port", "4000", "--config", "config.yaml"]

CMD ["--port", "4000", "--config", "config.yaml", "--detailed_debug"]
```

2단계. proxy를 시작할 때 `--run_hypercorn` 플래그를 전달합니다.

```shell
docker run \
    -v $(pwd)/proxy_config.yaml:/app/config.yaml \
    -p 4000:4000 \
    -e LITELLM_LOG="DEBUG"\
    -e SERVER_ROOT_PATH="/api/v1"\
    -e DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname> \
    -e LITELLM_MASTER_KEY="sk-1234"\
    your_custom_docker_image \
    --config /app/config.yaml
    --run_hypercorn
```

### 4. Keepalive Timeout {#keepalive-timeout}

기본값은 5초입니다. 요청 사이의 연결은 이 시간 안에 새 데이터를 받아야 하며, 그렇지 않으면 끊깁니다.


사용 예:
이 예제에서는 keepalive timeout을 75초로 설정합니다.

```shell showLineNumbers title="docker run"
docker run docker.litellm.ai/berriai/litellm:main-stable \
    --keepalive_timeout 75
```

또는 환경 변수로 설정합니다.
이 예제에서는 keepalive timeout을 75초로 설정합니다.

```shell showLineNumbers title="Environment Variable"
export KEEPALIVE_TIMEOUT=75
docker run docker.litellm.ai/berriai/litellm:main-stable
```


### N개 요청 후 worker 재시작

고정된 요청 수 이후 worker를 재활용하여 메모리 증가를 완화할 때 사용합니다. 설정하면 각 worker는 지정된 요청 수를 완료한 뒤 재시작됩니다. 설정하지 않으면 기본적으로 비활성화됩니다.

사용법 예제:

```shell showLineNumbers title="docker run (CLI flag)"
docker run docker.litellm.ai/berriai/litellm:main-stable \
    --max_requests_before_restart 10000
```

또는 환경 변수로 설정합니다.

```shell showLineNumbers title="Environment Variable"
export MAX_REQUESTS_BEFORE_RESTART=10000
docker run docker.litellm.ai/berriai/litellm:main-stable
```


### 5. s3 또는 GCS Bucket Object/url의 config.yaml 파일

배포 서비스에 config 파일을 mount할 수 없을 때 사용하세요. 예: AWS Fargate, Railway.

LiteLLM Proxy는 s3 Bucket 또는 GCS Bucket에서 `config.yaml`을 읽습니다.

<Tabs>
<TabItem value="gcs" label="GCS Bucket">

다음 `.env` var를 설정합니다.
```shell
LITELLM_CONFIG_BUCKET_TYPE = "gcs"                              # set this to "gcs"         
LITELLM_CONFIG_BUCKET_NAME = "litellm-proxy"                    # your bucket name on GCS
LITELLM_CONFIG_BUCKET_OBJECT_KEY = "proxy_config.yaml"         # object key on GCS
```

이 env var로 LiteLLM proxy를 시작하면 LiteLLM이 GCS에서 config를 읽습니다.

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_NAME=<bucket_name> \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="<object_key>> \
   -e LITELLM_CONFIG_BUCKET_TYPE="gcs" \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm-database:main-stable --detailed_debug
```

</TabItem>

<TabItem value="s3" label="s3">

다음 `.env` var를 설정합니다.
```shell
LITELLM_CONFIG_BUCKET_NAME = "litellm-proxy"                    # your bucket name on s3 
LITELLM_CONFIG_BUCKET_OBJECT_KEY = "litellm_proxy_config.yaml"  # object key on s3
```

이 env var로 LiteLLM proxy를 시작하면 LiteLLM이 s3에서 config를 읽습니다.

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_NAME=<bucket_name> \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="<object_key>> \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm-database:main-stable
```
</TabItem>
</Tabs>

### 6. 실시간 model price 가져오기 비활성화

cold start 시간이 길거나 네트워크 보안 문제가 있다면 LiteLLM의 [호스팅 model prices file](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 model price를 가져오는 동작을 비활성화하세요.

```env
export LITELLM_LOCAL_MODEL_COST_MAP="True"
```

그러면 대신 로컬 model prices file을 사용합니다.

## 플랫폼별 가이드

<Tabs>
<TabItem value="AWS ECS" label="AWS ECS - Elastic Container Service">

### Terraform 기반 ECS 배포

LiteLLM은 ECS에 proxy를 배포하기 위한 전용 Terraform tutorial을 제공합니다. [litellm-ecs-deployment 저장소](https://github.com/BerriAI/litellm-ecs-deployment)의 단계별 가이드를 따라 필요한 ECS service, task definition, AWS 지원 리소스를 provision하세요.

1. Terraform module과 variable을 검토하기 위해 tutorial repository를 clone합니다.
  ```bash
  git clone https://github.com/BerriAI/litellm-ecs-deployment.git
  cd litellm-ecs-deployment
  ```

2. 선택한 workspace/account에 적용하기 전에 Terraform project를 초기화하고 검증합니다.
  ```bash
  terraform init
  terraform plan
  terraform apply
  ```

3. `terraform apply`가 완료되면 `./build.sh`를 실행해 repository를 ECR에 push하고 ECS cluster를 업데이트합니다. LiteLLM proxy에 API 요청을 보낼 때 해당 endpoint(기본 port `4000`)를 사용하세요.


</TabItem>

<TabItem value="AWS EKS" label="AWS EKS - Kubernetes">

### `Kubernetes` (`AWS EKS`) {#kubernetes-aws-eks}

1단계. 다음 spec으로 EKS Cluster를 생성합니다.

```shell
eksctl create cluster --name=litellm-cluster --region=us-west-2 --node-type=t2.small
```

2단계. kub cluster에 LiteLLM proxy config를 mount합니다.

이 명령은 `proxy_config.yaml`이라는 로컬 파일을 Kubernetes cluster에 mount합니다.

```shell
kubectl create configmap litellm-config --from-file=proxy_config.yaml
```

3단계. `kub.yaml`과 `service.yaml`을 적용합니다.
다음 `kub.yaml` 및 `service.yaml` 파일을 clone한 뒤 로컬에서 적용합니다.

- 이 `kub.yaml` 파일을 사용하세요 - [LiteLLM kub.yaml](https://github.com/BerriAI/litellm/blob/main/deploy/kubernetes/kub.yaml)

- 이 `service.yaml` 파일을 사용하세요 - [LiteLLM service.yaml](https://github.com/BerriAI/litellm/blob/main/deploy/kubernetes/service.yaml)

`kub.yaml` 적용
```
kubectl apply -f kub.yaml
```

`service.yaml` 적용 - proxy를 노출하는 AWS load balancer를 생성합니다.
```
kubectl apply -f service.yaml

# service/litellm-service created
```

4단계. Proxy Base URL 확인

```shell
kubectl get services

# litellm-service   LoadBalancer   10.100.6.31   a472dc7c273fd47fd******.us-west-2.elb.amazonaws.com   4000:30374/TCP   63m
```

Proxy Base URL = `a472dc7c273fd47fd******.us-west-2.elb.amazonaws.com:4000`

이제 LiteLLM Proxy 사용을 시작할 수 있습니다.

</TabItem>


<TabItem value="aws-stack" label="AWS CloudFormation Stack">

### `AWS CloudFormation Stack` {#aws-cloud-formation-stack}
LiteLLM AWS CloudFormation Stack - **LiteLLM에 적합한 AutoScaling Policy를 적용하고 LiteLLM Proxy용 DB를 provision합니다.**

다음 리소스가 provision됩니다.
- `LiteLLMServer` - `EC2 Instance`
- `LiteLLMServerAutoScalingGroup`
- `LiteLLMServerScalingPolicy` (`autoscaling policy`)
- `LiteLLMDB` - `RDS::DBInstance`

#### AWS CloudFormation Stack 사용 {#using-aws-cloud-formation-stack}
**LiteLLM CloudFormation stack은 [여기 - litellm.yaml](https://github.com/BerriAI/litellm/blob/main/enterprise/cloudformation_stack/litellm.yaml)에 있습니다.**

#### 1. CloudFormation Stack 생성
AWS Management Console에서 CloudFormation service로 이동한 뒤 "Create Stack"을 클릭합니다.

"Create Stack" 페이지에서 "템플릿 파일 업로드"를 선택하고 `litellm.yaml` 파일을 고릅니다.

stack이 성공적으로 생성되는지 확인합니다.

#### 2. Database URL 가져오기
stack이 생성되면 Database resource의 DatabaseURL을 확인하고 이 값을 복사합니다.

#### 3. EC2 Instance에 연결하고 EC2 container에 LiteLLM 배포
EC2 console에서 stack이 생성한 instance에 연결합니다. 예: SSH 사용.

다음 명령을 실행하되 `<database_url>`을 2단계에서 복사한 값으로 바꿉니다.

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm-database:main-stable
```

#### 4. Application 접속

container가 실행되면 브라우저에서 `http://<ec2-public-ip>:4000`으로 application에 접속할 수 있습니다.

</TabItem>
<TabItem value="google-cloud-run" label="Google Cloud Run">

### Google Cloud Run

1. 이 repo를 fork합니다 - [github.com/BerriAI/example_litellm_gcp_cloud_run](https://github.com/BerriAI/example_litellm_gcp_cloud_run)

2. repo의 `litellm_config.yaml` 파일을 수정해 model settings를 포함합니다.

3. fork한 github repo를 Google Cloud Run에 배포합니다.

#### 배포된 proxy 테스트
**필요한 key가 Environment Variables로 설정되어 있다고 가정합니다.**

https://litellm-7yjrj3ha2q-uc.a.run.app 은 예제 proxy입니다. 배포한 Cloud Run app 주소로 바꿔 사용하세요.

```shell
curl https://litellm-7yjrj3ha2q-uc.a.run.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
     "model": "gpt-4o",
     "messages": [{"role": "user", "content": "Say this is a test!"}],
     "temperature": 0.7
   }'
```


</TabItem>
<TabItem value="render" label="Render 배포">

### Render 

https://render.com/

<iframe width="840" height="500" src="https://www.loom.com/embed/805964b3c8384b41be180a61442389a3" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>



</TabItem>
<TabItem value="railway" label="Railway">

### Railway 

https://railway.app

**1단계: 버튼 클릭**으로 Railway에 배포합니다.

[![Railway에 배포](https://railway.app/button.svg)](https://railway.app/template/S7P9sn?referralCode=t3ukrU)

**2단계:** Railway Environment Variables에서 `PORT` = 4000을 설정합니다.

</TabItem>
</Tabs>


## 기타 

### Docker Compose {#docker-compose}

**1단계**

- (권장) project root에 제공된 예제 `docker-compose.yml` 파일을 사용합니다. 예: https://github.com/BerriAI/litellm/blob/main/docker-compose.yml

다음은 `docker-compose.yml` 파일 예시입니다.
```yaml
version: "3.9"
services:
  litellm:
    build:
      context: .
      args:
        target: runtime
    image: docker.litellm.ai/berriai/litellm:main-stable
    ports:
      - "4000:4000" # Map the container port to the host, change the host port if necessary
    volumes:
      - ./litellm-config.yaml:/app/config.yaml # Mount the local configuration file
    # You can change the port or number of workers as per your requirements or pass any new supported CLI argument. Make sure the port passed here matches with the container port defined above in `ports` value
    command: [ "--config", "/app/config.yaml", "--port", "4000", "--num_workers", "8" ]

# ...rest of your docker-compose config if any
```

**2단계**

`docker-compose.yml` 파일 기준 상대 경로에 LiteLLM config가 담긴 `litellm-config.yaml` 파일을 생성합니다.

config 문서는 [여기](https://docs.litellm.ai/docs/proxy/configs)에서 확인하세요.

**3단계**

Docker 설치 방식에 맞게 `docker-compose up` 또는 `docker compose up` 명령을 실행합니다.

> container를 detached mode(background)로 실행하려면 `-d` flag를 사용하세요. 예: `docker compose up -d`


이제 LiteLLM container가 지정된 port에서 실행됩니다. 예: `4000`.

### RDS DB용 IAM 기반 Auth

1. AWS env var 설정

```bash
export AWS_WEB_IDENTITY_TOKEN='/path/to/token'
export AWS_ROLE_NAME='arn:aws:iam::123456789012:role/MyRole'
export AWS_SESSION_NAME='MySession'
```

[**모든 Auth option 보기**](https://github.com/BerriAI/litellm/blob/089a4f279ad61b7b3e213d8039fb9b75204a7abc/litellm/proxy/auth/rds_iam_token.py#L165)

2. RDS credential을 env에 추가

```bash
export DATABASE_USER="db-user"
export DATABASE_PORT="5432"
export DATABASE_HOST="database-1-instance-1.cs1ksmwz2xt3.us-west-2.rds.amazonaws.com"
export DATABASE_NAME="database-1-instance-1"
export DATABASE_SCHEMA="schema-name" # skip to use the default "public" schema
```

3. iam+rds로 proxy 실행


```bash
litellm --config /path/to/config.yaml --iam_token_db_auth
```

### Web crawler 차단 {#block-web-crawlers}

참고: 이 기능은 [enterprise 전용 기능](https://docs.litellm.ai/docs/enterprise)입니다.

web crawler가 proxy server endpoint를 indexing하지 못하게 하려면 `litellm_config.yaml` 파일에서 `block_robots` 설정을 `true`로 지정하세요.

```yaml showLineNumbers title="litellm_config.yaml"
general_settings:
  block_robots: true
```

#### 동작 방식

이 설정이 활성화되면 `/robots.txt` endpoint는 다음 content와 함께 200 status code를 반환합니다.

```shell showLineNumbers title="robots.txt"
User-agent: *
Disallow: /
```

## 배포 FAQ

**Q: Postgres만 지원되는 database인가요, 아니면 Mongo 같은 다른 database도 지원하나요?**

A: MySQL도 검토했지만 유지보수가 어렵고 고객 환경에서 bug로 이어졌습니다. 현재 production deployment에서 기본으로 지원하는 database는 PostgreSQL입니다.


**Q: Postgres downtime이 발생하면 LiteLLM은 어떻게 동작하나요? fail-open인가요, 아니면 API downtime이 발생하나요?**

A: DB가 VPC 안에 있다면 DB unavailable 상태를 graceful하게 처리할 수 있습니다. 자세한 내용은 production guide를 참고하세요: [DB 사용 불가 상태를 graceful하게 처리](https://docs.litellm.ai/docs/proxy/prod#6-if-running-litellm-on-vpc-gracefully-handle-db-unavailability)
