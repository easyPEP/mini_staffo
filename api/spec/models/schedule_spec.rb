# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Schedule, type: :model do
  subject { build(:schedule) }

  describe 'associations' do
    it { is_expected.to belong_to(:account) }
    it { is_expected.to belong_to(:creator).class_name('User') }
    it { is_expected.to have_many(:shifts).dependent(:destroy) }
    it { is_expected.to have_many(:applications).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:bop) }
  end

  describe '#eop' do
    it 'returns bop + 6 days' do
      schedule = build(:schedule, bop: Date.new(2024, 1, 1))
      expect(schedule.eop).to eq(Date.new(2024, 1, 7))
    end
  end

  describe 'AASM' do
    it 'starts in draft state' do
      expect(subject.state).to eq('draft')
    end

    it 'transitions from draft to published' do
      schedule = create(:schedule)
      schedule.aasm_publish!
      expect(schedule.state).to eq('published')
      expect(schedule.published_at).to be_present
    end
  end
end
