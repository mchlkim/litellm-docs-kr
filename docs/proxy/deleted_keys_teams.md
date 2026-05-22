import Image from '@theme/IdealImage';

# 삭제된 키 및 팀 감사 로그

<Image img={require('../../img/ui_deleted_keys_table.png')} />

감사 및 컴플라이언스 목적으로 삭제된 API 키와 팀을 삭제 시점의 사용 금액 및 예산 정보와 함께 확인합니다.

## 개요

삭제된 키 및 팀 기능은 LiteLLM 프록시에서 삭제된 엔터티에 대한 포괄적인 감사 추적을 제공합니다. 이 기능은 삭제된 키 또는 팀과 삭제 시점의 사용 금액/예산을 쉽게 감사할 수 있도록 구현되었습니다.

키 또는 팀이 삭제되면 LiteLLM은 다음 정보를 자동으로 캡처합니다.

- **삭제 타임스탬프** - 엔터티가 삭제된 시점
- **삭제한 사용자** - 삭제 작업을 수행한 사람
- **삭제 시점 사용 금액** - 삭제 시점까지 누적된 총 사용 금액
- **원래 예산** - 삭제 전에 엔터티에 설정되어 있던 예산
- **엔터티 세부 정보** - 키 또는 팀 식별 정보

이 정보는 삭제 후에도 보존되므로 컴플라이언스 목적에 맞는 정확한 재무 기록과 감사 추적을 유지할 수 있습니다.

## 삭제된 키 보기

### 1단계: API 키 페이지로 이동

LiteLLM UI에서 API 키 페이지로 이동합니다.

```
http://localhost:4000/ui/?login=success&page=api-keys
```

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/73b97ba9-0ab5-4140-aee2-05fa90463461/ascreenshot_5e6d9f05d452405c83d7a368349d087d_text_export.jpeg)

### 2단계: 로그 섹션 접근

탐색 메뉴에서 "로그" 메뉴 항목을 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/73b97ba9-0ab5-4140-aee2-05fa90463461/ascreenshot_8ebab354b1e542e59e1082e519927edd_text_export.jpeg)

### 3단계: 삭제된 키 보기

"Deleted Keys"를 클릭하여 삭제된 모든 API 키의 테이블을 확인합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/00668558-9326-4a6f-8e87-159d54b17a72/ascreenshot_d0e50e49e9aa43d4a22ada6f12a78b12_text_export.jpeg)

### 4단계: 삭제 정보 검토

Deleted Keys 테이블에는 삭제된 각 키에 대한 포괄적인 정보가 포함됩니다.

- 키가 삭제된 **시점**(타임스탬프)
- 키를 삭제한 **사용자**(사용자/관리자 정보)
- **키 식별** 세부 정보

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/8538f7c4-634e-44c8-8d7d-fafbd6da0b02/ascreenshot_6b73f9c6a52d4e40a2368ef441cf6c8f_text_export.jpeg)

### 5단계: 재무 정보 보기

테이블에는 삭제 시점에 캡처된 재무 정보도 표시됩니다.

- **삭제 시점 사용 금액** - 키가 삭제되었을 때 누적된 총 사용 금액
- **원래 예산** - 키에 설정되어 있던 예산 한도

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/f8b03850-b17c-490c-a507-c3b0b6c050ab/ascreenshot_070b139f111844bba38fbed8835b097b_text_export.jpeg)

## 삭제된 팀 보기

### 1단계: 삭제된 팀 접근

로그 섹션에서 "Deleted Teams"를 클릭하여 삭제된 모든 팀을 확인합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/716ce26f-09af-4a6d-99c5-921d6b6a8555/ascreenshot_d36c16f1cf894340aa8bc20ada5922ac_text_export.jpeg)

### 2단계: 팀 삭제 정보 검토

Deleted Teams 테이블은 삭제된 각 팀에 대한 자세한 정보를 제공합니다.

- 팀이 삭제된 **시점**(타임스탬프)
- 팀을 삭제한 **사용자**(사용자/관리자 정보)
- **팀 식별** 세부 정보

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/0a3f2d3f-179a-4ad7-916e-b77a13dca01d/ascreenshot_ded5970762d54528ae656421148116c4_text_export.jpeg)

### 3단계: 팀 재무 정보 보기

삭제된 키와 마찬가지로 Deleted Teams 테이블은 재무 정보를 표시합니다.

- **삭제 시점 사용 금액** - 팀이 삭제되었을 때 누적된 총 사용 금액
- **원래 예산** - 팀에 설정되어 있던 예산 한도

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/5b24871f-b57e-404d-8fbe-a4b27cb2a6a0/ascreenshot_3121fbafbd6b4abf90993ce6c03c608d_text_export.jpeg)

## 사용 사례

이 기능은 특히 다음에 유용합니다.

- **재무 감사** - 삭제된 엔터티의 사용 금액과 예산 추적
- **컴플라이언스** - 누가 무엇을 언제 삭제했는지에 대한 기록 유지
- **비용 분석** - 삭제 전 지출 패턴 파악
- **책임 추적** - 삭제를 수행한 관리자 또는 사용자 식별
- **기록 보존** - 엔터티 삭제 후에도 재무 데이터 보존

## 관련 기능

- [Audit 로그](./multiple_admins.md) - 모든 엔터티 변경에 대한 포괄적인 감사 로그 보기
- [UI 로그](./ui_logs.md) - 요청 로그 및 사용 금액 추적 보기
