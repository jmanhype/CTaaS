# Dockerfile for Elixir A2A Agent
FROM elixir:1.16-alpine
WORKDIR /app
RUN apk add --no-cache git
COPY apps ./apps
COPY mix.exs mix.lock ./
COPY config ./config
RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get && mix deps.compile
WORKDIR /app/apps/a2a_agent_web
RUN mix compile
EXPOSE 4000
CMD ["mix", "phx.server"]
