# 사용자 온보딩 가이드 {#user-onboarding-guide}

관리자가 LiteLLM proxy 인스턴스에 사용자를 온보딩하고, 사용자가 API key로 시작할 수 있도록 돕는 단계별 가이드입니다.

---

## 관리자용 {#for-administrators}

### 1단계: 사용자 계정 생성 {#step-1-create-a-user-account}

관리자 UI 또는 API를 사용해 사용자 계정을 생성할 수 있습니다.

#### 관리자 UI
- (`/ui` endpoint)로 이동합니다.
- Internal Users 섹션으로 이동합니다.
- "Add User"를 클릭하고 필수 정보를 입력합니다.

#### API
```bash
curl -X POST http://localhost:4000/user/new \
  -H "Authorization: Bearer <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"user_email": "user@example.com"}'
```

---

### 2단계: 액세스 및 권한 부여 {#step-2-grant-access--permissions}

- 사용자를 팀에 배정합니다(선택 사항).
- 필요에 따라 예산, 속도 제한, 허용 모델을 설정합니다.
- 사용자용 API key를 생성합니다(UI 또는 API 사용).

#### **API key 생성(API 예제)** {#generate-api-key-api-example}
```bash
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "<user-id>", "max_budget": 100}'
```

---

## 최종 사용자용 {#for-end-users}

### 3단계: API key 검증 {#step-3-validate-your-api-key}

LLM 호출을 수행하기 전에 `/v1/models` endpoint를 호출해 key가 정상 작동하는지 검증합니다.

```bash
curl -X GET http://localhost:4000/v1/models \
  -H "Authorization: Bearer <your-api-key>"
```
- key가 유효하면 사용 가능한 모델 목록이 반환됩니다.
- 유효하지 않으면 401 오류가 반환됩니다.

---

### 4단계: Hello World - 첫 LLM 호출 수행 {#step-4-hello-world---make-your-first-llm-call}

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 문제 해결
- 401 오류가 발생하면 key가 활성 상태이고 요청한 모델에 액세스할 수 있는지 관리자에게 확인하세요.
- LLM token을 소비하지 않고 key가 유효한지 빠르게 확인하려면 `/v1/models` endpoint를 사용하세요.

---

## 함께 보기 {#see-also}
- [Proxy 빠른 시작](./quick_start.md)
- [사용자 관리](./users.md)
- [Key 관리](./virtual_keys.md)
