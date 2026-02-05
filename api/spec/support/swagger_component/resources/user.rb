# frozen_string_literal: true

module SwaggerComponent
  module Resources
    module User
      ATTRIBUTES = {
        email: { type: :string },
        first_name: { type: :string },
        last_name: { type: :string },
        role: { type: :string, enum: %w[staff manager admin] },
        locked_at: { type: :string, format: 'date-time', nullable: true, read_only: true },
        created_at: { type: :string, format: 'date-time', read_only: true },
        updated_at: { type: :string, format: 'date-time', read_only: true }
      }.freeze

      RELATIONSHIPS = {
        account: { collection: false }
      }.freeze

      def self.schemas
        base = Builders::BaseResource.new(:user, attributes_with_details: ATTRIBUTES, relationships: RELATIONSHIPS)
        {}.merge(
          Builders::Resource.build(:user, base),
          Builders::Resources.build(:user),
          Builders::PostResource.build(:user, ATTRIBUTES, required: %i[email first_name last_name])
        )
      end
    end
  end
end
