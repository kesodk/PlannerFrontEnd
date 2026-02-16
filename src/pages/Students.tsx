import { useState } from 'react'
import { Container, Title, Group, Button, TextInput, ActionIcon, Badge, Table, Card, Text, Alert, UnstyledButton, useMantineColorScheme, Loader, Center } from '@mantine/core'
import { IconPlus, IconSearch, IconEdit, IconTrash, IconRefresh, IconMapPin, IconChevronUp, IconChevronDown, IconSelector, IconEye } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { StudentForm } from '../components/StudentForm'
import { StudentViewModal } from '../components/StudentViewModal'
import { useSidebar } from '../contexts/SidebarContext'
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../services/studentApi'
import type { Student } from '../types/Student'
import type { StudentFormData } from '../schemas/studentSchema'
import { formatDate } from '../utils/dateUtils'

export function Students() {
  const { colorScheme } = useMantineColorScheme()
  const { desktopOpened } = useSidebar()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpened, setModalOpened] = useState(false)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [sortBy, setSortBy] = useState<keyof Student | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Fetch students from API using TanStack Query
  const { data: students = [], isLoading, isError, error, refetch } = useStudents()
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()
  const deleteStudent = useDeleteStudent()

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

  const filteredStudents = sortedStudents.filter(student => {
    const searchLower = searchTerm.toLowerCase()
    
    return (
      // Grundlæggende elev information
      student.navn.toLowerCase().includes(searchLower) ||
      (student.fødselsdato?.toLowerCase() || '').includes(searchLower) ||
      (student.cpr?.toLowerCase() || '').includes(searchLower) ||
      (student.adresse?.toLowerCase() || '').includes(searchLower) ||
      (student.telefonnr?.toLowerCase() || '').includes(searchLower) ||
      (student.email?.toLowerCase() || '').includes(searchLower) ||
      
      // Forældreoplysninger
      (student.forældreNavn?.toLowerCase() || '').includes(searchLower) ||
      (student.forældreTelefon?.toLowerCase() || '').includes(searchLower) ||
      (student.forældreAdresse?.toLowerCase() || '').includes(searchLower) ||
      (student.forældreEmail?.toLowerCase() || '').includes(searchLower) ||
      
      // Uddannelse information
      student.afdeling.toLowerCase().includes(searchLower) ||
      (student.kursistnr?.toLowerCase() || '').includes(searchLower) ||
      student.kommune.toLowerCase().includes(searchLower) ||
      student.lovgrundlag.toLowerCase().includes(searchLower) ||
      student.spor.toLowerCase().includes(searchLower) ||
      student.status.toLowerCase().includes(searchLower) ||
      (student.startdato?.toLowerCase() || '').includes(searchLower) ||
      (student.slutdato?.toLowerCase() || '').includes(searchLower) ||
      
      // Vejlederoplysninger
      (student.vejlederNavn?.toLowerCase() || '').includes(searchLower) ||
      (student.vejlederTlf?.toLowerCase() || '').includes(searchLower) ||
      (student.vejlederEmail?.toLowerCase() || '').includes(searchLower)
    )
  })

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
      onConfirm: async () => {
        try {
          await deleteStudent.mutateAsync(id)
          notifications.show({
            title: 'Elev slettet',
            message: 'Eleven er blevet slettet',
            color: 'green'
          })
        } catch (error) {
          notifications.show({
            title: 'Fejl',
            message: 'Kunne ikke slette eleven',
            color: 'red'
          })
        }
      },
    })
  }

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        // Update existing student
        const updatedStudent = { ...editingStudent, ...data }
        await updateStudent.mutateAsync(updatedStudent)
        notifications.show({
          title: 'Elev opdateret',
          message: 'Elevens oplysninger er blevet opdateret',
          color: 'green'
        })
      } else {
        // Create new student
        await createStudent.mutateAsync(data as Omit<Student, 'id'>)
        notifications.show({
          title: 'Elev oprettet',
          message: 'Ny elev er blevet oprettet',
          color: 'green'
        })
      }
      setModalOpened(false)
    } catch (error) {
      notifications.show({
        title: 'Fejl',
        message: editingStudent ? 'Kunne ikke opdatere eleven' : 'Kunne ikke oprette eleven',
        color: 'red'
      })
    }
  }

  const handleRefreshData = () => {
    refetch()
    notifications.show({
      title: 'Data opdateret',
      message: 'Eleven data er blevet genindlæst fra API',
      color: 'blue'
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <Container size={desktopOpened ? "xl" : "100%"} style={{ maxWidth: desktopOpened ? undefined : 'none' }}>
        <Center style={{ height: '50vh' }}>
          <Loader size="lg" />
        </Center>
      </Container>
    )
  }

  // Error state
  if (isError) {
    return (
      <Container size={desktopOpened ? "xl" : "100%"} style={{ maxWidth: desktopOpened ? undefined : 'none' }}>
        <Alert variant="light" color="red" mb="md">
          <Text fw={500}>Fejl ved indlæsning af elever</Text>
          <Text size="sm">{error?.message || 'Kunne ikke forbinde til API'}</Text>
        </Alert>
        <Button onClick={() => refetch()} leftSection={<IconRefresh size={16} />}>
          Prøv igen
        </Button>
      </Container>
    )
  }

  return (
    <Container size={desktopOpened ? "xl" : "100%"} style={{ maxWidth: desktopOpened ? undefined : 'none' }}>
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
          placeholder="Søg i alle elev-informationer (navn, forældre, vejleder, adresser...)"
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          style={{ flex: 1, maxWidth: 500 }}
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
        </Group>
      </Group>

      {/* No students message */}
      {students.length === 0 && (
        <Alert variant="light" color="gray" mb="md">
          <Text fw={500}>Ingen elever fundet.</Text>
          <Text size="sm">Der er ingen elever i systemet endnu.</Text>
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
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: desktopOpened ? '200px' : '280px' }}>
                  <UnstyledButton onClick={() => handleSort('navn')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Navn</Text>
                    {getSortIcon('navn')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: '120px', maxWidth: '130px' }}>
                  <UnstyledButton onClick={() => handleSort('kommune')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Kommune</Text>
                    {getSortIcon('kommune')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: desktopOpened ? '180px' : '220px' }}>
                  <UnstyledButton onClick={() => handleSort('email')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Email</Text>
                    {getSortIcon('email')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: '120px', maxWidth: '130px' }}>
                  <UnstyledButton onClick={() => handleSort('afdeling')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Afdeling</Text>
                    {getSortIcon('afdeling')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: '80px', maxWidth: '90px' }}>
                  <UnstyledButton onClick={() => handleSort('spor')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Spor</Text>
                    {getSortIcon('spor')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: '110px', maxWidth: '120px' }}>
                  <UnstyledButton onClick={() => handleSort('startdato')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Startdato</Text>
                    {getSortIcon('startdato')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: '110px', maxWidth: '120px' }}>
                  <UnstyledButton onClick={() => handleSort('slutdato')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Slutdato</Text>
                    {getSortIcon('slutdato')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: desktopOpened ? '100px' : '120px' }}>
                  <UnstyledButton onClick={() => handleSort('status')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text fw={500}>Status</Text>
                    {getSortIcon('status')}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ width: '120px' }}>Handlinger</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.map((student, index) => (
                <Table.Tr 
                  key={student.id}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: index % 2 === 0 
                      ? 'transparent'
                      : colorScheme === 'dark'
                        ? 'var(--mantine-color-dark-7)'
                        : 'var(--mantine-color-gray-0)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colorScheme === 'dark'
                      ? 'var(--mantine-color-dark-5)'
                      : 'var(--mantine-color-blue-0)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 
                      ? 'transparent'
                      : colorScheme === 'dark'
                        ? 'var(--mantine-color-dark-7)'
                        : 'var(--mantine-color-gray-0)'
                  }}
                  onClick={() => handleViewStudent(student)}
                >
                  <Table.Td>
                    <Text fw={500}>{student.navn}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" align="center">
                      <IconMapPin size={14} color="#6c757d" />
                      <Text size="sm">{student.kommune}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{student.email || '-'}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{student.afdeling}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      size="sm" 
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
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(student.startdato)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(student.slutdato)}
                    </Text>
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)'
                          e.currentTarget.style.boxShadow = colorScheme === 'dark' 
                            ? '0 2px 8px rgba(255, 255, 255, 0.1)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.15)'
                          e.currentTarget.style.backgroundColor = colorScheme === 'dark'
                            ? 'var(--mantine-color-gray-8)'
                            : 'var(--mantine-color-gray-1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.backgroundColor = ''
                        }}
                        style={{
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="blue"
                        onClick={() => handleEditStudent(student)}
                        title="Rediger elev"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)'
                          e.currentTarget.style.boxShadow = colorScheme === 'dark'
                            ? '0 2px 8px rgba(34, 139, 230, 0.4)'
                            : '0 2px 8px rgba(34, 139, 230, 0.3)'
                          e.currentTarget.style.backgroundColor = colorScheme === 'dark'
                            ? 'var(--mantine-color-blue-8)'
                            : 'var(--mantine-color-blue-1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.backgroundColor = ''
                        }}
                        style={{
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="red"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Slet elev"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)'
                          e.currentTarget.style.boxShadow = colorScheme === 'dark'
                            ? '0 2px 8px rgba(250, 82, 82, 0.4)'
                            : '0 2px 8px rgba(250, 82, 82, 0.3)'
                          e.currentTarget.style.backgroundColor = colorScheme === 'dark'
                            ? 'var(--mantine-color-red-8)'
                            : 'var(--mantine-color-red-1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.backgroundColor = ''
                        }}
                        style={{
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
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
