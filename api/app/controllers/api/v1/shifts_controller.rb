# frozen_string_literal: true

module Api
  module V1
    class ShiftsController < CommonController
      private

      def common_params
        %i[schedule starts_at ends_at desired_coverage note]
      end
    end
  end
end
