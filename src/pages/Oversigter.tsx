import { useState, useMemo, useCallback } from 'react'
import {
  Grid,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Select,
  Button,
  Badge,
  Table,
  ScrollArea,
  Alert,
  Loader,
  Center,
  Tooltip,
  Divider,
  ActionIcon,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconBuildingStore,
  IconArrowRight,
  IconAlertCircle,
  IconRefresh,
  IconCheck,
} from '@tabler/icons-react'
import { useModulperioder } from '../services/modulperiodeApi'
import {
  useOversigterElever,
  useAktivitetsplan,
  useUpsertSelection,
  useOverfor,
  calculateSemester,
  ASPIT_FAG,
  type OversigterElev,
} from '../services/oversigterApi'

// ── Constants ─────────────────────────────────────────────────────────────────

const AFDELINGER = [
  { value: 'Østjylland', label: 'Østjylland' },
  { value: 'Trekanten', label: 'Trekanten' },
  { value: 'Sønderjylland', label: 'Sønderjylland' },
  { value: 'Storkøbenhavn', label: 'Storkøbenhavn' },
]

const FAG_OPTIONS = ASPIT_FAG.map((f) => ({ value: f, label: f }))

// Priority badge helper
function PrioritetBadge({ value, priority }: { value: string | null; priority: number }) {
  if (!value) return <Text c="dimmed" size="xs">—</Text>
  const colors = ['blue', 'teal', 'gray'] as const
  return (
    <Tooltip label={`${priority}. prioritet: ${value}`} withArrow>
      <Badge size="xs" variant="light" color={colors[priority - 1] ?? 'gray'} style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Badge>
    </Tooltip>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Oversigter() {
  const [afdeling, setAfdeling] = useState<string | null>(null)
  const [tilModulperiode, setTilModulperiode] = useState<string | null>(null)

  // Local state for næste modul selections (optimistic UI)
  // key: student_id → tildelt_fag
  const [localSelections, setLocalSelections] = useState<Record<number, string | null>>({})

  const { data: modulperioder = [], isLoading: mpLoading } = useModulperioder()

  const modulperiodeOptions = useMemo(
    () =>
      modulperioder
        .filter((mp) => mp.status === 'Igangværende' || mp.status === 'Fremtidig')
        .map((mp) => ({
          value: mp.kode,
          label: `${mp.kode} (${mp.status})`,
        })),
    [modulperioder]
  )

  const {
    data: elever = [],
    isLoading: elevLoading,
    isError: elevError,
    refetch: refetchElever,
  } = useOversigterElever({ afdeling: afdeling ?? undefined })

  const {
    data: aktivitetsplan,
    isLoading: aktivLoading,
    refetch: refetchAktiv,
  } = useAktivitetsplan(tilModulperiode ?? undefined)

  const upsertMutation = useUpsertSelection()
  const overforMutation = useOverfor()

  // Merge server selections with local overrides
  const resolvedElever = useMemo(
    () =>
      elever.map((elev) => ({
        ...elev,
        tildelt_fag:
          elev.id in localSelections ? localSelections[elev.id] : elev.tildelt_fag,
      })),
    [elever, localSelections]
  )

  // Count how many students have a fag selected (but not yet overført) for the selected period
  const pendingCount = useMemo(
    () =>
      resolvedElever.filter(
        (e) =>
          e.tildelt_fag &&
          (e.til_modulperiode === tilModulperiode || tilModulperiode === null) &&
          !e.overfort
      ).length,
    [resolvedElever, tilModulperiode]
  )

  const handleFagChange = useCallback(
    (elev: OversigterElev, newFag: string | null) => {
      if (!tilModulperiode) {
        notifications.show({
          color: 'yellow',
          title: 'Vælg modulperiode',
          message: 'Vælg den modulperiode du planlægger for, før du tildeler fag.',
        })
        return
      }

      // Optimistic update
      setLocalSelections((prev) => ({ ...prev, [elev.id]: newFag }))

      upsertMutation.mutate(
        {
          student_id: elev.id,
          til_modulperiode: tilModulperiode,
          afdeling: elev.afdeling,
          tildelt_fag: newFag,
        },
        {
          onError: () => {
            // Revert on error
            setLocalSelections((prev) => {
              const next = { ...prev }
              delete next[elev.id]
              return next
            })
            notifications.show({
              color: 'red',
              title: 'Fejl',
              message: 'Kunne ikke gemme valg. Prøv igen.',
            })
          },
        }
      )
    },
    [tilModulperiode, upsertMutation]
  )

  const handleOverfor = useCallback(() => {
    if (!afdeling || !tilModulperiode) return

    overforMutation.mutate(
      { afdeling, til_modulperiode: tilModulperiode },
      {
        onSuccess: (data) => {
          setLocalSelections({})
          notifications.show({
            icon: <IconCheck size={16} />,
            color: 'green',
            title: 'Overført!',
            message: data.message,
          })
          refetchAktiv()
          refetchElever()
        },
        onError: () => {
          notifications.show({
            color: 'red',
            title: 'Fejl',
            message: 'Overførslen mislykkedes. Prøv igen.',
          })
        },
      }
    )
  }, [afdeling, tilModulperiode, overforMutation, refetchAktiv, refetchElever])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Stack gap="md">
      <Grid gutter="md" columns={100}>
        {/* ── LEFT COLUMN: Elev-oversigt (60%) ─────────────────────────── */}
        <Grid.Col span={{ base: 100, md: 68, lg: 68 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            {/* Header / filters */}
            <Stack gap="sm" mb="md">
              <Group justify="space-between" align="flex-end">
                <Title order={4}>Elevoversigt — Næste modul</Title>
                <ActionIcon
                  variant="subtle"
                  onClick={() => refetchElever()}
                  title="Opdater elevliste"
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Group>

              <Group gap="sm" align="flex-end" wrap="wrap">
                <Select
                  label="Afdeling"
                  placeholder="Vælg afdeling"
                  data={AFDELINGER}
                  value={afdeling}
                  onChange={setAfdeling}
                  leftSection={<IconBuildingStore size={16} />}
                  w={180}
                  clearable
                />
                <Select
                  label="Plan for modulperiode"
                  placeholder={mpLoading ? 'Henter...' : 'Vælg periode'}
                  data={modulperiodeOptions}
                  value={tilModulperiode}
                  onChange={setTilModulperiode}
                  w={220}
                  clearable
                  disabled={mpLoading}
                />
                <Button
                  leftSection={<IconArrowRight size={16} />}
                  color="orange"
                  disabled={!afdeling || !tilModulperiode || pendingCount === 0}
                  loading={overforMutation.isPending}
                  onClick={handleOverfor}
                  mt="auto"
                >
                  Overfør
                  {pendingCount > 0 && (
                    <Badge size="xs" color="white" c="orange" variant="filled" ml={6}>
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </Group>

              {tilModulperiode && (
                <Text size="xs" c="dimmed">
                  Tildeler fag til{' '}
                  <Text span fw={600} c="blue">
                    {tilModulperiode}
                  </Text>
                  . Tryk "Overfør" når du er klar til at sende til aktivitetsplanen.
                </Text>
              )}
            </Stack>

            <Divider mb="sm" />

            {/* Table */}
            {elevLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : elevError ? (
              <Alert icon={<IconAlertCircle size={16} />} color="red" title="Fejl">
                Kunne ikke hente elevdata. Er backend kørende?
              </Alert>
            ) : !afdeling ? (
              <Center py="xl">
                <Text c="dimmed" size="sm">
                  Vælg en afdeling for at se elever.
                </Text>
              </Center>
            ) : resolvedElever.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed" size="sm">
                  Ingen indskrevne elever fundet for {afdeling}.
                </Text>
              </Center>
            ) : (
              <ScrollArea>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  withColumnBorders
                  verticalSpacing={4}
                  fz="xs"
                  style={{ minWidth: 660, width: 'max-content', tableLayout: 'auto' }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ minWidth: 180, whiteSpace: 'nowrap'  }}>Elev</Table.Th>
                      <Table.Th w={42} ta="center">Sem.</Table.Th>
                      <Table.Th style={{ minWidth: 100 }}>Nuv. hold</Table.Th>
                      <Table.Th style={{ minWidth: 80, whiteSpace: 'nowrap' }}>1. prior.</Table.Th>
                      <Table.Th style={{ minWidth: 80, whiteSpace: 'nowrap' }}>2. prior.</Table.Th>
                      <Table.Th style={{ minWidth: 80, whiteSpace: 'nowrap' }}>3. prior.</Table.Th>
                      <Table.Th style={{ width: 150 }}>Næste modul</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {resolvedElever.map((elev) => {
                      const semester = calculateSemester(elev.startdato)
                      const isOverfort =
                        elev.overfort &&
                        elev.til_modulperiode === tilModulperiode &&
                        !(elev.id in localSelections)
                      return (
                        <Table.Tr
                          key={elev.id}
                          style={isOverfort ? { opacity: 0.65 } : undefined}
                        >
                          <Table.Td>
                            <Text size="xs" fw={500} lineClamp={1}>
                              {elev.navn}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="center">
                            <Badge
                              size="sm"
                              variant="filled"
                              color={
                                semester === 1
                                  ? 'blue'
                                  : semester === 2
                                    ? 'teal'
                                    : semester === 3
                                      ? 'violet'
                                      : 'orange'
                              }
                            >
                              {semester}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c={elev.nuv_hold ? undefined : 'dimmed'}>
                              {elev.nuv_hold ?? '—'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <PrioritetBadge value={elev.prioritet_1} priority={1} />
                          </Table.Td>
                          <Table.Td>
                            <PrioritetBadge value={elev.prioritet_2} priority={2} />
                          </Table.Td>
                          <Table.Td>
                            <PrioritetBadge value={elev.prioritet_3} priority={3} />
                          </Table.Td>
                          <Table.Td style={{ whiteSpace: 'nowrap', minWidth: 120 }}>
                            <Select
                              data={FAG_OPTIONS}
                              value={elev.tildelt_fag}
                              onChange={(val) => handleFagChange(elev, val)}
                              placeholder="Vælg fag"
                              size="xs"
                              clearable
                              searchable
                              disabled={!tilModulperiode}
                              styles={{
                                input: {
                                  fontWeight: elev.tildelt_fag ? 600 : undefined,
                                  borderColor:
                                    isOverfort ? 'var(--mantine-color-green-5)' : undefined,
                                },
                              }}
                            />
                          </Table.Td>
                        </Table.Tr>
                      )
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Paper>
        </Grid.Col>

        {/* ── RIGHT COLUMN: Aktivitetsplan (40%) ───────────────────────── */}
        <Grid.Col span={{ base: 100, md: 32, lg: 32 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Aktivitetsplan</Title>
              {tilModulperiode && (
                <Badge variant="light" color="blue">
                  {tilModulperiode}
                </Badge>
              )}
            </Group>

            {!tilModulperiode ? (
              <Center py="xl">
                <Text c="dimmed" size="sm">
                  Vælg en modulperiode for at se aktivitetsplanen.
                </Text>
              </Center>
            ) : aktivLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : !aktivitetsplan ? (
              <Center py="xl">
                <Text c="dimmed" size="sm">
                  Ingen data endnu.
                </Text>
              </Center>
            ) : (
              <AktivitetsplanTable aktivitetsplan={aktivitetsplan} />
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

// ── Aktivitetsplan Table ──────────────────────────────────────────────────────

interface AktivitetsPlanProps {
  aktivitetsplan: {
    afdelinger: string[]
    fag_liste: Array<{
      fag: string
      sum: number
      [key: string]: number | string
    }>
    afd_totals: {
      fag: string
      sum: number
      [key: string]: number | string
    }
    afd_elev_totals: {
      fag: string
      sum: number
      [key: string]: number | string
    }
  }
}

// Compact afdeling column headers
const AFDELING_SHORT: Record<string, string> = {
  Østjylland: 'Østjy.',
  Trekanten: 'Trek.',
  Sønderjylland: 'Sndjyl',
  Storkøbenhavn: 'Kbh.',
}

const AFDELING_COLORS: Record<string, string> = {
  Trekanten:     'blue',
  Østjylland:    'teal',
  Sønderjylland: 'orange',
  Storkøbenhavn: 'violet',
}

function AktivitetsplanTable({ aktivitetsplan }: AktivitetsPlanProps) {
  const { afdelinger, fag_liste, afd_totals, afd_elev_totals } = aktivitetsplan

  // Filter to only show rows with at least one non-zero value (unless always show)
  const visibleRows = fag_liste

  return (
    <ScrollArea>
      <Table
        withTableBorder
        withColumnBorders
        verticalSpacing={4}
        fz="xs"
        style={{ minWidth: 320, tableLayout: 'auto' }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ whiteSpace: 'nowrap', width: 1 }}>Fag</Table.Th>
            {afdelinger.map((afd) => (
              <Table.Th key={afd} ta="center" w={60} c={AFDELING_COLORS[afd] ?? 'blue'}>
                <Tooltip label={afd} withArrow>
                  <span>{AFDELING_SHORT[afd] ?? afd}</span>
                </Tooltip>
              </Table.Th>
            ))}
            <Table.Th ta="center" w={50} fw={700}>
              Sum
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {visibleRows.map((row) => {
            const hasAny = afdelinger.some((afd) => (row[afd] as number) > 0)
            return (
              <Table.Tr
                key={row.fag}
                style={!hasAny ? { opacity: 0.5 } : undefined}
              >
                <Table.Td fw={hasAny ? 500 : undefined} style={{ whiteSpace: 'nowrap' }}>
                  {row.fag}
                </Table.Td>
                {afdelinger.map((afd) => {
                  const val = row[afd] as number
                  const color = AFDELING_COLORS[afd] ?? 'blue'
                  return (
                    <Table.Td key={afd} ta="center">
                      {val > 0 ? (
                        <Text size="sm" fw={600} c={color}>
                          {val}
                        </Text>
                      ) : (
                        <Text size="sm" c="dimmed">
                          0
                        </Text>
                      )}
                    </Table.Td>
                  )
                })}
                <Table.Td ta="center">
                  {row.sum > 0 ? (
                    <Text size="sm" fw={700}>
                      {row.sum}
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed">
                      0
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr style={{ background: 'var(--mantine-color-default-hover)' }}>
            <Table.Td fw={700}>Afd. total</Table.Td>
            {afdelinger.map((afd) => {
              const val = afd_totals[afd] as number
              const max = afd_elev_totals[afd] as number
              const color = AFDELING_COLORS[afd] ?? 'blue'
              return (
                <Table.Td key={afd} ta="center" fw={700} c={color}>
                  {val || 0}/{max || 0}
                </Table.Td>
              )
            })}
            <Table.Td ta="center" fw={700} c="blue">
              {(afd_totals.sum || 0)}/{(afd_elev_totals.sum || 0)}
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </ScrollArea>
  )
}

export default Oversigter
