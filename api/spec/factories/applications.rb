# frozen_string_literal: true

FactoryBot.define do
  factory :application do
    account
    shift { association :shift, account: account }
    schedule { shift.schedule }
    user { association :user, account: account }
    creator { association :user, account: account }
    state { 'new' }

    trait :applied do
      state { 'applied' }
    end

    trait :assigned do
      state { 'assigned' }
    end
  end
end
