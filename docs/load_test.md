import Image from '@theme/IdealImage';

# LiteLLM Proxy - Locust 부하 테스트 {#litellm-proxy---locust-load-test}

## LiteLLM Proxy Locust 부하 테스트 {#locust-load-test-litellm-proxy}

1. proxy `config.yaml`에 `fake-openai-endpoint`를 추가하고 litellm proxy를 시작합니다.

LiteLLM은 부하 테스트에 사용할 수 있는 무료 호스팅 `fake-openai-endpoint`를 제공합니다. [github.com/BerriAI/example_openai_endpoint](https://github.com/BerriAI/example_openai_endpoint)를 사용해 자체 fake OpenAI proxy server를 셀프 호스팅할 수도 있습니다.

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
```

2. `uv add locust`

3. 로컬 머신에 `locustfile.py`라는 파일을 만듭니다. [여기](https://github.com/BerriAI/litellm/blob/main/.github/workflows/locustfile.py)에 있는 litellm 부하 테스트 내용을 복사합니다.

4. locust 시작
  2단계의 `locustfile.py`와 같은 디렉터리에서 `locust`를 실행합니다.

  ```shell
  locust
  ```

  터미널 출력
  ```
  [2024-03-15 07:19:58,893] Starting web interface at http://0.0.0.0:8089
  [2024-03-15 07:19:58,898] Starting Locust 2.24.0
  ```

5. locust에서 부하 테스트 실행

  http://0.0.0.0:8089 의 locust UI로 이동합니다.

  Users=100, Ramp Up Users=10, Host=LiteLLM Proxy의 Base URL로 설정합니다.

  <Image img={require('../img/locust_load_test.png')} />

6. 예상 결과

  `/health/readiness`에 대해 다음 응답 시간이 표시될 것으로 예상합니다.
  Median → /health/readiness 는 `150ms`입니다.

  Avg →  /health/readiness 는 `219ms`입니다.

  <Image img={require('../img/litellm_load_test.png')} />
