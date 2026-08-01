use std::env;
use std::net::SocketAddr;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server, StatusCode, Method};
use serde_json::{json, Value};

mod handler;

async fn route(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    if req.method() != Method::POST {
        let res = json!({ "success": false, "error": "Method Not Allowed" }).to_string();
        return Ok(Response::builder().status(StatusCode::METHOD_NOT_ALLOWED).header("content-type", "application/json").body(Body::from(res)).unwrap());
    }

    let full_body = hyper::body::to_bytes(req.into_body()).await?;
    let event: Value = serde_json::from_slice(&full_body).unwrap_or(json!({}));

    match handler::handle(event) {
        Ok(result) => {
            let res = json!({ "success": true, "result": result }).to_string();
            Ok(Response::builder().status(StatusCode::OK).header("content-type", "application/json").body(Body::from(res)).unwrap())
        },
        Err(err) => {
            let res = json!({ "success": false, "error": err }).to_string();
            Ok(Response::builder().status(StatusCode::INTERNAL_SERVER_ERROR).header("content-type", "application/json").body(Body::from(res)).unwrap())
        }
    }
}

#[tokio::main]
async fn main() {
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string()).parse().unwrap();
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    let make_service = make_service_fn(|_conn| async { Ok::<_, hyper::Error>(service_fn(route)) });
    let server = Server::bind(&addr).serve(make_service);

    println!("Rust Runtime listening on port {}...", port);
    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}