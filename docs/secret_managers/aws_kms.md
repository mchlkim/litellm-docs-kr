# `AWS Key Management V1`

:::info

✨ **This is an 엔터프라이즈 Feature**

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[Contact us here to get a free trial](https://enterprise.litellm.ai/demo)

:::

:::tip

[BETA] `AWS Key Management v2`는 enterprise tier에서 사용할 수 있습니다. 문서는 [여기](../enterprise.md)에서 확인하세요.

:::

환경에 Proxy Master Key의 hashed copy를 저장하려면 `AWS KMS`를 사용하세요.

```bash
export LITELLM_MASTER_KEY="djZ9xjVaZ..." # 👈 ENCRYPTED KEY
export AWS_REGION_NAME="us-west-2"
```

```yaml
general_settings:
  key_management_system: "aws_kms"
  key_management_settings:
    hosted_keys: ["LITELLM_MASTER_KEY"] # 👈 WHICH KEYS ARE STORED ON KMS
```

[**복호화 코드 보기**](https://github.com/BerriAI/litellm/blob/a2da2a8f168d45648b61279d4795d647d94f90c9/litellm/utils.py#L10182)
