import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useGetAccount,
  usePatchAccount,
} from '@/generated/api/accounts/accounts'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/account')({
  component: AccountPage,
})

function AccountPage() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()

  const { data, isLoading } = useGetAccount({}, { query: { enabled: isAdmin } })
  const patchAccount = usePatchAccount()

  const account = data?.data
  const attrs = account?.attributes

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [locale, setLocale] = useState('')
  const [timeZone, setTimeZone] = useState('')

  const startEditing = () => {
    setName(attrs?.name ?? '')
    setLocale(attrs?.locale ?? '')
    setTimeZone(attrs?.time_zone ?? '')
    setIsEditing(true)
  }

  const handleSave = () => {
    patchAccount.mutate(
      {
        data: {
          data: {
            attributes: { name, locale, time_zone: timeZone },
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(t('account.updated'))
          setIsEditing(false)
        },
      },
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">{t('common.notAuthorized')}</p>
      </div>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('account.title')}</h1>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={startEditing}>
            {t('actions.edit')}
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{attrs?.name ?? ''}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-name">{t('account.name')}</Label>
                <Input
                  id="account-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('account.subdomain')}</Label>
                <Input value={attrs?.subdomain ?? ''} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-locale">{t('account.locale')}</Label>
                <Input
                  id="account-locale"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-tz">{t('account.timeZone')}</Label>
                <Input
                  id="account-tz"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={patchAccount.isPending}>
                  {patchAccount.isPending
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
                {t('account.name')}
              </dt>
              <dd>{attrs?.name}</dd>

              <dt className="text-muted-foreground font-medium">
                {t('account.subdomain')}
              </dt>
              <dd>{attrs?.subdomain}</dd>

              <dt className="text-muted-foreground font-medium">
                {t('account.locale')}
              </dt>
              <dd>{attrs?.locale}</dd>

              <dt className="text-muted-foreground font-medium">
                {t('account.timeZone')}
              </dt>
              <dd>{attrs?.time_zone}</dd>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
