import Image from '@theme/IdealImage';

# UI 로고 사용자 지정

기본 로고를 회사 브랜딩에 맞는 로고로 교체해 LiteLLM 대시보드를 맞춤 설정할 수 있습니다. 사용자 지정 로고는 UI 또는 API를 통해 설정할 수 있습니다.

## UI에서 설정

### 1. 설정으로 이동

사이드바에서 **Settings** 아이콘을 클릭합니다.

![설정으로 이동](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/57a15404-51f7-481e-9db2-cea94566d3ce/ascreenshot_7a348567c839448bb806fd71cf4abca0_text_export.jpeg)

### 2. UI 테마 설정 열기

설정 메뉴에서 **UI Theme**를 클릭합니다.

![UI 테마 열기](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/30663fe1-9f78-4496-96d4-c53513cbaf82/ascreenshot_ac1eb59eda0e423fbd0e7d3a6cabd4c7_text_export.jpeg)

### 3. Logo URL 필드 클릭

편집을 시작하려면 **Logo URL** 텍스트 필드를 클릭합니다.

![Logo URL 필드 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/069e8412-8ec1-4d36-ba38-6b2e2858a45a/ascreenshot_8fc7fb4a3af74815bc1b69a8554bc110_text_export.jpeg)

### 4. 로고 이미지 찾기

새 브라우저 탭을 열고 사용할 로고 이미지를 찾습니다. 예를 들어 Google Images에서 회사 로고를 검색할 수 있습니다.

![로고 이미지 찾기](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/d9b55dac-bc4e-4728-b422-4afbc21f9034/ascreenshot_2a805f39c83d4b5e95f43495a6ea4e79_text_export.jpeg)

### 5. 로고 이미지에서 오른쪽 클릭

로고로 사용할 이미지를 오른쪽 클릭합니다.

![이미지 오른쪽 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/9d42d13e-6028-4710-acb2-c6af04a855c7/ascreenshot_0f21f29ba0e44132afe483a4b88e8b70_text_export.jpeg)

### 6. 이미지 주소 복사

컨텍스트 메뉴에서 **Copy Image Address**를 선택해 URL을 복사합니다.

![이미지 주소 복사](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/c25637be-383a-498b-ad11-eb1761d52757/ascreenshot_b237ee800979462189a02c1e1942ebf1_text_export.jpeg)

### 7. LiteLLM으로 다시 전환

LiteLLM UI 탭으로 돌아갑니다. 예를 들어 **Cmd + Left**를 누르거나 해당 탭을 클릭합니다.

![다시 전환](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/f0647856-679c-4591-9ff7-7fd3cfbc70b4/ascreenshot_3ce46dae64c94891ac0983f5ed8f085a_text_export.jpeg)

### 8. Logo URL 붙여넣기

복사한 이미지 URL을 **Cmd + V**로 **Logo URL** 필드에 붙여넣습니다.

![URL 붙여넣기](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/54dd30d9-7a88-41e8-a580-a6acf707c7fa/ascreenshot_8a772218ac0743d9ae8ffd3311eccd5a_text_export.jpeg)

### 9. 변경 사항 저장

새 로고를 적용하려면 **Save Changes**를 클릭합니다.

![변경 사항 저장](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/4baf6494-d146-4600-b6f2-ef667338d580/ascreenshot_722cbcd568ec4267af5122b3958bb248_text_export.jpeg)

이제 사용자 지정 로고가 LiteLLM 대시보드 사이드바와 로그인 페이지에 표시됩니다.

## API에서 설정

### 사용자 지정 로고 설정

```bash
curl -X PATCH 'http://localhost:4000/settings/update/ui_theme_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "logo_url": "https://example.com/your-company-logo.png"
  }'
```

### 사용자 지정 파비콘 설정

브라우저 탭의 파비콘도 사용자 지정할 수 있습니다.

```bash
curl -X PATCH 'http://localhost:4000/settings/update/ui_theme_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "logo_url": "https://example.com/your-company-logo.png",
    "favicon_url": "https://example.com/your-favicon.ico"
  }'
```

### 현재 테마 설정 가져오기

```bash
curl -X GET 'http://localhost:4000/settings/get/ui_theme_settings'
```

### 기본 로고로 재설정

기본 LiteLLM 로고로 복원하려면 빈 `logo_url`을 전송합니다.

```bash
curl -X PATCH 'http://localhost:4000/settings/update/ui_theme_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "logo_url": ""
  }'
```

## `proxy_config.yaml`에서 설정

프록시 구성 파일에서도 로고 URL을 설정할 수 있습니다.

```yaml
litellm_settings:
  ui_theme_config:
    logo_url: "https://example.com/your-company-logo.png"
    favicon_url: "https://example.com/your-favicon.ico"  # optional
```

또는 환경 변수로 설정할 수 있습니다.

```yaml
environment_variables:
  UI_LOGO_PATH: "https://example.com/your-company-logo.png"
```

## 지원되는 로고 형식

| 형식 | 지원 여부 |
|--------|-----------|
| JPEG / JPG | 예 |
| PNG | 예 |
| SVG | 예 |
| ICO (파비콘만) | 예 |
| HTTP/HTTPS URL | 예 |
| 로컬 파일 경로 | 예 |
