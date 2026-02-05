# frozen_string_literal: true

Rails.logger.debug 'Seeding MiniStaffomatic...'

# Account
account = Account.find_or_create_by!(subdomain: 'demo') do |a|
  a.name = 'Demo Company'
  a.locale = 'en'
  a.time_zone = 'Berlin'
end

# Users
admin = User.find_or_create_by!(email: 'admin@demo.com', account: account) do |u|
  u.first_name = 'Admin'
  u.last_name = 'User'
  u.role = 'admin'
  u.password = 'password'
end

manager = User.find_or_create_by!(email: 'manager@demo.com', account: account) do |u|
  u.first_name = 'Manager'
  u.last_name = 'User'
  u.role = 'manager'
  u.password = 'password'
end

staff1 = User.find_or_create_by!(email: 'staff@demo.com', account: account) do |u|
  u.first_name = 'Staff'
  u.last_name = 'One'
  u.role = 'staff'
  u.password = 'password'
end

staff2 = User.find_or_create_by!(email: 'staff2@demo.com', account: account) do |u|
  u.first_name = 'Staff'
  u.last_name = 'Two'
  u.role = 'staff'
  u.password = 'password'
end

# Schedule (current week, published)
monday = Time.zone.today.beginning_of_week
schedule = Schedule.find_or_create_by!(account: account, bop: monday) do |s|
  s.creator = admin
  s.name = 'Current Week'
  s.state = 'published'
  s.published_at = Time.current
end

# 7 shifts (one per day, 9am-5pm)
7.times do |i|
  day = monday + i.days
  shift = Shift.find_or_create_by!(account: account, schedule: schedule,
                                   starts_at: day.in_time_zone('Berlin').change(hour: 9)) do |s|
    s.creator = manager
    s.ends_at = day.in_time_zone('Berlin').change(hour: 17)
    s.desired_coverage = 2
    s.note = "#{Date::DAYNAMES[(i + 1) % 7]} shift"
  end

  # Staff1 assigned to weekday shifts (Mon-Fri)
  if i < 5
    Application.find_or_create_by!(account: account, shift: shift, user: staff1) do |a|
      a.schedule = schedule
      a.creator = staff1
      a.state = 'assigned'
    end
  end

  # Staff2 applied to a few shifts (Mon, Wed, Fri)
  next unless [0, 2, 4].include?(i)

  Application.find_or_create_by!(account: account, shift: shift, user: staff2) do |a|
    a.schedule = schedule
    a.creator = staff2
    a.state = 'applied'
  end
end

Rails.logger.debug 'Seeding complete!'
Rails.logger.debug { "  Account: #{account.subdomain}" }
Rails.logger.debug '  Users: admin@demo.com, manager@demo.com, staff@demo.com, staff2@demo.com'
Rails.logger.debug '  Password: password'
Rails.logger.debug { "  Schedule: #{schedule.name} (#{schedule.bop} - #{schedule.eop})" }
Rails.logger.debug { "  Shifts: #{Shift.count}, Applications: #{Application.count}" }
