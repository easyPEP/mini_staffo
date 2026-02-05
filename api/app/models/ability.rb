# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user, account = nil)
    @user = user
    @account = account

    return unless @user && @account

    send(@user.role)
  end

  private

  def admin
    can :manage, Account, id: @account.id
    can :manage, User, account_id: @account.id
    can :manage, Schedule, account_id: @account.id
    can :manage, Shift, account_id: @account.id
    can :manage, Application, account_id: @account.id
  end

  def manager
    can :read, User, account_id: @account.id
    can :manage, Schedule, account_id: @account.id
    can :manage, Shift, account_id: @account.id
    can :manage, Application, account_id: @account.id
  end

  def staff
    can :read, User, id: @user.id
    can :read, Schedule, account_id: @account.id, state: 'published'
    can :read, Shift, account_id: @account.id, schedule: { state: 'published' }
    can :read, Application, account_id: @account.id, user_id: @user.id
    can :create, Application
    can :update, Application, account_id: @account.id, user_id: @user.id
    can :destroy, Application, account_id: @account.id, user_id: @user.id
  end
end
