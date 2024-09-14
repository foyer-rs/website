import { themes as prismThemes } from 'prism-react-renderer';
import type { Config, MarkdownConfig } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'foyer',
  tagline: 'Hybrid Cache in Rust',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://foyer.rs',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'foyer-rs', // Usually your GitHub org/user name.
  projectName: 'foyer', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          sidebarCollapsed: false,
          sidebarCollapsible: false,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/foyer-rs/website/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/foyer-rs/website/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'foyer',
      logo: {
        alt: 'foyer logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'learnSidebar',
          position: 'left',
          label: 'Learn',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/blog/remote/CHANGELOG', label: 'Changelog', position: 'left' },
        {
          href: 'https://crates.io/crates/foyer',
          label: 'crates.io',
          position: 'right',
        },
        {
          href: 'https://docs.rs/foyer',
          label: 'Docs.rs',
          position: 'right',
        },
        {
          href: 'https://github.com/foyer-rs/foyer',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Github Discussions',
              href: 'https://github.com/foyer-rs/foyer/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/foyer-rs/foyer',
            },
            {
              label: 'Docs.rs',
              href: 'https://docs.rs/foyer',
            },
            {
              label: 'crates.io',
              href: 'https://crates.io/crates/foyer',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} foyer. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  markdown: {
    format: 'detect',
  },
  
  plugins: [
    [
      // https://github.com/rdilweb/docusaurus-plugin-remote-content
      "docusaurus-plugin-remote-content",
          {
              name: "remote",
              sourceBaseUrl: "https://raw.githubusercontent.com/foyer-rs/foyer/main/",
              outDir: "blog/remote",
              documents: ["CHANGELOG.md"],
          },
    ],
  ]
};

export default config;
