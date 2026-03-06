# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Accounts API', type: :request do
  let(:account) { create(:account) }
  let(:user) { account.users.find_by(role: 'admin') }
  let(:account_subdomain) { account.subdomain }
  let(:Authorization) { ActionController::HttpAuthentication::Basic.encode_credentials(user.email, 'welcome') }

  path '/v1/{account_subdomain}/account' do
    parameter name: :account_subdomain, in: :path, type: :string

    get 'Shows the account' do
      tags 'Accounts'
      SwaggerComponent::RequestSetup.build(self)
      SwaggerComponent::Parameters::Including.apply(self, relationships: %w[users schedules])

      response '200', 'account found' do
        schema '$ref': '#/components/schemas/account_resource'

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['id']).to eq(account.id.to_s)
          expect(data['attributes']['subdomain']).to eq(account.subdomain)
        end
      end
    end

    patch 'Updates the account' do
      tags 'Accounts'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/account_post_resource' }

      response '200', 'account updated' do
        schema '$ref': '#/components/schemas/account_resource'

        let(:body) do
          {
            data: {
              type: 'account',
              attributes: {
                name: 'Updated Company Name'
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['attributes']['name']).to eq('Updated Company Name')
        end
      end
    end
  end
end
