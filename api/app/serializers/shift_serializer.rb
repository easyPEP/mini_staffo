# frozen_string_literal: true

class ShiftSerializer < BaseSerializer
  attributes :desired_coverage, :note

  attribute :starts_at do |object|
    object.starts_at&.iso8601
  end

  attribute :ends_at do |object|
    object.ends_at&.iso8601
  end

  belongs_to :schedule
  belongs_to :creator, serializer: UserSerializer
  has_many :applications
end
