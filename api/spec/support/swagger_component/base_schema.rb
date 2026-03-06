# frozen_string_literal: true

module SwaggerComponent
  module BaseSchema
    def self.definitions # rubocop:disable Metrics/MethodLength
      {
        jsonapi_error: {
          type: :object,
          properties: {
            status: { type: :string },
            source: {
              type: :object,
              properties: {
                pointer: { type: :string }
              }
            },
            title: { type: :string },
            detail: { type: :string }
          }
        },
        jsonapi_errors: {
          type: :object,
          properties: {
            errors: {
              type: :array,
              items: { '$ref': '#/components/schemas/jsonapi_error' }
            }
          }
        },
        jsonapi_links: {
          type: :object,
          properties: {
            self: { type: :string },
            first: { type: :string },
            prev: { type: :string, nullable: true },
            next: { type: :string, nullable: true },
            last: { type: :string }
          }
        },
        jsonapi_meta: {
          type: :object,
          properties: {
            total: { type: :integer },
            pages: { type: :integer }
          }
        },
        jsonapi_included_item: {
          type: :object,
          properties: {
            id: { type: :string },
            type: { type: :string },
            attributes: { type: :object, additionalProperties: true },
            relationships: { type: :object, additionalProperties: true }
          }
        },
        jsonapi_relationship: {
          type: :object,
          properties: {
            data: {
              type: :object,
              properties: {
                id: { type: :string },
                type: { type: :string }
              }
            }
          }
        },
        jsonapi_relationships_collection: {
          type: :object,
          properties: {
            data: {
              type: :array,
              items: {
                type: :object,
                properties: {
                  id: { type: :string },
                  type: { type: :string }
                }
              }
            }
          }
        }
      }
    end
  end
end
