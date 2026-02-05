# frozen_string_literal: true

module SwaggerComponent
  module Builders
    class BaseResource
      attr_reader :resource_name, :attributes_with_details, :relationships

      def initialize(resource_name, attributes_with_details:, relationships: {})
        @resource_name = resource_name
        @attributes_with_details = attributes_with_details
        @relationships = relationships
      end

      def resource_schema
        props = {}
        attributes_with_details.each do |name, details|
          props[name] = details.slice(:type, :format, :nullable, :enum)
        end

        rel_props = {}
        relationships.each do |name, details|
          ref = details[:collection] ? 'jsonapi_relationships_collection' : 'jsonapi_relationship'
          rel_props[name] = { '$ref': "#/components/schemas/#{ref}" }
        end

        schema = {
          type: :object,
          properties: {
            id: { type: :string },
            type: { type: :string, enum: [resource_name.to_s] },
            attributes: {
              type: :object,
              properties: props
            }
          }
        }

        if rel_props.any?
          schema[:properties][:relationships] = {
            type: :object,
            properties: rel_props
          }
        end

        schema
      end
    end
  end
end
