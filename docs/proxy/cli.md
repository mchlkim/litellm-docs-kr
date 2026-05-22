# CLI 인자

이 페이지는 LiteLLM 프록시 서버에서 사용할 수 있는 모든 command-line interface(CLI) 인자를 정리합니다.

## Server 설정

### --host
   - **Default:** `'0.0.0.0'`
   - 서버가 수신할 호스트입니다.
   - **사용법:** 
     ```shell
     litellm --host 127.0.0.1
     ```
   - **사용법 - 환경 변수 설정:** `HOST`
    ```shell
    export HOST=127.0.0.1
    litellm
    ```

### --port
   - **Default:** `4000`
   - 서버를 바인딩할 포트입니다.
   - **사용법:** 
     ```shell
     litellm --port 8080
     ```
  - **사용법 - 환경 변수 설정:** `PORT`
    ```shell
    export PORT=8080
    litellm
    ```

### --num_workers
   - **Default:** 시스템의 논리 CPU 수. 확인할 수 없으면 `4`
   - 시작할 uvicorn / gunicorn worker 수입니다.
   - **사용법:** 
     ```shell
     litellm --num_workers 4
     ```
  - **사용법 - 환경 변수 설정:** `NUM_WORKERS`
    ```shell
    export NUM_WORKERS=4
    litellm
    ```

### --config
   - **짧은 형식:** `-c`
   - **Default:** `None`
   - 프록시 설정 파일 경로입니다(예: config.yaml).
   - **사용법:** 
     ```shell
     litellm --config path/to/config.yaml
     ```

### --log_config
   - **Default:** `None`
   - **Type:** `str`
   - uvicorn 로깅 설정 파일 경로입니다.
   - **사용법:** 
     ```shell
     litellm --log_config path/to/log_config.conf
     ```

### --keepalive_timeout
   - **Default:** `None`
   - **Type:** `int`
   - uvicorn keepalive timeout을 초 단위로 설정합니다(uvicorn `timeout_keep_alive` 파라미터).
   - **사용법:** 
     ```shell
     litellm --keepalive_timeout 30
     ```
  - **사용법 - 환경 변수 설정:** `KEEPALIVE_TIMEOUT`
    ```shell
    export KEEPALIVE_TIMEOUT=30
    litellm
    ```

### --max_requests_before_restart
   - **Default:** `None`
   - **Type:** `int`
   - 지정한 요청 수 이후 worker를 재시작합니다. 시간이 지나며 메모리가 증가하는 문제를 완화하는 데 유용합니다.
   - uvicorn에서는 `limit_max_requests`에 매핑됩니다.
   - gunicorn에서는 `max_requests`에 매핑됩니다.
   - **사용법:** 
     ```shell
     litellm --max_requests_before_restart 10000
     ```
  - **사용법 - 환경 변수 설정:** `MAX_REQUESTS_BEFORE_RESTART`
    ```shell
    export MAX_REQUESTS_BEFORE_RESTART=10000
    litellm
    ```

## 서버 백엔드 옵션

### --run_gunicorn
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - uvicorn 대신 gunicorn으로 프록시를 시작합니다. 프로덕션에서 여러 worker를 관리할 때 더 적합합니다.
   - **사용법:** 
     ```shell
     litellm --run_gunicorn
     ```

### --run_hypercorn
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - uvicorn 대신 hypercorn으로 프록시를 시작합니다. HTTP/2를 지원합니다.
   - **사용법:** 
     ```shell
     litellm --run_hypercorn
     ```

### --skip_server_startup
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 설정 후 서버 시작을 건너뜁니다. 데이터베이스 마이그레이션만 수행할 때 유용합니다.
   - **사용법:** 
     ```shell
     litellm --skip_server_startup
     ```

## SSL/TLS 설정

### --ssl_keyfile_path
   - **Default:** `None`
   - **Type:** `str`
   - SSL keyfile 경로입니다. 프록시 시작 시 SSL 인증서를 제공하려면 사용합니다.
   - **사용법:** 
     ```shell
     litellm --ssl_keyfile_path /path/to/key.pem --ssl_certfile_path /path/to/cert.pem
     ```
  - **사용법 - 환경 변수 설정:** `SSL_KEYFILE_PATH`
    ```shell
    export SSL_KEYFILE_PATH=/path/to/key.pem
    litellm
    ```

### --ssl_certfile_path
   - **Default:** `None`
   - **Type:** `str`
   - SSL certfile 경로입니다. 프록시 시작 시 SSL 인증서를 제공하려면 사용합니다.
   - **사용법:** 
     ```shell
     litellm --ssl_certfile_path /path/to/cert.pem --ssl_keyfile_path /path/to/key.pem
     ```
  - **사용법 - 환경 변수 설정:** `SSL_CERTFILE_PATH`
    ```shell
    export SSL_CERTFILE_PATH=/path/to/cert.pem
    litellm
    ```

### --ciphers
   - **Default:** `None`
   - **Type:** `str`
   - SSL 설정에 사용할 cipher입니다. `--run_hypercorn`과 함께 사용할 때만 적용됩니다.
   - **사용법:** 
     ```shell
     litellm --run_hypercorn --ssl_keyfile_path /path/to/key.pem --ssl_certfile_path /path/to/cert.pem --ciphers "ECDHE+AESGCM"
     ```

## Model 설정

### --model or -m
   - **Default:** `None`
   - LiteLLM에 전달할 모델 이름입니다.
   - **사용법:** 
     ```shell
     litellm --model gpt-3.5-turbo
     ```

### --alias
   - **Default:** `None`
   - 사용자가 읽기 쉬운 모델 별칭입니다. 예를 들어 LiteLLM 모델 이름 `"huggingface/codellama/CodeLlama-7b-Instruct-hf"`에 `"codellama"`처럼 더 친숙한 이름을 붙일 때 사용합니다.
   - **사용법:** 
     ```shell
     litellm --alias my-gpt-model
     ```

### --api_base
   - **Default:** `None`
   - LiteLLM이 호출할 모델의 API base입니다.
   - **사용법:** 
     ```shell
     litellm --model huggingface/tinyllama --api_base https://k58ory32yinf1ly0.us-east-1.aws.endpoints.huggingface.cloud
     ```

### --api_version
   - **Default:** `2024-07-01-preview`
   - Azure 서비스에 사용할 API 버전을 지정합니다.
   - **사용법:** 
     ```shell
     litellm --model azure/gpt-deployment --api_version 2023-08-01 --api_base https://<your api base>"
     ```

### --headers
   - **Default:** `None`
   - API 호출에 사용할 헤더입니다(JSON 문자열).
   - **사용법:** 
     ```shell
     litellm --model my-model --headers '{"Authorization": "Bearer token"}'
     ```

### --add_key
   - **Default:** `None`
   - 모델 설정에 키를 추가합니다.
   - **사용법:** 
     ```shell
     litellm --add_key my-api-key
     ```

### --save
   - **Type:** `bool` (Flag)
   - 모델별 설정을 저장합니다.
   - **사용법:** 
     ```shell
     litellm --model gpt-3.5-turbo --save
     ```

## 모델 파라미터

### --temperature
   - **Default:** `None`
   - **Type:** `float`
   - 모델의 temperature를 설정합니다.
   - **사용법:** 
     ```shell
     litellm --temperature 0.7
     ```

### --max_tokens
   - **Default:** `None`
   - **Type:** `int`
   - 모델 출력의 최대 토큰 수를 설정합니다.
   - **사용법:** 
     ```shell
     litellm --max_tokens 50
     ```

### --request_timeout
   - **Default:** `None`
   - **Type:** `int`
   - completion 호출의 timeout을 초 단위로 설정합니다.
   - **사용법:** 
     ```shell
     litellm --request_timeout 300
     ```

### --max_budget
   - **Default:** `None`
   - **Type:** `float`
   - API 호출의 최대 예산을 설정합니다. OpenAI, TogetherAI, Anthropic 같은 호스팅 모델에 동작합니다.
   - **사용법:** 
     ```shell
     litellm --max_budget 100.0
     ```

### --drop_params
   - **Type:** `bool` (Flag)
   - 매핑되지 않은 파라미터를 제거합니다.
   - **사용법:** 
     ```shell
     litellm --drop_params
     ```

### --add_function_to_prompt
   - **Type:** `bool` (Flag)
   - 함수가 전달되었지만 지원되지 않으면 prompt의 일부로 전달합니다.
   - **사용법:** 
     ```shell
     litellm --add_function_to_prompt
     ```

## Database 설정

### --iam_token_db_auth
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 비밀번호 대신 IAM 토큰 인증으로 RDS 데이터베이스에 연결합니다. IAM 데이터베이스 인증을 사용하도록 구성된 AWS RDS 인스턴스에 유용합니다.
   - 활성화하면 LiteLLM은 데이터베이스 연결용 IAM 인증 토큰을 생성합니다.
   - **필수 환경 변수:**
     - `DATABASE_HOST` - RDS 데이터베이스 호스트
     - `DATABASE_PORT` - 데이터베이스 포트
     - `DATABASE_USER` - 데이터베이스 사용자
     - `DATABASE_NAME` - 데이터베이스 이름
     - `DATABASE_SCHEMA`(선택 사항) - 데이터베이스 스키마
   - **사용법:** 
     ```shell
     litellm --iam_token_db_auth
     ```
   - **사용법 - 환경 변수 설정:** `IAM_TOKEN_DB_AUTH`
     ```shell
     export IAM_TOKEN_DB_AUTH=True
     export DATABASE_HOST=mydb.us-east-1.rds.amazonaws.com
     export DATABASE_PORT=5432
     export DATABASE_USER=mydbuser
     export DATABASE_NAME=mydb
     litellm
     ```

### --use_prisma_db_push
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 데이터베이스 스키마 업데이트에 `prisma migrate` 대신 `prisma db push`를 사용합니다. 마이그레이션 파일을 만들지 않고 데이터베이스 스키마를 빠르게 동기화할 때 유용합니다.
   - **사용법:** 
     ```shell
     litellm --use_prisma_db_push
     ```

## 디버깅

### --debug
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 입력에 대한 디버깅 모드를 활성화합니다.
   - **사용법:** 
     ```shell
     litellm --debug
     ```
  - **사용법 - 환경 변수 설정:** `DEBUG`
    ```shell
    export DEBUG=True
    litellm
    ```

### --detailed_debug
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 자세한 debug 로그를 보기 위해 상세 디버깅 모드를 활성화합니다.
   - **사용법:** 
     ```shell
     litellm --detailed_debug
     ```
  - **사용법 - 환경 변수 설정:** `DETAILED_DEBUG`
    ```shell
    export DETAILED_DEBUG=True
    litellm
    ```

### --local
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 로컬 디버깅 용도입니다.
   - **사용법:** 
     ```shell
     litellm --local
     ```

## 테스트 및 상태 확인

### --test
   - **Type:** `bool` (Flag)
   - 테스트 요청을 보낼 프록시 chat completions URL입니다.
   - **사용법:** 
     ```shell
     litellm --test
     ```

### --test_async
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 비동기 엔드포인트 `/queue/requests`와 `/queue/response`를 호출합니다.
   - **사용법:** 
     ```shell
     litellm --test_async
     ```

### --num_requests
   - **Default:** `10`
   - **Type:** `int`
   - 비동기 엔드포인트에 보낼 요청 수입니다(`--test_async`와 함께 사용).
   - **사용법:** 
     ```shell
     litellm --test_async --num_requests 100
     ```

### --health
   - **Type:** `bool` (Flag)
   - config.yaml의 모든 모델에 대해 상태 확인을 실행합니다.
   - **사용법:** 
     ```shell
     litellm --health
     ```

## 기타 옵션

### --version
   - **짧은 형식:** `-v`
   - **Type:** `bool` (Flag)
   - LiteLLM 버전을 출력하고 종료합니다.
   - **사용법:** 
     ```shell
     litellm --version
     ```

### --telemetry
   - **Default:** `True`
   - **Type:** `bool`
   - 이 기능 사용량 추적에 도움을 줍니다. 개인정보 보호가 필요하면 끄세요.
   - **사용법:** 
     ```shell
     litellm --telemetry False
     ```

### --use_queue
   - **Default:** `False`
   - **Type:** `bool` (Flag)
   - 비동기 엔드포인트에 celery worker를 사용합니다.
   - **사용법:** 
     ```shell
     litellm --use_queue
     ```
