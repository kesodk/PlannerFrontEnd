import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useClasses } from '../services/classApi'
import { usePinnedClasses, usePinClass, useUnpinClass } from '../services/planningApi'
import {
  ClassStudentSidebar,
  type SidebarStudentItem,
} from './ClassStudentSidebar'
import { FindHoldModal } from './FindHoldModal'
import { useDisclosure } from '@mantine/hooks'

type FollowedClassStudentSidebarProps = {
  selectedClassId: number | null
  selectedStudentId: number | null
  students: SidebarStudentItem[]
  onClassChange: (classId: number | null) => void
  onStudentChange: (studentId: number | null) => void
  classTitle?: string
  studentTitle?: string
  noClassSelectedText?: string
  emptyStudentsText?: string
  studentHeaderRight?: ReactNode
  studentFooter?: ReactNode
  studentsLoading?: boolean
  onFindHoldOpenReady?: (openFn: () => void) => void
}

function getBadgeColor(fag: string): string {
  const fagUpper = fag.toUpperCase()
  if (fagUpper.startsWith('V')) return 'teal'
  if (fagUpper.startsWith('UP')) return 'violet'
  if (fagUpper.startsWith('LAB')) return 'cyan'
  return 'blue'
}

function getTeacherInitials(teacherName: string): string {
  const parts = teacherName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return '-'
  if (parts.length === 1) return parts[0].slice(0, 4).toUpperCase()

  return parts
    .slice(0, 4)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function FollowedClassStudentSidebar({
  selectedClassId,
  selectedStudentId,
  students,
  onClassChange,
  onStudentChange,
  classTitle = 'Hold jeg følger',
  studentTitle = 'Elever på holdet',
  noClassSelectedText = 'Vælg et hold',
  emptyStudentsText = 'Ingen elever',
  studentHeaderRight,
  studentFooter,
  studentsLoading = false,
  onFindHoldOpenReady,
}: FollowedClassStudentSidebarProps) {
  const { user } = useAuth()
  const [findHoldOpened, { open: openFindHold, close: closeFindHold }] =
    useDisclosure(false)

  const [classSearch, setClassSearch] = useState('')

  const { data: allClasses = [], isLoading: loadingAll } = useClasses()
  const { data: pinnedClasses = [], isLoading: loadingPinned } =
    usePinnedClasses(user?.id)
  const pinMutation = usePinClass()
  const unpinMutation = useUnpinClass()

  useEffect(() => {
    if (onFindHoldOpenReady) {
      onFindHoldOpenReady(openFindHold)
    }
  }, [onFindHoldOpenReady, openFindHold])

  const sidebarClasses = useMemo(
    () =>
      pinnedClasses.map((klass) => ({
        id: klass.id,
        title: getTeacherInitials(klass.laerer),
        subtitle: klass.modulperiode,
        description: `${klass.studenter.length} elever`,
        badgeText: klass.fag.substring(0, 4),
        badgeColor: getBadgeColor(klass.fag),
      })),
    [pinnedClasses],
  )

  const pinnedIds = useMemo(
    () => new Set(pinnedClasses.map((klass) => klass.id)),
    [pinnedClasses],
  )

  const filteredClasses = useMemo(
    () =>
      allClasses.filter(
        (klass) =>
          !pinnedIds.has(klass.id) &&
          (klass.navn?.toLowerCase().includes(classSearch.toLowerCase()) ||
            klass.fag?.toLowerCase().includes(classSearch.toLowerCase()) ||
            klass.lærer?.toLowerCase().includes(classSearch.toLowerCase()) ||
            klass.modulperiode
              ?.toLowerCase()
              .includes(classSearch.toLowerCase())),
      ),
    [allClasses, pinnedIds, classSearch],
  )

  const handlePinClass = (classId: number) => {
    if (!user) return

    pinMutation.mutate(
      { teacherId: user.id, classId },
      {
        onSuccess: () => {
          onClassChange(classId)
          onStudentChange(null)
          closeFindHold()
        },
      },
    )
  }

  const handleUnpinClass = (classId: number) => {
    if (!user) return

    unpinMutation.mutate({ teacherId: user.id, classId })

    if (selectedClassId === classId) {
      onClassChange(null)
      onStudentChange(null)
    }
  }

  const handleClassSelect = (classId: number) => {
    if (selectedClassId === classId) {
      onClassChange(null)
      onStudentChange(null)
      return
    }

    onClassChange(classId)
    onStudentChange(null)
  }

  return (
    <>
      <ClassStudentSidebar
        classes={sidebarClasses}
        students={students}
        selectedClassId={selectedClassId}
        selectedStudentId={selectedStudentId}
        onClassSelect={handleClassSelect}
        onStudentSelect={(studentId) => onStudentChange(studentId)}
        classesLoading={loadingPinned}
        studentsLoading={studentsLoading}
        classTitle={classTitle}
        studentTitle={studentTitle}
        emptyClassesText='Ingen hold tilføjet'
        noClassSelectedText={noClassSelectedText}
        emptyStudentsText={emptyStudentsText}
        classHeaderAction={{
          label: 'Find og tilføj hold',
          icon: <IconPlus size={14} />,
          onClick: openFindHold,
        }}
        onClassRemove={handleUnpinClass}
        studentHeaderRight={studentHeaderRight}
        studentFooter={studentFooter}
      />

      <FindHoldModal
        opened={findHoldOpened}
        onClose={closeFindHold}
        classSearch={classSearch}
        onClassSearchChange={setClassSearch}
        classes={filteredClasses}
        isLoading={loadingAll}
        isPinning={pinMutation.isPending}
        onPinClass={handlePinClass}
      />
    </>
  )
}

export default FollowedClassStudentSidebar