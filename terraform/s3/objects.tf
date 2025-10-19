resource "aws_s3_object" "spa_index" {
    bucket       = aws_s3_bucket.spa_bucket.id
    key          = "index.html"
    source       = "${path.module}/resources/index.html"
    content_type = "text/html"
    etag         = filemd5("${path.module}/resources/index.html")
}

resource "aws_s3_object" "spa_assets" {
    for_each = fileset("${path.module}/resources/assets", "**")

    bucket = aws_s3_bucket.spa_bucket.id
    key    = "assets/${each.value}"
    source = "${path.module}/resources/assets/${each.value}"
    etag   = filemd5("${path.module}/resources/assets/${each.value}")

    content_type = lookup(
        {
        "js"   = "text/javascript",
        "css"  = "text/css",
        "html" = "text/html",
        "json" = "application/json",
        "png"  = "image/png",
        "jpg"  = "image/jpeg",
        "jpeg" = "image/jpeg",
        "svg"  = "image/svg+xml",
        "ico"  = "image/x-icon",
        "wasm" = "application/wasm"
        },
        lower(element(split(".", each.value), length(split(".", each.value)) - 1)),
        "application/octet-stream"
    )
}

resource "aws_s3_object" "spa_manifest" {
    bucket       = aws_s3_bucket.spa_bucket.id
    key          = "manifest.json"
    source       = "${path.module}/resources/manifest.json"
    content_type = "application/json"
    etag         = filemd5("${path.module}/resources/manifest.json")
}
