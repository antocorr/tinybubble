import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('bash', bash)

export function CodeBlock({ code, lang = 'javascript', filename = '' }) {
  const highlighted = hljs.highlight(code.trim(), { language: lang }).value
  const header = filename
    ? `<div class="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700
                   rounded-t-lg text-xs text-gray-400 font-mono">
         <span class="w-2.5 h-2.5 rounded-full bg-red-500/70 shrink-0"></span>
         <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/70 shrink-0"></span>
         <span class="w-2.5 h-2.5 rounded-full bg-green-500/70 shrink-0"></span>
         <span class="ml-2">${filename}</span>
       </div>`
    : ''
  const roundedClass = filename ? 'rounded-b-lg rounded-t-none' : 'rounded-lg'

  const wrapper = document.createElement('div')
  wrapper.className = 'group relative my-5 not-prose'
  wrapper.innerHTML = `
    ${header}
    <pre class="!mt-0 bg-[#22272e] overflow-x-auto ${roundedClass}"><code class="hljs language-${lang}">${highlighted}</code></pre>
    <button class="copy-btn absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded
                   bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors
                   opacity-0 group-hover:opacity-100">Copy</button>
  `

  const btn = wrapper.querySelector('.copy-btn')
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(code.trim()).then(() => {
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = 'Copy' }, 1800)
    })
  })

  return wrapper
}

/**
 * Find all [data-code="key"] slots inside el and replace them with CodeBlock elements.
 * @param {HTMLElement} el
 * @param {Record<string, {code, lang?, filename?}>} blocks
 */
export function injectCodeBlocks(el, blocks) {
  el.querySelectorAll('[data-code]').forEach(slot => {
    const key = slot.dataset.code
    if (blocks[key]) slot.replaceWith(CodeBlock(blocks[key]))
  })
}
