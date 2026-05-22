# `Google Key Management Service` 설정 {#google-key-management-service}

:::info

✨ **이 기능은 엔터프라이즈 기능입니다**

[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 체험을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

`proxy`에서 `Google KMS`의 암호화된 키를 사용합니다.

1단계. `env`에 키 추가
```
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
export GOOGLE_KMS_RESOURCE_NAME="projects/*/locations/*/keyRings/*/cryptoKeys/*"
export PROXY_DATABASE_URL_ENCRYPTED=b'\n$\x00D\xac\xb4/\x8e\xc...'
```

2단계: 구성 업데이트

```yaml
general_settings:
  key_management_system: "google_kms"
  database_url: "os.environ/PROXY_DATABASE_URL_ENCRYPTED"
  master_key: sk-1234
```

3단계: `proxy` 시작 및 테스트

```
$ litellm --config /path/to/config.yaml
```

그리고 다른 터미널에서 실행합니다.
```
$ litellm --test 
```

[빠른 Proxy 테스트](../proxy/user_keys)
