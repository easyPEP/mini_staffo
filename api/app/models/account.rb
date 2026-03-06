# frozen_string_literal: true

class Account < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :schedules, dependent: :destroy
  has_many :shifts, dependent: :destroy
  has_many :applications, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true,
                        format: { with: /\A[a-z0-9-]+\z/, message: 'only allows lowercase letters, numbers, and hyphens' }

  def self.ransackable_attributes(_auth_object = nil)
    %w[name subdomain locale time_zone created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[users schedules]
  end
end
