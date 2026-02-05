class CreateApplications < ActiveRecord::Migration[7.2]
  def change
    create_table :applications do |t|
      t.references :account, null: false, foreign_key: true
      t.references :shift, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :schedule, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.string :state, null: false, default: 'new'
      t.text :cancel_reason

      t.timestamps
    end
  end
end
