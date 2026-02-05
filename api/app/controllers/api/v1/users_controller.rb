# frozen_string_literal: true

module Api
  module V1
    class UsersController < CommonController
      private

      def common_params
        %i[email first_name last_name role password]
      end
    end
  end
end
