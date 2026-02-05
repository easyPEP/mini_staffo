# frozen_string_literal: true

module Api
  module V1
    class SchedulesController < CommonController
      private

      def common_params
        %i[name bop]
      end
    end
  end
end
