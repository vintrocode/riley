import { Root as HTMLRoot } from "hast"
import { toString } from "hast-util-to-string"
import { QuartzTransformerPlugin } from "../types"
import { escapeHTML } from "../../util/escape"

export interface Options {
  descriptionLength: number
  replaceExternalLinks: boolean
}

const defaultOptions: Options = {
  descriptionLength: 150,
  replaceExternalLinks: true,
}

const urlRegex = new RegExp(
  /(https?:\/\/)?(?<domain>([\da-z\.-]+)\.([a-z\.]{2,6})(:\d+)?)(?<path>[\/\w\.-]*)(\?[\/\w\.=&;-]*)?/,
  "g",
)

export const Description: QuartzTransformerPlugin<Partial<Options> | undefined> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "Description",
    htmlPlugins() {
      return [
        () => {
          return async (tree: HTMLRoot, file) => {
            let frontMatterDescription = file.data.frontmatter?.description
            let text = escapeHTML(toString(tree))

            if (opts.replaceExternalLinks) {
              frontMatterDescription = frontMatterDescription?.replace(
                urlRegex,
                "$<domain>" + "$<path>",
              )
              text = text.replace(urlRegex, "$<domain>" + "$<path>")
            }

            const desc = frontMatterDescription ?? text
            // const sentences = desc.replace(/\s+/g, " ").split(/\.\s/)
            const sentences = desc.replace(/\s+/g, " ").split(/[.!?]\s+/)
            const finalDesc: string[] = []
            const len = opts.descriptionLength
            // let sentenceIdx = 0
            let currentDescriptionLength = 0

            const endPunctuation = /[.!?]$/

            for (const sentence of sentences) {
              if (currentDescriptionLength >= len) break

              const currentSentence = endPunctuation.test(sentence) ? sentence : sentence + "."
              finalDesc.push(currentSentence)
              currentDescriptionLength += currentSentence.length
            }

            // Trim the last sentence if it exceeds the length limit
            if (currentDescriptionLength > len && finalDesc.length > 1) {
              finalDesc.pop()
            }

            // if (sentences[0] !== undefined && sentences[0].length >= len) {
            //   const firstSentence = sentences[0].split(" ")
            //   while (currentDescriptionLength < len) {
            //     const sentence = firstSentence[sentenceIdx]
            //     if (!sentence) break
            //     finalDesc.push(sentence)
            //     currentDescriptionLength += sentence.length
            //     sentenceIdx++
            //   }
            //   finalDesc.push("...")
            // } else {
            //   while (currentDescriptionLength < len) {
            //     const sentence = sentences[sentenceIdx]
            //     if (!sentence) break
            //     const currentSentence = sentence.endsWith(".") ? sentence : sentence + "."
            //     finalDesc.push(currentSentence)
            //     currentDescriptionLength += currentSentence.length
            //   }
            // }

            file.data.description = finalDesc.join(" ").trim()
            file.data.text = text
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    description: string
    text: string
  }
}
