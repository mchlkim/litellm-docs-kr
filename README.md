# LiteLLM 한국어 문서 사이트

이 디렉터리는 공식 LiteLLM 문서 사이트를 한국어로 보기 위한 로컬 Docusaurus 프로젝트입니다.

- 공개 사이트: <https://mchlkim.github.io/litellm-docs-kr/>
- 원본 문서 저장소: <https://github.com/BerriAI/litellm-docs>
- 메인 제품 저장소: <https://github.com/BerriAI/litellm>
- 게시된 공식 문서: <https://docs.litellm.ai/docs/>
- 생성 기준일: 2026-05-14

## 실행

```bash
npm install
npm start
```

로컬 서버가 뜨면 <http://localhost:3000>에서 확인합니다.

## 빌드

```bash
npm run build
```

정적 산출물은 `build/`에 생성됩니다.

## GitHub Pages 배포

이 저장소는 GitHub Pages 프로젝트 사이트로 배포하도록 설정되어 있습니다.

- 배포 URL: <https://mchlkim.github.io/litellm-docs-kr/>
- 배포 워크플로: `.github/workflows/deploy-pages.yml`
- Docusaurus 설정: `url = https://mchlkim.github.io`, `baseUrl = /litellm-docs-kr/`

`main` 브랜치에 push하면 GitHub Actions가 `npm ci`, `npm run build`를 실행한 뒤 `build/` 산출물을 Pages에 배포합니다.

## 한국어화 범위

- Docusaurus 구조, 테마, CSS, 정적 이미지, 사이드바, 문서, 학습, Integrations, 블로그, 릴리즈 노트 구조를 원본과 동일하게 유지했습니다.
- 사이트 UI, 네비게이션, 주요 사이드바 라벨, 반복되는 문서 제목과 핵심 시작 가이드 문구를 한국어로 바꿨습니다.
- `docs/korean/` 아래에 한국어 핵심 가이드 섹션을 추가했습니다. 이 섹션은 SDK, Proxy, 프로바이더, 라우팅, 관측성, 보안, 운영, 문제 해결, 릴리즈 노트 확인 흐름을 한국어 실무 문서로 정리합니다.
- 코드 블록, API 이름, 환경 변수, 모델 ID, 프로바이더 이름, URL, 파일 경로, MDX 컴포넌트 이름은 원문을 유지했습니다.
- 전체 한국어화 진행 상태는 `TRANSLATION_MANIFEST.md`에서 확인합니다.

## 비활성화한 외부 위젯

로컬 문서 용도에 맞게 다음 외부 SaaS 스크립트와 위젯은 `docusaurus.config.js`에서 제거했습니다. 남아 있는 `CrispChat` 컴포넌트도 외부 스크립트를 삽입하지 않는 no-op으로 바꿨습니다.

- Inkeep 검색/AI 채팅
- Crisp 채팅
- Google Analytics / gtag
- FeedbackRocket

## 점검

남아 있는 영어 UI 문구를 찾으려면 다음을 실행합니다.

```bash
python3 scripts/audit_korean_docs.py
```
