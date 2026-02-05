# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Application, type: :model do
  subject { build(:application) }

  describe 'associations' do
    it { is_expected.to belong_to(:account) }
    it { is_expected.to belong_to(:shift) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:schedule) }
    it { is_expected.to belong_to(:creator).class_name('User') }
  end

  describe 'AASM' do
    it 'starts in new state' do
      expect(subject.state).to eq('new')
    end

    it 'transitions from new to applied' do
      application = create(:application)
      application.aasm_apply!
      expect(application.state).to eq('applied')
    end

    it 'transitions from new to assigned' do
      application = create(:application)
      application.aasm_assign!
      expect(application.state).to eq('assigned')
    end

    it 'transitions from applied to assigned' do
      application = create(:application, :applied)
      application.aasm_accept!
      expect(application.state).to eq('assigned')
    end

    it 'transitions from assigned to cancelled' do
      application = create(:application, :assigned)
      application.aasm_cancel!
      expect(application.state).to eq('cancelled')
    end

    it 'transitions from cancelled to assigned' do
      application = create(:application, state: 'cancelled')
      application.aasm_revoke!
      expect(application.state).to eq('assigned')
    end
  end
end
