
# ✨ IP 주소 필터링

:::info

이 기능을 사용하려면 LiteLLM License가 필요합니다. [일정을 예약](https://enterprise.litellm.ai/demo)해 License를 받으세요.

:::

프록시 엔드포인트를 호출할 수 있는 IP를 제한합니다.

```yaml
general_settings:
  allowed_ips: ["192.168.1.1"]
```

**예상 응답**(IP가 목록에 없는 경우)

```bash
{
    "error": {
        "message": "Access forbidden: IP address not allowed.",
        "type": "auth_error",
        "param": "None",
        "code": 403
    }
}
```
