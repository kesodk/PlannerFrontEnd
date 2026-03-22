import { useMemo, type ReactNode } from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core'
import { IconPin, IconUser } from '@tabler/icons-react'

const CLASS_BADGE_WIDTH = 46

export type SidebarClassItem = {
  id: number
  title: string
  subtitle?: string
  description?: string
  badgeText?: string
  badgeColor?: string
}

export type SidebarStudentItem = {
  id: number
  name: string
  subtitle?: string
}

type ClassStudentSidebarProps = {
  classes: SidebarClassItem[]
  students: SidebarStudentItem[]
  selectedClassId: number | null
  selectedStudentId: number | null
  onClassSelect: (classId: number) => void
  onStudentSelect: (studentId: number) => void
  classesLoading?: boolean
  studentsLoading?: boolean
  classTitle?: string
  studentTitle?: string
  emptyClassesText?: string
  noClassSelectedText?: string
  emptyStudentsText?: string
  classHeaderAction?: {
    label: string
    icon: ReactNode
    onClick: () => void
  }
  onClassRemove?: (classId: number) => void
  classRemoveLabel?: string
  classHeaderRight?: ReactNode
  studentHeaderRight?: ReactNode
  studentFooter?: ReactNode
}

export function ClassStudentSidebar({
  classes,
  students,
  selectedClassId,
  selectedStudentId,
  onClassSelect,
  onStudentSelect,
  classesLoading = false,
  studentsLoading = false,
  classTitle = 'Hold',
  studentTitle = 'Elever',
  emptyClassesText = 'Ingen hold',
  noClassSelectedText = 'Vaelg et hold',
  emptyStudentsText = 'Ingen elever',
  classHeaderAction,
  onClassRemove,
  classRemoveLabel = 'Stop med at følge hold',
  classHeaderRight,
  studentHeaderRight,
  studentFooter,
}: ClassStudentSidebarProps) {
  const sortedStudents = useMemo(
    () =>
      [...students].sort((a, b) =>
        a.name.localeCompare(b.name, 'da', { sensitivity: 'base' }),
      ),
    [students],
  )

  return (
    <Stack gap="md" h="100%">
      <Card
        withBorder
        padding="sm"
        radius="md"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Stack gap="xs" style={{ flex: 1, minHeight: 0 }}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text fw={600} size="xs" tt="uppercase" c="dimmed">
              {classTitle}
            </Text>

            {classHeaderAction ? (
              <Tooltip label={classHeaderAction.label} withArrow>
                <ActionIcon
                  size="sm"
                  variant="light"
                  onClick={classHeaderAction.onClick}
                >
                  {classHeaderAction.icon}
                </ActionIcon>
              </Tooltip>
            ) : (
              classHeaderRight
            )}
          </Group>

          {classesLoading ? (
            <Center py="sm">
              <Loader size="sm" />
            </Center>
          ) : (
            <ScrollArea
              style={{ flex: 1, minHeight: 0 }}
              offsetScrollbars="present"
              scrollbarSize={8}
            >
              <Stack gap={6} pr={4}>
                {classes.map((klass) => {
                  const isSelected = selectedClassId === klass.id

                  return (
                    <Paper
                      key={klass.id}
                      withBorder
                      radius="sm"
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected
                          ? 'var(--mantine-color-blue-5)'
                          : undefined,
                        backgroundColor: isSelected
                          ? 'var(--mantine-color-blue-light)'
                          : undefined,
                      }}
                      onClick={() => onClassSelect(klass.id)}
                    >
                      <Group gap={8} wrap="nowrap" align="flex-start">
                        <Box
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            columnGap: 10,
                          }}
                        >
                          <Stack gap={4} style={{ minWidth: 0 }}>
                            {klass.badgeText ? (
                              <Badge
                                color={klass.badgeColor ?? 'blue'}
                                size="sm"
                                radius="xs"
                                style={{
                                  flexShrink: 0,
                                  width: CLASS_BADGE_WIDTH,
                                  display: 'inline-flex',
                                  justifyContent: 'center',
                                }}
                              >
                                {klass.badgeText}
                              </Badge>
                            ) : (
                              <Box h={22} />
                            )}
                            <Badge
                              variant="outline"
                              color="gray"
                              size="sm"
                              radius="xs"
                              style={{
                                width: CLASS_BADGE_WIDTH,
                                display: 'inline-flex',
                                justifyContent: 'center',
                                backgroundColor: 'transparent',
                                borderColor: isSelected
                                  ? 'light-dark(var(--mantine-color-gray-5), rgba(255, 255, 255, 0.18))'
                                  : 'light-dark(var(--mantine-color-gray-4), rgba(255, 255, 255, 0.12))',
                                color: 'var(--mantine-color-dimmed)',
                                fontWeight: 600,
                              }}
                            >
                              {klass.title}
                            </Badge>
                          </Stack>

                          <Stack gap={4} style={{ minWidth: 0 }}>
                            {klass.subtitle ? (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {klass.subtitle}
                              </Text>
                            ) : (
                              <Box h={18} />
                            )}
                            {klass.description ? (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {klass.description}
                              </Text>
                            ) : (
                              <Box h={18} />
                            )}
                          </Stack>
                        </Box>
                        {onClassRemove && (
                          <Tooltip label={classRemoveLabel} withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              onClick={(event) => {
                                event.stopPropagation()
                                onClassRemove(klass.id)
                              }}
                            >
                              <IconPin size={15} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Paper>
                  )
                })}

                {classes.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    {emptyClassesText}
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          )}
        </Stack>
      </Card>

      <Card
        withBorder
        padding="sm"
        radius="md"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Stack gap="xs" style={{ flex: 1, minHeight: 0 }}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text fw={600} size="xs" tt="uppercase" c="dimmed">
              {studentTitle}
            </Text>
            {studentHeaderRight}
          </Group>

          {!selectedClassId && (
            <Text size="sm" c="dimmed" ta="center" py="md">
              {noClassSelectedText}
            </Text>
          )}

          {selectedClassId && studentsLoading ? (
            <Center py="sm">
              <Loader size="sm" />
            </Center>
          ) : (
            <>
              {selectedClassId && students.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  {emptyStudentsText}
                </Text>
              )}

              {selectedClassId && (
                <ScrollArea
                  style={{ flex: 1, minHeight: 0 }}
                  offsetScrollbars="present"
                  scrollbarSize={8}
                >
                  <Stack gap={6} pr={4}>
                    {sortedStudents.map((student) => {
                      const isSelected = selectedStudentId === student.id

                      return (
                        <Paper
                          key={student.id}
                          withBorder
                          radius="sm"
                          p="xs"
                          style={{
                            cursor: 'pointer',
                            borderColor: isSelected
                              ? 'var(--mantine-color-blue-5)'
                              : undefined,
                            backgroundColor: isSelected
                              ? 'var(--mantine-color-blue-light)'
                              : undefined,
                          }}
                          onClick={() => onStudentSelect(student.id)}
                        >
                          <Group gap="xs" wrap="nowrap">
                            <ThemeIcon
                              size="sm"
                              variant="light"
                              color={isSelected ? 'blue' : 'gray'}
                              radius="xl"
                            >
                              <IconUser size={12} />
                            </ThemeIcon>
                            <Stack gap={0} style={{ minWidth: 0 }}>
                              <Text
                                size="sm"
                                fw={isSelected ? 700 : 500}
                                lineClamp={2}
                              >
                                {student.name}
                              </Text>
                              {student.subtitle && (
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {student.subtitle}
                                </Text>
                              )}
                            </Stack>
                          </Group>
                        </Paper>
                      )
                    })}
                  </Stack>
                </ScrollArea>
              )}
            </>
          )}

          {studentFooter}
        </Stack>
      </Card>
    </Stack>
  )
}

export default ClassStudentSidebar