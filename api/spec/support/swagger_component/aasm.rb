# frozen_string_literal: true

module SwaggerComponent
  def self.aasm_state_names(model)
    model.aasm.states.map { |s| s.name.to_s }
  end

  def self.aasm_event_names(model)
    model.aasm.events.map { |e| e.name.to_s.delete_prefix('aasm_') }
  end
end
