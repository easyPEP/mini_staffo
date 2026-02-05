import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { UserItem } from '@/generated/schemas'
import { useGetUsers } from '@/generated/api/users/users'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
})

const columnHelper = createColumnHelper<UserItem>()

function UsersPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetUsers()
  const users = data?.data ?? []

  const columns = [
    columnHelper.accessor(
      (row) =>
        [row.attributes?.first_name, row.attributes?.last_name]
          .filter(Boolean)
          .join(' '),
      {
        id: 'name',
        header: () => t('user.name'),
        cell: (info) => (
          <Link
            to="/users/$userId"
            params={{ userId: info.row.original.id ?? '' }}
            className="font-medium hover:underline"
          >
            {info.getValue()}
          </Link>
        ),
      },
    ),
    columnHelper.accessor((row) => row.attributes?.email, {
      id: 'email',
      header: () => t('user.email'),
    }),
    columnHelper.accessor((row) => row.attributes?.role, {
      id: 'role',
      header: () => t('user.role'),
      cell: (info) => {
        const role = info.getValue()
        return role ? (
          <Badge variant="secondary">{t(`roles.${role}`)}</Badge>
        ) : null
      },
    }),
    columnHelper.accessor((row) => row.attributes?.locked_at, {
      id: 'locked',
      header: () => t('user.lockedAt'),
      cell: (info) =>
        info.getValue() ? (
          <Badge variant="destructive">{t('user.locked')}</Badge>
        ) : (
          <span className="text-muted-foreground">{t('user.active')}</span>
        ),
    }),
  ]

  const table = useReactTable({
    data: users,
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
      <h1 className="mb-6 text-2xl font-bold">{t('nav.users')}</h1>

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
