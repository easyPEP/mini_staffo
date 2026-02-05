import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { useGetUsersId, usePatchUsersId } from '@/generated/api/users/users'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetailPage,
})

function UserDetailPage() {
  const { t } = useTranslation()
  const { userId } = Route.useParams()
  const { isAdmin } = useAuth()

  const { data, isLoading } = useGetUsersId(userId)
  const patchUser = usePatchUsersId()

  const user = data?.data
  const attrs = user?.attributes

  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')

  const startEditing = () => {
    setFirstName(attrs?.first_name ?? '')
    setLastName(attrs?.last_name ?? '')
    setRole(attrs?.role ?? 'staff')
    setIsEditing(true)
  }

  const handleSave = () => {
    patchUser.mutate(
      {
        id: userId,
        data: {
          data: {
            attributes: {
              email: attrs?.email ?? '',
              first_name: firstName,
              last_name: lastName,
              role: role as 'staff' | 'manager' | 'admin',
            },
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(t('user.updated'))
          setIsEditing(false)
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
          to="/users"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeftIcon className="size-4" />
          {t('actions.back')}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {attrs?.first_name} {attrs?.last_name}
          </h1>
          {isAdmin && !isEditing ? (
            <Button variant="outline" size="sm" onClick={startEditing}>
              {t('actions.edit')}
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>
              {attrs?.first_name} {attrs?.last_name}
            </span>
            {attrs?.role ? (
              <Badge variant="secondary">{t(`roles.${attrs.role}`)}</Badge>
            ) : null}
            {attrs?.locked_at ? (
              <Badge variant="destructive">{t('user.locked')}</Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-first-name">{t('user.firstName')}</Label>
                <Input
                  id="edit-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-last-name">{t('user.lastName')}</Label>
                <Input
                  id="edit-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('user.email')}</Label>
                <Input value={attrs?.email ?? ''} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-role">{t('user.role')}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">{t('roles.staff')}</SelectItem>
                    <SelectItem value="manager">
                      {t('roles.manager')}
                    </SelectItem>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={patchUser.isPending}>
                  {patchUser.isPending
                    ? t('actions.saving')
                    : t('actions.save')}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t('actions.cancel')}
                </Button>
              </div>
            </>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              <dt className="text-muted-foreground font-medium">
                {t('user.firstName')}
              </dt>
              <dd>{attrs?.first_name}</dd>

              <dt className="text-muted-foreground font-medium">
                {t('user.lastName')}
              </dt>
              <dd>{attrs?.last_name}</dd>

              <dt className="text-muted-foreground font-medium">
                {t('user.email')}
              </dt>
              <dd>{attrs?.email}</dd>

              <dt className="text-muted-foreground font-medium">
                {t('user.role')}
              </dt>
              <dd>{attrs?.role ? t(`roles.${attrs.role}`) : ''}</dd>

              <dt className="text-muted-foreground font-medium">
                {t('user.lockedAt')}
              </dt>
              <dd>
                {attrs?.locked_at ? (
                  <Badge variant="destructive">{t('user.locked')}</Badge>
                ) : (
                  t('user.active')
                )}
              </dd>

              <dt className="text-muted-foreground font-medium">
                {t('user.createdAt')}
              </dt>
              <dd>{attrs?.created_at}</dd>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
