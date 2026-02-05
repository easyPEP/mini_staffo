# frozen_string_literal: true

module SwaggerComponent
  module Resources
    module Account
      ATTRIBUTES = {
        name: { type: :string },
        subdomain: { type: :string },
        locale: { type: :string },
        time_zone: { type: :string },
        created_at: { type: :string, format: 'date-time', read_only: true },
        updated_at: { type: :string, format: 'date-time', read_only: true }
      }.freeze

      RELATIONSHIPS = {
        users: { collection: true },
        schedules: { collection: true }
      }.freeze

      def self.schemas
        base = Builders::BaseResource.new(:account, attributes_with_details: ATTRIBUTES, relationships: RELATIONSHIPS)
        {}.merge(
          Builders::Resource.build(:account, base),
          Builders::PostResource.build(:account, ATTRIBUTES, required: [:name])
        )
      end
    end
  end
end
