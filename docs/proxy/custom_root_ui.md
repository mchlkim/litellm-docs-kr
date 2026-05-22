import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# UI - 사용자 지정 루트 경로 {#ui---custom-root-path}

💥 `https://localhost:4000/api/v1` 같은 사용자 지정 기본 URL 경로에서 LiteLLM을 제공하려는 경우 사용하세요.

:::info

v1.72.3 이상이 필요합니다.

:::

제한 사항:
- UI 파일에 대한 쓰기 권한이 필요하므로 [litellm non-root](./deploy#non-root---without-internet-connection) 이미지에서는 작동하지 않습니다.

## 사용법

### 1. .env에서 `SERVER_ROOT_PATH` 설정 {#1-set-server_root_path-in-your-env}

👉 .env에서 `SERVER_ROOT_PATH`를 설정하면 이 값이 서버 루트 경로로 설정됩니다.

```
export SERVER_ROOT_PATH="/api/v1"
```

### 2. Proxy 실행 {#2-run-the-proxy}

```shell
litellm proxy --config /path/to/config.yaml
```

Proxy를 실행한 후에는 `http://0.0.0.0:4000/api/v1/`에서 접근할 수 있습니다(`SERVER_ROOT_PATH="/api/v1"`로 설정했기 때문입니다).

### 3. 올바른 경로에서 실행 중인지 확인 {#3-verify-running-on-correct-path}

<Image img={require('../../img/custom_root_path.png')} />

**끝입니다.** 사용자 지정 루트 경로에서 Proxy를 실행하는 데 필요한 작업은 이것이 전부입니다.


## 데모 {#demo}

사용자 지정 루트 경로에서 Proxy를 실행하는 [데모 비디오](https://drive.google.com/file/d/1zqAxI0lmzNp7IJH1dxlLuKqX2xi3F_R3/view?usp=sharing)입니다.
