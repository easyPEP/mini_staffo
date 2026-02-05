# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Account, type: :model do
  subject { build(:account) }

  describe 'associations' do
    it { is_expected.to have_many(:users).dependent(:destroy) }
    it { is_expected.to have_many(:schedules).dependent(:destroy) }
    it { is_expected.to have_many(:shifts).dependent(:destroy) }
    it { is_expected.to have_many(:applications).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:subdomain) }
    it { is_expected.to validate_uniqueness_of(:subdomain).ignoring_case_sensitivity }
    it { is_expected.to allow_value('my-company-1').for(:subdomain) }
    it { is_expected.not_to allow_value('My Company').for(:subdomain) }
  end
end
