import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { GetShiftsParams, ScheduleItem, ShiftItem } from '@/generated/schemas'
import { useGetShifts } from '@/generated/api/shifts/shifts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/_authenticated/shifts/')({
  component: ShiftsPage,
})

const columnHelper = createColumnHelper<ShiftItem>()

function ShiftsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetShifts({
    include: 'schedule',
  } as GetShiftsParams)
  const shifts = data?.data ?? []
  const includedSchedules = new Map(
    data?.included
      ?.filter((r) => r.type === 'schedule')
      .map((s) => [s.id, s as unknown as ScheduleItem]),
  )

  const columns = [
    columnHelper.accessor((row) => row.id, {
      id: 'id',
      header: () => 'ID',
      cell: (info) => (
        <Link
          to="/shifts/$shiftId"
          params={{ shiftId: info.getValue() ?? '' }}
          className="font-medium hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor((row) => row.relationships?.schedule?.data?.id, {
      id: 'schedule',
      header: () => t('shift.schedule'),
      cell: (info) => {
        const scheduleId = info.getValue()
        if (!scheduleId) return '-'
        const schedule = includedSchedules.get(scheduleId)
        return (
          <Link
            to="/schedules/$scheduleId"
            params={{ scheduleId }}
            className="hover:underline"
          >
            {schedule?.attributes?.name ?? scheduleId}
          </Link>
        )
      },
    }),
    columnHelper.accessor((row) => row.attributes?.starts_at, {
      id: 'startsAt',
      header: () => t('shift.startsAt'),
    }),
    columnHelper.accessor((row) => row.attributes?.ends_at, {
      id: 'endsAt',
      header: () => t('shift.endsAt'),
    }),
    columnHelper.accessor((row) => row.attributes?.desired_coverage, {
      id: 'desiredCoverage',
      header: () => t('shift.desiredCoverage'),
    }),
    columnHelper.accessor((row) => row.attributes?.note, {
      id: 'note',
      header: () => t('shift.note'),
      cell: (info) => (
        <span className="max-w-48 truncate">{info.getValue() ?? '-'}</span>
      ),
    }),
  ]

  const table = useReactTable({
    data: shifts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('nav.shifts')}</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('common.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
