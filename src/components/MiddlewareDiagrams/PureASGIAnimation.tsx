import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.css';

interface Stage {
  label: string;
  subtitle: string;
}

const STAGES: Stage[] = [
  { label: 'Scope 확인', subtitle: 'scope["type"] != "http"' },
  { label: '직접 호출', subtitle: 'await self.app(scope, receive, send)' },
];

const INTERVAL_MS = 1200;
const PAUSE_MS = 600;

export default function PureASGIAnimation() {
  const [activeStage, setActiveStage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const advance = () => {
      setActiveStage((prev) => {
        const next = (prev + 1) % STAGES.length;
        if (next === 0) {
          timerRef.current = setTimeout(() => {
            timerRef.current = setTimeout(advance, INTERVAL_MS);
          }, PAUSE_MS);
          return next;
        }
        timerRef.current = setTimeout(advance, INTERVAL_MS);
        return next;
      });
    };

    timerRef.current = setTimeout(advance, INTERVAL_MS);
    return clearTimer;
  }, [clearTimer]);

  return (
    <div className={styles.pipelineWrapper}>
      <div className={styles.pipelineLabel}>요청당 2단계</div>
      <div className={`${styles.pipeline} ${styles.pipelineTwoCol}`}>
        {STAGES.map((stage, i) => (
          <div className={styles.stageWrapper} key={i}>
            <div
              className={`${styles.stage} ${styles.stageNoClick} ${
                activeStage === i ? styles.stageActiveGreen : ''
              }`}
            >
              <div className={styles.stageNumber}>{i + 1}</div>
              <div className={styles.stageLabel}>{stage.label}</div>
              <div className={styles.stageSubtitle}>{stage.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
