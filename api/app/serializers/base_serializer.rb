# frozen_string_literal: true

class BaseSerializer
  include JSONAPI::Serializer

  attribute :created_at do |object|
    object.created_at&.iso8601
  end

  attribute :updated_at do |object|
    object.updated_at&.iso8601
  end
end
