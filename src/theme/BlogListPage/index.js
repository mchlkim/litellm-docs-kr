import React, {useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const TABS = [
  {id: 'all', label: '전체'},
  {id: 'engineering', label: '엔지니어링'},
  {id: 'security', label: '보안'},
  {id: 'infrastructure', label: '성능 / 안정성'},
];

const SECURITY_TAGS = ['security', 'incident-report'];
const INFRA_TAGS = ['performance', 'reliability', 'infrastructure'];

function hasTag(item, tagSet) {
  const tags = item.content?.metadata?.tags || [];
  return tags.some(t => tagSet.includes(t.label));
}

function filterItems(items, tab) {
  if (tab === 'all') return items;
  if (tab === 'security') return items.filter(i => hasTag(i, SECURITY_TAGS));
  if (tab === 'infrastructure') return items.filter(i => hasTag(i, INFRA_TAGS));
  return items.filter(i => !hasTag(i, SECURITY_TAGS) && !hasTag(i, INFRA_TAGS));
}

// ── Provider marquee ──────────────────────────────────────────────────────
const PROVIDERS = [
  { name: 'OpenAI',        img: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64' },
  { name: 'Anthropic',     img: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64' },
  { name: 'Google Gemini', img: 'https://www.google.com/s2/favicons?domain=ai.google.dev&sz=64' },
  { name: 'AWS Bedrock',   img: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64' },
  { name: 'Azure OpenAI',  img: 'https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=64' },
  { name: 'Mistral AI',    img: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=64' },
  { name: 'Meta Llama',    img: 'https://www.google.com/s2/favicons?domain=meta.com&sz=64' },
  { name: 'Groq',          img: 'https://www.google.com/s2/favicons?domain=groq.com&sz=64' },
  { name: 'Hugging Face',  img: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=64' },
  { name: 'Perplexity',    img: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64' },
  { name: 'DeepSeek',      img: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=64' },
  { name: 'Cohere',        img: 'https://www.google.com/s2/favicons?domain=cohere.com&sz=64' },
  { name: 'Together AI',   img: 'https://www.google.com/s2/favicons?domain=together.ai&sz=64' },
  { name: 'Vertex AI',     img: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=64' },
];

const DOUBLED = [...PROVIDERS, ...PROVIDERS];

function ProviderMarquee() {
  return (
    <div className={styles.marqueeWrap}>
      <p className={styles.marqueeLabel}>100개 이상의 제공업체로 라우팅</p>
      <div className={styles.marqueeOuter}>
        <div className={styles.fadeLeft} />
        <div className={styles.fadeRight} />
        <div className={styles.marqueeTrack}>
          {DOUBLED.map((p, i) => (
            <span key={i} className={styles.marqueeItem}>
              <img src={p.img} alt={p.name} width={18} height={18} className={styles.marqueeIcon} />
              <span>{p.name}</span>
              <span className={styles.marqueeSep}>|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Post row ──────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function AuthorList({authors}) {
  if (!authors || authors.length === 0) return null;
  return (
    <>
      {authors.map((a, i) => (
        <React.Fragment key={a.name}>
          {i > 0 && <span className={styles.authorSep}> </span>}
          {a.url ? (
            <a href={a.url} target="_blank" rel="noopener" className={styles.authorLink}>{a.name}</a>
          ) : (
            <span className={styles.authorName}>{a.name}</span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function PostRow({post}) {
  const {title, permalink, date, description, authors} = post;
  return (
    <article className={styles.post}>
      <Link to={permalink} className={styles.titleLink}>
        <h2 className={styles.title}>{title}</h2>
      </Link>
      {description && <p className={styles.desc}>{description}</p>}
      <div className={styles.meta}>
        <AuthorList authors={authors} />
        {authors && authors.length > 0 && <span className={styles.metaDash}> — </span>}
        <time className={styles.date} dateTime={date}>{formatDate(date)}</time>
      </div>
    </article>
  );
}

function Pagination({metadata}) {
  const {previousPage, nextPage} = metadata;
  if (!previousPage && !nextPage) return null;
  return (
    <nav className={styles.pagination} aria-label="블로그 목록 페이지네이션">
      {previousPage ? <Link to={previousPage} className={styles.pageLink}>&larr; 최신 글</Link> : <span />}
      {nextPage ? <Link to={nextPage} className={styles.pageLink}>이전 글 &rarr;</Link> : <span />}
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function BlogListPage(props) {
  const items = props.items || [];
  const metadata = props.metadata || {};
  const [activeTab, setActiveTab] = useState('all');
  const filtered = filterItems(items, activeTab);

  return (
    <Layout
      title="엔지니어링 블로그"
      description="세계에서 가장 널리 사용되는 오픈 소스 AI Gateway를 만드는 방법. 라우팅, 안정성, 관측성, 그리고 그 과정에서 배우는 것들."
    >
      <div className={styles.page}>
        {/* Hero */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>AI Gateway</p>
          <h1 className={styles.heroTitle}>엔지니어링</h1>
          <p className={styles.heroSub}>
            세계에서 가장 널리 사용되는 오픈 소스 AI Gateway를 만드는 방법.
            라우팅, 안정성, 관측성, 그리고 그 과정에서 배우는 것들.
          </p>
          <a href="https://jobs.ashbyhq.com/litellm" target="_blank" rel="noopener noreferrer" className={styles.hiringBtn}>
            채용 중입니다!
          </a>
        </header>

        <ProviderMarquee />

        {/* Tabs */}
        <nav className={styles.tabs} aria-label="카테고리별 글 필터링">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Post list */}
        <main className={styles.list}>
          {filtered.length === 0 && (
            <p className={styles.emptyMsg}>이 페이지에는 선택한 필터와 일치하는 글이 없습니다.</p>
          )}
          {filtered.map(({content}) => (
            <PostRow key={content.metadata.permalink} post={content.metadata} />
          ))}
        </main>

        <Pagination metadata={metadata} />
      </div>
    </Layout>
  );
}
