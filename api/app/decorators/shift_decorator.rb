# frozen_string_literal: true

class ShiftDecorator < BaseDecorator
  private

  def after_assign_attributes(_attrs)
    object.account_id = account.id
    object.creator_id ||= actor.id
  end
end
