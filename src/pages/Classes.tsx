import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import {
  Grid,
  Card,
  Title,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Select,
  TextInput,
  Modal,
  ActionIcon,
  ScrollArea,
  Loader,
  Alert
} from '@mantine/core'
import { IconSearch, IconPlus, IconArrowRight, IconArrowLeft, IconEdit, IconTrash, IconAlertCircle, IconRefresh } from '@tabler/icons-react'
import { useStudents } from '../services/studentApi'
import { 
  useClasses, 
  useCreateClass, 
  useUpdateClass, 
  useDeleteClass, 
  useEnrollStudent, 
  useUnenrollStudent,
  type ClassData 
} from '../services/classApi'
import { availableFag } from '../data/mockClasses'
import { useTeachers } from '../services/teacherApi'
import { formatDate } from '../utils/dateUtils'
import { useModulperioder } from '../services/modulperiodeApi'

// Dato-safe sammenligning der ignorerer klokkeslæt (undgår timezone-problemer)
function toDateOnly(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function classStatus(startdato: string, slutdato: string): 'Fremtidig' | 'Igangværende' | 'Afsluttet' {
  const today = toDateOnly(new Date())
  const start = toDateOnly(new Date(startdato))
  const end = toDateOnly(new Date(slutdato))
  if (start > today) return 'Fremtidig'
  if (end < today) return 'Afsluttet'
  return 'Igangværende'
}

// Generer holdnavn: modulperiode-fag-lærer
function generateClassName(modulperiode: string, fag: string, lærer: string): string {
  return `${modulperiode}-${fag}-${lærer}`
}

export function Classes() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Igangværende')
  const [afdelingFilter, setAfdelingFilter] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { data: teachers = [] } = useTeachers()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Form state for new/edit class
  const [classForm, setClassForm] = useState({
    afdeling: '',
    lærer: '',
    fag: '',
    modulperiode: ''
  })

  // API hooks
  const { data: students = [] } = useStudents()
  const { data: classes = [], isLoading: classesLoading, error: classesError, refetch: refetchClasses } = useClasses()
  const { data: apiModulperioder = [] } = useModulperioder()

  const handleRefreshData = () => {
    refetchClasses()
    notifications.show({
      title: 'Data opdateret',
      message: 'Hold data er blevet genindlæst fra API',
      color: 'blue'
    })
  }
  const createClassMutation = useCreateClass()
  const updateClassMutation = useUpdateClass()
  const deleteClassMutation = useDeleteClass()
  const enrollStudentMutation = useEnrollStudent()
  const unenrollStudentMutation = useUnenrollStudent()

  const selectedClass = classes.find(c => c.id === selectedClassId)
  
  // Kun igangværende og fremtidige modulperioder kan bruges til nye hold
  const validModulperioder = apiModulperioder.filter(m => m.status !== 'Afsluttet')

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.navn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.lærer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.fag.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || cls.status === statusFilter
    const matchesAfdeling = !afdelingFilter || cls.afdeling === afdelingFilter

    return matchesSearch && matchesStatus && matchesAfdeling
  })

  // Get students in selected class
  const studentsInClass = selectedClass?.students || []

  // Get students not in any class for the selected modulperiode
  const studentsWithoutClass = selectedClass
    ? students.filter(s => {
        // Check if student is already in a class for this modulperiode
        const isInAnyClass = classes.some(cls => 
          cls.modulperiode === selectedClass.modulperiode && 
          cls.students?.some(student => student.id === s.id)
        )
        return !isInAnyClass
      })
    : []

  const afdelinger = ['Trekanten', 'Østjylland', 'Sønderjylland', 'Storkøbenhavn'].map(a => ({
    value: a,
    label: a
  }))

  const handleAddStudentToClass = async (studentId: number) => {
    if (!selectedClass) return
    
    // Tjek om holdet er afsluttet
    if (selectedClass.status === 'Afsluttet') {
      console.warn('Kan ikke tilføje elever til afsluttet hold')
      return
    }
    
    try {
      await enrollStudentMutation.mutateAsync({
        classId: selectedClass.id,
        studentId,
        enrollmentDate: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Failed to enroll student:', error)
    }
  }

  const handleRemoveStudentFromClass = async (studentId: number) => {
    if (!selectedClass) return
    
    // Tjek om holdet er afsluttet
    if (selectedClass.status === 'Afsluttet') {
      console.warn('Kan ikke fjerne elever fra afsluttet hold')
      return
    }
    
    try {
      await unenrollStudentMutation.mutateAsync({
        classId: selectedClass.id,
        studentId
      })
    } catch (error) {
      console.error('Failed to unenroll student:', error)
    }
  }

  const handleCreateClass = async () => {
    setValidationError(null)
    
    // Find modulperiode i API-data og brug reelle datoer
    const mpData = apiModulperioder.find(m => m.kode === classForm.modulperiode)
    if (!mpData || mpData.status === 'Afsluttet') {
      setValidationError('Kan ikke oprette hold for en afsluttet modulperiode.')
      return
    }
    
    const { startdato, slutdato } = mpData
    const navn = generateClassName(classForm.modulperiode, classForm.fag, classForm.lærer)
    
    const newClassData: Omit<ClassData, 'id'> = {
      navn,
      ...classForm,
      startdato,
      slutdato,
      status: classStatus(startdato, slutdato)
    }
    
    try {
      await createClassMutation.mutateAsync(newClassData)
      setCreateModalOpen(false)
      setClassForm({
        afdeling: '',
        lærer: '',
        fag: '',
        modulperiode: ''
      })
      setValidationError(null)
    } catch (error) {
      console.error('Failed to create class:', error)
      setValidationError('Kunne ikke oprette hold. Prøv igen.')
    }
  }

  const handleEditClass = async () => {
    if (!selectedClass) return
    
    const mpData = apiModulperioder.find(m => m.kode === classForm.modulperiode)
    const startdato = mpData?.startdato ?? selectedClass.startdato
    const slutdato = mpData?.slutdato ?? selectedClass.slutdato
    const navn = generateClassName(classForm.modulperiode, classForm.fag, classForm.lærer)
    
    const updatedClass: ClassData = {
      ...selectedClass,
      navn,
      ...classForm,
      startdato,
      slutdato,
      status: classStatus(startdato, slutdato)
    }
    
    try {
      await updateClassMutation.mutateAsync(updatedClass)
      setEditModalOpen(false)
    } catch (error) {
      console.error('Failed to update class:', error)
    }
  }

  const handleDeleteClass = async () => {
    if (!selectedClass) return
    
    try {
      await deleteClassMutation.mutateAsync(selectedClass.id)
      setSelectedClassId(null)
      setDeleteModalOpen(false)
    } catch (error) {
      console.error('Failed to delete class:', error)
    }
  }

  const handleOpenEdit = () => {
    if (!selectedClass) return
    
    setClassForm({
      afdeling: selectedClass.afdeling,
      lærer: selectedClass.lærer,
      fag: selectedClass.fag,
      modulperiode: selectedClass.modulperiode
    })
    setEditModalOpen(true)
  }

  return (
    <>
      {classesError && (
        <Alert icon={<IconAlertCircle size={16} />} title="Fejl" color="red" mb="md">
          Kunne ikke hente hold: {classesError instanceof Error ? classesError.message : 'Ukendt fejl'}
        </Alert>
      )}
      
      <Grid gutter="md">
        {/* Venstre kolonne - Hold liste */}
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
            <Group justify="space-between" mb="md">
              <Title order={3}>Hold</Title>
              <Group gap="xs">
                <Button
                  variant="light"
                  leftSection={<IconRefresh size={16} />}
                  size="sm"
                  onClick={handleRefreshData}
                >
                  Opdater
                </Button>
                <Button
                  leftSection={<IconPlus size={16} />}
                  size="sm"
                  onClick={() => setCreateModalOpen(true)}
                >
                  Opret hold
                </Button>
              </Group>
            </Group>

            <Stack gap="sm" mb="md">
              <Select
                placeholder="Status"
                data={[
                  { value: '', label: 'Alle' },
                  { value: 'Igangværende', label: 'Igangværende' },
                  { value: 'Fremtidig', label: 'Fremtidige' },
                  { value: 'Afsluttet', label: 'Afsluttede' }
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || '')}
              />
              <Select
                placeholder="Vælg afdeling"
                data={[{ value: '', label: 'Alle afdelinger' }, ...afdelinger]}
                value={afdelingFilter}
                onChange={setAfdelingFilter}
                clearable
              />
              <TextInput
                placeholder="Søg efter hold..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Stack>

            {classesLoading ? (
              <Stack align="center" justify="center" style={{ height: 200 }}>
                <Loader size="lg" />
                <Text c="dimmed">Henter hold...</Text>
              </Stack>
            ) : (
              <>
                <Stack gap="xs">
                  {filteredClasses.map((cls) => (
                    <Card
                      key={cls.id}
                      padding="sm"
                      radius="sm"
                      withBorder
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedClassId === cls.id ? 'var(--mantine-color-blue-light)' : undefined
                      }}
                      onClick={() => setSelectedClassId(cls.id)}
                    >
                      <Text size="sm" fw={500}>{cls.navn}</Text>
                      <Group gap="xs" mt={4}>
                        <Badge size="xs" color={
                          cls.status === 'Igangværende' ? 'green' :
                          cls.status === 'Fremtidig' ? 'blue' : 'gray'
                        }>
                          {cls.status}
                        </Badge>
                        <Text size="xs" c="dimmed">{cls.students?.length || 0} elever</Text>
                      </Group>
                    </Card>
                  ))}
                </Stack>

                {filteredClasses.length === 0 && (
                  <Text c="dimmed" ta="center" mt="xl">
                    Ingen hold fundet
                  </Text>
                )}
              </>
            )}
          </Card>
        </Grid.Col>

        {/* Højre kolonne - Hold detaljer */}
        <Grid.Col span={8}>
          {selectedClass ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
              <Group justify="space-between" mb="md">
                <Stack gap="xs">
                  <Title order={3}>{selectedClass.navn}</Title>
                  <Group gap="md">
                    <Text size="sm" c="dimmed">Afdeling: {selectedClass.afdeling}</Text>
                    <Text size="sm" c="dimmed">Lærer: {selectedClass.lærer}</Text>
                    <Text size="sm" c="dimmed">Fag: {selectedClass.fag}</Text>
                    <Text size="sm" c="dimmed">Modulperiode: {selectedClass.modulperiode}</Text>
                  </Group>
                </Stack>
                <Group gap="sm">
                  {selectedClass.status !== 'Afsluttet' && (
                    <>
                      <Button
                        variant="outline"
                        color="blue"
                        leftSection={<IconEdit size={16} />}
                        onClick={handleOpenEdit}
                      >
                        Rediger hold
                      </Button>
                      <Button
                        variant="outline"
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        Slet
                      </Button>
                    </>
                  )}
                </Group>
              </Group>

              <Grid gutter="md">
                {/* Elever uden hold */}
                <Grid.Col span={5}>
                  <Card withBorder padding="sm">
                    <Title order={5} mb="sm">
                      Elever uden hold i {selectedClass.modulperiode}
                    </Title>
                    {selectedClass.status === 'Afsluttet' && (
                      <Alert color="gray" variant="light" mb="sm">
                        Dette hold er afsluttet. Elever kan ikke tilføjes.
                      </Alert>
                    )}
                    <ScrollArea style={{ height: 400 }}>
                      <Stack gap="xs">
                        {studentsWithoutClass.map(student => (
                          <Group key={student.id} justify="space-between">
                            <Text size="sm" c={selectedClass.status === 'Afsluttet' ? 'dimmed' : undefined}>
                              {student.navn}
                            </Text>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleAddStudentToClass(student.id)}
                              title={selectedClass.status === 'Afsluttet' ? 'Holdet er afsluttet' : 'Tilføj til hold'}
                              disabled={selectedClass.status === 'Afsluttet'}
                              style={{ cursor: selectedClass.status === 'Afsluttet' ? 'not-allowed' : 'pointer' }}
                            >
                              <IconArrowRight size={16} />
                            </ActionIcon>
                          </Group>
                        ))}
                        {studentsWithoutClass.length === 0 && (
                          <Text size="sm" c="dimmed" ta="center">
                            Ingen elever uden hold
                          </Text>
                        )}
                      </Stack>
                    </ScrollArea>
                  </Card>
                </Grid.Col>

                <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stack gap="xs">
                    <IconArrowRight size={24} />
                    <IconArrowLeft size={24} />
                  </Stack>
                </Grid.Col>

                {/* Elever på holdet */}
                <Grid.Col span={5}>
                  <Card withBorder padding="sm">
                    <Title order={5} mb="sm">
                      Elever på holdet ({studentsInClass.length})
                    </Title>
                    {selectedClass.status === 'Afsluttet' && (
                      <Alert color="gray" variant="light" mb="sm">
                        Dette hold er afsluttet. Elever kan ikke fjernes.
                      </Alert>
                    )}
                    <ScrollArea style={{ height: 400 }}>
                      <Stack gap="xs">
                        {studentsInClass.map(student => (
                          <Group key={student.id} justify="space-between">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleRemoveStudentFromClass(student.id)}
                              title={selectedClass.status === 'Afsluttet' ? 'Holdet er afsluttet' : 'Fjern fra hold'}
                              disabled={selectedClass.status === 'Afsluttet'}
                              style={{ cursor: selectedClass.status === 'Afsluttet' ? 'not-allowed' : 'pointer' }}
                            >
                              <IconArrowLeft size={16} />
                            </ActionIcon>
                            <Text size="sm" c={selectedClass.status === 'Afsluttet' ? 'dimmed' : undefined}>
                              {student.navn}
                            </Text>
                          </Group>
                        ))}
                        {studentsInClass.length === 0 && (
                          <Text size="sm" c="dimmed" ta="center">
                            Ingen elever på holdet
                          </Text>
                        )}
                      </Stack>
                    </ScrollArea>
                  </Card>
                </Grid.Col>
              </Grid>
            </Card>
          ) : (
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: 'calc(100vh - 120px)' }}>
              <Stack align="center" justify="center" style={{ height: '100%' }}>
                <Text c="dimmed" size="lg">Vælg et hold fra listen for at se detaljer</Text>
              </Stack>
            </Card>
          )}
        </Grid.Col>
      </Grid>

      {/* Create Class Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          setValidationError(null)
        }}
        title="Opret nyt hold"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Afdeling"
            placeholder="Vælg afdeling"
            data={afdelinger}
            value={classForm.afdeling}
            onChange={(value) => setClassForm({ ...classForm, afdeling: value || '' })}
          />
          <Select
            label="Lærer"
            placeholder="Vælg lærer"
            data={teachers
              .filter(t => t.aktiv)
              .filter(t => !classForm.afdeling || t.afdelinger.includes(classForm.afdeling as any))
              .map(t => ({ value: t.initialer, label: `${t.navn} (${t.initialer})` }))
            }
            value={classForm.lærer}
            onChange={(value) => setClassForm({ ...classForm, lærer: value || '' })}
            searchable
          />
          <Select
            label="Fag"
            placeholder="Vælg fag"
            data={availableFag.map(f => ({ value: f, label: f }))}
            value={classForm.fag}
            onChange={(value) => setClassForm({ ...classForm, fag: value || '' })}
            searchable
          />
          <Select
            label="Modulperiode"
            placeholder={validModulperioder.length === 0 ? 'Ingen aktive modulperioder — opret under Administration' : 'Vælg modulperiode'}
            data={validModulperioder.map(m => ({
              value: m.kode,
              label: `${m.kode} ${m.status === 'Igangværende' ? '🟢' : '🔵'} (${formatDate(m.startdato)} – ${formatDate(m.slutdato)})`
            }))}
            value={classForm.modulperiode}
            onChange={(value) => {
              setClassForm({ ...classForm, modulperiode: value || '' })
              setValidationError(null)
            }}
            disabled={validModulperioder.length === 0}
          />
          {validationError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {validationError}
            </Alert>
          )}
          {classForm.modulperiode && classForm.fag && classForm.lærer && (
            <Text size="sm" c="dimmed">
              Holdnavn: <strong>{generateClassName(classForm.modulperiode, classForm.fag, classForm.lærer)}</strong>
            </Text>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setCreateModalOpen(false)}>
              Annuller
            </Button>
            <Button 
              onClick={handleCreateClass}
              disabled={!classForm.afdeling || !classForm.lærer || !classForm.fag || !classForm.modulperiode}
            >
              Opret hold
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Rediger hold"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Afdeling"
            placeholder="Vælg afdeling"
            data={afdelinger}
            value={classForm.afdeling}
            onChange={(value) => setClassForm({ ...classForm, afdeling: value || '' })}
          />
          <Select
            label="Lærer"
            placeholder="Vælg lærer"
            data={teachers
              .filter(t => t.aktiv)
              .filter(t => !classForm.afdeling || t.afdelinger.includes(classForm.afdeling as any))
              .map(t => ({ value: t.initialer, label: `${t.navn} (${t.initialer})` }))
            }
            value={classForm.lærer}
            onChange={(value) => setClassForm({ ...classForm, lærer: value || '' })}
            searchable
          />
          <Select
            label="Fag"
            placeholder="Vælg fag"
            data={availableFag.map(f => ({ value: f, label: f }))}
            value={classForm.fag}
            onChange={(value) => setClassForm({ ...classForm, fag: value || '' })}
            searchable
          />
          <Select
            label="Modulperiode"
            placeholder="Vælg modulperiode"
            data={validModulperioder.map(m => ({
              value: m.kode,
              label: `${m.kode} ${m.status === 'Igangværende' ? '🟢' : '🔵'} (${formatDate(m.startdato)} – ${formatDate(m.slutdato)})`
            }))}
            value={classForm.modulperiode}
            onChange={(value) => setClassForm({ ...classForm, modulperiode: value || '' })}
          />
          {classForm.modulperiode && classForm.fag && classForm.lærer && (
            <Text size="sm" c="dimmed">
              Nyt holdnavn: <strong>{generateClassName(classForm.modulperiode, classForm.fag, classForm.lærer)}</strong>
            </Text>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setEditModalOpen(false)}>
              Annuller
            </Button>
            <Button onClick={handleEditClass}>
              Gem ændringer
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Slet hold"
        centered
      >
        <Stack gap="md">
          <Text>Er du sikker på at du vil slette holdet <strong>{selectedClass?.navn}</strong>?</Text>
          <Text size="sm" c="dimmed">
            Dette vil fjerne alle elever fra holdet. Handlingen kan ikke fortrydes.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
              Annuller
            </Button>
            <Button color="red" onClick={handleDeleteClass}>
              Slet hold
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default Classes
