import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { Evaluation } from '../pages/Evaluation'
import type { Evaluation as EvaluationModel } from '../types/Evaluation'

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('../services/evaluationApi', () => ({
  useEvaluations: () => ({
    data: [mockEvaluation],
    isLoading: false,
  }),
  useCreateEvaluation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateEvaluation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteEvaluation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExportEvaluation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    variables: undefined,
    error: null,
  }),
}))

vi.mock('../services/studentApi', () => ({
  useStudents: () => ({
    data: [
      {
        id: 1,
        navn: 'Emma Christensen',
        status: 'Indskrevet',
      },
    ],
    isLoading: false,
  }),
}))

vi.mock('../services/classApi', () => ({
  useClasses: () => ({
    data: [
      {
        id: 10,
        navn: 'V2',
        fag: 'V2',
        lærer: 'KESO',
        modulperiode: '26-1-M1',
        status: 'Igangværende',
        students: [{ id: 1, navn: 'Emma Christensen' }],
      },
    ],
    isLoading: false,
  }),
}))

vi.mock('../data/mockClasses', () => ({
  availableFag: ['V2', 'V3', 'MARA'],
}))

// ── Test data ────────────────────────────────────────────────────────────────

const mockEvaluation: EvaluationModel = {
  id: 42,
  studentId: 1,
  holdId: 10,
  type: 'Formativ',
  dato: '2026-02-24',
  modulperiode: '26-1-M1',
  oprettetAf: 'KESO',
  createdAt: '2026-02-24T15:19:07.000000Z',
  updatedAt: '2026-02-24T15:19:07.000000Z',
  fagligtMål: {
    individueleMål: 'At gennemføre V2',
    læringsmål: 'Alle læringsmål opfyldt',
    indholdOgHandlinger: 'Følger undervisning',
    opfyldelseskriterier: 'Bestået eksamen',
  },
  personligtMål: {
    individueleMål: 'Blive mere åben',
    læringsmål: '',
    indholdOgHandlinger: '',
    opfyldelseskriterier: '',
  },
  socialtMål: { individueleMål: '', læringsmål: '', indholdOgHandlinger: '', opfyldelseskriterier: '' },
  arbejdsmæssigtMål: { individueleMål: '', læringsmål: '', indholdOgHandlinger: '', opfyldelseskriterier: '' },
  evalueringSenesteMål: '',
  næsteModulPrioritet1: '',
  næsteModulPrioritet2: '',
  næsteModulPrioritet3: '',
  bemærkninger: '',
}

// ── Test wrapper ─────────────────────────────────────────────────────────────

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MantineProvider forceColorScheme="light">
          <Notifications />
          {ui}
        </MantineProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function loadEvaluationInUI() {
  // 1. Click class card — clicking the modulperiode text bubbles up to the Card's onClick
  const modulText = await screen.findByText('26-1-M1')
  fireEvent.click(modulText)

  // 2. Click student card — clicking the name text bubbles up to the Card's onClick
  const studentText = await screen.findByText('Emma Christensen')
  fireEvent.click(studentText)

  // 3. Click the eval card's inner <div style={{cursor:'pointer'}}> which has the loadEvaluation onClick.
  //    The 'KESO' oprettetAf <p> is a direct child of that div.
  await screen.findByText('Tidligere evalueringer')
  const kesoEls = screen.getAllByText('KESO')
  // Last 'KESO' is in the eval card (oprettetAf); its parentElement IS the cursor div
  fireEvent.click(kesoEls[kesoEls.length - 1].parentElement!)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Evaluation Export Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the evaluation page without crashing', () => {
    renderWithProviders(<Evaluation />)
    expect(screen.getByText('Hold')).toBeDefined()
  })

  it('shows class cards for active classes', async () => {
    renderWithProviders(<Evaluation />)
    expect(await screen.findByText('KESO')).toBeDefined()
  })

  it('shows students in the selected class after clicking a class', async () => {
    renderWithProviders(<Evaluation />)
    // Click any text in the class card — event bubbles to Card's onClick
    fireEvent.click(await screen.findByText('26-1-M1'))
    expect(await screen.findByText('Elever')).toBeDefined()
    expect(await screen.findByText('Emma Christensen')).toBeDefined()
  })

  it('shows "Opret evaluering" and previous evaluations after clicking a student', async () => {
    renderWithProviders(<Evaluation />)

    fireEvent.click(await screen.findByText('26-1-M1'))
    fireEvent.click(await screen.findByText('Emma Christensen'))

    expect(await screen.findByText('Opret evaluering')).toBeDefined()
    expect(await screen.findByText('Tidligere evalueringer')).toBeDefined()
  })

  it('opens the export modal when "Eksportér til fil" button is clicked', async () => {
    renderWithProviders(<Evaluation />)
    await loadEvaluationInUI()

    const exportBtn = await screen.findByText('Eksporter til fil')
    fireEvent.click(exportBtn)

    // Modal should open with PDF and DOCX buttons
    expect(await screen.findByText('Download PDF')).toBeDefined()
    expect(await screen.findByText('Download DOCX')).toBeDefined()
  })

  it('shows scope selector in the export modal', async () => {
    renderWithProviders(<Evaluation />)
    await loadEvaluationInUI()

    const exportBtn = await screen.findByText('Eksporter til fil')
    fireEvent.click(exportBtn)

    // Scope segmented control should have Formativ and Summativ only (no 'Begge')
    expect(await screen.findByText('Formativ')).toBeDefined()
    expect(await screen.findByText('Summativ')).toBeDefined()
    expect(screen.queryByText('Begge')).toBeNull()
    // PDF notice should be visible
    expect(await screen.findByText(/PDF-generering kan tage/)).toBeDefined()
    // All three download buttons should be present
    expect(await screen.findByText('Download PDF')).toBeDefined()
    expect(await screen.findByText('Download DOCX')).toBeDefined()
    expect(await screen.findByText('Download TXT')).toBeDefined()
  })

  it('calls useExportEvaluation with format=pdf when Download PDF is clicked', async () => {
    renderWithProviders(<Evaluation />)
    await loadEvaluationInUI()

    const exportBtn = await screen.findByText('Eksporter til fil')
    fireEvent.click(exportBtn)

    const pdfBtn = await screen.findByText('Download PDF')
    fireEvent.click(pdfBtn)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42, format: 'pdf' })
      )
    })
  })

  it('calls useExportEvaluation with format=docx when Download DOCX is clicked', async () => {
    renderWithProviders(<Evaluation />)
    await loadEvaluationInUI()

    const exportBtn = await screen.findByText('Eksporter til fil')
    fireEvent.click(exportBtn)

    const docxBtn = await screen.findByText('Download DOCX')
    fireEvent.click(docxBtn)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42, format: 'docx' })
      )
    })
  })

  it('calls useExportEvaluation with format=txt when Download TXT is clicked', async () => {
    renderWithProviders(<Evaluation />)
    await loadEvaluationInUI()

    const exportBtn = await screen.findByText('Eksporter til fil')
    fireEvent.click(exportBtn)

    const txtBtn = await screen.findByText('Download TXT')
    fireEvent.click(txtBtn)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42, format: 'txt' })
      )
    })
  })
})
