ALTER TABLE admins
  ADD COLUMN failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN lockout_until DATETIME NULL,
  ADD COLUMN last_failed_login_at DATETIME NULL;

-- Rollback:
-- ALTER TABLE admins
--   DROP COLUMN failed_login_attempts,
--   DROP COLUMN lockout_until,
--   DROP COLUMN last_failed_login_at;