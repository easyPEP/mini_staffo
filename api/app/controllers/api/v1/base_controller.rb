# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::HttpAuthentication::Basic::ControllerMethods
      include ErrorsHandler

      before_action :authenticate_api_user!

      def current_subdomain
        params[:account_subdomain]
      end

      def current_account
        @current_account ||= Account.find_by!(subdomain: current_subdomain)
      end

      def current_user
        @current_user ||= authenticate_with_http_basic do |email, password|
          user = current_account.users.find_by(email: email)
          user if user&.valid_password?(password)
        end
      end

      def current_ability
        @current_ability ||= Ability.new(current_user, current_account)
      end

      private

      def authenticate_api_user!
        raise Errors::Unauthenticated unless current_user
      end

      def render_resource(resource, status: :ok)
        render json: serializer.new(resource, serializer_options), status: status
      end

      def render_resources(resources)
        render json: serializer.new(resources, serializer_options.merge(is_collection: true, meta: pagination_meta(resources)))
      end

      def serializer_options
        options = {}
        options[:include] = jsonapi_include if respond_to?(:jsonapi_include, true) && jsonapi_include.present?
        options
      end

      def save_and_render(decorator, status: :ok)
        if decorator.save
          render_resource(decorator.object, status: status)
        else
          render json: { errors: format_validation_errors(decorator.object) }, status: :unprocessable_content
        end
      end

      def serializer
        "#{controller_name.classify}Serializer".constantize
      end

      def pagination_meta(resources)
        return {} unless resources.respond_to?(:total_count)

        {
          total: resources.total_count,
          pages: resources.total_pages
        }
      end

      def format_validation_errors(resource)
        resource.errors.map do |error|
          {
            status: '422',
            source: { pointer: "/data/attributes/#{error.attribute}" },
            title: 'Invalid Attribute',
            detail: error.full_message
          }
        end
      end
    end
  end
end
