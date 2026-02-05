# frozen_string_literal: true

FactoryBot.define do
  factory :shift do
    account
    schedule { association :schedule, account: account }
    creator { association :user, account: account }
    starts_at { Time.current.beginning_of_day + 9.hours }
    ends_at { Time.current.beginning_of_day + 17.hours }
    desired_coverage { 1 }
    note { nil }
  end
end
