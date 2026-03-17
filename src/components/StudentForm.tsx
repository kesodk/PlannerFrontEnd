import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  Title,
  Divider,
  Card,
  Alert,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { studentSchema, type StudentFormData } from '../schemas/studentSchema'
import { AFDELINGER, SPOR, LOVGRUNDLAG, STATUS, KOMMUNER } from '../types/Student'
import type { Student } from '../types/Student'

interface StudentFormProps {
  opened: boolean
  onClose: () => void
  onSubmit: (data: StudentFormData) => void
  student?: Student | null
  title: string
}

export function StudentForm({ opened, onClose, onSubmit, student, title }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      navn: '',
      fødselsdato: '',
      cpr: '',
      adresse: '',
      telefonnr: '',
      email: '',
      forældreNavn: '',
      forældreTelefon: '',
      forældreAdresse: '',
      forældreEmail: '',
      afdeling: 'Trekanten',
      kursistnr: '',
      kommune: '',
      lovgrundlag: 'STU',
      vejlederNavn: '',
      vejlederTlf: '',
      vejlederEmail: '',
      kontaktperson1Rolle: '',
      kontaktperson1Navn: '',
      kontaktperson1Telefon: '',
      kontaktperson1Email: '',
      kontaktperson2Rolle: '',
      kontaktperson2Navn: '',
      kontaktperson2Telefon: '',
      kontaktperson2Email: '',
      startdato: '',
      slutdato: '',
      spor: 'AspIT',
      status: 'UP/Afklaring',
    },
  })

  // Update form values when student prop changes
  useEffect(() => {
    if (student) {
      // Set all form values when editing a student
      setValue('navn', student.navn || '')
      setValue('fødselsdato', student.fødselsdato || '')
      setValue('cpr', student.cpr || '')
      setValue('adresse', student.adresse || '')
      setValue('telefonnr', student.telefonnr || '')
      setValue('email', student.email || '')
      setValue('forældreNavn', student.forældreNavn || '')
      setValue('forældreTelefon', student.forældreTelefon || '')
      setValue('forældreAdresse', student.forældreAdresse || '')
      setValue('forældreEmail', student.forældreEmail || '')
      setValue('afdeling', student.afdeling || 'Trekanten')
      setValue('kursistnr', student.kursistnr || '')
      setValue('kommune', student.kommune || '')
      setValue('lovgrundlag', student.lovgrundlag || 'STU')
      setValue('vejlederNavn', student.vejlederNavn || '')
      setValue('vejlederTlf', student.vejlederTlf || '')
      setValue('vejlederEmail', student.vejlederEmail || '')
      setValue('kontaktperson1Rolle', student.kontaktperson1Rolle || '')
      setValue('kontaktperson1Navn', student.kontaktperson1Navn || '')
      setValue('kontaktperson1Telefon', student.kontaktperson1Telefon || '')
      setValue('kontaktperson1Email', student.kontaktperson1Email || '')
      setValue('kontaktperson2Rolle', student.kontaktperson2Rolle || '')
      setValue('kontaktperson2Navn', student.kontaktperson2Navn || '')
      setValue('kontaktperson2Telefon', student.kontaktperson2Telefon || '')
      setValue('kontaktperson2Email', student.kontaktperson2Email || '')
      setValue('startdato', student.startdato || '')
      setValue('slutdato', student.slutdato || '')
      setValue('spor', student.spor || 'AspIT')
      setValue('status', student.status || 'UP/Afklaring')
    } else {
      // Reset to default values when creating new student
      reset({
        navn: '',
        fødselsdato: '',
        cpr: '',
        adresse: '',
        telefonnr: '',
        email: '',
        forældreNavn: '',
        forældreTelefon: '',
        forældreAdresse: '',
        forældreEmail: '',
        afdeling: 'Trekanten',
        kursistnr: '',
        kommune: '',
        lovgrundlag: 'STU',
        vejlederNavn: '',
        vejlederTlf: '',
        vejlederEmail: '',
        kontaktperson1Rolle: '',
        kontaktperson1Navn: '',
        kontaktperson1Telefon: '',
        kontaktperson1Email: '',
        kontaktperson2Rolle: '',
        kontaktperson2Navn: '',
        kontaktperson2Telefon: '',
        kontaktperson2Email: '',
        startdato: '',
        slutdato: '',
        spor: 'AspIT',
        status: 'UP/Afklaring',
      })
    }
  }, [student, setValue, reset])

  const handleFormSubmit = (data: StudentFormData) => {
    onSubmit(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title={title}
      size="xl"
      styles={{
        content: { maxHeight: '90vh', overflow: 'auto' }
      }}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="md">
          {/* Elevoplysninger */}
          <Card withBorder>
            <Title order={4} mb="md">Elevoplysninger</Title>
            
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Navn"
                  placeholder="Fulde navn"
                  {...register('navn')}
                  error={errors.navn?.message}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Fødselsdato"
                  placeholder="dd/mm/yyyy"
                  type="date"
                  {...register('fødselsdato')}
                  error={errors.fødselsdato?.message}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="CPR nummer"
                  placeholder="DDMMYY-XXXX"
                  {...register('cpr')}
                  error={errors.cpr?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <TextInput
                  label="Adresse"
                  placeholder="Vej/gade, nummer, postnummer, by"
                  {...register('adresse')}
                  error={errors.adresse?.message}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Telefonnummer"
                  placeholder="12345678"
                  {...register('telefonnr')}
                  error={errors.telefonnr?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="elev@example.com"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Divider label="Forældreoplysninger" labelPosition="left" />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Forældre navn"
                  placeholder="Forældres fulde navn"
                  {...register('forældreNavn')}
                  error={errors.forældreNavn?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Forældre telefon"
                  placeholder="12345678"
                  {...register('forældreTelefon')}
                  error={errors.forældreTelefon?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <TextInput
                  label="Forældre adresse"
                  placeholder="Hvis afvigende fra elev"
                  {...register('forældreAdresse')}
                  error={errors.forældreAdresse?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <TextInput
                  label="Forældre email"
                  placeholder="foraldre@example.com"
                  type="email"
                  {...register('forældreEmail')}
                  error={errors.forældreEmail?.message}
                />
              </Grid.Col>
            </Grid>
          </Card>

          {/* Uddannelse */}
          <Card withBorder>
            <Title order={4} mb="md">Uddannelse</Title>
            
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Afdeling"
                  placeholder="Vælg afdeling"
                  data={AFDELINGER}
                  value={watch('afdeling')}
                  onChange={(value) => setValue('afdeling', value as any)}
                  error={errors.afdeling?.message}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Kursistnummer"
                  placeholder="Kursistnummer"
                  {...register('kursistnr')}
                  error={errors.kursistnr?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Kommune"
                  placeholder="Vælg kommune"
                  data={KOMMUNER}
                  value={watch('kommune')}
                  onChange={(value) => setValue('kommune', value || '')}
                  error={errors.kommune?.message}
                  searchable
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Lovgrundlag"
                  placeholder="Vælg lovgrundlag"
                  data={LOVGRUNDLAG}
                  value={watch('lovgrundlag')}
                  onChange={(value) => setValue('lovgrundlag', value as any)}
                  error={errors.lovgrundlag?.message}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Startdato"
                  type="date"
                  {...register('startdato')}
                  error={errors.startdato?.message}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Slutdato"
                  type="date"
                  {...register('slutdato')}
                  error={errors.slutdato?.message}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Spor"
                  placeholder="Vælg spor"
                  data={SPOR}
                  value={watch('spor')}
                  onChange={(value) => setValue('spor', value as any)}
                  error={errors.spor?.message}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Status"
                  placeholder="Vælg status"
                  data={STATUS}
                  value={watch('status')}
                  onChange={(value) => setValue('status', value as any)}
                  error={errors.status?.message}
                  required
                />
              </Grid.Col>
            </Grid>
          </Card>

          {/* Kontaktpersoner */}
          <Card withBorder>
            <Title order={4} mb="md">Kontaktpersoner</Title>

            <Grid>
              <Grid.Col span={12}>
                <Alert variant="light" color="yellow" icon={<IconAlertCircle size={16} />}>
                  Brug kun  arbejdsoplysninger. Privat telefonnummer og privat email må ikke anvendes.
                </Alert>
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider label="Vejlederoplysninger" labelPosition="left" />
              </Grid.Col>

              <Grid.Col span={4}>
                <TextInput
                  label="Vejleder navn"
                  placeholder="Vejleders navn"
                  {...register('vejlederNavn')}
                  error={errors.vejlederNavn?.message}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <TextInput
                  label="Vejleder telefon"
                  placeholder="12345678"
                  {...register('vejlederTlf')}
                  error={errors.vejlederTlf?.message}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <TextInput
                  label="Vejleder email"
                  placeholder="vejleder@example.com"
                  type="email"
                  {...register('vejlederEmail')}
                  error={errors.vejlederEmail?.message}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider label="Kontaktpersoner" labelPosition="left" />
              </Grid.Col>

              <Grid.Col span={12}>
                <Title order={6}>Kontaktperson 1</Title>
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Rolle"
                  placeholder="F.eks. bostøtte eller sagsbehandler"
                  {...register('kontaktperson1Rolle')}
                  error={errors.kontaktperson1Rolle?.message}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Navn"
                  placeholder="Fulde navn"
                  {...register('kontaktperson1Navn')}
                  error={errors.kontaktperson1Navn?.message}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Telefon"
                  placeholder="12345678"
                  {...register('kontaktperson1Telefon')}
                  error={errors.kontaktperson1Telefon?.message}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="kontaktperson1@organisation.dk"
                  type="email"
                  {...register('kontaktperson1Email')}
                  error={errors.kontaktperson1Email?.message}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Title order={6}>Kontaktperson 2</Title>
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Rolle"
                  placeholder="F.eks. bostøtte eller sagsbehandler"
                  {...register('kontaktperson2Rolle')}
                  error={errors.kontaktperson2Rolle?.message}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Navn"
                  placeholder="Fulde navn"
                  {...register('kontaktperson2Navn')}
                  error={errors.kontaktperson2Navn?.message}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Telefon"
                  placeholder="12345678"
                  {...register('kontaktperson2Telefon')}
                  error={errors.kontaktperson2Telefon?.message}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="kontaktperson2@organisation.dk"
                  type="email"
                  {...register('kontaktperson2Email')}
                  error={errors.kontaktperson2Email?.message}
                />
              </Grid.Col>
            </Grid>
          </Card>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={handleClose}>
              Annuller
            </Button>
            <Button type="submit">
              {student ? 'Opdater elev' : 'Opret elev'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
