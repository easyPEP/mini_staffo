# frozen_string_literal: true

class ScheduleSerializer < BaseSerializer
  attributes :name, :state

  attribute :bop do |object|
    object.bop&.iso8601
  end

  attribute :eop do |object|
    object.eop&.iso8601
  end

  attribute :published_at do |object|
    object.published_at&.iso8601
  end

  belongs_to :creator, serializer: UserSerializer
  has_many :shifts
end
