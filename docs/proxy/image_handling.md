import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 이미지 URL 처리 {#image-url-handling}

<Image img={require('../../img/image_handling.png')}  style={{ width: '900px', height: 'auto' }} />

일부 LLM API는 이미지 URL을 지원하지 않지만, base-64 문자열은 지원합니다.

이러한 경우 LiteLLM은 다음을 수행합니다.

1. 전달된 URL을 감지합니다.
2. LLM API가 URL을 지원하는지 확인합니다.
3. 지원하지 않으면 base64를 다운로드합니다.
4. provider에 base64 문자열을 전송합니다.


LiteLLM은 후속 호출의 지연 시간을 줄이기 위해 이 결과를 in-memory로 캐시합니다.

in-memory 캐시 제한은 1MB입니다.
