# frozen_string_literal: true

class UserSerializer < BaseSerializer
  attributes :email, :first_name, :last_name, :role

  attribute :locked_at do |object|
    object.locked_at&.iso8601
  end
end
