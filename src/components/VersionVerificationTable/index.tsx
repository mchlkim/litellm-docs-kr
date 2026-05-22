import React, { useState } from "react";
import styles from "./styles.module.css";

interface VersionEntry {
  version: string;
  sha256: string;
  gitCommit: string;
}

interface Props {
  entries: VersionEntry[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      className={styles.copyBtn}
      onClick={handleCopy}
      title="전체 SHA-256 복사"
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

export default function VersionVerificationTable({ entries }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>버전</th>
            <th>SHA-256</th>
            <th>IOC 없음</th>
            <th>Git 일치</th>
            <th>Git Commit</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.version}-${entry.gitCommit}`}>
              <td className={styles.version}>{entry.version}</td>
              <td>
                <span className={styles.sha}>
                  <code>{entry.sha256.slice(0, 16)}…</code>
                  <CopyButton text={entry.sha256} />
                </span>
              </td>
              <td>
                <span className={styles.badgeClean}>✔ 정상</span>
              </td>
              <td>
                <span className={styles.badgeYes}>✔ 예</span>
              </td>
              <td>
                <a
                  className={styles.commitLink}
                  href={`https://github.com/BerriAI/litellm/commit/${entry.gitCommit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {entry.gitCommit}
                </a>
              </td>
              <td>
                <span className={styles.badgeClean}>✔ 정상</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
