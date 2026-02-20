# frozen_string_literal: true

class ApplicationDecorator < BaseDecorator
  private

  def argument_validations(attrs)
    return unless actor.role == 'staff'
    return if attrs[:user_id].blank? || attrs[:user_id].to_s == actor.id.to_s

    raise Errors::ValidationError, 'Staff can only create applications for themselves'
  end

  def after_assign_attributes(_attrs)
    object.account_id = account.id
    object.creator_id ||= actor.id
  end
end
