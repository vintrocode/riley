import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "🥽 Plastic Labs",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "postHog",
    },
    baseUrl: "plasticlabs.ai",
    ignorePatterns: ["private", "templates"],
    locale: "en-US",
    defaultDateType: "created",
    theme: {
      cdnCaching: true,
      typography: {
        header: "Departure Mono",
        body: "Roboto Mono",
        code: "Ubuntu Mono",
      },
      colors: {
        lightMode: {
          light: "#E2E2E2",
          lightgray: "#4e4e4e", //code, graph, outline
          gray: "#4e4e4e", // graph nodes
          darkgray: "#4e4e4e",
          dark: "#4E4E4E",
          secondary: "#4e4e4e",
          tertiary: "#C0FFE1",
          customCallout: "rgba(183, 255, 236, 0.35)",
          highlight: "rgba(128, 128, 128, 0.35)", //code bg, note bg, graph bg (ONLY ON LIGHT MODE)
          searchBackground: "#D3D3D3",
        },
        darkMode: {
          light: "#191919",
          lightgray: "#393639", //code, graph edges, outline
          gray: "#E2E2E2", //graph nodes
          darkgray: "#E2E2E2",
          dark: "#ebebec",
          secondary: "#7C7C7C",
          tertiary: "#C0FFE1",
          highlight: "rgba(125, 125, 125, 0.15)", //code bg, note bg
          customCallout: "#00b8d410",
          searchBackground: "#252525",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown({ enableSmartyPants: false }),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources({ fontOrigin: "googleFonts" }),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
