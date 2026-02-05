# frozen_string_literal: true

class Shift < ApplicationRecord
  belongs_to :account
  belongs_to :schedule
  belongs_to :creator, class_name: 'User'
  has_many :applications, dependent: :destroy

  validates :starts_at, presence: true
  validates :ends_at, presence: true
  validates :desired_coverage, presence: true, numericality: { greater_than: 0 }
  validate :ends_at_after_starts_at

  def full?
    applications.assigned.count >= desired_coverage
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[starts_at ends_at desired_coverage note published_at created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[account schedule creator applications]
  end

  private

  def ends_at_after_starts_at
    return if starts_at.blank? || ends_at.blank?

    errors.add(:ends_at, 'must be after starts_at') if ends_at <= starts_at
  end
end
