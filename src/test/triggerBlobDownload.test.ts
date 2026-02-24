import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { triggerBlobDownload } from '../services/api'

describe('triggerBlobDownload', () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // jsdom doesn't implement URL.createObjectURL / revokeObjectURL – mock them
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn().mockReturnValue('blob:mock-url'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: vi.fn(),
    })

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

    clickSpy = vi.fn()
    const originalCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag)
      if (tag === 'a') el.click = clickSpy
      return el
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates an object URL from the blob', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' })
    triggerBlobDownload(blob, 'test.pdf')
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
  })

  it('sets the correct download filename on the anchor', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' })
    triggerBlobDownload(blob, 'Evaluering_Emma_2026-02-24.pdf')
    const anchor = appendChildSpy.mock.calls[0]?.[0] as HTMLAnchorElement
    expect(anchor).toBeDefined()
    expect(anchor.download).toBe('Evaluering_Emma_2026-02-24.pdf')
    // href is what createObjectURL returned
    expect((URL.createObjectURL as ReturnType<typeof vi.fn>).mock.results[0].value).toBe('blob:mock-url')
  })

  it('appends then removes the anchor from the document', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' })
    triggerBlobDownload(blob, 'test.pdf')
    expect(appendChildSpy).toHaveBeenCalledTimes(1)
    expect(removeChildSpy).toHaveBeenCalledTimes(1)
  })

  it('triggers a click on the anchor', () => {
    const blob = new Blob(['test'])
    triggerBlobDownload(blob, 'test.docx')
    expect(clickSpy).toHaveBeenCalled()
  })

  it('revokes object URL after download', async () => {
    vi.useFakeTimers()
    const blob = new Blob(['content'])
    triggerBlobDownload(blob, 'file.pdf')
    await vi.runAllTimersAsync()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    vi.useRealTimers()
  })
})
