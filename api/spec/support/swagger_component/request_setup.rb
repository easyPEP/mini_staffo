# frozen_string_literal: true

module SwaggerComponent
  module RequestSetup
    def self.build(spec)
      spec.security [{ BasicAuth: [] }]
      spec.consumes 'application/json'
      spec.produces 'application/json'
    end
  end
end
