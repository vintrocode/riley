import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import path from "path"

import style from "../styles/listPage.scss"
import { PageList } from "../PageList"
import { stripSlashes, simplifySlug } from "../../util/path"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"

interface FolderContentOptions {
  /**
   * Whether to display number of folders
   */
  showFolderCount: boolean
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props
    const folderSlug = stripSlashes(simplifySlug(fileData.slug!))
    const allPagesInFolder = allFiles.filter((file) => {
      const fileSlug = stripSlashes(simplifySlug(file.slug!))
      const prefixed = fileSlug.startsWith(folderSlug) && fileSlug !== folderSlug
      const folderParts = folderSlug.split(path.posix.sep)
      const fileParts = fileSlug.split(path.posix.sep)
      const isDirectChild = fileParts.length === folderParts.length + 1
      return prefixed && isDirectChild
    })

    // Get all unique tags
    const allTags = new Set<string>()
    allPagesInFolder.forEach(file => {
      const tags = file.frontmatter?.tags ?? []
      tags.forEach(tag => allTags.add(tag))
    })
    const sortedTags = Array.from(allTags).sort()

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = ["popover-hint", "disable-card-preview", ...cssClasses].join(" ")
    const listProps = {
      ...props,
      allFiles: allPagesInFolder,
    }

    const content =
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)

    // Add client-side filtering script
    const filterScript = `
      let isInitialized = false;

      function initializeTagFiltering() {
        // Prevent double initialization
        if (isInitialized) {
          return;
        }

        const selectedTags = new Set()
        const cards = document.querySelectorAll('.section-li')
        const countEl = document.querySelector('.folder-count')
        const tagButtons = document.querySelectorAll('.tag-filter-btn')
        
        if (!cards.length || !tagButtons.length) {
          return; // Don't initialize if elements aren't present
        }

        isInitialized = true;
        
        function updateVisibility() {
          let visibleCount = 0
          cards.forEach(card => {
            try {
              const tagsAttr = card.getAttribute('data-tags')
              const tags = JSON.parse(tagsAttr || '[]')
              const shouldShow = selectedTags.size === 0 || 
                tags.some(tag => selectedTags.has(tag))
              card.style.display = shouldShow ? '' : 'none'
              if (shouldShow) visibleCount++
            } catch (e) {
              console.error('Error processing card:', e)
            }
          })
          
          if (countEl) {
            const countText = ${JSON.stringify(i18n(cfg.locale).pages.folderContent.itemsUnderFolder({count: 0}))}
            countEl.textContent = countText.replace('0', visibleCount.toString())
          }
        }

        tagButtons.forEach(btn => {
          // Remove any existing listeners first
          const newBtn = btn.cloneNode(true)
          btn.parentNode.replaceChild(newBtn, btn)
          
          newBtn.addEventListener('click', () => {
            const tag = newBtn.getAttribute('data-tag')
            if (selectedTags.has(tag)) {
              selectedTags.delete(tag)
              newBtn.classList.remove('selected')
            } else {
              selectedTags.add(tag)
              newBtn.classList.add('selected')
            }
            updateVisibility()
          })
        })
      }

      // Initialize on first load
      initializeTagFiltering()
      
      // Handle client-side navigation
      document.addEventListener('nav', () => {
        isInitialized = false;
        setTimeout(initializeTagFiltering, 0)
      })

      // Backup initialization for edge cases
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTagFiltering)
      } else {
        setTimeout(initializeTagFiltering, 0)
      }
    `

    return (
      <div class={classes}>
        <article>
          <p>{content}</p>
        </article>
        <div class="page-listing">
          <div class="tag-filter">
            {sortedTags.map(tag => (
              <button
                data-tag={tag}
                class="tag-filter-btn"
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
          {options.showFolderCount && (
            <p class="folder-count">
              {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                count: allPagesInFolder.length,
              })}
            </p>
          )}
          <div>
            <PageList {...listProps} />
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: filterScript }} />
      </div>
    )
  }

  FolderContent.css = style + PageList.css
  return FolderContent
}) satisfies QuartzComponentConstructor
