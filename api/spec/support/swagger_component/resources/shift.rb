# frozen_string_literal: true

module SwaggerComponent
  module Resources
    module Shift
      ATTRIBUTES = {
        starts_at: { type: :string, format: 'date-time' },
        ends_at: { type: :string, format: 'date-time' },
        desired_coverage: { type: :integer },
        note: { type: :string, nullable: true },
        created_at: { type: :string, format: 'date-time', read_only: true },
        updated_at: { type: :string, format: 'date-time', read_only: true }
      }.freeze

      RELATIONSHIPS = {
        account: { collection: false },
        schedule: { collection: false },
        creator: { collection: false },
        applications: { collection: true }
      }.freeze

      def self.schemas
        base = Builders::BaseResource.new(:shift, attributes_with_details: ATTRIBUTES, relationships: RELATIONSHIPS)
        {}.merge(
          Builders::Resource.build(:shift, base),
          Builders::Resources.build(:shift),
          Builders::PostResource.build(:shift, ATTRIBUTES, required: %i[starts_at ends_at], relationships: [:schedule])
        )
      end
    end
  end
end
