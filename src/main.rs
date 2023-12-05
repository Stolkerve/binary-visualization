use base64::{engine::general_purpose, Engine as _};
use futures_util::TryStreamExt as _;
use std::io::Write;

use actix_multipart::Multipart;
use actix_web::{
    middleware::Logger,
    post,
    web::{self, BufMut, Redirect},
    App, Error, HttpRequest, HttpResponse, HttpServer, Responder,
};
use env_logger::Env;

const BITMAP_WIDTH: usize = 256;
const BITMAP_HEIGTH: usize = 256;

fn generate_img(file_data: Vec<u8>) -> Vec<u8> {
    let mut bitmap = [0usize; BITMAP_WIDTH * BITMAP_HEIGTH];

    let mut max_value = 0.0;

    for i in 0..file_data.len() - 1 {
        let x = *file_data.get(i).unwrap() as usize;
        let y = *file_data.get(i + 1).unwrap() as usize;
        let index = y * BITMAP_HEIGTH + x;
        bitmap[index] += 1;
    }

    for y in 0..BITMAP_WIDTH {
        for x in 0..BITMAP_HEIGTH {
            let index = y * (BITMAP_HEIGTH - 1) + x;
            let mut f = 0.0;
            if bitmap[index] > 0 {
                f = f32::log10(bitmap[index] as f32);
            }
            if f > max_value {
                max_value = f;
            }
        }
    }

    let mut color_bitmap = Vec::<u8>::with_capacity(BITMAP_WIDTH * BITMAP_HEIGTH * 4);

    for y in 0..BITMAP_WIDTH {
        for x in 0..BITMAP_HEIGTH {
            let index = y * BITMAP_HEIGTH + x;
            let luminance = (255.0 * (f32::log10(bitmap[index] as f32) / max_value)) as u8;
            color_bitmap.push(luminance);
            color_bitmap.push(luminance);
            color_bitmap.push(luminance);
            color_bitmap.push(255);
        }
    }

    let webp_encoder = webp::Encoder::new(
        &color_bitmap,
        webp::PixelLayout::Rgba,
        BITMAP_WIDTH as u32,
        BITMAP_HEIGTH as u32,
    );

    return webp_encoder.encode(90.0).as_ref().to_vec();
}

#[post("/analize_img")]
async fn analize_img(req: HttpRequest, mut payload: Multipart) -> Result<impl Responder, Error> {
    let file_size_bytes = usize::from_str_radix(
        req.headers()
            .get("content-length")
            .unwrap()
            .to_str()
            .unwrap(),
        10,
    )
    .unwrap();
    if file_size_bytes > (1024 * 1024 * 5) {
        return Ok(HttpResponse::BadRequest().body("El fichero exede el tamano"));
    }

    if let Some(mut field) = payload.try_next().await? {
        field.content_disposition();
        let mut file_data = vec![].writer();
        while let Some(chunk) = field.try_next().await? {
            file_data.write(&chunk).unwrap();
        }
        let file_data = file_data.into_inner();
        let webp_img = generate_img(file_data);
        let mut buf = String::with_capacity(webp_img.capacity());
        general_purpose::STANDARD.encode_string(webp_img, &mut buf);
        return Ok(HttpResponse::Ok().body(format!("data:image/webp;base64,{}", buf)));
    }
    return Ok(HttpResponse::InternalServerError().into());
}

async fn redirect_to_index() -> impl Responder {
    Redirect::to("/").permanent()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    let port_str = std::env::var("PORT").expect("PORT must be set.");
    let port = u16::from_str_radix(&port_str, 10).expect("PORT must be a 16bits unsing integer");

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .service(analize_img)
            .service(actix_files::Files::new("/", "./public").index_file("index.html"))
            .default_service(web::to(redirect_to_index))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
