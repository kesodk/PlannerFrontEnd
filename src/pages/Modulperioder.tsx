import { useState } from 'react'
import {
  Container,
  Title,
  Group,
  Button,
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
  TextInput,
  Box,
  Divider,
  Paper,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconAlertCircle,
  IconCalendar,
  IconLock,
  IconX,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react'
import {
  useModulperioder,
  useCreateModulperiode,
  useUpdateModulperiode,
  useDeleteModulperiode,
  type Modulperiode,
  type FridagInput,
} from '../services/modulperiodeApi'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function toIso(date: Date): string {
  return date.toISOString().split('T')[0]
}

function statusColor(status: Modulperiode['status']): string {
  if (status === 'Fremtidig') return 'blue'
  if (status === 'Igangværende') return 'green'
  return 'gray'
}

const STATUS_LABELS: Record<Modulperiode['status'], string> = {
  Fremtidig: 'Fremtidig',
  Igangværende: 'Igangværende',
  Afsluttet: 'Afsluttet',
}

// ─── Form ─────────────────────────────────────────────────────────────────────

type FormValues = {
  kode: string
  startdato: Date | null
  slutdato: Date | null
}

type FridagEntry = {
  titel: string
  startdato: Date | null
  slutdato: Date | null
}

// ─── Component ────────────────────────────────────────────────────────────────

function Modulperioder() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Modulperiode | null>(null)
  const [fridage, setFridage] = useState<FridagEntry[]>([])
  const [sortDesc, setSortDesc] = useState(true)

  const { data: modulperioder = [], isLoading, error, refetch } = useModulperioder()
  const createMutation = useCreateModulperiode()
  const updateMutation = useUpdateModulperiode()
  const deleteMutation = useDeleteModulperiode()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const form = useForm<FormValues>({
    initialValues: { kode: '', startdato: null, slutdato: null },
    validate: {
      kode: (v) => {
        if (!v.trim()) return 'Kode er påkrævet'
        if (!/^\d{2}-[12]-M[123]$/.test(v.trim()))
          return 'Format skal være ÅÅ-H-M# (f.eks. 26-2-M1)'
        return null
      },
      startdato: (v) => {
        if (!v) return 'Startdato er påkrævet'
        const d = new Date(v)
        d.setHours(0, 0, 0, 0)
        if (d <= today) return 'Startdato skal ligge i fremtiden'
        return null
      },
      slutdato: (v, values) => {
        if (!v) return 'Slutdato er påkrævet'
        if (values.startdato && v <= values.startdato) return 'Slutdato skal være efter startdato'
        return null
      },
    },
  })

  const openCreate = () => {
    setEditing(null)
    form.reset()
    setFridage([])
    setModalOpen(true)
  }

  const openEdit = (mp: Modulperiode) => {
    setEditing(mp)
    form.setValues({
      kode: mp.kode,
      startdato: new Date(mp.startdato + 'T00:00:00'),
      slutdato: new Date(mp.slutdato + 'T00:00:00'),
    })
    setFridage(
      mp.fridage.map((f) => ({
        titel: f.titel,
        startdato: new Date(f.startdato + 'T00:00:00'),
        slutdato: new Date(f.slutdato + 'T00:00:00'),
      }))
    )
    setModalOpen(true)
  }

  const handleSubmit = async (values: FormValues) => {
    if (!values.startdato || !values.slutdato) return

    // Validate fridage
    for (let i = 0; i < fridage.length; i++) {
      const f = fridage[i]
      if (!f.titel.trim()) {
        notifications.show({ title: 'Fejl', message: `Særlig dag #${i + 1}: titel mangler`, color: 'red' })
        return
      }
      if (!f.startdato) {
        notifications.show({ title: 'Fejl', message: `Særlig dag #${i + 1}: startdato mangler`, color: 'red' })
        return
      }
      if (!f.slutdato) {
        notifications.show({ title: 'Fejl', message: `Særlig dag #${i + 1}: slutdato mangler`, color: 'red' })
        return
      }
      if (f.slutdato < f.startdato) {
        notifications.show({ title: 'Fejl', message: `Særlig dag #${i + 1}: slutdato skal være efter startdato`, color: 'red' })
        return
      }
    }

    const fridagePayload: FridagInput[] = fridage
      .filter((f) => f.startdato && f.slutdato && f.titel.trim())
      .map((f) => ({
        titel: f.titel.trim(),
        startdato: toIso(f.startdato!),
        slutdato: toIso(f.slutdato!),
      }))

    const payload = {
      kode: values.kode.trim(),
      startdato: toIso(values.startdato),
      slutdato: toIso(values.slutdato),
      fridage: fridagePayload,
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload })
        notifications.show({
          title: 'Modulperiode opdateret',
          message: `${payload.kode} er blevet opdateret.`,
          color: 'green',
        })
      } else {
        await createMutation.mutateAsync(payload)
        notifications.show({
          title: 'Modulperiode oprettet',
          message: `${payload.kode} er blevet oprettet.`,
          color: 'green',
        })
      }
      setModalOpen(false)
      form.reset()
      setFridage([])
    } catch (err: any) {
      notifications.show({
        title: 'Fejl',
        message: err?.message || 'Noget gik galt.',
        color: 'red',
      })
    }
  }

  const handleDelete = (mp: Modulperiode) => {
    modals.openConfirmModal({
      title: 'Slet modulperiode',
      children: (
        <Text size="sm">
          Er du sikker på at du vil slette <strong>{mp.kode}</strong>?
          Dette kan ikke fortrydes, og hold tilknyttet denne modulperiode kan blive påvirket.
        </Text>
      ),
      labels: { confirm: 'Slet', cancel: 'Annuller' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(mp.id)
          notifications.show({
            title: 'Slettet',
            message: `${mp.kode} er blevet slettet.`,
            color: 'orange',
          })
        } catch (err: any) {
          notifications.show({
            title: 'Fejl',
            message: err?.message || 'Kunne ikke slette modulperioden.',
            color: 'red',
          })
        }
      },
    })
  }

  const isBusy = createMutation.isPending || updateMutation.isPending

  // Sort: by startdato only (desc = newest first by default)
  const sorted = [...modulperioder].sort((a, b) =>
    sortDesc
      ? b.startdato.localeCompare(a.startdato)
      : a.startdato.localeCompare(b.startdato)
  )

  return (
    <Container size="lg">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <IconCalendar size={28} />
          <Title order={1}>Modulperioder</Title>
        </Group>
        <Group gap="sm">
          <Tooltip label="Genindlæs">
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => refetch()}>
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Tilføj modulperiode
          </Button>
        </Group>
      </Group>

      <Text c="dimmed" size="sm" mb="lg">
        Administrer modulperioder — opret, rediger og slet. Kun fremtidige modulperioder kan redigeres og slettes.
        Igangværende og afsluttede modulperioder er låste for at beskytte eksisterende data.
      </Text>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          Kunne ikke hente modulperioder. Tjek at backend kører.
        </Alert>
      )}

      {isLoading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : sorted.length === 0 ? (
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          Ingen modulperioder oprettet endnu. Klik "Tilføj modulperiode" for at komme i gang.
        </Alert>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Kode</Table.Th>
              <Table.Th
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                onClick={() => setSortDesc((d) => !d)}
              >
                <Group gap={4} wrap="nowrap">
                  Startdato
                  {sortDesc ? <IconArrowDown size={14} /> : <IconArrowUp size={14} />}
                </Group>
              </Table.Th>
              <Table.Th>Slutdato</Table.Th>
              <Table.Th>Fridage / Helligdage</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ width: 100, textAlign: 'center' }}>Handlinger</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sorted.map((mp) => {
              const canEdit = mp.status === 'Fremtidig'
              const lockReason =
                mp.status === 'Igangværende'
                  ? 'Igangværende modulperioder kan ikke ændres'
                  : mp.status === 'Afsluttet'
                  ? 'Afsluttede modulperioder kan ikke ændres'
                  : ''

              return (
                <Table.Tr key={mp.id} style={{ opacity: mp.status === 'Afsluttet' ? 0.6 : 1 }}>
                  <Table.Td fw={600}>{mp.kode}</Table.Td>
                  <Table.Td>{formatDate(mp.startdato)}</Table.Td>
                  <Table.Td>{formatDate(mp.slutdato)}</Table.Td>
                  <Table.Td>
                    {mp.fridage.length === 0 ? (
                      <Text size="xs" c="dimmed">–</Text>
                    ) : (
                      <Stack gap={2}>
                        {mp.fridage.map((f) => (
                          <Group key={f.id} gap={4} wrap="nowrap">
                            <Badge size="xs" color="orange" variant="light" style={{ flexShrink: 0 }}>
                              {f.titel}
                            </Badge>
                            <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                              {formatDate(f.startdato)}–{formatDate(f.slutdato)}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColor(mp.status)} variant="light">
                      {STATUS_LABELS[mp.status]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center">
                      {canEdit ? (
                        <>
                          <Tooltip label="Rediger">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => openEdit(mp)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Slet">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(mp)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip label={lockReason}>
                          <Box>
                            <IconLock size={16} style={{ opacity: 0.4 }} />
                          </Box>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      )}

      <Text c="dimmed" size="xs" mt="md">
        Viser {sorted.length} modulperiode{sorted.length !== 1 ? 'r' : ''}
      </Text>

      {/* Create / Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => { setModalOpen(false); setFridage([]) }}
        title={editing ? `Rediger ${editing.kode}` : 'Opret ny modulperiode'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Kode"
              placeholder="f.eks. 26-2-M1"
              description="Format: ÅÅ-H-M# (halvår: 1=forår, 2=efterår, modul: M1/M2/M3)"
              disabled={!!editing}
              {...form.getInputProps('kode')}
            />

            <DatePickerInput
              label="Startdato"
              placeholder="Vælg startdato"
              minDate={new Date(today.getTime() + 86400000)}
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps('startdato')}
            />

            <DatePickerInput
              label="Slutdato"
              placeholder="Vælg slutdato"
              minDate={
                form.values.startdato
                  ? new Date(form.values.startdato.getTime() + 86400000)
                  : new Date(today.getTime() + 86400000)
              }
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps('slutdato')}
            />

            {/* ── Særlige dage / ferieperioder ── */}
            <Divider label="Fridage og ferieperioder" labelPosition="left" />

            <Text size="xs" c="dimmed">
              Tilføj ferie- og helligdage inden for modulperioden. Disse dage markeres som undervisningsfri i
              fremmødekalenderen og tæller ikke med i fraværsprocenten.
            </Text>

            <Stack gap="xs">
              {fridage.map((f, idx) => (
                <Paper key={idx} withBorder radius="sm" p="sm">
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Text size="sm" fw={600} c="dimmed">Særlig dag #{idx + 1}</Text>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => setFridage((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>

                    <TextInput
                      placeholder="f.eks. Påskeferie, Kristi Himmelfartsdag"
                      label="Titel"
                      size="sm"
                      value={f.titel}
                      onChange={(e) =>
                        setFridage((prev) =>
                          prev.map((item, i) => i === idx ? { ...item, titel: e.currentTarget.value } : item)
                        )
                      }
                    />

                    <Group grow gap="xs">
                      <DatePickerInput
                        label="Fra"
                        placeholder="Startdato"
                        valueFormat="DD/MM/YYYY"
                        size="sm"
                        value={f.startdato}
                        onChange={(date) =>
                          setFridage((prev) =>
                            prev.map((item, i) => i === idx ? { ...item, startdato: date as Date | null } : item)
                          )
                        }
                        minDate={form.values.startdato ?? undefined}
                        maxDate={form.values.slutdato ?? undefined}
                      />
                      <DatePickerInput
                        label="Til"
                        placeholder="Slutdato"
                        valueFormat="DD/MM/YYYY"
                        size="sm"
                        value={f.slutdato}
                        onChange={(date) =>
                          setFridage((prev) =>
                            prev.map((item, i) => i === idx ? { ...item, slutdato: date as Date | null } : item)
                          )
                        }
                        minDate={f.startdato ?? form.values.startdato ?? undefined}
                        maxDate={form.values.slutdato ?? undefined}
                      />
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Button
              variant="light"
              color="orange"
              leftSection={<IconPlus size={14} />}
              size="sm"
              onClick={() => setFridage((prev) => [...prev, { titel: '', startdato: null, slutdato: null }])}
            >
              Tilføj ferie / helligdag
            </Button>

            <Alert icon={<IconAlertCircle size={14} />} color="yellow" variant="light">
              Husk at en modulperiode, når den er oprettet og sat i gang, ikke kan ændres. Kontrollér datoerne nøje.
            </Alert>

            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={() => { setModalOpen(false); setFridage([]) }}>
                Annuller
              </Button>
              <Button type="submit" loading={isBusy}>
                {editing ? 'Gem ændringer' : 'Opret'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  )
}

export { Modulperioder }
export default Modulperioder
