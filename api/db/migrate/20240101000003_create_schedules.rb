class CreateSchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :schedules do |t|
      t.references :account, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.string :name
      t.date :bop, null: false
      t.string :state, null: false, default: 'draft'
      t.datetime :published_at

      t.timestamps
    end
  end
end
