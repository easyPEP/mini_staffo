# frozen_string_literal: true

module Api
  module V1
    class AccountsController < CommonController
      private

      def find_resource
        current_account
      end

      def common_params
        %i[name locale time_zone]
      end
    end
  end
end
