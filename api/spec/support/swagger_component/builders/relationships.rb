# frozen_string_literal: true

module SwaggerComponent
  module Builders
    module Relationships
      def self.build(relationship_names)
        props = {}
        relationship_names.each do |name|
          type = name.to_s
          collection = type == type.pluralize

          data_schema = {
            type: :object,
            properties: {
              id: { type: :string },
              type: { type: :string, enum: [collection ? type.singularize : type] }
            },
            required: %i[id type]
          }

          props[name] = if collection
                          { type: :object, properties: { data: { type: :array, items: data_schema } } }
                        else
                          { type: :object, properties: { data: data_schema } }
                        end
        end

        { type: :object, properties: props }
      end
    end
  end
end
