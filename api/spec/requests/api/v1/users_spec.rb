# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Users API', type: :request do
  let(:account) { create(:account) }
  let(:user) { account.users.find_by(role: 'admin') }
  let(:account_subdomain) { account.subdomain }
  let(:Authorization) { ActionController::HttpAuthentication::Basic.encode_credentials(user.email, 'welcome') }

  path '/v1/{account_subdomain}/users' do
    parameter name: :account_subdomain, in: :path, type: :string

    get 'Lists users' do
      tags 'Users'
      SwaggerComponent::RequestSetup.build(self)
      SwaggerComponent::Parameters::Pagination.apply(self)
      SwaggerComponent::Parameters::Filtering.apply(self, attributes: User.ransackable_attributes)

      response '200', 'users found' do
        schema '$ref': '#/components/schemas/user_resources'

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data.length).to eq(1)
        end
      end
    end

    post 'Creates a user' do
      tags 'Users'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/user_post_resource' }

      response '201', 'user created' do
        schema '$ref': '#/components/schemas/user_resource'

        let(:body) do
          {
            data: {
              type: 'user',
              attributes: {
                email: 'new@example.com',
                first_name: 'New',
                last_name: 'User',
                role: 'staff',
                password: 'welcome'
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['type']).to eq('user')
          expect(data['attributes']['email']).to eq('new@example.com')
        end
      end

      response '422', 'invalid request' do
        schema '$ref': '#/components/schemas/jsonapi_errors'

        let(:body) do
          {
            data: {
              type: 'user',
              attributes: {
                email: nil,
                first_name: nil,
                last_name: nil
              }
            }
          }
        end

        run_test!
      end
    end
  end

  path '/v1/{account_subdomain}/users/{id}' do
    parameter name: :account_subdomain, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    let(:existing_user) { create(:user, account: account) }
    let(:id) { existing_user.id }

    get 'Shows a user' do
      tags 'Users'
      SwaggerComponent::RequestSetup.build(self)

      response '200', 'user found' do
        schema '$ref': '#/components/schemas/user_resource'

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['id']).to eq(existing_user.id.to_s)
        end
      end
    end

    patch 'Updates a user' do
      tags 'Users'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/user_post_resource' }

      response '200', 'user updated' do
        schema '$ref': '#/components/schemas/user_resource'

        let(:body) do
          {
            data: {
              type: 'user',
              attributes: {
                first_name: 'Updated'
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['attributes']['first_name']).to eq('Updated')
        end
      end
    end

    delete 'Deletes a user' do
      tags 'Users'
      SwaggerComponent::RequestSetup.build(self)

      response '204', 'user deleted' do
        run_test!
      end
    end
  end
end
