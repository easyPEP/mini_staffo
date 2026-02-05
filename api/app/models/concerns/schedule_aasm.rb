# frozen_string_literal: true

module ScheduleAasm
  extend ActiveSupport::Concern

  included do
    include AASM

    aasm column: :state do
      state :draft, initial: true
      state :published

      event :aasm_publish do
        transitions from: :draft, to: :published, after: -> { update!(published_at: Time.current) }
      end
    end
  end
end
