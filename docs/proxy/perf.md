import Image from '@theme/IdealImage';

# LiteLLM 프록시 성능 {#litellm-proxy-performance}

### 처리량 - 30% 증가 {#throughput---30-increase}
`LiteLLM proxy` + `Load Balancer`는 `Raw OpenAI API`와 비교해 처리량을 **30% 증가**시킵니다.
<Image img={require('../../img/throughput.png')} />

### 추가 지연 시간 - 0.00325초 {#latency-added---000325-seconds}
`LiteLLM proxy`는 `Raw OpenAI API`를 직접 사용할 때와 비교해 **0.00325초**의 지연 시간을 추가합니다.
<Image img={require('../../img/latency.png')} />
