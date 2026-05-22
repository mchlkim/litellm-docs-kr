
# Harbor

[Harbor](https://github.com/laude-institute/harbor)는 Terminal-Bench 제작진이 만든 프레임워크로, 에이전트와 언어 모델을 평가하고 최적화하는 데 사용됩니다. LiteLLM을 사용해 100개 이상의 LLM provider를 호출합니다.

```bash
# Install
uv add harbor

# Run a benchmark with any LiteLLM-supported model
harbor run --dataset terminal-bench@2.0 \
   --agent claude-code \
   --model anthropic/claude-opus-4-1 \
   --n-concurrent 4
```

주요 기능:
- Claude Code, OpenHands, Codex CLI 같은 에이전트 평가
- 벤치마크와 환경 빌드 및 공유
- cloud provider(Daytona, Modal) 전반에서 실험 병렬 실행
- RL 최적화를 위한 rollout 생성

- [GitHub](https://github.com/laude-institute/harbor)
- [문서](https://harborframework.com/docs)
