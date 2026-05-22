import React from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

export default function TOC({ className, ...props }) {
  return (
    <div className={clsx(styles.tableOfContents, className)}>
      {/* Scrollable TOC items */}
      <div className={clsx(styles.tocItemsContainer, 'thin-scrollbar')}>
        <TOCItems
          {...props}
          linkClassName={LINK_CLASS_NAME}
          linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
        />
      </div>

      {/* Enterprise promo card pinned at the bottom */}
      <div className={styles.promoCard}>
        <div className={styles.promoEmoji}>🚅</div>
        <div className={styles.promoHeading}>LiteLLM Enterprise</div>
        <div className={styles.promoDescription}>
          SSO/SAML, 감사 로그, 지출 추적, 멀티 팀 관리,
          가드레일을 프로덕션용으로 제공합니다.
        </div>
        <Link to="/docs/enterprise" className={styles.promoButton}>
          자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
