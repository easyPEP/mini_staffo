# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_01_01_000005) do
  create_table "accounts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "subdomain", null: false
    t.string "locale", default: "en"
    t.string "time_zone", default: "Berlin"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subdomain"], name: "index_accounts_on_subdomain", unique: true
  end

  create_table "applications", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "shift_id", null: false
    t.bigint "user_id", null: false
    t.bigint "schedule_id", null: false
    t.bigint "creator_id", null: false
    t.string "state", default: "new", null: false
    t.text "cancel_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_applications_on_account_id"
    t.index ["creator_id"], name: "index_applications_on_creator_id"
    t.index ["schedule_id"], name: "index_applications_on_schedule_id"
    t.index ["shift_id"], name: "index_applications_on_shift_id"
    t.index ["user_id"], name: "index_applications_on_user_id"
  end

  create_table "schedules", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "creator_id", null: false
    t.string "name"
    t.date "bop", null: false
    t.string "state", default: "draft", null: false
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_schedules_on_account_id"
    t.index ["creator_id"], name: "index_schedules_on_creator_id"
  end

  create_table "shifts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "schedule_id", null: false
    t.bigint "creator_id", null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.integer "desired_coverage", default: 1, null: false
    t.text "note"
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_shifts_on_account_id"
    t.index ["creator_id"], name: "index_shifts_on_creator_id"
    t.index ["schedule_id"], name: "index_shifts_on_schedule_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "role", default: "staff", null: false
    t.datetime "locked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_users_on_account_id"
    t.index ["email", "account_id"], name: "index_users_on_email_and_account_id", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "applications", "accounts"
  add_foreign_key "applications", "schedules"
  add_foreign_key "applications", "shifts"
  add_foreign_key "applications", "users"
  add_foreign_key "applications", "users", column: "creator_id"
  add_foreign_key "schedules", "accounts"
  add_foreign_key "schedules", "users", column: "creator_id"
  add_foreign_key "shifts", "accounts"
  add_foreign_key "shifts", "schedules"
  add_foreign_key "shifts", "users", column: "creator_id"
  add_foreign_key "users", "accounts"
end
