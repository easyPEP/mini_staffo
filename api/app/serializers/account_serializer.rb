# frozen_string_literal: true

class AccountSerializer < BaseSerializer
  attributes :name, :subdomain, :locale, :time_zone

  has_many :users
  has_many :schedules
end
