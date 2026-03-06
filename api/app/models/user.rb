# frozen_string_literal: true

class User < ApplicationRecord
  devise :database_authenticatable, :recoverable,
         authentication_keys: %i[email account_id]

  belongs_to :account
  has_many :schedules, foreign_key: :creator_id, dependent: :destroy, inverse_of: :creator
  has_many :applications, dependent: :destroy

  validates :email, presence: true, uniqueness: { scope: :account_id }
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :role, presence: true, inclusion: { in: %w[staff manager admin] }

  def self.ransackable_attributes(_auth_object = nil)
    %w[email first_name last_name role locked_at created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[schedules applications]
  end
end
