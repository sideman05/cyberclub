CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  lockout_until DATETIME NULL,
  last_failed_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_login_attempts_lockout_until (lockout_until)
) ENGINE=InnoDB;

-- Rollback:
-- DROP TABLE IF EXISTS admin_login_attempts;