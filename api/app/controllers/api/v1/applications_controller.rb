# frozen_string_literal: true

module Api
  module V1
    class ApplicationsController < CommonController
      private

      def common_params
        %i[shift user schedule cancel_reason]
      end
    end
  end
end
