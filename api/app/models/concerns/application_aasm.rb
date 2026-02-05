# frozen_string_literal: true

module ApplicationAasm
  extend ActiveSupport::Concern

  included do
    include AASM

    aasm column: :state do
      state :new, initial: true
      state :applied
      state :assigned
      state :cancelled

      event :aasm_apply do
        transitions from: :new, to: :applied
      end

      event :aasm_assign do
        transitions from: :new, to: :assigned
      end

      event :aasm_accept do
        transitions from: :applied, to: :assigned
      end

      event :aasm_cancel do
        transitions from: :assigned, to: :cancelled
      end

      event :aasm_revoke do
        transitions from: :cancelled, to: :assigned
      end
    end
  end
end
