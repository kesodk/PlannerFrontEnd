import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Container, 
  Title, 
  Card, 
  Text, 
  Group, 
  Button, 
  Stack,
  Table,
  Select,
  TextInput
} from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
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

export function AssessmentDetail() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { data: students = [], isLoading } = useStudents()
  
  const studentIdNum = parseInt(studentId || '0')
  const student = students.find(s => s.id === studentIdNum)
  const [modulePeriods, setModulePeriods] = useState<ModulePeriod[]>([])

  useEffect(() => {
    // Hent modulperioder for denne elev
    if (studentIdNum && mockModulePeriods[studentIdNum]) {
      const periods = mockModulePeriods[studentIdNum]
      console.log('Loading periods for student', studentIdNum, periods)
      setModulePeriods(periods)
    }
  }, [studentIdNum])

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
    // Her ville du normalt gemme til API
    console.log('Gemmer bedømmelser:', modulePeriods)
    // Vis success besked
    alert('Bedømmelser gemt!')
  }

  if (isLoading) {
    return (
      <Container size="md">
        <Text>Indlæser...</Text>
      </Container>
    )
  }

  if (!student) {
    return (
      <Container size="md">
        <Text>Elev ikke fundet (ID: {studentId})</Text>
      </Container>
    )
  }

  return (
    <Container size="xl">
      <Button 
        variant="subtle" 
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate('/administration?tab=assessments')}
        mb="md"
      >
        Tilbage til oversigt
      </Button>

      <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
        <Group justify="space-between">
          <Stack gap="xs">
            <Title order={2}>{student.navn}</Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">Afdeling: {student.afdeling}</Text>
            </Group>
          </Stack>
          <Button 
            color="orange"
            onClick={handleSave}
          >
            Gem
          </Button>
        </Group>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Modulperiode</Table.Th>
              <Table.Th>Fag</Table.Th>
              <Table.Th>Fagbeskrivelse</Table.Th>
              <Table.Th>Bedømmelse</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {modulePeriods.map((period) => (
              <Table.Tr key={period.id}>
                <Table.Td>{period.modulperiode}</Table.Td>
                <Table.Td>{period.fag}</Table.Td>
                <Table.Td>
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
    </Container>
  )
}

export default AssessmentDetail
