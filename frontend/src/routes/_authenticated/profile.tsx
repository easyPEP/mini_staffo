import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { usePatchUsersId } from '@/generated/api/users/users'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()
  const { currentUser, refreshCurrentUser } = useAuth()

  const attrs = currentUser?.attributes
  const userId = currentUser?.id

  const patchUser = usePatchUsersId()

  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const startEditing = () => {
    setFirstName(attrs?.first_name ?? '')
    setLastName(attrs?.last_name ?? '')
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!userId) return

    patchUser.mutate(
      {
        id: userId,
        data: {
          data: {
            attributes: {
              email: attrs?.email ?? '',
              first_name: firstName,
              last_name: lastName,
            },
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(t('profile.updated'))
          setIsEditing(false)
          void refreshCurrentUser()
        },
      },
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={startEditing}>
            {t('actions.edit')}
          </Button>
        ) : null}
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="first-name">{t('user.firstName')}</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="last-name">{t('user.lastName')}</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('user.email')}</Label>
                <Input value={attrs?.email ?? ''} disabled />
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
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
