import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ApplicationItem,
  GetApplicationsParams,
  UserItem,
} from '@/generated/schemas'
import { useGetApplications } from '@/generated/api/applications/applications'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/_authenticated/applications/')({
  component: ApplicationsPage,
})

const columnHelper = createColumnHelper<ApplicationItem>()

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

function ApplicationsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetApplications({
    include: 'user',
  } as GetApplicationsParams)
  const applications = data?.data ?? []
  const includedUsers = new Map(
    data?.included
      ?.filter((r) => r.type === 'user')
      .map((u) => [u.id, u as unknown as UserItem]),
  )

  const columns = [
    columnHelper.accessor((row) => row.id, {
      id: 'id',
      header: () => 'ID',
      cell: (info) => (
        <Link
          to="/applications/$applicationId"
          params={{ applicationId: info.getValue() ?? '' }}
          className="font-medium hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor((row) => row.relationships?.shift?.data?.id, {
      id: 'shift',
      header: () => t('application.shift'),
      cell: (info) => {
        const shiftId = info.getValue()
        return shiftId ? (
          <Link
            to="/shifts/$shiftId"
            params={{ shiftId }}
            className="hover:underline"
          >
            {shiftId}
          </Link>
        ) : (
          '-'
        )
      },
    }),
    columnHelper.accessor((row) => row.relationships?.user?.data?.id, {
      id: 'user',
      header: () => t('application.user'),
      cell: (info) => {
        const userId = info.getValue()
        if (!userId) return '-'
        const user = includedUsers.get(userId)
        const name = user?.attributes
          ? [user.attributes.first_name, user.attributes.last_name]
              .filter(Boolean)
              .join(' ')
          : userId
        return (
          <Link
            to="/users/$userId"
            params={{ userId }}
            className="hover:underline"
          >
            {name}
          </Link>
        )
      },
    }),
    columnHelper.accessor((row) => row.attributes?.state, {
      id: 'state',
      header: () => t('application.state'),
      cell: (info) => {
        const state = info.getValue()
        if (!state) return null
        return (
          <Badge variant={stateBadgeVariant(state)}>
            {t(`states.${state}`)}
          </Badge>
        )
      },
    }),
    columnHelper.accessor((row) => row.attributes?.cancel_reason, {
      id: 'cancelReason',
      header: () => t('application.cancelReason'),
      cell: (info) => info.getValue() ?? '-',
    }),
  ]

  const table = useReactTable({
    data: applications,
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
      <h1 className="mb-6 text-2xl font-bold">{t('nav.applications')}</h1>

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
