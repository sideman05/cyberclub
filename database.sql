CREATE DATABASE IF NOT EXISTS dit_cyberclub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dit_cyberclub;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  category VARCHAR(120) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(255) NULL,
  author VARCHAR(160) NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_status_published (status, published_at),
  INDEX idx_blog_published_at (published_at),
  INDEX idx_blog_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leaders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  position VARCHAR(160) NOT NULL,
  bio TEXT NULL,
  image_path VARCHAR(255) NULL,
  linkedin_url VARCHAR(255) NULL,
  twitter_url VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leaders_active_order (is_active, display_order),
  INDEX idx_leaders_display_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gallery (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(120) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  description TEXT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gallery_order (display_order),
  INDEX idx_gallery_category (category),
  INDEX idx_gallery_featured (is_featured)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  event_date DATE NOT NULL,
  event_time TIME NULL,
  location VARCHAR(220) NOT NULL,
  description LONGTEXT NOT NULL,
  image_path VARCHAR(255) NULL,
  status ENUM('upcoming', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_status_date (status, event_date),
  INDEX idx_events_event_date (event_date),
  INDEX idx_events_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  subject VARCHAR(220) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'archived') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contacts_status_created (status, created_at),
  INDEX idx_contacts_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_forms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  title VARCHAR(220) NOT NULL,
  description LONGTEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_forms_event_id (event_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_form_fields (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  form_id INT UNSIGNED NOT NULL,
  field_type ENUM('text', 'email', 'number', 'textarea', 'radio', 'checkbox', 'select', 'date', 'time', 'tel', 'url') NOT NULL,
  label VARCHAR(220) NOT NULL,
  placeholder VARCHAR(220) NULL,
  options LONGTEXT NULL,
  is_required TINYINT(1) NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  help_text VARCHAR(500) NULL,
  conditional_parent_field_id INT UNSIGNED NULL,
  conditional_parent_value VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES event_forms(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_form_fields_conditional_parent
    FOREIGN KEY (conditional_parent_field_id) REFERENCES event_form_fields(id) ON DELETE SET NULL,
  INDEX idx_form_fields_form_id (form_id),
  INDEX idx_form_fields_order (order_index),
  INDEX idx_conditional_parent (conditional_parent_field_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_form_responses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  form_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NOT NULL,
  responder_email VARCHAR(190) NOT NULL,
  responder_name VARCHAR(160) NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES event_forms(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_form_responses_form_id (form_id),
  INDEX idx_form_responses_event_id (event_id),
  INDEX idx_form_responses_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_form_response_data (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  response_id INT UNSIGNED NOT NULL,
  field_id INT UNSIGNED NOT NULL,
  field_label VARCHAR(220) NOT NULL,
  answer LONGTEXT NOT NULL,
  FOREIGN KEY (response_id) REFERENCES event_form_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES event_form_fields(id) ON DELETE SET NULL,
  INDEX idx_response_data_response_id (response_id),
  INDEX idx_response_data_field_id (field_id)
) ENGINE=InnoDB;

INSERT INTO admins (full_name, email, password_hash, role)
VALUES (
  'DIT CyberClub Admin',
  'admin@example.com',
  '$2y$12$cGiy01JF3oQ1jpamwywcfO5GtcJhMtvzA87ikIRceW38yY45PHkOW',
  'admin'
)
ON DUPLICATE KEY UPDATE email = email;
