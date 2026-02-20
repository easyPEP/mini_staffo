# frozen_string_literal: true

module SwaggerComponent
  module Resources
    module Application
      ATTRIBUTES = {
        state: { type: :string, enum: SwaggerComponent.aasm_state_names(::Application), read_only: true },
        cancel_reason: { type: :string, nullable: true },
        created_at: { type: :string, format: 'date-time', read_only: true },
        updated_at: { type: :string, format: 'date-time', read_only: true }
      }.freeze

      RELATIONSHIPS = {
        account: { collection: false },
        shift: { collection: false },
        user: { collection: false },
        schedule: { collection: false },
        creator: { collection: false }
      }.freeze

      def self.schemas
        base = Builders::BaseResource.new(:application, attributes_with_details: ATTRIBUTES,
                                                        relationships: RELATIONSHIPS)
        {}.merge(
          Builders::Resource.build(:application, base),
          Builders::Resources.build(:application),
          Builders::PostResource.build(:application, ATTRIBUTES, relationships: %i[shift user schedule])
        )
      end
    end
  end
end
