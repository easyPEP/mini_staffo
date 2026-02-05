# frozen_string_literal: true

class UserDecorator < BaseDecorator
  private

  def after_assign_attributes(_attrs)
    object.account_id = account.id
  end
end
