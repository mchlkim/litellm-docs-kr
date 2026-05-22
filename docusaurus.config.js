// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// @ts-ignore
const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
// @ts-ignore
const darkCodeTheme = require('prism-react-renderer/themes/nightOwl');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'liteLLM',
  tagline: 'LLM API 호출을 단순하게',
  favicon: 'img/favicon.ico', 

  // Set the production url of your site here
  url: 'https://mchlkim.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/litellm-docs-kr/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },
  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 100,
        max: 1920, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'release-notes',
        path: './release_notes',
        routeBasePath: 'release_notes',
        sidebarPath: require.resolve('./sidebars-release-notes.js'),
        async sidebarItemsGenerator({defaultSidebarItemsGenerator, docs, ...args}) {
          const items = await defaultSidebarItemsGenerator({docs, ...args});

          // Build map of doc id -> year from frontmatter date
          const docYearMap = {};
          for (const doc of docs) {
            const date = doc.frontMatter && doc.frontMatter.date;
            if (date) {
              const year = new Date(date).getFullYear();
              docYearMap[doc.id] = year;
            }
          }

          function parseVersion(str) {
            const match = (str || '').match(/v?(\d+)\.(\d+)\.(\d+)/);
            if (!match) return [0, 0, 0];
            return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
          }
          function compareVersionsDesc(a, b) {
            const [aMaj, aMin, aPatch] = parseVersion(a.label || a.id || '');
            const [bMaj, bMin, bPatch] = parseVersion(b.label || b.id || '');
            if (bMaj !== aMaj) return bMaj - aMaj;
            if (bMin !== aMin) return bMin - aMin;
            return bPatch - aPatch;
          }

          // Flatten and transform doc items (filter index, shorten labels)
          function flattenDocs(list) {
            const result = [];
            for (const item of list) {
              if (item.type === 'doc' && item.id === 'index') continue;
              if (item.type === 'doc') {
                const label = item.id.replace(/\/index$/, '');
                result.push({...item, label});
              } else if (item.type === 'category') {
                if (item.link && item.link.type === 'doc' && item.link.id !== 'index') {
                  const id = item.link.id;
                  const label = id.replace(/\/index$/, '');
                  result.push({type: 'doc', id, label});
                } else {
                  result.push(...flattenDocs(item.items));
                }
              }
            }
            return result;
          }

          const docItems = flattenDocs(items);

          // Group by year
          const byYear = {};
          for (const item of docItems) {
            const year = docYearMap[item.id] || 'Other';
            if (!byYear[year]) byYear[year] = [];
            byYear[year].push(item);
          }

          // Sort each year's items by version descending
          for (const year of Object.keys(byYear)) {
            byYear[year].sort(compareVersionsDesc);
          }

          // Build categories sorted by year descending
          const years = Object.keys(byYear).sort((a, b) => {
            // Object.keys() returns strings; avoid numeric subtraction type errors.
            const na = Number.parseInt(a, 10);
            const nb = Number.parseInt(b, 10);
            return nb - na;
          });
          return years.map(year => ({
            type: 'category',
            label: String(year),
            collapsed: year !== String(years[0]),
            items: byYear[year],
          }));
        },
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'blog',
        path: './blog',
        routeBasePath: 'blog',
        blogTitle: '블로그',
        blogSidebarTitle: '전체 글',
        blogSidebarCount: 'ALL',
        postsPerPage: 'ALL',
        showReadingTime: false,
        sortPosts: 'descending',
        include: ['**/index.{md,mdx}'],
        remarkPlugins: [require('./src/remark/raw-markdown')],
      },
    ],

  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [require('./src/remark/raw-markdown')],
        },
        blog: false, // Disable the default blog plugin from preset-classic
        pages: {},
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  scripts: [],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: 'may_townhall_2026_ko',
        content:
          '📅 <strong>LiteLLM 5월 타운홀</strong> — 5월 18일 월요일 오전 7:30(PST). 제품 업데이트, 로드맵, Q&A를 확인하세요. <a href="https://forms.gle/rVeiTtpY96EKLT9i9" target="_blank" rel="noopener noreferrer">등록하기 →</a>',
        backgroundColor: '#0078d4',
        textColor: '#ffffff',
        isCloseable: false,
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.png',
      navbar: {
        title: '🚅 LiteLLM',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '문서',
          },
          {
            type: 'docSidebar',
            sidebarId: 'learnSidebar',
            position: 'left',
            label: '학습',
          },
          {
            type: 'docSidebar',
            sidebarId: 'integrationsSidebar',
            position: 'left',
            label: '통합',
          },
          {
            position: 'left',
            label: '엔터프라이즈',
            to: "docs/enterprise"
          },
          { to: '/release_notes', label: '변경 이력', position: 'left' },
          { to: '/blog', label: '블로그', position: 'left' },
          {
            href: 'https://github.com/BerriAI/litellm',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub 저장소',
          },
          {
            href: 'https://www.litellm.ai/support',
            position: 'right',
            className: 'header-discord-link',
            'aria-label': 'Discord / Slack 커뮤니티',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '문서',
            items: [
              {
                label: '시작하기',
                to: '/docs/',
              },
            ],
          },
          {
            title: '커뮤니티',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.com/invite/wuPM9dRgDw',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/LiteLLM',
              },
            ],
          },
          {
            title: '더 보기',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/BerriAI/litellm/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} liteLLM`,
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
