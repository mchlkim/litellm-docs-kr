import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 문서에 기여하기 {#contributing-to-documentation}

이 웹사이트는 최신 정적 웹사이트 생성기인 [Docusaurus 2](https://docusaurus.io/)로 빌드됩니다.

`litellm`을 클론합니다.
```
git clone https://github.com/BerriAI/litellm.git
```

### 로컬에서 문서 실행하기 {#local-setup-for-locally-running-docs}

```
cd docs/my-website
```


<Tabs>

<TabItem value="yarn" label="Yarn">

설치
```
npm install --global yarn
```
필수 패키지 설치
```
yarn
```
웹사이트 실행
```
yarn start
```

</TabItem>

<TabItem value="pnpm" label="pnpm">

설치
```
npm install --global pnpm
```
필수 패키지 설치
```
pnpm install
```
웹사이트 실행
```
pnpm start
```

</TabItem>

</Tabs>


여기에서 문서를 엽니다: [http://localhost:3000/](http://localhost:3000/)

이 명령은 `Markdown` 파일을 `HTML`로 빌드하고, 문서를 확인할 수 있는 개발 서버를 시작합니다. 웹 브라우저에서 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)을 열어 문서를 확인할 수 있습니다. `Markdown` 파일을 수정하면 문서가 자동으로 다시 빌드됩니다.

[전체 튜토리얼 보기](https://docs.readthedocs.io/en/stable/intro/getting-started-with-mkdocs.html)

### 문서 변경하기 {#making-changes-to-docs}
- 모든 문서는 `docs` 디렉터리 아래에 있습니다.
- 새 `.md` 파일을 추가하거나 계층 구조를 수정하는 경우, 프로젝트 루트의 `mkdocs.yml`을 편집합니다.
- 변경 사항을 테스트한 뒤 [github.com/BerriAI/litellm](https://github.com/BerriAI/litellm)의 `main` 브랜치로 변경 사항 또는 `pull request`를 제출합니다.
