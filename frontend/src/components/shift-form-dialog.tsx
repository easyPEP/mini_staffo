import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ShiftItem } from '@/generated/schemas'
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
  getGetShiftsIdQueryKey,
  getGetShiftsQueryKey,
  usePatchShiftsId,
  usePostShifts,
} from '@/generated/api/shifts/shifts'
import { getGetSchedulesIdQueryKey } from '@/generated/api/schedules/schedules'

type ShiftFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: ShiftItem
  scheduleId?: string
  onSuccess?: () => void
}

// Convert ISO datetime to datetime-local input format (YYYY-MM-DDTHH:mm)
function toDatetimeLocalValue(isoString?: string | null): string {
  if (!isoString) return ''
  // Handle both ISO format and already formatted strings
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  // Format as YYYY-MM-DDTHH:mm in local time
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  shift,
  scheduleId,
  onSuccess,
}: ShiftFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const isEditing = !!shift
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [desiredCoverage, setDesiredCoverage] = useState('')
  const [note, setNote] = useState('')

  const createShift = usePostShifts()
  const updateShift = usePatchShiftsId()

  const isPending = createShift.isPending || updateShift.isPending

  useEffect(() => {
    if (open) {
      setStartsAt(toDatetimeLocalValue(shift?.attributes?.starts_at))
      setEndsAt(toDatetimeLocalValue(shift?.attributes?.ends_at))
      setDesiredCoverage(shift?.attributes?.desired_coverage?.toString() ?? '1')
      setNote(shift?.attributes?.note ?? '')
    }
  }, [open, shift])

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()

    const effectiveScheduleId =
      scheduleId ?? shift?.relationships?.schedule?.data?.id

    const payload = {
      data: {
        attributes: {
          starts_at: startsAt,
          ends_at: endsAt,
          desired_coverage: parseInt(desiredCoverage, 10) || 1,
          note: note || null,
        },
        relationships: {
          schedule: effectiveScheduleId
            ? { data: { id: effectiveScheduleId, type: 'schedule' as const } }
            : undefined,
        },
      },
    }

    if (isEditing && shift.id) {
      const shiftId = shift.id
      updateShift.mutate(
        { id: shiftId, data: payload },
        {
          onSuccess: () => {
            toast.success(t('shift.updated'))
            void queryClient.invalidateQueries({
              queryKey: getGetShiftsQueryKey(),
            })
            void queryClient.invalidateQueries({
              queryKey: getGetShiftsIdQueryKey(shiftId),
            })
            if (effectiveScheduleId) {
              void queryClient.invalidateQueries({
                queryKey: getGetSchedulesIdQueryKey(effectiveScheduleId),
              })
            }
            onOpenChange(false)
            onSuccess?.()
          },
        },
      )
    } else {
      createShift.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast.success(t('shift.created'))
            void queryClient.invalidateQueries({
              queryKey: getGetShiftsQueryKey(),
            })
            if (effectiveScheduleId) {
              void queryClient.invalidateQueries({
                queryKey: getGetSchedulesIdQueryKey(effectiveScheduleId),
              })
            }
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
            {isEditing ? t('shift.edit') : t('shift.create')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="startsAt">{t('shift.startsAt')}</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endsAt">{t('shift.endsAt')}</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desiredCoverage">
                {t('shift.desiredCoverage')}
              </Label>
              <Input
                id="desiredCoverage"
                type="number"
                min="1"
                value={desiredCoverage}
                onChange={(e) => setDesiredCoverage(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">{t('shift.note')}</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('shift.notePlaceholder')}
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
            <Button type="submit" disabled={isPending || !startsAt || !endsAt}>
              {isPending ? t('actions.saving') : t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
