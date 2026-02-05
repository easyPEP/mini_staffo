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
import {
  getGetShiftsIdQueryKey,
  getGetShiftsQueryKey,
  useDeleteShiftsId,
  useGetShiftsId,
} from '@/generated/api/shifts/shifts'
import {
  getGetApplicationsQueryKey,
  useGetApplications,
  usePostApplications,
} from '@/generated/api/applications/applications'
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
import { ShiftFormDialog } from '@/components/shift-form-dialog'
import { ApplicationFormDialog } from '@/components/application-form-dialog'

export const Route = createFileRoute('/_authenticated/shifts/$shiftId')({
  component: ShiftDetailPage,
})

function stateBadgeVariant(
  state?: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (state) {
    case 'assigned':
      return 'default'
    case 'applied':
      return 'outline'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function ShiftDetailPage() {
  const { t } = useTranslation()
  const { shiftId } = Route.useParams()
  const { currentUser, isAdmin, isManager } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const canManageShifts = isAdmin || isManager

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createApplicationDialogOpen, setCreateApplicationDialogOpen] =
    useState(false)

  const { data, isLoading } = useGetShiftsId(shiftId)
  const createApplication = usePostApplications()
  const deleteShift = useDeleteShiftsId()

  const { data: applicationsData } = useGetApplications()
  const shiftApplications = (applicationsData?.data ?? []).filter(
    (a) => a.relationships?.shift?.data?.id === shiftId,
  )

  const shift = data?.data
  const attrs = shift?.attributes
  const scheduleId = shift?.relationships?.schedule?.data?.id

  const assignedCount = shiftApplications.filter(
    (a) => a.attributes?.state === 'assigned',
  ).length
  const desiredCoverage = attrs?.desired_coverage ?? 0

  const handleApply = () => {
    createApplication.mutate(
      {
        data: {
          data: {
            attributes: {},
            relationships: {
              shift: {
                data: { id: shiftId, type: 'shift' },
              },
              user: {
                data: {
                  id: currentUser?.id ?? '',
                  type: 'user',
                },
              },
              schedule: scheduleId
                ? {
                    data: { id: scheduleId, type: 'schedule' },
                  }
                : undefined,
            },
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(t('shift.applied'))
          void queryClient.invalidateQueries({
            queryKey: getGetShiftsIdQueryKey(shiftId),
          })
          void queryClient.invalidateQueries({
            queryKey: getGetApplicationsQueryKey(),
          })
        },
      },
    )
  }

  const handleDelete = () => {
    deleteShift.mutate(
      { id: shiftId },
      {
        onSuccess: () => {
          toast.success(t('shift.deleted'))
          void queryClient.invalidateQueries({
            queryKey: getGetShiftsQueryKey(),
          })
          void navigate({ to: '/shifts' })
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
          to="/shifts"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeftIcon className="size-4" />
          {t('actions.back')}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {attrs?.starts_at} {' - '} {attrs?.ends_at}
          </h1>
          <div className="flex gap-2">
            {canManageShifts ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <PencilIcon className="size-4" />
                  {t('actions.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <TrashIcon className="size-4" />
                  {t('actions.delete')}
                </Button>
              </>
            ) : null}
            <Button
              onClick={handleApply}
              disabled={createApplication.isPending}
            >
              {createApplication.isPending
                ? t('actions.applying')
                : t('actions.apply')}
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('nav.shifts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground font-medium">
              {t('shift.schedule')}
            </dt>
            <dd>
              {scheduleId ? (
                <Link
                  to="/schedules/$scheduleId"
                  params={{ scheduleId }}
                  className="hover:underline"
                >
                  {scheduleId}
                </Link>
              ) : (
                '-'
              )}
            </dd>

            <dt className="text-muted-foreground font-medium">
              {t('shift.startsAt')}
            </dt>
            <dd>{attrs?.starts_at}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('shift.endsAt')}
            </dt>
            <dd>{attrs?.ends_at}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('shift.coverage')}
            </dt>
            <dd>
              {assignedCount}
              {'/'}
              {desiredCoverage}
            </dd>

            <dt className="text-muted-foreground font-medium">
              {t('shift.note')}
            </dt>
            <dd>{attrs?.note ?? '-'}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('shift.createdAt')}
            </dt>
            <dd>{attrs?.created_at}</dd>
          </dl>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('shift.applications')}</h2>
        {canManageShifts ? (
          <Button
            size="sm"
            onClick={() => setCreateApplicationDialogOpen(true)}
          >
            <PlusIcon className="size-4" />
            {t('application.create')}
          </Button>
        ) : null}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{'ID'}</TableHead>
              <TableHead>{t('application.user')}</TableHead>
              <TableHead>{t('application.state')}</TableHead>
              <TableHead>{t('application.cancelReason')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shiftApplications.length ? (
              shiftApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Link
                      to="/applications/$applicationId"
                      params={{ applicationId: app.id ?? '' }}
                      className="font-medium hover:underline"
                    >
                      {app.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/users/$userId"
                      params={{
                        userId: app.relationships?.user?.data?.id ?? '',
                      }}
                      className="hover:underline"
                    >
                      {app.relationships?.user?.data?.id ?? '-'}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {app.attributes?.state ? (
                      <Badge variant={stateBadgeVariant(app.attributes.state)}>
                        {t(`states.${app.attributes.state}`)}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{app.attributes?.cancel_reason ?? '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t('common.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ShiftFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        shift={shift}
      />

      <ApplicationFormDialog
        open={createApplicationDialogOpen}
        onOpenChange={setCreateApplicationDialogOpen}
        shiftId={shiftId}
        scheduleId={scheduleId}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('shift.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('shift.deleteConfirmDescription')}
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
              disabled={deleteShift.isPending}
            >
              {deleteShift.isPending
                ? t('actions.deleting')
                : t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
