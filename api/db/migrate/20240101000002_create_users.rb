class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.references :account, null: false, foreign_key: true

      ## Database authenticatable
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :role, null: false, default: 'staff'
      t.datetime :locked_at

      t.timestamps
    end

    add_index :users, [:email, :account_id], unique: true
    add_index :users, :reset_password_token, unique: true
  end
end
