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
  Paper
} from '@mantine/core'
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconList, IconListNumbers, IconClearFormatting, IconCheck } from '@tabler/icons-react'
import { useStudents } from '../services/studentApi'
import { mockClasses, availableFag } from '../data/mockClasses'
import { mockEvaluations } from '../data/mockEvaluations'
import type { Evaluation, EvaluationGoal } from '../types/Evaluation'

// Global Toolbar Component
function GlobalToolbar() {
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  return (
    <Paper shadow="sm" p="xs" mb="md" withBorder style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--mantine-color-body)' }}>
      <Group gap="xs">
        <Text size="sm" fw={500} mr="xs">Formatering:</Text>
        <Tooltip label="Fed">
          <ActionIcon variant="default" onClick={() => execCommand('bold')}>
            <IconBold size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Kursiv">
          <ActionIcon variant="default" onClick={() => execCommand('italic')}>
            <IconItalic size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Understreget">
          <ActionIcon variant="default" onClick={() => execCommand('underline')}>
            <IconUnderline size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Gennemstreget">
          <ActionIcon variant="default" onClick={() => execCommand('strikeThrough')}>
            <IconStrikethrough size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Punktliste">
          <ActionIcon variant="default" onClick={() => execCommand('insertUnorderedList')}>
            <IconList size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Nummereret liste">
          <ActionIcon variant="default" onClick={() => execCommand('insertOrderedList')}>
            <IconListNumbers size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Ryd formatering">
          <ActionIcon variant="default" onClick={() => execCommand('removeFormat')}>
            <IconClearFormatting size={18} />
          </ActionIcon>
        </Tooltip>
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
        minHeight: '60px',
        width: '100%',
        maxWidth: '100%',
        padding: '8px',
        outline: 'none',
        cursor: 'text',
        textAlign: 'left',
        direction: 'ltr',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    />
  )
}

export function Evaluation() {
  const [selectedHoldId, setSelectedHoldId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [evaluationType, setEvaluationType] = useState<'Formativ' | 'Summativ'>('Formativ')
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations)
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [stuModalOpen, setStuModalOpen] = useState(false)

  const { data: students = [] } = useStudents()

  // Get classes with igangværende status
  const activeClasses = mockClasses.filter(c => c.status === 'Igangværende')

  // Get students in selected class
  const studentsInClass = selectedHoldId
    ? students.filter(s => {
        const classData = mockClasses.find(c => c.id === selectedHoldId)
        return classData?.elevIds.includes(s.id)
      })
    : []

  // Get evaluations for selected student
  const studentEvaluations = selectedStudentId
    ? evaluations.filter(e => e.studentId === selectedStudentId).sort((a, b) => 
        new Date(b.dato).getTime() - new Date(a.dato).getTime()
      )
    : []

  // Initialize empty evaluation
  const initializeNewEvaluation = () => {
    if (!selectedStudentId || !selectedHoldId) return

    const classData = mockClasses.find(c => c.id === selectedHoldId)
    
    const newEvaluation: Evaluation = {
      id: Math.max(...evaluations.map(e => e.id)) + 1,
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
  const handleSave = () => {
    if (!currentEvaluation) return

    const existingIndex = evaluations.findIndex(e => e.id === currentEvaluation.id)
    
    if (existingIndex >= 0) {
      setEvaluations(prev => prev.map(e => e.id === currentEvaluation.id ? currentEvaluation : e))
    } else {
      setEvaluations(prev => [...prev, currentEvaluation])
    }

    setSaveModalOpen(true)
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
    initializeNewEvaluation()
  }

  const selectedClass = mockClasses.find(c => c.id === selectedHoldId)
  const selectedStudent = students.find(s => s.id === selectedStudentId)

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
                  <Text size="xs" c="dimmed">{cls.elevIds.length} elever</Text>
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
          {currentEvaluation && selectedStudent && selectedClass ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
              <Group justify="space-between" mb="md">
                <Stack gap={4}>
                  <Title order={3}>{selectedStudent.navn}</Title>
                  <Group gap="md">
                    <Text size="sm" c="dimmed">Dato: {currentEvaluation.dato}</Text>
                    <Text size="sm" c="dimmed">Modulperiode: {currentEvaluation.modulperiode}</Text>
                    <Text size="sm" c="dimmed">Oprettet af: {currentEvaluation.oprettetAf}</Text>
                  </Group>
                </Stack>
                <Group gap="xs">
                  <Button color="blue" variant="outline" onClick={() => setExportModalOpen(true)}>
                    Eksporter til fil
                  </Button>
                  <Button color="teal" variant="outline" onClick={() => setStuModalOpen(true)}>
                    STU-indstilling
                  </Button>
                  <Button color="orange" onClick={handleSave}>
                    Gem
                  </Button>
                </Group>
              </Group>

              <GlobalToolbar />

              <Tabs 
                value={evaluationType} 
                onChange={(value) => setEvaluationType(value as 'Formativ' | 'Summativ')} 
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
                <Text c="dimmed" size="lg">Vælg et hold og en elev for at oprette eller se evaluering</Text>
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
                {studentEvaluations
                  .filter(e => e.type === evaluationType)
                  .map((evaluation) => (
                    <Card
                      key={evaluation.id}
                      padding="xs"
                      radius="sm"
                      withBorder
                      style={{ cursor: 'pointer' }}
                      onClick={() => loadEvaluation(evaluation.id)}
                    >
                      <Text size="sm" fw={500}>{evaluation.oprettetAf}</Text>
                      <Text size="xs" c="dimmed">{evaluation.dato}</Text>
                      <Text size="xs" c="dimmed">{evaluation.modulperiode}</Text>
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

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Eksporter til fil"
        centered
      >
        <Stack gap="md">
          <Text>Denne funktionalitet er under udvikling og vil snart være tilgængelig.</Text>
          <Text size="sm" c="dimmed">Du vil kunne eksportere evalueringen som PDF eller Word-dokument.</Text>
          <Button fullWidth onClick={() => setExportModalOpen(false)}>
            Luk
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
