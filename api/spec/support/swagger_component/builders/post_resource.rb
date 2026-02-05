# frozen_string_literal: true

module SwaggerComponent
  module Builders
    class PostResource
      def self.build(resource_name, attributes_with_details, required: [], relationships: [])
        props = {}
        attributes_with_details.each do |name, details|
          next if details[:read_only]

          props[name] = details.slice(:type, :format, :nullable, :enum)
        end

        attrs_schema = { type: :object, properties: props }
        attrs_schema[:required] = required if required.any?

        data_props = { attributes: attrs_schema }
        data_required = [:attributes]

        if relationships.any?
          data_props[:relationships] = Builders::Relationships.build(relationships)
          data_required << :relationships
        end

        {
          "#{resource_name}_post_resource": {
            type: :object,
            required: [:data],
            properties: {
              data: {
                type: :object,
                required: data_required,
                properties: data_props
              }
            }
          }
        }
      end
    end
  end
end
