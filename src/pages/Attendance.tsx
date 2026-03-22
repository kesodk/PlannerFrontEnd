import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Grid,
  Stack,
  Text,
  Group,
  ActionIcon,
  Badge,
  Card,
  Loader,
  Center,
  Divider,
  Switch,
  Textarea,
  TextInput,
  NumberInput,
  Button,
  Tooltip,
  RingProgress,
  SegmentedControl,
  ThemeIcon,
  Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconCheck,
  IconX,
  IconTrash,
  IconMoonStars,
} from "@tabler/icons-react";
import { useClass } from "../services/classApi";
import { useModulperioder } from "../services/modulperiodeApi";
import {
  useStudentAttendanceStats,
  useUpsertAttendance,
  useDeleteAttendance,
  type AttendanceRecord,
  type UpsertAttendancePayload,
} from "../services/attendanceApi";
import {
  isFreeFriday,
  isWeekend,
  toISODateString,
  beregnFremmoedeProcent,
  getISOWeek,
} from "../utils/dateUtils";
import { useTheme } from "../contexts/ThemeContext";
import {
  FollowedClassStudentSidebar,
} from "../components/FollowedClassStudentSidebar";

// ─── helpers ──────────────────────────────────────────────────────────────────

const DANSKE_MND = [
  "Januar",
  "Februar",
  "Marts",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "December",
];

type CalendarColorTokens = {
  selectedBg: string;
  holidayBg: string;
  freeFridayBg: string;
  weekendBg: string;
  futureBg: string;
  selectedBorder: string;
  defaultBorder: string;
  noteDot: string;
  dayTextToday: string;
  dayTextFreeFriday: string;
  dayTextHoliday: string;
  barHigh: string;
  barMedium: string;
  barLow: string;
};

type DarkCalendarPreset = "calm" | "highContrast" | "neon";

const CALENDAR_LIGHT_COLORS: CalendarColorTokens = {
  selectedBg: "var(--mantine-color-blue-light)",
  holidayBg: "var(--mantine-color-orange-light)",
  freeFridayBg: "var(--mantine-color-violet-light)",
  weekendBg: "var(--mantine-color-gray-3)",
  futureBg: "var(--mantine-color-gray-0)",
  selectedBorder: "var(--mantine-color-blue-5)",
  defaultBorder: "var(--mantine-color-gray-2)",
  noteDot: "var(--mantine-color-orange-5)",
  dayTextToday: "var(--mantine-color-blue-7)",
  dayTextFreeFriday: "var(--mantine-color-violet-7)",
  dayTextHoliday: "var(--mantine-color-orange-8)",
  barHigh: "#2f9e44",
  barMedium: "#f59f00",
  barLow: "#e03131",
};

const CALENDAR_DARK_PRESETS: Record<DarkCalendarPreset, CalendarColorTokens> = {
  calm: {
    selectedBg: "rgba(34, 139, 230, 0.22)",
    holidayBg: "rgba(245, 159, 0, 0.2)",
    freeFridayBg: "rgba(151, 117, 250, 0.2)",
    weekendBg: "rgba(134, 142, 150, 0.25)",
    futureBg: "rgba(33, 37, 41, 0.55)",
    selectedBorder: "rgba(116, 192, 252, 0.95)",
    defaultBorder: "rgba(73, 80, 87, 0.85)",
    noteDot: "#ff922b",
    dayTextToday: "#74c0fc",
    dayTextFreeFriday: "#d0bfff",
    dayTextHoliday: "#ffc078",
    barHigh: "#69db7c",
    barMedium: "#ffd43b",
    barLow: "#ff8787",
  },
  highContrast: {
    selectedBg: "rgba(25, 113, 194, 0.45)",
    holidayBg: "rgba(247, 103, 7, 0.34)",
    freeFridayBg: "rgba(112, 72, 232, 0.38)",
    weekendBg: "rgba(73, 80, 87, 0.55)",
    futureBg: "rgba(26, 27, 30, 0.88)",
    selectedBorder: "#a5d8ff",
    defaultBorder: "rgba(173, 181, 189, 0.75)",
    noteDot: "#ffa94d",
    dayTextToday: "#a5d8ff",
    dayTextFreeFriday: "#e5dbff",
    dayTextHoliday: "#ffd8a8",
    barHigh: "#8ce99a",
    barMedium: "#ffe066",
    barLow: "#ffa8a8",
  },
  neon: {
    selectedBg: "rgba(0, 224, 255, 0.2)",
    holidayBg: "rgba(255, 179, 0, 0.2)",
    freeFridayBg: "rgba(174, 62, 201, 0.26)",
    weekendBg: "rgba(73, 80, 87, 0.38)",
    futureBg: "rgba(18, 21, 26, 0.78)",
    selectedBorder: "#66d9ff",
    defaultBorder: "rgba(116, 120, 141, 0.9)",
    noteDot: "#ffec99",
    dayTextToday: "#99e9f2",
    dayTextFreeFriday: "#eebefa",
    dayTextHoliday: "#ffe066",
    barHigh: "#38d9a9",
    barMedium: "#ffd43b",
    barLow: "#ff6b6b",
  },
};

function lightDarkPair(light: string, dark: string): string {
  return `light-dark(${light}, ${dark})`;
}

/** Returns true if `date` falls inside any of the ferie/helligdag intervals */
function isHoliday(
  date: Date,
  fridage: Array<{ startdato: string; slutdato: string; titel: string }>,
): string | null {
  const ds = toISODateString(date);
  for (const f of fridage) {
    if (ds >= f.startdato && ds <= f.slutdato) return f.titel;
  }
  return null;
}

function procColor(p: number | null): string {
  if (p === null) return "gray";
  if (p >= 90) return "green";
  if (p >= 75) return "yellow";
  return "red";
}

function ProcBadge({
  p,
  size = "sm",
}: {
  p: number | null;
  size?: "sm" | "md";
}) {
  if (p === null)
    return (
      <Badge color="gray" variant="light" size={size}>
        –
      </Badge>
    );
  return (
    <Badge color={procColor(p)} variant="light" size={size}>
      {p.toFixed(1)} %
    </Badge>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Student as returned inside ClassResource.students */
type ClassStudent = { id: number; navn: string };

type FormState = {
  modetid_h: number;
  modetid_m: number;
  ga_tid_h: number;
  ga_tid_m: number;
  fravaerende_hele_dagen: boolean;
  melding_modtaget: boolean;
  melding_tidspunkt_h: number;
  melding_tidspunkt_m: number;
  bevilget_fravaer: boolean;
  note: string;
  override_procent: number | null;
  use_override: boolean;
};

function parseHM(t: string): [number, number] {
  const [h, m] = (t ?? "00:00").split(":").map(Number);
  return [h ?? 0, m ?? 0];
}

function fmtHM(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildFormFromRecord(rec: AttendanceRecord | null): FormState {
  const [mh, mm] = parseHM(rec?.modetid ?? "08:45");
  const [gh, gm] = parseHM(rec?.ga_tid ?? "15:00");
  const [th, tm] = parseHM(rec?.melding_tidspunkt ?? "07:00");
  return {
    modetid_h: mh,
    modetid_m: mm,
    ga_tid_h: gh,
    ga_tid_m: gm,
    fravaerende_hele_dagen: rec?.fravaerende_hele_dagen ?? false,
    melding_modtaget: rec?.melding_modtaget ?? false,
    melding_tidspunkt_h: th,
    melding_tidspunkt_m: tm,
    bevilget_fravaer: rec?.bevilget_fravaer ?? false,
    note: rec?.note ?? "",
    override_procent: rec?.override_procent ?? null,
    use_override:
      rec?.override_procent !== null && rec?.override_procent !== undefined,
  };
}

// ─── TimeField (always 24-hour, locale-independent) ───────────────────────────

function TimeField({
  label,
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  disabled,
}: {
  label: string;
  hours: number;
  minutes: number;
  onHoursChange: (v: number) => void;
  onMinutesChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hDisplay, setHDisplay] = useState(String(hours).padStart(2, "0"));
  const [mDisplay, setMDisplay] = useState(String(minutes).padStart(2, "0"));

  // Sync display when parent state changes (e.g. switching student/date)
  useEffect(() => {
    setHDisplay(String(hours).padStart(2, "0"));
    setMDisplay(String(minutes).padStart(2, "0"));
  }, [hours, minutes]);

  const commitH = (raw: string) => {
    const n = Math.min(23, Math.max(0, parseInt(raw, 10) || 0));
    onHoursChange(n);
    setHDisplay(String(n).padStart(2, "0"));
  };
  const commitM = (raw: string) => {
    const n = Math.min(59, Math.max(0, parseInt(raw, 10) || 0));
    onMinutesChange(n);
    setMDisplay(String(n).padStart(2, "0"));
  };

  return (
    <Stack gap={4}>
      <Text size="xs" fw={500} c="dimmed">
        {label}
      </Text>
      <Group gap={4} align="center" wrap="nowrap">
        <TextInput
          value={hDisplay}
          onChange={(e) => setHDisplay(e.currentTarget.value)}
          onBlur={(e) => commitH(e.currentTarget.value)}
          w={58}
          disabled={disabled}
          styles={{ input: { textAlign: "center" } }}
        />
        <Text fw={700} size="lg" lh={1} style={{ userSelect: "none" }}>
          :
        </Text>
        <TextInput
          value={mDisplay}
          onChange={(e) => setMDisplay(e.currentTarget.value)}
          onBlur={(e) => commitM(e.currentTarget.value)}
          w={58}
          disabled={disabled}
          styles={{ input: { textAlign: "center" } }}
        />
      </Group>
    </Stack>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Attendance() {
  const { colorScheme } = useTheme();
  const today = new Date();
  const todayStr = toISODateString(today);
  const [darkPreset, setDarkPreset] = useState<DarkCalendarPreset>(() => {
    const stored = localStorage.getItem("attendance-dark-calendar-preset");
    if (stored === "highContrast" || stored === "neon" || stored === "calm")
      return stored;
    return "calm";
  });

  useEffect(() => {
    localStorage.setItem("attendance-dark-calendar-preset", darkPreset);
  }, [darkPreset]);

  const calendarColors = useMemo<CalendarColorTokens>(() => {
    const dark = CALENDAR_DARK_PRESETS[darkPreset];
    return {
      selectedBg: lightDarkPair(
        CALENDAR_LIGHT_COLORS.selectedBg,
        dark.selectedBg,
      ),
      holidayBg: lightDarkPair(CALENDAR_LIGHT_COLORS.holidayBg, dark.holidayBg),
      freeFridayBg: lightDarkPair(
        CALENDAR_LIGHT_COLORS.freeFridayBg,
        dark.freeFridayBg,
      ),
      weekendBg: lightDarkPair(CALENDAR_LIGHT_COLORS.weekendBg, dark.weekendBg),
      futureBg: lightDarkPair(CALENDAR_LIGHT_COLORS.futureBg, dark.futureBg),
      selectedBorder: lightDarkPair(
        CALENDAR_LIGHT_COLORS.selectedBorder,
        dark.selectedBorder,
      ),
      defaultBorder: lightDarkPair(
        CALENDAR_LIGHT_COLORS.defaultBorder,
        dark.defaultBorder,
      ),
      noteDot: lightDarkPair(CALENDAR_LIGHT_COLORS.noteDot, dark.noteDot),
      dayTextToday: lightDarkPair(
        CALENDAR_LIGHT_COLORS.dayTextToday,
        dark.dayTextToday,
      ),
      dayTextFreeFriday: lightDarkPair(
        CALENDAR_LIGHT_COLORS.dayTextFreeFriday,
        dark.dayTextFreeFriday,
      ),
      dayTextHoliday: lightDarkPair(
        CALENDAR_LIGHT_COLORS.dayTextHoliday,
        dark.dayTextHoliday,
      ),
      barHigh: lightDarkPair(CALENDAR_LIGHT_COLORS.barHigh, dark.barHigh),
      barMedium: lightDarkPair(CALENDAR_LIGHT_COLORS.barMedium, dark.barMedium),
      barLow: lightDarkPair(CALENDAR_LIGHT_COLORS.barLow, dark.barLow),
    };
  }, [darkPreset]);

  // ── Selection state ──
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");

  // ── Calendar navigation ──
  const [viewDate, setViewDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // ── Detail form ──
  const [form, setForm] = useState<FormState>(buildFormFromRecord(null));
  const [isSaveConfirmed, setIsSaveConfirmed] = useState(false);
  const saveConfirmTimeoutRef = useRef<number | null>(null);

  // ── Data ──
  const { data: classDetail, isLoading: classLoading } = useClass(
    selectedClassId ?? 0,
  );
  const { data: allModulperioder = [] } = useModulperioder();

  /** All fridage from ALL modulperioder — calendar shows holidays globally, not limited to the selected class's period */
  const aktivFridage = useMemo(() => {
    return allModulperioder.flatMap((mp) => mp.fridage ?? []);
  }, [allModulperioder]);

  const { data: studentStats, isFetching: statsFetching } =
    useStudentAttendanceStats(selectedStudentId ?? 0, selectedClassId ?? 0);

  const upsertMutation = useUpsertAttendance();
  const deleteMutation = useDeleteAttendance();

  useEffect(() => {
    return () => {
      if (saveConfirmTimeoutRef.current !== null) {
        window.clearTimeout(saveConfirmTimeoutRef.current);
      }
    };
  }, []);

  // ── Derived ──
  const selectedDateStr = toISODateString(selectedDate);

  /** Map of dato → AttendanceRecord for the selected student */
  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    studentStats?.records.forEach((r) => map.set(r.dato, r));
    return map;
  }, [studentStats]);

  const currentRecord = recordMap.get(selectedDateStr) ?? null;

  const selectedDayIsFreeFriday = isFreeFriday(selectedDate);
  const selectedDayIsWeekend = isWeekend(selectedDate);
  const selectedDayIsFuture = selectedDateStr > todayStr;
  const selectedDayIsHoliday = isHoliday(selectedDate, aktivFridage) !== null;
  const canRegister =
    !selectedDayIsFreeFriday &&
    !selectedDayIsWeekend &&
    !selectedDayIsFuture &&
    !selectedDayIsHoliday &&
    !!selectedStudentId;

  const liveProc = beregnFremmoedeProcent(
    fmtHM(form.modetid_h, form.modetid_m),
    fmtHM(form.ga_tid_h, form.ga_tid_m),
    form.fravaerende_hele_dagen,
    form.use_override ? (form.override_procent ?? undefined) : undefined,
  );

  const classStudents = (classDetail?.students as ClassStudent[]) ?? [];
  const sidebarStudents = classStudents.map((student) => ({
    id: student.id,
    name: student.navn,
  }));

  // ── Sync form when student or date changes ──
  // (intentionally NOT including recordMap so the form isn't reset after every save)
  useEffect(() => {
    const rec = recordMap.get(selectedDateStr) ?? null;
    setForm(buildFormFromRecord(rec));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, selectedDateStr]);

  // ── Handlers ──
  const selectStudent = (id: number, naam: string) => {
    setSelectedStudentId(id);
    setSelectedStudentName(naam);
    // form synced by useEffect above
  };

  const handleDateSelect = (day: Date) => {
    if (
      isWeekend(day) ||
      isFreeFriday(day) ||
      toISODateString(day) > todayStr ||
      isHoliday(day, aktivFridage) !== null
    )
      return;
    setSelectedDate(day);
    // student stays selected; form synced by useEffect above
  };

  const updateForm = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!selectedStudentId || !selectedClassId || !canRegister) return;

    const wholeDayAbsent = form.fravaerende_hele_dagen;

    const payload: UpsertAttendancePayload = {
      student_id: selectedStudentId,
      class_id: selectedClassId,
      dato: selectedDateStr,
      modetid: wholeDayAbsent ? "08:45" : fmtHM(form.modetid_h, form.modetid_m),
      ga_tid: wholeDayAbsent ? "15:00" : fmtHM(form.ga_tid_h, form.ga_tid_m),
      fravaerende_hele_dagen: wholeDayAbsent,
      melding_modtaget: form.melding_modtaget,
      melding_tidspunkt: form.melding_modtaget
        ? fmtHM(form.melding_tidspunkt_h, form.melding_tidspunkt_m)
        : null,
      bevilget_fravaer: form.bevilget_fravaer,
      note: form.note || null,
      override_procent: form.use_override ? form.override_procent : null,
    };

    try {
      await upsertMutation.mutateAsync(payload);
      setIsSaveConfirmed(true);
      if (saveConfirmTimeoutRef.current !== null) {
        window.clearTimeout(saveConfirmTimeoutRef.current);
      }
      saveConfirmTimeoutRef.current = window.setTimeout(() => {
        setIsSaveConfirmed(false);
      }, 1600);
    } catch (err: unknown) {
      notifications.show({
        title: "Fejl",
        message:
          err instanceof Error ? err.message : "Kunne ikke gemme fremmøde",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleDelete = async () => {
    if (!currentRecord || !selectedStudentId || !selectedClassId) return;
    try {
      await deleteMutation.mutateAsync({
        id: currentRecord.id,
        class_id: selectedClassId,
        student_id: selectedStudentId,
        dato: selectedDateStr,
      });
      setForm(buildFormFromRecord(null));
      notifications.show({
        title: "Nulstillet",
        message: `Registrering for ${selectedStudentName} er slettet`,
        color: "orange",
      });
    } catch (err: unknown) {
      notifications.show({
        title: "Fejl",
        message: err instanceof Error ? err.message : "Kunne ikke slette",
        color: "red",
      });
    }
  };

  const resetAttendanceSelection = () => {
    setSelectedStudentId(null);
    setSelectedStudentName("");
    setForm(buildFormFromRecord(null));
  };

  // ── Calendar grid (ISO: Monday first) ──
  const calendarDays = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const startPad = firstDay.getDay(); // Sun=0, Mon=1, ..., Sat=6
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(y, m, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewDate]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Grid gutter="md" style={{ height: "100%" }}>
      {/* ═══ LEFT: Hold + Elevliste (narrow) ═══ */}
      <Grid.Col span={{ base: 12, md: 2 }}>
        <Box h="calc(100vh - 120px)">
        <FollowedClassStudentSidebar
          selectedClassId={selectedClassId}
          selectedStudentId={selectedStudentId}
          students={sidebarStudents}
          onClassChange={(classId) => {
            setSelectedClassId(classId);
            resetAttendanceSelection();
          }}
          onStudentChange={(studentId) => {
            if (!studentId) {
              resetAttendanceSelection();
              return;
            }

            const selected = classStudents.find((s) => s.id === studentId);
            if (!selected) return;
            selectStudent(selected.id, selected.navn);
          }}
          classTitle="Hold jeg følger"
          studentTitle="Elever på holdet"
          studentsLoading={classLoading}
          noClassSelectedText="Vælg et hold for at se elever"
          emptyStudentsText="Ingen elever"
          studentHeaderRight={(classLoading || statsFetching) && <Loader size="xs" />}
        />
        </Box>
      </Grid.Col>

      {/* ═══ MIDDLE: Kalender (wider) ═══ */}
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card withBorder radius="md" padding="xs">
          {colorScheme === "dark" && (
            <Group justify="flex-end" mb="xs" px="xs" gap="xs">
              <ThemeIcon size="sm" variant="light" color="gray" radius="xl">
                <IconMoonStars size={14} />
              </ThemeIcon>
              <SegmentedControl
                size="xs"
                value={darkPreset}
                onChange={(value) => setDarkPreset(value as DarkCalendarPreset)}
                data={[
                  { label: "Rolig", value: "calm" },
                  { label: "Hoj Kontrast", value: "highContrast" },
                  { label: "Neon", value: "neon" },
                ]}
              />
            </Group>
          )}

          {/* Month navigation */}
          <Group justify="space-between" mb="xs" px="xs">
            <ActionIcon
              variant="subtle"
              onClick={() =>
                setViewDate(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
                )
              }
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <Text fw={700} size="lg">
              {DANSKE_MND[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Text>
            <ActionIcon
              variant="subtle"
              onClick={() =>
                setViewDate(
                  (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
                )
              }
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>

          {/* Weekday headers (Søn→Lør) */}
          <Grid columns={7} gutter={2} mb={4}>
            {["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"].map((d) => (
              <Grid.Col key={d} span={1}>
                <Text ta="center" size="sm" fw={600} c="dimmed">
                  {d}
                </Text>
              </Grid.Col>
            ))}
          </Grid>

          {/* Calendar grid */}
          <Grid columns={7} gutter={4}>
            {calendarDays.map((day, i) => {
              if (!day) return <Grid.Col key={`pad-${i}`} span={1} />;

              const dateStr = toISODateString(day);
              const isFridag = isFreeFriday(day);
              const isWkend = isWeekend(day);
              const isFuture = dateStr > todayStr;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;
              const holidayName = isHoliday(day, aktivFridage);
              const isHolidayDay = holidayName !== null;

              // Student-specific record for this day
              const rec = recordMap.get(dateStr);
              const proc = rec?.beregnet_procent ?? null;
              const hasRecord = rec !== undefined;

              const hasNote = !!rec?.note;

              let bgColor: string | undefined;
              if (isSelected) bgColor = calendarColors.selectedBg;
              else if (isHolidayDay) bgColor = calendarColors.holidayBg;
              else if (isFridag) bgColor = calendarColors.freeFridayBg;
              else if (isWkend) bgColor = calendarColors.weekendBg;
              else if (isFuture) bgColor = calendarColors.futureBg;

              const barColor =
                proc !== null
                  ? proc >= 90
                    ? calendarColors.barHigh
                    : proc >= 75
                      ? calendarColors.barMedium
                      : calendarColors.barLow
                  : undefined;

              const isNonSelectable =
                isWkend || isFridag || isFuture || isHolidayDay;

              return (
                <Grid.Col key={dateStr} span={1}>
                  <div style={{ position: "relative" }}>
                    <Stack
                      gap={3}
                      align="stretch"
                      p={6}
                      style={{
                        minHeight: 90,
                        borderRadius: 6,
                        backgroundColor: bgColor,
                        border: isSelected
                          ? `2px solid ${calendarColors.selectedBorder}`
                          : `1px solid ${calendarColors.defaultBorder}`,
                        borderBottom: isSelected
                          ? `2px solid ${calendarColors.selectedBorder}`
                          : `1px solid ${calendarColors.defaultBorder}`,
                        cursor: isNonSelectable ? "default" : "pointer",
                        opacity:
                          isFuture && !isWkend && !isHolidayDay ? 0.6 : 1,
                      }}
                      onClick={() => handleDateSelect(day)}
                    >
                      {hasNote && (
                        <div
                          style={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: calendarColors.noteDot,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      <Text
                        size="sm"
                        fw={isToday ? 700 : 400}
                        c={isWkend ? "dimmed" : "inherit"}
                        style={{
                          color: isToday
                            ? calendarColors.dayTextToday
                            : isFridag
                              ? calendarColors.dayTextFreeFriday
                              : isHolidayDay
                                ? calendarColors.dayTextHoliday
                                : undefined,
                        }}
                        ta="left"
                      >
                        {day.getDate()}
                      </Text>

                      {isHolidayDay && (
                        <Text
                          size="xs"
                          c="orange"
                          ta="center"
                          lh={1.2}
                          lineClamp={2}
                        >
                          {holidayName}
                        </Text>
                      )}

                      {isFridag && !isHolidayDay && (
                        <Text size="xs" c="violet" ta="center" lh={1.2}>
                          Undervisningsfri
                        </Text>
                      )}

                      {hasRecord &&
                        proc !== null &&
                        !isFridag &&
                        !isWkend &&
                        !isFuture &&
                        !isHolidayDay && (
                          <>
                            <Text size="xs" ta="center" c="dimmed" lh={1}>
                              {proc.toFixed(0)} %
                            </Text>
                            <div
                              style={{
                                height: 3,
                                borderRadius: 2,
                                backgroundColor: barColor,
                                marginTop: 2,
                              }}
                            />
                            <Text
                              size="xs"
                              ta="center"
                              c="dimmed"
                              lh={1.3}
                              mt={1}
                            >
                              {rec!.fravaerende_hele_dagen
                                ? "Fraværende"
                                : `${fmtHM(...parseHM(rec!.modetid))}–${fmtHM(...parseHM(rec!.ga_tid))}`}
                            </Text>
                            {rec!.bevilget_fravaer && (
                              <Text
                                size="10px"
                                ta="center"
                                c="blue"
                                fw={600}
                                lh={1.2}
                              >
                                Bevilget fravær
                              </Text>
                            )}
                          </>
                        )}

                      {!hasRecord &&
                        !isFridag &&
                        !isWkend &&
                        !isFuture &&
                        !isHolidayDay &&
                        selectedStudentId && (
                          <Text size="xs" c="dimmed" ta="center" lh={1}>
                            –
                          </Text>
                        )}
                    </Stack>
                  </div>
                </Grid.Col>
              );
            })}
          </Grid>

          {/* Legend */}
          <Group gap="md" mt="sm" px="xs" wrap="wrap">
            {[
              { color: calendarColors.barHigh, label: "≥ 90 %" },
              { color: calendarColors.barMedium, label: "75–90 %" },
              { color: calendarColors.barLow, label: "< 75 %" },
            ].map(({ color, label }) => (
              <Group key={label} gap={4}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: color,
                  }}
                />
                <Text size="xs" c="dimmed">
                  {label}
                </Text>
              </Group>
            ))}
            <Group gap={4}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: calendarColors.freeFridayBg,
                }}
              />
              <Text size="xs" c="dimmed">
                Undervisningsfri
              </Text>
            </Group>
            <Group gap={4}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: calendarColors.holidayBg,
                }}
              />
              <Text size="xs" c="dimmed">
                Ferie / helligdag
              </Text>
            </Group>
            <Group gap={4}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: calendarColors.noteDot,
                }}
              />
              <Text size="xs" c="dimmed">
                Note tilføjet
              </Text>
            </Group>
          </Group>

          {/* Selected student + date info */}
          {selectedStudentId && (
            <Alert
              mt="xs"
              variant="light"
              color="blue"
              radius="md"
              icon={<IconUser size={16} />}
            >
              <Text size="sm">
                Valgt elev: <strong>{selectedStudentName}</strong> — klik på en
                dato for at registrere
              </Text>
            </Alert>
          )}

          {!selectedStudentId && selectedClassId && (
            <Alert
              mt="xs"
              variant="light"
              color="gray"
              radius="md"
              icon={<IconUser size={16} />}
            >
              <Text size="sm" c="dimmed">
                Vælg en elev i listen for at se og registrere fremmøde
              </Text>
            </Alert>
          )}
        </Card>
      </Grid.Col>

      {/* ═══ RIGHT: Detaljer-panel ═══ */}
      <Grid.Col span={{ base: 12, md: 2 }}>
        <Card
          withBorder
          radius="md"
          padding="sm"
          style={{ position: "sticky", top: "1rem" }}
        >
          <Stack gap="sm">
            <Text fw={600} size="xs" tt="uppercase" c="dimmed">
              Detaljer
            </Text>

            {!selectedStudentId && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                Vælg en elev i listen for at registrere fremmøde
              </Text>
            )}

            {selectedStudentId &&
              (selectedDayIsWeekend || selectedDayIsFreeFriday) && (
                <Alert
                  color={selectedDayIsFreeFriday ? "violet" : "gray"}
                  variant="light"
                  radius="md"
                >
                  <Text size="sm">
                    {selectedDayIsFreeFriday
                      ? `Undervisningsfri (uge ${getISOWeek(selectedDate)})`
                      : "Weekend — ingen undervisning"}
                  </Text>
                </Alert>
              )}

            {selectedStudentId && studentStats && (
              <>
                <Divider />
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Reg. dage: <strong>{studentStats.antal_registreringer}</strong>
                  </Text>
                  <Text size="xs" c="dimmed">
                    Fravær: <strong>{studentStats.fravaer_dage}</strong>
                  </Text>
                  {studentStats.gennemsnit_procent !== null && (
                    <Group gap={4}>
                      <Text size="xs" c="dimmed">
                        Snit:
                      </Text>
                      <ProcBadge p={studentStats.gennemsnit_procent} size="sm" />
                    </Group>
                  )}
                </Stack>
              </>
            )}

            {selectedStudentId && canRegister && (
              <>
                {/* Header */}
                <Group gap="xs">
                  <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                    <IconUser size={16} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="sm" fw={600} lineClamp={1}>
                      {selectedStudentName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(
                        selectedDateStr + "T12:00:00",
                      ).toLocaleDateString("da-DK", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </Text>
                  </Stack>
                </Group>

                {/* Live fremmøde ring */}
                <Center>
                  <RingProgress
                    size={100}
                    thickness={10}
                    roundCaps
                    label={
                      <Text size="sm" fw={700} ta="center">
                        {liveProc.toFixed(0)} %
                      </Text>
                    }
                    sections={[{ value: liveProc, color: procColor(liveProc) }]}
                  />
                </Center>

                <Divider label="Komme og gå-tider" labelPosition="left" />

                <Grid gutter="xs">
                  <Grid.Col span={6}>
                    <TimeField
                      label="Mødetid"
                      hours={form.modetid_h}
                      minutes={form.modetid_m}
                      disabled={form.fravaerende_hele_dagen}
                      onHoursChange={(v) => updateForm("modetid_h", v)}
                      onMinutesChange={(v) => updateForm("modetid_m", v)}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TimeField
                      label="Gå-tid"
                      hours={form.ga_tid_h}
                      minutes={form.ga_tid_m}
                      disabled={form.fravaerende_hele_dagen}
                      onHoursChange={(v) => updateForm("ga_tid_h", v)}
                      onMinutesChange={(v) => updateForm("ga_tid_m", v)}
                    />
                  </Grid.Col>
                </Grid>

                <Divider label="Fraværs detaljer" labelPosition="left" />

                <Switch
                  label="Fraværende hele dagen"
                  checked={form.fravaerende_hele_dagen}
                  onChange={(e) => {
                    updateForm(
                      "fravaerende_hele_dagen",
                      e.currentTarget.checked,
                    );
                    if (e.currentTarget.checked) {
                      updateForm("modetid_h", 8);
                      updateForm("modetid_m", 45);
                      updateForm("ga_tid_h", 15);
                      updateForm("ga_tid_m", 0);
                    }
                  }}
                />

                <Switch
                  label="Melding modtaget"
                  checked={form.melding_modtaget}
                  onChange={(e) =>
                    updateForm("melding_modtaget", e.currentTarget.checked)
                  }
                />

                {form.melding_modtaget && (
                  <TimeField
                    label="Kl. (melding modtaget)"
                    hours={form.melding_tidspunkt_h}
                    minutes={form.melding_tidspunkt_m}
                    onHoursChange={(v) => updateForm("melding_tidspunkt_h", v)}
                    onMinutesChange={(v) =>
                      updateForm("melding_tidspunkt_m", v)
                    }
                  />
                )}

                <Switch
                  label="Bevilget fravær"
                  checked={form.bevilget_fravaer}
                  onChange={(e) =>
                    updateForm("bevilget_fravaer", e.currentTarget.checked)
                  }
                />

                <Divider label="Manuel fremmøde %" labelPosition="left" />

                <Switch
                  label="Tilsidesæt automatisk beregning"
                  checked={form.use_override}
                  onChange={(e) => {
                    updateForm("use_override", e.currentTarget.checked);
                    if (!e.currentTarget.checked) {
                      updateForm("override_procent", null);
                    } else {
                      updateForm("override_procent", 100);
                    }
                  }}
                />

                {form.use_override && (
                  <>
                    <Text size="xs" c="dimmed">
                      Bruges ved særlige mødeaftaler — tilsidesætter beregning
                      fra klokkeslæt.
                    </Text>
                    <NumberInput
                      min={0}
                      max={100}
                      step={5}
                      suffix=" %"
                      value={form.override_procent ?? 100}
                      onChange={(v) =>
                        updateForm(
                          "override_procent",
                          typeof v === "number" ? v : null,
                        )
                      }
                    />
                  </>
                )}

                <Divider label="Note" labelPosition="left" />

                <Textarea
                  placeholder="Skriv en note her..."
                  value={form.note}
                  rows={3}
                  onChange={(e) => updateForm("note", e.currentTarget.value)}
                />

                {/* Action buttons */}
                <Group grow>
                  <Tooltip
                    label="Nulstil registrering for denne dag"
                    disabled={!currentRecord}
                  >
                    <Button
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      disabled={!currentRecord}
                      loading={deleteMutation.isPending}
                      onClick={handleDelete}
                    >
                      Slet
                    </Button>
                  </Tooltip>
                  <Button
                    color={isSaveConfirmed ? "green" : "orange"}
                    leftSection={<IconCheck size={14} />}
                    loading={upsertMutation.isPending}
                    onClick={handleSave}
                  >
                    {isSaveConfirmed ? "Gemt" : "Gem"}
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
    </>
  );
}

export default Attendance;
