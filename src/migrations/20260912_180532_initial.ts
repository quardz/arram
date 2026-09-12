import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_people_gender" AS ENUM('male', 'female');
  CREATE TYPE "public"."enum_people_source" AS ENUM('signup', 'excel-import', 'org-added', 'event');
  CREATE TYPE "public"."enum_geo_nodes_level" AS ENUM('state', 'region', 'mandalam', 'district', 'union', 'panchayat', 'temple');
  CREATE TYPE "public"."enum_org_assignments_role" AS ENUM('state_admin', 'regional_organiser', 'zonal_organiser', 'district_organiser', 'union_coordinator', 'panchayat_coordinator', 'temple_coordinator');
  CREATE TYPE "public"."enum_projects_lifecycle" AS ENUM('planned', 'active', 'completed', 'archived');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lists_acquisition_channel" AS ENUM('social_media', 'otp_verification', 'event', 'import', 'other');
  CREATE TYPE "public"."enum_list_members_status" AS ENUM('active', 'dropped', 'converted');
  CREATE TYPE "public"."enum_social_posts_status" AS ENUM('published', 'hidden');
  CREATE TYPE "public"."enum_skills_status" AS ENUM('open', 'claimed', 'closed');
  CREATE TYPE "public"."enum_skill_claims_status" AS ENUM('requested', 'accepted', 'declined', 'done');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "admins_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "admins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar NOT NULL,
  	"name" varchar,
  	"dob" timestamp(3) with time zone,
  	"gender" "enum_people_gender",
  	"pincode" varchar,
  	"referred_by_id" integer,
  	"program_id_id" integer,
  	"geo_node_id" integer,
  	"otp_verified" boolean DEFAULT false,
  	"referral_code" varchar,
  	"source" "enum_people_source" DEFAULT 'signup',
  	"raw_geo_text_mandalam" varchar,
  	"raw_geo_text_district" varchar,
  	"raw_geo_text_union" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "person_labels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer NOT NULL,
  	"key" varchar NOT NULL,
  	"value" varchar,
  	"set_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "geo_nodes_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "geo_nodes_pincodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "geo_nodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"name_tamil" varchar,
  	"level" "enum_geo_nodes_level" NOT NULL,
  	"parent_id" integer,
  	"code" varchar,
  	"merged_into_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "org_assignments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer NOT NULL,
  	"geo_node_id" integer NOT NULL,
  	"role" "enum_org_assignments_role" NOT NULL,
  	"active" boolean DEFAULT true,
  	"assigned_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"status" "enum_projects_lifecycle" DEFAULT 'planned',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_status" "enum_projects_lifecycle" DEFAULT 'planned',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "project_stages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"project_id" integer NOT NULL,
  	"stage_id" integer,
  	"geo_node_id" integer,
  	"date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"people_id" integer
  );
  
  CREATE TABLE "lists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"project_id" integer,
  	"acquisition_channel" "enum_lists_acquisition_channel",
  	"geo_scope_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "list_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"list_id" integer NOT NULL,
  	"person_id" integer NOT NULL,
  	"entered_at_stage_id" integer,
  	"status" "enum_list_members_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "attendance" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"person_id" integer NOT NULL,
  	"present" boolean DEFAULT true,
  	"recorded_by_id" integer,
  	"recorded_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "social_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author_id" integer,
  	"geo_node_id" integer,
  	"caption" varchar,
  	"status" "enum_social_posts_status" DEFAULT 'published',
  	"curated_for_social" boolean DEFAULT false,
  	"curated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "social_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "skills_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"person_id" integer NOT NULL,
  	"description" varchar,
  	"availability" varchar,
  	"status" "enum_skills_status" DEFAULT 'open',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "skill_claims" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"skill_id" integer NOT NULL,
  	"claimed_by_id" integer NOT NULL,
  	"note" varchar,
  	"status" "enum_skill_claims_status" DEFAULT 'requested',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_feed_url" varchar,
  	"sizes_feed_width" numeric,
  	"sizes_feed_height" numeric,
  	"sizes_feed_mime_type" varchar,
  	"sizes_feed_filesize" numeric,
  	"sizes_feed_filename" varchar
  );
  
  CREATE TABLE "otp_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar NOT NULL,
  	"code_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"attempts" numeric DEFAULT 0,
  	"consumed" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"date" timestamp(3) with time zone,
  	"excerpt" varchar,
  	"body" jsonb,
  	"image" varchar,
  	"cover_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_image" varchar,
  	"version_cover_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"href" varchar,
  	"image" varchar,
  	"blurb" varchar,
  	"order" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery_albums_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar
  );
  
  CREATE TABLE "gallery_albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"group_title" varchar,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_body" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"people_id" integer,
  	"person_labels_id" integer,
  	"geo_nodes_id" integer,
  	"org_assignments_id" integer,
  	"projects_id" integer,
  	"project_stages_id" integer,
  	"events_id" integer,
  	"lists_id" integer,
  	"list_members_id" integer,
  	"attendance_id" integer,
  	"social_posts_id" integer,
  	"skills_id" integer,
  	"skill_claims_id" integer,
  	"media_id" integer,
  	"otp_requests_id" integer,
  	"news_id" integer,
  	"activities_id" integer,
  	"gallery_albums_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"people_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_name" varchar,
  	"tagline" varchar,
  	"donate_url" varchar,
  	"contact_address" varchar,
  	"contact_phone" varchar,
  	"contact_phone_href" varchar,
  	"contact_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_referred_by_id_people_id_fk" FOREIGN KEY ("referred_by_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_program_id_id_projects_id_fk" FOREIGN KEY ("program_id_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_geo_node_id_geo_nodes_id_fk" FOREIGN KEY ("geo_node_id") REFERENCES "public"."geo_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "person_labels" ADD CONSTRAINT "person_labels_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "person_labels" ADD CONSTRAINT "person_labels_set_by_id_people_id_fk" FOREIGN KEY ("set_by_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "geo_nodes_aliases" ADD CONSTRAINT "geo_nodes_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."geo_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "geo_nodes_pincodes" ADD CONSTRAINT "geo_nodes_pincodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."geo_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "geo_nodes" ADD CONSTRAINT "geo_nodes_parent_id_geo_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."geo_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "geo_nodes" ADD CONSTRAINT "geo_nodes_merged_into_id_geo_nodes_id_fk" FOREIGN KEY ("merged_into_id") REFERENCES "public"."geo_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_assignments" ADD CONSTRAINT "org_assignments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_assignments" ADD CONSTRAINT "org_assignments_geo_node_id_geo_nodes_id_fk" FOREIGN KEY ("geo_node_id") REFERENCES "public"."geo_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_assignments" ADD CONSTRAINT "org_assignments_assigned_by_id_people_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_stages" ADD CONSTRAINT "project_stages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_stage_id_project_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."project_stages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_geo_node_id_geo_nodes_id_fk" FOREIGN KEY ("geo_node_id") REFERENCES "public"."geo_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lists" ADD CONSTRAINT "lists_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lists" ADD CONSTRAINT "lists_geo_scope_id_geo_nodes_id_fk" FOREIGN KEY ("geo_scope_id") REFERENCES "public"."geo_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "list_members" ADD CONSTRAINT "list_members_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "list_members" ADD CONSTRAINT "list_members_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "list_members" ADD CONSTRAINT "list_members_entered_at_stage_id_project_stages_id_fk" FOREIGN KEY ("entered_at_stage_id") REFERENCES "public"."project_stages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_id_people_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_author_id_people_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_geo_node_id_geo_nodes_id_fk" FOREIGN KEY ("geo_node_id") REFERENCES "public"."geo_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_curated_by_id_people_id_fk" FOREIGN KEY ("curated_by_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_posts_rels" ADD CONSTRAINT "social_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_posts_rels" ADD CONSTRAINT "social_posts_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills_tags" ADD CONSTRAINT "skills_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills" ADD CONSTRAINT "skills_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "skill_claims" ADD CONSTRAINT "skill_claims_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "skill_claims" ADD CONSTRAINT "skill_claims_claimed_by_id_people_id_fk" FOREIGN KEY ("claimed_by_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_albums_images" ADD CONSTRAINT "gallery_albums_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_person_labels_fk" FOREIGN KEY ("person_labels_id") REFERENCES "public"."person_labels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_geo_nodes_fk" FOREIGN KEY ("geo_nodes_id") REFERENCES "public"."geo_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_assignments_fk" FOREIGN KEY ("org_assignments_id") REFERENCES "public"."org_assignments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_stages_fk" FOREIGN KEY ("project_stages_id") REFERENCES "public"."project_stages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lists_fk" FOREIGN KEY ("lists_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_list_members_fk" FOREIGN KEY ("list_members_id") REFERENCES "public"."list_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_attendance_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_posts_fk" FOREIGN KEY ("social_posts_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skill_claims_fk" FOREIGN KEY ("skill_claims_id") REFERENCES "public"."skill_claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_otp_requests_fk" FOREIGN KEY ("otp_requests_id") REFERENCES "public"."otp_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_albums_fk" FOREIGN KEY ("gallery_albums_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_stats" ADD CONSTRAINT "site_settings_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
  CREATE UNIQUE INDEX "people_phone_idx" ON "people" USING btree ("phone");
  CREATE INDEX "people_referred_by_idx" ON "people" USING btree ("referred_by_id");
  CREATE INDEX "people_program_id_idx" ON "people" USING btree ("program_id_id");
  CREATE INDEX "people_geo_node_idx" ON "people" USING btree ("geo_node_id");
  CREATE INDEX "people_otp_verified_idx" ON "people" USING btree ("otp_verified");
  CREATE UNIQUE INDEX "people_referral_code_idx" ON "people" USING btree ("referral_code");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "person_labels_person_idx" ON "person_labels" USING btree ("person_id");
  CREATE INDEX "person_labels_set_by_idx" ON "person_labels" USING btree ("set_by_id");
  CREATE INDEX "person_labels_updated_at_idx" ON "person_labels" USING btree ("updated_at");
  CREATE INDEX "person_labels_created_at_idx" ON "person_labels" USING btree ("created_at");
  CREATE INDEX "geo_nodes_aliases_order_idx" ON "geo_nodes_aliases" USING btree ("_order");
  CREATE INDEX "geo_nodes_aliases_parent_id_idx" ON "geo_nodes_aliases" USING btree ("_parent_id");
  CREATE INDEX "geo_nodes_pincodes_order_idx" ON "geo_nodes_pincodes" USING btree ("_order");
  CREATE INDEX "geo_nodes_pincodes_parent_id_idx" ON "geo_nodes_pincodes" USING btree ("_parent_id");
  CREATE INDEX "geo_nodes_name_idx" ON "geo_nodes" USING btree ("name");
  CREATE INDEX "geo_nodes_level_idx" ON "geo_nodes" USING btree ("level");
  CREATE INDEX "geo_nodes_parent_idx" ON "geo_nodes" USING btree ("parent_id");
  CREATE INDEX "geo_nodes_merged_into_idx" ON "geo_nodes" USING btree ("merged_into_id");
  CREATE INDEX "geo_nodes_updated_at_idx" ON "geo_nodes" USING btree ("updated_at");
  CREATE INDEX "geo_nodes_created_at_idx" ON "geo_nodes" USING btree ("created_at");
  CREATE INDEX "org_assignments_person_idx" ON "org_assignments" USING btree ("person_id");
  CREATE INDEX "org_assignments_geo_node_idx" ON "org_assignments" USING btree ("geo_node_id");
  CREATE INDEX "org_assignments_active_idx" ON "org_assignments" USING btree ("active");
  CREATE INDEX "org_assignments_assigned_by_idx" ON "org_assignments" USING btree ("assigned_by_id");
  CREATE INDEX "org_assignments_updated_at_idx" ON "org_assignments" USING btree ("updated_at");
  CREATE INDEX "org_assignments_created_at_idx" ON "org_assignments" USING btree ("created_at");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "project_stages_project_idx" ON "project_stages" USING btree ("project_id");
  CREATE INDEX "project_stages_updated_at_idx" ON "project_stages" USING btree ("updated_at");
  CREATE INDEX "project_stages_created_at_idx" ON "project_stages" USING btree ("created_at");
  CREATE INDEX "events_project_idx" ON "events" USING btree ("project_id");
  CREATE INDEX "events_stage_idx" ON "events" USING btree ("stage_id");
  CREATE INDEX "events_geo_node_idx" ON "events" USING btree ("geo_node_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_people_id_idx" ON "events_rels" USING btree ("people_id");
  CREATE INDEX "lists_project_idx" ON "lists" USING btree ("project_id");
  CREATE INDEX "lists_geo_scope_idx" ON "lists" USING btree ("geo_scope_id");
  CREATE INDEX "lists_updated_at_idx" ON "lists" USING btree ("updated_at");
  CREATE INDEX "lists_created_at_idx" ON "lists" USING btree ("created_at");
  CREATE INDEX "list_members_list_idx" ON "list_members" USING btree ("list_id");
  CREATE INDEX "list_members_person_idx" ON "list_members" USING btree ("person_id");
  CREATE INDEX "list_members_entered_at_stage_idx" ON "list_members" USING btree ("entered_at_stage_id");
  CREATE INDEX "list_members_updated_at_idx" ON "list_members" USING btree ("updated_at");
  CREATE INDEX "list_members_created_at_idx" ON "list_members" USING btree ("created_at");
  CREATE INDEX "attendance_event_idx" ON "attendance" USING btree ("event_id");
  CREATE INDEX "attendance_person_idx" ON "attendance" USING btree ("person_id");
  CREATE INDEX "attendance_present_idx" ON "attendance" USING btree ("present");
  CREATE INDEX "attendance_recorded_by_idx" ON "attendance" USING btree ("recorded_by_id");
  CREATE INDEX "attendance_updated_at_idx" ON "attendance" USING btree ("updated_at");
  CREATE INDEX "attendance_created_at_idx" ON "attendance" USING btree ("created_at");
  CREATE INDEX "social_posts_author_idx" ON "social_posts" USING btree ("author_id");
  CREATE INDEX "social_posts_geo_node_idx" ON "social_posts" USING btree ("geo_node_id");
  CREATE INDEX "social_posts_status_idx" ON "social_posts" USING btree ("status");
  CREATE INDEX "social_posts_curated_for_social_idx" ON "social_posts" USING btree ("curated_for_social");
  CREATE INDEX "social_posts_curated_by_idx" ON "social_posts" USING btree ("curated_by_id");
  CREATE INDEX "social_posts_updated_at_idx" ON "social_posts" USING btree ("updated_at");
  CREATE INDEX "social_posts_created_at_idx" ON "social_posts" USING btree ("created_at");
  CREATE INDEX "social_posts_rels_order_idx" ON "social_posts_rels" USING btree ("order");
  CREATE INDEX "social_posts_rels_parent_idx" ON "social_posts_rels" USING btree ("parent_id");
  CREATE INDEX "social_posts_rels_path_idx" ON "social_posts_rels" USING btree ("path");
  CREATE INDEX "social_posts_rels_media_id_idx" ON "social_posts_rels" USING btree ("media_id");
  CREATE INDEX "skills_tags_order_idx" ON "skills_tags" USING btree ("_order");
  CREATE INDEX "skills_tags_parent_id_idx" ON "skills_tags" USING btree ("_parent_id");
  CREATE INDEX "skills_person_idx" ON "skills" USING btree ("person_id");
  CREATE INDEX "skills_status_idx" ON "skills" USING btree ("status");
  CREATE INDEX "skills_updated_at_idx" ON "skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "skills" USING btree ("created_at");
  CREATE INDEX "skill_claims_skill_idx" ON "skill_claims" USING btree ("skill_id");
  CREATE INDEX "skill_claims_claimed_by_idx" ON "skill_claims" USING btree ("claimed_by_id");
  CREATE INDEX "skill_claims_updated_at_idx" ON "skill_claims" USING btree ("updated_at");
  CREATE INDEX "skill_claims_created_at_idx" ON "skill_claims" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_feed_sizes_feed_filename_idx" ON "media" USING btree ("sizes_feed_filename");
  CREATE INDEX "otp_requests_phone_idx" ON "otp_requests" USING btree ("phone");
  CREATE INDEX "otp_requests_updated_at_idx" ON "otp_requests" USING btree ("updated_at");
  CREATE INDEX "otp_requests_created_at_idx" ON "otp_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_cover_image_idx" ON "news" USING btree ("cover_image_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_cover_image_idx" ON "_news_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "activities_updated_at_idx" ON "activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
  CREATE INDEX "gallery_albums_images_order_idx" ON "gallery_albums_images" USING btree ("_order");
  CREATE INDEX "gallery_albums_images_parent_id_idx" ON "gallery_albums_images" USING btree ("_parent_id");
  CREATE INDEX "gallery_albums_slug_idx" ON "gallery_albums" USING btree ("slug");
  CREATE INDEX "gallery_albums_updated_at_idx" ON "gallery_albums" USING btree ("updated_at");
  CREATE INDEX "gallery_albums_created_at_idx" ON "gallery_albums" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_person_labels_id_idx" ON "payload_locked_documents_rels" USING btree ("person_labels_id");
  CREATE INDEX "payload_locked_documents_rels_geo_nodes_id_idx" ON "payload_locked_documents_rels" USING btree ("geo_nodes_id");
  CREATE INDEX "payload_locked_documents_rels_org_assignments_id_idx" ON "payload_locked_documents_rels" USING btree ("org_assignments_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_project_stages_id_idx" ON "payload_locked_documents_rels" USING btree ("project_stages_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_lists_id_idx" ON "payload_locked_documents_rels" USING btree ("lists_id");
  CREATE INDEX "payload_locked_documents_rels_list_members_id_idx" ON "payload_locked_documents_rels" USING btree ("list_members_id");
  CREATE INDEX "payload_locked_documents_rels_attendance_id_idx" ON "payload_locked_documents_rels" USING btree ("attendance_id");
  CREATE INDEX "payload_locked_documents_rels_social_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("social_posts_id");
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_skill_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("skill_claims_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_otp_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("otp_requests_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_albums_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_preferences_rels_people_id_idx" ON "payload_preferences_rels" USING btree ("people_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_stats_order_idx" ON "site_settings_stats" USING btree ("_order");
  CREATE INDEX "site_settings_stats_parent_id_idx" ON "site_settings_stats" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_sessions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "person_labels" CASCADE;
  DROP TABLE "geo_nodes_aliases" CASCADE;
  DROP TABLE "geo_nodes_pincodes" CASCADE;
  DROP TABLE "geo_nodes" CASCADE;
  DROP TABLE "org_assignments" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "project_stages" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "lists" CASCADE;
  DROP TABLE "list_members" CASCADE;
  DROP TABLE "attendance" CASCADE;
  DROP TABLE "social_posts" CASCADE;
  DROP TABLE "social_posts_rels" CASCADE;
  DROP TABLE "skills_tags" CASCADE;
  DROP TABLE "skills" CASCADE;
  DROP TABLE "skill_claims" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "otp_requests" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "activities" CASCADE;
  DROP TABLE "gallery_albums_images" CASCADE;
  DROP TABLE "gallery_albums" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_stats" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_people_gender";
  DROP TYPE "public"."enum_people_source";
  DROP TYPE "public"."enum_geo_nodes_level";
  DROP TYPE "public"."enum_org_assignments_role";
  DROP TYPE "public"."enum_projects_lifecycle";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_lists_acquisition_channel";
  DROP TYPE "public"."enum_list_members_status";
  DROP TYPE "public"."enum_social_posts_status";
  DROP TYPE "public"."enum_skills_status";
  DROP TYPE "public"."enum_skill_claims_status";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";`)
}
