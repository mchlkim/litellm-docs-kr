import React from 'react';

const s = {
  fig: {margin: '2.5rem 0', fontFamily: 'inherit'},
  box: {borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', padding: '2rem 2.5rem'},
  label: {fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', textAlign: 'center', marginBottom: '1.5rem'},
  caption: {textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12},
  node: (border='#d1d5db', bg='#f9fafb') => ({
    border: `1px solid ${border}`, borderRadius: 6, padding: '8px 20px',
    fontSize: 13, background: bg, display: 'inline-block',
  }),
  arrow: {display: 'flex', flexDirection: 'column', alignItems: 'center'},
};

const SmallArrow = ({color='#9ca3af'}) => (
  <svg width="2" height="28" style={{display:'block'}}>
    <line x1="1" y1="0" x2="1" y2="22" stroke={color} strokeWidth="1.5"/>
    <polygon points="1,28 -2,21 4,21" fill={color}/>
  </svg>
);

export function CascadeFailure() {
  return (
    <figure style={s.fig}>
      <div style={s.box}>
        <p style={s.label}>서킷 브레이커 없음 — 연쇄 장애</p>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:0}}>
          <div style={s.node()}>LiteLLM Pod (×100)</div>
          <SmallArrow />
          <div style={s.node()}>속도 제한 / 캐시 확인</div>
          <div style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'center'}}>
            <SmallArrow color="#f87171"/>
            <span style={{position:'absolute', left:8, top:4, fontSize:11, color:'#f87171', whiteSpace:'nowrap'}}>요청마다 30초 정지</span>
          </div>
          <div style={s.node('#fca5a5','#fef2f2')}><span style={{color:'#b91c1c', fontWeight:600}}>Redis — 성능 저하, 타임아웃 발생</span></div>
          <SmallArrow color="#fb923c"/>
          <div style={s.node('#fdba74','#fff7ed')}><span style={{color:'#c2410c', fontWeight:600}}>Postgres — 평소 읽기 부하의 100배</span></div>
          <SmallArrow />
          <div style={{...s.node('#111827','#111827'), color:'#fff', fontWeight:600}}>전체 장애 — gateway 다운</div>
        </div>
      </div>
      <figcaption style={s.caption}>Redis 지연 → 모든 auth 확인 타임아웃 → database 과부하 → 전체 연쇄 장애</figcaption>
    </figure>
  );
}

export function CircuitBreakerStates() {
  const circle = (border, color, label, sub) => (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', width: 140}}>
      <div style={{width:88, height:88, borderRadius:'50%', border:`2px solid ${border}`, background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <span style={{fontSize:11, fontWeight:700, color, letterSpacing:'0.06em'}}>{label}</span>
        <span style={{fontSize:10, color:'#9ca3af', marginTop:2}}>{sub}</span>
      </div>
      <p style={{fontSize:11, color:'#6b7280', textAlign:'center', marginTop:10, lineHeight:1.5}}>{'\u00a0'}</p>
    </div>
  );
  const arrow = (label) => (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:36, marginLeft:4, marginRight:4}}>
      <span style={{fontSize:10, color:'#6b7280', marginBottom:4}}>{label}</span>
      <div style={{display:'flex', alignItems:'center'}}>
        <div style={{height:1, width:48, background:'#9ca3af'}}/>
        <svg width="8" height="8" style={{marginLeft:-1}}><polygon points="0,0 8,4 0,8" fill="#6b7280"/></svg>
      </div>
    </div>
  );
  return (
    <figure style={s.fig}>
      <div style={s.box}>
        <p style={s.label}>서킷 브레이커 상태 머신</p>
        <div style={{display:'flex', justifyContent:'center', alignItems:'flex-start'}}>
          {circle('#1f2937','#111827','CLOSED','정상')}
          {arrow('5회 실패')}
          {circle('#f87171','#dc2626','OPEN','빠른 실패')}
          {arrow('60초 타임아웃')}
          {circle('#fbbf24','#b45309','HALF-OPEN','탐색')}
        </div>
        <div style={{display:'flex', justifyContent:'center', gap:32, marginTop:24}}>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
            <div style={{display:'flex', alignItems:'center', gap:4}}>
              <svg width="8" height="8"><polygon points="8,0 0,4 8,8" fill="#16a34a"/></svg>
              <div style={{height:1, width:100, background:'#16a34a'}}/>
            </div>
            <span style={{fontSize:10, color:'#16a34a'}}>탐색 성공 → CLOSED</span>
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
            <div style={{display:'flex', alignItems:'center', gap:4}}>
              <svg width="8" height="8"><polygon points="8,0 0,4 8,8" fill="#ef4444"/></svg>
              <div style={{height:1, width:100, borderTop:'2px dashed #f87171'}}/>
            </div>
            <span style={{fontSize:10, color:'#ef4444'}}>탐색 실패 → 다시 OPEN</span>
          </div>
        </div>
      </div>
    </figure>
  );
}

export function CircuitBreakerFlow() {
  return (
    <figure style={s.fig}>
      <div style={s.box}>
        <p style={s.label}>서킷 브레이커 사용 — 점진적 성능 저하</p>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div style={s.node()}>들어오는 요청</div>
          <SmallArrow />
          <div style={{...s.node('#111827'), border:'2px solid #111827', fontWeight:600}}>서킷 브레이커</div>
          <div style={{display:'flex', gap:80, marginTop:20, alignItems:'flex-start'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
              <SmallArrow />
              <span style={{fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b7280', border:'1px solid #e5e7eb', borderRadius:4, padding:'2px 8px'}}>Closed</span>
              <div style={{...s.node(), textAlign:'center', fontSize:13}}>Redis 호출<br/><span style={{fontSize:11, color:'#9ca3af'}}>정상 latency</span></div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
              <SmallArrow />
              <span style={{fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#ef4444', border:'1px solid #fca5a5', borderRadius:4, padding:'2px 8px'}}>Open</span>
              <div style={{...s.node('#fca5a5'), textAlign:'center', fontSize:13}}>빠른 실패 — 0ms<br/><span style={{fontSize:11, color:'#9ca3af'}}>network 호출 없음</span></div>
              <SmallArrow />
              <div style={{...s.node(), textAlign:'center', fontSize:13}}>DB fallback<br/><span style={{fontSize:11, color:'#9ca3af'}}>제한된 부하</span></div>
            </div>
          </div>
          <div style={{...s.node('#111827','#111827'), color:'#fff', fontWeight:600, marginTop:24}}>요청 완료 — gateway 유지</div>
        </div>
      </div>
      <figcaption style={s.caption}>Redis 다운 → circuit 열림 → 0ms 거부 → DB가 제한된 fallback traffic 흡수</figcaption>
    </figure>
  );
}

export function IncidentTimeline() {
  const row = (color, text) => (
    <div style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:12}}>
      <div style={{marginTop:5, width:6, height:6, borderRadius:'50%', background:color, flexShrink:0}}/>
      <p style={{fontSize:13, color:'#4b5563', margin:0, lineHeight:1.5}}>{text}</p>
    </div>
  );
  return (
    <figure style={s.fig}>
      <div style={s.box}>
        <p style={s.label}>Redis 성능 저하 — 전후 비교</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
          <div style={{border:'1px solid #e5e7eb', borderRadius:8, padding:20}}>
            <p style={{fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', marginBottom:16}}>서킷 브레이커 없음</p>
            {row('#f87171','100개 pod가 모두 auth 확인마다 30초 정지')}
            {row('#f87171','Threadpool이 가득 차고 request가 queue에 쌓임')}
            {row('#f87171','동시 DB fallback 100배가 Postgres를 압도')}
            {row('#f87171','복구에 수동 개입 필요')}
          </div>
          <div style={{border:'1px solid #111827', borderRadius:8, padding:20}}>
            <p style={{fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', marginBottom:16}}>서킷 브레이커 사용</p>
            {row('#111827','5회 실패 후 circuit 열림 — 0ms 빠른 실패')}
            {row('#111827','Auth가 DB로 fallback — 100배 부하가 아닌 제한된 부하')}
            {row('#111827','Cache miss rate가 일시적으로 상승 — gateway 유지')}
            {row('#111827','Redis가 돌아오면 자동 복구 — 개입 불필요')}
          </div>
        </div>
      </div>
    </figure>
  );
}
