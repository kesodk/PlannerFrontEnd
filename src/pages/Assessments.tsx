import { useState, useMemo } from 'react'
import {
  Table, Text, Badge, TextInput, Group, Card, Title, Select, Grid,
  Stack, Button, Modal, ActionIcon, Tooltip, Loader, Center, Alert,
  SegmentedControl,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconSearch, IconFileTypePdf, IconFileWord, IconCheck, IconAlertCircle, IconRefresh } from '@tabler/icons-react'
import { useStudents } from '../services/studentApi'
import { useAssessmentHistory, useBulkSaveAssessments, useExportDiploma } from '../services/assessmentApi'
import { calculateSemester } from '../services/oversigterApi'
import type { AssessmentRow } from '../services/assessmentApi'
import { AFDELINGER } from '../types/Student'

const ASSESSMENT_OPTIONS = [
  { value: '', label: '- Vælg bedømmelse -' },
  { value: 'Gennemført', label: 'Gennemført' },
  { value: 'Ikke gennemført', label: 'Ikke gennemført' },
  { value: 'Deltaget uden eksamen', label: 'Deltaget uden eksamen' },
  { value: '12', label: '12' },
  { value: '10', label: '10' },
  { value: '7', label: '7' },
  { value: '4', label: '4' },
  { value: '02', label: '02' },
  { value: '00', label: '00' },
  { value: '-3', label: '-3' },
]

export function Assessments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [afdelingFilter, setAfdelingFilter] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [diplomModalOpen, setDiplomModalOpen] = useState(false)
  const [diplomFormat, setDiplomFormat] = useState<'pdf' | 'docx'>('pdf')

  // Local edits: keyed by "modulperiode:fag"
  const [localEdits, setLocalEdits] = useState<Record<string, Partial<AssessmentRow>>>({})

  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: history = [], isLoading: historyLoading, isError: historyError, refetch: refetchHistory } = useAssessmentHistory(selectedStudentId)
  const bulkSave = useBulkSaveAssessments()
  const exportDiploma = useExportDiploma()

  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  const filteredStudents = useMemo(() => {
    const lower = searchTerm.toLowerCase()
    return students.filter((s) => {
      const matchSearch = s.navn.toLowerCase().includes(lower) || s.afdeling.toLowerCase().includes(lower)
      const matchAfdeling = !afdelingFilter || afdelingFilter === 'all' || s.afdeling === afdelingFilter
      return matchSearch && matchAfdeling
    })
  }, [students, searchTerm, afdelingFilter])

  // Merge server history with local edits
  const rows = useMemo((): AssessmentRow[] => {
    return history.map((row) => {
      const key = `${row.modulperiode}:${row.fag}`
      const edit = localEdits[key]
      return edit ? { ...row, ...edit } : row
    })
  }, [history, localEdits])

  const handleSelectStudent = (studentId: number) => {
    if (studentId === selectedStudentId) return
    setSelectedStudentId(studentId)
    setLocalEdits({})
  }

  const handleEdit = (row: AssessmentRow, field: 'fagbeskrivelse' | 'bedømmelse', value: string) => {
    const key = `${row.modulperiode}:${row.fag}`
    setLocalEdits((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const isDirty = Object.keys(localEdits).length > 0

  const handleSave = () => {
    if (!selectedStudentId) return
    bulkSave.mutate(
      { student_id: selectedStudentId, rows },
      {
        onSuccess: () => {
          setLocalEdits({})
          notifications.show({ icon: <IconCheck size={16} />, color: 'green', title: 'Gemt', message: 'Bedømmelserne er gemt.' })
        },
        onError: () => {
          notifications.show({ color: 'red', title: 'Fejl', message: 'Kunne ikke gemme. Prøv igen.' })
        },
      }
    )
  }

  const handleExportDiploma = () => {
    if (!selectedStudentId) return
    exportDiploma.mutate(
      { studentId: selectedStudentId, format: diplomFormat, studentName: selectedStudent?.navn ?? 'Elev' },
      {
        onSuccess: () => setDiplomModalOpen(false),
        onError: () => {
          notifications.show({ color: 'red', title: 'Fejl', message: 'Kunne ikke generere diplom.' })
        },
      }
    )
  }

  if (studentsLoading) {
    return <Center py="xl"><Loader size="sm" /></Center>
  }

  return (
    <>
      <Grid gutter="md">
        {/* â”€â”€ Left: student list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
            <Title order={3} mb="md">Elever</Title>
            <Stack gap="sm" mb="md">
              <Select
                placeholder="Vælg afdeling"
                data={[{ value: 'all', label: 'Alle afdelinger' }, ...AFDELINGER]}
                value={afdelingFilter ?? 'all'}
                onChange={(v) => setAfdelingFilter(!v || v === 'all' ? null : v)}
              />
              <TextInput
                placeholder="Søg efter navn..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Stack>

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Navn</Table.Th>
                  <Table.Th style={{ width: 80 }}>Sem.</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredStudents.map((student) => (
                  <Table.Tr
                    key={student.id}
                    style={{ cursor: 'pointer', backgroundColor: selectedStudentId === student.id ? 'var(--mantine-color-blue-light)' : undefined }}
                    onClick={() => handleSelectStudent(student.id)}
                  >
                    <Table.Td>{student.navn}</Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light" size="sm">
                        {calculateSemester(student.startdato)}. sem.
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {filteredStudents.length === 0 && (
              <Text c="dimmed" ta="center" mt="xl">Ingen elever fundet</Text>
            )}
          </Card>
        </Grid.Col>

        {/* â”€â”€ Right: assessments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Grid.Col span={8}>
          {selectedStudent ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
              <Group justify="space-between" mb="md">
                <Stack gap={4}>
                  <Title order={3}>{selectedStudent.navn}</Title>
                  <Text size="sm" c="dimmed">Afdeling: {selectedStudent.afdeling}</Text>
                </Stack>
                <Group gap="sm">
                  <Tooltip label="Opdater">
                    <ActionIcon variant="subtle" onClick={() => refetchHistory()}>
                      <IconRefresh size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Button
                    color="orange"
                    onClick={handleSave}
                    loading={bulkSave.isPending}
                    disabled={!isDirty}
                  >
                    Gem
                  </Button>
                  <Button
                    variant="outline"
                    color="blue"
                    onClick={() => setDiplomModalOpen(true)}
                    disabled={rows.length === 0}
                  >
                    Opret diplom
                  </Button>
                </Group>
              </Group>

              {historyLoading ? (
                <Center py="xl"><Loader size="sm" /></Center>
              ) : historyError ? (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  Kunne ikke hente bedømmelseshistorik. Er backend kørende?
                </Alert>
              ) : (
                <Table withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 120, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Modulperiode</Table.Th>
                      <Table.Th style={{ width: 100, borderRight: '2px solid var(--mantine-color-gray-4)' }}>Fag</Table.Th>
                      <Table.Th style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>Fagbeskrivelse</Table.Th>
                      <Table.Th style={{ width: 205 }}>Bedømmelse</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rows.map((row, index) => (
                      <Table.Tr
                        key={`${row.modulperiode}:${row.fag}`}
                        style={{
                          backgroundColor: index % 2 === 0
                            ? 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-5))'
                            : 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7))',
                        }}
                      >
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>
                          {row.modulperiode}
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>
                          {row.fag}
                        </Table.Td>
                        <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>
                          <TextInput
                            value={row.fagbeskrivelse}
                            onChange={(e) => handleEdit(row, 'fagbeskrivelse', e.currentTarget.value)}
                            placeholder="Indtast fagbeskrivelse"
                            styles={{ input: { border: 'none', padding: '4px 8px' } }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Select
                            value={row.bedømmelse || ''}
                            onChange={(v) => handleEdit(row, 'bedømmelse', v ?? '')}
                            data={ASSESSMENT_OPTIONS}
                            styles={{ input: { border: 'none' } }}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}

              {!historyLoading && !historyError && rows.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                  Ingen modulperioder fundet for denne elev. Tilmeld eleven til et hold først.
                </Text>
              )}
            </Card>
          ) : (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)' }}>
              <Stack align="center" justify="center" style={{ height: '100%' }}>
                <Text c="dimmed" size="lg">Vælg en elev fra listen for at se bedømmelser</Text>
              </Stack>
            </Card>
          )}
        </Grid.Col>
      </Grid>

      {/* â”€â”€ Diploma modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        opened={diplomModalOpen}
        onClose={() => setDiplomModalOpen(false)}
        title="Eksportér diplom / uddannelsesoversigt"
        centered
        size="sm"
      >
        <Stack gap="md">
          {selectedStudent && (
            <Text size="sm">
              <strong>{selectedStudent.navn}</strong>
            </Text>
          )}

          <Text size="sm" c="dimmed">Vælg format:</Text>
          <SegmentedControl
            value={diplomFormat}
            onChange={(v) => setDiplomFormat(v as 'pdf' | 'docx')}
            data={[
              { value: 'pdf', label: 'PDF' },
              { value: 'docx', label: 'Word (DOCX)' },
            ]}
          />

          <Button
            leftSection={diplomFormat === 'pdf' ? <IconFileTypePdf size={16} /> : <IconFileWord size={16} />}
            color={diplomFormat === 'pdf' ? 'red' : 'blue'}
            loading={exportDiploma.isPending}
            onClick={handleExportDiploma}
            variant="light"
          >
            Download {diplomFormat.toUpperCase()}
          </Button>

          <Button variant="subtle" color="gray" onClick={() => setDiplomModalOpen(false)}>
            Annuller
          </Button>
        </Stack>
      </Modal>
    </>
  )
}

export default Assessments

