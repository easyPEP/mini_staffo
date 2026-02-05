# frozen_string_literal: true

module Api
  module V1
    class CommonController < BaseController
      include JSONAPI::Pagination
      include JSONAPI::Filtering
      include JSONAPI::Deserialization

      def index
        authorize! :read, model_class
        resources = filtered_resources
        resources = paginate(resources)
        render_resources(resources)
      end

      def show
        resource = find_resource
        authorize! :read, resource
        render_resource(resource)
      end

      def create
        resource = collection.new
        authorize! :create, resource
        dec = decorator_class.new(resource, current_user, current_account)
        dec.assign_attributes(deserialize_params, state_action)
        save_and_render(dec, status: :created)
      end

      def update
        resource = find_resource
        authorize! :update, resource
        dec = decorator_class.new(resource, current_user, current_account)
        attrs = params.key?(:data) ? deserialize_params : {}
        dec.assign_attributes(attrs, state_action)
        save_and_render(dec)
      end

      def destroy
        resource = find_resource
        authorize! :destroy, resource
        dec = decorator_class.new(resource, current_user, current_account)
        dec.destroy
        head :no_content
      end

      private

      def collection
        current_account.send(controller_name)
      end

      def find_resource
        collection.find(params[:id])
      end

      def filtered_resources
        collection.accessible_by(current_ability).ransack(filter_params).result
      end

      def filter_params
        params.fetch(:filter, {}).permit!
      end

      def model_class
        controller_name.classify.constantize
      end

      def decorator_class
        "#{controller_name.classify}Decorator".constantize
      end

      def deserialize_params
        jsonapi_deserialize(
          params.permit!.to_h,
          only: common_params
        ).with_indifferent_access
      end

      def common_params
        []
      end

      def state_action
        params[:do]
      end

      def paginate(resources)
        resources.page(page_params[:number]).per(page_params[:size])
      end

      def page_params
        params.fetch(:page, {}).permit(:number, :size)
      end
    end
  end
end
