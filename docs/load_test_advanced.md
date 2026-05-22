import Image from '@theme/IdealImage';


# LiteLLM Proxy - Locust에서 1K RPS 부하 테스트 {#litellm-proxy-load-test}

Locust에서 LiteLLM Proxy로 1K+ RPS를 달성하는 방법을 안내합니다.


## 테스트 전 체크리스트 {#pre-testing-checklist}
- [ ] litellm의 **최신 `-stable` 버전**을 사용 중인지 확인하세요.
    - [GitHub 릴리스](https://github.com/BerriAI/litellm/releases)
    - [litellm Docker 컨테이너](https://github.com/BerriAI/litellm/pkgs/container/litellm)
    - [litellm 데이터베이스 Docker 컨테이너](https://github.com/BerriAI/litellm/pkgs/container/litellm-database)
- [ ] [프로덕션 모범 사례](./proxy/prod.md)를 **모두** 따르고 있는지 확인하세요.
- [ ] Locust - Locust 인스턴스가 초당 1K+ 요청을 생성할 수 있는지 확인하세요.
    - 👉 **[여기에서 제공되는 관리형 locust 인스턴스](https://locust-load-tester-production.up.railway.app/)**를 사용할 수 있습니다.
    - locust를 직접 호스팅하는 경우
        - [locust 머신에 사용한 사양은 여기](#locust-machine-specs)에서 확인할 수 있습니다.
        - [테스트에 사용한 locustfile.py는 여기](#locust-file)에서 확인할 수 있습니다.
- [ ] [**litellm proxy 실행용 머신 사양**](#proxy-machine-specs)을 사용하세요.
- [ ] **엔터프라이즈 LiteLLM** - 부하 테스트 메트릭을 얻으려면 `proxy_config.yaml`에서 `prometheus`를 콜백으로 사용하세요.
    성공/실패 및 모든 오류 유형을 모니터링하려면 `litellm_settings.callbacks`를 설정하세요.
    ```yaml
    litellm_settings:
        callbacks: ["prometheus"] # Enterprise LiteLLM Only - use prometheus to get metrics on your load test
    ```

**테스트에는 이 설정을 사용하세요.**

**참고:** 현재 처리량이 10배 더 높은 `aiohttp`로 마이그레이션 중입니다. 부하 테스트에는 `openai/` 프로바이더를 사용하는 것을 권장합니다.

:::tip Fake OpenAI Endpoint 설정
[github.com/BerriAI/example_openai_endpoint](https://github.com/BerriAI/example_openai_endpoint)를 사용해 직접 호스팅하거나, 제공되는 호스팅 테스트 엔드포인트를 사용할 수 있습니다.
:::

```yaml
model_list:
  - model_name: "fake-openai-endpoint"
    litellm_params:
      model: openai/any
      api_base: https://exampleopenaiendpoint-production.up.railway.app/  # or your self-hosted endpoint
      api_key: "test"
```


## 부하 테스트 - Fake OpenAI Endpoint {#load-test---fake-openai-endpoint}

### 예상 성능 {#expected-performance}

| 메트릭 | 값 |
|--------|-------|
| 초당 요청 수 | 1174+ |
| 중앙값 응답 시간 | `96ms` |
| 평균 응답 시간 | `142.18ms` |

### 테스트 실행 {#run-test}

1. Proxy `config.yaml`에 `fake-openai-endpoint`를 추가하고 LiteLLM Proxy를 시작합니다.
LiteLLM은 부하 테스트에 사용할 수 있는 호스팅 `fake-openai-endpoint`를 제공합니다.

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["prometheus"] # Enterprise LiteLLM Only - use prometheus to get metrics on your load test
```

2. `uv add locust`

3. 로컬 머신에 `locustfile.py`라는 파일을 만듭니다. [여기](https://github.com/BerriAI/litellm/blob/main/.github/workflows/locustfile.py)에 있는 litellm 부하 테스트 내용을 복사하세요.

4. Locust를 시작합니다.
  2단계의 `locustfile.py`와 같은 디렉터리에서 `locust`를 실행하세요.

  ```shell
  locust -f locustfile.py --processes 4
  ```

5. Locust에서 부하 테스트를 실행합니다.

  `http://0.0.0.0:8089`의 Locust UI로 이동합니다.

  **사용자 수=1000, 증가 사용자 수=1000**으로 설정하고, Host에는 LiteLLM Proxy의 기본 URL을 입력합니다.

6. 예상 결과

  <Image img={require('../img/locust_load_test1.png')} />

## 부하 테스트 - 속도 제한이 있는 엔드포인트 {#rate-limited-load-test}

각각 10K RPM 할당량이 있는 LLM `deployment` 2개에 대해 부하 테스트를 실행합니다. 약 20K RPM이 표시될 것으로 예상합니다.

### 예상 성능 {#expected-performance-1}

- 1분 동안 20,000+개의 성공 응답이 표시될 것으로 예상합니다.
- 나머지 요청은 **엔드포인트가 LLM API 프로바이더의 10K RPM 할당량 제한을 초과하기 때문에 실패합니다.**

| 메트릭 | 값 |
|--------|-------|
| 1분 동안의 성공 응답 | 20,000+ |
| 초당 요청 수 | ~1170+ |
| 중앙값 응답 시간 | `70ms` |
| 평균 응답 시간 | `640.18ms` |

### 테스트 실행 {#run-test-1}

1. `config.yaml`에 `gemini-vision` `deployment` 2개를 추가합니다. 각 `deployment`는 10K RPM을 처리할 수 있습니다. (아래 `/v1/projects/bad-adroit-crow` 경로에 1000 RPM 속도 제한이 있는 테스트 엔드포인트를 설정했습니다.)

:::info

`model="gemini-vision"`이 포함된 모든 요청은 2개 `deployment`에 균등하게 부하 분산됩니다.

:::

```yaml
model_list:
  - model_name: gemini-vision
    litellm_params:
      model: vertex_ai/gemini-1.0-pro-vision-001
      api_base: https://exampleopenaiendpoint-production.up.railway.app/v1/projects/bad-adroit-crow-413218/locations/us-central1/publishers/google/models/gemini-1.0-pro-vision-001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: /etc/secrets/adroit_crow.json
  - model_name: gemini-vision
    litellm_params:
      model: vertex_ai/gemini-1.0-pro-vision-001
      api_base: https://exampleopenaiendpoint-production-c715.up.railway.app/v1/projects/bad-adroit-crow-413218/locations/us-central1/publishers/google/models/gemini-1.0-pro-vision-001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: /etc/secrets/adroit_crow.json

litellm_settings:
  callbacks: ["prometheus"] # Enterprise LiteLLM Only - use prometheus to get metrics on your load test
```

2. `uv add locust`

3. 로컬 머신에 `locustfile.py`라는 파일을 만듭니다. [여기](https://github.com/BerriAI/litellm/blob/main/.github/workflows/locustfile.py)에 있는 litellm 부하 테스트 내용을 복사하세요.

4. Locust를 시작합니다.
  2단계의 `locustfile.py`와 같은 디렉터리에서 `locust`를 실행하세요.

  ```shell
  locust -f locustfile.py --processes 4 -t 60
  ```

5. Locust에서 부하 테스트를 실행합니다.

  `http://0.0.0.0:8089`의 Locust UI로 이동하고 다음 설정을 사용합니다.

  <Image img={require('../img/locust_load_test2_setup.png')} />

6. 예상 결과
    - 1분 동안의 성공 응답 = 19,800 = (69415 - 49615)
    - 초당 요청 수 = 1170
    - 중앙값 응답 시간 = 70ms
    - 평균 응답 시간 = 640ms

  <Image img={require('../img/locust_load_test2.png')} />


## 부하 테스트 디버깅용 Prometheus 메트릭 {#prometheus-debug-metrics}

부하 테스트와 실패를 디버깅하려면 다음 [Prometheus 메트릭](./proxy/prometheus)을 사용하세요.

| 메트릭 이름          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_deployment_failure_responses`              | 특정 LLM `deployment`에서 실패한 LLM API 호출의 총 개수입니다. 레이블: `"requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias", "exception_status", "exception_class"` |
| `litellm_deployment_cooled_down`             | LiteLLM 부하 분산 로직에 의해 `deployment`가 대기 상태로 전환된 횟수입니다. 레이블: `"litellm_model_name", "model_id", "api_base", "api_provider", "exception_status"` |



## Locust 실행용 머신 사양 {#locust-machine-specs}

| 메트릭 | 값 |
|--------|-------|
| `locust --processes 4`  | 4|
| 부하 테스트 머신의 `vCPUs` | 2.0 vCPUs |
| 부하 테스트 머신의 `Memory` | 450 MB |
| 부하 테스트 머신의 `Replicas` | 1 |

## LiteLLM Proxy 실행용 머신 사양 {#proxy-machine-specs}

👉 1K+ RPS를 달성하려면 **LiteLLM Proxy의 Replicas 수=4**로 설정하세요.

| 서비스 | 사양 | CPU | 메모리 | 아키텍처 | 버전 |
| --- | --- | --- | --- | --- | --- | 
| 서버 | `t2.large`. | `2vCPUs` | `8GB` | `x86` |


## 테스트에 사용한 Locust 파일 {#locust-file}

```python
import os
import uuid
from locust import HttpUser, task, between

class MyUser(HttpUser):
    wait_time = between(0.5, 1)  # Random wait time between requests

    @task(100)
    def litellm_completion(self):
        # no cache hits with this
        payload = {
            "model": "fake-openai-endpoint",
            "messages": [{"role": "user", "content": f"{uuid.uuid4()} This is a test there will be no cache hits and we'll fill up the context" * 150 }],
            "user": "my-new-end-user-1"
        }
        response = self.client.post("chat/completions", json=payload)
        if response.status_code != 200:
            # log the errors in error.txt
            with open("error.txt", "a") as error_log:
                error_log.write(response.text + "\n")
    


    def on_start(self):
        self.api_key = os.getenv('API_KEY', 'sk-1234')
        self.client.headers.update({'Authorization': f'Bearer {self.api_key}'})
```
