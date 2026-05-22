import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 데이터베이스 읽기 복제본

LiteLLM Proxy는 쓰기는 계속 기본 데이터베이스로 보내면서, 읽기 전용 쿼리는 별도의 데이터베이스 엔드포인트로 라우팅할 수 있습니다.
읽기/쓰기 엔드포인트를 분리해서 노출하는 Aurora 스타일 클러스터에서 유용하며, 읽기를 reader로 보내 writer를 트랜잭션 워크로드에 집중시킬 수 있습니다.

## 빠른 시작

기존 `DATABASE_URL`과 함께 `DATABASE_URL_READ_REPLICA`를 설정합니다.

```shell
export DATABASE_URL=postgresql://user:pass@writer.db.example.com:5432/litellm
export DATABASE_URL_READ_REPLICA=postgresql://user:pass@reader.db.example.com:5432/litellm
```

프록시는 시작 시 이 환경 변수를 자동으로 감지하고, 내부 Prisma 클라이언트를 두 엔드포인트로 트래픽을 분리하는 라우팅 모드로 전환합니다.
`DATABASE_URL_READ_REPLICA`가 설정되지 않으면 프록시는 단일 데이터베이스 동작을 계속 사용하며, 다른 설정은 필요하지 않습니다.

## 라우팅되는 작업

| 작업 | 대상 |
| --- | --- |
| `find_first`, `find_many`, `find_unique` 및 `_or_raise` 변형 | Reader |
| `count`, `group_by` | Reader |
| `query_raw`, `query_first` | Reader |
| `create`, `update`, `upsert`, `delete`, `update_many`, `delete_many` | Writer |
| `execute_raw` | Writer |
| 트랜잭션(`tx`, `batch_`) | Writer |

코드에서 발생하는 읽기(예: 가상 키 조회, 팀 멤버십, 비용 쿼리)는 호출 지점 변경 없이 reader로 전달됩니다.
라우팅 래퍼가 모델별 작업 접근자를 가로채고, 메서드별로 사용할 백엔드를 선택합니다.

## Reader 성능 저하

시작 시 reader 엔드포인트에 접근할 수 없으면 프록시는 시작 실패 대신 경고를 기록하고 읽기 요청을 writer로 폴백합니다.

```
Failed to connect to read replica DB: <error>. Falling back to the writer for
reads until the reader is reachable.
```

재연결 주기 중 reader가 실패하는 경우에도 같은 폴백이 적용됩니다.
다음 reader 재생성이 성공하면 성능 저하 플래그가 해제되고 읽기가 다시 reader로 전달됩니다.

즉, 읽기 복제본 라우팅을 활성화해도 **가용성은 낮아지지 않습니다**.
최악의 경우에도 단일 데이터베이스 성능 수준으로 저하될 뿐입니다.

## RDS IAM 인증

`IAM_TOKEN_DB_AUTH=True`이면 writer와 reader는 같은 약 12분 주기로 IAM 토큰을 독립적으로 갱신합니다.
reader에는 별도의 `DATABASE_HOST_READ_REPLICA` / `DATABASE_USER_READ_REPLICA` 환경 변수가 필요하지 않습니다.
호스트, 포트, 사용자, 데이터베이스 이름은 시작 시 `DATABASE_URL_READ_REPLICA`에서 한 번 파싱되고, 이후에는 IAM 토큰만 교체됩니다.

이는 클러스터의 reader 인스턴스로 해석되는 Aurora reader 엔드포인트와 자연스럽게 맞물립니다.

## Kubernetes / Helm

공식 Helm 차트는 reader URL을 연결하는 두 가지 방법을 제공합니다.

<Tabs>

<TabItem value="secret" label="Kubernetes secret에서 가져오기(권장)">

reader URL에 자격 증명이 포함되어 있으면 `db.secret.readReplicaUrlKey`를 사용해 기존 `db.secret.name` Kubernetes secret에서 가져옵니다.
이렇게 하면 렌더링된 pod spec과 Helm release secret에 URL이 노출되지 않습니다.

```yaml
db:
  useExisting: true
  secret:
    name: postgres
    usernameKey: username
    passwordKey: password
    # Add the reader URL to the same secret under any key, then reference it:
    readReplicaUrlKey: read-url
```

</TabItem>

<TabItem value="plain" label="평문 값">

자격 증명이 없는 URL(예: 런타임에 `IAM_TOKEN_DB_AUTH`가 비밀번호를 제공하는 경우)에는 `db.readReplicaUrl`을 사용할 수 있습니다.

```yaml
db:
  readReplicaUrl: "postgresql://litellm@reader.aurora.local:5432/litellm"
```

URL에 비밀번호가 포함되어 있으면 이 형식은 피하세요.
값이 pod spec과 Helm release secret에 렌더링됩니다.

</TabItem>

</Tabs>

## Docker Compose

서비스에 환경 변수를 추가합니다.

```yaml
services:
  litellm:
    environment:
      DATABASE_URL: postgresql://user:pass@writer:5432/litellm
      DATABASE_URL_READ_REPLICA: postgresql://user:pass@reader:5432/litellm
```

## 활성화가 적합한 경우

읽기 복제본 라우팅은 다음 상황에서 가장 유용합니다.

- Aurora 또는 reader 엔드포인트가 있는 다른 관리형 Postgres를 사용하며 비용/팀/키 조회를 writer에서 분리하고 싶을 때
- 읽기 트래픽 비중이 높고 writer CPU 또는 연결 수가 제약될 때
- 프록시에 더 가까운 reader를 사용해 지리적 읽기 지역성을 확보하고 싶을 때

다음 상황에서는 **유용하지 않습니다**.

- 기본 데이터베이스와 복제본이 동일한 물리 엔드포인트일 때
- 복제본 없이 단일 노드 Postgres를 실행할 때
- 복제 지연이 애플리케이션의 일관성 가정을 깨뜨릴 수 있을 때. 쓰기 직후의 읽기를 포함해 모든 읽기는 reader로 라우팅됩니다.

## 복제 지연

프록시는 reader 엔드포인트에 대해 write 후 read 일관성을 구현하지 않습니다.
복제 지연이 의미 있는 수준(>100ms)이고 같은 행을 쓴 직후 바로 읽는 흐름이 있다면, 해당 읽기는 오래된 데이터를 볼 수 있습니다.
새로 쓴 데이터에 대해 강한 일관성이 필요한 코드는 writer를 통한 `query_raw`를 사용하거나 트랜잭션 범위 읽기에 의존해야 합니다.

## 관련 환경 변수

| 환경 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | Writer 연결 URL(필수). |
| `DATABASE_URL_READ_REPLICA` | Reader 연결 URL(선택 사항). 설정하지 않으면 모든 읽기가 writer로 이동합니다. |
| `IAM_TOKEN_DB_AUTH` | `True`이면 writer와 reader가 RDS IAM 토큰을 자동으로 갱신합니다. |

전체 목록은 [환경 변수 - 참조](./config_settings#environment-variables---reference)를 확인하세요.
