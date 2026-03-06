# frozen_string_literal: true

module SwaggerComponent
  module Builders
    class Resources
      def self.build(resource_name)
        {
          "#{resource_name}_resources": {
            type: :object,
            properties: {
              data: {
                type: :array,
                items: { '$ref': "#/components/schemas/#{resource_name}_item" }
              },
              included: {
                type: :array,
                items: { '$ref': '#/components/schemas/jsonapi_included_item' }
              },
              meta: { '$ref': '#/components/schemas/jsonapi_meta' }
            }
          }
        }
      end
    end
  end
end
