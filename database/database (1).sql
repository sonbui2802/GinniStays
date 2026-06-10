-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: ginni_stays
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `tenant_id` int DEFAULT NULL,
  `tenant_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_cccd` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landlord_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `monthly_rent` decimal(15,0) NOT NULL,
  `deposit` decimal(15,0) DEFAULT NULL,
  `terms` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending_tenant','active','expired','terminated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_tenant',
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `signed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contracts_tenant` (`tenant_id`),
  KEY `fk_contracts_landlord` (`landlord_id`),
  KEY `idx_contracts_property_status` (`property_id`,`status`),
  CONSTRAINT `fk_contracts_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contracts_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contracts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES (1,14,NULL,NULL,NULL,NULL,NULL,3,'2026-02-02','2026-03-02',423094233,324234234,'Không nuôi thú cưng','active',NULL,'2026-05-25 07:11:31',NULL),(2,12,2,'Test User','213123123123','123123123123','213123123123',3,'2026-06-04','2026-06-15',6000000,213123123,'123123123','pending_tenant',NULL,'2026-06-09 06:53:32',NULL);
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `landlord_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(15,0) NOT NULL,
  `area` decimal(6,1) DEFAULT NULL,
  `max_occupants` int DEFAULT NULL,
  `current_occupants` int NOT NULL DEFAULT '0',
  `property_type` enum('boarding_house','apartment_building','whole_house','single_apartment','sleepbox','commercial_space') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'boarding_house',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `amenities` json DEFAULT NULL COMMENT 'Danh sách tiện ích',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rental_status` enum('available','rented','hidden') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `bedrooms` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_properties_landlord` (`landlord_id`),
  KEY `idx_prop_location` (`city`,`district`),
  CONSTRAINT `fk_properties_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (12,3,'Căn hộ phân khu The Saphirre Vinhomes OceanPark 1','Căn Studio, full đồ: 5tr5.\n* Cam kết đối với khách hàng.\n- Khách tìm nhà cũng giống em tìm nhà.\n- Có gì nói đấy, tư vấn thật tâm.\n- Deal giá với chủ nhà để có một mức giá tốt.\n- Hỗ trợ mọi vấn đề phát sinh đến khi hết hợp đồng.',6000000,28.0,2,0,'single_apartment','Căn S2.05 - 15.06, Khu đô thị Vinhomes Ocean Park 1','Kiêu Kỵ','Gia Lâm','Hà Nội',NULL,NULL,'[\"Wifi\", \"Điều hòa\", \"Nóng lạnh\", \"Máy giặt\", \"Chỗ để xe\", \"Tủ lạnh\", \"Giường tủ\", \"Bếp\", \"Bảo vệ 24/7\", \"Thang máy\"]','2026-05-07 15:58:24','approved','available',1),(13,3,'Chung cư 3PN Hateco Hoàng Mai','- Diện tích: 107m2, 3PN - 2VS\n- Tầng thấp, nhà 2 ban công rộng thoáng, mát.\n- Nội thất đầy đủ, giường 2 tầng ... chỉ việc xách vali đến ở.',12000000,107.0,5,0,'apartment_building','25A Hưng Thịnh, Yên Sở, Hà Nội','Yên Sở ','Hoàng Mai','Hà Nội',20.96306292,105.86463332,'[\"Wifi\", \"Chỗ để xe\", \"Thang máy\", \"Bảo vệ 24/7\", \"Tủ lạnh\", \"Điều hòa\", \"Nóng lạnh\", \"Giường tủ\", \"Bếp\", \"Máy giặt\"]','2026-05-18 14:36:48','approved','available',1),(14,3,'Phòng trọ Thủ Đức NHÀ 1 TRỆT 1 LẦU MỚI XÂY','Cho thuê phòng 1 lầu 1 trệt\n\n- Phòng ngay Hoàng Diệu 2\n\n- Rộng, sạch. thoáng mát\n\nMáy giặt chung,\n\nCamera an ninh, giờ giấc tự do, cửa vân tay\n\nCửa sổ lớn, thoáng.\n\nKhông chung chủ.\n\nVị trí gần các trường ĐH ngân hàng, SPKT, Nông Lâm, làng đại học, Ngã Tư Thủ Đức..v.v..\n\nChợ và BHX đầu hẻm.',3700000,22.0,3,0,'boarding_house','số 7 Đường Hoàng Diệu 2, Phường Linh Xuân, Hồ Chí Minh',' Phường Linh Xuân','Thủ Đức','Hồ Chí Minh',10.84855361,106.76450372,'[\"Điều hòa\", \"Wifi\", \"Nóng lạnh\", \"Máy giặt\", \"Bếp\", \"Giường tủ\", \"Chỗ để xe\", \"Bảo vệ 24/7\", \"Tủ lạnh\"]','2026-05-19 03:38:53','approved','available',2),(15,3,' phòng cao cấp khép kín ngõ 123 Trần Cung (nhà số 4 ngách 2)','4tr8_ #5tr/1 phòng.\nNhà mới, có thang máy, đẹp xinh lung linh, đồ xin xò. Vào ở luôn.\nNội thất: Điều hoà, nóng lạnh, bếp từ đôi, hút mùi, giường, tủ. Máy giặt sấy không cần phơi. Pccc đầy đủ.\nĐóng 1 cọc 1, điện 4k/1 số, dịch vụ 200k/ 1 người, nước 100k/1 người, internet: 100k/1 phòng.',4800000,18.0,4,0,'boarding_house','Số 4, ngách 2, ngõ 123 Trần Cung','Nghĩa Đô','Cầu Giấy','Hà Nội',21.04937410,105.79005182,'[\"Wifi\", \"Điều hòa\", \"Thang máy\", \"Chỗ để xe\", \"Tủ lạnh\", \"Giường tủ\", \"Nóng lạnh\", \"Bảo vệ 24/7\", \"Máy giặt\", \"Bếp\"]','2026-05-26 00:04:48','approved','available',2),(16,3,'Cho thuê phòng trọ:tại 27 võ chí công,cầu giấy, full nội thất có máy giặt riêng+ sấy. Tại ngõ 27','Chính chủ cho thuê phòng studio vskk,nhà mới,phòng mới pull nội thất,có máy giặt,sấy. Giá chỉ từ:3tr9\nđiều hoà\nnóng lạnh\ntủ lạnh\nmáy giặt\nmáy sấy\nbếp từ ..\nkhông chung chủ giờ giấc tự do .\nthang máy nhật sịn.\npccc trang bị từng phòng.\ncửa phòng trang bị cửa thép chống cháy.từng phòng\nhệ thống camera anninh.\ntoà ccmn xây mới có nhiều loại phòng ,từ ở 1 mình đến vk trẻ,hộ gia đình,có phòng đơn và cả phòng 2+khach ngủ riêng biệt.\nchỉ cần sách vali đếnvào ở ngay.\ngiá từ : 3tr9-5tr',3800000,20.0,3,0,'boarding_house','27  Đường Võ Chí Công, Phường Nghĩa Đô, Quận Cầu Giấy, Hà Nội','Nghĩa Đô','Cầu Giấy','Hà Nội',21.04937866,105.80507755,'[\"Wifi\", \"Điều hòa\", \"Nóng lạnh\", \"Máy giặt\", \"Bếp\", \"Tủ lạnh\", \"Giường tủ\", \"Chỗ để xe\", \"Thang máy\", \"Bảo vệ 24/7\"]','2026-05-26 00:13:26','approved','available',1),(17,3,'Cho thuê phòng trọ tại KĐT Geleximco Lê Trọng Tấn - Dương Nội - Hà Nội','Phòng trọ cho thuê tại KĐT Geleximco Lê Trọng Tấn - Dương Nội - Hà Nội.\n- Diện tích phòng 15 - 25m² khép kín.\n- Tiện ích: Sàn gỗ, điều hoà, nóng lạnh, tủ lạnh, kệ bếp, tủ bếp, giường + tủ quần áo, nhà WC khép kín...\n- Dịch vụ: Internet, máy giặt, để xe máy có mái che miễn phí, chỗ sạc xe điện có mái che...\n- Đơn giá phòng: Giá phòng từ 3.5-4.3tr/th, điện sh 4k/số, nước 100k/ng, phí DV 200/ng.',3500000,20.0,2,0,'boarding_house','Khu đô thị Geleximco - Lê Trọng Tấn, Đường Lê Trọng Tấn, Phường Dương Nội, Quận Hà Đông, Hà Nội','Dương Nội','Hà Đông','Hà Nội',20.98079080,105.74066162,'[\"Wifi\", \"Chỗ để xe\", \"Thang máy\", \"Bảo vệ 24/7\", \"Tủ lạnh\", \"Điều hòa\", \"Nóng lạnh\", \"Giường tủ\", \"Máy giặt\"]','2026-05-26 08:09:40','approved','available',1),(18,3,'Siêu phẩm ban công cực thoáng Thuỵ Khuê gần Ba Đình, Cầu Giấy ','Nhà mới sẵn full đồ ngay đầu Thuỵ Khuê tiện Ba Đình, Cầu Giấy - Vành Đai 1 y hình ở được luôn\n\nNgõ 562 Thuỵ Khê nhà mới khai trương\nChỉ từ 4tr5\n\nPhòng đơn khép kín,phòng full đồ ( tủ lạnh , máy giặt riêng , gối , đệm - đều có ban công thoáng\nGần hồ tây , Lạc Long Quân , Hoàng Hoa Thám\n\nNhận hđ 3th , nhận người nước ngoài và xe điện ok',8000000,255.0,5,0,'apartment_building','Số 5, đường Thụy Khuê, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','Thụy Khuê','Tây Hồ','Hà Nội',21.04685552,105.81211567,'[\"Wifi\", \"Chỗ để xe\", \"Thang máy\", \"Tủ lạnh\", \"Điều hòa\", \"Nóng lạnh\", \"Máy giặt\", \"Bảo vệ 24/7\", \"Bếp\", \"Giường tủ\"]','2026-05-26 08:38:54','approved','available',1),(19,3,'Cho thuê phòng trọ tại Phú Đô - Mỹ Đình','Phòng khép kín, full đồ, nấu ăn riêng, có ban công, gác xếp.\nNhà mới xây, thang máy nhập khẩu, phòng cháy đạt chuẩn.\nPhí dịch vụ 150k/người/tháng (đã bao gồm máy giặt, máy sấy).\nĐiện 3,8k/số; nước 35k/khối.\nInternet 100k/phòng.\nGửi xe free.',3000000,20.0,2,0,'boarding_house','Số 10 , Đường Phú Đô, Phường Phú Đô, Quận Nam Từ Liêm, Hà Nội','Phú Đô','Nam Từ Liêm','Hà Nội',21.01369860,105.76849222,'[\"Wifi\", \"Chỗ để xe\", \"Bảo vệ 24/7\", \"Điều hòa\", \"Tủ lạnh\", \"Giường tủ\", \"Nóng lạnh\", \"Máy giặt\", \"Bếp\"]','2026-05-31 01:25:56','approved','available',1),(20,3,'Cho thuê phòng trọ ngõ 523 Minh Khai (651 MK cũ) mới rộng, nóng lạnh, wifi, điều hoà giá 2,5tr/th','Nhà mới XD - Cho thuê phòng trọ có diện tích 45 m²/tầng. (2 phòng + 1wc)/tầng.\n+ Nhà có chỗ nấu ăn sạch sẽ(tầng 1, tầng 5) có bếp dùng gọn gàng, có chỗ phơi đồ(tầng 5 có mái che)chỗ để xe tầng 1.\n+ Phòng đã lát sàn gỗ, điều hoà, có internet, bình nóng lạnh.\n- Điện nước thanh toán theo công tơ.\n- Vị trí nhà cách đường 2 ô tô tránh nhau 100 m, gần Times City 300 m, đại học Kinh Doanh Công Nghệ, Bách Khoa, Xây Dựng, Kinh Tế Quốc Dân, Viện Mở.\n- Khu dân trí cao, an ninh tốt, giao thông thuận tiện,\n- Có chỗ để xe tầng 1.\n- Thích hợp, người đi làm, cặp vợ chồng trẻ, sinh viên năng động ở.\n- Chính chủ cho thuê không mất tiền môi giới (MTG).\n- Giá cho thuê 2,5 tr/tháng.',2500000,20.0,4,0,'whole_house','ngõ 523 Minh Khai, Đường Minh Khai, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Hà Nội','Vĩnh Tuy','Hai Bà Trưng','Hà Nội',21.00355289,105.86889267,'[\"Wifi\", \"Chỗ để xe\", \"Tủ lạnh\", \"Điều hòa\", \"Nóng lạnh\", \"Giường tủ\", \"Bếp\", \"Máy giặt\"]','2026-05-31 01:40:12','approved','available',1),(21,3,'Phòng có bảo vệ Gốc Đề Minh Khai khép kín, điều hòa, nóng lạnh ','Ngách 67 ngõ Gốc Đề Minh Khai và ngõ 254 Minh Khai 2 tòa có bảo vệ trông xe cho thuê.\nKhép kín, nóng lạnh, điều hòa, phòng to thêm giường, tủ.\nGiá: 2,5tr.',1500000,18.0,2,0,'boarding_house','Số 10, Ngách 67 ngõ Gốc Đề Minh Khai','Tương Mai','Hai Bà Trưng','Hà Nội',20.99322041,105.85489690,'[\"Điều hòa\", \"Tủ lạnh\", \"Giường tủ\", \"Nóng lạnh\", \"Bếp\", \"Wifi\", \"Chỗ để xe\"]','2026-05-31 02:45:27','approved','available',1),(22,3,'Cho thuê gấp Nhà trọ đẹp, nhiều tiện ích tại Ngõ 207, Xuân Đỉnh, Bắc Từ Liêm, 3,5 triệu, 25m2','Nhanh tay! Nhà trọ cho thuê tại Ngõ 207, Đường Xuân Đỉnh, Phường Xuân Đỉnh, Hà Nội (cũ: Quận Bắc Từ Liêm, Hà Nội) với diện tích 25m², giá chỉ 3,5 triệu VND. Đây là lựa chọn lý tưởng cho những ai đang tìm kiếm không gian sống tiện nghi.\n\n- Diện tích 25m² thoáng đãng, tiện nghi đầy đủ +\n- Giá thuê hấp dẫn chỉ 3,5 triệu VND/tháng +\n- Gần các dịch vụ thiết yếu như bệnh viện, trường học +\n- Khu vực an ninh tốt, môi trường sống yên tĩnh +\n\nĐiểm cộng: Nhà trọ nằm trong khu vực thuận tiện, gần các bệnh viện như bệnh viện mặt trời và bệnh viện nam thăng long, giúp dễ dàng tiếp cận dịch vụ y tế. Đặc biệt, công viên Hòa Bình gần đó tạo không gian thư giãn lý tưởng.\n\nTiện ích xung quanh:\n- Bệnh viện mặt trời - Sun Group International Hospital\n- Bệnh viện nam thăng long\n- Công viên Hòa Bình\n- Trường Tata English - Tài chính\n',3500000,25.0,4,0,'boarding_house',' Ngõ 207, Đường Xuân Đỉnh, Phường Xuân Đỉnh, Quận Bắc Từ Liêm, Hà Nội','Xuân Đỉnh','Bắc Từ Liêm','Hà Nội',21.06680004,105.79677343,'[\"Wifi\", \"Điều hòa\", \"Nóng lạnh\", \"Tủ lạnh\", \"Giường tủ\", \"Chỗ để xe\"]','2026-06-07 15:15:53','approved','available',2),(23,3,'Cho thuê phòng Xuân Đỉnh - mới tinh - ngõ ô tô','Cho thuê phòng Xuân Đỉnh 3.xxtr/th - Mới tinh - ngõ ô tô.\n\nVị trí: Xuân Đỉnh, Bắc Từ Liêm (ngõ rộng ô tô qua, giao thông cực tiện).\n\nGiá thuê: 3.xxtr/tháng.\n\nNội thất: Full đồ mới 100% - có các loại phòng ban công - 1N1K - có cả giường đơn & giường tầng (phù hợp ở ghép).\n\nTiện nghi: Thang máy, nhà để xe siêu rộng, đầy đủ tiện ích xung quanh.\n\nAn ninh: Khóa vân tay, camera 24/24, có bảo vệ trực - yên tâm tuyệt đối.\n\nẢnh thật - phòng sẵn - dọn vào ở ngay!\n',3800000,30.0,3,0,'boarding_house','435, Đường Xuân Đỉnh, Phường Xuân Đỉnh, Quận Bắc Từ Liêm, Hà Nội','Xuân Đinh','Bắc Từ Liêm','Hà Nội',21.06039011,105.79353333,'[\"Wifi\", \"Tủ lạnh\", \"Giường tủ\", \"Bếp\", \"Máy giặt\", \"Nóng lạnh\", \"Điều hòa\"]','2026-06-07 15:28:41','approved','available',1),(24,3,'Cho thuê chung cư mini đủ đồ 25m2, Đầm Trấu Nguyễn Khoái HBT - HN','Chính chủ cho thuê phòng chung cư mini đủ đồ 87 Nguyễn Khoái, Đầm Trấu.\nGần Phố Huế, Trần Khát Trân, cách viện 108 khoảng 0,5 km.\n- Gần nhiều trường đại học, Dược, Bách Khoa, Kinh Tế, Xây Dựng, cách phố cổ chỉ 5 phút.\n- Còn 1 phòng, diện tích 25m², vệ sinh khép kín có thang máy rộng, tốc độ cao, có bếp riêng từng phòng,\nGiá cho thuê 3,7 triệu\nTiện ích nội thất.\n- Phòng khép kín, trang bị sẵn điều hòa, nóng lạnh, giường, tủ quần áo, tủ bếp, chậu rửa.\n- Nhà có nhiều cửa sổ, ô thoáng thoáng mát.\n- Không chung chủ đi lại thoải mái.\nMáy giặt, sân phơi rộng, free để xe 24/7 tại tầng 1.\n\n- Tầng hầm để xe riêng biệt an toàn. Trang bị camera 24/24.\n- Lắp đặt hệ thống đèn cảm biến tự động hoàn toàn.\n- Dọn vệ sinh hàng tuần, không gian ở sạch sẽ.\n- Đặc biệt không chung chủ, giờ giấc tự do thoải mái.\n- Nhanh tay để sở hữu phòng đẹp giá tốt.\n',3500000,25.0,4,0,'apartment_building','87 Nguyễn Khoái, Đường Nguyễn Khoái, Phường Bạch Đằng, Quận Hai Bà Trưng, Hà Nội','Bạch Đằng','Hai Bà Trưng','Hà Nội',21.01240626,105.86434364,'[\"Wifi\", \"Điều hòa\", \"Nóng lạnh\", \"Máy giặt\", \"Tủ lạnh\", \"Chỗ để xe\", \"Thang máy\", \"Bảo vệ 24/7\", \"Giường tủ\", \"Bếp\"]','2026-06-07 15:46:47','approved','available',1),(25,3,'Cho thuê nhà trọ tại 8 ngõ 78, Lò Đúc, 6,5 triệu, 36 m²','Nhà trọ cho thuê tại 8 ngõ 78, phố Lò Đúc, phường Phạm Đình Hổ, Hà Nội (cũ: quận Hai Bà Trưng, Hà Nội) với diện tích 36m², 1PN, 1WC, full nội thất. Nơi ở lý tưởng cho những ai cần không gian riêng tư và thoải mái. Mặt tiền 5m, ngõ rộng 3m, dễ dàng di chuyển. Giá cả chỉ 6,5 triệu VND, quá hời cho một chỗ ở tiện nghi như vậy. Không gian thoáng đãng, ban công hướng Tây Nam, phù hợp cho những ai yêu thích ánh sáng tự nhiên.\n\nĐịa điểm tiện ích xung quanh\nCó nhiều tiện ích gần kề như bệnh viện y học cổ truyền trung ương, bệnh viện trung ương quân đội 108, công viên tuổi trẻ thủ đô, công viên thống nhất, và siêu thị Winmart+.',6500000,36.0,4,0,'boarding_house',' 8 ngõ 78, Phố Lò Đúc, Phường Phạm Đình Hổ, Quận Hai Bà Trưng, Hà Nội','Phạm Đình Hổ','Hai Bà Trưng','Hà Nội',21.01092287,105.85930109,'[\"Wifi\", \"Nóng lạnh\", \"Điều hòa\", \"Máy giặt\", \"Chỗ để xe\", \"Bếp\", \"Giường tủ\", \"Tủ lạnh\"]','2026-06-08 02:37:01','approved','available',1),(30,3,'Khu vực Thanh Nhàn - Phòng đủ đồ cao cấp - Thang máy - PCCC','Chào mừng bạn đến với không gian sống đẳng cấp, được thiết kế tỉ mỉ từng chi tiết. Tòa nhà mới hoàn thiện, sẵn sàng đón cư dân đầu tiên.\n\n- Nội thất cao cấp - chỉ việc xách vali vào ở:\n+ Khu bếp xịn xò: Hệ tủ bếp kịch trần (màu vân gỗ/ghi xám sang trọng), trang bị sẵn hút mùi âm tủ, bếp từ, bồn rửa vòi xoay 360 độ, khoang tủ lạnh rộng rãi.\n+ Không gian nghỉ ngơi: Giường ngủ thiết kế thông minh tích hợp ngăn kéo để đồ, tối ưu diện tích, có sofa bàn ăn lịch sự.\n+ Góc làm việc: Bàn làm việc/bàn học liền kề hệ tủ trang trí và tủ quần áo kịch trần, hệ thống đèn LED hắt sáng cực chill, tạo cảm hứng làm việc tại nhà.\n+ Tiện nghi: Máy giặt, điều hòa, thiết bị vệ sinh cao cấp.\n+ Thang máy: Tiêu chuẩn khách sạn, an toàn, chạy êm, bộ lưu điện đưa thang về tầng gần nhất trong trường hợp mất điện bất ngờ.\n+ Hệ thống PCCC: Đạt tiêu chuẩn, đầy đủ lối thoát hiểm, cửa chống cháy 100%, mặt nạ, bình chữa cháy, đầu báo cháy, đầu chữa cháy đến từng phòng.\n\n- Bảng giá phòng:\n+ Phòng trong 25m²: 5.500.000 VNĐ/tháng (trục trong, ấm cúng, tiện nghi).',5500000,25.0,6,0,'boarding_house','Đường Kim Ngưu, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Hà Nội','Vĩnh Tuy','Hai Bà Trưng','Hà Nội',20.99766333,105.86288452,'[\"Wifi\", \"Điều hòa\", \"Nóng lạnh\", \"Máy giặt\", \"Bếp\", \"Tủ lạnh\", \"Chỗ để xe\", \"Bảo vệ 24/7\", \"Thang máy\"]','2026-06-08 03:02:00','approved','available',1),(31,3,'Cho thuê phòng trọ khép kín, có ban công thoáng sáng, giá rẻ 4,0 tr Trần Duy Hưng, Cầu Giấy','Trần Duy Hưng Chỉ 4tr triệu/tháng.\nPhòng 202 khép kín nhà 37, ngõ 148 Trần Duy Hưng, Hà Nội.\nGiá mới: 4,0 triệu/tháng Ở Luôn.\nFull nội thất như hình: Giường, đệm, tủ quần áo, tủ lạnh, bàn ghế, máy giặt.\nKhóa vân tay, camera an ninh, không chung chủ, giờ giấc tự do.\nĐi bộ ra Big C, Đại học Lao động Xã hội... Ngõ rộng ô tô.\nDịch vụ:\nĐiện: 4k/kWh.\nNước: 120k/người.\nDịch vụ: 150k/người/tháng.',4000000,28.0,3,0,'boarding_house','số 37, ngõ 148, Đường Trần Duy Hưng','Trung Hòa','Cầu Giấy','Hà Nội',20.90737845,105.64429522,'[\"Wifi\", \"Điều hòa\", \"Nóng lạnh\", \"Máy giặt\", \"Giường tủ\", \"Chỗ để xe\", \"Tủ lạnh\", \"Bếp\"]','2026-06-08 06:32:54','approved','available',1),(32,3,'Phòng 202 Nhà số 180 ngõ 148 Trần Duy Hưng khép kín, đủ đồ, chỉ 4.2 triệu.','Phòng 202 Nhà số 37 ngõ 148 Trần Duy Hưng khép kín, đủ đồ, chỉ 4.2 triệu.\n\nNhà ô tô qua ngõ, ngõ ngắn, thẳng, cách đường Trần Duy Hưng 100m, nhiều tiện ích. Gần Đại Học Thương Binh và Xã Hội, gần BigC\n\nXe để tầng 1, máy giặt, phơi tầng 5, khóa vân tay, không chung chủ.\n\nNội thất gồm: Giường, tủ, nệm ga, gối, sofa, ghế, bếp, điều hòa, nóng lạnh, wifi riêng từng phòng.',4200000,25.0,3,0,'boarding_house',' số 37 ngõ 148 Trần Duy Hưng','Trung Hòa','Cầu Giấy','Hà Nội',21.02787887,105.80441236,'[\"Wifi\", \"Chỗ để xe\", \"Thang máy\", \"Bảo vệ 24/7\", \"Tủ lạnh\", \"Điều hòa\", \"Nóng lạnh\", \"Giường tủ\", \"Bếp\", \"Máy giặt\"]','2026-06-08 06:47:06','approved','available',1),(33,3,'Chung cư mini 25m2 số 5E ngách 68 ngõ 29 Khương Hạ, Q Thanh Xuân','Chính chủ cho thuê căn hộ chung cư số 5E ngách 68 ngõ 29 Khương Hạ - Vũ Tông Phan - Ngã Tư Sở. Diện tích 25m, khép kín. Giá thuê: 4 triệu - 4,5 triệu - 5 triệu\nCăn hộ mới 100% có thang máy, có trang bị đủ đồ:\n- Điều hòa 2 chiều.\n- Nóng lạnh.\n- Giường, tủ.\n- Bàn làm việc làm việc hoặc bàn trang điểm.\n- Smart tivi.\n- Tủ lạnh.\n- Máy giặt chung.\n- Rèm cửa cản nắng.\n- Có lồng sắt phơi quần áo riêng từng phòng.\n- Tủ bếp có vách kín ngăn mùi, có bồn rửa.\nPhòng thoáng có đủ nắng và gió. Tòa nhà có bảo vệ 24/24 nên an ninh cực tốt, ra vào thoải mái, nhà để xe rộng rãi. Nhà mặt view hồ mát mẻ. Ngõ rộng 6m 2 ô tô tránh nhau. ',4000000,25.0,3,0,'boarding_house','số 5E ngách 68 ngõ 29 Khương Hạ, Ngõ 29 Phố Khương Hạ',' Khương Đình','Thanh Xuân','Hà Nội',20.98888869,105.81445456,'[\"Wifi\", \"Chỗ để xe\", \"Thang máy\", \"Bảo vệ 24/7\", \"Tủ lạnh\", \"Điều hòa\", \"Nóng lạnh\", \"Giường tủ\", \"Bếp\", \"Máy giặt\"]','2026-06-08 07:31:00','approved','available',1),(34,3,'Cho thuê Nhà trọ đẹp, 3,5 triệu, 28m2 tại phố Kim Hoa, Khâm Thiên, Đống Đa, Hà Nội','Chỗ ở siêu xịn tại phố Kim Hoa, phường Văn Miếu-Quốc Tử Giám, Hà Nội (cũ: quận Đống Đa, Hà Nội) đang chờ đón! Nhà trọ đẹp, 2PN, 1WC, nội thất full, thích hợp cho những ai muốn có không gian riêng tư và thoải mái. Diện tích 28m², giá chỉ 3,5 triệu VND, với thời gian cho thuê linh hoạt từ 6 tháng trở lên. Mặt tiền 4m cực kỳ thuận tiện cho việc kinh doanh hoặc chỉ đơn giản là sống thoải mái. Ngõ vào rộng 2m, dễ dàng cho xe cộ đi lại.\n\nĐịa điểm tiện ích xung quanh\n- Trường cao đẳng y tế Hà Nội\n- Bệnh viện K, bệnh viện y học cổ truyền trung ương\n- Siêu thị tự chọn B11 Kim Liên, WinMart, WinMart+ 27 Ngô Thì Nhậm\n- Công viên Thống Nhất, công viên Thống Nhất cổng Lê Duẩn',3500000,28.0,5,0,'boarding_house',' số 12, Phố Kim Hoa','Khâm Thiên','Đống Đa','Hà Nội',21.01739550,105.83812237,'[\"Wifi\", \"Chỗ để xe\", \"Tủ lạnh\", \"Điều hòa\", \"Giường tủ\", \"Nóng lạnh\", \"Bếp\", \"Máy giặt\"]','2026-06-09 06:48:19','approved','available',2);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_images`
--

DROP TABLE IF EXISTS `property_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Link Cloudinary',
  `is_thumbnail` tinyint(1) DEFAULT '0' COMMENT 'TRUE nếu là ảnh đại diện',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_prop_images` (`property_id`),
  CONSTRAINT `fk_prop_images` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_images`
--

LOCK TABLES `property_images` WRITE;
/*!40000 ALTER TABLE `property_images` DISABLE KEYS */;
INSERT INTO `property_images` VALUES (6,12,'https://res.cloudinary.com/dobe3jrog/image/upload/v1778169508/GinniStays_Properties/tfpmos23aqvr8pgezpre.jpg',1,'2026-05-07 15:58:28'),(7,12,'https://res.cloudinary.com/dobe3jrog/image/upload/v1778169508/GinniStays_Properties/efm8d3e2jy9ifsnfw6ah.jpg',0,'2026-05-07 15:58:28'),(8,12,'https://res.cloudinary.com/dobe3jrog/image/upload/v1778169509/GinniStays_Properties/utiudvguoex3mkznvpv5.jpg',0,'2026-05-07 15:58:28'),(9,13,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779115011/GinniStays_Properties/e74dehxmqsfshqaqj0ia.jpg',1,'2026-05-18 14:36:53'),(10,13,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779115011/GinniStays_Properties/traswabirokyo8du7dx7.jpg',0,'2026-05-18 14:36:53'),(11,13,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779115013/GinniStays_Properties/cut6eipkzfd5qpju8cjx.jpg',0,'2026-05-18 14:36:53'),(12,13,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779115013/GinniStays_Properties/njkirp29nmbfiawww3vu.jpg',0,'2026-05-18 14:36:53'),(13,13,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779115012/GinniStays_Properties/juwff8xp3yj6nfbwam2z.jpg',0,'2026-05-18 14:36:53'),(14,14,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779161936/GinniStays_Properties/pgkdneot3luejzz1hkns.jpg',1,'2026-05-19 03:38:59'),(15,14,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779161936/GinniStays_Properties/xvwg7sjuk8fsxbauinda.jpg',0,'2026-05-19 03:38:59'),(16,14,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779161936/GinniStays_Properties/yboldi2y2ou4r9ssz1dm.jpg',0,'2026-05-19 03:38:59'),(17,14,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779161937/GinniStays_Properties/blyjhxov97s3b7ofyurp.jpg',0,'2026-05-19 03:38:59'),(18,14,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779161938/GinniStays_Properties/xoxyyedlilzkjp3est7w.jpg',0,'2026-05-19 03:38:59'),(19,15,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779753891/GinniStays_Properties/mbo1ltqokmhgskf0cqmc.jpg',1,'2026-05-26 00:04:52'),(20,15,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779753892/GinniStays_Properties/bobbab3lwxqd5uow6r5q.jpg',0,'2026-05-26 00:04:52'),(21,15,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779753891/GinniStays_Properties/ex1zfomapke1vrgeasif.jpg',0,'2026-05-26 00:04:52'),(22,15,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779753891/GinniStays_Properties/v0aa3s0xlswk9j4epeab.jpg',0,'2026-05-26 00:04:52'),(23,15,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779753891/GinniStays_Properties/h5s0pv7vgd3rj4vwlo8y.jpg',0,'2026-05-26 00:04:52'),(24,16,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779754409/GinniStays_Properties/utvlukfypljnfzxfu6jd.jpg',1,'2026-05-26 00:13:31'),(25,16,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779754409/GinniStays_Properties/g23sjpdhleqyg7avim1i.jpg',0,'2026-05-26 00:13:31'),(26,16,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779754411/GinniStays_Properties/njkvjrarwfhmziswcrqb.jpg',0,'2026-05-26 00:13:31'),(27,16,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779754410/GinniStays_Properties/hyctis0bym3uzeexoxs9.jpg',0,'2026-05-26 00:13:31'),(28,16,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779754410/GinniStays_Properties/bdasjcl7d3kpshwvs4qv.jpg',0,'2026-05-26 00:13:31'),(29,17,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779782985/GinniStays_Properties/bollpqaipaurd9fcmlpw.jpg',1,'2026-05-26 08:09:46'),(30,17,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779782984/GinniStays_Properties/zbpmmb1uispexiqwgzy3.jpg',0,'2026-05-26 08:09:46'),(31,17,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779782984/GinniStays_Properties/xhjszpmbvwhm8fygipfs.jpg',0,'2026-05-26 08:09:46'),(32,17,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779782984/GinniStays_Properties/udp97dxekpgz80fjiwnp.jpg',0,'2026-05-26 08:09:46'),(33,17,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779782987/GinniStays_Properties/e4reltcapc02wvkoiynb.jpg',0,'2026-05-26 08:09:46'),(34,18,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779784739/GinniStays_Properties/txguznpk0jrq4jna82jy.jpg',1,'2026-05-26 08:39:03'),(35,18,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779784741/GinniStays_Properties/cwrmixqlrtugcfq8o2op.jpg',0,'2026-05-26 08:39:03'),(36,18,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779784740/GinniStays_Properties/iz0totrx02jenn5ja3z1.jpg',0,'2026-05-26 08:39:03'),(37,18,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779784744/GinniStays_Properties/eez1rywzgfbexshdfxzf.jpg',0,'2026-05-26 08:39:03'),(38,18,'https://res.cloudinary.com/dobe3jrog/image/upload/v1779784744/GinniStays_Properties/fpj8ex5rr8wchewsef6z.jpg',0,'2026-05-26 08:39:03'),(39,19,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780190760/GinniStays_Properties/w7ag64hwjxuj2t6lcrf1.jpg',1,'2026-05-31 01:26:03'),(40,19,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780190762/GinniStays_Properties/o2znr0nkxgmqtrgoh64f.jpg',0,'2026-05-31 01:26:03'),(41,19,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780190762/GinniStays_Properties/cgqosim89fczxzy0rlrp.jpg',0,'2026-05-31 01:26:03'),(42,19,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780190763/GinniStays_Properties/qlpnd4ifrbeqv8aqxwuj.jpg',0,'2026-05-31 01:26:03'),(43,19,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780190763/GinniStays_Properties/n8whlweovlc3qnmmo5nn.jpg',0,'2026-05-31 01:26:03'),(44,20,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780191616/GinniStays_Properties/jttvlsovgoaomgul0kti.jpg',1,'2026-05-31 01:40:16'),(45,20,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780191615/GinniStays_Properties/iaeym3u4yrpujmffq8of.jpg',0,'2026-05-31 01:40:16'),(46,20,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780191616/GinniStays_Properties/cexqfknmofkejeectzst.jpg',0,'2026-05-31 01:40:16'),(47,20,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780191617/GinniStays_Properties/tcoag7j5gojuilyvqpdq.jpg',0,'2026-05-31 01:40:16'),(48,20,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780191616/GinniStays_Properties/iqho10wfz5tmivmraxy0.jpg',0,'2026-05-31 01:40:16'),(49,21,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780195529/GinniStays_Properties/pyl1px3509ij0zkklmfg.jpg',1,'2026-05-31 02:45:32'),(50,21,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780195530/GinniStays_Properties/fuzrfpwtm6s9ojgfqvqd.jpg',0,'2026-05-31 02:45:32'),(51,21,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780195531/GinniStays_Properties/x2s9lm4hwltd3wanoyjb.jpg',0,'2026-05-31 02:45:32'),(52,21,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780195532/GinniStays_Properties/fxwqlinuthws4baz1s1r.jpg',0,'2026-05-31 02:45:32'),(53,21,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780195531/GinniStays_Properties/okw8erbazqcp6ey0mdmk.jpg',0,'2026-05-31 02:45:32'),(54,22,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780845356/GinniStays_Properties/uvzjl4f0gc1ybi7nwiaq.jpg',1,'2026-06-07 15:15:57'),(55,22,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780845356/GinniStays_Properties/umicq4rxlkmh6yiwnder.jpg',0,'2026-06-07 15:15:57'),(56,22,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780845356/GinniStays_Properties/hrene7bb3dzjr4whfjmz.jpg',0,'2026-06-07 15:15:57'),(57,22,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780845355/GinniStays_Properties/qzvusea7jbkctrran2ua.jpg',0,'2026-06-07 15:15:57'),(58,22,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780845357/GinniStays_Properties/pluytymp4udcxogru5o4.jpg',0,'2026-06-07 15:15:57'),(59,23,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780846124/GinniStays_Properties/crcuklx6eqfprmcjy2w2.jpg',1,'2026-06-07 15:28:46'),(60,23,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780846125/GinniStays_Properties/u9kdnjudaxowgincs7m2.jpg',0,'2026-06-07 15:28:46'),(61,23,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780846125/GinniStays_Properties/mvxsbe3siwebfgsvmvvx.jpg',0,'2026-06-07 15:28:46'),(62,23,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780846126/GinniStays_Properties/ire8bnrhfg64qkzp7mpd.jpg',0,'2026-06-07 15:28:46'),(63,23,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780846126/GinniStays_Properties/gdb8vaq6ogesqongbn1m.jpg',0,'2026-06-07 15:28:46'),(64,24,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780847210/GinniStays_Properties/axnjjhaqygq96vorsjiz.jpg',1,'2026-06-07 15:46:52'),(65,24,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780847210/GinniStays_Properties/arnbubuyj2ykvmlxhpw0.jpg',0,'2026-06-07 15:46:52'),(66,24,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780847211/GinniStays_Properties/mnq6rqlbrxlt5zwfhpcf.jpg',0,'2026-06-07 15:46:52'),(67,24,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780847212/GinniStays_Properties/o3igdwbxzieavonh25hi.jpg',0,'2026-06-07 15:46:52'),(68,24,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780847211/GinniStays_Properties/krr0avp7zmfr2fbmoytv.jpg',0,'2026-06-07 15:46:52'),(69,25,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780886225/GinniStays_Properties/xdklougcyodiepnfjpwk.jpg',1,'2026-06-08 02:37:06'),(70,25,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780886224/GinniStays_Properties/l6q4ifwgtwizp1dtwsdu.jpg',0,'2026-06-08 02:37:06'),(71,25,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780886226/GinniStays_Properties/yfh06i4nh4tpt4z24iqp.jpg',0,'2026-06-08 02:37:06'),(72,25,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780886225/GinniStays_Properties/i9fcf1wba2lhl8gosyqr.jpg',0,'2026-06-08 02:37:06'),(73,25,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780886226/GinniStays_Properties/ifijnta0enjl1heb5xwc.jpg',0,'2026-06-08 02:37:06'),(74,30,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780887723/GinniStays_Properties/ksxbavqcerx2o2yhejl7.jpg',1,'2026-06-08 03:02:05'),(75,30,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780887724/GinniStays_Properties/ff83f3y6jim2aq2wgfx8.jpg',0,'2026-06-08 03:02:05'),(76,30,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780887725/GinniStays_Properties/vo69cyikdtlnt1jontmd.jpg',0,'2026-06-08 03:02:05'),(77,30,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780887726/GinniStays_Properties/mafw4fktuucifam5eoif.jpg',0,'2026-06-08 03:02:05'),(78,30,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780887726/GinniStays_Properties/fiikcpxgmfplcvos06q2.jpg',0,'2026-06-08 03:02:05'),(79,31,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780900377/GinniStays_Properties/zi1ygavsvcjdzrrhpi3t.jpg',1,'2026-06-08 06:33:00'),(80,31,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780900377/GinniStays_Properties/n4gljhgh36baj2lnxkmw.jpg',0,'2026-06-08 06:33:00'),(81,31,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780900378/GinniStays_Properties/jnluukyubh2gj3m3m10o.jpg',0,'2026-06-08 06:33:00'),(82,31,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780900379/GinniStays_Properties/kop4nqcno54dfju3yque.jpg',0,'2026-06-08 06:33:00'),(83,31,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780900378/GinniStays_Properties/u907defjhg00g0pxmq79.jpg',0,'2026-06-08 06:33:00'),(84,32,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780901228/GinniStays_Properties/soxe8u4u5oojepfp9o1n.jpg',1,'2026-06-08 06:47:10'),(85,32,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780901228/GinniStays_Properties/tm4rtpra8gc6bjnisqr1.jpg',0,'2026-06-08 06:47:10'),(86,32,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780901229/GinniStays_Properties/j58vy5azfhbvt7fvteac.jpg',0,'2026-06-08 06:47:10'),(87,32,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780901229/GinniStays_Properties/i1nqsvvewe6bax4zopua.jpg',0,'2026-06-08 06:47:10'),(88,32,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780901228/GinniStays_Properties/umxc9cypcj5i8hy1uu0w.jpg',0,'2026-06-08 06:47:10'),(89,33,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780903862/GinniStays_Properties/xkah9pe1usylzaw5kngn.jpg',1,'2026-06-08 07:31:04'),(90,33,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780903862/GinniStays_Properties/h1b8ghphyhc5cyznsyxv.jpg',0,'2026-06-08 07:31:04'),(91,33,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780903863/GinniStays_Properties/izc0gotneazosy06xzsb.jpg',0,'2026-06-08 07:31:04'),(92,33,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780903863/GinniStays_Properties/m3d0mhsbh1iogjifiwj9.jpg',0,'2026-06-08 07:31:04'),(93,33,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780903863/GinniStays_Properties/ri6fafgop8a43umbffqr.jpg',0,'2026-06-08 07:31:04'),(94,34,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780987702/GinniStays_Properties/iiiypdk9dnzqkl1bqjze.jpg',1,'2026-06-09 06:48:25'),(95,34,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780987703/GinniStays_Properties/g6mwzfx8l2zo1hwpx1iv.jpg',0,'2026-06-09 06:48:25'),(96,34,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780987703/GinniStays_Properties/o9ws7ycwbuaceszv9hli.jpg',0,'2026-06-09 06:48:25'),(97,34,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780987702/GinniStays_Properties/vs7lcprypt5rp2zis0th.jpg',0,'2026-06-09 06:48:25'),(98,34,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780987702/GinniStays_Properties/hjqt8aptgvt3zt3cvwox.jpg',0,'2026-06-09 06:48:25'),(99,34,'https://res.cloudinary.com/dobe3jrog/image/upload/v1780987703/GinniStays_Properties/br12otfboqnwlotknf9b.jpg',0,'2026-06-09 06:48:25');
/*!40000 ALTER TABLE `property_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'test@ginnistays.com','$2b$10$Tw1OLdZ2Y/XtJuo4JAbaQ.6DftSVeUSR9SYNb8OCsx5n8AN.iV3Y2','Test User',NULL,'tenant',NULL,1,'2026-04-09 02:58:59'),(3,'chutro@ginnistays.com','$2b$10$l1n/W1qvn5hZ6CnhjLZm9eHjx7aDcIZ0uzXw1SXCEl5ZGyeR5F6ba','Chủ Trọ Của Mọi Người','0947183555','landlord',NULL,1,'2026-04-09 10:14:48'),(5,'admin@gmail.com','$2b$10$UZ8nZ5qAjUXqRQxxnBzTqe/FsboEto4mcKz6Gx2eSYmyZoua0fQ56','ADMIN',NULL,'admin',NULL,1,'2026-05-23 08:11:17'),(6,'chutro2@ginnistays.com','$2b$10$7yHUulzt.dNOoCb6PrF7SuzeBbCH/WHIDNIBGwBPOWoaAHZxky866','Chủ Trọ Dự Bị',NULL,'tenant',NULL,1,'2026-05-24 07:15:59'),(7,'test1@gmail.com','$2b$10$xU/Itmt/.aJENA45zpuxHejg0PmZeYNFZmXuJEcMr5azImdO4a1DC','Nguyễn Tiến Đạt','0942235123','tenant',NULL,1,'2026-05-30 13:47:07');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viewing_requests`
--

DROP TABLE IF EXISTS `viewing_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viewing_requests`
--

LOCK TABLES `viewing_requests` WRITE;
/*!40000 ALTER TABLE `viewing_requests` DISABLE KEYS */;
INSERT INTO `viewing_requests` VALUES (1,12,2,'2026-05-20','Chào chủ nhà, em là sinh viên năm 3 PTIT, em muốn qua xem phòng vào chiều mai ạ.','approved','2026-05-08 03:14:55'),(3,12,2,'2026-12-02','Khung giờ hẹn: 08:00 - 10:00. Lời nhắn: uaw','rejected','2026-05-12 02:43:18'),(4,12,2,'2026-02-12','Khung giờ hẹn: 10:00 - 12:00. Lời nhắn: Cho em xem phong duoc khong','rejected','2026-05-12 09:16:13'),(5,12,2,'2026-12-02','Khung giờ hẹn: 10:00 - 12:00. Lời nhắn: 123','rejected','2026-05-12 09:17:25'),(8,14,7,'2026-06-22','Khung giờ hẹn: 10:00 - 12:00. Lời nhắn: Mình muốn xem phòng, mình là sinh viên.','pending','2026-06-02 02:37:10'),(9,14,2,'2026-06-15','Khung giờ hẹn: 14:00 - 16:00. Lời nhắn: Xin chào, mong được gặp bạn !','pending','2026-06-02 07:08:32'),(10,34,2,'2026-06-16','Khung giờ hẹn: 10:00 - 12:00. Lời nhắn: Xin phép được ghé, nhóm 2 người','approved','2026-06-09 06:51:06');
/*!40000 ALTER TABLE `viewing_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,7,12,'2026-05-30 13:47:16'),(2,2,15,'2026-06-01 15:54:30');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 15:03:57
