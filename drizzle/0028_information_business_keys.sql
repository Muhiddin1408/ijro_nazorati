CREATE TABLE app_information_business_keys (
  business_key TEXT PRIMARY KEY NOT NULL,
  record_id INTEGER NOT NULL REFERENCES app_information_records(id) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX app_information_business_keys_record_idx ON app_information_business_keys(record_id);
