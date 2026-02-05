import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { PlusIcon } from '@phosphor-icons/react'
import type { ScheduleItem } from '@/generated/schemas'
import { useGetSchedules } from '@/generated/api/schedules/schedules'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScheduleFormDialog } from '@/components/schedule-form-dialog'

export const Route = createFileRoute('/_authenticated/schedules/')({
  component: SchedulesPage,
})

const columnHelper = createColumnHelper<ScheduleItem>()

function SchedulesPage() {
  const { t } = useTranslation()
  const { isAdmin, isManager } = useAuth()
  const { data, isLoading } = useGetSchedules()
  const schedules = data?.data ?? []

  const canManageSchedules = isAdmin || isManager
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const columns = [
    columnHelper.accessor((row) => row.attributes?.name, {
      id: 'name',
      header: () => t('schedule.name'),
      cell: (info) => (
        <Link
          to="/schedules/$scheduleId"
          params={{ scheduleId: info.row.original.id ?? '' }}
          className="font-medium hover:underline"
        >
          {info.getValue() ?? '-'}
        </Link>
      ),
    }),
    columnHelper.accessor((row) => row.attributes?.bop, {
      id: 'bop',
      header: () => t('schedule.bop'),
    }),
    columnHelper.accessor((row) => row.attributes?.eop, {
      id: 'eop',
      header: () => t('schedule.eop'),
    }),
    columnHelper.accessor((row) => row.attributes?.state, {
      id: 'state',
      header: () => t('schedule.state'),
      cell: (info) => {
        const state = info.getValue()
        if (!state) return null
        return (
          <Badge variant={state === 'published' ? 'default' : 'secondary'}>
            {t(`states.${state}`)}
          </Badge>
        )
      },
    }),
    columnHelper.accessor((row) => row.attributes?.created_at, {
      id: 'createdAt',
      header: () => t('schedule.createdAt'),
    }),
  ]

  const table = useReactTable({
    data: schedules,
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.schedules')}</h1>
        {canManageSchedules ? (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon className="size-4" />
            {t('schedule.create')}
          </Button>
        ) : null}
      </div>

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

      <ScheduleFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
