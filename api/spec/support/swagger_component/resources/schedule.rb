# frozen_string_literal: true

module SwaggerComponent
  module Resources
    module Schedule
      ATTRIBUTES = {
        name: { type: :string, nullable: true },
        bop: { type: :string, format: :date },
        eop: { type: :string, format: :date, read_only: true },
        state: { type: :string, enum: SwaggerComponent.aasm_state_names(::Schedule), read_only: true },
        published_at: { type: :string, format: 'date-time', nullable: true, read_only: true },
        created_at: { type: :string, format: 'date-time', read_only: true },
        updated_at: { type: :string, format: 'date-time', read_only: true }
      }.freeze

      RELATIONSHIPS = {
        account: { collection: false },
        creator: { collection: false },
        shifts: { collection: true }
      }.freeze

      def self.schemas
        base = Builders::BaseResource.new(:schedule, attributes_with_details: ATTRIBUTES, relationships: RELATIONSHIPS)
        {}.merge(
          Builders::Resource.build(:schedule, base),
          Builders::Resources.build(:schedule),
          Builders::PostResource.build(:schedule, ATTRIBUTES, required: [:bop])
        )
      end
    end
  end
end
