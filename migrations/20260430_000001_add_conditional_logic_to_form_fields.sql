-- Migration: Add Conditional Logic to Event Form Fields
-- Created: 2026-04-30
-- Purpose: Enable conditional branching for form fields - show/hide questions based on user selections

-- =============================================================================
-- UP - Apply Migration
-- =============================================================================

ALTER TABLE event_form_fields 
ADD COLUMN conditional_parent_field_id INT UNSIGNED NULL AFTER help_text,
ADD COLUMN conditional_parent_value VARCHAR(255) NULL AFTER conditional_parent_field_id,
ADD CONSTRAINT fk_event_form_fields_conditional_parent
    FOREIGN KEY (conditional_parent_field_id) REFERENCES event_form_fields(id) ON DELETE SET NULL;

-- Create index for faster lookups of conditional relationships
CREATE INDEX idx_conditional_parent ON event_form_fields(conditional_parent_field_id);

-- =============================================================================
-- DOWN - Rollback Migration (execute these queries to undo the migration)
-- =============================================================================
-- 
-- ALTER TABLE event_form_fields 
-- DROP FOREIGN KEY fk_event_form_fields_conditional_parent;
-- 
-- DROP INDEX idx_conditional_parent ON event_form_fields;
-- 
-- ALTER TABLE event_form_fields 
-- DROP COLUMN conditional_parent_value,
-- DROP COLUMN conditional_parent_field_id;
--
