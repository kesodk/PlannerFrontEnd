import { Badge, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconArrowUpRight, IconBookmark, IconCalendarEvent, IconCheck, IconSparkles, IconClock, IconWorld, IconParkingCircle } from '@tabler/icons-react'
import aspitLogo from '../assets/aspit-logo.svg'
import { useAuth } from '../contexts/AuthContext'
import { useModulperioder } from '../services/modulperiodeApi'
import classes from './Dashboard.module.css'

type DashboardNews = {
  id: number
  title: string
  content: string
  author: string
  date: string
  highlights?: string[]
  cta?: string
  featured?: boolean
}

const newsItems: DashboardNews[] = [
  {
    id: 1,
    title: 'Velkommen til den nye AspIT Planner!',
    content: `Jeg har bygget hele platformen (backend + frontend) fra bunden som en moderne webapp, så den er hurtig og intuitiv.
Platformen kræver ingen lokal installation, ingen manuelle opdateringer og ingen ventetid. Bare log ind, og kom i gang - uanset om du sidder på skolen eller arbejder hjemmefra.
Sammenlignet med den tidligere lokalt installerede version får du nu et markant stærkere værktøj med bedre overblik, flere muligheder og en mere fleksibel arbejdsproces. I at med jeg selv har udviklet både backend og frontend, har jeg kunnet optimere hele brugeroplevelsen og implementere funktioner, der tidligere var umulige eller meget besværlige at få på plads - f.eks. evalueringsfeltet til "socialt mål", som man tænkte burde været simpelt, men som bare altid har manglet. Det betyder også at jeg meget hurtigt kan tilføje nye funktioner og forbedringer løbende, da jeg har fuld kontrol med hele systemet.`,
    author: 'KESO',
    date: '22-03-2026',
    featured: true,
    highlights: [
      'Meget hurtigere oplevelse med minimal loading og mere flydende navigation.',
      'Mere moderne og visuelt stærkt design med både dark mode og light mode.',
      'Ingen installation eller lokale opdateringer - platformen er altid klar i browseren, da opdateringer sker på serveren.',
      'Adgang fra alle steder med internet, så arbejdet ikke er bundet til en bestemt PC.',
      'Den "gamle" Planner kørte langsomt på visse maskiner - særligt efter vi fik nye laptops - den nye version er bygget til at være hurtig og stabil på tværs af alle enheder.',
      'Den "gamle" Planner fik kun små- og sjældne opdateringer - med den nye version her, kan jeg hurtigt implementere nye funktioner, både store og små.',
      'Du kan nu lave flere ændringer i samme arbejdsgang, hvor alt gemmes løbende i stedet for én ændring ad gangen.',
      'Forbedret fremmødeoversigt med kalender, der tydeligt viser noter og bevilget fravær, samt mulighed for manuel fraværsprocent ved ændrede mødetider.',
      'Stærkere værktøj til elev-evalueringer, hvor forløbsplan og STU-indstilling er en direkte del af platformen.',
      'Nemmere for SPV at arbejde med evalueringer: markér al tekst på én gang i stedet for kun ét felt ad gangen. Eller brug den nye funktion: "Eksporter til fil" for at gemme evalueringer lokalt som PDF, DOCX eller TXT.',
      'Faste aftaler og opfølgning vises direkte i elevens evaluering og følger eleven på tværs af modulperioder. (Tak for idéen, HALU 😊)',
      'Hver afdeling kan nu selv oprette nye elever, i stedet for at være afhængig af stakkels MARA, som skal gøre det for alle.',
      'Oprettelse af nye elever er nu mere detaljeret, hvor du blandt andet kan oprette flere kontaktpersoner efter behov, som f.eks. forældre, vejledere bostøtte m.m..',
      
    ],
    cta: 'Vær dog opmærksom på at platformen stadig er under udvikling og ikke er færdig. Der kan derfor stadig være fejl og mangler, og jeg arbejder på at få det hele på plads så hurtigt som muligt. Hvis du støder på noget, der ikke fungerer, eller har forslag til forbedringer, så tøv ikke med at kontakte mig - jeg vil meget gerne høre din feedback!',
  },
  {
    id: 2,
    title: 'Teknisk hjørne: Hvad kører AspIT Planner på?',
    content: `Til jer der gerne vil kende maskinrummet: den nye AspIT Planner er bygget som en moderne webplatform med en tydeligt adskilt frontend og backend.

Frontend er udviklet i React + TypeScript med Vite som build tool, Mantine som UI-bibliotek, React Router til navigation, TanStack Query til datahåndtering/caching og React Hook Form + Zod til stærk validering.

Backend er bygget i Laravel 12 (PHP 8.3+) med MySQL, hvor Laravel Sanctum håndterer token-baseret login. API Resources sikrer ensartede JSON-responser, så integrationen mellem klient og server er stabil og forudsigelig.`,
    author: 'KESO',
    date: '22-03-2026',
    highlights: [
      'Frontend: React 19, TypeScript, Vite 7, Mantine 8, React Router 7, TanStack Query.',
      'Forms & validation: React Hook Form + Zod.',
      'Backend: Laravel 12 (PHP 8.3+) med MySQL.',
      'Auth: Laravel Sanctum med Bearer token.',
      'Arkitektur: Webbaseret platform med API-first integration mellem frontend og backend.',
    ],
    cta: 'Har du tekniske idéer eller forbedringsforslag, så del dem gerne - platformen udvikles løbende.',
  },
]

const shortcuts = [
  {
    label: 'TimeGrip',
    hint: 'Registrer og se arbejdstid',
    href: 'http://tid.campusvejle.dk/',
    icon: IconClock,
    external: true,
  },
  {
    label: 'SDBF',
    hint: 'Blanketsystem (kørsel, udlæg, osv.)',
    href: 'https://sdbf.dk/campusvejle',
    icon: IconWorld,
    external: true,
  },
  {
    label: 'Selvbetjening',
    hint: 'Parkering, kodeord, og mere',
    href: 'https://selvbetjening.campusvejle.dk/loggedin/default.aspx',
    icon: IconParkingCircle,
    external: true,
  },
]

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export function Dashboard() {
  const { user } = useAuth()
  const { data: modulperioder = [] } = useModulperioder()

  const currentModulperiode =
    modulperioder.find((mp) => mp.status === 'Igangværende')?.kode
    ?? modulperioder.find((mp) => mp.status === 'Fremtidig')?.kode
    ?? 'ukendt'

  const displayName = user?.navn ?? user?.initialer ?? 'kollega'
  const today = formatDate(new Date())

  return (
    <Container size="xl" className={classes.dashboardRoot}>
      <Card radius="md" className={classes.heroCard} mb="xl">
        <div className={`${classes.heroGlow} ${classes.heroGlowTop}`} />
        <div className={`${classes.heroGlow} ${classes.heroGlowBottom}`} />
        <div className={classes.heroLogoWrap}>
          <img src={aspitLogo} alt="AspIT logo" className={classes.heroLogo} />
        </div>

        <Group gap="xs">
          <ThemeIcon size={28} variant="light" color="blue">
            <IconSparkles size={16} />
          </ThemeIcon>
          <Text className={classes.welcomeLabel}>AspIT Planner</Text>
        </Group>

        <Text className={classes.welcomeText} fw={700} size="2rem">
          Velkommen {displayName}
        </Text>

        <div className={classes.metaRow}>
          <Badge className={classes.metaBadge} size="lg" variant="filled" color="blue">
            <Group gap={6} wrap="nowrap">
              <IconCalendarEvent size={14} />
              <span>{today}</span>
            </Group>
          </Badge>
          <Badge className={classes.metaBadge} size="lg" variant="filled" color="orange">
            <Group gap={6} wrap="nowrap">
              <IconBookmark size={14} />
              <span>{currentModulperiode}</span>
            </Group>
          </Badge>
        </div>
      </Card>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card padding="lg" radius="md" className={classes.sectionCard}>
            <Title order={3} className={classes.sectionTitle}>Nyheder</Title>
            <Stack gap="sm" className={classes.newsScroll}>
              {newsItems.map((item) => (
                <div
                  key={item.id}
                  className={`${classes.newsItem} ${item.featured ? classes.newsItemFeatured : ''}`}
                >
                  <div className={classes.newsTitleRow}>
                    <Text fw={700} className={classes.newsTitle}>{item.title}</Text>
                    <Text size="sm" c="dimmed">{item.date}</Text>
                  </div>
                  <Text size="sm" className={classes.newsContent}>{item.content}</Text>
                  {item.highlights && item.highlights.length > 0 && (
                    <div className={classes.highlightList}>
                      {item.highlights.map((point) => (
                        <div key={point} className={classes.highlightItem}>
                          <ThemeIcon size={20} radius="xl" variant="light" color="blue">
                            <IconCheck size={14} />
                          </ThemeIcon>
                          <Text size="sm" className={classes.highlightText}>{point}</Text>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.cta && (
                    <Text size="sm" fw={600} className={classes.newsCta}>
                      {item.cta}
                    </Text>
                  )}
                  <Text size="xs" c="dimmed" className={classes.newsMeta}>Oprettet af: {item.author}</Text>
                </div>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" className={classes.sectionCard}>
            <Title order={3} className={classes.sectionTitle}>Genveje</Title>
            <div className={classes.shortcutList}>
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon

                return (
                  <a
                    key={shortcut.href}
                    href={shortcut.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.shortcutLink}
                  >
                    <div className={classes.shortcutContent}>
                      {Icon && (
                        <ThemeIcon size={36} radius="md" variant="light" color="blue" className={classes.shortcutIcon}>
                          <Icon size={20} />
                        </ThemeIcon>
                      )}
                      <div>
                        <Text fw={600} className={classes.shortcutLabel}>{shortcut.label}</Text>
                        <Text size="xs" c="dimmed" className={classes.shortcutHint}>{shortcut.hint}</Text>
                      </div>
                    </div>
                    <IconArrowUpRight size={18} />
                  </a>
                )
              })}
            </div>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}

export default Dashboard
