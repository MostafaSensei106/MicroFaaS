FROM rust:1.75-alpine as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM alpine:3.19
COPY --from=builder /usr/src/app/target/release/rust-runtime /usr/local/bin/
EXPOSE 8080
CMD ["rust-runtime"]