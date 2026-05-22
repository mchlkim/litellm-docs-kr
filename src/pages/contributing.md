# 문서 기여하기

litellm 클론하기
```
git clone https://github.com/BerriAI/litellm.git
```

### 로컬에서 문서 실행하기

#### 설치
```
uv add mkdocs
```

#### 로컬에서 문서 제공하기
```
mkdocs serve
```
`command not found: mkdocs`가 표시되면 다음 명령을 실행해 보세요.
```
python3 -m mkdocs serve
```

이 명령은 Markdown 파일을 HTML로 빌드하고 문서를 볼 수 있는 개발 서버를 시작합니다. 웹 브라우저에서 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)을 열어 문서를 확인하세요. Markdown 파일을 변경하면 문서가 자동으로 다시 빌드됩니다.

[전체 튜토리얼 보기](https://docs.readthedocs.io/en/stable/intro/getting-started-with-mkdocs.html)

### 문서 변경하기
- 모든 문서는 `docs` 디렉터리 아래에 있습니다.
- 새 `.md` 파일을 추가하거나 계층 구조를 수정하는 경우 프로젝트 루트의 `mkdocs.yml`을 편집하세요.
- 변경 사항을 테스트한 뒤 [github.com/BerriAI/litellm](https://github.com/BerriAI/litellm)의 `main` 브랜치에 반영하세요.



