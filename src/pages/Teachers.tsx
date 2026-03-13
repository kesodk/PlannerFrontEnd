import { useState } from 'react'
import {
  Container,
  Title,
  Group,
  Button,
  TextInput,
  MultiSelect,
  Switch,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Stack,
  Text,
  Alert,
  Loader,
  Center,
  Tooltip,
  PasswordInput,
  Divider,
  Box,
  Chip,
  UnstyledButton,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconChalkboard,
  IconAlertCircle,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { useForm } from '@mantine/form'
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from '../services/teacherApi'
import type { Teacher, Department, TeacherPayload } from '../types/Teacher'

const DEPARTMENTS: Department[] = ['Trekanten', 'Østjylland', 'Sønderjylland', 'Storkøbenhavn']

const DEPARTMENT_COLORS: Record<Department, string> = {
  Trekanten:     'blue',
  Østjylland:    'teal',
  Sønderjylland: 'orange',
  Storkøbenhavn: 'violet',
}

type TeacherFormValues = {
  navn: string
  initialer: string
  email: string
  telefon: string
  rolle: string
  afdelinger: Department[]
  aktiv: boolean
  password: string
}

function validate(values: TeacherFormValues, isEditing: boolean) {
  const errors: Partial<Record<keyof TeacherFormValues, string>> = {}

  if (!values.navn.trim())
    errors.navn = 'Navn er påkrævet'
  if (!values.initialer.trim())
    errors.initialer = 'Initialer er påkrævet'
  if (!/^[A-ZÆØÅ]{4}$/.test(values.initialer.toUpperCase()))
    errors.initialer = 'Initialer skal være præcis 4 store bogstaver'
  if (!values.email.trim())
    errors.email = 'Email er påkrævet'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = 'Ugyldig email-adresse'
  if (values.afdelinger.length === 0)
    errors.afdelinger = 'Vælg mindst én afdeling'
  if (!isEditing && !values.password.trim())
    errors.password = 'Password er påkrævet ved oprettelse'
  if (!isEditing && values.password.length > 0 && values.password.length < 8)
    errors.password = 'Password skal være mindst 8 tegn'

  return errors
}

type SortField = 'navn' | 'afdeling'

export function Teachers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpened, setModalOpened] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [sortBy, setSortBy] = useState<SortField>('navn')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [afdelingFilter, setAfdelingFilter] = useState<string[]>([...DEPARTMENTS])

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <IconSelector size={14} style={{ opacity: 0.4 }} />
    return sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
  }

  const { data: teachers = [], isLoading, isError, refetch } = useTeachers()
  const createTeacher = useCreateTeacher()
  const updateTeacher = useUpdateTeacher()
  const deleteTeacher = useDeleteTeacher()

  const form = useForm<TeacherFormValues>({
    initialValues: {
      navn: '',
      initialer: '',
      email: '',
      telefon: '',
      rolle: '',
      afdelinger: [],
      aktiv: true,
      password: '',
    },
    validate: (values) => validate(values, !!editingTeacher),
  })

  const openCreateModal = () => {
    setEditingTeacher(null)
    form.reset()
    setModalOpened(true)
  }

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    form.setValues({
      navn:       teacher.navn,
      initialer:  teacher.initialer,
      email:      teacher.email,
      telefon:    teacher.telefon ?? '',
      rolle:      teacher.rolle ?? '',
      afdelinger: teacher.afdelinger,
      aktiv:      teacher.aktiv,
      password:   '',
    })
    setModalOpened(true)
  }

  const handleSubmit = (values: TeacherFormValues) => {
    const payload: TeacherPayload = {
      navn:       values.navn.trim(),
      initialer:  values.initialer.trim().toUpperCase(),
      email:      values.email.trim().toLowerCase(),
      telefon:    values.telefon.trim() || undefined,
      rolle:      values.rolle.trim() || undefined,
      afdelinger: values.afdelinger,
      aktiv:      values.aktiv,
      ...(values.password ? { password: values.password } : {}),
    }

    if (editingTeacher) {
      updateTeacher.mutate({ id: editingTeacher.id, data: payload }, {
        onSuccess: () => setModalOpened(false),
      })
    } else {
      createTeacher.mutate(payload, {
        onSuccess: () => setModalOpened(false),
      })
    }
  }

  const handleDelete = (teacher: Teacher) => {
    modals.openConfirmModal({
      title: 'Slet underviser',
      children: (
        <Text size="sm">
          Er du sikker på, at du vil slette <strong>{teacher.navn}</strong>? Denne handling kan ikke fortrydes.
        </Text>
      ),
      labels: { confirm: 'Slet', cancel: 'Annuller' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteTeacher.mutate(teacher.id),
    })
  }

  const filtered = teachers
    .filter((t) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        t.navn.toLowerCase().includes(q) ||
        t.initialer.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.afdelinger.some((a) => a.toLowerCase().includes(q)) ||
        (t.telefon ?? '').toLowerCase().includes(q)
      const matchesAfdeling = t.afdelinger.some((a) => afdelingFilter.includes(a))
      return matchesSearch && matchesAfdeling
    })
    .sort((a, b) => {
      let aVal: string
      let bVal: string
      if (sortBy === 'afdeling') {
        aVal = [...a.afdelinger].sort().join(', ')
        bVal = [...b.afdelinger].sort().join(', ')
      } else {
        aVal = a.navn
        bVal = b.navn
      }
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal, 'da')
        : bVal.localeCompare(aVal, 'da')
    })

  const rows = filtered.map((teacher) => (
    <Table.Tr key={teacher.id}>
      <Table.Td fw={500}>{teacher.navn}</Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue" tt="uppercase">
          {teacher.initialer}
        </Badge>
      </Table.Td>
      <Table.Td>{teacher.email}</Table.Td>
      <Table.Td>{teacher.telefon ?? '—'}</Table.Td>
      <Table.Td>{teacher.rolle ?? '—'}</Table.Td>
      <Table.Td>
        <Stack gap={4}>
          {Array.from({ length: Math.ceil(teacher.afdelinger.length / 2) }, (_, i) =>
            teacher.afdelinger.slice(i * 2, i * 2 + 2)
          ).map((row, i) => (
            <Group key={i} gap={4} wrap="nowrap">
              {row.map((a) => (
                <Badge key={a} variant="outline" size="sm" color={DEPARTMENT_COLORS[a as Department] ?? 'gray'}>{a}</Badge>
              ))}
            </Group>
          ))}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Badge color={teacher.aktiv ? 'green' : 'red'} variant="dot">
          {teacher.aktiv ? 'Aktiv' : 'Inaktiv'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={4} wrap="nowrap">
          <Tooltip label="Rediger">
            <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(teacher)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Slet">
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(teacher)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconChalkboard size={28} />
          <Title order={1}>Underviser Administration</Title>
        </Group>
        <Group>
          <Tooltip label="Opdater liste">
            <ActionIcon variant="light" onClick={() => refetch()} loading={isLoading}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Tilføj underviser
          </Button>
        </Group>
      </Group>

      <Text c="dimmed" mb="lg" size="sm">
        Administrer undervisere — opret, rediger og slet. Undervisere kan logge ind med deres initialer og password.
      </Text>

      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} title="Fejl" color="red" mb="md">
          Kunne ikke hente undervisere. Tjek at backend kører på {'{API_URL}'}.
        </Alert>
      )}

      <Group mb="md" align="center" gap="xs">
        <Text size="sm" fw={500} c="dimmed">Afdelinger:</Text>
        <Chip.Group multiple value={afdelingFilter} onChange={(v) => setAfdelingFilter(v)}>
          <Group gap={6}>
            {DEPARTMENTS.map((d) => (
              <Chip key={d} value={d} size="sm" variant="light" color={DEPARTMENT_COLORS[d]}>{d}</Chip>
            ))}
          </Group>
        </Chip.Group>
      </Group>

      <TextInput
        placeholder="Søg på navn, initialer, email, afdeling..."
        leftSection={<IconSearch size={16} />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        mb="md"
        w={360}
      />

      {isLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : filtered.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {searchTerm ? 'Ingen undervisere matcher søgningen.' : 'Ingen undervisere oprettet endnu.'}
        </Text>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <UnstyledButton onClick={() => handleSort('navn')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  Navn <SortIcon field="navn" />
                </UnstyledButton>
              </Table.Th>
              <Table.Th>Initialer</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Telefon</Table.Th>
              <Table.Th>Rolle</Table.Th>
              <Table.Th>
                <UnstyledButton onClick={() => handleSort('afdeling')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  Afdeling(er) <SortIcon field="afdeling" />
                </UnstyledButton>
              </Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Handlinger</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      <Text size="xs" c="dimmed" mt="sm">
        Viser {filtered.length} af {teachers.length} undervisere
      </Text>

      {/* ─── Opret / Rediger modal ─────────────────────────────────────────── */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Text fw={600} size="lg">
            {editingTeacher ? 'Rediger underviser' : 'Tilføj underviser'}
          </Text>
        }
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)} autoComplete="off">
          <Stack gap="sm">
            <TextInput
              label="Fulde navn"
              placeholder="F.eks. Marie Nielsen"
              required
              autoComplete="off"
              {...form.getInputProps('navn')}
              onChange={(e) => {
                const navn = e.currentTarget.value
                form.setFieldValue('navn', navn)
                if (!editingTeacher) {
                  const parts = navn.trim().split(/\s+/).filter(Boolean)
                  if (parts.length >= 2) {
                    const ini = (parts[0].slice(0, 2) + parts[parts.length - 1].slice(0, 2)).toUpperCase()
                    form.setFieldValue('initialer', ini)
                    form.setFieldValue('email', ini.toLowerCase() + '@aspit.dk')
                  }
                }
              }}
            />

            <TextInput
              label="Initialer"
              placeholder="F.eks. MARA"
              description="Præcis 4 store bogstaver – bruges til login (2 fra fornavn + 2 fra efternavn)"
              required
              maxLength={4}
              autoComplete="off"
              {...form.getInputProps('initialer')}
              onChange={(e) => {
                const ini = e.currentTarget.value.toUpperCase()
                form.setFieldValue('initialer', ini)
                if (!editingTeacher) {
                  form.setFieldValue('email', ini.toLowerCase() + '@aspit.dk')
                }
              }}
            />

            <TextInput
              label="Email"
              placeholder="mara@aspit.dk"
              required
              autoComplete="off"
              {...form.getInputProps('email')}
            />

            <TextInput
              label="Telefon"
              placeholder="23 45 67 89"
              {...form.getInputProps('telefon')}
            />

            <TextInput
              label="Rolle"
              placeholder="F.eks. Underviser, Afdelingsleder"
              {...form.getInputProps('rolle')}
            />

            <MultiSelect
              label="Afdeling(er)"
              placeholder="Vælg én eller flere afdelinger"
              description="En underviser kan dække flere afdelinger"
              required
              data={DEPARTMENTS}
              {...form.getInputProps('afdelinger')}
            />

            <Switch
              label="Aktiv konto"
              description="Slå fra for at deaktivere underviseren uden at slette"
              {...form.getInputProps('aktiv', { type: 'checkbox' })}
            />

            <Divider label="Login" labelPosition="center" my="xs" />

            <PasswordInput
              label={editingTeacher ? 'Nyt password (lad stå tomt for at beholde)' : 'Password'}
              placeholder="Mindst 8 tegn"
              required={!editingTeacher}
              {...form.getInputProps('password')}
            />

            <Box mt="sm">
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setModalOpened(false)}>
                  Annuller
                </Button>
                <Button
                  type="submit"
                  loading={createTeacher.isPending || updateTeacher.isPending}
                >
                  {editingTeacher ? 'Gem ændringer' : 'Opret underviser'}
                </Button>
              </Group>
            </Box>
          </Stack>
        </form>
      </Modal>
    </Container>
  )
}

export default Teachers
