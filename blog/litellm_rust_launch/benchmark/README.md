# LiteLLM Rust 게이트웨이 벤치마크

*Migrating LiteLLM to Rust* 블로그 포스트의 숫자를 재현하는 허브.
같은 로컬 모크 업스트림을 대상으로, 얇은 Rust 게이트웨이 대비 요청별 게이트웨이 전달 오버헤드를 측정합니다.

## 무엇을 측정하는가

- 요청당 오버헤드(중간값), Rust 게이트웨이 vs LiteLLM(Python), 10개의 동시 클라이언트가 로컬 모크 업스트림에 대해 실행 시
- Rust 측은 압축된 axum 전달 게이트웨이이며, 가벼운 요청 변환만 수행합니다.
- Python 측은 `litellm.acompletion` uvicorn을 통해 제공되며(프록시가 사용하는 동일한 ASGI 스택), LiteLLM의 실제 변환 및 비용 경로를 실행합니다.

## 파일들
 /no_think

- `main.rs` / `Cargo.toml` — 모의 상류 서버, Rust 게이트웨이, 그리고 마이크로초 해상도 로드 클라이언트. 모드: `mock`, `gateway`, `bench <url> <total> <conc>`.
- `llm_app.py` — uvicorn을 통해 LiteLLM(Python) 요청 경로.
- `orchestrate_compare.py` — 세 가지 모두 시작하고, 로드 실행, 중앙값 및 p95 오버헤드를 출력하며, 최대 RSS을 표시합니다.

## 실행

```bash
cargo build --release
# Use a Python that has litellm + fastapi + uvicorn installed:
LITELLM_PYTHON=/path/to/venv/bin/python python3 orchestrate_compare.py
```

## 결과 (참조 실행)

| | 요청당 오버헤드 (중간값) |
|---|---|
| Rust gateway | ~0.05ms |
| LiteLLM (Python) | ~7.5ms |

숫자는 기계에 따라 다를 수 있지만, 방법론이 이동합니다. 두 런타임 모두 동일한 업스트림과 페이로드를 사용하며, 유일한 변수는 파이썬 대신 러스트입니다.
