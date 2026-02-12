-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "profile_image_url" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "face_encoding_id" VARCHAR(255),
    "face_sample_uploaded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keystores" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "primary_key" VARCHAR(500) NOT NULL,
    "secondary_key" VARCHAR(500) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keystores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weddings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "host_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "wedding_date" DATE NOT NULL,
    "venue" VARCHAR(500),
    "venue_address" TEXT,
    "cover_image_url" TEXT,
    "auto_tag_photos" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(20) NOT NULL DEFAULT 'planning',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wedding_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME,
    "location" VARCHAR(500),
    "location_address" TEXT,
    "location_coordinates" TEXT,
    "event_type" VARCHAR(50),
    "color_theme" VARCHAR(7),
    "icon" VARCHAR(50),
    "cover_image_url" TEXT,
    "dress_code" VARCHAR(255),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wedding_id" UUID NOT NULL,
    "user_id" INTEGER,
    "upload_permission" BOOLEAN NOT NULL DEFAULT false,
    "invitation_token" VARCHAR(64) NOT NULL,
    "invitation_sent_at" TIMESTAMP(3),
    "rsvp_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "rsvp_responded_at" TIMESTAMP(3),
    "rsvp_note" TEXT,
    "face_sample_provided" BOOLEAN NOT NULL DEFAULT false,
    "face_encoding_id" VARCHAR(255),
    "photos_processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wedding_id" UUID NOT NULL,
    "event_id" UUID,
    "uploaded_by_user_id" INTEGER NOT NULL,
    "uploaded_by_guest_id" UUID,
    "file_name" VARCHAR(255) NOT NULL,
    "original_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "file_size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "mime_type" VARCHAR(50),
    "caption" TEXT,
    "taken_at" TIMESTAMP(3),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "faces_detected" INTEGER NOT NULL DEFAULT 0,
    "processing_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "processed_at" TIMESTAMP(3),
    "ai_error_message" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "moderated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "photo_id" UUID NOT NULL,
    "guest_id" UUID,
    "user_id" INTEGER,
    "confidence_score" DECIMAL(5,4),
    "bounding_box" JSONB,
    "face_encoding_id" VARCHAR(255),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "is_primary_person" BOOLEAN NOT NULL DEFAULT false,
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_processing_queue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "photo_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'queued',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "processing_time_ms" INTEGER,
    "faces_found" INTEGER NOT NULL DEFAULT 0,
    "matches_created" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_processing_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_samples" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER,
    "guest_id" UUID,
    "sample_image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "face_encoding_id" VARCHAR(255) NOT NULL,
    "encoding_quality" DECIMAL(5,4),
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "source" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "face_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wedding_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wedding_id" UUID NOT NULL,
    "total_guests" INTEGER NOT NULL DEFAULT 0,
    "guests_accepted" INTEGER NOT NULL DEFAULT 0,
    "guests_declined" INTEGER NOT NULL DEFAULT 0,
    "guests_pending" INTEGER NOT NULL DEFAULT 0,
    "total_events" INTEGER NOT NULL DEFAULT 0,
    "total_photos" INTEGER NOT NULL DEFAULT 0,
    "total_photo_views" INTEGER NOT NULL DEFAULT 0,
    "photos_processed" INTEGER NOT NULL DEFAULT 0,
    "photos_pending" INTEGER NOT NULL DEFAULT 0,
    "total_face_tags" INTEGER NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wedding_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_email_status" ON "users"("email", "status");

-- CreateIndex
CREATE INDEX "idx_user_face_encoding" ON "users"("face_encoding_id");

-- CreateIndex
CREATE INDEX "idx_keystore_client" ON "keystores"("client_id");

-- CreateIndex
CREATE INDEX "idx_keystore_auth" ON "keystores"("client_id", "primary_key", "status");

-- CreateIndex
CREATE INDEX "idx_keystore_keys" ON "keystores"("client_id", "primary_key", "secondary_key");

-- CreateIndex
CREATE INDEX "idx_wedding_host" ON "weddings"("host_id");

-- CreateIndex
CREATE INDEX "idx_wedding_date" ON "weddings"("wedding_date");

-- CreateIndex
CREATE INDEX "idx_wedding_status" ON "weddings"("status");

-- CreateIndex
CREATE INDEX "idx_wedding_host_status" ON "weddings"("host_id", "status");

-- CreateIndex
CREATE INDEX "idx_wedding_date_status" ON "weddings"("wedding_date", "status");

-- CreateIndex
CREATE INDEX "idx_event_wedding" ON "events"("wedding_id");

-- CreateIndex
CREATE INDEX "idx_event_date" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "idx_event_type" ON "events"("event_type");

-- CreateIndex
CREATE INDEX "idx_event_wedding_date" ON "events"("wedding_id", "event_date");

-- CreateIndex
CREATE INDEX "idx_event_display_order" ON "events"("wedding_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "guests_invitation_token_key" ON "guests"("invitation_token");

-- CreateIndex
CREATE INDEX "idx_guest_wedding" ON "guests"("wedding_id");

-- CreateIndex
CREATE INDEX "idx_guest_user" ON "guests"("user_id");

-- CreateIndex
CREATE INDEX "idx_guest_token" ON "guests"("invitation_token");

-- CreateIndex
CREATE INDEX "idx_guest_rsvp" ON "guests"("rsvp_status");

-- CreateIndex
CREATE INDEX "idx_guest_wedding_rsvp" ON "guests"("wedding_id", "rsvp_status");

-- CreateIndex
CREATE INDEX "idx_guest_wedding_user" ON "guests"("wedding_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_guest_face_encoding" ON "guests"("face_encoding_id");

-- CreateIndex
CREATE INDEX "idx_photo_wedding" ON "photos"("wedding_id");

-- CreateIndex
CREATE INDEX "idx_photo_event" ON "photos"("event_id");

-- CreateIndex
CREATE INDEX "idx_photo_uploader" ON "photos"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "idx_photo_processing" ON "photos"("processing_status");

-- CreateIndex
CREATE INDEX "idx_photo_wedding_public" ON "photos"("wedding_id", "is_public");

-- CreateIndex
CREATE INDEX "idx_photo_wedding_event" ON "photos"("wedding_id", "event_id");

-- CreateIndex
CREATE INDEX "idx_photo_wedding_date" ON "photos"("wedding_id", "uploaded_at");

-- CreateIndex
CREATE INDEX "idx_photo_process_queue" ON "photos"("processing_status", "created_at");

-- CreateIndex
CREATE INDEX "idx_tag_photo" ON "photo_tags"("photo_id");

-- CreateIndex
CREATE INDEX "idx_tag_guest" ON "photo_tags"("guest_id");

-- CreateIndex
CREATE INDEX "idx_tag_user" ON "photo_tags"("user_id");

-- CreateIndex
CREATE INDEX "idx_tag_photo_guest" ON "photo_tags"("photo_id", "guest_id");

-- CreateIndex
CREATE INDEX "idx_tag_guest_verified" ON "photo_tags"("guest_id", "verified");

-- CreateIndex
CREATE INDEX "idx_tag_user_verified" ON "photo_tags"("user_id", "verified");

-- CreateIndex
CREATE INDEX "idx_tag_confidence" ON "photo_tags"("confidence_score");

-- CreateIndex
CREATE INDEX "idx_tag_guest_photo_active" ON "photo_tags"("guest_id", "photo_id", "rejected");

-- CreateIndex
CREATE UNIQUE INDEX "ai_processing_queue_photo_id_key" ON "ai_processing_queue"("photo_id");

-- CreateIndex
CREATE INDEX "idx_queue_photo" ON "ai_processing_queue"("photo_id");

-- CreateIndex
CREATE INDEX "idx_queue_status" ON "ai_processing_queue"("status");

-- CreateIndex
CREATE INDEX "idx_queue_processing_order" ON "ai_processing_queue"("status", "priority", "created_at");

-- CreateIndex
CREATE INDEX "idx_queue_wedding" ON "ai_processing_queue"("wedding_id");

-- CreateIndex
CREATE INDEX "idx_sample_user" ON "face_samples"("user_id");

-- CreateIndex
CREATE INDEX "idx_sample_guest" ON "face_samples"("guest_id");

-- CreateIndex
CREATE INDEX "idx_sample_encoding" ON "face_samples"("face_encoding_id");

-- CreateIndex
CREATE INDEX "idx_sample_user_primary" ON "face_samples"("user_id", "is_primary");

-- CreateIndex
CREATE INDEX "idx_sample_guest_primary" ON "face_samples"("guest_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "wedding_stats_wedding_id_key" ON "wedding_stats"("wedding_id");

-- CreateIndex
CREATE INDEX "idx_stats_wedding" ON "wedding_stats"("wedding_id");

-- AddForeignKey
ALTER TABLE "keystores" ADD CONSTRAINT "keystores_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_guest_id_fkey" FOREIGN KEY ("uploaded_by_guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing_queue" ADD CONSTRAINT "ai_processing_queue_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing_queue" ADD CONSTRAINT "ai_processing_queue_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_samples" ADD CONSTRAINT "face_samples_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_samples" ADD CONSTRAINT "face_samples_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wedding_stats" ADD CONSTRAINT "wedding_stats_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
