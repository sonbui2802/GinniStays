-- ============================================================
-- Ginni Stays — Optimized Database Schema (Flat Architecture)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ginni_stays
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ginni_stays;

-- 0. XÓA BẢNG CŨ (Theo thứ tự an toàn của khóa ngoại)
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `contracts`;
DROP TABLE IF EXISTS `viewing_requests`;
DROP TABLE IF EXISTS `property_images`;
DROP TABLE IF EXISTS `properties`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('tenant','landlord','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tenant',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. PROPERTIES (Listing / Bài đăng gộp)
-- ------------------------------------------------------------
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `landlord_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(15,0) NOT NULL,
  `area` decimal(6,1) DEFAULT NULL,
  `max_occupants` int DEFAULT NULL,
  `current_occupants` int NOT NULL DEFAULT '0',
  `property_type` enum('boarding_house','apartment_building','whole_house','single_apartment','sleepbox','commercial_space') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'boarding_house',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `amenities` json DEFAULT NULL COMMENT 'Danh sách tiện ích',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `bedrooms` int NOT NULL DEFAULT 1,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rental_status` enum('available','rented','hidden') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  PRIMARY KEY (`id`),
  KEY `fk_properties_landlord` (`landlord_id`),
  KEY `idx_prop_location` (`city`,`district`),
  CONSTRAINT `fk_properties_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. PROPERTY_IMAGES
-- ------------------------------------------------------------
CREATE TABLE `property_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Link Cloudinary',
  `is_thumbnail` tinyint(1) DEFAULT '0' COMMENT 'TRUE nếu là ảnh đại diện',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_prop_images` (`property_id`),
  CONSTRAINT `fk_prop_images` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. VIEWING_REQUESTS
-- ------------------------------------------------------------
CREATE TABLE `viewing_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `preferred_date` date DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_vr_tenant` (`tenant_id`),
  KEY `fk_vr_property` (`property_id`),
  CONSTRAINT `fk_vr_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vr_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. CONTRACTS
-- ------------------------------------------------------------
CREATE TABLE `contracts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `landlord_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `monthly_rent` decimal(15,0) NOT NULL,
  `deposit` decimal(15,0) DEFAULT NULL,
  `terms` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','expired','terminated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_contracts_tenant` (`tenant_id`),
  KEY `fk_contracts_landlord` (`landlord_id`),
  KEY `idx_contracts_property_status` (`property_id`,`status`),
  CONSTRAINT `fk_contracts_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contracts_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contracts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. WISHLISTS
-- ------------------------------------------------------------
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `property_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlists_tenant_property` (`tenant_id`,`property_id`),
  KEY `fk_wishlists_property` (`property_id`),
  CONSTRAINT `fk_wishlists_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlists_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE properties 
ADD COLUMN bedrooms INT NOT NULL DEFAULT 1;
ALTER TABLE contracts
  ADD COLUMN tenant_name VARCHAR(100) AFTER tenant_id,
  ADD COLUMN tenant_cccd VARCHAR(20) AFTER tenant_name,
  ADD COLUMN tenant_address VARCHAR(255) AFTER tenant_cccd,
  ADD COLUMN tenant_phone VARCHAR(20) AFTER tenant_address;
ALTER TABLE contracts MODIFY COLUMN tenant_id INT NULL;
ALTER TABLE contracts 
  ADD COLUMN signed_at TIMESTAMP NULL,
  MODIFY COLUMN status ENUM('pending_tenant','active','expired','terminated') NOT NULL DEFAULT 'pending_tenant';