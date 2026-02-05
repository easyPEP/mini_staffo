import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ScheduleItem } from '@/generated/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getGetSchedulesIdQueryKey,
  getGetSchedulesQueryKey,
  usePatchSchedulesId,
  usePostSchedules,
} from '@/generated/api/schedules/schedules'

type ScheduleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: ScheduleItem
  onSuccess?: () => void
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  onSuccess,
}: ScheduleFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const isEditing = !!schedule
  const [name, setName] = useState('')
  const [bop, setBop] = useState('')

  const createSchedule = usePostSchedules()
  const updateSchedule = usePatchSchedulesId()

  const isPending = createSchedule.isPending || updateSchedule.isPending

  useEffect(() => {
    if (open) {
      setName(schedule?.attributes?.name ?? '')
      setBop(schedule?.attributes?.bop ?? '')
    }
  }, [open, schedule])

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()

    const payload = {
      data: {
        attributes: {
          name: name || null,
          bop,
        },
      },
    }

    if (isEditing && schedule.id) {
      const scheduleId = schedule.id
      updateSchedule.mutate(
        { id: scheduleId, data: payload },
        {
          onSuccess: () => {
            toast.success(t('schedule.updated'))
            void queryClient.invalidateQueries({
              queryKey: getGetSchedulesQueryKey(),
            })
            void queryClient.invalidateQueries({
              queryKey: getGetSchedulesIdQueryKey(scheduleId),
            })
            onOpenChange(false)
            onSuccess?.()
          },
        },
      )
    } else {
      createSchedule.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast.success(t('schedule.created'))
            void queryClient.invalidateQueries({
              queryKey: getGetSchedulesQueryKey(),
            })
            onOpenChange(false)
            onSuccess?.()
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('schedule.edit') : t('schedule.create')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('schedule.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('schedule.namePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bop">{t('schedule.bop')}</Label>
              <Input
                id="bop"
                type="date"
                value={bop}
                onChange={(e) => setBop(e.target.value)}
                required
              />
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
            <Button type="submit" disabled={isPending || !bop}>
              {isPending ? t('actions.saving') : t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
