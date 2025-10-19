resource "aws_s3_bucket" "this" {
  for_each = { for b in var.buckets : b.name => b }

  bucket = each.value.name

  tags = merge(
    {
      Name = each.value.name
    },
    var.tags
  )
}

resource "aws_s3_bucket_versioning" "this" {
  for_each = {
    for b in var.buckets : b.name => b
    if try(b.versioning.enabled, false)
  }

  bucket = aws_s3_bucket.this[each.key].id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  for_each = { for b in var.buckets : b.name => b }

  bucket = aws_s3_bucket.this[each.key].id

  block_public_acls       = try(each.value.public_access_block.block_public_acls, true)
  block_public_policy     = try(each.value.public_access_block.block_public_policy, true)
  ignore_public_acls      = try(each.value.public_access_block.ignore_public_acls, true)
  restrict_public_buckets = try(each.value.public_access_block.restrict_public_buckets, true)
}


resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  for_each = {
    for b in var.buckets : b.name => b
    if try(b.encryption.enabled, false)
  }

  bucket = aws_s3_bucket.this[each.key].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = each.value.encryption.sse_algorithm
      kms_master_key_id = try(each.value.encryption.kms_master_key_id, null)
    }
  }
}

resource "aws_s3_bucket_website_configuration" "this" {
  for_each = {
    for b in var.buckets : b.name => b
    if try(b.website.enabled, false)
  }

  bucket = aws_s3_bucket.this[each.key].id

  index_document {
    suffix = each.value.website.index_document
  }

  error_document {
    key = each.value.website.error_document
  }
}


resource "aws_s3_bucket_cors_configuration" "this" {
  for_each = {
    for b in var.buckets : b.name => b
    if try(length(b.cors_rules), 0) > 0
  }

  bucket = aws_s3_bucket.this[each.key].id

  dynamic "cors_rule" {
    for_each = each.value.cors_rules
    content {
      allowed_methods = cors_rule.value.allowed_methods
      allowed_origins = cors_rule.value.allowed_origins
      allowed_headers = try(cors_rule.value.allowed_headers, null)
      expose_headers  = try(cors_rule.value.expose_headers, null)
      max_age_seconds = try(cors_rule.value.max_age_seconds, null)
    }
  }
}


resource "aws_s3_bucket_policy" "this" {
  for_each = {
    for b in var.buckets : b.name => b
    if try(b.policy, null) != null
  }

  bucket = aws_s3_bucket.this[each.key].id
  policy = each.value.policy
}


locals {
  upload_buckets = {
    for b in var.buckets : b.name => b
    if try(b.upload.enabled, false)
  }

  # Aplanar lista de archivos por bucket
  upload_objects = merge([
    for bucket_name, bucket in local.upload_buckets : {
      for file_path in fileset(bucket.upload.source_dir, "**") :
      "${bucket_name}/${file_path}" => {
        bucket = bucket_name
        file   = file_path
      }
    }
  ]...)
}

resource "aws_s3_object" "spa_uploads" {
  for_each = local.upload_objects

  bucket = aws_s3_bucket.this[each.value.bucket].id
  key    = each.value.file
  source = "${local.upload_buckets[each.value.bucket].upload.source_dir}/${each.value.file}"
  etag   = filemd5("${local.upload_buckets[each.value.bucket].upload.source_dir}/${each.value.file}")

  content_type = lookup(var.mime_types, regex("[^.]+$", each.value.file), null)
}
