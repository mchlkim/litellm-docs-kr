---
title: 릴리즈 노트 읽는 법
sidebar_label: 릴리즈 노트 읽는 법
---

# 릴리즈 노트 읽는 법

LiteLLM은 프로바이더, 모델, Proxy 기능, 보안 패치가 자주 바뀌는 프로젝트입니다. 운영 환경에서는 릴리즈 노트를 정기적으로 확인해야 합니다.

## 우선 확인할 항목

- 보안 패치
- 인증, virtual key, RBAC 변경
- DB migration 변경
- Docker image 변경
- provider별 breaking change
- 모델 가격 및 context window 변경
- Proxy config 옵션 변경
- 관리자 UI 변경
- 비용 추적과 로그 스키마 변경

## 운영 반영 전 체크리스트

1. 현재 운영 버전과 목표 버전 사이의 릴리즈 노트를 확인합니다.
2. DB migration이 필요한지 확인합니다.
3. config key 이름이나 기본값이 바뀌었는지 확인합니다.
4. 사용 중인 provider 관련 변경 사항을 확인합니다.
5. Docker image tag 정책을 확인합니다.
6. staging 환경에서 health check, key 발급, 모델 호출, 비용 로그를 검증합니다.
7. rollback 가능한 이미지와 config를 보관합니다.

## 릴리즈 노트 위치

- [릴리즈 노트](/release_notes)
- [공식 GitHub 저장소](https://github.com/BerriAI/litellm)
- [공식 문서 사이트](https://docs.litellm.ai/docs/)

## 한국어 문서의 역할

이 로컬 한국어 문서는 빠른 이해와 운영 판단을 돕기 위한 문서입니다. 버전별 세부 변경, 최신 보안 공지, 새 모델 지원 여부는 반드시 공식 릴리즈 노트와 GitHub 원문을 함께 확인합니다.
