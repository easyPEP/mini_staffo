class CreateAccounts < ActiveRecord::Migration[7.2]
  def change
    create_table :accounts do |t|
      t.string :name, null: false
      t.string :subdomain, null: false
      t.string :locale, default: 'en'
      t.string :time_zone, default: 'Berlin'

      t.timestamps
    end

    add_index :accounts, :subdomain, unique: true
  end
end
