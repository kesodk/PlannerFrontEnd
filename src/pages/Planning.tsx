import { useState, useEffect, useRef } from 'react'
import {
  Group, Stack, Text, Box, Button, Badge,
  ActionIcon, Tabs, ScrollArea, Divider, Paper,
  Tooltip, Center, ThemeIcon, UnstyledButton,
} from '@mantine/core'
import {
  IconSearch, IconChevronLeft, IconChevronRight, IconDeviceFloppy,
  IconPlus, IconCopy, IconUsers, IconArrowRight,
  IconArrowLeft, IconTrash, IconBook, IconAlertCircle,
  IconBold, IconItalic, IconUnderline, IconStrikethrough, IconList, IconListNumbers, IconClearFormatting, IconLink,
} from '@tabler/icons-react'
import { useClass } from '../services/classApi'
import {
  useUgeplaner, useKladder, useCreateUgeplan, useUpdateUgeplan, useDeleteUgeplan, useSyncStudents, useActiveAftalerForStudents,
} from '../services/planningApi'
import type { Ugeplan, UgeplanDag, PlanningStudent } from '../services/planningApi'
import { FollowedClassStudentSidebar } from '../components/FollowedClassStudentSidebar'

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

/** Returns the Monday (UTC) of the given ISO week */
function getWeekMonday(week: number, year: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dow = jan4.getUTCDay() || 7
  const week1Mon = new Date(Date.UTC(year, 0, 4 - dow + 1))
  return new Date(week1Mon.getTime() + (week - 1) * 7 * 86400000)
}

/** Returns true if the week (Mon–Fri) overlaps with [startdato, slutdato] */
function isWeekWithinPeriod(week: number, year: number, startdato: string, slutdato: string): boolean {
  const monday = getWeekMonday(week, year)
  const friday = new Date(monday.getTime() + 4 * 86400000)
  const start = new Date(startdato)
  const end = new Date(slutdato)
  return monday <= end && friday >= start
}

const DAGE = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'] as const
const DAGE_LABELS: Record<string, string> = {
  mandag: 'Mandag', tirsdag: 'Tirsdag', onsdag: 'Onsdag', torsdag: 'Torsdag', fredag: 'Fredag',
}
const EMPTY_DAGE: UgeplanDag[] = DAGE.map(d => ({
  dag: d, formaal: '', laeringsmaal: '', indhold: '', materialer: '',
}))

// ─── PlanningToolbar ──────────────────────────────────────────────────────────

function PlanningToolbar() {
  const execCommand = (command: string) => {
    document.execCommand(command, false, undefined)
  }

  const handleLink = () => {
    const url = window.prompt('Indsæt URL:')
    if (url) {
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
      document.execCommand('createLink', false, normalizedUrl)
    }
  }

  return (
    <Paper p="sm" withBorder style={{ flexShrink: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderRadius: 0, backgroundColor: 'var(--mantine-color-body)' }}>
      <Group gap="sm">
        <Text size="sm" fw={500} mr="xs">Formatering:</Text>
        <Tooltip label="Fed">
          <ActionIcon variant="default" size="lg" onClick={() => execCommand('bold')}>
            <IconBold size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Kursiv">
          <ActionIcon variant="default" size="lg" onClick={() => execCommand('italic')}>
            <IconItalic size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Understreget">
          <ActionIcon variant="default" size="lg" onClick={() => execCommand('underline')}>
            <IconUnderline size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Gennemstreget">
          <ActionIcon variant="default" size="lg" onClick={() => execCommand('strikeThrough')}>
            <IconStrikethrough size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Punktliste">
          <ActionIcon variant="default" size="lg" onClick={() => execCommand('insertUnorderedList')}>
            <IconList size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Nummereret liste">
          <ActionIcon variant="default" size="lg" onClick={() => execCommand('insertOrderedList')}>
            <IconListNumbers size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Ryd formatering">
          <ActionIcon variant="default" size="lg" onClick={() => execCommand('removeFormat')}>
            <IconClearFormatting size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Indsæt link">
          <ActionIcon variant="default" size="lg" onClick={handleLink}>
            <IconLink size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  )
}

// ─── EditableField ────────────────────────────────────────────────────────────

function EditableField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (divRef.current && divRef.current.innerHTML !== value) {
      divRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (divRef.current) {
      onChange(divRef.current.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey) {
      const target = (e.target as HTMLElement).closest('a')
      if (target?.href) {
        e.preventDefault()
        window.open(target.href, '_blank', 'noopener,noreferrer')
      }
    }
  }

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      onClick={handleClick}
      style={{
        minHeight: '60px',
        width: '100%',
        padding: '6px 8px',
        outline: 'none',
        cursor: 'text',
        fontSize: '12px',
        lineHeight: '1.65',
        color: 'var(--mantine-color-text)',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}
    />
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
  const today = getISOWeekYear(new Date())

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedUgeplanId, setSelectedUgeplanId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<string>('indhold')
  const [week, setWeek] = useState(today.week)
  const [year, setYear] = useState(today.year)
  const [editedDage, setEditedDage] = useState<UgeplanDag[]>(EMPTY_DAGE)
  const [isDirty, setIsDirty] = useState(false)
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const openFindHoldRef = useRef<(() => void) | null>(null)

  const { data: classDetail, isLoading: classLoading } = useClass(selectedClassId ?? 0)
  const { data: ugeplaner = [] } = useUgeplaner(selectedClassId, week, year)
  const { data: kladder = [] } = useKladder(selectedClassId)

  const createUgeplan = useCreateUgeplan()
  const updateUgeplan = useUpdateUgeplan()
  const deleteUgeplan = useDeleteUgeplan()
  const syncStudents = useSyncStudents()

  const selectedClass = classDetail
    ? {
        id: classDetail.id,
        navn: classDetail.navn,
        fag: classDetail.fag,
        modulperiode: classDetail.modulperiode,
        startdato: classDetail.startdato,
        slutdato: classDetail.slutdato,
        studenter: ((classDetail.students ?? []) as PlanningStudent[]),
      }
    : null
  const allPlans = [...ugeplaner, ...kladder]
  const selectedUgeplan = allPlans.find(u => u.id === selectedUgeplanId) ?? null
  const activeUgeplaner = ugeplaner
  const {
    data: activeAftalerByStudent = [],
    isLoading: activeAftalerLoading,
    isError: activeAftalerError,
  } = useActiveAftalerForStudents(selectedClass?.studenter ?? [])

  const studenterInPlan = selectedUgeplan?.studenter ?? []
  // A student is "without plan" only if they aren't in ANY ugeplan this week
  const allAssignedIds = new Set(ugeplaner.flatMap(u => u.studenter.map(s => s.id)))
  const studenterUdenPlan = selectedClass?.studenter.filter(s => !allAssignedIds.has(s.id)) ?? []

  // Period boundary helpers
  const isCurrentWeekInPeriod = !selectedClass ||
    isWeekWithinPeriod(week, year, selectedClass.startdato, selectedClass.slutdato)
  const canNavPrev = !selectedClass ||
    isWeekWithinPeriod(offsetWeek(week, year, -1).week, offsetWeek(week, year, -1).year,
      selectedClass.startdato, selectedClass.slutdato)
  const canNavNext = !selectedClass ||
    isWeekWithinPeriod(offsetWeek(week, year, 1).week, offsetWeek(week, year, 1).year,
      selectedClass.startdato, selectedClass.slutdato)

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

  // Navigate to the correct week when a class is selected:
  // - Stay on current week if it's within the new class's module period
  // - Prefer today's week if it's in the period
  // - Otherwise jump to the module period's start week
  useEffect(() => {
    if (!selectedClass?.startdato || !selectedClass?.slutdato) return
    if (isWeekWithinPeriod(week, year, selectedClass.startdato, selectedClass.slutdato)) return
    const todayWeek = getISOWeekYear(new Date())
    if (isWeekWithinPeriod(todayWeek.week, todayWeek.year, selectedClass.startdato, selectedClass.slutdato)) {
      setWeek(todayWeek.week)
      setYear(todayWeek.year)
    } else {
      const startWeek = getISOWeekYear(new Date(selectedClass.startdato))
      setWeek(startWeek.week)
      setYear(startWeek.year)
    }
  }, [selectedClass?.id])

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleWeekNav = (offset: number) => {
    const next = offsetWeek(week, year, offset)
    if (selectedClass && !isWeekWithinPeriod(next.week, next.year, selectedClass.startdato, selectedClass.slutdato)) {
      return // Don't navigate outside the module period
    }
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

  const sidebarStudents = (selectedClass?.studenter ?? []).map((student) => ({
    id: student.id,
    name: student.navn,
  }))

  const colHeight = 'calc(100vh - 60px - var(--mantine-spacing-md) * 2)'

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box h={colHeight} style={{ display: 'flex', gap: 'var(--mantine-spacing-sm)', overflow: 'hidden' }}>

      {/* ══ LEFT COLUMN ══ */}
      <Box w={224} style={{ flexShrink: 0 }}>
        <FollowedClassStudentSidebar
          selectedClassId={selectedClassId}
          selectedStudentId={null}
          students={sidebarStudents}
          onClassChange={setSelectedClassId}
          onStudentChange={() => {}}
          classTitle="Hold jeg følger"
          studentTitle={`Elever på holdet${selectedClass ? ` (${selectedClass.studenter.length})` : ''}`}
          noClassSelectedText="Vælg et hold for at se elever"
          emptyStudentsText="Ingen elever på holdet"
          studentsLoading={classLoading}
          onFindHoldOpenReady={(openFn) => {
            openFindHoldRef.current = openFn
          }}
        />
      </Box>

      {/* ══ MIDDLE COLUMN ══ */}
      <Paper withBorder flex={1} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {!selectedClass ? (
          <Center flex={1} style={{ flexDirection: 'column', gap: 12 }}>
            <ThemeIcon size={48} variant="light" color="gray">
              <IconBook size={28} />
            </ThemeIcon>
            <Text c="dimmed">Vælg et hold for at se ugeplaner</Text>
            <Button
              variant="light"
              leftSection={<IconSearch size={14} />}
              onClick={() => openFindHoldRef.current?.()}
            >
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
                  {isCurrentWeekInPeriod ? (
                    <Button size="sm" variant="light" leftSection={<IconPlus size={14} />}
                      onClick={handleCreatePlan} loading={createUgeplan.isPending}
                    >
                      Opret ugeplan
                    </Button>
                  ) : (
                    <Text size="xs" c="dimmed" ta="center">
                      Uge {week} ligger uden for modulperiodens datoer
                      {selectedClass?.startdato && ` (${new Date(selectedClass.startdato).toLocaleDateString('da-DK')} – ${new Date(selectedClass.slutdato).toLocaleDateString('da-DK')})`}
                    </Text>
                  )}
                </Center>
              ) : (
                <>
                  <PlanningToolbar />
                  <ScrollArea flex={1}>
                  <Box p="sm" style={{ minWidth: 700 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '25%' }} />
                      </colgroup>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--mantine-color-default-border)' }}>
                          {[
                            { label: 'Dag', fixed: true },
                            { label: 'Formål' },
                            { label: 'Læringsmål' },
                            { label: 'Indhold og undervisningsform' },
                            { label: 'Undervisningsmaterialer' },
                          ].map(({ label, fixed }, idx) => (
                            <th key={label} style={{
                              padding: '8px 10px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                              color: 'var(--mantine-color-dimmed)',
                              borderRight: idx < 4 ? '1px solid var(--mantine-color-default-border)' : undefined,
                              overflow: 'hidden',
                              whiteSpace: fixed ? 'nowrap' : undefined,
                            }}>
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {editedDage.map((row, i) => (
                          <tr key={row.dag} style={{
                            verticalAlign: 'top',
                            backgroundColor: i % 2 === 0 ? 'transparent' : 'light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.03))',
                            borderBottom: '1px solid var(--mantine-color-default-border)',
                          }}>
                            <td style={{
                              padding: '8px 10px', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                              borderRight: '1px solid var(--mantine-color-default-border)',
                              color: 'var(--mantine-color-text)',
                            }}>
                              {DAGE_LABELS[row.dag]}
                            </td>
                            {(['formaal', 'laeringsmaal', 'indhold', 'materialer'] as const).map((field, idx) => (
                              <td key={field} style={{
                                padding: '2px 4px',
                                borderRight: idx < 3 ? '1px solid var(--mantine-color-default-border)' : undefined,
                                overflow: 'hidden',
                              }}>
                                <EditableField
                                  value={row[field]}
                                  onChange={(v) => handleUpdateDag(row.dag, field, v)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <Paper withBorder p="sm" mt="md" style={{ backgroundColor: 'light-dark(var(--mantine-color-blue-0), rgba(80, 120, 200, 0.08))' }}>
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Group gap="xs" align="flex-start">
                          <ThemeIcon size={26} radius="xl" variant="light" color="blue">
                            <IconUsers size={14} />
                          </ThemeIcon>
                          <Box>
                            <Text fw={700} size="sm">Aktive særaftaler på holdet</Text>
                            <Text size="xs" c="dimmed">
                              Overblik over elever med aktive aftaler, så der kan tages særligt hensyn i planlægningen.
                            </Text>
                          </Box>
                        </Group>
                        <Badge color="blue" variant="light">
                          {activeAftalerByStudent.length} elever
                        </Badge>
                      </Group>

                      {activeAftalerLoading ? (
                        <Center py="sm"><Text size="xs" c="dimmed">Henter aktive aftaler...</Text></Center>
                      ) : activeAftalerError ? (
                        <Group gap="xs" c="red">
                          <IconAlertCircle size={14} />
                          <Text size="xs">Kunne ikke hente aktive aftaler lige nu.</Text>
                        </Group>
                      ) : activeAftalerByStudent.length === 0 ? (
                        <Text size="sm" c="dimmed">Ingen elever på holdet har aktive særaftaler.</Text>
                      ) : (
                        <Stack gap="xs">
                          {activeAftalerByStudent.map((entry) => (
                            <Paper key={entry.studentId} withBorder p="xs">
                              <Text fw={600} size="sm" mb={4}>{entry.studentNavn}</Text>
                              <Stack gap={4}>
                                {entry.aftaler.map((aftale) => (
                                  <Text key={aftale.id ?? `${entry.studentId}-${aftale.dato}-${aftale.tekst}`} size="xs" c="dimmed">
                                    {aftale.initialer} · {new Date(aftale.dato).toLocaleDateString('da-DK')} · {aftale.tekst}
                                  </Text>
                                ))}
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Box>
                  </ScrollArea>
                </>
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
            <ActionIcon size="sm" variant="subtle" disabled={!canNavPrev} onClick={() => handleWeekNav(-1)}>
              <IconChevronLeft size={14} />
            </ActionIcon>
            <Stack gap={0} align="center">
              <Text fw={700} size="sm">Uge {week}</Text>
              <Text size="xs" c="dimmed">{year}</Text>
            </Stack>
            <ActionIcon size="sm" variant="subtle" disabled={!canNavNext} onClick={() => handleWeekNav(1)}>
              <IconChevronRight size={14} />
            </ActionIcon>
          </Group>

          {/* Save */}
          {isDirty ? (
            <Button
              fullWidth size="sm" mb="md"
              variant="light" color="orange"
              leftSection={<IconDeviceFloppy size={14} />}
              loading={updateUgeplan.isPending}
              onClick={handleSave}
            >
              Gem ændringer
            </Button>
          ) : (
            <Button
              fullWidth size="sm" mb="md"
              variant="default"
              leftSection={<IconDeviceFloppy size={14} />}
              disabled={!selectedUgeplan}
            >
              Gemt
            </Button>
          )}

          {/* Indhold actions */}
          {activeTab === 'indhold' && selectedClass && (
            <>
              <Button fullWidth size="xs" variant="outline" color="orange" mb="md"
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
          <Tooltip
            label={!isCurrentWeekInPeriod ? 'Ugen ligger uden for modulperiodens datoer' : undefined}
            disabled={isCurrentWeekInPeriod}
            withArrow
          >
            <Button fullWidth size="xs" variant="subtle" mb="xs"
              leftSection={<IconPlus size={12} />}
              disabled={!selectedClass || !isCurrentWeekInPeriod}
              onClick={handleCreatePlan} loading={createUgeplan.isPending}
            >
              Opret ugeplan
            </Button>
          </Tooltip>
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

      


    </Box>
  )
}

export default Planning
