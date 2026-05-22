---
title: 릴리즈 노트
sidebar_label: 개요
slug: /
---

# 릴리즈 노트 {#release-notes}

LiteLLM은 신규 프로바이더 지원, 성능 개선, 엔터프라이즈 기능을 포함한 릴리즈를 정기적으로 제공합니다. 전체 릴리즈는 사이드바에서 확인할 수 있습니다.

## 최신 릴리즈 {#latest-release}

### [v1.83.14 — GPT-5.5, Prompt Compression 및 Memory API](/litellm-docs-kr/release_notes/v1.83.14/v1-83-14)

_April 27, 2026_

GPT-5.5 / GPT-5.5 Pro 당일 지원, 서버 측 Prompt Compression 콜백, `/v1/memory` CRUD 엔드포인트, LLM-as-a-Judge 가드레일, MCP OAuth 강화, 멤버별 팀 예산을 포함합니다.

---

## 최신 릴리즈 후보 {#latest-release-candidate}

### [v1.84.0-rc.1 — 신뢰성 강화 및 multi-pod 예산 정확도 개선](/litellm-docs-kr/release_notes/v1.84.0-rc.1/v1-84-0-rc-1)

_May 5, 2026_

Pass-through 엔드포인트 기본 인증, multi-pod 예산 집행 정확도, non-blocking Prisma DB 재연결, lazy-loaded router를 통한 약 700 MB 메모리 절감, 영속적인 agent workflow 실행 추적을 포함합니다. 운영 배포를 업그레이드하기 전에는 **중요 동작 변경 사항** 섹션을 먼저 읽으세요.

---

## 최근 릴리즈 {#recent-releases}

| 버전                                | 날짜         | 주요 내용                                                  |
| ----------------------------------- | ------------ | ---------------------------------------------------------- |
| [v1.83.14](/litellm-docs-kr/release_notes/v1.83.14/v1-83-14) | Apr 27, 2026 | GPT-5.5, Prompt Compression 및 Memory API                  |
| [v1.83.10](/litellm-docs-kr/release_notes/v1.83.10/v1-83-10) | Apr 27, 2026 | Claude Opus 4.7, Prompt Compression 및 Multi-Window Budgets |
| [v1.82.3](/litellm-docs-kr/release_notes/v1.82.3/v1-82-3)   | Mar 16, 2026 | Nebius AI, gpt-5.4, Gemini 3.x, FLUX Kontext 및 신규 모델 116개 |
| [v1.82.0](/litellm-docs-kr/release_notes/v1.82.0/v1-82-0)   | Feb 28, 2026 | Realtime 가드레일, Projects Management 및 성능 최적화 10개 이상 |
| [v1.81.14](/litellm-docs-kr/release_notes/v1.81.14/v1-81-14) | Feb 21, 2026 | 새로운 Gateway Level 가드레일 및 Compliance Playground       |
| [v1.81.12](/litellm-docs-kr/release_notes/v1.81.12/v1-81-12) | Feb 14, 2026 | Guardrail Policy Templates 및 Action Builder                |
| [v1.81.9](/litellm-docs-kr/release_notes/v1.81.9/v1-81-9)   | Feb 7, 2026  | 인터넷에 노출되는 MCP Servers 제어                         |
| [v1.81.6](/litellm-docs-kr/release_notes/v1.81.6/v1-81-6)   | Jan 31, 2026 | 로그 v2 및 Tool Call Tracing                               |
| [v1.81.3](/litellm-docs-kr/release_notes/v1.81.3/v1-81-3)   | Jan 26, 2026 | 성능 개선 - CPU 사용량 25% 감소                            |
| [v1.81.0](/litellm-docs-kr/release_notes/v1.81.0/v1-81-0)          | Jan 18, 2026 | Claude Code - 모든 프로바이더에서 Web Search 지원          |
| [v1.80.15](/litellm-docs-kr/release_notes/v1.80.15/v1-80-15)       | Jan 10, 2026 | Manus API 지원                                             |
| [v1.80.8](/litellm-docs-kr/release_notes/v1.80.8-stable/v1-80-8)   | Dec 6, 2025  | A2A Agent Gateway 도입                                     |
| [v1.80.5](/litellm-docs-kr/release_notes/v1.80.5-stable/v1-80-5)   | Nov 22, 2025 | Gemini 3.0 지원                                            |
| [v1.80.0](/litellm-docs-kr/release_notes/v1.80.0-stable/v1-80-0)   | Nov 15, 2025 | Agent Hub 도입: Agents 등록, 게시 및 공유                  |
| [v1.79.3](/litellm-docs-kr/release_notes/v1.79.3-stable/v1-79-3)   | Nov 8, 2025  | AI Gateway 내장 가드레일                                   |
| [v1.79.0](/litellm-docs-kr/release_notes/v1.79.0-stable/v1-79-0)   | Oct 26, 2025 | Search APIs 지원                                           |
| [v1.78.5](/litellm-docs-kr/release_notes/v1.78.5-stable/v1-78-5)   | Oct 18, 2025 | 네이티브 OCR 지원                                          |
| [v1.78.0](/litellm-docs-kr/release_notes/v1.78.0-stable/v1-78-0)   | Oct 11, 2025 | MCP Gateway: 팀과 키별 Tool Access 제어                    |
| [v1.77.7](/litellm-docs-kr/release_notes/v1.77.7-stable/v1-77-7)   | Oct 4, 2025  | 중앙값 지연 시간 2.9배 감소                                |
| [v1.77.5](/litellm-docs-kr/release_notes/v1.77.5-stable/v1-77-5)   | Sep 29, 2025 | MCP OAuth 2.0 지원                                         |
| [v1.77.3](/litellm-docs-kr/release_notes/v1.77.3-stable/v1-77-3)   | Sep 21, 2025 | 우선순위 기반 Rate Limiting                                |

---

## 업데이트 확인 {#stay-updated}

- **GitHub**: 릴리즈 알림은 [BerriAI/litellm](https://github.com/BerriAI/litellm) 저장소를 구독해 확인하세요.
- **Discord**: 공지는 [커뮤니티](https://discord.com/invite/wuPM9dRgDw)에서 확인할 수 있습니다.
- **Twitter**: [@LiteLLM](https://twitter.com/LiteLLM)을 팔로우하세요.

전체 릴리즈 기록은 사이드바에서 탐색할 수 있습니다.
