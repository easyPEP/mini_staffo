class CreateShifts < ActiveRecord::Migration[7.2]
  def change
    create_table :shifts do |t|
      t.references :account, null: false, foreign_key: true
      t.references :schedule, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.integer :desired_coverage, null: false, default: 1
      t.text :note
      t.datetime :published_at

      t.timestamps
    end
  end
end
