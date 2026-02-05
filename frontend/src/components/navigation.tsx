import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { GearIcon, SignOutIcon, UserIcon } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LanguageSwitcher } from '@/components/language-switcher'

export function Navigation() {
  const { t } = useTranslation()
  const { currentUser, logout, isAdmin, isManager } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const role = currentUser?.attributes?.role
  const canSeeUsers = isAdmin || isManager

  const handleLogout = () => {
    logout()
    void navigate({ to: '/login' })
  }

  const closeDropdown = () => setDropdownOpen(false)

  const displayName = [
    currentUser?.attributes?.first_name,
    currentUser?.attributes?.last_name,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link to="/schedules" className="text-lg font-semibold">
          {t('app.name')}
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/schedules"
            className="text-muted-foreground hover:text-foreground [&.active]:text-foreground text-sm"
          >
            {t('nav.schedules')}
          </Link>
          <Link
            to="/shifts"
            className="text-muted-foreground hover:text-foreground [&.active]:text-foreground text-sm"
          >
            {t('nav.shifts')}
          </Link>
          <Link
            to="/applications"
            className="text-muted-foreground hover:text-foreground [&.active]:text-foreground text-sm"
          >
            {t('nav.applications')}
          </Link>
          {canSeeUsers ? (
            <Link
              to="/users"
              className="text-muted-foreground hover:text-foreground [&.active]:text-foreground text-sm"
            >
              {t('nav.users')}
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <UserIcon className="size-4" />
                <span className="hidden sm:inline">{displayName}</span>
                {role ? (
                  <Badge variant="secondary" className="text-xs">
                    {t(`roles.${role}`)}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                <UserIcon className="size-4" />
                {t('nav.profile')}
              </DropdownMenuItem>
              {isAdmin ? (
                <DropdownMenuItem onClick={() => navigate({ to: '/account' })}>
                  <GearIcon className="size-4" />
                  {t('nav.account')}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <LanguageSwitcher onLanguageChange={closeDropdown} />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <SignOutIcon className="size-4" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
