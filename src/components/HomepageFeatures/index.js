import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '빠른 시작',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        LiteLLM SDK와 프록시를 빠르게 설치하고 여러 LLM 제공자를 같은 인터페이스로 호출할 수 있습니다.
      </>
    ),
  },
  {
    title: '운영에 필요한 기능',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        라우팅, 예산, 키 관리, 로깅, 관측성 문서를 한국어 흐름으로 정리했습니다.
      </>
    ),
  },
  {
    title: '원본 구조 유지',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Docusaurus 3 테마, 사이드바, 정적 자산, 예제 코드는 원본 문서 사이트 구조를 따릅니다.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
