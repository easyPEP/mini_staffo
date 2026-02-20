# frozen_string_literal: true

class ScheduleDecorator < BaseDecorator
  private

  def after_assign_attributes(_attrs)
    object.account_id = account.id
    object.creator_id ||= actor.id
  end
end
