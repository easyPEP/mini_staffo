import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getGetApplicationsQueryKey,
  usePatchApplicationsId,
  usePostApplications,
} from '@/generated/api/applications/applications'
import { useGetUsers } from '@/generated/api/users/users'
import { getGetShiftsIdQueryKey } from '@/generated/api/shifts/shifts'

type ApplicationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shiftId: string
  scheduleId?: string
  onSuccess?: () => void
}

const TARGET_STATES = ['new', 'applied', 'assigned'] as const
type TargetState = (typeof TARGET_STATES)[number]

export function ApplicationFormDialog({
  open,
  onOpenChange,
  shiftId,
  scheduleId,
  onSuccess,
}: ApplicationFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [selectedUserId, setSelectedUserId] = useState('')
  const [targetState, setTargetState] = useState<TargetState>('new')

  const { data: usersData } = useGetUsers()
  const users = usersData?.data ?? []

  const createApplication = usePostApplications()
  const patchApplication = usePatchApplicationsId()

  const isPending = createApplication.isPending || patchApplication.isPending

  const invalidateQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetApplicationsQueryKey(),
    })
    void queryClient.invalidateQueries({
      queryKey: getGetShiftsIdQueryKey(shiftId),
    })
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()

    createApplication.mutate(
      {
        data: {
          data: {
            attributes: {},
            relationships: {
              shift: { data: { id: shiftId, type: 'shift' } },
              user: { data: { id: selectedUserId, type: 'user' } },
              schedule: scheduleId
                ? { data: { id: scheduleId, type: 'schedule' } }
                : undefined,
            },
          },
        },
      },
      {
        onSuccess: (response) => {
          const applicationId = response.data?.id
          if (!applicationId) {
            toast.success(t('application.created'))
            invalidateQueries()
            onOpenChange(false)
            onSuccess?.()
            return
          }

          // If target state is 'new', we're done
          if (targetState === 'new') {
            toast.success(t('application.created'))
            invalidateQueries()
            onOpenChange(false)
            setSelectedUserId('')
            setTargetState('new')
            onSuccess?.()
            return
          }

          // Otherwise, transition to the target state
          const action = targetState === 'applied' ? 'apply' : 'assign'
          patchApplication.mutate(
            {
              id: applicationId,
              data: {
                data: {
                  attributes: {},
                  relationships: {
                    shift: { data: { id: shiftId, type: 'shift' } },
                    user: { data: { id: selectedUserId, type: 'user' } },
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
                toast.success(t('application.created'))
                invalidateQueries()
                onOpenChange(false)
                setSelectedUserId('')
                setTargetState('new')
                onSuccess?.()
              },
            },
          )
        },
      },
    )
  }

  const getUserDisplayName = (user: (typeof users)[number]) => {
    const firstName = user.attributes?.first_name ?? ''
    const lastName = user.attributes?.last_name ?? ''
    const email = user.attributes?.email ?? ''
    const name = [firstName, lastName].filter(Boolean).join(' ')
    return name ? `${name} (${email})` : email
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('application.create')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user">{t('application.user')}</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('application.selectUser')} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id ?? ''}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">{t('application.state')}</Label>
              <Select
                value={targetState}
                onValueChange={(value) => setTargetState(value as TargetState)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {t(`states.${state}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || !selectedUserId}>
              {isPending ? t('actions.saving') : t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
