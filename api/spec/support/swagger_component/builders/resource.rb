# frozen_string_literal: true

module SwaggerComponent
  module Builders
    class Resource
      def self.build(resource_name, base_resource)
        {
          "#{resource_name}_resource": {
            type: :object,
            properties: {
              data: { '$ref': "#/components/schemas/#{resource_name}_item" }
            }
          },
          "#{resource_name}_item": base_resource.resource_schema
        }
      end
    end
  end
end
