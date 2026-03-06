# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Schedules API', type: :request do
  let(:account) { create(:account) }
  let(:user) { account.users.find_by(role: 'admin') }
  let(:account_subdomain) { account.subdomain }
  let(:Authorization) { ActionController::HttpAuthentication::Basic.encode_credentials(user.email, 'welcome') }

  path '/v1/{account_subdomain}/schedules' do
    parameter name: :account_subdomain, in: :path, type: :string

    get 'Lists schedules' do
      tags 'Schedules'
      SwaggerComponent::RequestSetup.build(self)
      SwaggerComponent::Parameters::Pagination.apply(self)
      SwaggerComponent::Parameters::Filtering.apply(self, attributes: Schedule.ransackable_attributes)

      response '200', 'schedules found' do
        schema '$ref': '#/components/schemas/schedule_resources'

        let!(:schedule) { create(:schedule, account: account, creator: user) }

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data.length).to eq(1)
        end
      end
    end

    post 'Creates a schedule' do
      tags 'Schedules'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/schedule_post_resource' }

      response '201', 'schedule created' do
        schema '$ref': '#/components/schemas/schedule_resource'

        let(:body) do
          {
            data: {
              type: 'schedule',
              attributes: {
                name: 'Week 1',
                bop: Time.zone.today.beginning_of_week.iso8601
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['type']).to eq('schedule')
          expect(data['attributes']['name']).to eq('Week 1')
        end
      end

      response '422', 'invalid request' do
        schema '$ref': '#/components/schemas/jsonapi_errors'

        let(:body) do
          {
            data: {
              type: 'schedule',
              attributes: {
                bop: nil
              }
            }
          }
        end

        run_test!
      end
    end
  end

  path '/v1/{account_subdomain}/schedules/{id}' do
    parameter name: :account_subdomain, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    let(:schedule) { create(:schedule, account: account, creator: user) }
    let(:id) { schedule.id }

    get 'Shows a schedule' do
      tags 'Schedules'
      SwaggerComponent::RequestSetup.build(self)

      response '200', 'schedule found' do
        schema '$ref': '#/components/schemas/schedule_resource'

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['id']).to eq(schedule.id.to_s)
        end
      end
    end

    patch 'Updates a schedule' do
      tags 'Schedules'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/schedule_post_resource' }

      response '200', 'schedule updated' do
        schema '$ref': '#/components/schemas/schedule_resource'

        let(:body) do
          {
            data: {
              type: 'schedule',
              attributes: {
                name: 'Updated Schedule'
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['attributes']['name']).to eq('Updated Schedule')
        end
      end
    end

    delete 'Deletes a schedule' do
      tags 'Schedules'
      SwaggerComponent::RequestSetup.build(self)

      response '204', 'schedule deleted' do
        run_test!
      end
    end
  end

  path '/v1/{account_subdomain}/schedules/{id}/publish' do
    parameter name: :account_subdomain, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    let(:schedule) { create(:schedule, account: account, creator: user) }
    let(:id) { schedule.id }

    put 'Publishes a schedule' do
      tags 'Schedules'
      SwaggerComponent::RequestSetup.build(self)

      response '200', 'schedule published' do
        schema '$ref': '#/components/schemas/schedule_resource'

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['attributes']['state']).to eq('published')
        end
      end
    end
  end
end
