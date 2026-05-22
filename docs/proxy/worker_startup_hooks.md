# Worker Startup Hook 설정 {#worker-startup-hook}

`LITELLM_WORKER_STARTUP_HOOKS`를 사용하면 프록시 시작 중 **각 워커 프로세스**에서 사용자 지정 초기화 함수를 실행할 수 있습니다. 이는 [gflags](https://github.com/google/python-gflags)처럼 프로세스별 초기화가 필요한 라이브러리와 함께 multi-worker 배포(`--num_workers > 1`)를 사용할 때 필수적입니다.

## 문제

LiteLLM 프록시를 여러 워커로 실행하는 경우:

```bash
litellm --config config.yaml --num_workers 4
```

각 워커는 uvicorn 또는 gunicorn이 생성하는 **별도 프로세스**입니다. master process에서(`run_server()` 이전) 초기화된 in-process 상태는 워커 프로세스에서 **사용할 수 없습니다**. 여기에는 다음이 포함됩니다.

- [python-gflags](https://github.com/google/python-gflags) (`gflags.FLAGS`)
- [absl-py flags](https://abseil.io/docs/python/guides/flags) (`absl.flags.FLAGS`)
- 사용자 지정 singleton registry 또는 connection pool
- 명시적 초기화가 필요한 모듈 수준 상태

## 사용법

`LITELLM_WORKER_STARTUP_HOOKS` 환경 변수를 쉼표로 구분된 `module.path:function_name` callable 목록으로 설정합니다.

```bash
export LITELLM_WORKER_STARTUP_HOOKS="my_module:my_init_function"
```

각 hook은 워커 시작 lifecycle의 **초기 단계**에서 호출됩니다. config loading, database setup 또는 request handling보다 먼저 실행됩니다. sync 함수와 async 함수가 모두 지원됩니다.

## 예제: gflags 초기화

### 1. wrapper module 정의

```python title="my_litellm_wrapper.py"
import gflags
import json
import os
import sys
from typing import Optional, List, Any


def init_gflags(
    usage: Optional[Any] = None,
    raw_args: Optional[List[str]] = None,
    known_only: bool = False,
) -> List[str]:
    """Initialize gflags from command-line arguments."""
    try:
        gflags.FLAGS.set_gnu_getopt(True)
        if raw_args is None:
            raw_args = sys.argv
        argv = gflags.FLAGS(raw_args, known_only=known_only)
    except gflags.Error as e:
        if usage is None:
            print("%s\nUsage: %s ARGS\n%s" % (e, sys.argv[0], gflags.FLAGS))
        else:
            print(usage % dict(cmd=sys.argv[0], flags=gflags.FLAGS))
        sys.exit(1)
    return argv


def init_gflags_for_worker():
    """Re-initialize gflags in each worker process.

    Reads the original sys.argv from the GFLAGS_ARGV env var
    (set by the master process before starting the proxy).
    """
    raw_args = json.loads(os.environ.get("GFLAGS_ARGV", "[]")) or sys.argv
    init_gflags(raw_args=raw_args, known_only=True)
```

### 2. 프록시 시작

```python title="start_proxy.py"
import json
import os
import sys

from my_litellm_wrapper import init_gflags

# Store sys.argv so workers can re-parse the same flags
os.environ["GFLAGS_ARGV"] = json.dumps(sys.argv)

# Tell LiteLLM to call our hook in each worker
os.environ["LITELLM_WORKER_STARTUP_HOOKS"] = "my_litellm_wrapper:init_gflags_for_worker"

# Initialize gflags in the master process
init_gflags()

# Start the proxy (programmatic invocation)
from litellm.proxy.proxy_cli import run_server

run_server(
    ["--config", "config.yaml", "--num_workers", "4"],
    standalone_mode=False,
)
```

또는 shell을 통해 실행합니다.

```bash
export GFLAGS_ARGV='["my_app", "--my_flag=value", "--batch_size=32"]'
export LITELLM_WORKER_STARTUP_HOOKS="my_litellm_wrapper:init_gflags_for_worker"

litellm --config config.yaml --num_workers 4
```

## 작동 방식

```
Master Process                          Worker Process (×N)
─────────────────                       ──────────────────────
1. init_gflags()                        3. proxy_startup_event():
2. run_server()                            → Read LITELLM_WORKER_STARTUP_HOOKS
   → sets env vars                         → Import & call each hook
   → uvicorn.run(workers=N)                  (gflags.FLAGS re-initialized ✓)
   → spawns workers ──────────────────►    → Continue with config/DB setup
                                           → Ready to serve requests
```

- Hook은 config loading, database connection 또는 기타 초기화보다 먼저 `proxy_startup_event`(FastAPI lifespan)의 **가장 처음**에 실행됩니다.
- master process에서 설정한 환경 변수는 워커 프로세스에 **상속**됩니다(표준 Unix fork/spawn 동작).
- hook이 **exception을 발생시키면** worker 시작에 실패합니다. 이는 의도된 동작입니다. 초기화 누락(예: 초기화되지 않은 gflags)은 downstream error를 일으키기 때문입니다.

## 여러 Hook

여러 hook은 쉼표로 구분합니다.

```bash
export LITELLM_WORKER_STARTUP_HOOKS="my_module:init_gflags,my_module:init_metrics,my_module:init_connections"
```

Hook은 왼쪽에서 오른쪽으로 **순서대로** 실행됩니다.

## Async Hook

async 함수도 지원됩니다. 자동으로 await됩니다.

```python
async def init_async_connections():
    """Example async hook for initializing async resources."""
    await setup_async_connection_pool()
```

```bash
export LITELLM_WORKER_STARTUP_HOOKS="my_module:init_async_connections"
```

## 참조

| 환경 변수 | 설명 |
|---|---|
| `LITELLM_WORKER_STARTUP_HOOKS` | startup 시 각 worker에서 실행할 쉼표로 구분된 `module.path:function_name` callable |

hook 형식은 표준 Python entry point syntax인 `module.path:function_name`을 따릅니다. 여기서 `module.path`는 점으로 구분된 Python import path이고, `function_name`은 해당 module 안의 callable 이름입니다.
