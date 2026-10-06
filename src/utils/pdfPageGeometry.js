import {
  PDFArray,
  PDFDict,
  PDFName,
  clip,
  endPath,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
} from "pdf-lib"

export const FOOTER_BAND = 36

/** Visible PDF area is the intersection of CropBox and MediaBox. */
export function visiblePageBox(page) {
  const crop = page.getCropBox(),
    media = page.getMediaBox()
  const x = Math.max(crop.x, media.x),
    y = Math.max(crop.y, media.y)
  return {
    x,
    y,
    width: Math.min(crop.x + crop.width, media.x + media.width) - x,
    height: Math.min(crop.y + crop.height, media.y + media.height) - y,
  }
}

/** Extends the visual bottom without moving source marks or annotation coordinates. */
export function footerGeometry(page, band = FOOTER_BAND) {
  const box = visiblePageBox(page)
  const rotation = ((page.getRotation().angle % 360) + 360) % 360
  if (
    box.width <= 0 ||
    box.height <= 0 ||
    ![0, 90, 180, 270].includes(rotation)
  )
    throw new Error("Unsupported PDF geometry")
  const crop = { ...box }
  if (rotation === 0) {
    crop.y -= band
    crop.height += band
  }
  if (rotation === 90) crop.width += band
  if (rotation === 180) crop.height += band
  if (rotation === 270) {
    crop.x -= band
    crop.width += band
  }
  return {
    source: box,
    crop,
    rotation,
    band,
    visualWidth: rotation % 180 ? box.height : box.width,
  }
}

/** Keep existing marks clipped: extending a crop must not reveal formerly hidden content. */
export function reserveFooterBand(page, geometry) {
  const { source, crop } = geometry
  const annotations = page.node.Annots()
  if (annotations)
    for (let i = 0; i < annotations.size(); i++) {
      const annotation = annotations.lookup(i, PDFDict)
      if (annotation.get(PDFName.of("Subtype")) === PDFName.of("Widget"))
        throw new Error("Orphaned form widget")
      const rect = annotation
        .lookup(PDFName.of("Rect"), PDFArray)
        ?.asRectangle()
      // Annotations render outside content-stream clipping. Reject those whose
      // appearance could leak into the newly exposed area instead of altering it.
      if (
        !rect ||
        rect.x < source.x ||
        rect.y < source.y ||
        rect.x + rect.width > source.x + source.width ||
        rect.y + rect.height > source.y + source.height
      ) {
        throw new Error("Annotation extends outside the visible page")
      }
    }
  page.node.normalize()
  const context = page.doc.context
  const start = context.register(
    context.contentStream([
      pushGraphicsState(),
      rectangle(source.x, source.y, source.width, source.height),
      clip(),
      endPath(),
    ]),
  )
  const end = context.register(context.contentStream([popGraphicsState()]))
  page.node.wrapContentStreams(start, end)
  // Start a fresh stream after Q; generated cover/index pages already have a
  // cached drawing stream, which must not receive the footer inside the clip.
  page.resetPosition()
  const media = page.getMediaBox()
  const x = Math.min(media.x, crop.x),
    y = Math.min(media.y, crop.y)
  page.setMediaBox(
    x,
    y,
    Math.max(media.x + media.width, crop.x + crop.width) - x,
    Math.max(media.y + media.height, crop.y + crop.height) - y,
  )
  page.setCropBox(crop.x, crop.y, crop.width, crop.height)
}
