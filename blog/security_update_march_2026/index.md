---
slug: security-update-march-2026
title: "보안 업데이트: 공급망 사고 의심 건"
date: 2026-03-24T14:00:00
authors:
  - krrish
  - ishaan-alt
description: "2026년 3월 24일 오후 2시 ET 기준"
tags: [보안, 사고-보고]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import VersionVerificationTable from '@site/src/components/VersionVerificationTable';

> **상태:** 조사 진행 중
> **마지막 업데이트:** 2026년 3월 27일

> **업데이트(3월 30일):** LiteLLM의 새로운 **정상** 버전(v1.83.0)을 사용할 수 있습니다. 이 버전은 격리된 환경, 더 강한 보안 게이트, 더 안전한 릴리스 분리를 추가한 새로운 [CI/CD v2](https://docs.litellm.ai/blog/ci-cd-v2-improvements) 파이프라인으로 릴리스되었습니다.

> **업데이트(3월 27일):** 사고 설명, 지금까지 조치한 내용, 이후 계획은 Townhall 업데이트에서 확인할 수 있습니다. [더 알아보기](https://docs.litellm.ai/blog/security-townhall-updates)

> **업데이트(3월 27일):** 감사가 완료된 모든 PyPI 및 Docker 릴리스의 SHA-256 체크섬을 포함한 [검증된 안전 버전](#verified-safe-versions) 섹션을 추가했습니다.

> **업데이트(3월 26일):** 아래 침해 지표 섹션에 `checkmarx[.]zone`을 추가했습니다.

> **업데이트(3월 25일):** 손상된 버전이 GitHub Actions 및 GitLab CI 파이프라인에서 사용됐는지 스캔하는 커뮤니티 기여 스크립트를 추가했습니다. [영향 여부 확인 방법](#how-to-check-if-you-are-affected)을 참고하세요. 스크립트를 제공해 준 [@Zach Fury](https://www.linkedin.com/in/fryware/)에게 감사드립니다.

<!-- truncate -->

## 요약
- 손상된 PyPI 패키지는 **litellm==1.82.7** 및 **litellm==1.82.8**입니다. 해당 패키지는 2026년 3월 24일 10:39 UTC부터 약 40분 동안 공개되어 있었고, 이후 PyPI에 의해 격리되었습니다.
- 현재로서는 CI/CD 보안 스캔 워크플로에서 사용하던 [Trivy 의존성](https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know/)에서 사고가 시작된 것으로 보고 있습니다.
- 공식 LiteLLM Proxy Docker 이미지를 실행한 고객은 영향을 받지 않았습니다. 해당 배포 경로는 `requirements.txt`에 의존성을 고정하며, 손상된 PyPI 패키지에 의존하지 않습니다.
- ~~더 넓은 공급망 검토를 완료하고 릴리스 경로가 안전하다고 확인할 때까지 모든 신규 LiteLLM 릴리스를 중단했습니다.~~ **업데이트:** 격리된 환경, 더 강한 보안 게이트, 더 안전한 릴리스 분리를 추가한 새로운 [CI/CD v2](https://docs.litellm.ai/blog/ci-cd-v2-improvements) 파이프라인으로 LiteLLM의 새 **안전** 버전(v1.83.0)을 릴리스했습니다. 또한 코드베이스가 안전하며 `main`에 악성 코드가 푸시되지 않았음을 확인했습니다.


## 개요

LiteLLM AI Gateway는 승인되지 않은 PyPI 패키지 게시와 관련된 공급망 공격 의심 건을 조사하고 있습니다. 현재 증거는 유지관리자의 PyPI 계정이 탈취되어 악성 코드를 배포하는 데 사용됐을 가능성을 시사합니다.

현재로서는 이 사고가 도난된 자격 증명으로 LiteLLM 게시 파이프라인에 무단 접근한 것으로 보고된 더 넓은 [Trivy 보안 침해](https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know/)와 연결됐을 수 있다고 판단합니다.

조사는 진행 중입니다. 아래 세부 사항은 추가 확인 결과에 따라 변경될 수 있습니다.

## 확인된 영향 버전

PyPI에 게시된 다음 LiteLLM 버전이 영향을 받았습니다.

- **v1.82.7**: LiteLLM AI Gateway `proxy_server.py`에 악성 페이로드가 포함됨
- **v1.82.8**: `litellm_init.pth`와 LiteLLM AI Gateway `proxy_server.py`의 악성 페이로드가 포함됨

이 버전 중 하나를 설치했거나 실행했다면 아래 권장 조치를 즉시 검토하세요.

참고: 이 버전들은 이미 PyPI에서 제거되었습니다.

## 발생한 일

초기 증거에 따르면 공격자는 공식 CI/CD 워크플로를 우회하고 악성 패키지를 PyPI에 직접 업로드했습니다.

손상된 버전에는 다음 작업을 수행하도록 설계된 자격 증명 탈취기가 포함된 것으로 보입니다.

- 다음 항목을 스캔해 secret 수집:
  - 환경 변수
  - SSH keys
  - 클라우드 제공자 자격 증명(AWS, GCP, Azure)
  - Kubernetes tokens
  - 데이터베이스 비밀번호
- 데이터를 암호화한 뒤 공식 BerriAI / LiteLLM 도메인이 **아닌** `models.litellm.cloud`로 `POST` 요청을 보내 유출

## 영향 대상

다음 중 하나라도 해당하면 영향을 받았을 수 있습니다.

- **2026년 3월 24일 10:39 UTC부터 16:00 UTC 사이**에 `pip`로 LiteLLM을 설치하거나 업그레이드한 경우
- 버전을 고정하지 않고 `pip install litellm`을 실행해 **v1.82.7** 또는 **v1.82.8**을 받은 경우
- 해당 시간대에 고정 버전 없이 `pip install litellm`을 포함한 Docker 이미지를 빌드한 경우
- 프로젝트 의존성이 LiteLLM을 전이적이고 고정되지 않은 의존성으로 가져온 경우
  (예: AI agent 프레임워크, MCP 서버, LLM 오케스트레이션 도구)

다음 중 하나라도 해당하면 영향을 받지 않았습니다.

**LiteLLM AI Gateway/Proxy 사용자:** 공식 LiteLLM Proxy Docker 이미지를 실행한 고객은 영향을 받지 않았습니다. 해당 배포 경로는 `requirements.txt`에 의존성을 고정하며, 손상된 PyPI 패키지에 의존하지 않습니다.

- **LiteLLM Cloud**를 사용하는 경우
- 공식 LiteLLM AI Gateway Docker 이미지 `ghcr.io/berriai/litellm`을 사용하는 경우
- **v1.82.6 이하**를 사용 중이며 영향 시간대에 업그레이드하지 않은 경우
- 손상되지 않은 GitHub 저장소의 소스에서 LiteLLM을 설치한 경우


### 영향 여부 확인 방법 {#how-to-check-if-you-are-affected}

<Tabs>
<TabItem value="sdk" label="SDK">

```bash
pip show litellm
```
</TabItem>
<TabItem value="proxy" label="PROXY">

Proxy base URL로 이동해 설치된 LiteLLM 버전을 확인합니다.

![Proxy 버전 확인](../../img/security_update_march_2026/proxy_version.png)
</TabItem>
<TabItem value="github" label="GitHub Actions">

GitHub 조직의 모든 저장소를 스캔해 손상된 버전을 설치한 workflow job이 있는지 확인합니다.

**요구 사항:** Python 3 및 `requests` (`pip install requests`).

**설정:**

```bash
export GITHUB_TOKEN="your-github-pat"
```

**실행:**

```bash
python find_litellm_github.py
```

스크립트의 `ORG` 변수를 GitHub 조직 이름으로 설정합니다.

두 스크립트는 기본적으로 **오늘** 실행된 job을 스캔합니다. 다른 날짜에 실행한다면 `WINDOW_START` 및 `WINDOW_END` 상수를 사고 날짜인 **2026년 3월 24일**을 포함하도록 조정하세요.

<details>
<summary>전체 스크립트 보기(find_litellm_github.py)</summary>

```python
#!/usr/bin/env python3
"""
Scan all GitHub Actions jobs in a GitHub org that ran between
0800-1244 UTC today and identify any that installed litellm 1.82.7 or 1.82.8.

Adjust WINDOW_START / WINDOW_END to cover March 24, 2026 if running later.
"""

import io
import os
import re
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import requests

GITHUB_URL   = "https://api.github.com"
ORG          = "your-org"  # <-- set to your GitHub organization
TOKEN        = os.environ.get("GITHUB_TOKEN", "")

TODAY        = datetime.now(timezone.utc).date()
WINDOW_START = datetime(TODAY.year, TODAY.month, TODAY.day,  8,  0, 0, tzinfo=timezone.utc)
WINDOW_END   = datetime(TODAY.year, TODAY.month, TODAY.day, 12, 44, 0, tzinfo=timezone.utc)

TARGET_VERSIONS = {"1.82.7", "1.82.8"}
VERSION_PATTERN = re.compile(r"litellm[=\-](\d+\.\d+\.\d+)", re.IGNORECASE)

SESSION = requests.Session()
SESSION.headers.update({
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
})


def get_paginated(url, params=None):
    params = dict(params or {})
    params.setdefault("per_page", 100)
    page = 1
    while True:
        params["page"] = page
        resp = SESSION.get(url, params=params, timeout=30)
        if resp.status_code == 404:
            return
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict):
            items = next((v for v in data.values() if isinstance(v, list)), [])
        else:
            items = data
        if not items:
            break
        yield from items
        if len(items) < params["per_page"]:
            break
        page += 1


def parse_ts(ts_str):
    if not ts_str:
        return None
    return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))


def get_repos():
    repos = []
    for r in get_paginated(f"{GITHUB_URL}/orgs/{ORG}/repos", {"type": "all"}):
        repos.append({"id": r["id"], "name": r["name"], "full_name": r["full_name"]})
    return repos


def get_runs_in_window(repo_full_name):
    created_filter = (
        f"{WINDOW_START.strftime('%Y-%m-%dT%H:%M:%SZ')}"
        f"..{WINDOW_END.strftime('%Y-%m-%dT%H:%M:%SZ')}"
    )
    url = f"{GITHUB_URL}/repos/{repo_full_name}/actions/runs"
    runs = []
    for run in get_paginated(url, {"created": created_filter, "per_page": 100}):
        ts = parse_ts(run.get("run_started_at") or run.get("created_at"))
        if ts and WINDOW_START <= ts <= WINDOW_END:
            runs.append(run)
    return runs


def get_jobs_for_run(repo_full_name, run_id):
    url = f"{GITHUB_URL}/repos/{repo_full_name}/actions/runs/{run_id}/jobs"
    jobs = []
    for job in get_paginated(url, {"filter": "all"}):
        ts = parse_ts(job.get("started_at"))
        if ts and WINDOW_START <= ts <= WINDOW_END:
            jobs.append(job)
    return jobs


def fetch_job_log(repo_full_name, job_id):
    url = f"{GITHUB_URL}/repos/{repo_full_name}/actions/jobs/{job_id}/logs"
    resp = SESSION.get(url, timeout=60, allow_redirects=True)
    if resp.status_code in (403, 404, 410):
        return ""
    resp.raise_for_status()

    content_type = resp.headers.get("Content-Type", "")
    if "zip" in content_type or resp.content[:2] == b"PK":
        try:
            with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
                parts = []
                for name in sorted(zf.namelist()):
                    with zf.open(name) as f:
                        parts.append(f.read().decode("utf-8", errors="replace"))
                return "\n".join(parts)
        except zipfile.BadZipFile:
            pass
    return resp.text


def check_job(repo_full_name, job):
    job_id   = job["id"]
    job_name = job["name"]
    run_id   = job["run_id"]
    started  = job.get("started_at", "")

    log_text = fetch_job_log(repo_full_name, job_id)
    if not log_text:
        return None

    found_versions = set()
    context_lines  = []
    for line in log_text.splitlines():
        m = VERSION_PATTERN.search(line)
        if m:
            ver = m.group(1)
            if ver in TARGET_VERSIONS:
                found_versions.add(ver)
                context_lines.append(line.strip())

    if not found_versions:
        return None

    return {
        "repo":       repo_full_name,
        "run_id":     run_id,
        "job_id":     job_id,
        "job_name":   job_name,
        "started_at": started,
        "versions":   sorted(found_versions),
        "context":    context_lines[:10],
        "job_url":    job.get("html_url", f"https://github.com/{repo_full_name}/actions/runs/{run_id}"),
    }


def main():
    if not TOKEN:
        print("ERROR: Set GITHUB_TOKEN environment variable.", file=sys.stderr)
        sys.exit(1)

    print(f"Time window : {WINDOW_START.isoformat()} -> {WINDOW_END.isoformat()}")
    print(f"Hunting for : litellm {', '.join(sorted(TARGET_VERSIONS))}")
    print()

    print(f"Fetching repositories for org '{ORG}'...")
    repos = get_repos()
    print(f"  Found {len(repos)} repositories")
    print()

    jobs_to_check = []

    print("Scanning workflow runs for time window...")
    for repo in repos:
        full_name = repo["full_name"]
        try:
            runs = get_runs_in_window(full_name)
        except requests.HTTPError as e:
            print(f"  WARN: {full_name} - {e}", file=sys.stderr)
            continue
        if not runs:
            continue
        print(f"  {full_name}: {len(runs)} run(s) in window")
        for run in runs:
            try:
                jobs = get_jobs_for_run(full_name, run["id"])
            except requests.HTTPError as e:
                print(f"    WARN: run {run['id']} - {e}", file=sys.stderr)
                continue
            for job in jobs:
                jobs_to_check.append((full_name, job))

    total = len(jobs_to_check)
    print(f"\nFetching logs for {total} job(s)...")
    print()

    hits = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(check_job, full_name, job): (full_name, job["id"])
            for full_name, job in jobs_to_check
        }
        done = 0
        for future in as_completed(futures):
            done += 1
            full_name, jid = futures[future]
            try:
                result = future.result()
            except Exception as e:
                print(f"  ERROR {full_name} job {jid}: {e}", file=sys.stderr)
                continue
            if result:
                hits.append(result)
            print(
                f"  [{done}/{total}] {full_name} job {jid}" +
                (f"  *** HIT: litellm {result['versions']} ***" if result else ""),
                flush=True,
            )

    print()
    print("=" * 72)
    print(f"RESULTS: {len(hits)} job(s) installed litellm {' or '.join(sorted(TARGET_VERSIONS))}")
    print("=" * 72)

    if not hits:
        print("No matches found.")
        return

    for h in sorted(hits, key=lambda x: x["started_at"]):
        print()
        print(f"  Repo      : {h['repo']}")
        print(f"  Job       : {h['job_name']} (#{h['job_id']})")
        print(f"  Run ID    : {h['run_id']}")
        print(f"  Started   : {h['started_at']}")
        print(f"  Versions  : litellm {', '.join(h['versions'])}")
        print(f"  URL       : {h['job_url']}")
        print(f"  Log lines :")
        for line in h["context"]:
            print(f"    {line}")


if __name__ == "__main__":
    main()
```

</details>

</TabItem>
<TabItem value="gitlab" label="GitLab CI">

GitLab group의 모든 project(subgroup 포함)를 스캔해 손상된 version을 설치한 CI/CD job이 있는지 확인합니다.

**요구 사항:** Python 3 및 `requests` (`pip install requests`).

**설정:**

```bash
export GITLAB_TOKEN="your-gitlab-pat"
```

**실행:**

```bash
python find_litellm_jobs.py
```

스크립트의 `GROUP_NAME` 변수를 GitLab group 이름으로 설정합니다.

두 스크립트는 기본적으로 **오늘** 실행된 job을 스캔합니다. 다른 날짜에 실행한다면 `WINDOW_START` 및 `WINDOW_END` 상수를 사고 날짜인 **2026년 3월 24일**을 포함하도록 조정하세요.

<details>
<summary>전체 스크립트 보기(find_litellm_jobs.py)</summary>

```python
#!/usr/bin/env python3
"""
Scan all GitLab CI/CD jobs in a GitLab group that ran between
0800-1244 UTC today and identify any that installed litellm 1.82.7 or 1.82.8.

Adjust WINDOW_START / WINDOW_END to cover March 24, 2026 if running later.
"""

import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import requests

GITLAB_URL = "https://gitlab.com"
GROUP_NAME = "YourGroup"  # <-- set to your GitLab group name
TOKEN = os.environ.get("GITLAB_TOKEN", "")

TODAY = datetime.now(timezone.utc).date()
WINDOW_START = datetime(TODAY.year, TODAY.month, TODAY.day, 8, 0, 0, tzinfo=timezone.utc)
WINDOW_END   = datetime(TODAY.year, TODAY.month, TODAY.day, 12, 44, 0, tzinfo=timezone.utc)

TARGET_VERSIONS = {"1.82.7", "1.82.8"}
VERSION_PATTERN = re.compile(r"litellm[=\-](\d+\.\d+\.\d+)", re.IGNORECASE)

HEADERS = {"PRIVATE-TOKEN": TOKEN}
SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def get_paginated(url, params=None):
    params = dict(params or {})
    params.setdefault("per_page", 100)
    page = 1
    while True:
        params["page"] = page
        resp = SESSION.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            break
        yield from data
        if len(data) < params["per_page"]:
            break
        page += 1


def get_group_id(group_name):
    resp = SESSION.get(f"{GITLAB_URL}/api/v4/groups/{group_name}", timeout=30)
    resp.raise_for_status()
    return resp.json()["id"]


def get_all_projects(group_id):
    projects = []
    for p in get_paginated(
        f"{GITLAB_URL}/api/v4/groups/{group_id}/projects",
        {"include_subgroups": "true", "archived": "false"},
    ):
        projects.append({"id": p["id"], "name": p["path_with_namespace"]})
    return projects


def parse_ts(ts_str):
    if not ts_str:
        return None
    ts_str = ts_str.replace("Z", "+00:00")
    return datetime.fromisoformat(ts_str)


def jobs_in_window(project_id):
    matching = []
    url = f"{GITLAB_URL}/api/v4/projects/{project_id}/jobs"
    params = {"per_page": 100, "scope[]": ["success", "failed", "canceled", "running"]}

    page = 1
    while True:
        params["page"] = page
        resp = SESSION.get(url, params=params, timeout=30)
        if resp.status_code == 403:
            return matching
        resp.raise_for_status()
        jobs = resp.json()
        if not jobs:
            break

        stop_early = False
        for job in jobs:
            ts = parse_ts(job.get("started_at") or job.get("created_at"))
            if ts is None:
                continue
            if ts > WINDOW_END:
                continue
            if ts < WINDOW_START:
                stop_early = True
                continue
            matching.append(job)

        if stop_early or len(jobs) < 100:
            break
        page += 1

    return matching


def fetch_trace(project_id, job_id):
    url = f"{GITLAB_URL}/api/v4/projects/{project_id}/jobs/{job_id}/trace"
    resp = SESSION.get(url, timeout=60)
    if resp.status_code in (403, 404):
        return ""
    resp.raise_for_status()
    return resp.text


def check_job(project_name, project_id, job):
    job_id   = job["id"]
    job_name = job["name"]
    ref      = job.get("ref", "")
    started  = job.get("started_at", job.get("created_at", ""))

    trace = fetch_trace(project_id, job_id)
    if not trace:
        return None

    found_versions = set()
    for match in VERSION_PATTERN.finditer(trace):
        ver = match.group(1)
        if ver in TARGET_VERSIONS:
            found_versions.add(ver)

    if not found_versions:
        return None

    context_lines = []
    for line in trace.splitlines():
        if VERSION_PATTERN.search(line):
            ver_match = VERSION_PATTERN.search(line)
            if ver_match and ver_match.group(1) in TARGET_VERSIONS:
                context_lines.append(line.strip())

    return {
        "project":    project_name,
        "project_id": project_id,
        "job_id":     job_id,
        "job_name":   job_name,
        "ref":        ref,
        "started_at": started,
        "versions":   sorted(found_versions),
        "context":    context_lines[:10],
        "job_url":    f"{GITLAB_URL}/{project_name}/-/jobs/{job_id}",
    }


def main():
    if not TOKEN:
        print("ERROR: Set GITLAB_TOKEN environment variable.", file=sys.stderr)
        sys.exit(1)

    print(f"Time window : {WINDOW_START.isoformat()} -> {WINDOW_END.isoformat()}")
    print(f"Hunting for : litellm {', '.join(sorted(TARGET_VERSIONS))}")
    print()

    print(f"Resolving group '{GROUP_NAME}'...")
    group_id = get_group_id(GROUP_NAME)

    print("Fetching projects...")
    projects = get_all_projects(group_id)
    print(f"  Found {len(projects)} projects")
    print()

    all_jobs_to_check = []

    print("Scanning job listings for time window...")
    for proj in projects:
        try:
            jobs = jobs_in_window(proj["id"])
        except requests.HTTPError as e:
            print(f"  WARN: {proj['name']} - {e}", file=sys.stderr)
            continue
        if jobs:
            print(f"  {proj['name']}: {len(jobs)} job(s) in window")
        for j in jobs:
            all_jobs_to_check.append((proj["name"], proj["id"], j))

    total = len(all_jobs_to_check)
    print(f"\nFetching traces for {total} job(s)...")
    print()

    hits = []
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {
            pool.submit(check_job, pname, pid, job): (pname, job["id"])
            for pname, pid, job in all_jobs_to_check
        }
        done = 0
        for future in as_completed(futures):
            done += 1
            pname, jid = futures[future]
            try:
                result = future.result()
            except Exception as e:
                print(f"  ERROR checking {pname} job {jid}: {e}", file=sys.stderr)
                continue
            if result:
                hits.append(result)
            print(f"  [{done}/{total}] checked {pname} job {jid}" +
                  (f"  *** HIT: litellm {result['versions']} ***" if result else ""),
                  flush=True)

    print()
    print("=" * 72)
    print(f"RESULTS: {len(hits)} job(s) installed litellm {' or '.join(sorted(TARGET_VERSIONS))}")
    print("=" * 72)

    if not hits:
        print("No matches found.")
        return

    for h in sorted(hits, key=lambda x: x["started_at"]):
        print()
        print(f"  Project   : {h['project']}")
        print(f"  Job       : {h['job_name']} (#{h['job_id']})")
        print(f"  Branch/tag: {h['ref']}")
        print(f"  Started   : {h['started_at']}")
        print(f"  Versions  : litellm {', '.join(h['versions'])}")
        print(f"  URL       : {h['job_url']}")
        print(f"  Log lines :")
        for line in h["context"]:
            print(f"    {line}")


if __name__ == "__main__":
    main()
```

</details>

</TabItem>
</Tabs>

*CI/CD 스크립트는 커뮤니티에서 기여했습니다([원본 gist](https://gist.github.com/fryz/93ec8d4898ffe5b5ac5706a208823ef3)). 실행 전에 검토하세요.*


## 침해 지표(IoC) {#indicators-of-compromise-iocs}

영향을 받은 system에서 다음 지표를 확인하세요.

- `site-packages`에 `litellm_init.pth`가 존재함
- `models.litellm[.]cloud`로 향하는 outbound traffic 또는 request
  이 domain은 LiteLLM과 **관련이 없습니다**
- `checkmarx[.]zone`으로 향하는 outbound traffic 또는 request
  이 domain은 LiteLLM과 **관련이 없습니다**


## 영향받은 사용자의 즉시 조치

**v1.82.7** 또는 **v1.82.8**을 설치했거나 실행했다면 다음 조치를 즉시 수행하세요.

### 1. 모든 secret rotate

영향을 받은 system에 있던 모든 credential은 compromise된 것으로 간주하세요. 여기에는 다음이 포함됩니다.

- API keys
- cloud access keys
- database passwords
- SSH keys
- Kubernetes tokens
- environment variable 또는 configuration file에 저장된 모든 secret

### 2. filesystem 점검

`site-packages` directory에 `litellm_init.pth`라는 file이 있는지 확인하세요.

```bash
find /usr/lib/python3.13/site-packages/ -name "litellm_init.pth"
```

존재한다면:

- 즉시 제거하세요
- host에 추가 compromise가 있는지 조사하세요
- security team이 forensic을 수행 중이라면 관련 artifact를 보존하세요

### 3. version history 감사

다음을 검토하세요.

- local environment
- CI/CD pipelines
- Docker build
- deployment log

**v1.82.7** 또는 **v1.82.8**이 어느 곳에든 설치되었는지 확인하세요.

LiteLLM을 **v1.82.6 이하**처럼 알려진 안전 version으로 고정하거나, 추후 발표되는 검증된 release로 고정하세요.


## 대응 및 remediation

LiteLLM AI Gateway team은 이미 다음 조치를 수행했습니다.

- PyPI에서 compromised package 제거
- maintainer credential rotate 및 새 authorized maintainer 지정
- build 및 publishing chain의 forensic analysis를 지원하기 위해 Google Mandiant security team과 협력


## Docker image signature 검증

`v1.83.0-nightly`부터 GHCR에 publish되는 모든 LiteLLM Docker image는 [cosign](https://docs.sigstore.dev/cosign/overview/)으로 서명됩니다. 모든 release는 [commit `0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0)에서 도입된 동일한 key로 서명됩니다.

**고정된 commit hash로 검증(권장):**

commit hash는 암호학적으로 immutable하므로, 원래 signing key를 사용하고 있는지 확인하는 가장 강한 방법입니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

**release tag로 검증(편의용):**

이 repository의 tag는 보호되며 동일한 key로 resolve됩니다. 이 option은 읽기 쉽지만 tag protection rule에 의존합니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/<release-tag>/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

`<release-tag>`를 배포하려는 version으로 바꾸세요(예: `v1.83.0-stable`).

예상 출력:

```
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

## 검증된 안전 version {#verified-safe-versions}

PyPI와 Docker 양쪽에서 v1.78.0부터 v1.82.6 사이에 publish된 모든 LiteLLM release를 감사했습니다. 각 artifact는 다음 방식으로 검증했습니다.

1. publish된 artifact를 download하고 SHA-256 digest 계산
2. 알려진 침해 지표(`IoC`) 스캔
3. artifact contents를 BerriAI/litellm repository의 해당 Git commit과 비교

**아래에 나열된 모든 version은 clean 상태로 확인되었습니다.**

<Tabs>
<TabItem value="pypi" label="PyPI Releases">

<VersionVerificationTable entries={[
  { version: "1.82.6", sha256: "164a3ef3e19f309e3cabc199bef3d2045212712fefdfa25fc7f75884a5b5b205", gitCommit: "38d477507dad" },
  { version: "1.82.5", sha256: "e1012ab816352215c4e00776dd48b0c68058b537888a8ff82cca62af19e6fb11", gitCommit: "1998c4f3703f" },
  { version: "1.82.4", sha256: "d37c34a847e7952a146ed0e2888a24d3edec7787955c6826337395e755ad5c4b", gitCommit: "cfeafbe38811" },
  { version: "1.82.3", sha256: "609901f6c5a5cf8c24386e4e3f50738bb8a9db719709fd76b208c8ee6d00f7a7", gitCommit: "61409275c8d8" },
  { version: "1.82.2", sha256: "641ed024774fa3d5b4dd9347f0efb1e31fa422fba2a6500aabedee085d1194cb", gitCommit: "f351bbdb3683" },
  { version: "1.82.1", sha256: "a9ec3fe42eccb1611883caaf8b1bf33c9f4e12163f94c7d1004095b14c379eb2", gitCommit: "94b002066e3a" },
  { version: "1.82.0", sha256: "5496b5d4532cccdc7a095c21cbac4042f7662021c57bc1d17be4e39838929e80", gitCommit: "6c6585af568e" },
  { version: "1.81.16", sha256: "d6bcc13acbd26719e07bfa6b9923740e88409cbf1f9d626d85fc9ae0e0eec88c", gitCommit: "678200ee4887" },
  { version: "1.81.15", sha256: "2fa253658702509ce09fe0e172e5a47baaadf697fb0f784c7fd4ff665ae76ae1", gitCommit: "2e819656cee9" },
  { version: "1.81.14", sha256: "6394e61bbdef7121e5e3800349f6b01e9369e7cf611e034f1832750c481abfed", gitCommit: "96bcee0b0af7" },
  { version: "1.81.13", sha256: "ae4aea2a55e85993f5f6dd36d036519422d24812a1a3e8540d9e987f2d7a4304", gitCommit: "cc957a19a560" },
  { version: "1.81.12", sha256: "219cf9729e5ea30c6d3f75aa43fef3c56a717369939a6d717cbad0fd78e3c146", gitCommit: "ba0d541b1982" },
  { version: "1.81.11", sha256: "06a66c24742e082ddd2813c87f40f5c12fe7baa73ce1f9457eaf453dc44a0f65", gitCommit: "231aedeeff7e" },
  { version: "1.81.10", sha256: "9efa1cbe61ac051f6500c267b173d988ff2d511c2eecf1c8f2ee546c0870747c", gitCommit: "7488abece8e7" },
  { version: "1.81.9", sha256: "24ee273bc8a62299fbb754035f83fb7d8d44329c383701a2bd034f4fd1c19084", gitCommit: "a09d3e9162eb" },
  { version: "1.81.8", sha256: "78cca92f36bc6c267c191d1fe1e2630c812bff6daec32c58cade75748c2692f6", gitCommit: "4fea649f519b" },
  { version: "1.81.7", sha256: "58466c88c3289c6a3830d88768cf8f307581d9e6c87861de874d1128bb2de90d", gitCommit: "3f6a281d0f7a" },
  { version: "1.81.6", sha256: "573206ba194d49a1691370ba33f781671609ac77c35347f8a0411d852cf6341a", gitCommit: "8da3a93e6e63" },
  { version: "1.81.5", sha256: "206505c5a0c6503e465154b9c979772be3ede3f5bf746d15b37dca5ae54d239f", gitCommit: "2cc3778761d4" },
  { version: "1.81.3", sha256: "3f60fd8b727587952ad3dd18b68f5fed538d6f43d15bb0356f4c3a11bccb2b92", gitCommit: "f30742fe6e8e" },
]} />

</TabItem>
<TabItem value="docker" label="Docker Images">

<VersionVerificationTable entries={[
  { version: "1.82.3", sha256: "0a571da849db5f9c3cf3fead2ffbf1df982eebff7e7b38b46dbec3f640dafdbb", gitCommit: "61409275c8d8" },
  { version: "1.82.3-stable", sha256: "0c2b2a0ad3e50af1702fc493ecd07f22a5180b6d1cfb169440b429b40e340e29", gitCommit: "61409275c8d8" },
  { version: "1.82.0-stable", sha256: "71bf7283767ca436edcfa9f1f26c1743487b5fa29736c61c3eb6977776007c42", gitCommit: "97947c254252" },
  { version: "1.81.15", sha256: "303c31af87e7915e7b34d6c4d55a6ac753ef947a5deaa899e9ccfd3d1d58f7c2", gitCommit: "20bf3aa8070a" },
  { version: "1.81.14-stable", sha256: "a34f9758048231817d799b703fb998e40e2a5cbabb89ab95039fc30798f01b3c", gitCommit: "0435375b1271" },
  { version: "1.81.13", sha256: "a876f3f22f9b6fd481c9091c44a8a893d81c172d66dc2749298dcd3dc4a3d6f0", gitCommit: "cc957a19a560" },
  { version: "1.81.12-stable", sha256: "e24022878ccc87f57d808ac9304f18b87b8359e6556746d81cc20a5dc85f423a", gitCommit: "ba0d541b1982" },
  { version: "1.81.9-stable", sha256: "262e53d7702ed82579717faff0b08f7c0b7e9973a6406cfcc0e4af7826327627", gitCommit: "a09d3e9162eb" },
  { version: "1.81.3-stable", sha256: "dff82ccc32fb648927c090607887401c7e8ec814fe7c951beb95fe51073ca02b", gitCommit: "61ed8f9e0355" },
  { version: "1.81.0-stable", sha256: "f4913297d1bb3dc373eb8911a5ac816b597be9b5e08a91636b6c2786dd572aa8", gitCommit: "790a5ce0b323" },
  { version: "1.80.15-stable", sha256: "0b4ec3861e978b4aa254f4070f292cd345496a5fb59c72e1ee21cd6db94b670b", gitCommit: "17c8d8d109b5" },
  { version: "1.80.11-stable", sha256: "4068108d9101cd2affba3924310fd7f34f23d14e36dd4853733898b9e04d81ca", gitCommit: "57e07bddd341" },
  { version: "1.80.8-stable", sha256: "0304c2eb1f3cf54262d1b4e0629487232bab459e95b99a21e5810231d2b27021", gitCommit: "3381d63152f8" },
  { version: "1.80.5-stable", sha256: "a89e173135fff96af4b5b91ea31845164eadcf6497c82adeb64c36a23c8a3d11", gitCommit: "6c49b95a4ab7" },
  { version: "1.80.0-stable", sha256: "a3416f4cd0c896c94a1f526d872ff6c19bee22ff4afcdcc6f9ff690707900176", gitCommit: "98365205acd0" },
  { version: "1.79.3-stable", sha256: "27aae83d6ab6cb0b63bf8179e375ce0e11f5cfef51f2675b0c1e60c6f546dbc1", gitCommit: "c0548542d4a9" },
  { version: "1.79.1-stable", sha256: "7780d29a9543c4ce762430db7dfb0640105f7357fc38e35bf3fb7bbb1e6ba63f", gitCommit: "c217bddb59ba" },
  { version: "1.79.0-stable", sha256: "32bf6ac059a56641e11e4712f63b8467c295f988b6c160dc7229660417ee44bd", gitCommit: "8d495f56a9cc" },
  { version: "1.78.5-stable", sha256: "d5e607648eafa15edc63b0b1a5ed01f8b31a1fa0c80f7d25b252ae18a593ee29", gitCommit: "c471bf1f16c2" },
  { version: "1.78.0-stable", sha256: "7a56b32dc7153763d31c0a056123dc878a598959935d8c7daacb1fca5272c205", gitCommit: "5fde83d9f154" },
]} />

</TabItem>
</Tabs>


## 질문 및 지원

시스템이 영향을 받았을 수 있다고 생각되면 즉시 연락해 주세요.

- **보안:** `security@berri.ai`
- **지원:** `support@berri.ai`
- **Slack:** LiteLLM team에 직접 문의하세요

실시간 업데이트는 [X의 LiteLLM(YC W23)](https://x.com/LiteLLM)을 팔로우하세요.
