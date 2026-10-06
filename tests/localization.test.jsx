import { describe, expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { makeT, translations } from "../src/data/translations.js"
import { validateRequirementsJson } from "../src/utils/jsonValidation.js"
import { FileUploader } from "../src/components/Files.jsx"
import { RequirementsLoader } from "../src/components/RequirementsLoader.jsx"
import { PackageReadiness } from "../src/components/PackageReadiness.jsx"

function leafKeys(value, prefix = "") {
  return Object.entries(value)
    .flatMap(([key, item]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return item && typeof item === "object" && !Array.isArray(item)
        ? leafKeys(item, path)
        : [path]
    })
    .sort()
}

describe("bilingual messages", () => {
  test("both dictionaries cover the same messages and five official statuses", () => {
    expect(leafKeys(translations.bn)).toEqual(leafKeys(translations.en))
    expect(Object.keys(translations.en.statuses).sort()).toEqual([
      "expired",
      "expiry_needed",
      "missing",
      "not_provided",
      "ok",
    ])
  })

  test("existing validation descriptors display in the current language", () => {
    const { errors } = validateRequirementsJson({ requirements: [] })
    const english = renderToStaticMarkup(
      <RequirementsLoader errors={errors} t={makeT("en")} />,
    )
    const bangla = renderToStaticMarkup(
      <RequirementsLoader errors={errors} t={makeT("bn")} />,
    )
    expect(english).toContain(translations.en.json_tender_required)
    expect(bangla).toContain(translations.bn.json_tender_required)
    expect(bangla).not.toContain(translations.en.json_tender_required)
    expect(JSON.stringify(errors)).not.toContain(
      translations.en.json_tender_required,
    )
  })

  test("existing upload messages translate on switching and preserve filenames", () => {
    const messages = [
      {
        id: "bad",
        key: "tooMany",
        vars: { max: 30, n: 2 },
        names: ["a.pdf", "b.pdf"],
      },
    ]
    const english = renderToStaticMarkup(
      <FileUploader messages={messages} t={makeT("en")} />,
    )
    const bangla = renderToStaticMarkup(
      <FileUploader messages={messages} t={makeT("bn")} />,
    )
    expect(english).toContain("Only 30 PDFs")
    expect(bangla).toContain("সর্বোচ্চ 30টি PDF")
    expect(bangla).toContain("a.pdf, b.pdf")
    expect(english).toContain("50 MB combined")
  })

  test("every validator and generation error has both locale messages and interpolation", () => {
    const vars = { field: "tender.title", id: "R01", index: 2, order: 1 }
    const validationKeys = [
      "json_object_required",
      "json_tender_required",
      "json_field_required",
      "json_deadline_invalid",
      "json_requirements_required",
      "json_requirement_object",
      "json_duplicate_id",
      "json_boolean_required",
      "json_order_invalid",
      "json_duplicate_order",
    ]
    for (const lang of ["en", "bn"]) {
      const t = makeT(lang)
      for (const key of validationKeys) {
        const text = t(key, vars)
        expect(text).not.toBe(key)
        expect(text).not.toMatch(/\{\w+\}/)
      }
      for (const code of Object.keys(translations.en.generationErrors)) {
        const key = `generationErrors.${code}`
        const text = t(key, {
          title: "License",
          fileName: "license.pdf",
          field: "tender.title",
        })
        expect(text).not.toBe(key)
        expect(text).not.toMatch(/\{\w+\}/)
      }
    }
  })
})

describe("readiness rendering", () => {
  const props = {
    summary: { blocking: 0, optionalMissing: 0 },
    issues: [],
    plan: { docs: 1, pages: 1 },
    includeIndex: false,
    lang: "en",
    t: makeT("en"),
    result: { pageCount: 2, documents: [{}], fileName: "T_Package.pdf" },
  }

  test("pending intake or generation hides an old success and download action", () => {
    for (const state of [
      { pending: true },
      { generating: true },
      { summary: { blocking: 1, optionalMissing: 0 } },
    ]) {
      const markup = renderToStaticMarkup(
        <PackageReadiness {...props} {...state} />,
      )
      expect(markup).not.toContain(translations.en.success)
      expect(markup).not.toContain(translations.en.download)
      expect(markup).toContain("disabled")
    }
    expect(
      renderToStaticMarkup(<PackageReadiness {...props} pending />),
    ).toContain(translations.en.intakePending)
    expect(renderToStaticMarkup(<PackageReadiness {...props} />)).toContain(
      translations.en.download,
    )
  })

  test("generation errors translate on language switch without exposing diagnostics", () => {
    const genError = {
      code: "UNREADABLE_SOURCE",
      params: { fileName: "license.pdf" },
    }
    const markup = renderToStaticMarkup(
      <PackageReadiness
        {...props}
        result={null}
        genError={genError}
        lang="bn"
        t={makeT("bn")}
      />,
    )
    expect(markup).toContain("license.pdf")
    expect(markup).toContain("অন্তর্ভুক্ত করা যায়নি")
    expect(markup).not.toContain("UNREADABLE_SOURCE")
    const unknown = renderToStaticMarkup(
      <PackageReadiness
        {...props}
        result={null}
        genError={{ code: "INTERNAL_FAILURE", params: {} }}
      />,
    )
    expect(unknown).toContain(translations.en.genUnknown)
    expect(unknown).not.toContain("INTERNAL_FAILURE")
  })
})
