# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Shifts API', type: :request do
  let(:account) { create(:account) }
  let(:user) { account.users.find_by(role: 'admin') }
  let(:account_subdomain) { account.subdomain }
  let(:Authorization) { ActionController::HttpAuthentication::Basic.encode_credentials(user.email, 'welcome') }
  let(:schedule) { create(:schedule, account: account, creator: user) }

  path '/v1/{account_subdomain}/shifts' do
    parameter name: :account_subdomain, in: :path, type: :string

    get 'Lists shifts' do
      tags 'Shifts'
      SwaggerComponent::RequestSetup.build(self)
      SwaggerComponent::Parameters::Pagination.apply(self)
      SwaggerComponent::Parameters::Filtering.apply(self, attributes: Shift.ransackable_attributes)
      SwaggerComponent::Parameters::Including.apply(self, relationships: %w[schedule creator applications])

      response '200', 'shifts found' do
        schema '$ref': '#/components/schemas/shift_resources'

        let!(:shift) { create(:shift, account: account, schedule: schedule, creator: user) }

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data.length).to eq(1)
        end
      end
    end

    post 'Creates a shift' do
      tags 'Shifts'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/shift_post_resource' }

      response '201', 'shift created' do
        schema '$ref': '#/components/schemas/shift_resource'

        let(:body) do
          {
            data: {
              type: 'shift',
              attributes: {
                starts_at: 1.day.from_now.beginning_of_day.change(hour: 9).iso8601,
                ends_at: 1.day.from_now.beginning_of_day.change(hour: 17).iso8601,
                desired_coverage: 1
              },
              relationships: {
                schedule: { data: { type: 'schedule', id: schedule.id.to_s } }
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['type']).to eq('shift')
          expect(data['relationships']['schedule']['data']['id']).to eq(schedule.id.to_s)
        end
      end

      response '422', 'invalid request' do
        schema '$ref': '#/components/schemas/jsonapi_errors'

        let(:body) do
          {
            data: {
              type: 'shift',
              attributes: {
                starts_at: nil,
                ends_at: nil,
                desired_coverage: nil
              },
              relationships: {
                schedule: { data: { type: 'schedule', id: schedule.id.to_s } }
              }
            }
          }
        end

        run_test!
      end
    end
  end

  path '/v1/{account_subdomain}/shifts/{id}' do
    parameter name: :account_subdomain, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    let(:shift) { create(:shift, account: account, schedule: schedule, creator: user) }
    let(:id) { shift.id }

    get 'Shows a shift' do
      tags 'Shifts'
      SwaggerComponent::RequestSetup.build(self)
      SwaggerComponent::Parameters::Including.apply(self, relationships: %w[schedule creator applications])

      response '200', 'shift found' do
        schema '$ref': '#/components/schemas/shift_resource'

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['id']).to eq(shift.id.to_s)
        end
      end
    end

    patch 'Updates a shift' do
      tags 'Shifts'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/shift_post_resource' }

      response '200', 'shift updated' do
        schema '$ref': '#/components/schemas/shift_resource'

        let(:body) do
          {
            data: {
              type: 'shift',
              attributes: {
                desired_coverage: 3
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['attributes']['desired_coverage']).to eq(3)
        end
      end
    end

    delete 'Deletes a shift' do
      tags 'Shifts'
      SwaggerComponent::RequestSetup.build(self)

      response '204', 'shift deleted' do
        run_test!
      end
    end
  end
end
