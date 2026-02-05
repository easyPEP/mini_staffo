# frozen_string_literal: true

require 'rails_helper'

Rails.root.glob('spec/support/swagger_component/**/*.rb').each { |f| require f }

RSpec.configure do |config|
  config.openapi_root = Rails.public_path.join('v1').to_s

  config.openapi_specs = {
    'openapi.json' => {
      openapi: '3.0.1',
      info: {
        title: 'MiniStaffomatic API',
        version: 'v1',
        description: 'A scheduling API'
      },
      paths: {},
      servers: [
        { url: 'http://localhost:3000', description: 'Development' }
      ],
      components: {
        securitySchemes: {
          BasicAuth: {
            type: :http,
            scheme: :basic
          }
        },
        schemas: SwaggerComponent::Schema.all
      }
    }
  }

  config.openapi_format = :json
end
