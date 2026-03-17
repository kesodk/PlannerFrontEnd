import { useState, useRef, useEffect } from 'react'
import {
  Grid,
  Card,
  Title,
  Stack,
  Text,
  Group,
  Badge,
  Button,
  Tabs,
  Select,
  Table,
  Modal,
  ActionIcon,
  Tooltip,
  Paper,
  Loader,
  Center,
  Divider,
  SegmentedControl,
  Alert,
  Switch,
  Textarea,
} from '@mantine/core'
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconList, IconListNumbers, IconClearFormatting, IconLink, IconCheck, IconX, IconTrash, IconPlus, IconFileTypePdf, IconFileWord, IconFileText } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useStudents } from '../services/studentApi'
import { useClasses } from '../services/classApi'
import { useEvaluations, useCreateEvaluation, useUpdateEvaluation, useDeleteEvaluation, useExportEvaluation, useStudentAftaler, useCreateStudentAftale, useToggleStudentAftale } from '../services/evaluationApi'
import { availableFag } from '../data/mockClasses'
import type { Evaluation, EvaluationGoal } from '../types/Evaluation'
import { useAuth } from '../contexts/AuthContext'

// Column and section styles for evaluation tables
const EVAL_STYLES = {
  sectionHeader: {
    fontWeight: 600,
    fontSize: 15,
    color: 'light-dark(var(--mantine-color-blue-9), var(--mantine-color-dark-1))',
    padding: '10px 10px',
    backgroundColor: 'light-dark(var(--mantine-color-blue-1), var(--mantine-color-dark-9))',
    borderRadius: '4px 4px 0 0',
    border: '1px solid var(--mantine-color-default-border)',
    borderBottom: 'none',
  },
  thRow: { borderBottom: '1px solid var(--mantine-color-default-border)' },
  th1: { backgroundColor: 'transparent', color: 'var(--mantine-color-dimmed)', borderRight: '1px solid var(--mantine-color-default-border)', fontWeight: 600 as const },
  th2: { backgroundColor: 'light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.03))', color: 'var(--mantine-color-dimmed)', borderRight: '1px solid var(--mantine-color-default-border)', fontWeight: 600 as const },
  th3: { backgroundColor: 'transparent', color: 'var(--mantine-color-dimmed)', borderRight: '1px solid var(--mantine-color-default-border)', fontWeight: 600 as const },
  th4: { backgroundColor: 'light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.03))', color: 'var(--mantine-color-dimmed)', fontWeight: 600 as const },
  td1: { backgroundColor: 'transparent', borderRight: '1px solid var(--mantine-color-default-border)', width: '25%', maxWidth: '25%', verticalAlign: 'top' as const },
  td2: { backgroundColor: 'light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.03))', borderRight: '1px solid var(--mantine-color-default-border)', width: '25%', maxWidth: '25%', verticalAlign: 'top' as const },
  td3: { backgroundColor: 'transparent', borderRight: '1px solid var(--mantine-color-default-border)', width: '25%', maxWidth: '25%', verticalAlign: 'top' as const },
  td4: { backgroundColor: 'light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.03))', width: '25%', maxWidth: '25%', verticalAlign: 'top' as const },
}

// Global Toolbar Component
function GlobalToolbar({ onExport, onSave, isSaving }: {
  onExport?: () => void
  onSave?: () => void
  isSaving?: boolean
}) {
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const handleLink = () => {
    const url = window.prompt('Indsæt URL:')
    if (url) {
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
      document.execCommand('createLink', false, normalizedUrl)
    }
  }

  return (
    <Paper shadow="sm" p="sm" mb="md" withBorder style={{ position: 'sticky', top: 'calc(-1 * var(--mantine-spacing-lg))', zIndex: 100, backgroundColor: 'var(--mantine-color-body)' }}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm">
          <Text size="sm" fw={500} mr="xs">Formatering:</Text>
          <Tooltip label="Fed">
            <ActionIcon variant="default" size="lg" onClick={() => execCommand('bold')}>
              <IconBold size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Kursiv">
            <ActionIcon variant="default" size="lg" onClick={() => execCommand('italic')}>
              <IconItalic size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Understreget">
            <ActionIcon variant="default" size="lg" onClick={() => execCommand('underline')}>
              <IconUnderline size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Gennemstreget">
            <ActionIcon variant="default" size="lg" onClick={() => execCommand('strikeThrough')}>
              <IconStrikethrough size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Punktliste">
            <ActionIcon variant="default" size="lg" onClick={() => execCommand('insertUnorderedList')}>
              <IconList size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Nummereret liste">
            <ActionIcon variant="default" size="lg" onClick={() => execCommand('insertOrderedList')}>
              <IconListNumbers size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Ryd formatering">
            <ActionIcon variant="default" size="lg" onClick={() => execCommand('removeFormat')}>
              <IconClearFormatting size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Indsæt link">
            <ActionIcon variant="default" size="lg" onClick={handleLink}>
              <IconLink size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
        {onSave && (
          <Group gap="sm" wrap="nowrap">
            <Button size="sm" color="blue" variant="outline" onClick={onExport}>
              Eksporter til fil
            </Button>
            <Button size="sm" color="orange" onClick={onSave} loading={isSaving}>
              Gem
            </Button>
          </Group>
        )}
      </Group>
    </Paper>
  )
}

// Editable Field Component
function EditableField({ value, onChange, disabled = false, minHeight = 70, padding = '10px 12px' }: { value: string; onChange: (value: string) => void; disabled?: boolean; minHeight?: number; padding?: string }) {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (divRef.current && divRef.current.innerHTML !== value) {
      divRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (divRef.current) {
      onChange(divRef.current.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey) {
      const target = (e.target as HTMLElement).closest('a')
      if (target?.href) {
        e.preventDefault()
        window.open(target.href, '_blank', 'noopener,noreferrer')
      }
    }
  }

  return (
    <div
      ref={divRef}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      onClick={handleClick}
      style={{
        minHeight: `${minHeight}px`,
        width: '100%',
        maxWidth: '100%',
        padding,
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
        textAlign: 'left',
        direction: 'ltr',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontSize: '14px',
        lineHeight: '1.65',
        letterSpacing: '0.01em',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'var(--mantine-color-text)',
        opacity: disabled ? 0.6 : 1,
      }}
    />
  )
}

export function Evaluation() {
  const { user } = useAuth()
  const [selectedHoldId, setSelectedHoldId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [evaluationType, setEvaluationType] = useState<'Formativ' | 'Summativ'>('Formativ')
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null)
  const [evaluationDrafts, setEvaluationDrafts] = useState<Record<'Formativ' | 'Summativ', Evaluation | null>>({
    Formativ: null,
    Summativ: null,
  })
  const [selectedEvaluationByType, setSelectedEvaluationByType] = useState<Record<'Formativ' | 'Summativ', number | null>>({
    Formativ: null,
    Summativ: null,
  })
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportScope, setExportScope] = useState<'formativ' | 'summativ'>('formativ')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [evaluationToDelete, setEvaluationToDelete] = useState<number | null>(null)
  const [newAftaleText, setNewAftaleText] = useState('')

  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const { data: evaluations = [], isLoading: evaluationsLoading } = useEvaluations()
  const createEvaluation = useCreateEvaluation()
  const updateEvaluation = useUpdateEvaluation()
  const deleteEvaluation = useDeleteEvaluation()
  const exportEvaluation = useExportEvaluation()
  const { data: studentAftaler = [], isLoading: aftaleLoading } = useStudentAftaler(selectedStudentId)
  const createAftale = useCreateStudentAftale()
  const toggleAftale = useToggleStudentAftale()

  const updateCurrentEvaluation = (evaluation: Evaluation | null) => {
    setCurrentEvaluation(evaluation)
    setEvaluationDrafts((prev) => ({
      ...prev,
      [evaluationType]: evaluation,
    }))
  }

  // Get active classes (Igangværende)
  const activeClasses = classes.filter(c => c.status === 'Igangværende')

  // Get students enrolled in selected class
  const studentsInClass = selectedHoldId
    ? students.filter(s => 
        classes.find(c => c.id === selectedHoldId)?.students?.some(enrolled => enrolled.id === s.id)
      )
    : []

  // Get evaluations for selected student (only include evaluations with valid ID)
  const studentEvaluations = selectedStudentId
    ? evaluations
        .filter(e => e.studentId === selectedStudentId && e.id)
        .sort((a, b) => {
          const bTime = new Date(b.createdAt || b.dato).getTime()
          const aTime = new Date(a.createdAt || a.dato).getTime()
          return bTime - aTime
        })
    : []

  // Initialize empty evaluation
  const initializeNewEvaluation = () => {
    if (!selectedStudentId || !selectedHoldId) return

    const classData = classes.find(c => c.id === selectedHoldId)
    
    const newEvaluation: Evaluation = {
      studentId: selectedStudentId,
      holdId: selectedHoldId,
      type: evaluationType,
      dato: new Date().toISOString().split('T')[0],
      modulperiode: classData?.modulperiode || '',
      oprettetAf: user?.initialer || 'UKENDT',
      fagligtMål: {
        individueleMål: '',
        læringsmål: '',
        indholdOgHandlinger: '',
        opfyldelseskriterier: ''
      },
      personligtMål: {
        individueleMål: '',
        læringsmål: '',
        indholdOgHandlinger: '',
        opfyldelseskriterier: ''
      },
      socialtMål: {
        individueleMål: '',
        læringsmål: '',
        indholdOgHandlinger: '',
        opfyldelseskriterier: ''
      },
      arbejdsmæssigtMål: {
        individueleMål: '',
        læringsmål: '',
        indholdOgHandlinger: '',
        opfyldelseskriterier: ''
      },
      evalueringSenesteMål: '',
      næsteModulPrioritet1: '',
      næsteModulPrioritet2: '',
      næsteModulPrioritet3: '',
      bemærkninger: '',
      forløbsplanMål: '',
      fagligtForløbsplanDelmål: '',
      personligtForløbsplanDelmål: '',
      socialtForløbsplanDelmål: '',
      arbejdsmæssigtForløbsplanDelmål: '',
      elevensEvaluering: {
        fagligt: '',
        personligt: '',
        socialt: '',
        arbejdsmæssigt: '',
        øvrigEvaluering: ''
      },
      lærerensEvaluering: {
        fagligt: '',
        personligt: '',
        socialt: '',
        arbejdsmæssigt: '',
        øvrigEvaluering: ''
      }
    }

    updateCurrentEvaluation(newEvaluation)
    setSelectedEvaluationByType((prev) => ({
      ...prev,
      [evaluationType]: null,
    }))
  }

  // Load existing evaluation
  const loadEvaluation = (evaluationId: number) => {
    const evaluation = evaluations.find(e => e.id === evaluationId)
    if (evaluation) {
      const evaluationCopy = { ...evaluation }
      setEvaluationType(evaluation.type)
      setCurrentEvaluation(evaluationCopy)
      setEvaluationDrafts((prev) => ({
        ...prev,
        [evaluation.type]: evaluationCopy,
      }))
      setSelectedEvaluationByType((prev) => ({
        ...prev,
        [evaluation.type]: evaluation.id ?? null,
      }))
    }
  }

  // Update evaluation field
  const updateEvaluationField = (field: keyof Evaluation, value: any) => {
    if (!currentEvaluation) return
    updateCurrentEvaluation({ ...currentEvaluation, [field]: value })
  }

  // Update goal field
  const updateGoalField = (goalType: 'fagligtMål' | 'personligtMål' | 'socialtMål' | 'arbejdsmæssigtMål', field: keyof EvaluationGoal, value: string) => {
    if (!currentEvaluation) return
    updateCurrentEvaluation({
      ...currentEvaluation,
      [goalType]: {
        ...currentEvaluation[goalType],
        [field]: value
      }
    })
  }

  // Update summative field
  const updateSummativeField = (evaluationType: 'elevensEvaluering' | 'lærerensEvaluering', field: string, value: string) => {
    if (!currentEvaluation) return
    updateCurrentEvaluation({
      ...currentEvaluation,
      [evaluationType]: {
        ...currentEvaluation[evaluationType],
        [field]: value
      }
    })
  }

  // Save evaluation
  const handleSave = async () => {
    if (!currentEvaluation) return

    try {
      // Ensure type always matches the active tab
      const evaluationToSave = { ...currentEvaluation, type: evaluationType }

      // Check if this is an existing evaluation (has valid id and exists in fetched list)
      const isExisting = evaluationToSave.id && evaluationToSave.id > 0 && 
        evaluations.some(e => e.id === evaluationToSave.id)
      
      if (isExisting) {
        // Update existing
        const updated = await updateEvaluation.mutateAsync(evaluationToSave)
        if (updated) {
          updateCurrentEvaluation(updated)
          setSelectedEvaluationByType((prev) => ({
            ...prev,
            [evaluationType]: updated.id ?? null,
          }))
        }
      } else {
        // Create new - strip id if present
        const { id, ...evaluationData } = evaluationToSave as any
        const created = await createEvaluation.mutateAsync(evaluationData)
        // Update local state with returned ID so subsequent saves do updates
        if (created?.id) {
          const savedEvaluation = { ...evaluationToSave, id: created.id }
          updateCurrentEvaluation(savedEvaluation)
          setSelectedEvaluationByType((prev) => ({
            ...prev,
            [evaluationType]: created.id,
          }))
        }
      }
      setSaveModalOpen(true)
    } catch (error: any) {
      console.error('Failed to save evaluation:', error)
      const msg = error?.message || JSON.stringify(error) || 'Ukendt fejl'
      alert(`Evalueringen kunne ikke gemmes:\n${msg}`)
    }
  }

  // Delete evaluation
  const handleDelete = async () => {
    if (!evaluationToDelete) return

    try {
      await deleteEvaluation.mutateAsync(evaluationToDelete)
      setDeleteModalOpen(false)
      setEvaluationToDelete(null)
      // Clear current evaluation if it was the one deleted
      if (currentEvaluation?.id === evaluationToDelete) {
        updateCurrentEvaluation(null)
      }

      const deletedEvaluation = evaluations.find((e) => e.id === evaluationToDelete)
      if (deletedEvaluation) {
        setSelectedEvaluationByType((prev) => ({
          ...prev,
          [deletedEvaluation.type]: prev[deletedEvaluation.type] === evaluationToDelete ? null : prev[deletedEvaluation.type],
        }))
        setEvaluationDrafts((prev) => ({
          ...prev,
          [deletedEvaluation.type]: prev[deletedEvaluation.type]?.id === evaluationToDelete ? null : prev[deletedEvaluation.type],
        }))
      }
    } catch (error: any) {
      console.error('❌ Failed to delete evaluation:', error)
      // Close modal and show error
      setDeleteModalOpen(false)
      setEvaluationToDelete(null)
      alert(`Kunne ikke slette evaluering: ${error?.message || 'Ukendt fejl'}`)
    }
  }

  // Handle class selection
  const handleClassSelect = (holdId: number) => {
    setSelectedHoldId(holdId)
    setSelectedStudentId(null)
    setCurrentEvaluation(null)
    setEvaluationDrafts({ Formativ: null, Summativ: null })
    setSelectedEvaluationByType({ Formativ: null, Summativ: null })
    setEvaluationType('Formativ')
  }

  // Handle student selection
  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId)
    setCurrentEvaluation(null)
    setEvaluationDrafts({ Formativ: null, Summativ: null })
    setSelectedEvaluationByType({ Formativ: null, Summativ: null })
    setEvaluationType('Formativ')
  }

  // Create new aftale
  const handleCreateAftale = async () => {
    if (!selectedStudentId || !newAftaleText.trim()) return
    try {
      await createAftale.mutateAsync({
        studentId: selectedStudentId,
        initialer: user?.initialer || 'KESO',
        tekst: newAftaleText.trim(),
      })
      setNewAftaleText('')
    } catch (error: any) {
      alert(`Kunne ikke oprette aftale: ${error?.message || 'Ukendt fejl'}`)
    }
  }

  const selectedClass = classes.find(c => c.id === selectedHoldId)
  const selectedStudent = students.find(s => s.id === selectedStudentId)

  const handleEvaluationTypeChange = (value: string | null) => {
    if (!value) return
    const newType = value as 'Formativ' | 'Summativ'
    setEvaluationType(newType)
    setCurrentEvaluation(evaluationDrafts[newType] ? { ...evaluationDrafts[newType]! } : null)
  }

  // Show loading state
  if (studentsLoading || classesLoading || evaluationsLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <>
      <Grid gutter="md">
        {/* Venstre kolonne - Hold og Elever */}
        <Grid.Col span={2}>
          <Card shadow="sm" padding="md" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
            <Title order={4} mb="md">Hold</Title>
            <Stack gap="xs" mb="lg">
              {activeClasses.map((cls) => (
                <Card
                  key={cls.id}
                  padding="xs"
                  radius="sm"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedHoldId === cls.id ? 'var(--mantine-color-blue-light)' : undefined
                  }}
                  onClick={() => handleClassSelect(cls.id)}
                >
                  <Group gap="xs">
                    <Badge color="green" size="sm">{cls.fag}</Badge>
                    <Text size="xs">{cls.lærer}</Text>
                  </Group>
                  <Text size="xs" c="dimmed">{cls.modulperiode}</Text>
                  <Text size="xs" c="dimmed">{cls.students?.length || 0} elever</Text>
                </Card>
              ))}
            </Stack>

            {selectedHoldId && (
              <>
                <Title order={4} mb="md">Elever</Title>
                <Stack gap="xs">
                  {studentsInClass.map((student) => (
                    <Card
                      key={student.id}
                      padding="xs"
                      radius="sm"
                      withBorder
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedStudentId === student.id ? 'var(--mantine-color-blue-light)' : undefined
                      }}
                      onClick={() => handleStudentSelect(student.id)}
                    >
                      <Text size="sm">{student.navn}</Text>
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Card>
        </Grid.Col>

        {/* Midter kolonne - Evalueringsformular */}
        <Grid.Col span={8}>
          {selectedStudent && selectedClass && !currentEvaluation ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
              <Tabs value={evaluationType} onChange={handleEvaluationTypeChange} mb="md">
                <Tabs.List style={{ gap: '8px' }}>
                  <Tabs.Tab
                    value="Formativ"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: '1px solid var(--mantine-color-default-border)',
                      backgroundColor:
                        evaluationType === 'Formativ'
                          ? 'light-dark(var(--mantine-color-blue-1), var(--mantine-color-blue-9))'
                          : 'var(--mantine-color-body)',
                      fontWeight: evaluationType === 'Formativ' ? 700 : 500,
                      boxShadow:
                        evaluationType === 'Formativ'
                          ? '0 0 0 1px var(--mantine-color-blue-6) inset'
                          : 'none',
                      transition: 'all 120ms ease',
                    }}
                  >
                    Formativ
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="Summativ"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: '1px solid var(--mantine-color-default-border)',
                      backgroundColor:
                        evaluationType === 'Summativ'
                          ? 'light-dark(var(--mantine-color-blue-1), var(--mantine-color-blue-9))'
                          : 'var(--mantine-color-body)',
                      fontWeight: evaluationType === 'Summativ' ? 700 : 500,
                      boxShadow:
                        evaluationType === 'Summativ'
                          ? '0 0 0 1px var(--mantine-color-blue-6) inset'
                          : 'none',
                      transition: 'all 120ms ease',
                    }}
                  >
                    Summativ
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              <div style={{ opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                <Group justify="space-between" mb="md">
                  <Stack gap={4}>
                    <Title order={3}>{selectedStudent.navn}</Title>
                    <Group gap="md">
                      <Text size="sm" c="dimmed">Dato: {new Date().toLocaleDateString('da-DK')}</Text>
                      <Text size="sm" c="dimmed">Modulperiode: {selectedClass.modulperiode}</Text>
                      <Text size="sm" c="dimmed">Oprettet af: {user?.initialer || 'UKENDT'}</Text>
                    </Group>
                  </Stack>
                </Group>

                {evaluationType === 'Formativ' ? (
                  <Stack gap="lg" mt="md">
                    {['Fagligt mål', 'Personligt mål', 'Socialt mål', 'Arbejdsmæssigt mål'].map(title => (
                      <div key={title}>
                        <Title order={5} mb={0} style={EVAL_STYLES.sectionHeader}>{title}</Title>
                        <Table withTableBorder style={{ tableLayout: 'fixed' }}>
                          <Table.Thead>
                            <Table.Tr style={EVAL_STYLES.thRow}>
                              <Table.Th style={EVAL_STYLES.th1}>Individuelle mål</Table.Th>
                              <Table.Th style={EVAL_STYLES.th2}>Læringsmål</Table.Th>
                              <Table.Th style={EVAL_STYLES.th3}>Indhold og handlinger</Table.Th>
                              <Table.Th style={EVAL_STYLES.th4}>Opfyldelseskriterier</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            <Table.Tr>
                              <Table.Td style={{ height: 64 }} />
                              <Table.Td />
                              <Table.Td />
                              <Table.Td />
                            </Table.Tr>
                          </Table.Tbody>
                        </Table>
                      </div>
                    ))}
                  </Stack>
                ) : (
                  <Stack gap="lg" mt="md">
                    {['Elevens evaluering', 'Lærerens evaluering'].map(title => (
                      <div key={title}>
                        <Title order={4} mb={0} style={EVAL_STYLES.sectionHeader}>{title}</Title>
                        <Table withTableBorder>
                          <Table.Thead>
                            <Table.Tr style={EVAL_STYLES.thRow}>
                              <Table.Th style={{ ...EVAL_STYLES.th1, width: '200px' }}>Område</Table.Th>
                              <Table.Th style={EVAL_STYLES.th2}>Evaluering</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            <Table.Tr><Table.Td style={{ height: 48 }} /> <Table.Td /></Table.Tr>
                            <Table.Tr><Table.Td style={{ height: 48 }} /> <Table.Td /></Table.Tr>
                            <Table.Tr><Table.Td style={{ height: 48 }} /> <Table.Td /></Table.Tr>
                          </Table.Tbody>
                        </Table>
                      </div>
                    ))}
                  </Stack>
                )}
              </div>
            </Card>
          ) : currentEvaluation && selectedStudent && selectedClass ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
              <Tabs value={evaluationType} onChange={handleEvaluationTypeChange} mb="md">
                <Tabs.List style={{ gap: '8px' }}>
                  <Tabs.Tab
                    value="Formativ"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: '1px solid var(--mantine-color-default-border)',
                      backgroundColor:
                        evaluationType === 'Formativ'
                          ? 'light-dark(var(--mantine-color-blue-1), var(--mantine-color-blue-9))'
                          : 'var(--mantine-color-body)',
                      fontWeight: evaluationType === 'Formativ' ? 700 : 500,
                      boxShadow:
                        evaluationType === 'Formativ'
                          ? '0 0 0 1px var(--mantine-color-blue-6) inset'
                          : 'none',
                      transition: 'all 120ms ease',
                    }}
                  >
                    Formativ
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="Summativ"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: '1px solid var(--mantine-color-default-border)',
                      backgroundColor:
                        evaluationType === 'Summativ'
                          ? 'light-dark(var(--mantine-color-blue-1), var(--mantine-color-blue-9))'
                          : 'var(--mantine-color-body)',
                      fontWeight: evaluationType === 'Summativ' ? 700 : 500,
                      boxShadow:
                        evaluationType === 'Summativ'
                          ? '0 0 0 1px var(--mantine-color-blue-6) inset'
                          : 'none',
                      transition: 'all 120ms ease',
                    }}
                  >
                    Summativ
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              <Group justify="space-between" mb="md">
                <Stack gap={4}>
                  <Title order={3}>{selectedStudent.navn}</Title>
                  <Group gap="md">
                    <Text size="sm" c="dimmed">
                      Dato: {(() => {
                        const [year, month, day] = currentEvaluation.dato.split('-')
                        return `${day}-${month}-${year}`
                      })()}
                    </Text>
                    <Text size="sm" c="dimmed">Modulperiode: {currentEvaluation.modulperiode}</Text>
                    <Text size="sm" c="dimmed">Oprettet af: {currentEvaluation.oprettetAf}</Text>
                  </Group>
                </Stack>
              </Group>

              <GlobalToolbar
                onExport={() => {
                  setExportScope(evaluationType.toLowerCase() as 'formativ' | 'summativ')
                  setExportModalOpen(true)
                }}
                onSave={handleSave}
                isSaving={createEvaluation.isPending || updateEvaluation.isPending}
              />

              {evaluationType === 'Formativ' ? (
              <Stack gap="lg">
                {/* Mål fra forløbsplan/STU-indstilling */}
                <div>
                  <Title order={5} mb="xs">Mål fra forløbsplan/STU-indstilling</Title>
                  <Paper withBorder p="xs" style={{ minHeight: 90 }}>
                    <EditableField
                      value={currentEvaluation.forløbsplanMål || ''}
                      onChange={(value) => updateEvaluationField('forløbsplanMål', value)}
                      padding="4px 8px"
                    />
                  </Paper>
                </div>

                {/* Fagligt mål */}
                <div>
                  <Text size="sm" c="dimmed" mb={4}>
                    Det faglige mål er et delmål til det følgende mål fra forløbsplanen:
                  </Text>
                  <Paper withBorder p="xs" mb="xs">
                    <EditableField
                      value={currentEvaluation.fagligtForløbsplanDelmål || ''}
                      onChange={(value) => updateEvaluationField('fagligtForløbsplanDelmål', value)}
                      minHeight={34}
                      padding="4px 8px"
                    />
                  </Paper>
                  <Title order={5} mb={0} style={EVAL_STYLES.sectionHeader}>
                    Fagligt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed' }}>
                    <Table.Thead>
                      <Table.Tr style={EVAL_STYLES.thRow}>
                        <Table.Th style={EVAL_STYLES.th1}>Individuelle mål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th2}>Læringsmål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th3}>Indhold og handlinger</Table.Th>
                        <Table.Th style={EVAL_STYLES.th4}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={EVAL_STYLES.td1}>
                          <EditableField
                            value={currentEvaluation.fagligtMål.individueleMål}
                            onChange={(value) => updateGoalField('fagligtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td2}>
                          <EditableField
                            value={currentEvaluation.fagligtMål.læringsmål}
                            onChange={(value) => updateGoalField('fagligtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td3}>
                          <EditableField
                            value={currentEvaluation.fagligtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('fagligtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td4}>
                          <EditableField
                            value={currentEvaluation.fagligtMål.opfyldelseskriterier}
                            onChange={(value) => updateGoalField('fagligtMål', 'opfyldelseskriterier', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </div>

                {/* Personligt mål */}
                <div>
                  <Text size="sm" c="dimmed" mb={4}>
                    Det personlige mål er et delmål til det følgende mål fra forløbsplanen:
                  </Text>
                  <Paper withBorder p="xs" mb="xs">
                    <EditableField
                      value={currentEvaluation.personligtForløbsplanDelmål || ''}
                      onChange={(value) => updateEvaluationField('personligtForløbsplanDelmål', value)}
                      minHeight={34}
                      padding="4px 8px"
                    />
                  </Paper>
                  <Title order={5} mb={0} style={EVAL_STYLES.sectionHeader}>
                    Personligt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed' }}>
                    <Table.Thead>
                      <Table.Tr style={EVAL_STYLES.thRow}>
                        <Table.Th style={EVAL_STYLES.th1}>Individuelle mål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th2}>Læringsmål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th3}>Indhold og handlinger</Table.Th>
                        <Table.Th style={EVAL_STYLES.th4}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={EVAL_STYLES.td1}>
                          <EditableField
                            value={currentEvaluation.personligtMål.individueleMål}
                            onChange={(value) => updateGoalField('personligtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td2}>
                          <EditableField
                            value={currentEvaluation.personligtMål.læringsmål}
                            onChange={(value) => updateGoalField('personligtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td3}>
                          <EditableField
                            value={currentEvaluation.personligtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('personligtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td4}>
                          <EditableField
                            value={currentEvaluation.personligtMål.opfyldelseskriterier}
                            onChange={(value) => updateGoalField('personligtMål', 'opfyldelseskriterier', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </div>

                {/* Socialt mål */}
                <div>
                  <Text size="sm" c="dimmed" mb={4}>
                    Det sociale mål er et delmål til det følgende mål fra forløbsplanen:
                  </Text>
                  <Paper withBorder p="xs" mb="xs">
                    <EditableField
                      value={currentEvaluation.socialtForløbsplanDelmål || ''}
                      onChange={(value) => updateEvaluationField('socialtForløbsplanDelmål', value)}
                      minHeight={34}
                      padding="4px 8px"
                    />
                  </Paper>
                  <Title order={5} mb={0} style={EVAL_STYLES.sectionHeader}>
                    Socialt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed' }}>
                    <Table.Thead>
                      <Table.Tr style={EVAL_STYLES.thRow}>
                        <Table.Th style={EVAL_STYLES.th1}>Individuelle mål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th2}>Læringsmål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th3}>Indhold og handlinger</Table.Th>
                        <Table.Th style={EVAL_STYLES.th4}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={EVAL_STYLES.td1}>
                          <EditableField
                            value={currentEvaluation.socialtMål.individueleMål}
                            onChange={(value) => updateGoalField('socialtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td2}>
                          <EditableField
                            value={currentEvaluation.socialtMål.læringsmål}
                            onChange={(value) => updateGoalField('socialtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td3}>
                          <EditableField
                            value={currentEvaluation.socialtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('socialtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td4}>
                          <EditableField
                            value={currentEvaluation.socialtMål.opfyldelseskriterier}
                            onChange={(value) => updateGoalField('socialtMål', 'opfyldelseskriterier', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </div>

                {/* Arbejdsmæssigt mål */}
                <div>
                  <Text size="sm" c="dimmed" mb={4}>
                    Det arbejdsmæssige mål er et delmål til det følgende mål fra forløbsplanen:
                  </Text>
                  <Paper withBorder p="xs" mb="xs">
                    <EditableField
                      value={currentEvaluation.arbejdsmæssigtForløbsplanDelmål || ''}
                      onChange={(value) => updateEvaluationField('arbejdsmæssigtForløbsplanDelmål', value)}
                      minHeight={34}
                      padding="4px 8px"
                    />
                  </Paper>
                  <Title order={5} mb={0} style={EVAL_STYLES.sectionHeader}>
                    Arbejdsmæssigt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed' }}>
                    <Table.Thead>
                      <Table.Tr style={EVAL_STYLES.thRow}>
                        <Table.Th style={EVAL_STYLES.th1}>Individuelle mål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th2}>Læringsmål</Table.Th>
                        <Table.Th style={EVAL_STYLES.th3}>Indhold og handlinger</Table.Th>
                        <Table.Th style={EVAL_STYLES.th4}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={EVAL_STYLES.td1}>
                          <EditableField
                            value={currentEvaluation.arbejdsmæssigtMål.individueleMål}
                            onChange={(value) => updateGoalField('arbejdsmæssigtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td2}>
                          <EditableField
                            value={currentEvaluation.arbejdsmæssigtMål.læringsmål}
                            onChange={(value) => updateGoalField('arbejdsmæssigtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td3}>
                          <EditableField
                            value={currentEvaluation.arbejdsmæssigtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('arbejdsmæssigtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={EVAL_STYLES.td4}>
                          <EditableField
                            value={currentEvaluation.arbejdsmæssigtMål.opfyldelseskriterier}
                            onChange={(value) => updateGoalField('arbejdsmæssigtMål', 'opfyldelseskriterier', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </div>

                {/* Evaluering af seneste mål */}
                <div>
                  <Title order={5} mb="xs">Evaluering af seneste mål</Title>
                  <Paper withBorder p="xs">
                    <EditableField
                      value={currentEvaluation.evalueringSenesteMål}
                      onChange={(value) => updateEvaluationField('evalueringSenesteMål', value)}
                    />
                  </Paper>
                </div>

                {/* Næste modul */}
                <div>
                  <Title order={5} mb="xs">Næste modul</Title>
                  <Group grow>
                    <Select
                      label="1. prioritet"
                      data={availableFag.map(f => ({ value: f, label: f }))}
                      value={currentEvaluation.næsteModulPrioritet1}
                      onChange={(value) => updateEvaluationField('næsteModulPrioritet1', value || '')}
                      searchable
                      clearable
                    />
                    <Select
                      label="2. prioritet"
                      data={availableFag.map(f => ({ value: f, label: f }))}
                      value={currentEvaluation.næsteModulPrioritet2}
                      onChange={(value) => updateEvaluationField('næsteModulPrioritet2', value || '')}
                      searchable
                      clearable
                    />
                    <Select
                      label="3. prioritet"
                      data={availableFag.map(f => ({ value: f, label: f }))}
                      value={currentEvaluation.næsteModulPrioritet3}
                      onChange={(value) => updateEvaluationField('næsteModulPrioritet3', value || '')}
                      searchable
                      clearable
                    />
                  </Group>
                </div>

                {/* Bemærkninger til valg af fag */}
                <div>
                  <Title order={5} mb="xs">Bemærkninger til valg af fag</Title>
                  <Paper withBorder p="xs">
                    <EditableField
                      value={currentEvaluation.bemærkninger || ''}
                      onChange={(value) => updateEvaluationField('bemærkninger', value)}
                    />
                  </Paper>
                </div>

                {/* Opfølgning og aftaler */}
                {selectedStudentId && (
                  <div>
                    <Divider mb="md" />
                    <Title order={5} mb="xs">Opfølgning og aftaler</Title>
                    <Text size="xs" c="dimmed" mb="sm">
                      Aftaler og opfølgninger følger eleven på tværs af alle modulperioder.
                    </Text>

                    {/* Ny aftale */}
                    <Paper withBorder p="sm" mb="md" style={{ backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))' }}>
                      <Stack gap="xs">
                        <Textarea
                          placeholder="Skriv en ny aftale eller opfølgning..."
                          value={newAftaleText}
                          onChange={(e) => setNewAftaleText(e.currentTarget.value)}
                          minRows={2}
                          autosize
                        />
                        <Group justify="flex-end">
                          <Button
                            size="xs"
                            leftSection={<IconPlus size={14} />}
                            onClick={handleCreateAftale}
                            loading={createAftale.isPending}
                            disabled={!newAftaleText.trim()}
                          >
                            Tilføj aftale
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>

                    {/* Aftaler tabel */}
                    {aftaleLoading ? (
                      <Center><Loader size="sm" /></Center>
                    ) : studentAftaler.length > 0 ? (
                      <Table withTableBorder style={{ tableLayout: 'fixed' }}>
                        <Table.Thead>
                          <Table.Tr style={EVAL_STYLES.thRow}>
                            <Table.Th style={{ ...EVAL_STYLES.th1, width: '110px' }}>Dato</Table.Th>
                            <Table.Th style={{ ...EVAL_STYLES.th2, width: '70px' }}>Initialer</Table.Th>
                            <Table.Th style={{ ...EVAL_STYLES.th3, width: '70px' }}>Aktiv</Table.Th>
                            <Table.Th style={EVAL_STYLES.th4}>Tekst</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {studentAftaler.map((aftale, index) => {
                            const d = new Date(aftale.dato)
                            const dateStr = d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: '2-digit' })
                            const rowBackground = index % 2 === 0
                              ? 'transparent'
                              : 'light-dark(rgba(0,0,0,0.03), rgba(255,255,255,0.05))'
                            return (
                              <Table.Tr key={aftale.id} style={{ opacity: aftale.aktiv ? 1 : 0.5 }}>
                                <Table.Td style={{ width: '110px', fontSize: 13, backgroundColor: rowBackground, borderRight: '1px solid var(--mantine-color-default-border)' }}>{dateStr}</Table.Td>
                                <Table.Td style={{ width: '70px', fontSize: 13, fontWeight: 600, backgroundColor: rowBackground, borderRight: '1px solid var(--mantine-color-default-border)' }}>{aftale.initialer}</Table.Td>
                                <Table.Td style={{ width: '70px', verticalAlign: 'middle', backgroundColor: rowBackground, borderRight: '1px solid var(--mantine-color-default-border)' }}>
                                  <Switch
                                    checked={aftale.aktiv}
                                    size="sm"
                                    onChange={() => {
                                      if (aftale.id && selectedStudentId) {
                                        toggleAftale.mutate({ studentId: selectedStudentId, aftaleId: aftale.id })
                                      }
                                    }}
                                  />
                                </Table.Td>
                                <Table.Td style={{ fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: rowBackground }}>{aftale.tekst}</Table.Td>
                              </Table.Tr>
                            )
                          })}
                        </Table.Tbody>
                      </Table>
                    ) : (
                      <Text size="sm" c="dimmed" ta="center">Ingen aftaler registreret</Text>
                    )}
                  </div>
                )}
              </Stack>
              ) : (
              <Stack gap="lg">
                {/* Elevens evaluering */}
                <div>
                  <Title order={4} mb={0} style={EVAL_STYLES.sectionHeader}>
                    Elevens evaluering
                  </Title>
                  <Table withTableBorder style={{ borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: 'var(--mantine-color-default-hover)', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Th style={{ color: 'var(--mantine-color-dimmed)', width: '200px', borderRight: '1px solid var(--mantine-color-default-border)' }}>Område</Table.Th>
                        <Table.Th style={{ color: 'var(--mantine-color-dimmed)' }}>Evaluering</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Fagligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.fagligt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'fagligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Personligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.personligt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'personligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Socialt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.socialt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'socialt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Arbejdsmæssigt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.arbejdsmæssigt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'arbejdsmæssigt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Øvrig evaluering</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.øvrigEvaluering || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'øvrigEvaluering', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </div>

                {/* Lærerens evaluering */}
                <div>
                  <Title order={4} mb={0} style={EVAL_STYLES.sectionHeader}>
                    Lærerens evaluering
                  </Title>
                  <Table withTableBorder style={{ borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: 'var(--mantine-color-default-hover)', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Th style={{ color: 'var(--mantine-color-dimmed)', width: '200px', borderRight: '1px solid var(--mantine-color-default-border)' }}>Område</Table.Th>
                        <Table.Th style={{ color: 'var(--mantine-color-dimmed)' }}>Evaluering</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Fagligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.fagligt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'fagligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Personligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.personligt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'personligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Socialt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.socialt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'socialt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Arbejdsmæssigt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.arbejdsmæssigt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'arbejdsmæssigt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td style={{ fontWeight: 500, borderRight: '1px solid var(--mantine-color-default-border)' }}>Øvrig evaluering</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.øvrigEvaluering || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'øvrigEvaluering', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </div>
              </Stack>
              )}
            </Card>
          ) : (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)' }}>
              <Stack align="center" justify="center" style={{ height: '100%' }}>
                <Text c="dimmed" size="lg">Vælg et hold og en elev for at se eller oprette en evaluering</Text>
              </Stack>
            </Card>
          )}
        </Grid.Col>

        {/* Højre kolonne - Historik */}
        <Grid.Col span={2}>
          <Card shadow="sm" padding="md" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
            <Title order={4} mb="md">
              {evaluationType === 'Formativ' ? 'Elevens formative evalueringer' : 'Elevens summative evalueringer'}
            </Title>
            
            {selectedStudentId ? (
              <Stack gap="xs">
                {/* Opret evaluering knap */}
                <Button
                  leftSection={<IconPlus size={16} />}
                  color="green"
                  variant="filled"
                  fullWidth
                  onClick={() => initializeNewEvaluation()}
                >
                  Opret evaluering
                </Button>
                {studentEvaluations.filter(e => e.type === evaluationType).length > 0 && (
                  <Divider label="Tidligere evalueringer" labelPosition="center" mt="xs" />
                )}
                {studentEvaluations
                  .filter(e => e.type === evaluationType)
                  .map((evaluation) => (
                    <Card
                      key={evaluation.id}
                      padding="xs"
                      radius="sm"
                      withBorder
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        backgroundColor:
                          selectedEvaluationByType[evaluationType] === evaluation.id
                            ? 'var(--mantine-color-blue-light)'
                            : undefined,
                        borderColor:
                          selectedEvaluationByType[evaluationType] === evaluation.id
                            ? 'var(--mantine-color-blue-6)'
                            : undefined,
                      }}
                    >
                      <div style={{ cursor: 'pointer' }} onClick={() => loadEvaluation(evaluation.id)}>
                        <Text size="sm" fw={500}>{evaluation.oprettetAf}</Text>
                        <Text size="xs" c="dimmed">
                          {evaluation.createdAt ? (() => {
                            const date = new Date(evaluation.createdAt)
                            const day = String(date.getDate()).padStart(2, '0')
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const year = date.getFullYear()
                            const hours = String(date.getHours()).padStart(2, '0')
                            const minutes = String(date.getMinutes()).padStart(2, '0')
                            return `${day}-${month}-${year} kl. ${hours}:${minutes}`
                          })() : evaluation.dato}
                        </Text>
                        <Text size="xs" c="dimmed">{evaluation.modulperiode}</Text>
                      </div>
                      {evaluation.id && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="sm"
                          style={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setEvaluationToDelete(evaluation.id!)
                            setDeleteModalOpen(true)
                          }}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      )}
                    </Card>
                  ))}
                {studentEvaluations.filter(e => e.type === evaluationType).length === 0 && (
                  <Text size="sm" c="dimmed" ta="center">
                    Ingen {evaluationType.toLowerCase()} evalueringer
                  </Text>
                )}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" ta="center">Vælg en elev</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* Save Modal */}
      <Modal
        opened={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Evaluering gemt"
        centered
      >
        <Stack gap="md">
          <Group>
            <IconCheck size={24} color="green" />
            <Text>Evalueringen er blevet gemt succesfuldt!</Text>
          </Group>
          <Button fullWidth onClick={() => setSaveModalOpen(false)}>
            Luk
          </Button>
        </Stack>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setEvaluationToDelete(null)
        }}
        title="Slet evaluering"
        centered
      >
        <Stack gap="md">
          <Group>
            <IconTrash size={24} color="red" />
            <Text>Er du sikker på at du vil slette denne evaluering?</Text>
          </Group>
          <Text size="sm" c="dimmed">
            Denne handling kan ikke fortrydes.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button 
              variant="default" 
              onClick={() => {
                setDeleteModalOpen(false)
                setEvaluationToDelete(null)
              }}
            >
              Annuller
            </Button>
            <Button 
              color="red" 
              onClick={handleDelete}
              loading={deleteEvaluation.isPending}
            >
              Slet
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => {
          if (!exportEvaluation.isPending) setExportModalOpen(false)
        }}
        title="Eksportér til fil"
        centered
        size="sm"
      >
        <Stack gap="md">
          {/* Scope selector */}
          <div>
            <Text size="sm" fw={500} mb={6}>Indhold</Text>
            <SegmentedControl
              fullWidth
              value={exportScope}
              onChange={(v) => setExportScope(v as typeof exportScope)}
              data={[
                { label: 'Formativ', value: 'formativ' },
                { label: 'Summativ', value: 'summativ' },
              ]}
            />
          </div>

          {exportEvaluation.isError && (
            <Alert color="red" title="Export fejlede">
              {exportEvaluation.error instanceof Error
                ? exportEvaluation.error.message
                : 'Ukendt fejl – prøv igen'}
            </Alert>
          )}

          <Text size="sm" c="dimmed">
            Eleven: <strong>{selectedStudent?.navn}</strong>{' │ '}
            {currentEvaluation?.modulperiode}
          </Text>

          <Text size="xs" c="dimmed" fs="italic">
            Bemærk: PDF-generering kan tage et øjeblik.
          </Text>

          <Stack gap="xs">
            <Button
              leftSection={<IconFileTypePdf size={18} />}
              color="red"
              variant="light"
              loading={exportEvaluation.isPending && exportEvaluation.variables?.format === 'pdf'}
              disabled={!currentEvaluation?.id || exportEvaluation.isPending}
              onClick={async () => {
                if (!currentEvaluation?.id) return
                try {
                  await exportEvaluation.mutateAsync({
                    id: currentEvaluation.id,
                    format: 'pdf',
                    scope: exportScope,
                    studentName: selectedStudent?.navn,
                  })
                  setExportModalOpen(false)
                  notifications.show({
                    title: 'Download startet',
                    message: 'PDF-filen er klar til download.',
                    color: 'green',
                  })
                } catch {
                  // error shown in Alert above
                }
              }}
            >
              Download PDF
            </Button>

            <Button
              leftSection={<IconFileWord size={18} />}
              color="blue"
              variant="light"
              loading={exportEvaluation.isPending && exportEvaluation.variables?.format === 'docx'}
              disabled={!currentEvaluation?.id || exportEvaluation.isPending}
              onClick={async () => {
                if (!currentEvaluation?.id) return
                try {
                  await exportEvaluation.mutateAsync({
                    id: currentEvaluation.id,
                    format: 'docx',
                    scope: exportScope,
                    studentName: selectedStudent?.navn,
                  })
                  setExportModalOpen(false)
                  notifications.show({
                    title: 'Download startet',
                    message: 'Word-filen er klar til download.',
                    color: 'green',
                  })
                } catch {
                  // error shown in Alert above
                }
              }}
            >
              Download DOCX
            </Button>

            <Button
              leftSection={<IconFileText size={18} />}
              color="gray"
              variant="light"
              loading={exportEvaluation.isPending && exportEvaluation.variables?.format === 'txt'}
              disabled={!currentEvaluation?.id || exportEvaluation.isPending}
              onClick={async () => {
                if (!currentEvaluation?.id) return
                try {
                  await exportEvaluation.mutateAsync({
                    id: currentEvaluation.id,
                    format: 'txt',
                    scope: exportScope,
                    studentName: selectedStudent?.navn,
                  })
                  setExportModalOpen(false)
                  notifications.show({
                    title: 'Download startet',
                    message: 'Tekstfilen er klar til download.',
                    color: 'green',
                  })
                } catch {
                  // error shown in Alert above
                }
              }}
            >
              Download TXT
            </Button>
          </Stack>

          <Button
            variant="subtle"
            color="gray"
            onClick={() => setExportModalOpen(false)}
            disabled={exportEvaluation.isPending}
          >
            Annuller
          </Button>
        </Stack>
      </Modal>

    </>
  )
}

export default Evaluation
