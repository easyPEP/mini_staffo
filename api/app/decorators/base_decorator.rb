# frozen_string_literal: true

class BaseDecorator
  attr_reader :object, :actor, :account

  def initialize(object, actor, account)
    @object = object
    @actor = actor
    @account = account
  end

  def assign_attributes(attrs, state_action = nil)
    @state_action = state_action
    argument_validations(attrs)
    before_assign_attributes(attrs)
    object.assign_attributes(attrs)
    after_assign_attributes(attrs)
  end

  def save
    return false unless object.valid?

    object.save.tap do |saved|
      if saved
        update_state
        after_save
        object.new_record? ? after_create : after_update
      end
    end
  end

  def destroy
    before_destroy
    object.destroy!
    after_destroy
  end

  private

  def argument_validations(_attrs); end
  def before_assign_attributes(_attrs); end
  def after_assign_attributes(_attrs); end
  def after_save; end
  def after_create; end
  def after_update; end
  def before_destroy; end
  def after_destroy; end

  def update_state
    return if @state_action.blank?

    send("#{@state_action}!")
  end
end
