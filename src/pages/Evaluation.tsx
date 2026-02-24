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
  Overlay,
  Divider,
  SegmentedControl,
  Alert
} from '@mantine/core'
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconList, IconListNumbers, IconClearFormatting, IconCheck, IconX, IconTrash, IconPlus, IconFileTypePdf, IconFileWord, IconFileText } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useStudents } from '../services/studentApi'
import { useClasses } from '../services/classApi'
import { useEvaluations, useCreateEvaluation, useUpdateEvaluation, useDeleteEvaluation, useExportEvaluation } from '../services/evaluationApi'
import { availableFag } from '../data/mockClasses'
import type { Evaluation, EvaluationGoal } from '../types/Evaluation'

// Global Toolbar Component
function GlobalToolbar({ onExport, onStu, onSave, isSaving }: {
  onExport?: () => void
  onStu?: () => void
  onSave?: () => void
  isSaving?: boolean
}) {
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  return (
    <Paper shadow="sm" p="sm" mb="md" withBorder style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--mantine-color-body)' }}>
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
        </Group>
        {onSave && (
          <Group gap="sm" wrap="nowrap">
            <Button size="sm" color="blue" variant="outline" onClick={onExport}>
              Eksporter til fil
            </Button>
            <Button size="sm" color="teal" variant="outline" onClick={onStu}>
              STU-indstilling
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
function EditableField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
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

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      style={{
        minHeight: '70px',
        width: '100%',
        maxWidth: '100%',
        padding: '10px 12px',
        outline: 'none',
        cursor: 'text',
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
      }}
    />
  )
}

export function Evaluation() {
  const [selectedHoldId, setSelectedHoldId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [evaluationType, setEvaluationType] = useState<'Formativ' | 'Summativ'>('Formativ')
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportScope, setExportScope] = useState<'formativ' | 'summativ'>('formativ')
  const [stuModalOpen, setStuModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [evaluationToDelete, setEvaluationToDelete] = useState<number | null>(null)
  const [shaking, setShaking] = useState(false)

  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const { data: evaluations = [], isLoading: evaluationsLoading } = useEvaluations()
  const createEvaluation = useCreateEvaluation()
  const updateEvaluation = useUpdateEvaluation()
  const deleteEvaluation = useDeleteEvaluation()
  const exportEvaluation = useExportEvaluation()

  // Shake animation interval – fires every 3 seconds when no evaluation is loaded
  useEffect(() => {
    if (selectedStudentId && !currentEvaluation) {
      // trigger immediately on student select
      setShaking(true)
      const shakeTimeout = setTimeout(() => setShaking(false), 600)
      const interval = setInterval(() => {
        setShaking(true)
        setTimeout(() => setShaking(false), 600)
      }, 12000)
      return () => {
        clearInterval(interval)
        clearTimeout(shakeTimeout)
      }
    }
  }, [selectedStudentId, currentEvaluation])

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
        .sort((a, b) => 
          new Date(b.dato).getTime() - new Date(a.dato).getTime()
        )
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
      oprettetAf: 'KESO',
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

    setCurrentEvaluation(newEvaluation)
  }

  // Load existing evaluation
  const loadEvaluation = (evaluationId: number) => {
    const evaluation = evaluations.find(e => e.id === evaluationId)
    if (evaluation) {
      setCurrentEvaluation({ ...evaluation })
      setEvaluationType(evaluation.type)
    }
  }

  // Update evaluation field
  const updateEvaluationField = (field: keyof Evaluation, value: any) => {
    if (!currentEvaluation) return
    setCurrentEvaluation({ ...currentEvaluation, [field]: value })
  }

  // Update goal field
  const updateGoalField = (goalType: 'fagligtMål' | 'personligtMål' | 'socialtMål' | 'arbejdsmæssigtMål', field: keyof EvaluationGoal, value: string) => {
    if (!currentEvaluation) return
    setCurrentEvaluation({
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
    setCurrentEvaluation({
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
        if (updated) setCurrentEvaluation(updated)
      } else {
        // Create new - strip id if present
        const { id, ...evaluationData } = evaluationToSave as any
        const created = await createEvaluation.mutateAsync(evaluationData)
        // Update local state with returned ID so subsequent saves do updates
        if (created?.id) setCurrentEvaluation({ ...evaluationToSave, id: created.id })
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
        setCurrentEvaluation(null)
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
  }

  // Handle student selection
  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId)
    setCurrentEvaluation(null)
  }

  const selectedClass = classes.find(c => c.id === selectedHoldId)
  const selectedStudent = students.find(s => s.id === selectedStudentId)

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
            /* Greyed-out placeholder when student selected but no evaluation loaded */
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'hidden', position: 'relative' }}>
              {/* Ghost form structure - visually disabled */}
              <div style={{ opacity: 0.12, pointerEvents: 'none', userSelect: 'none' }}>
                <Group justify="space-between" mb="md">
                  <Stack gap={4}>
                    <Title order={3}>{selectedStudent.navn}</Title>
                    <Group gap="md">
                      <Text size="sm" c="dimmed">Dato: {new Date().toLocaleDateString('da-DK')}</Text>
                      <Text size="sm" c="dimmed">Modulperiode: {selectedClass.modulperiode}</Text>
                      <Text size="sm" c="dimmed">Oprettet af: KESO</Text>
                    </Group>
                  </Stack>
                  <Group gap="xs">
                    <Button color="blue" variant="outline">Eksporter til fil</Button>
                    <Button color="teal" variant="outline">STU-indstilling</Button>
                    <Button color="orange">Gem</Button>
                  </Group>
                </Group>
                <Stack gap="lg" mt="md">
                  {['Fagligt mål', 'Personligt mål', 'Socialt mål', 'Arbejdsmæssigt mål'].map(title => (
                    <div key={title}>
                      <Title order={5} mb="xs" style={{ backgroundColor: '#194541', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                        {title}
                      </Title>
                      <Table withTableBorder style={{ tableLayout: 'fixed' }}>
                        <Table.Thead>
                          <Table.Tr style={{ backgroundColor: '#29675a' }}>
                            <Table.Th style={{ color: 'white' }}>Individuelle mål</Table.Th>
                            <Table.Th style={{ color: 'white' }}>Læringsmål</Table.Th>
                            <Table.Th style={{ color: 'white' }}>Indhold og handlinger</Table.Th>
                            <Table.Th style={{ color: 'white' }}>Opfyldelseskriterier</Table.Th>
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
              </div>
              {/* Overlay + top-aligned message */}
              <Overlay backgroundBlur={1} opacity={0.25} zIndex={10} />
              <style>{`
                @keyframes shake {
                  0%   { transform: translateX(0); }
                  15%  { transform: translateX(-8px); }
                  30%  { transform: translateX(8px); }
                  45%  { transform: translateX(-6px); }
                  60%  { transform: translateX(6px); }
                  75%  { transform: translateX(-3px); }
                  90%  { transform: translateX(3px); }
                  100% { transform: translateX(0); }
                }
                .shake-box { animation: none; }
                .shake-box.shaking { animation: shake 0.55s ease-in-out; }
              `}</style>
              <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'column', paddingTop: 80 }}>
                <Paper
                  className={`shake-box${shaking ? ' shaking' : ''}`}
                  shadow="md"
                  radius="md"
                  p="lg"
                  withBorder
                  style={{
                    backgroundColor: 'var(--mantine-color-body)',
                    borderColor: 'var(--mantine-color-gray-3)',
                    textAlign: 'center',
                    maxWidth: 420,
                    margin: '0 auto',
                    width: '100%'
                  }}
                >
                  {studentEvaluations.length === 0 ? (
                    <Stack gap={6} align="center">
                      <Text fw={700} size="lg">Eleven har ingen evalueringer endnu</Text>
                      <Text size="sm" c="dimmed">Tryk „Opret evaluering“ i højre side for at begynde</Text>
                    </Stack>
                  ) : (
                    <Stack gap={6} align="center">
                      <Text fw={700} size="lg">Ingen evaluering valgt</Text>
                      <Text size="sm" c="dimmed">Vælg en evaluering fra listen, eller opret en ny</Text>
                    </Stack>
                  )}
                </Paper>
              </div>
            </Card>
          ) : currentEvaluation && selectedStudent && selectedClass ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
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
                onStu={() => setStuModalOpen(true)}
                onSave={handleSave}
                isSaving={createEvaluation.isPending || updateEvaluation.isPending}
              />

              <Tabs 
                value={evaluationType} 
                onChange={(value) => {
                  const newType = value as 'Formativ' | 'Summativ'
                  setEvaluationType(newType)
                  // Auto-load the newest evaluation for the selected tab, if one exists
                  const newest = studentEvaluations.find(e => e.type === newType)
                  if (newest?.id) {
                    loadEvaluation(newest.id)
                  } else {
                    setCurrentEvaluation(null)
                  }
                }} 
                mb="md"
              >
                <Tabs.List 
                  style={{ 
                    gap: '4px'
                  }}
                >
                  <Tabs.Tab 
                    value="Formativ"
                    style={{
                      border: '1px solid var(--mantine-color-gray-4)',
                      borderBottom: 'none',
                      backgroundColor: evaluationType === 'Formativ' ? 'var(--mantine-color-body)' : 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))',
                      borderTop: evaluationType === 'Formativ' ? '3px solid #29675a' : '1px solid var(--mantine-color-gray-4)',
                      fontWeight: evaluationType === 'Formativ' ? 600 : 400,
                      color: evaluationType === 'Formativ' ? 'var(--mantine-color-text)' : 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))'
                    }}
                  >
                    Formativ
                  </Tabs.Tab>
                  <Tabs.Tab 
                    value="Summativ"
                    style={{
                      border: '1px solid var(--mantine-color-gray-4)',
                      borderBottom: 'none',
                      backgroundColor: evaluationType === 'Summativ' ? 'var(--mantine-color-body)' : 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))',
                      borderTop: evaluationType === 'Summativ' ? '3px solid #29675a' : '1px solid var(--mantine-color-gray-4)',
                      fontWeight: evaluationType === 'Summativ' ? 600 : 400,
                      color: evaluationType === 'Summativ' ? 'var(--mantine-color-text)' : 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))'
                    }}
                  >
                    Summativ
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              {evaluationType === 'Formativ' ? (
              <Stack gap="lg">
                {/* Fagligt mål */}
                <div>
                  <Title order={5} mb="xs" style={{ backgroundColor: '#194541', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                    Fagligt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed', borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: '#29675a', borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Individuelle mål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Læringsmål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Indhold og handlinger</Table.Th>
                        <Table.Th style={{ color: 'white' }}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.fagligtMål.individueleMål}
                            onChange={(value) => updateGoalField('fagligtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.fagligtMål.læringsmål}
                            onChange={(value) => updateGoalField('fagligtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.fagligtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('fagligtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
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
                  <Title order={5} mb="xs" style={{ backgroundColor: '#194541', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                    Personligt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed', borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: '#29675a', borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Individuelle mål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Læringsmål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Indhold og handlinger</Table.Th>
                        <Table.Th style={{ color: 'white' }}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.personligtMål.individueleMål}
                            onChange={(value) => updateGoalField('personligtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.personligtMål.læringsmål}
                            onChange={(value) => updateGoalField('personligtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.personligtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('personligtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
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
                  <Title order={5} mb="xs" style={{ backgroundColor: '#194541', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                    Socialt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed', borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: '#29675a', borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Individuelle mål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Læringsmål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Indhold og handlinger</Table.Th>
                        <Table.Th style={{ color: 'white' }}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.socialtMål.individueleMål}
                            onChange={(value) => updateGoalField('socialtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.socialtMål.læringsmål}
                            onChange={(value) => updateGoalField('socialtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.socialtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('socialtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
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
                  <Title order={5} mb="xs" style={{ backgroundColor: '#194541', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                    Arbejdsmæssigt mål
                  </Title>
                  <Table withTableBorder style={{ tableLayout: 'fixed', borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: '#29675a', borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Individuelle mål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Læringsmål</Table.Th>
                        <Table.Th style={{ color: 'white', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Indhold og handlinger</Table.Th>
                        <Table.Th style={{ color: 'white' }}>Opfyldelseskriterier</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.arbejdsmæssigtMål.individueleMål}
                            onChange={(value) => updateGoalField('arbejdsmæssigtMål', 'individueleMål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.arbejdsmæssigtMål.læringsmål}
                            onChange={(value) => updateGoalField('arbejdsmæssigtMål', 'læringsmål', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)', width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.arbejdsmæssigtMål.indholdOgHandlinger}
                            onChange={(value) => updateGoalField('arbejdsmæssigtMål', 'indholdOgHandlinger', value)}
                          />
                        </Table.Td>
                        <Table.Td style={{ width: '25%', maxWidth: '25%', verticalAlign: 'top' }}>
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
              </Stack>
              ) : (
              <Stack gap="lg">
                {/* Elevens evaluering */}
                <div>
                  <Title order={4} mb="md" style={{ backgroundColor: '#194541', color: 'white', padding: '12px 16px', borderRadius: '4px' }}>
                    Elevens evaluering
                  </Title>
                  <Table withTableBorder style={{ borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: '#29675a', borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Th style={{ color: 'white', width: '200px', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Område</Table.Th>
                        <Table.Th style={{ color: 'white' }}>Evaluering</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Fagligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.fagligt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'fagligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Personligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.personligt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'personligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Socialt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.socialt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'socialt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Arbejdsmæssigt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.elevensEvaluering?.arbejdsmæssigt || ''}
                            onChange={(value) => updateSummativeField('elevensEvaluering', 'arbejdsmæssigt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Øvrig evaluering</Table.Td>
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
                  <Title order={4} mb="md" style={{ backgroundColor: '#194541', color: 'white', padding: '12px 16px', borderRadius: '4px' }}>
                    Lærerens evaluering
                  </Title>
                  <Table withTableBorder style={{ borderWidth: '2px' }}>
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: '#29675a', borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Th style={{ color: 'white', width: '200px', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Område</Table.Th>
                        <Table.Th style={{ color: 'white' }}>Evaluering</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Fagligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.fagligt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'fagligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Personligt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.personligt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'personligt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Socialt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.socialt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'socialt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-4)' }}>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Arbejdsmæssigt</Table.Td>
                        <Table.Td style={{ verticalAlign: 'top' }}>
                          <EditableField
                            value={currentEvaluation.lærerensEvaluering?.arbejdsmæssigt || ''}
                            onChange={(value) => updateSummativeField('lærerensEvaluering', 'arbejdsmæssigt', value)}
                          />
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td style={{ fontWeight: 500, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Øvrig evaluering</Table.Td>
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
                      style={{ position: 'relative' }}
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
                            const seconds = String(date.getSeconds()).padStart(2, '0')
                            return `${day}-${month}-${year} kl. ${hours}:${minutes}:${seconds}`
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

      {/* STU Modal */}
      <Modal
        opened={stuModalOpen}
        onClose={() => setStuModalOpen(false)}
        title="STU-indstilling"
        centered
      >
        <Stack gap="md">
          <Text>Denne funktionalitet er under udvikling og vil snart være tilgængelig.</Text>
          <Text size="sm" c="dimmed">Du vil kunne oprette og administrere STU-indstillinger for eleven.</Text>
          <Button fullWidth onClick={() => setStuModalOpen(false)}>
            Luk
          </Button>
        </Stack>
      </Modal>
    </>
  )
}

export default Evaluation
