// ORIGINAL IMPLEMENTATION - BACKUP FOR FUTURE USE
import { useState } from 'react'
import { Container, Title, Group, Select, Card, Text, Table, Checkbox, Button, Badge } from '@mantine/core'
import { IconCalendar, IconDownload } from '@tabler/icons-react'

const mockAttendanceData = [
  { 
    id: 1, 
    studentName: 'Anna Hansen', 
    present: true, 
    late: false, 
    excused: false,
    note: ''
  },
  { 
    id: 2, 
    studentName: 'Lars Nielsen', 
    present: false, 
    late: false, 
    excused: true,
    note: 'Sygdom'
  },
  { 
    id: 3, 
    studentName: 'Sofie Andersen', 
    present: true, 
    late: true, 
    excused: false,
    note: 'Ankom 09:15'
  },
  { 
    id: 4, 
    studentName: 'Mikkel Jensen', 
    present: true, 
    late: false, 
    excused: false,
    note: ''
  },
  { 
    id: 5, 
    studentName: 'Emma Larsen', 
    present: false, 
    late: false, 
    excused: false,
    note: ''
  },
]

export function AttendanceOriginal() {
  const [selectedDate, setSelectedDate] = useState<string>('2024-09-10')
  const [selectedClass, setSelectedClass] = useState<string | null>('frontend-2024')
  const [attendanceData, setAttendanceData] = useState(mockAttendanceData)

  const handleAttendanceChange = (studentId: number, field: 'present' | 'late' | 'excused', value: boolean) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, [field]: value }
          : student
      )
    )
  }

  const presentCount = attendanceData.filter(s => s.present).length
  const totalStudents = attendanceData.length
  const attendancePercentage = Math.round((presentCount / totalStudents) * 100)

  const rows = attendanceData.map((student) => (
    <Table.Tr key={student.id}>
      <Table.Td>{student.studentName}</Table.Td>
      <Table.Td>
        <Checkbox
          checked={student.present}
          onChange={(event) => handleAttendanceChange(student.id, 'present', event.currentTarget.checked)}
        />
      </Table.Td>
      <Table.Td>
        <Checkbox
          checked={student.late}
          onChange={(event) => handleAttendanceChange(student.id, 'late', event.currentTarget.checked)}
          disabled={!student.present}
        />
      </Table.Td>
      <Table.Td>
        <Checkbox
          checked={student.excused}
          onChange={(event) => handleAttendanceChange(student.id, 'excused', event.currentTarget.checked)}
          disabled={student.present}
        />
      </Table.Td>
      <Table.Td>
        {student.present && (
          <Badge color="green" variant="light">Tilstede</Badge>
        )}
        {!student.present && student.excused && (
          <Badge color="yellow" variant="light">Fraværende (Undskyld)</Badge>
        )}
        {!student.present && !student.excused && (
          <Badge color="red" variant="light">Fraværende</Badge>
        )}
        {student.late && (
          <Badge color="orange" variant="light" ml="xs">For sent</Badge>
        )}
      </Table.Td>
      <Table.Td>{student.note}</Table.Td>
    </Table.Tr>
  ))

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={1}>Fremmøderegistrering</Title>
        <Button leftSection={<IconDownload size={16} />} variant="light">
          Eksporter data
        </Button>
      </Group>

      <Group mb="lg">
        <Select
          label="Vælg dato"
          placeholder="Vælg dato"
          value={selectedDate}
          onChange={(value) => setSelectedDate(value || '')}
          leftSection={<IconCalendar size={16} />}
          data={[
            { value: '2024-09-10', label: 'I dag (10. sept 2024)' },
            { value: '2024-09-09', label: 'I går (9. sept 2024)' },
            { value: '2024-09-08', label: '8. september 2024' },
            { value: '2024-09-07', label: '7. september 2024' },
          ]}
        />
        <Select
          label="Vælg hold"
          placeholder="Vælg et hold"
          data={[
            { value: 'frontend-2024', label: 'Frontend Development 2024' },
            { value: 'backend-2024', label: 'Backend Development 2024' },
            { value: 'fullstack-2024', label: 'Fullstack Development 2024' },
          ]}
          value={selectedClass}
          onChange={setSelectedClass}
        />
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">Fremmøde i dag</Text>
            <Text size="xl" fw={700}>{presentCount}/{totalStudents} ({attendancePercentage}%)</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Dato</Text>
            <Text size="lg" fw={500}>
              {selectedDate || 'Ingen dato valgt'}
            </Text>
          </div>
        </Group>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Elev</Table.Th>
              <Table.Th>Tilstede</Table.Th>
              <Table.Th>For sent</Table.Th>
              <Table.Th>Undskyld fravær</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Note</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>

        <Group justify="flex-end" mt="lg">
          <Button variant="outline">Annuller</Button>
          <Button>Gem fremmøde</Button>
        </Group>
      </Card>
    </Container>
  )
}
