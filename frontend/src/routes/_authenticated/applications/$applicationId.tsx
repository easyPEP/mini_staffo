import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeftIcon, TrashIcon } from '@phosphor-icons/react'
import type {
  GetApplicationsIdParams,
  ScheduleItem,
  UserItem,
} from '@/generated/schemas'
import type { PatchApplicationsIdDo } from '@/generated/schemas/patchApplicationsIdDo'
import * as Application from '@/domains/application'
import * as JsonApi from '@/domains/json-api'
import * as User from '@/domains/user'
import {
  getGetApplicationsIdQueryKey,
  getGetApplicationsQueryKey,
  useDeleteApplicationsId,
  useGetApplicationsId,
  usePatchApplicationsId,
} from '@/generated/api/applications/applications'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute(
  '/_authenticated/applications/$applicationId',
)({
  component: ApplicationDetailPage,
})

function ApplicationDetailPage() {
  const { t } = useTranslation()
  const { applicationId } = Route.useParams()
  const { isAdmin, isManager } = useAuth()
  const queryClient = useQueryClient()

  const isManagerOrAdmin = isAdmin || isManager
  const navigate = useNavigate()

  const [cancelReason, setCancelReason] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data, isLoading } = useGetApplicationsId(applicationId, {
    include: 'user,schedule',
  } as GetApplicationsIdParams)
  const patchApplication = usePatchApplicationsId()
  const deleteApplication = useDeleteApplicationsId()

  const application = data?.data
  const attrs = application?.attributes
  const state = attrs?.state

  const shiftId = application?.relationships?.shift?.data?.id
  const userId = application?.relationships?.user?.data?.id
  const scheduleId = application?.relationships?.schedule?.data?.id

  const includedUser = JsonApi.findIncluded<UserItem>(
    data?.included,
    'user',
    userId,
  )
  const includedSchedule = JsonApi.findIncluded<ScheduleItem>(
    data?.included,
    'schedule',
    scheduleId,
  )

  const userName = includedUser?.attributes
    ? User.fullName(includedUser.attributes)
    : userId
  const scheduleName = includedSchedule?.attributes?.name ?? scheduleId

  const handleStateTransition = (
    action: PatchApplicationsIdDo,
    reason?: string,
  ) => {
    patchApplication.mutate(
      {
        id: applicationId,
        data: {
          data: {
            attributes: {
              ...(reason ? { cancel_reason: reason } : {}),
            },
            relationships: {
              shift: shiftId
                ? { data: { id: shiftId, type: 'shift' } }
                : undefined,
              user: userId ? { data: { id: userId, type: 'user' } } : undefined,
              schedule: scheduleId
                ? { data: { id: scheduleId, type: 'schedule' } }
                : undefined,
            },
          },
        },
        params: { do: action },
      },
      {
        onSuccess: () => {
          toast.success(t('application.updated'))
          setCancelReason('')
          void queryClient.invalidateQueries({
            queryKey: getGetApplicationsIdQueryKey(applicationId),
          })
          void queryClient.invalidateQueries({
            queryKey: getGetApplicationsQueryKey(),
          })
        },
      },
    )
  }

  const handleDelete = () => {
    deleteApplication.mutate(
      { id: applicationId },
      {
        onSuccess: () => {
          toast.success(t('application.deleted'))
          void queryClient.invalidateQueries({
            queryKey: getGetApplicationsQueryKey(),
          })
          void navigate({ to: '/applications' })
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
          to="/applications"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeftIcon className="size-4" />
          {t('actions.back')}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {t('nav.applications')} {'#'}
            {applicationId}
          </h1>
          {isManagerOrAdmin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <TrashIcon className="size-4" />
              {t('actions.delete')}
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>
              {t('nav.applications')} {'#'}
              {applicationId}
            </span>
            {state ? (
              <Badge variant={Application.stateBadgeVariant(state)}>
                {t(`states.${state}`)}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground font-medium">
              {t('application.schedule')}
            </dt>
            <dd>
              {scheduleId ? (
                <Link
                  to="/schedules/$scheduleId"
                  params={{ scheduleId }}
                  className="hover:underline"
                >
                  {scheduleName}
                </Link>
              ) : (
                '-'
              )}
            </dd>

            <dt className="text-muted-foreground font-medium">
              {t('application.shift')}
            </dt>
            <dd>
              {shiftId ? (
                <Link
                  to="/shifts/$shiftId"
                  params={{ shiftId }}
                  className="hover:underline"
                >
                  {shiftId}
                </Link>
              ) : (
                '-'
              )}
            </dd>

            <dt className="text-muted-foreground font-medium">
              {t('application.user')}
            </dt>
            <dd>
              {userId ? (
                <Link
                  to="/users/$userId"
                  params={{ userId }}
                  className="hover:underline"
                >
                  {userName}
                </Link>
              ) : (
                '-'
              )}
            </dd>

            <dt className="text-muted-foreground font-medium">
              {t('application.state')}
            </dt>
            <dd>{state ? t(`states.${state}`) : ''}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('application.cancelReason')}
            </dt>
            <dd>{attrs?.cancel_reason ?? '-'}</dd>

            <dt className="text-muted-foreground font-medium">
              {t('application.createdAt')}
            </dt>
            <dd>{attrs?.created_at}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('actions.edit')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === 'new' ? (
            <div className="flex gap-2">
              <Button
                onClick={() => handleStateTransition('apply')}
                disabled={patchApplication.isPending}
              >
                {t('actions.apply')}
              </Button>
              {isManagerOrAdmin ? (
                <Button
                  variant="outline"
                  onClick={() => handleStateTransition('assign')}
                  disabled={patchApplication.isPending}
                >
                  {t('actions.assign')}
                </Button>
              ) : null}
            </div>
          ) : null}

          {state === 'applied' && isManagerOrAdmin ? (
            <Button
              onClick={() => handleStateTransition('accept')}
              disabled={patchApplication.isPending}
            >
              {t('actions.accept')}
            </Button>
          ) : null}

          {state === 'assigned' ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cancel-reason">
                  {t('application.cancelReason')}
                </Label>
                <Input
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={t('application.enterCancelReason')}
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => handleStateTransition('cancel', cancelReason)}
                disabled={patchApplication.isPending}
              >
                {t('actions.cancel')}
              </Button>
            </div>
          ) : null}

          {state === 'cancelled' && isManagerOrAdmin ? (
            <Button
              variant="outline"
              onClick={() => handleStateTransition('revoke')}
              disabled={patchApplication.isPending}
            >
              {t('actions.revoke')}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('application.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('application.deleteConfirmDescription')}
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
              disabled={deleteApplication.isPending}
            >
              {deleteApplication.isPending
                ? t('actions.deleting')
                : t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
