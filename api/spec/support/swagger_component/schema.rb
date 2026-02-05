# frozen_string_literal: true

module SwaggerComponent
  module Schema
    def self.all
      {}.merge(
        BaseSchema.definitions,
        Resources::Account.schemas,
        Resources::User.schemas,
        Resources::Schedule.schemas,
        Resources::Shift.schemas,
        Resources::Application.schemas
      )
    end
  end
end
