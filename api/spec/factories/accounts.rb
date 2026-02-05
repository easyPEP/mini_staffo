# frozen_string_literal: true

FactoryBot.define do
  factory :account do
    name { Faker::Company.name }
    sequence(:subdomain) { |n| "company-#{n}" }
    locale { 'en' }
    time_zone { 'Berlin' }

    after(:create) do |account|
      create(:user, :admin, account: account) unless account.users.exists?(role: 'admin')
    end
  end
end
