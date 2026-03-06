# frozen_string_literal: true

module SwaggerComponent
  module Parameters
    module Filtering
      def self.apply(spec, attributes: [], scopes: [])
        if attributes.present?
          spec.parameter(
            name: 'filter[{attribute}_{predicate}]',
            in: :query,
            required: false,
            schema: { type: :string },
            description: 'Filter by attribute using Ransack predicates.<br><br>' \
                         '**Available attributes:**<br>' \
                         "#{attributes.map { |attr| "`#{attr}`" }.join(', ')}<br><br>" \
                         '**Common predicates:**<br>' \
                         '`eq`, `not_eq`, `matches`, `lt`, `lteq`, `gt`, `gteq`, `in`, `not_in`, `cont`, `start`, `end`, `null`, `not_null`<br><br>' \
                         '[Full list of predicates](https://activerecord-hackery.github.io/ransack/getting-started/using-predicates/)'
          )
        end

        return if scopes.blank?

        spec.parameter(
          name: 'filter[{scope}]',
          in: :query,
          required: false,
          schema: { type: :string },
          description: 'Filter by scope.<br><br>' \
                       '**Available scopes:**<br>' \
                       "#{scopes.map { |scope| "`#{scope}`" }.join(', ')}"
        )
      end
    end
  end
end
