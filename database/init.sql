-- ============================================================
--  Ginni Stays — Optimized Database Schema
--  MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS ginni_stays
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ginni_stays;

-- ------------------------------------------------------------
-- 1. USERS (Tenants, Landlords, Admins)
-- ------------------------------------------------------------
CREATE TABLE users (
  id             INT            NOT NULL AUTO_INCREMENT,
  email          VARCHAR(255)   NOT NULL,
  password_hash  VARCHAR(255)   NOT NULL,
  full_name      VARCHAR(100)   NULL,
  phone          VARCHAR(20)    NULL,
  role           ENUM('tenant','landlord','admin') NOT NULL DEFAULT 'tenant',
  avatar_url     VARCHAR(500)   NULL,
  is_active      BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. PROPERTIES (Thông tin chung của tòa nhà/khu trọ)
-- ------------------------------------------------------------
CREATE TABLE properties (
  id             INT            NOT NULL AUTO_INCREMENT,
  landlord_id    INT            NOT NULL,
  title          VARCHAR(255)   NOT NULL,
  description    TEXT           NULL,
  address        VARCHAR(255)   NULL,
  ward           VARCHAR(100)   NULL,
  district       VARCHAR(100)   NULL,
  city           VARCHAR(100)   NULL,
  latitude       DECIMAL(10, 8) NULL,
  longitude      DECIMAL(11, 8) NULL,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  CONSTRAINT fk_properties_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE CASCADE,
  
  INDEX idx_prop_location (city, district)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. ROOMS (Chi tiết từng phòng trong Property)
-- ------------------------------------------------------------
CREATE TABLE rooms (
  id                INT             NOT NULL AUTO_INCREMENT,
  property_id       INT             NOT NULL,
  room_number       VARCHAR(50)     NULL COMMENT 'Số phòng (ví dụ: P101)',
  price             DECIMAL(15, 0)  NOT NULL, -- Tăng độ dài cho tiền VNĐ
  area              DECIMAL(6, 1)   NULL,
  max_occupants     INT             NULL,
  current_occupants INT             NOT NULL DEFAULT 0,
  amenities         JSON            NULL     COMMENT 'e.g. ["wifi","ac"]',
  images            JSON            NULL     COMMENT 'Cloudinary URLs',
  status            ENUM('available','rented','pending','hidden') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_rooms_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,

  INDEX idx_rooms_status (status),
  INDEX idx_rooms_price  (price)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. VIEWING REQUESTS
-- ------------------------------------------------------------
CREATE TABLE viewing_requests (
  id              INT       NOT NULL AUTO_INCREMENT,
  room_id         INT       NOT NULL,
  tenant_id       INT       NOT NULL,
  preferred_date  DATE      NULL,
  message         TEXT      NULL,
  status          ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_vr_room   FOREIGN KEY (room_id)   REFERENCES rooms (id) ON DELETE CASCADE,
  CONSTRAINT fk_vr_tenant FOREIGN KEY (tenant_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. CONTRACTS (Bỏ UNIQUE room_id để lưu lịch sử)
-- ------------------------------------------------------------
CREATE TABLE contracts (
  id                INT             NOT NULL AUTO_INCREMENT,
  room_id           INT             NOT NULL,
  tenant_id         INT             NOT NULL,
  landlord_id       INT             NOT NULL,
  start_date        DATE            NOT NULL,
  end_date          DATE            NOT NULL,
  monthly_rent      DECIMAL(15, 0)  NOT NULL,
  deposit           DECIMAL(15, 0)  NULL,
  terms             TEXT            NULL,
  status            ENUM('active','expired','terminated') NOT NULL DEFAULT 'active',
  pdf_url           VARCHAR(500)    NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  
  CONSTRAINT fk_contracts_room     FOREIGN KEY (room_id)     REFERENCES rooms (id) ON DELETE CASCADE,
  CONSTRAINT fk_contracts_tenant   FOREIGN KEY (tenant_id)   REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_contracts_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE CASCADE,

  INDEX idx_contracts_room_status (room_id, status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. WISHLISTS
-- ------------------------------------------------------------
CREATE TABLE wishlists (
  id          INT       NOT NULL AUTO_INCREMENT,
  tenant_id   INT       NOT NULL,
  room_id     INT       NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlists_tenant_room (tenant_id, room_id),
  CONSTRAINT fk_wishlists_tenant FOREIGN KEY (tenant_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlists_room   FOREIGN KEY (room_id)   REFERENCES rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB;