import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import type { GetShiftsParams } from '@/generated/schemas'
import {
  getGetSchedulesIdQueryKey,
  getGetSchedulesQueryKey,
  useDeleteSchedulesId,
  useGetSchedulesId,
  usePutSchedulesIdPublish,
} from '@/generated/api/schedules/schedules'
import { useGetShifts } from '@/generated/api/shifts/shifts'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScheduleFormDialog } from '@/components/schedule-form-dialog'
import { ShiftFormDialog } from '@/components/shift-form-dialog'

export const Route = createFileRoute('/_authenticated/schedules/$scheduleId')({
  component: ScheduleDetailPage,
})

function ScheduleDetailPage() {
  const { t } = useTranslation()
  const { scheduleId } = Route.useParams()
  const { isAdmin, isManager } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const canManageSchedules = isAdmin || isManager

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createShiftDialogOpen, setCreateShiftDialogOpen] = useState(false)

  const { data, isLoading } = useGetSchedulesId(scheduleId)
  const publishSchedule = usePutSchedulesIdPublish()
  const deleteSchedule = useDeleteSchedulesId()

  const { data: shiftsData } = useGetShifts({
    'filter[schedule_id_eq]': scheduleId,
  } as GetShiftsParams)
  const scheduleShifts = shiftsData?.data ?? []

  const schedule = data?.data
  const attrs = schedule?.attributes
  const isDraft = attrs?.state === 'draft'

  const handlePublish = () => {
    publishSchedule.mutate(
      { id: scheduleId },
      {
        onSuccess: () => {
          toast.success(t('schedule.published'))
          void queryClient.invalidateQueries({
            queryKey: getGetSchedulesIdQueryKey(scheduleId),
          })
          void queryClient.invalidateQueries({
            queryKey: getGetSchedulesQueryKey(),
          })
        },
      },
    )
  }

  const handleDelete = () => {
    deleteSchedule.mutate(
      { id: scheduleId },
      {
        onSuccess: () => {
          toast.success(t('schedule.deleted'))
          void queryClient.invalidateQueries({
            queryKey: getGetSchedulesQueryKey(),
          })
          void navigate({ to: '/schedules' })
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          to="/schedules"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeftIcon className="size-4" />
          {t('actions.back')}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{attrs?.name ?? '-'}</h1>
          {canManageSchedules ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <PencilIcon className="size-4" />
                {t('actions.edit')}
              </Button>
              {isDraft ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <TrashIcon className="size-4" />
                    {t('actions.delete')}
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={publishSchedule.isPending}
                  >
                    {publishSchedule.isPending
                      ? t('actions.publishing')
                      : t('actions.publish')}
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{attrs?.name ?? '-'}</span>
            {attrs?.state ? (
              <Badge
                variant={attrs.state === 'published' ? 'default' : 'secondary'}
              >
                {t(`states.${attrs.state}`)}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground font-medium">
              {t('schedule.bop')}
            </dt>
            <dd>{attrs?.bop}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('schedule.eop')}
            </dt>
            <dd>{attrs?.eop}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('schedule.state')}
            </dt>
            <dd>{attrs?.state ? t(`states.${attrs.state}`) : ''}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('schedule.publishedAt')}
            </dt>
            <dd>{attrs?.published_at ?? '-'}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('schedule.createdAt')}
            </dt>
            <dd>{attrs?.created_at}</dd>
          </dl>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('schedule.shifts')}</h2>
        {canManageSchedules && isDraft ? (
          <Button size="sm" onClick={() => setCreateShiftDialogOpen(true)}>
            <PlusIcon className="size-4" />
            {t('shift.create')}
          </Button>
        ) : null}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{'ID'}</TableHead>
              <TableHead>{t('shift.startsAt')}</TableHead>
              <TableHead>{t('shift.endsAt')}</TableHead>
              <TableHead>{t('shift.desiredCoverage')}</TableHead>
              <TableHead>{t('shift.note')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleShifts.length ? (
              scheduleShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <Link
                      to="/shifts/$shiftId"
                      params={{ shiftId: shift.id ?? '' }}
                      className="font-medium hover:underline"
                    >
                      {shift.id}
                    </Link>
                  </TableCell>
                  <TableCell>{shift.attributes?.starts_at}</TableCell>
                  <TableCell>{shift.attributes?.ends_at}</TableCell>
                  <TableCell>{shift.attributes?.desired_coverage}</TableCell>
                  <TableCell>{shift.attributes?.note ?? '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('common.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ScheduleFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        schedule={schedule}
      />

      <ShiftFormDialog
        open={createShiftDialogOpen}
        onOpenChange={setCreateShiftDialogOpen}
        scheduleId={scheduleId}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('schedule.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('schedule.deleteConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSchedule.isPending}
            >
              {deleteSchedule.isPending
                ? t('actions.deleting')
                : t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
