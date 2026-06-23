import React from 'react';

// ── Hero ──────────────────────────────────────────────────────────────────
// Two-focal bundle: many curves fan in from the left, pass through two focal
// nodes (registry + invocation), fan out on the right. Reads as: many agent
// runtimes routed through one unified control plane to many consumers.
export function ConvergenceHero() {
  const W = 1200;
  const H = 500;
  const N = 40;
  const f1 = { x: W * 0.25, y: H * 0.5 };
  const f2 = { x: W * 0.75, y: H * 0.5 };
  const curves = Array.from({ length: N }, (_, i) => {
    const t = (i - N / 2) / (N / 2);
    const yIn = H * 0.5 + t * H * 0.45;
    const yOut = H * 0.5 - t * H * 0.45;
    const d = `M 0 ${yIn} Q ${f1.x} ${f1.y}, ${(f1.x + f2.x) / 2} ${H / 2} Q ${f2.x} ${f2.y}, ${W} ${yOut}`;
    return { d, o: 0.18 + 0.35 * (1 - Math.abs(t)) };
  });

  return (
    <figure style={{ margin: '0 0 2rem 0' }}>
      <div
        style={{
          background: '#3a3a2e',
          borderRadius: 12,
          overflow: 'hidden',
          aspectRatio: `${W} / ${H}`,
          width: '100%',
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
          role="img"
          aria-label="왼쪽에서 여러 곡선이 모여 두 개의 초점을 지나 오른쪽으로 퍼지는 추상 곡선 다발입니다. 여러 agent runtime이 통합 제어 평면을 통해 여러 소비자에게 라우팅되는 모습을 나타냅니다."
        >
          {curves.map((c, i) => (
            <path
              key={i}
              d={c.d}
              fill="none"
              stroke="#faf9f5"
              strokeWidth={0.9}
              strokeOpacity={c.o}
              strokeLinecap="round"
            />
          ))}
          <circle cx={f1.x} cy={f1.y} r={4} fill="#faf9f5" opacity={0.95} />
          <circle cx={f2.x} cy={f2.y} r={4} fill="#faf9f5" opacity={0.95} />
        </svg>
      </div>
    </figure>
  );
}


const ROWS = [
  {
    label: '통합 API',
    sub: '하나의 인터페이스, 여러 backend',
    model: { name: 'LiteLLM', desc: '100개 이상 모델을 하나의 API로', open: false },
    agent: { name: '?', desc: 'agent runtime 전반을 하나의 API로', open: true },
  },
  {
    label: '관리형 클라우드 서비스',
    sub: '완전 호스팅, 사용량 기반 과금',
    model: { name: 'Bedrock', desc: '클라우드 모델 추론', open: false },
    agent: { name: 'Claude Managed Agents', desc: '클라우드 모델 + harness API', open: false },
  },
  {
    label: '배포 플랫폼',
    sub: '오픈소스를 직접 실행',
    model: { name: 'SageMaker', desc: 'OSS 모델 배포', open: false },
    agent: { name: 'AgentCore · Vertex Agents', desc: 'OSS harness 배포', open: false },
  },
  {
    label: '고성능 serving',
    sub: '처리량과 지연 시간 엔진',
    model: { name: 'vLLM', desc: '빠른 모델 serving', open: false },
    agent: { name: '?', desc: '빠른 harness serving', open: true },
  },
];

const BLUE = '#3b82f6';

const s = {
  fig: { margin: '2.5rem 0', fontFamily: 'inherit' },
  wrap: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr 24px 1fr',
    gap: '12px 12px',
    alignItems: 'center',
  },
  colHeader: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    paddingBottom: 4,
  },
  colSub: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    paddingBottom: 12,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: 600,
    paddingRight: 12,
  },
  rowSub: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  box: (open) => ({
    border: open ? `1.5px dashed ${BLUE}` : '1px solid var(--ifm-color-emphasis-300)',
    background: open ? 'rgba(59,130,246,0.08)' : 'transparent',
    borderRadius: 8,
    padding: '14px 18px',
    minHeight: 56,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  boxName: (open) => ({
    fontSize: 14,
    fontWeight: 700,
    color: open ? BLUE : 'inherit',
  }),
  boxDesc: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 3,
  },
  arrow: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
  },
  legend: {
    display: 'flex',
    gap: 24,
    justifyContent: 'center',
    marginTop: 24,
    fontSize: 12,
    opacity: 0.7,
    flexWrap: 'wrap',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendSwatch: (open) => ({
    width: 24,
    height: 14,
    borderRadius: 4,
    border: open ? `1.5px dashed ${BLUE}` : '1px solid var(--ifm-color-emphasis-300)',
    background: open ? 'rgba(59,130,246,0.08)' : 'transparent',
  }),
  caption: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 14,
  },
};

export function StackComparison() {
  return (
    <figure style={s.fig}>
      <div style={s.wrap}>
        <div />
        <div>
          <div style={s.colHeader}>Model stack - 현재</div>
          <div style={s.colSub}>모델 호출</div>
        </div>
        <div />
        <div>
          <div style={s.colHeader}>Agent stack - 미래</div>
          <div style={s.colSub}>harness 호출</div>
        </div>

        {ROWS.map((row, i) => (
          <React.Fragment key={i}>
            <div style={s.rowLabel}>
              {row.label}
              <div style={s.rowSub}>{row.sub}</div>
            </div>
            <div style={s.box(row.model.open)}>
              <div style={s.boxName(row.model.open)}>{row.model.name}</div>
              <div style={s.boxDesc}>{row.model.desc}</div>
            </div>
            <div style={s.arrow}>→</div>
            <div style={s.box(row.agent.open)}>
              <div style={s.boxName(row.agent.open)}>{row.agent.name}</div>
              <div style={s.boxDesc}>{row.agent.desc}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={s.legend}>
        <div style={s.legendItem}>
          <div style={s.legendSwatch(true)} />
          <span>열린 영역 - 아직 명확한 승자 없음</span>
        </div>
        <div style={s.legendItem}>
          <div style={s.legendSwatch(false)} />
          <span>이미 자리 잡았거나 발표된 player</span>
        </div>
      </div>

      <figcaption style={s.caption}>
        model stack의 각 계층은 agent stack에 대응되는 계층이 있습니다. 점선 박스는 열린 기회를 나타냅니다.
      </figcaption>
    </figure>
  );
}
