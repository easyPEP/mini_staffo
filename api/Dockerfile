FROM ruby:3.3.10-bookworm AS base

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      default-mysql-client \
      build-essential \
      default-libmysqlclient-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS development

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["bash", "-c", "bundle exec rails db:prepare && bundle exec rails server -b 0.0.0.0 -p 3000"]
