# frozen_string_literal: true

class Application < ApplicationRecord
  include ApplicationAasm

  belongs_to :account
  belongs_to :shift
  belongs_to :user
  belongs_to :schedule
  belongs_to :creator, class_name: 'User'

  scope :assigned, -> { where(state: 'assigned') }

  def self.ransackable_attributes(_auth_object = nil)
    %w[shift_id user_id schedule_id creator_id state cancel_reason created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[shift user schedule creator]
  end
end
