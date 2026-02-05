# frozen_string_literal: true

module ErrorsHandler
  extend ActiveSupport::Concern

  included do
    rescue_from Errors::Unauthenticated, with: :render_unauthenticated
    rescue_from CanCan::AccessDenied, with: :render_forbidden
    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from AASM::InvalidTransition, with: :render_invalid_transition
    rescue_from Errors::ValidationError, with: :render_validation_error
  end

  private

  def render_unauthenticated
    render json: { errors: [{ status: '401', title: 'Unauthenticated', detail: 'Invalid credentials' }] },
           status: :unauthorized
  end

  def render_forbidden(exception)
    render json: { errors: [{ status: '403', title: 'Forbidden', detail: exception.message }] }, status: :forbidden
  end

  def render_not_found(exception)
    render json: { errors: [{ status: '404', title: 'Not Found', detail: exception.message }] }, status: :not_found
  end

  def render_invalid_transition(exception)
    render json: { errors: [{ status: '422', title: 'Invalid Transition', detail: exception.message }] },
           status: :unprocessable_content
  end

  def render_validation_error(exception)
    render json: { errors: [{ status: '422', title: 'Validation Error', detail: exception.message }] },
           status: :unprocessable_content
  end
end
