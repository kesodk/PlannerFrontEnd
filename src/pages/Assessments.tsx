import { useState } from 'react'
import { Table, Text, Badge, TextInput, Group, Card, Title, Select, Grid, Stack, Button, Modal } from '@mantine/core'
import { IconSearch, IconCheck, IconFileText } from '@tabler/icons-react'
import { useStudents } from '../services/studentApi'
import { mockModulePeriods } from '../data/mockAssessments'
import type { ModulePeriod, AssessmentResult } from '../types/Assessment'

const assessmentOptions = [
  { value: '', label: '- Vælg bedømmelse -' },
  { value: 'gennemført', label: 'Gennemført' },
  { value: 'ikke-gennemført', label: 'Ikke gennemført' },
  { value: 'deltaget-uden-eksamen', label: 'Deltaget uden eksamen' },
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
  const [modulePeriods, setModulePeriods] = useState<ModulePeriod[]>([])
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [diplomModalOpen, setDiplomModalOpen] = useState(false)
  const { data: students = [], isLoading } = useStudents()

  // Unikke afdelinger for filter
  const afdelinger = Array.from(new Set(students.map(s => s.afdeling))).map(a => ({
    value: a,
    label: a
  }))

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      student.navn.toLowerCase().includes(searchLower) ||
      student.afdeling.toLowerCase().includes(searchLower) ||
      (student.kursistnr?.toLowerCase() || '').includes(searchLower)
    
    const matchesAfdeling = !afdelingFilter || student.afdeling === afdelingFilter

    return matchesSearch && matchesAfdeling
  })

  const selectedStudent = students.find(s => s.id === selectedStudentId)

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudentId(studentId)
    const periods = mockModulePeriods[studentId] || []
    setModulePeriods(periods)
  }

  const handleFagbeskrivelse = (id: number, value: string) => {
    setModulePeriods(prev => 
      prev.map(period => 
        period.id === id ? { ...period, fagbeskrivelse: value } : period
      )
    )
  }

  const handleBedømmelse = (id: number, value: string) => {
    setModulePeriods(prev => 
      prev.map(period => 
        period.id === id ? { ...period, bedømmelse: value as AssessmentResult } : period
      )
    )
  }

  const handleSave = () => {
    console.log('Gemmer bedømmelser:', modulePeriods)
    setSaveModalOpen(true)
  }

  const handleDiplom = () => {
    setDiplomModalOpen(true)
  }

  if (isLoading) {
    return <Text>Indlæser...</Text>
  }

  return (
    <>
    <Grid gutter="md">
      {/* Venstre kolonne - Elevliste */}
      <Grid.Col span={4}>
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
          <Title order={3} mb="md">Elever</Title>
          
          <Stack gap="sm" mb="md">
            <Select
              placeholder="Vælg afdeling"
              data={[{ value: '', label: 'Alle afdelinger' }, ...afdelinger]}
              value={afdelingFilter}
              onChange={setAfdelingFilter}
              clearable
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
                <Table.Th style={{ width: '80px' }}>Sem.</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.map((student) => (
                <Table.Tr 
                  key={student.id}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedStudentId === student.id ? 'var(--mantine-color-blue-light)' : undefined
                  }}
                  onClick={() => handleSelectStudent(student.id)}
                >
                  <Table.Td>{student.navn}</Table.Td>
                  <Table.Td>
                    <Badge 
                      color="blue"
                      variant="light"
                      size="sm"
                    >
                      6. SEM.
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {filteredStudents.length === 0 && (
            <Text c="dimmed" ta="center" mt="xl">
              Ingen elever fundet
            </Text>
          )}
        </Card>
      </Grid.Col>

      {/* Højre kolonne - Bedømmelser */}
      <Grid.Col span={8}>
        {selectedStudent ? (
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
            <Group justify="space-between" mb="md">
              <Stack gap="xs">
                <Title order={3}>{selectedStudent.navn}</Title>
                <Text size="sm" c="dimmed">Afdeling: {selectedStudent.afdeling}</Text>
              </Stack>
              <Group gap="sm">
                <Button 
                  color="orange"
                  onClick={handleSave}
                >
                  Gem
                </Button>
                <Button 
                  variant="outline"
                  color="blue"
                  onClick={handleDiplom}
                >
                  Opret diplom
                </Button>
              </Group>
            </Group>

            <Table withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '120px', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Modulperiode</Table.Th>
                  <Table.Th style={{ width: '100px', borderRight: '2px solid var(--mantine-color-gray-4)' }}>Fag</Table.Th>
                  <Table.Th style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>Fagbeskrivelse</Table.Th>
                  <Table.Th style={{ width: '205px' }}>Bedømmelse</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {modulePeriods.map((period, index) => (
                  <Table.Tr 
                    key={period.id}
                    style={{
                      backgroundColor: index % 2 === 0 
                        ? 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-5))' 
                        : 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7))'
                    }}
                  >
                    <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>{period.modulperiode}</Table.Td>
                    <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>{period.fag}</Table.Td>
                    <Table.Td style={{ borderRight: '2px solid var(--mantine-color-gray-4)' }}>
                      <TextInput
                        value={period.fagbeskrivelse}
                        onChange={(e) => handleFagbeskrivelse(period.id, e.currentTarget.value)}
                        placeholder="Indtast fagbeskrivelse"
                        styles={{ input: { border: 'none', padding: '4px 8px' } }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        value={period.bedømmelse}
                        onChange={(value) => handleBedømmelse(period.id, value || '')}
                        data={assessmentOptions}
                        styles={{ input: { border: 'none' } }}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {modulePeriods.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                Ingen modulperioder fundet for denne elev.
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

    {/* Success Modal for Gem */}
    <Modal
      opened={saveModalOpen}
      onClose={() => setSaveModalOpen(false)}
      title=""
      centered
    >
      <Stack gap="md">
        <Group>
          <IconCheck size={24} color="green" />
          <Text>Bedømmelserne er blevet gemt!</Text>
        </Group>
        <Button fullWidth onClick={() => setSaveModalOpen(false)}>
          Luk
        </Button>
      </Stack>
    </Modal>

    {/* Modal for Opret Diplom */}
    <Modal
      opened={diplomModalOpen}
      onClose={() => setDiplomModalOpen(false)}
      title="Opret diplom"
      centered
    >
      <Stack gap="md">
        <Group>
          <IconFileText size={24} color="blue" />
          <Text>Diplom funktionalitet kommer snart!</Text>
        </Group>
        <Text size="sm" c="dimmed">
          Her vil du kunne generere et diplom for {selectedStudent?.navn}.
        </Text>
        <Button fullWidth onClick={() => setDiplomModalOpen(false)}>
          Luk
        </Button>
      </Stack>
    </Modal>
  </>
  )
}

export default Assessments
