-- Migration: Add Conditional Logic Foreign Key Constraint (Fixed)
-- Created: 2026-04-30
-- Purpose: Add proper foreign key constraint for conditional form field relationships
-- Note: This migration is separate to handle the case where columns already exist

-- =============================================================================
-- UP - Apply Migration
-- =============================================================================

-- First, check if columns exist. If they don't, add them
ALTER TABLE event_form_fields 
ADD COLUMN IF NOT EXISTS conditional_parent_field_id INT UNSIGNED NULL AFTER help_text,
ADD COLUMN IF NOT EXISTS conditional_parent_value VARCHAR(255) NULL AFTER conditional_parent_field_id;

-- Add the foreign key constraint (with proper syntax)
ALTER TABLE event_form_fields 
ADD CONSTRAINT fk_event_form_fields_conditional_parent 
    FOREIGN KEY (conditional_parent_field_id) 
    REFERENCES event_form_fields(id) 
    ON DELETE SET NULL;

-- Create index for faster lookups of conditional relationships
CREATE INDEX IF NOT EXISTS idx_conditional_parent ON event_form_fields(conditional_parent_field_id);

-- =============================================================================
-- DOWN - Rollback Migration
-- =============================================================================
-- 
-- ALTER TABLE event_form_fields 
-- DROP FOREIGN KEY fk_event_form_fields_conditional_parent;
-- 
-- DROP INDEX IF EXISTS idx_conditional_parent ON event_form_fields;
-- 
-- ALTER TABLE event_form_fields 
-- DROP COLUMN IF EXISTS conditional_parent_value,
-- DROP COLUMN IF EXISTS conditional_parent_field_id;
--
