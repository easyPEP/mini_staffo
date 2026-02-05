import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, GlobeIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
] as const

type LanguageSwitcherProps = {
  onLanguageChange?: () => void
}

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const currentLanguage = i18n.language

  const handleLanguageChange = (languageCode: string) => {
    void i18n.changeLanguage(languageCode)
    setOpen(false)
    onLanguageChange?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
      >
        <GlobeIcon className="size-4" />
        {t('language.title')}
      </DropdownMenuItem>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('language.title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {LANGUAGES.map((language) => (
            <Button
              key={language.code}
              variant={
                currentLanguage === language.code ? 'default' : 'outline'
              }
              className="justify-between"
              onClick={() => handleLanguageChange(language.code)}
            >
              <span>{language.nativeName}</span>
              {currentLanguage === language.code && (
                <CheckIcon className="size-4" />
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
