---
title: "v1.83.0 - 공식 릴리스 (공급망 사고 이후)"
slug: "v1-83-0"
date: 2026-03-31T00:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
hide_table_of_contents: false
---

## 이 버전 배포하기 {#deploy-this-version}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
ghcr.io/berriai/litellm:main-1.83.0-nightly
```

</TabItem>
<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.83.0
```

</TabItem>
</Tabs>

## 배경: 공급망 사고 이후 첫 릴리스 {#context-first-release-after-supply-chain-incident}

v1.83.0은 [3월 24일 공급망 사고](https://docs.litellm.ai/blog/security-update-march-2026) 이후, 새로운 [CI/CD v2 pipeline](https://docs.litellm.ai/blog/ci-cd-v2-improvements)을 통해 빌드 및 게시된 첫 LiteLLM 릴리스입니다.

모든 릴리스를 1주일 동안 중단하고 다음 작업을 진행했습니다.
1. [Mandiant](https://www.mandiant.com/) 및 [Veria Labs](https://verialabs.com/)와 함께 포렌식 검토를 완료했습니다.
2. 격리된 환경과 임시 자격 증명을 사용해 릴리스 파이프라인을 처음부터 다시 구축했습니다.
3. 코드베이스에 침해 지표가 없음을 확인했습니다.

이 릴리스나 사고에 대해 궁금한 점이 있으면 [Security Townhall 게시글](https://docs.litellm.ai/blog/security-townhall-updates)을 확인하거나 `security@berri.ai`로 문의하세요.

---

## 링크 {#links}

- **PyPI**: [litellm 1.83.0](https://pypi.org/project/litellm/1.83.0/)
- **보안 업데이트**: [공급망 사고 보고서](https://docs.litellm.ai/blog/security-update-march-2026)
- **Security Townhall**: [발생한 일, 조치한 일, 다음 단계](https://docs.litellm.ai/blog/security-townhall-updates)
- **CI/CD v2**: [LiteLLM용 CI/CD v2 발표](https://docs.litellm.ai/blog/ci-cd-v2-improvements)
- **4월 안정성 스프린트**: [계획 수립에 참여하기](https://github.com/BerriAI/litellm/issues/24825)
