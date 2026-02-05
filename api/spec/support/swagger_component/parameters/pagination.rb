# frozen_string_literal: true

module SwaggerComponent
  module Parameters
    module Pagination
      def self.apply(spec)
        spec.parameter name: 'page[number]', in: :query, type: :integer, required: false, description: 'Page number'
        spec.parameter name: 'page[size]', in: :query, type: :integer, required: false, description: 'Page size'
      end
    end
  end
end
