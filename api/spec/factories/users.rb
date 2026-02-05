# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    account
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'welcome' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    role { 'staff' }

    trait :admin do
      role { 'admin' }
    end

    trait :manager do
      role { 'manager' }
    end
  end
end
