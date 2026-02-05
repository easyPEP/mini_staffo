# frozen_string_literal: true

FactoryBot.define do
  factory :schedule do
    account
    creator { association :user, account: account }
    name { "Week #{Faker::Number.between(from: 1, to: 52)}" }
    bop { Time.zone.today.beginning_of_week }
    state { 'draft' }

    trait :published do
      state { 'published' }
      published_at { Time.current }
    end
  end
end
