# frozen_string_literal: true

class Schedule < ApplicationRecord
  include ScheduleAasm

  belongs_to :account
  belongs_to :creator, class_name: 'User'
  has_many :shifts, dependent: :destroy
  has_many :applications, dependent: :destroy

  validates :bop, presence: true

  def eop
    bop + 6.days
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[creator_id name bop state published_at created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[creator shifts applications]
  end
end
