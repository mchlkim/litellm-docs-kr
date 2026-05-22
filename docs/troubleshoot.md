# 이슈 보고

이슈를 보고할 때는 아래 정보를 가능한 한 많이 포함해 주세요. 특히 운영 환경에서는 트리거를 알 수 없는 경우가 있으므로 모든 항목을 제공하지 못해도 괜찮습니다. 대부분의 정보를 공유하면 더 정확하게 도와드릴 수 있습니다.

## 1. LiteLLM 설정 파일

`config.yaml` 파일을 공유해 주세요. API 키 같은 민감 정보는 제거하세요. worker 수가 config에 없다면 함께 알려 주세요.

## 2. 초기화 명령

LiteLLM을 시작할 때 사용한 명령을 포함해 주세요(예: `litellm --config config.yaml --num_workers 8 --detailed_debug`).

## 3. LiteLLM Version

- 현재 버전
- 이슈가 처음 발생한 버전(다른 경우)
- 업그레이드했다면 변경 전/후 버전

## 4. 환경 변수

config에 없는 비민감 환경 변수를 포함해 주세요(예: `NUM_WORKERS`, `LITELLM_LOG`, `LITELLM_MODE`). 비밀번호나 API 키는 포함하지 마세요.

## 5. 서버 사양

CPU 코어 수, RAM, OS, 인스턴스/replica 수 등을 알려 주세요.

## 6. Database와 Redis 사용 여부

- **Database:** database를 사용 중인가요? (`DATABASE_URL` 설정 여부), database 유형과 버전을 알려 주세요.
- **Redis:** Redis를 사용 중인가요? Redis 버전과 구성 유형(Standalone/Cluster/Sentinel)을 알려 주세요.

## 7. Endpoints

문제가 발생한 엔드포인트를 알려 주세요(예: `/chat/completions`, `/embeddings`).

## 8. 요청 예제

문제를 일으킨 실제에 가까운 요청 예제를 공유해 주세요. 기대 응답과 실제 응답, 오류 메시지도 함께 포함해 주세요.

## 9. 오류 로그, Stack Trace, Metrics

진단에 도움이 될 수 있는 전체 오류 로그, stack trace, 서비스 metrics 이미지(CPU, memory, request rate 등)를 공유해 주세요.

---

## 지원 채널

[Schedule Demo 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)

[커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
[커뮤니티 Slack 💭](https://www.litellm.ai/support)


이메일 ✉️ ishaan@berri.ai / krrish@berri.ai

[![Chat on WhatsApp](https://img.shields.io/static/v1?label=Chat%20on&message=WhatsApp&color=success&logo=WhatsApp&style=flat-square)](https://wa.link/huol9n) [![Chat on Discord](https://img.shields.io/static/v1?label=Chat%20on&message=Discord&color=blue&logo=Discord&style=flat-square)](https://discord.gg/wuPM9dRgDw)
