ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS collection_appointments JSONB NULL,
    ADD COLUMN IF NOT EXISTS delivery_appointments JSONB NULL;

UPDATE logistics_loads
   SET collection_appointments = jsonb_build_array(
       jsonb_build_object(
           'scheduled_at', collection_scheduled_at,
           'location_type_id', collection_location_type_id
       )
   )
 WHERE collection_appointments IS NULL
   AND collection_scheduled_at IS NOT NULL;
