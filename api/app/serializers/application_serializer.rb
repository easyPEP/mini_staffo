# frozen_string_literal: true

class ApplicationSerializer < BaseSerializer
  attributes :state

  attribute :cancel_reason, if: proc { |record| record.state == 'cancelled' }

  belongs_to :account
  belongs_to :shift
  belongs_to :user, serializer: UserSerializer
  belongs_to :schedule
  belongs_to :creator, serializer: UserSerializer
end
