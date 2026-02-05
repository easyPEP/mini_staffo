# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Shift, type: :model do
  subject { build(:shift) }

  describe 'associations' do
    it { is_expected.to belong_to(:account) }
    it { is_expected.to belong_to(:schedule) }
    it { is_expected.to belong_to(:creator).class_name('User') }
    it { is_expected.to have_many(:applications).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:starts_at) }
    it { is_expected.to validate_presence_of(:ends_at) }
    it { is_expected.to validate_presence_of(:desired_coverage) }
    it { is_expected.to validate_numericality_of(:desired_coverage).is_greater_than(0) }

    it 'validates ends_at is after starts_at' do
      shift = build(:shift, starts_at: 1.hour.from_now, ends_at: 1.hour.ago)
      expect(shift).not_to be_valid
      expect(shift.errors[:ends_at]).to include('must be after starts_at')
    end
  end

  describe '#full?' do
    it 'returns true when assigned applications meet desired coverage' do
      shift = create(:shift, desired_coverage: 1)
      create(:application, :assigned, shift: shift, account: shift.account, schedule: shift.schedule)
      expect(shift.full?).to be true
    end

    it 'returns false when assigned applications are below desired coverage' do
      shift = create(:shift, desired_coverage: 2)
      create(:application, :assigned, shift: shift, account: shift.account, schedule: shift.schedule)
      expect(shift.full?).to be false
    end
  end
end
