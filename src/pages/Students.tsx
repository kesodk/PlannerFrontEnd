import { useState, useEffect } from 'react'
import { Container, Title, Group, Button, TextInput, ActionIcon, Badge, Table, Card, Text, Stack } from '@mantine/core'
import { IconPlus, IconSearch, IconEdit, IconTrash, IconRefresh, IconMapPin } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { StudentForm } from '../components/StudentForm'
import { mockStudents as initialMockStudents } from '../data/mockStudents'
import { studentStorage } from '../services/studentStorage'
import type { Student } from '../types/Student'
import type { StudentFormData } from '../schemas/studentSchema'

export function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpened, setModalOpened] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  // Load students from localStorage on component mount
  useEffect(() => {
    const storedStudents = studentStorage.initializeWithMockData(initialMockStudents)
    setStudents(storedStudents)
  }, [])

  const filteredStudents = students.filter(student =>
    student.navn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    student.afdeling.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.kommune.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.vejlederNavn?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleCreateStudent = () => {
    setEditingStudent(null)
    setModalOpened(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setModalOpened(true)
  }

  const handleDeleteStudent = (id: number) => {
    modals.openConfirmModal({
      title: 'Slet elev',
      children: 'Er du sikker på, at du vil slette denne elev? Denne handling kan ikke fortrydes.',
      labels: { confirm: 'Slet', cancel: 'Annuller' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        const updatedStudents = studentStorage.deleteStudent(id)
        setStudents(updatedStudents)
        notifications.show({
          title: 'Elev slettet',
          message: 'Eleven er blevet slettet og ændringen er gemt lokalt',
          color: 'green'
        })
      },
    })
  }

  const handleFormSubmit = (data: StudentFormData) => {
    if (editingStudent) {
      // Update existing student
      const updatedStudent = { ...editingStudent, ...data }
      const updatedStudents = studentStorage.updateStudent(updatedStudent)
      setStudents(updatedStudents)
      notifications.show({
        title: 'Elev opdateret',
        message: 'Elevens oplysninger er blevet opdateret og gemt lokalt',
        color: 'green'
      })
    } else {
      // Create new student
      const newStudent: Student = {
        ...data,
        id: studentStorage.getNextId(),
      }
      const updatedStudents = studentStorage.addStudent(newStudent)
      setStudents(updatedStudents)
      notifications.show({
        title: 'Elev oprettet',
        message: 'Ny elev er blevet oprettet og gemt lokalt',
        color: 'green'
      })
    }
  }

  const handleRefreshData = () => {
    const storedStudents = studentStorage.getStudents()
    setStudents(storedStudents)
    notifications.show({
      title: 'Data opdateret',
      message: 'Eleven data er blevet genindlæst fra lokal storage',
      color: 'blue'
    })
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={1}>Elever ({students.length})</Title>
        <Group>
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />} 
            onClick={handleRefreshData}
          >
            Opdater
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreateStudent}>
            Tilføj elev
          </Button>
        </Group>
      </Group>

      <Group mb="md" justify="space-between">
        <TextInput
          placeholder="Søg efter elever..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          style={{ flex: 1, maxWidth: 400 }}
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            modals.openConfirmModal({
              title: 'Nulstil data',
              children: 'Dette vil slette alle lokale data og genindlæse testdata. Er du sikker?',
              labels: { confirm: 'Nulstil', cancel: 'Annuller' },
              confirmProps: { color: 'red' },
              onConfirm: () => {
                studentStorage.clearAll()
                const freshData = studentStorage.initializeWithMockData(initialMockStudents)
                setStudents(freshData)
                notifications.show({
                  title: 'Data nulstillet',
                  message: 'Alle data er blevet nulstillet til testdata',
                  color: 'blue'
                })
              },
            })
          }}
        >
          Nulstil testdata
        </Button>
      </Group>

      {/* No students message */}
      {students.length === 0 && (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' }}>
          <p><strong>Ingen elever fundet.</strong></p>
          <p>Prøv at klikke på "Nulstil testdata" knappen ovenfor for at indlæse test elever.</p>
        </div>
      )}

      {students.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
          <p><strong>Fundet {filteredStudents.length} elever</strong> {searchTerm && `(filtreret fra ${students.length} total)`}</p>
        </div>
      )}

      {/* Mantine tabel - den pålidelige løsning */}
      {filteredStudents.length > 0 && (
        <Card withBorder>
          <Title order={3} mb="md">Alle elever</Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Navn</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Telefon</Table.Th>
                <Table.Th>Afdeling</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Handlinger</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.map((student) => (
                <Table.Tr key={student.id}>
                  <Table.Td>
                    <Stack gap="xs">
                      <Text fw={500}>{student.navn}</Text>
                      <Group gap="xs" align="center">
                        <IconMapPin size={14} color="#6c757d" />
                        <Text size="sm" c="dimmed">{student.kommune}</Text>
                      </Group>
                    </Stack>
                  </Table.Td>
                  <Table.Td>{student.email || '-'}</Table.Td>
                  <Table.Td>{student.telefonnr || '-'}</Table.Td>
                  <Table.Td>
                    <Stack gap="xs">
                      <Text size="sm">{student.afdeling}</Text>
                      <Badge 
                        size="xs" 
                        style={{ 
                          backgroundColor: student.spor === 'AspIT' ? 'rgb(25, 69, 65)' : 
                                         student.spor === 'AspIN' ? 'rgb(105, 214, 199)' : 
                                         '#e9ecef',
                          color: student.spor === 'AspIT' ? 'white' : 
                                student.spor === 'AspIN' ? 'rgb(25, 69, 65)' : 
                                '#495057'
                        }}
                      >
                        {student.spor}
                      </Badge>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={student.status === 'Indskrevet' ? 'green' : 'yellow'} 
                      variant="light"
                    >
                      {student.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="blue"
                        onClick={() => handleEditStudent(student)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="red"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* No results message */}
      {filteredStudents.length === 0 && students.length > 0 && (
        <Card>
          <Text c="dimmed" ta="center" py="xl">
            Ingen elever matcher din søgning "{searchTerm}"
          </Text>
        </Card>
      )}

      {/* Form modal */}
      <StudentForm
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingStudent(null)
        }}
        onSubmit={handleFormSubmit}
        student={editingStudent}
        title={editingStudent ? 'Rediger elev' : 'Tilføj ny elev'}
      />
    </Container>
  )
}
