# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Applications API', type: :request do
  let(:account) { create(:account) }
  let(:user) { account.users.find_by(role: 'admin') }
  let(:account_subdomain) { account.subdomain }
  let(:Authorization) { ActionController::HttpAuthentication::Basic.encode_credentials(user.email, 'welcome') }
  let(:schedule) { create(:schedule, account: account, creator: user) }
  let(:shift) { create(:shift, account: account, schedule: schedule, creator: user) }
  let(:applicant) { create(:user, account: account) }

  path '/v1/{account_subdomain}/applications' do
    parameter name: :account_subdomain, in: :path, type: :string

    get 'Lists applications' do
      tags 'Applications'
      SwaggerComponent::RequestSetup.build(self)
      SwaggerComponent::Parameters::Pagination.apply(self)

      response '200', 'applications found' do
        schema '$ref': '#/components/schemas/application_resources'

        let!(:application) { create(:application, account: account, shift: shift, schedule: schedule, user: applicant, creator: user) }

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data.length).to eq(1)
        end
      end
    end

    post 'Creates an application' do
      tags 'Applications'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/application_post_resource' }

      response '201', 'application created' do
        schema '$ref': '#/components/schemas/application_resource'

        let(:body) do
          {
            data: {
              type: 'application',
              attributes: {},
              relationships: {
                shift: { data: { type: 'shift', id: shift.id.to_s } },
                user: { data: { type: 'user', id: applicant.id.to_s } },
                schedule: { data: { type: 'schedule', id: schedule.id.to_s } }
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['type']).to eq('application')
          expect(data['relationships']['shift']['data']['id']).to eq(shift.id.to_s)
          expect(data['relationships']['user']['data']['id']).to eq(applicant.id.to_s)
          expect(data['relationships']['schedule']['data']['id']).to eq(schedule.id.to_s)
        end
      end

      response '422', 'invalid request' do
        schema '$ref': '#/components/schemas/jsonapi_errors'

        let(:body) do
          {
            data: {
              type: 'application',
              attributes: {},
              relationships: {}
            }
          }
        end

        run_test!
      end
    end
  end

  path '/v1/{account_subdomain}/applications/{id}' do
    parameter name: :account_subdomain, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    let(:application) { create(:application, account: account, shift: shift, schedule: schedule, user: applicant, creator: user) }
    let(:id) { application.id }

    get 'Shows an application' do
      tags 'Applications'
      SwaggerComponent::RequestSetup.build(self)

      response '200', 'application found' do
        schema '$ref': '#/components/schemas/application_resource'

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['id']).to eq(application.id.to_s)
        end
      end
    end

    patch 'Updates an application' do
      tags 'Applications'
      SwaggerComponent::RequestSetup.build(self)
      parameter name: :body, in: :body, schema: { '$ref': '#/components/schemas/application_post_resource' }
      parameter name: :do, in: :query, required: false,
                schema: { type: :string, enum: SwaggerComponent.aasm_event_names(Application) },
                description: 'State transition action'

      response '200', 'application updated' do
        schema '$ref': '#/components/schemas/application_resource'

        let(:body) do
          {
            data: {
              type: 'application',
              attributes: {
                cancel_reason: 'schedule conflict'
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['id']).to eq(application.id.to_s)
        end
      end

      response '200', 'application state transitioned' do
        schema '$ref': '#/components/schemas/application_resource'

        let(:do) { 'apply' }
        let(:body) { { data: { type: 'application', attributes: {} } } }

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data['attributes']['state']).to eq('applied')
        end
      end
    end

    delete 'Deletes an application' do
      tags 'Applications'
      SwaggerComponent::RequestSetup.build(self)

      response '204', 'application deleted' do
        run_test!
      end
    end
  end

  describe 'staff authorization' do
    let(:staff_user) { create(:user, account: account, role: 'staff') }
    let(:other_user) { create(:user, account: account, role: 'staff') }
    let(:staff_auth) { ActionController::HttpAuthentication::Basic.encode_credentials(staff_user.email, 'welcome') }

    def create_application_for(target_user)
      post "/v1/#{account_subdomain}/applications",
           params: {
             data: {
               type: 'application',
               attributes: {},
               relationships: {
                 shift: { data: { type: 'shift', id: shift.id.to_s } },
                 user: { data: { type: 'user', id: target_user.id.to_s } },
                 schedule: { data: { type: 'schedule', id: schedule.id.to_s } }
               }
             }
           },
           headers: { 'Authorization' => staff_auth },
           as: :json
    end

    describe 'POST /v1/:account_subdomain/applications' do
      it 'allows staff to create an application for themselves' do
        create_application_for(staff_user)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body['data']['relationships']['user']['data']['id']).to eq(staff_user.id.to_s)
      end

      it 'forbids staff to create an application for another user' do
        create_application_for(other_user)

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
