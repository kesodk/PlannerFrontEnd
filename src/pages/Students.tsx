import { useState, useEffect } from 'react'
import { Container, Title, Group, Button, TextInput, ActionIcon, Badge, Table, Card, Text, Stack, Alert, UnstyledButton } from '@mantine/core'
import { IconPlus, IconSearch, IconEdit, IconTrash, IconRefresh, IconMapPin, IconChevronUp, IconChevronDown, IconSelector, IconEye } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { StudentForm } from '../components/StudentForm'
import { StudentViewModal } from '../components/StudentViewModal'
import { mockStudents as initialMockStudents } from '../data/mockStudents'
import { studentStorage } from '../services/studentStorage'
import type { Student } from '../types/Student'
import type { StudentFormData } from '../schemas/studentSchema'

export function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpened, setModalOpened] = useState(false)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [sortBy, setSortBy] = useState<keyof Student | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Load students from localStorage on component mount
  useEffect(() => {
    const storedStudents = studentStorage.initializeWithMockData(initialMockStudents)
    setStudents(storedStudents)
  }, [])

  const handleSort = (field: keyof Student) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: keyof Student) => {
    if (sortBy !== field) {
      return <IconSelector size={14} />
    }
    return sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
  }

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortBy) return 0
    
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1
    
    // Convert to string for comparison
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1
    if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const filteredStudents = sortedStudents.filter(student =>
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

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student)
    setViewModalOpened(true)
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
        <Group>
          {sortBy && (
            <Button 
              variant="subtle" 
              size="sm"
              onClick={() => {
                setSortBy(null)
                setSortOrder('asc')
              }}
            >
              Nulstil sortering
            </Button>
          )}
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
      </Group>

      {/* No students message */}
      {students.length === 0 && (
        <Alert variant="light" color="gray" mb="md">
          <Text fw={500}>Ingen elever fundet.</Text>
          <Text size="sm">Prøv at klikke på "Nulstil testdata" knappen ovenfor for at indlæse test elever.</Text>
        </Alert>
      )}

      {students.length > 0 && (
        <Alert variant="light" color="blue" mb="md">
          <Text fw={500}>Fundet {filteredStudents.length} elever</Text>
          {searchTerm && <Text size="sm">Filtreret fra {students.length} elever total</Text>}
          {sortBy && (
            <Text size="sm">
              Sorteret efter {sortBy} ({sortOrder === 'asc' ? 'stigende' : 'faldende'})
            </Text>
          )}
        </Alert>
      )}

      {/* Mantine tabel - den pålidelige løsning */}
      {filteredStudents.length > 0 && (
        <Card withBorder>
          <Title order={3} mb="md">Alle elever</Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort('navn')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Navn</Text>
                    {getSortIcon('navn')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort('email')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Email</Text>
                    {getSortIcon('email')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort('telefonnr')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Telefon</Text>
                    {getSortIcon('telefonnr')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort('afdeling')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Afdeling</Text>
                    {getSortIcon('afdeling')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort('status')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Status</Text>
                    {getSortIcon('status')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>Handlinger</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.map((student) => (
                <Table.Tr 
                  key={student.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewStudent(student)}
                >
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
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Group gap="xs">
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="gray"
                        onClick={() => handleViewStudent(student)}
                        title="Vis elev"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="blue"
                        onClick={() => handleEditStudent(student)}
                        title="Rediger elev"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="red"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Slet elev"
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

      {/* View modal */}
      <StudentViewModal
        opened={viewModalOpened}
        onClose={() => {
          setViewModalOpened(false)
          setViewingStudent(null)
        }}
        student={viewingStudent}
      />
    </Container>
  )
}
