# frozen_string_literal: true

module SwaggerComponent
  module Parameters
    module Including
      def self.apply(spec, relationships: [])
        return if relationships.blank?

        spec.parameter(
          name: 'include',
          getter: :include_parameter,
          in: :query,
          required: false,
          schema: { type: :string },
          description: 'Include related resources in the response ' \
                       '([JSON:API includes](https://jsonapi.org/format/#fetching-includes)).<br><br>' \
                       '**Available relationships:**<br>' \
                       "#{relationships.map { |r| "`#{r}`" }.join(', ')}"
        )
      end
    end
  end
end
