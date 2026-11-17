import { ExternalLink } from 'lucide-react'
import { Link } from 'wouter'
import { resolveGuideTarget } from '../../lib/guideHref.ts'
import { parseMarkdownBlocks } from '../../lib/markdownBlocks.ts'
import { STATIC_GUIDE_SECTIONS } from '../../pages/staticGuideContent.ts'
import type { StaticPageDto } from '../../types/workspace.ts'

export function StaticGuideBody({ slug, page }: { slug: string; page: StaticPageDto }) {
  const blocks = parseMarkdownBlocks(page.contentMarkdown)
  const supplemental = STATIC_GUIDE_SECTIONS[slug] ?? []

  return (
    <article className="sf-stack" aria-labelledby="static-guide-title">
      <header className="sf-surface cat-header-card sf-stack" style={{ gap: 'var(--space-2)' }}>
        <div className="dash-controls">
          <h1 id="static-guide-title" className="sf-heading-display">
            {page.title}
          </h1>
          <span className="sf-text-muted">Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
        </div>
        <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
          {blocks.map((block, idx) =>
            block.kind === 'heading' ? (
              <h2 key={idx} className="sf-heading-section">{block.text}</h2>
            ) : block.kind === 'list' ? (
              <ul key={idx} style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
                {block.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p key={idx}>{block.text}</p>
            ),
          )}
        </div>
      </header>

      {page.links.length > 0 ? (
        <section className="sf-surface cat-header-card sf-stack" aria-label="Related guides and resources">
          <h2 className="sf-heading-section">Quick links</h2>
          <div className="guide-links-grid">
            {page.links.map((item) => {
              const target = resolveGuideTarget(item.href, Boolean(item.external))
              return target.isExternal ? (
                <a key={item.label} href={target.href} target="_blank" rel="noreferrer noopener" className="cat-subcat-tile">
                  <span className="sf-row" style={{ justifyContent: 'space-between' }}>
                    <strong>{item.label}</strong>
                    <ExternalLink size={16} aria-hidden="true" />
                  </span>
                </a>
              ) : (
                <Link key={item.label} href={target.href} className="cat-subcat-tile">
                  <strong>{item.label}</strong>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {supplemental.length > 0 ? (
        <section className="sf-surface cat-header-card sf-stack" aria-label="Reference sections">
          <h2 className="sf-heading-section">Documentation index</h2>
          <div className="sf-stack">
            {supplemental.map((entry) => (
              <section key={entry.id} id={entry.id} className="guide-section-card sf-stack" style={{ gap: 'var(--space-2)' }}>
                <h3 style={{ fontSize: 'var(--text-h3)', fontWeight: 600 }}>{entry.title}</h3>
                <p className="sf-text-muted">{entry.summary}</p>
                <ol style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'grid', gap: 'var(--space-1)' }}>
                  {entry.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </section>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
