FROM golang:1.26-alpine AS application

RUN \
    echo "Prepearing Environment." && \
    apk --no-cache add ca-certificates && \
    go install github.com/zxmfke/swagger2openapi3/cmd/swag2op@latest

ARG REF=bundle
ADD . /bundle
WORKDIR /bundle

RUN apk --no-cache add tzdata ca-certificates

WORKDIR /bundle/app
RUN \
    version=${REF} && \
    echo "Building application. Version: ${version}" && \
    go build -ldflags "-X main.revision=${version}" -o /srv/app ./main.go

WORKDIR /bundle
RUN \
  echo "Building static files..." && \
  /srv/app --build \
  --dir.tmpl=./tmpl \
  --dir.static=./static \
  --dir.content=./content \
  --dir.public=/srv/public

FROM scratch

COPY --from=application /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=application /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=application /srv /srv

ENV TZ=Europe/Moscow

EXPOSE 80
WORKDIR /srv
ENTRYPOINT ["./app", "--run", "--server.port=80", "--dir.public=./public"]
