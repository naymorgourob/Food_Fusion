import { Container, Section, SectionHeading, Reveal, Photo } from '@/components/landing/primitives'
import { GALLERY } from '@/pages/landing/content'

/**
 * Section 11 — gallery.
 *
 * CSS Grid with per-item col/row spans rather than a JS masonry library:
 * the layout is fixed and known, so spans give the same composed wall with
 * no extra dependency and no layout shift after images load.
 */
export function GallerySection() {
  return (
    <Section id="gallery" tone="alt">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Gallery"
          title="A look inside the room"
          lead="The dining room, the pass, and a few of the plates that leave it."
        />

        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 lg:grid-cols-4">
          {GALLERY.map((image, index) => (
            <Reveal
              key={image.src}
              delay={index * 0.06}
              className={`group relative overflow-hidden rounded-2xl ${image.span}`}
            >
              <Photo
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Caption scrim, revealed on hover/focus. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <span className="text-sm font-medium text-white">{image.alt}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
