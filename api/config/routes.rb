# frozen_string_literal: true

Rails.application.routes.draw do
  get 'up' => 'rails/health#show', as: :rails_health_check

  scope 'v1', module: 'api/v1', defaults: { format: 'json' } do
    scope ':account_subdomain' do
      resource :account, only: %i[show update]
      resources :users
      resources :schedules do
        put 'publish' => 'schedules#update', on: :member, defaults: { do: 'publish' }
      end
      resources :shifts
      resources :applications
    end
  end
end
