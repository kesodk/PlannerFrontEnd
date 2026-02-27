import { useState, useEffect } from 'react'
import {
  Group, Stack, Text, Box, Button, Modal, TextInput, Badge,
  ActionIcon, Tabs, Textarea, ScrollArea, Divider, Paper,
  Tooltip, Loader, Center, ThemeIcon, UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconSearch, IconChevronLeft, IconChevronRight, IconDeviceFloppy,
  IconPlus, IconCopy, IconChalkboard, IconUsers, IconArrowRight,
  IconArrowLeft, IconTrash, IconBook,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useClasses } from '../services/classApi'
import {
  usePinnedClasses, usePinClass, useUnpinClass,
  useUgeplaner, useKladder, useCreateUgeplan, useUpdateUgeplan, useDeleteUgeplan, useSyncStudents,
} from '../services/planningApi'
import type { Ugeplan, UgeplanDag, PinnedClass, PlanningStudent } from '../services/planningApi'

// ─── ISO Week Utilities ───────────────────────────────────────────────────────

function getISOWeekYear(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { week, year: d.getUTCFullYear() }
}

function offsetWeek(week: number, year: number, offset: number): { week: number; year: number } {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dow = jan4.getUTCDay() || 7
  const week1Mon = new Date(Date.UTC(year, 0, 4 - dow + 1))
  const targetMon = new Date(week1Mon.getTime() + (week - 1 + offset) * 7 * 86400000)
  return getISOWeekYear(targetMon)
}

const DAGE = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'] as const
const DAGE_LABELS: Record<string, string> = {
  mandag: 'Mandag', tirsdag: 'Tirsdag', onsdag: 'Onsdag', torsdag: 'Torsdag', fredag: 'Fredag',
}
const EMPTY_DAGE: UgeplanDag[] = DAGE.map(d => ({
  dag: d, formaal: '', laeringsmaal: '', indhold: '', materialer: '',
}))

// ─── ClassCard ────────────────────────────────────────────────────────────────

function ClassCard({
  klass, selected, onSelect, onUnpin,
}: {
  klass: PinnedClass
  selected: boolean
  onSelect: () => void
  onUnpin: () => void
}) {
  const fagUpper = klass.fag.toUpperCase()
  const fagColor = fagUpper.startsWith('V') ? 'teal'
    : fagUpper.startsWith('UP') ? 'violet'
    : fagUpper.startsWith('LAB') ? 'cyan'
    : 'blue'

  return (
    <UnstyledButton w="100%" onClick={onSelect}>
      <Box
        p="xs"
        style={(theme) => ({
          borderRadius: theme.radius.sm,
          border: `1px solid ${selected ? theme.colors.blue[6] : theme.colors.gray[3]}`,
          backgroundColor: selected ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-body)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        })}
      >
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Badge color={fagColor} size="md" radius="xs" style={{ flexShrink: 0 }}>
              {klass.fag.substring(0, 4)}
            </Badge>
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Text fw={600} size="sm" truncate>{klass.laerer}</Text>
              <Text size="xs" c="dimmed">{klass.modulperiode} · {klass.studenter.length} elever</Text>
            </Stack>
          </Group>
          <Tooltip label="Fjern hold" withArrow>
            <ActionIcon
              size="xs" variant="subtle" color="red"
              onClick={(e) => { e.stopPropagation(); onUnpin() }}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>
    </UnstyledButton>
  )
}

// ─── StudentRow ───────────────────────────────────────────────────────────────

function StudentRow({ student, onClick, active }: {
  student: PlanningStudent
  onClick: () => void
  active?: boolean
}) {
  return (
    <UnstyledButton w="100%" onClick={onClick}>
      <Box
        px="xs" py={4}
        style={(theme) => ({
          borderRadius: theme.radius.xs,
          backgroundColor: active ? 'var(--mantine-color-blue-light)' : 'transparent',
          transition: 'background 0.1s',
        })}
      >
        <Text size="sm">{student.navn}</Text>
      </Box>
    </UnstyledButton>
  )
}

// ─── UgeplanCard ──────────────────────────────────────────────────────────────

function UgeplanCard({
  ugeplan, selected, onSelect, onDelete,
}: {
  ugeplan: Ugeplan
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const studentNames = ugeplan.studenter.map(s => s.navn).join(', ')
  return (
    <UnstyledButton onClick={onSelect} w="100%">
      <Box
        p="xs"
        style={(theme) => ({
          borderRadius: theme.radius.sm,
          border: `1px solid ${selected ? theme.colors.blue[6] : theme.colors.gray[3]}`,
          backgroundColor: selected ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-body)',
        })}
      >
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" fw={600} truncate>{ugeplan.navn}</Text>
            <Text size="xs" c="dimmed" truncate title={studentNames}>
              {studentNames || 'Ingen elever'}
            </Text>
          </Box>
          <Tooltip label="Slet" withArrow>
            <ActionIcon
              size="xs" variant="subtle" color="red"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
            >
              <IconTrash size={10} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>
    </UnstyledButton>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Planning() {
  const { user } = useAuth()
  const today = getISOWeekYear(new Date())

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedUgeplanId, setSelectedUgeplanId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<string>('indhold')
  const [week, setWeek] = useState(today.week)
  const [year, setYear] = useState(today.year)
  const [editedDage, setEditedDage] = useState<UgeplanDag[]>(EMPTY_DAGE)
  const [isDirty, setIsDirty] = useState(false)
  const [classSearch, setClassSearch] = useState('')
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const [findHoldOpened, { open: openFindHold, close: closeFindHold }] = useDisclosure(false)

  const { data: pinnedClasses = [], isLoading: loadingPinned } = usePinnedClasses(user?.id)
  const { data: allClasses = [], isLoading: loadingAll } = useClasses()
  const { data: ugeplaner = [] } = useUgeplaner(selectedClassId, week, year)
  const { data: kladder = [] } = useKladder(selectedClassId)

  const pinMutation = usePinClass()
  const unpinMutation = useUnpinClass()
  const createUgeplan = useCreateUgeplan()
  const updateUgeplan = useUpdateUgeplan()
  const deleteUgeplan = useDeleteUgeplan()
  const syncStudents = useSyncStudents()

  const selectedClass = pinnedClasses.find(c => c.id === selectedClassId) ?? null
  const allPlans = [...ugeplaner, ...kladder]
  const selectedUgeplan = allPlans.find(u => u.id === selectedUgeplanId) ?? null
  const activeUgeplaner = ugeplaner

  const studenterInPlan = selectedUgeplan?.studenter ?? []
  // A student is "without plan" only if they aren't in ANY ugeplan this week
  const allAssignedIds = new Set(ugeplaner.flatMap(u => u.studenter.map(s => s.id)))
  const studenterUdenPlan = selectedClass?.studenter.filter(s => !allAssignedIds.has(s.id)) ?? []

  // Reset edits when ugeplan selection changes
  useEffect(() => {
    if (selectedUgeplan) {
      setEditedDage(selectedUgeplan.dage.map(d => ({ ...d })))
    } else {
      setEditedDage(EMPTY_DAGE)
    }
    setIsDirty(false)
  }, [selectedUgeplanId])

  // Auto-select first ugeplan when list loads
  useEffect(() => {
    if (ugeplaner.length > 0 && !selectedUgeplanId) {
      setSelectedUgeplanId(ugeplaner[0].id)
    } else if (ugeplaner.length === 0) {
      setSelectedUgeplanId(null)
    }
  }, [ugeplaner.length, selectedClassId, week, year])

  // If selected ugeplan was deleted, pick next
  useEffect(() => {
    if (selectedUgeplanId && !ugeplaner.find(u => u.id === selectedUgeplanId)) {
      setSelectedUgeplanId(ugeplaner[0]?.id ?? null)
    }
  }, [ugeplaner])

  // Reset when class changes
  useEffect(() => {
    setSelectedUgeplanId(null)
    setSelectedLeft(null)
    setSelectedRight(null)
  }, [selectedClassId])

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleWeekNav = (offset: number) => {
    const next = offsetWeek(week, year, offset)
    setWeek(next.week)
    setYear(next.year)
    setSelectedUgeplanId(null)
  }

  const handleSave = () => {
    if (!selectedUgeplan) return
    updateUgeplan.mutate(
      { id: selectedUgeplan.id, dage: editedDage },
      { onSuccess: () => setIsDirty(false) }
    )
  }

  const handleUpdateDag = (dag: string, field: keyof Omit<UgeplanDag, 'dag'>, value: string) => {
    setEditedDage(prev => prev.map(d => d.dag === dag ? { ...d, [field]: value } : d))
    setIsDirty(true)
  }

  const handleCreatePlan = () => {
    if (!selectedClassId) return
    const autoNavn = `${week} ${year} ${ugeplaner.length + 1}`
    createUgeplan.mutate(
      { class_id: selectedClassId, uge: week, aar: year, navn: autoNavn, er_kladde: false },
      { onSuccess: (u) => setSelectedUgeplanId(u.id) }
    )
  }

  const handleDuplicateToKladde = () => {
    if (!selectedUgeplan || !selectedClassId) return
    // Gem dage-indhold nu (editedDage afspejler det brugeren ser i tabellen)
    const dageCopy = editedDage.map(d => ({ ...d }))
    const kildeNavn = selectedUgeplan.navn
    createUgeplan.mutate(
      { class_id: selectedClassId, uge: week, aar: year, navn: `Kladde af ${kildeNavn}`, er_kladde: true },
      {
        onSuccess: (newPlan) => {
          // Kopiér kun indhold (dage) — ikke elever
          updateUgeplan.mutate(
            { id: newPlan.id, dage: dageCopy },
            {
              onSuccess: () => {
                // Sæt indhold direkte i state så tabellen viser det med det samme
                setEditedDage(dageCopy)
                setIsDirty(false)
                setSelectedUgeplanId(newPlan.id)
              }
            }
          )
        },
      }
    )
  }

  const handleMoveToRight = () => {
    if (!selectedLeft || !selectedUgeplan || !selectedClassId) return
    const newIds = [...studenterInPlan.map(s => s.id), selectedLeft]
    syncStudents.mutate(
      { id: selectedUgeplan.id, studentIds: newIds, classId: selectedClassId },
      { onSuccess: () => setSelectedLeft(null) }
    )
  }

  const handleMoveToLeft = () => {
    if (!selectedRight || !selectedUgeplan || !selectedClassId) return
    const newIds = studenterInPlan.map(s => s.id).filter(id => id !== selectedRight)
    syncStudents.mutate(
      { id: selectedUgeplan.id, studentIds: newIds, classId: selectedClassId },
      { onSuccess: () => setSelectedRight(null) }
    )
  }

  const handlePinClass = (classId: number) => {
    if (!user) return
    pinMutation.mutate(
      { teacherId: user.id, classId },
      { onSuccess: () => { setSelectedClassId(classId); closeFindHold() } }
    )
  }

  const handleUnpinClass = (classId: number) => {
    if (!user) return
    unpinMutation.mutate({ teacherId: user.id, classId })
    if (selectedClassId === classId) setSelectedClassId(null)
  }

  const pinnedIds = new Set(pinnedClasses.map(c => c.id))
  const filteredClasses = allClasses.filter(c =>
    !pinnedIds.has(c.id) && (
      c.navn?.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.fag?.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.lærer?.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.modulperiode?.toLowerCase().includes(classSearch.toLowerCase())
    )
  )

  const colHeight = 'calc(100vh - 60px - var(--mantine-spacing-md) * 2)'

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box h={colHeight} style={{ display: 'flex', gap: 'var(--mantine-spacing-sm)', overflow: 'hidden' }}>

      {/* ══ LEFT COLUMN ══ */}
      <Paper withBorder w={240} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top half: Hold jeg følger ─────── */}
        <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box p="sm" pb={4} style={{ flexShrink: 0 }}>
            <Group justify="space-between" mb="xs">
              <Text fw={700} size="sm" tt="uppercase" c="dimmed">Hold jeg følger</Text>
              <Tooltip label="Find og tilføj hold" withArrow>
                <ActionIcon size="sm" variant="light" onClick={openFindHold}>
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Box>
          <ScrollArea style={{ flex: 1, minHeight: 0 }} px="sm" pb="sm">
            {loadingPinned ? (
              <Center py="xl"><Loader size="sm" /></Center>
            ) : pinnedClasses.length === 0 ? (
              <Stack align="center" gap="xs" py="xl">
                <ThemeIcon size="lg" variant="light" color="gray">
                  <IconChalkboard size={20} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" ta="center">Ingen hold tilføjet</Text>
                <Button size="xs" variant="light" leftSection={<IconSearch size={12} />} onClick={openFindHold}>
                  Find hold
                </Button>
              </Stack>
            ) : (
              <Stack gap="xs">
                {pinnedClasses.map(klass => (
                  <ClassCard
                    key={klass.id}
                    klass={klass}
                    selected={selectedClassId === klass.id}
                    onSelect={() => setSelectedClassId(klass.id)}
                    onUnpin={() => handleUnpinClass(klass.id)}
                  />
                ))}
                <Button size="xs" variant="subtle" leftSection={<IconSearch size={12} />} onClick={openFindHold}>
                  Find flere hold
                </Button>
              </Stack>
            )}
          </ScrollArea>
        </Box>

        <Divider />

        {/* ── Bottom half: Elever på holdet ─── */}
        <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box p="sm" pb={4} style={{ flexShrink: 0 }}>
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="blue">
                <IconUsers size={12} />
              </ThemeIcon>
              <Text fw={700} size="xs" tt="uppercase" c="dimmed">
                Elever på holdet{selectedClass ? ` (${selectedClass.studenter.length})` : ''}
              </Text>
            </Group>
          </Box>
          <ScrollArea style={{ flex: 1, minHeight: 0 }} px="sm" pb="sm">
            {!selectedClass ? (
              <Text size="xs" c="dimmed">Vælg et hold for at se elever</Text>
            ) : selectedClass.studenter.length === 0 ? (
              <Text size="xs" c="dimmed">Ingen elever på holdet</Text>
            ) : (
              <Stack gap={2}>
                {selectedClass.studenter.map(s => (
                  <Text key={s.id} size="sm">{s.navn}</Text>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Box>

      </Paper>

      {/* ══ MIDDLE COLUMN ══ */}
      <Paper withBorder flex={1} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {!selectedClass ? (
          <Center flex={1} style={{ flexDirection: 'column', gap: 12 }}>
            <ThemeIcon size={48} variant="light" color="gray">
              <IconBook size={28} />
            </ThemeIcon>
            <Text c="dimmed">Vælg et hold for at se ugeplaner</Text>
            <Button variant="light" leftSection={<IconSearch size={14} />} onClick={openFindHold}>
              Find hold
            </Button>
          </Center>
        ) : (
          <Tabs
            value={activeTab}
            onChange={(v) => setActiveTab(v ?? 'indhold')}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Tabs.List px="md" pt="xs">
              <Tabs.Tab value="indhold" leftSection={<IconBook size={14} />}>Indhold</Tabs.Tab>
              <Tabs.Tab value="differentiering" leftSection={<IconUsers size={14} />}>Differentiering</Tabs.Tab>
              <Box ml="auto" style={{ display: 'flex', alignItems: 'center' }} pr="sm">
                <Text size="xs" c="dimmed">{selectedClass.fag} · {selectedClass.navn}</Text>
              </Box>
            </Tabs.List>

            {/* Indhold */}
            <Tabs.Panel value="indhold" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {!selectedUgeplan ? (
                <Center style={{ flex: 1, flexDirection: 'column', gap: 12 }}>
                  <Text c="dimmed" size="sm">Ingen ugeplan for uge {week} · {year}</Text>
                  <Button size="sm" variant="light" leftSection={<IconPlus size={14} />}
                    onClick={handleCreatePlan} loading={createUgeplan.isPending}
                  >
                    Opret ugeplan
                  </Button>
                </Center>
              ) : (
                <ScrollArea flex={1}>
                  <Box p="sm" style={{ minWidth: 600 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Dag', 'Formål', 'Læringsmål', 'Indhold og undervisningsform', 'Undervisningsmaterialer'].map(h => (
                            <th key={h} style={{
                              padding: '8px 10px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                              color: 'var(--mantine-color-dimmed)',
                              borderBottom: '2px solid var(--mantine-color-gray-3)',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {editedDage.map((row, i) => (
                          <tr key={row.dag} style={{ verticalAlign: 'top', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--mantine-color-gray-0)' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                              {DAGE_LABELS[row.dag]}
                            </td>
                            {(['formaal', 'laeringsmaal', 'indhold', 'materialer'] as const).map(field => (
                              <td key={field} style={{ padding: '4px 6px' }}>
                                <Textarea
                                  value={row[field]}
                                  onChange={(e) => handleUpdateDag(row.dag, field, e.currentTarget.value)}
                                  autosize minRows={2} size="xs" variant="filled"
                                  styles={{ input: { fontSize: 12 } }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </ScrollArea>
              )}
            </Tabs.Panel>

            {/* Differentiering */}
            <Tabs.Panel value="differentiering" style={{ flex: 1, overflow: 'hidden' }}>
              {!selectedUgeplan ? (
                <Center style={{ flex: 1, height: '100%', flexDirection: 'column', gap: 12 }}>
                  <Text c="dimmed" size="sm">Vælg eller opret en ugeplan i kolonnen til højre</Text>
                </Center>
              ) : (
                <Box style={{ height: '100%', display: 'flex', gap: 16, padding: 16, overflow: 'hidden' }}>
                  <Paper withBorder style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box px="sm" pt="sm" pb="xs">
                      <Text fw={600} size="sm">Elever uden ugeplan</Text>
                      <Text size="xs" c="dimmed">{studenterUdenPlan.length} elever</Text>
                    </Box>
                    <Divider />
                    <ScrollArea flex={1} p="xs">
                      {studenterUdenPlan.length === 0 ? (
                        <Text size="xs" c="dimmed" p="xs">Alle elever på holdet er tilknyttet en ugeplan</Text>
                      ) : (
                        <Stack gap={2}>
                          {studenterUdenPlan.map(s => (
                            <StudentRow
                              key={s.id} student={s} active={selectedLeft === s.id}
                              onClick={() => setSelectedLeft(selectedLeft === s.id ? null : s.id)}
                            />
                          ))}
                        </Stack>
                      )}
                    </ScrollArea>
                  </Paper>

                  <Stack justify="center" gap="xs">
                    <Tooltip label="Tilføj til ugeplan" withArrow>
                      <ActionIcon size="lg" variant="filled" color="blue"
                        disabled={!selectedLeft || syncStudents.isPending}
                        loading={syncStudents.isPending && !!selectedLeft}
                        onClick={handleMoveToRight}
                      >
                        <IconArrowRight size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Fjern fra ugeplan" withArrow>
                      <ActionIcon size="lg" variant="filled" color="gray"
                        disabled={!selectedRight || syncStudents.isPending}
                        onClick={handleMoveToLeft}
                      >
                        <IconArrowLeft size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Stack>

                  <Paper withBorder style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box px="sm" pt="sm" pb="xs">
                      <Group gap="xs">
                        <Text fw={600} size="sm">Elever i den valgte ugeplan</Text>
                        <Badge size="xs" color={selectedUgeplan.er_kladde ? 'orange' : 'blue'}>
                          {selectedUgeplan.navn}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">{studenterInPlan.length} elever</Text>
                    </Box>
                    <Divider />
                    <ScrollArea flex={1} p="xs">
                      {studenterInPlan.length === 0 ? (
                        <Text size="xs" c="dimmed" p="xs">Ingen elever tilknyttet endnu</Text>
                      ) : (
                        <Stack gap={2}>
                          {studenterInPlan.map(s => (
                            <StudentRow
                              key={s.id} student={s} active={selectedRight === s.id}
                              onClick={() => setSelectedRight(selectedRight === s.id ? null : s.id)}
                            />
                          ))}
                        </Stack>
                      )}
                    </ScrollArea>
                  </Paper>
                </Box>
              )}
            </Tabs.Panel>
          </Tabs>
        )}
      </Paper>

      {/* ══ RIGHT COLUMN ══ */}
      <Paper withBorder w={200} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ScrollArea flex={1} p="sm">
          {/* Week nav */}
          <Group justify="space-between" mb="xs" wrap="nowrap">
            <ActionIcon size="sm" variant="subtle" onClick={() => handleWeekNav(-1)}>
              <IconChevronLeft size={14} />
            </ActionIcon>
            <Stack gap={0} align="center">
              <Text fw={700} size="sm">Uge {week}</Text>
              <Text size="xs" c="dimmed">{year}</Text>
            </Stack>
            <ActionIcon size="sm" variant="subtle" onClick={() => handleWeekNav(1)}>
              <IconChevronRight size={14} />
            </ActionIcon>
          </Group>

          {/* Save */}
          <Button
            fullWidth size="sm" mb="md"
            color={isDirty ? 'orange' : 'blue'}
            leftSection={<IconDeviceFloppy size={14} />}
            disabled={!selectedUgeplan || !isDirty}
            loading={updateUgeplan.isPending}
            onClick={handleSave}
          >
            {isDirty ? 'Gem ændringer' : 'Gemt'}
          </Button>

          {/* Indhold actions */}
          {activeTab === 'indhold' && selectedClass && (
            <>
              <Button fullWidth size="xs" variant="light" color="orange" mb="md"
                leftSection={<IconCopy size={12} />}
                disabled={!selectedUgeplan}
                onClick={handleDuplicateToKladde}
              >
                Dupliker til kladde
              </Button>
              <Divider mb="sm" />
            </>
          )}

          {/* Ugeplaner */}
          <Text fw={700} size="xs" tt="uppercase" c="dimmed" mb="xs">Ugens ugeplaner</Text>
          <Button fullWidth size="xs" variant="subtle" mb="xs"
            leftSection={<IconPlus size={12} />} disabled={!selectedClass}
            onClick={handleCreatePlan} loading={createUgeplan.isPending}
          >
            Opret ugeplan
          </Button>
          {!selectedClass ? (
            <Text size="xs" c="dimmed" mb="md">Vælg et hold</Text>
          ) : activeUgeplaner.length === 0 ? (
            <Text size="xs" c="dimmed" mb="xs">Ingen ugeplaner for uge {week}</Text>
          ) : (
            <Stack gap="xs" mb="xs">
              {activeUgeplaner.map(u => (
                <UgeplanCard
                  key={u.id} ugeplan={u} selected={selectedUgeplanId === u.id}
                  onSelect={() => setSelectedUgeplanId(u.id)}
                  onDelete={() => {
                    if (!selectedClassId) return
                    deleteUgeplan.mutate({ id: u.id, classId: selectedClassId })
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Kladder */}
          <Divider mb="sm" />
          <Text fw={700} size="xs" tt="uppercase" c="dimmed" mb="xs">Kladder på holdet</Text>
          {kladder.length === 0 ? (
            <Text size="xs" c="dimmed">Ingen kladder</Text>
          ) : (
            <Stack gap="xs">
              {kladder.map(u => (
                <UgeplanCard
                  key={u.id} ugeplan={u} selected={selectedUgeplanId === u.id}
                  onSelect={() => setSelectedUgeplanId(u.id)}
                  onDelete={() => {
                    if (!selectedClassId) return
                    deleteUgeplan.mutate({ id: u.id, classId: selectedClassId })
                  }}
                />
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Paper>

      {/* ══ FIND HOLD MODAL ══ */}
      <Modal opened={findHoldOpened} onClose={closeFindHold} title="Find hold" size="md">
        <TextInput
          placeholder="Søg på navn, fag, lærer eller modulperiode..."
          leftSection={<IconSearch size={14} />}
          value={classSearch}
          onChange={(e) => setClassSearch(e.currentTarget.value)}
          mb="md" autoFocus
        />
        <ScrollArea h={380}>
          {loadingAll ? (
            <Center py="xl"><Loader size="sm" /></Center>
          ) : filteredClasses.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl" size="sm">
              {classSearch ? 'Ingen hold matcher søgningen' : 'Alle hold er allerede tilføjet'}
            </Text>
          ) : (
            <Stack gap="xs">
              {filteredClasses.map(c => (
                <Group key={c.id} justify="space-between" p="xs"
                  style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 6 }}
                >
                  <Stack gap={0}>
                    <Text size="sm" fw={600}>{c.fag} · {c.navn}</Text>
                    <Text size="xs" c="dimmed">{c.lærer} · {c.modulperiode} · {c.status}</Text>
                  </Stack>
                  <Button size="xs" variant="light" leftSection={<IconPlus size={12} />}
                    loading={pinMutation.isPending} onClick={() => handlePinClass(c.id)}
                  >
                    Tilføj
                  </Button>
                </Group>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Modal>


    </Box>
  )
}

export default Planning
