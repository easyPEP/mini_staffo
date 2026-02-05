# frozen_string_literal: true

module SwaggerComponent
  module Parameters
    module Filtering
      def self.apply(spec, filterable_attributes = [])
        filterable_attributes.each do |attr|
          spec.parameter name: "filter[#{attr}]", in: :query, type: :string, required: false,
                         description: "Filter by #{attr}"
        end
      end
    end
  end
end
