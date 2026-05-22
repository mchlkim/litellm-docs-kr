# Grafana Pyroscope CPU 프로파일링 {#grafana-pyroscope-cpu-profiling}

LiteLLM proxy는 환경 변수로 활성화하면 지속적인 CPU profile을 [Grafana Pyroscope](https://grafana.com/docs/pyroscope/latest/)로 전송할 수 있습니다. 이 기능은 선택 사항이며 기본적으로 꺼져 있습니다.

## 빠른 시작 {#quick-start}

1. **선택적 dependency 설치**(Pyroscope를 활성화할 때만 필요):

   ```bash
   uv add pyroscope-io
   ```

   또는 proxy extra를 설치합니다.

   ```bash
   uv add "litellm[proxy]"
   ```

2. proxy를 시작하기 전에 **환경 변수 설정**:

   | 변수 | 필수 여부 | 설명 |
   |----------|----------|-------------|
   | `LITELLM_ENABLE_PYROSCOPE` | 예(활성화 시) | Pyroscope profiling을 활성화하려면 `true`로 설정합니다. |
   | `PYROSCOPE_APP_NAME` | 예(활성화된 경우) | Pyroscope UI에 표시되는 application name입니다. |
   | `PYROSCOPE_SERVER_ADDRESS` | 예(활성화된 경우) | Pyroscope server URL입니다(예: `http://localhost:4040`). |
   | `PYROSCOPE_SAMPLE_RATE` | 아니요 | Sample rate(integer)입니다. 설정하지 않으면 pyroscope-io library 기본값을 사용합니다. |

3. **프록시 시작**; proxy가 시작되면 profiling이 자동으로 시작됩니다.

   ```bash
   export LITELLM_ENABLE_PYROSCOPE=true
   export PYROSCOPE_APP_NAME=litellm-proxy
   export PYROSCOPE_SERVER_ADDRESS=http://localhost:4040
   litellm --config config.yaml
   ```

4. Pyroscope(또는 Grafana) UI에서 **profile 보기**를 열고 `PYROSCOPE_APP_NAME`을 선택합니다.

## 참고

- **선택적 dependency**: `pyroscope-io`는 선택적 dependency입니다. 설치되어 있지 않은 상태에서 `LITELLM_ENABLE_PYROSCOPE=true`이면 proxy는 warning log를 남기고 profiling 없이 계속 실행됩니다.
- **Platform 지원**: `pyroscope-io` package는 native extension을 사용하므로 모든 platform에서 사용할 수 있는 것은 아닙니다(예: Windows는 package에서 제외됨).
- **기타 설정**: 모든 proxy 환경 변수는 [설정 settings](/proxy/config_settings)를 참고하세요.
