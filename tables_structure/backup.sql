

DROP TABLE IF EXISTS `address`;

CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(45) DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `pincode` int DEFAULT NULL,
  `address_proof` varchar(255) DEFAULT NULL,
  `mailing_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Address_ibfk_1_idx` (`state_id`),
  CONSTRAINT `address_ibfk_2` FOREIGN KEY (`id`) REFERENCES `cities_master` (`id`),
  CONSTRAINT `state_ibfk2` FOREIGN KEY (`state_id`) REFERENCES `state_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `athlete`;

CREATE TABLE `athlete` (
  `id` int NOT NULL AUTO_INCREMENT,
  `basic_detail_id` int DEFAULT NULL,
  `personal_detail_id` int DEFAULT NULL,
  `membership_plan_id` int DEFAULT NULL,
  `passportId` int DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  `shooter_membership_id` int DEFAULT NULL,
  `club_dra_listing_id` int DEFAULT NULL,
  `approved_by` varchar(45) DEFAULT NULL,
  `previous_status` varchar(45) DEFAULT NULL,
  `renewal_status` varchar(45) DEFAULT NULL,
  `before_renewal_status` varchar(45) DEFAULT NULL,
  `before_mra_renewal` varchar(45) DEFAULT NULL,
  `block_reason` varchar(45) DEFAULT NULL,
  `unblock_reason` varchar(45) DEFAULT NULL,
  `payment_remark` varchar(45) DEFAULT NULL,
  `is_approved` varchar(45) DEFAULT NULL,
  `is_renewal` varchar(45) DEFAULT NULL,
  `is_awardee` varchar(45) DEFAULT NULL,
  `renewal_rejected_by` varchar(45) DEFAULT NULL,
  `no_of_renewal_rejection` varchar(45) DEFAULT NULL,
  `renewal_approved_at` varchar(45) DEFAULT NULL,
  `number_of_rejection` varchar(45) DEFAULT NULL,
  `rejected_by` varchar(45) DEFAULT NULL,
  `approved_at` varchar(45) DEFAULT NULL,
  `rejected_reason` varchar(255) DEFAULT NULL,
  `is_rejected` varchar(45) DEFAULT NULL,
  `state_unit_id` int DEFAULT NULL,
  `is_blocked` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `basic_detail_id` (`basic_detail_id`),
  KEY `personal_detail_id` (`personal_detail_id`),
  KEY `membership_plan_id` (`membership_plan_id`),
  KEY `passportId` (`passportId`),
  KEY `address_id` (`address_id`),
  KEY `shooter_membership_id` (`shooter_membership_id`),
  KEY `club_dra_listing_id` (`club_dra_listing_id`),
  KEY `Athlete_ibfk_8` (`state_unit_id`),
  KEY `athlete_ibfk_10_idx` (`user_id`),
  CONSTRAINT `athlete_ibfk_1` FOREIGN KEY (`basic_detail_id`) REFERENCES `basic_details` (`id`),
  CONSTRAINT `athlete_ibfk_10` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `athlete_ibfk_4` FOREIGN KEY (`passportId`) REFERENCES `passport` (`id`),
  CONSTRAINT `athlete_ibfk_5` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`),
  CONSTRAINT `athlete_ibfk_6` FOREIGN KEY (`shooter_membership_id`) REFERENCES `shooter_membership` (`id`),
  CONSTRAINT `athlete_ibfk_7` FOREIGN KEY (`club_dra_listing_id`) REFERENCES `club_dra_listing` (`id`),
  CONSTRAINT `athlete_ibfk_8` FOREIGN KEY (`state_unit_id`) REFERENCES `state_unit_master` (`id`),
  CONSTRAINT `athlete_ibfk_9` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_detail_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `basic_details`;

CREATE TABLE `basic_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `state_id` int DEFAULT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `main_event` varchar(45) DEFAULT NULL,
  `approved_by` varchar(45) DEFAULT NULL,
  `playing_events` varchar(255) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `education` varchar(45) DEFAULT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `birth_proof` varchar(255) DEFAULT NULL,
  `place_of_birth` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `alternate_contact_number` varchar(45) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `action_photo` varchar(255) DEFAULT NULL,
  `users_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Basic_Details_ibfk_1_idx` (`state_id`),
  KEY `user_id` (`users_id`),
  CONSTRAINT `state_ibfk` FOREIGN KEY (`state_id`) REFERENCES `state_master` (`id`),
  CONSTRAINT `user_id` FOREIGN KEY (`users_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `cities_master`;

CREATE TABLE `cities_master` (
  `id` int NOT NULL,
  `state_id` int DEFAULT NULL,
  `name` text,
  `status` int DEFAULT NULL,
  `deleted_at` text,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `club_dra_listing`;

CREATE TABLE `club_dra_listing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `approval` varchar(45) DEFAULT NULL,
  `district_unit_id` int DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `district_id` (`district_id`),
  KEY `district_unit_id` (`district_unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `club_dra_listings`;

CREATE TABLE `club_dra_listings` (
  `id` int DEFAULT NULL,
  `type` text,
  `name` text,
  `district_id` int DEFAULT NULL,
  `approval_stage` text,
  `parent_id` int DEFAULT NULL,
  `status` text,
  `created_at` text,
  `updated_at` text,
  `deleted_at` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



DROP TABLE IF EXISTS `coach_details`;

CREATE TABLE `coach_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `coach_name` varchar(45) DEFAULT NULL,
  `from_date` datetime DEFAULT NULL,
  `to_date` datetime DEFAULT NULL,
  `shooter_membership_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shooter_membership_id_idx` (`id`,`shooter_membership_id`),
  KEY `shooter_membership_id_idx1` (`shooter_membership_id`),
  CONSTRAINT `shooter_membership_id` FOREIGN KEY (`shooter_membership_id`) REFERENCES `shooter_membership` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `competition` */

DROP TABLE IF EXISTS `competition`;

CREATE TABLE `competition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comp_code` varchar(45) DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `competition_year` varchar(45) DEFAULT NULL,
  `place` varchar(45) DEFAULT NULL,
  `conducted_by` varchar(45) DEFAULT NULL,
  `secratery_name` varchar(45) DEFAULT NULL,
  `comp_category_id` int DEFAULT NULL,
  `flag` varchar(45) DEFAULT NULL,
  `payment_done` varchar(45) DEFAULT NULL,
  `invoice_no` varchar(45) DEFAULT NULL,
  `invoice_creation_date` varchar(45) DEFAULT NULL,
  `team_invoice_no` varchar(45) DEFAULT NULL,
  `team_invoice_creation_date` datetime DEFAULT NULL,
  `target_type` varchar(45) DEFAULT NULL,
  `detail_creation` varchar(45) DEFAULT NULL,
  `late_fee_end_date` datetime DEFAULT NULL,
  `reg_start_date` datetime DEFAULT NULL,
  `reg_end_date` datetime DEFAULT NULL,
  `cut_off_date` datetime DEFAULT NULL,
  `from_date` datetime DEFAULT NULL,
  `to_date` datetime DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `created_by` varchar(45) DEFAULT NULL,
  `cart_data_flag` varchar(45) DEFAULT NULL,
  `bulk_generated_certificate` varchar(45) DEFAULT NULL,
  `medalist` varchar(45) DEFAULT NULL,
  `in_MQS_applicable` varchar(45) DEFAULT NULL,
  `preferred_location_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `circular` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comp_category_id` (`comp_category_id`),
  KEY `district_id` (`district_id`),
  KEY `preferred_location_id` (`preferred_location_id`),
  KEY `Competition_ibfk_3_idx` (`preferred_location_id`,`location_id`),
  CONSTRAINT `competition_ibfk_1` FOREIGN KEY (`comp_category_id`) REFERENCES `competition_category` (`id`),
  CONSTRAINT `competition_ibfk_2` FOREIGN KEY (`district_id`) REFERENCES `districts_master` (`id`),
  CONSTRAINT `competition_ibfk_5` FOREIGN KEY (`preferred_location_id`) REFERENCES `preferred_location_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `competition_category` */

DROP TABLE IF EXISTS `competition_category`;

CREATE TABLE `competition_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) DEFAULT NULL,
  `is_national` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `competition_prefered_location` */

DROP TABLE IF EXISTS `competition_prefered_location`;

CREATE TABLE `competition_prefered_location` (
  `id` int NOT NULL AUTO_INCREMENT,
  `competition_id` int DEFAULT NULL,
  `prefered_loctaion_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `competion_ibfk_idx` (`competition_id`),
  KEY `prefered_ibfk2_idx` (`prefered_loctaion_id`),
  CONSTRAINT `competion_ibfk` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`id`),
  CONSTRAINT `prefered_ibfk2` FOREIGN KEY (`prefered_loctaion_id`) REFERENCES `preferred_location_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=208 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `details` */

DROP TABLE IF EXISTS `details`;

CREATE TABLE `details` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `competition_id` int unsigned NOT NULL,
  `match_group_id` int unsigned NOT NULL,
  `lanes` int NOT NULL,
  `reserved_lanes` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `defective_lanes` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `start_date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preparation_time` int DEFAULT NULL,
  `change_over_time` int DEFAULT NULL,
  `match_time` int DEFAULT NULL,
  `event_top_shooter` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `total_details` int DEFAULT NULL,
  `event_order` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `details_competition_id_foreign` (`competition_id`),
  KEY `details_match_group_id_foreign` (`match_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `district_unit` */

DROP TABLE IF EXISTS `district_unit`;

CREATE TABLE `district_unit` (
  `id` int DEFAULT NULL,
  `name` text,
  `abbreviation` text,
  `association_name` text,
  `zone_id` text,
  `is_state` text,
  `status` int DEFAULT NULL,
  `block_reason` text,
  `unblock_reason` text,
  `created_at` text,
  `updated_at` text,
  KEY `idx_district_unit_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `districts_master` */

DROP TABLE IF EXISTS `districts_master`;

CREATE TABLE `districts_master` (
  `id` int NOT NULL,
  `name` varchar(105) DEFAULT NULL,
  `code` text,
  `status` text,
  `deleted_at` text,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`),
  KEY `idx_districts_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `event_group_series` */

DROP TABLE IF EXISTS `event_group_series`;

CREATE TABLE `event_group_series` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_group_id` int DEFAULT NULL,
  `title` varchar(105) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `group_id_ibfk_idx` (`match_group_id`),
  CONSTRAINT `group_id_ibfk` FOREIGN KEY (`match_group_id`) REFERENCES `match_groups` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `event_types_master` */

DROP TABLE IF EXISTS `event_types_master`;

CREATE TABLE `event_types_master` (
  `id` int NOT NULL,
  `event_name` text,
  `deleted_at` text,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `events_master` */

DROP TABLE IF EXISTS `events_master`;

CREATE TABLE `events_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text,
  `event_type_id` int DEFAULT NULL,
  `gender_id` int DEFAULT NULL,
  `age_category_id` int DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `deleted_at` text,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `lane_detail_configuaration` */

DROP TABLE IF EXISTS `lane_detail_configuaration`;

CREATE TABLE `lane_detail_configuaration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail_id` int DEFAULT NULL,
  `detail_date_time` varchar(255) DEFAULT NULL,
  `detail_no` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `detail_ibfk_1_idx` (`detail_id`)
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `match_details` */

DROP TABLE IF EXISTS `match_details`;

CREATE TABLE `match_details` (
  `id` int DEFAULT NULL,
  `match_name` text,
  `competition_category` int DEFAULT NULL,
  `match_no` text,
  `format_id` text,
  `segment_id` int DEFAULT NULL,
  `percent_penalty` int DEFAULT NULL,
  `match_category_id` text,
  `fees` double DEFAULT NULL,
  `team_entry_fee` double DEFAULT NULL,
  `qualifying_score` double DEFAULT NULL,
  `fullering_qualifying_score` int DEFAULT NULL,
  `finals` text,
  `nof` text,
  `nos` text,
  `max_shots` text,
  `created_by` text,
  `created_at` text,
  `updated_at` text,
  `no_of_participants` text,
  `shot_per_round` text,
  `event_type_id` int DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `status_by` int DEFAULT NULL,
  `status_date` text,
  `no_of_series` text,
  `shoots_in_series` text,
  `series_titles` text,
  `no_of_stages` text,
  `stage_titles` text,
  `preparation_time` text,
  `changeOver_time` text,
  `match_time` text,
  `sort_order` text,
  `is_mixed` int DEFAULT NULL,
  `max_total_score` text,
  `is_para` int DEFAULT NULL,
  `max_participants` text,
  `qualification_two` text,
  `nop_qualification_two` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `match_group_matches` */

DROP TABLE IF EXISTS `match_group_matches`;

CREATE TABLE `match_group_matches` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `match_group_id` int NOT NULL,
  `match_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_match_group_matches` (`match_group_id`),
  KEY `matches_ibfk1_idx` (`match_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2371 DEFAULT CHARSET=utf8mb3;

/*Table structure for table `match_groups` */

DROP TABLE IF EXISTS `match_groups`;

CREATE TABLE `match_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text,
  `is_mixed` int DEFAULT NULL,
  `no_of_shots` int DEFAULT NULL,
  `max_value` double DEFAULT NULL,
  `no_of_series` int DEFAULT NULL,
  `shoots_in_series` int DEFAULT NULL,
  `series_titles` text,
  `no_of_stages` int DEFAULT NULL,
  `stage_titles` text,
  `type` text,
  `created_at` text,
  `updated_at` text,
  `competition_id` int DEFAULT NULL,
  `rifle` text,
  `pistol` text,
  `shotgun` text,
  `event_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `match_participation_details` */

DROP TABLE IF EXISTS `match_participation_details`;

CREATE TABLE `match_participation_details` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `match_group_id` int unsigned DEFAULT NULL,
  `match_id` int unsigned DEFAULT NULL,
  `match_participation_id` int unsigned DEFAULT '0',
  `wild_card` varchar(191) DEFAULT NULL,
  `match_status` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `eligible_match` enum('0','1') DEFAULT '1',
  `mqs_score` decimal(8,2) unsigned DEFAULT NULL,
  `mqs_comp_name` text,
  `mqs_comp_id` int unsigned DEFAULT NULL,
  `mqs_comp_year` varchar(5) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `mqs_comp_type` enum('MRA','NRAI') DEFAULT NULL,
  `is_offline` tinyint(1) DEFAULT '0',
  `is_previous` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `disapprove_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mpdt_match_group_id` (`match_group_id`),
  KEY `mpdt_match_id` (`match_id`),
  KEY `mpdt_match_participation_id` (`match_participation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26175 DEFAULT CHARSET=latin1;

/*Table structure for table `match_participation_score` */

DROP TABLE IF EXISTS `match_participation_score`;

CREATE TABLE `match_participation_score` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_participation_details_id` int unsigned DEFAULT NULL,
  `series_total` float DEFAULT NULL,
  `inner_10` int DEFAULT NULL,
  `tie` int DEFAULT NULL,
  `score_type` varchar(255) DEFAULT NULL,
  `score_type_final` varchar(255) DEFAULT NULL,
  `by_series_penalty` int DEFAULT NULL,
  `final_tie` int DEFAULT NULL,
  `final_total` float DEFAULT NULL,
  `final_rank` int DEFAULT NULL,
  `shotgun_total` int DEFAULT NULL,
  `shotgun_tie` int DEFAULT NULL,
  `shotgun_final_score` int DEFAULT NULL,
  `shotgun_final_tie` int DEFAULT NULL,
  `shotgun_rank` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `match_participation_details_id` (`match_participation_details_id`),
  CONSTRAINT `match_participation_score_ibfk_1` FOREIGN KEY (`match_participation_details_id`) REFERENCES `match_participation_details` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `match_participations` */

DROP TABLE IF EXISTS `match_participations`;

CREATE TABLE `match_participations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `competition_id` int unsigned DEFAULT NULL,
  `athlete_id` int unsigned DEFAULT NULL,
  `location_id` int unsigned DEFAULT NULL,
  `competitor_code` varchar(50) DEFAULT NULL,
  `status` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `remarks` text,
  `payment_remarks` text,
  `payment_done` enum('0','1') DEFAULT '0' COMMENT '''0'' => ''Unpaid'', ''1'' => ''Paid''',
  `total_fees` double(10,2) DEFAULT NULL,
  `approve_flag` enum('y','n') DEFAULT NULL,
  `payment_amt` decimal(10,2) DEFAULT NULL,
  `receipt_no` varchar(50) DEFAULT NULL,
  `is_para` varchar(255) DEFAULT NULL,
  `is_tripple` varchar(255) DEFAULT NULL,
  `is_autoapproved` varchar(255) DEFAULT NULL,
  `participation_remark` text,
  `status_updated_by` int DEFAULT NULL,
  `super_admin_approve` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `is_sharing_weapon` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `ws_grp_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `mqs_year` varchar(255) DEFAULT NULL,
  `mqs_score` varchar(255) DEFAULT NULL,
  `club_dra_listing_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pl_competition_id` (`competition_id`),
  KEY `pl_shooter_id` (`athlete_id`),
  KEY `club_dra__listing_id` (`club_dra_listing_id`),
  CONSTRAINT `match_participations_ibfk_1` FOREIGN KEY (`club_dra_listing_id`) REFERENCES `club_dra_listing` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19630 DEFAULT CHARSET=latin1;

/*Table structure for table `match_series_score` */

DROP TABLE IF EXISTS `match_series_score`;

CREATE TABLE `match_series_score` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_participant_detail_id` int DEFAULT NULL,
  `match_series_title_id` int DEFAULT NULL,
  `shot_no` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `match_series_score_ibfk_1` (`match_participant_detail_id`),
  KEY `match_series_score_ibfk_2` (`match_series_title_id`),
  CONSTRAINT `match_series_score_ibfk_2` FOREIGN KEY (`match_series_title_id`) REFERENCES `match_series_title_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `match_series_score_total` */

DROP TABLE IF EXISTS `match_series_score_total`;

CREATE TABLE `match_series_score_total` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_participation_details_id` int unsigned DEFAULT NULL,
  `match_series_title_id` int DEFAULT NULL,
  `series_score` int DEFAULT NULL,
  `penalty` int DEFAULT NULL,
  `final_series_score` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `match_participation_details_id` (`match_participation_details_id`),
  KEY `match_series_title_id` (`match_series_title_id`),
  CONSTRAINT `match_series_score_total_ibfk_1` FOREIGN KEY (`match_participation_details_id`) REFERENCES `match_participation_details` (`id`),
  CONSTRAINT `match_series_score_total_ibfk_2` FOREIGN KEY (`match_series_title_id`) REFERENCES `match_series_title_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `match_series_title_master` */

DROP TABLE IF EXISTS `match_series_title_master`;

CREATE TABLE `match_series_title_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `series_title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `matches` */

DROP TABLE IF EXISTS `matches`;

CREATE TABLE `matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `competition_id` int DEFAULT NULL,
  `comp_category_id` int DEFAULT NULL,
  `match_no` varchar(45) DEFAULT NULL,
  `segment_id` int DEFAULT NULL,
  `percent_penalty` varchar(45) DEFAULT NULL,
  `fees` varchar(45) DEFAULT NULL,
  `team_entry_fee` varchar(45) DEFAULT NULL,
  `qualifying_score` varchar(45) DEFAULT NULL,
  `fullering_qualifying_score` varchar(45) DEFAULT NULL,
  `finals` varchar(45) DEFAULT NULL,
  `nof` varchar(45) DEFAULT NULL,
  `nos` varchar(45) DEFAULT NULL,
  `max_shots` varchar(45) DEFAULT NULL,
  `no_of_participant` varchar(45) DEFAULT NULL,
  `created_by` varchar(45) DEFAULT NULL,
  `event_type_id` int DEFAULT NULL,
  `status_by` varchar(45) DEFAULT NULL,
  `status_date` datetime DEFAULT NULL,
  `match_name_id` int DEFAULT NULL,
  `no_of_series` varchar(45) DEFAULT NULL,
  `shoots_in_series` varchar(45) DEFAULT NULL,
  `series_titles` varchar(45) DEFAULT NULL,
  `no_of_stages` varchar(45) DEFAULT NULL,
  `stage_titles` varchar(45) DEFAULT NULL,
  `preparation_time` varchar(45) DEFAULT NULL,
  `changeover_time` varchar(45) DEFAULT NULL,
  `match_time` varchar(45) DEFAULT NULL,
  `is_para` varchar(45) DEFAULT NULL,
  `is_mixed` varchar(45) DEFAULT NULL,
  `max_total_score` varchar(45) DEFAULT NULL,
  `max_participants` varchar(45) DEFAULT NULL,
  `qualification_two` varchar(45) DEFAULT NULL,
  `nof_qualification_two` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `event_type_id` (`event_type_id`),
  KEY `event_id` (`event_id`),
  KEY `competition_id` (`competition_id`),
  KEY `comp_category_id` (`comp_category_id`),
  KEY `segment_id` (`segment_id`),
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`event_type_id`) REFERENCES `event_types_master` (`id`),
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events_master` (`id`),
  CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`id`),
  CONSTRAINT `matches_ibfk_4` FOREIGN KEY (`comp_category_id`) REFERENCES `competition_category` (`id`),
  CONSTRAINT `matches_ibfk_5` FOREIGN KEY (`segment_id`) REFERENCES `segments_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `membership_detail_master` */

DROP TABLE IF EXISTS `membership_detail_master`;

CREATE TABLE `membership_detail_master` (
  `id` int NOT NULL,
  `main` text,
  `type` text,
  `sub_type` text,
  `fees_first_year` int DEFAULT NULL,
  `fees_yearly_renewal` int DEFAULT NULL,
  `fees_on_update` int DEFAULT NULL,
  `show_validity` int DEFAULT NULL,
  `created_at` text,
  `updated_at` text,
  `deleted_at` text,
  PRIMARY KEY (`id`),
  KEY `Shooter_Membership_ibfk_3_idx` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `organising_secretary` */

DROP TABLE IF EXISTS `organising_secretary`;

CREATE TABLE `organising_secretary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `secratery_name` varchar(45) DEFAULT NULL,
  `post` varchar(45) DEFAULT NULL,
  `competition_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organising_secretary_ibfk_1` (`competition_id`),
  CONSTRAINT `organising_secretary_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `passport` */

DROP TABLE IF EXISTS `passport`;

CREATE TABLE `passport` (
  `id` int NOT NULL AUTO_INCREMENT,
  `passport_number` varchar(45) DEFAULT NULL,
  `date_of_issue` datetime DEFAULT NULL,
  `passport_image` varchar(255) DEFAULT NULL,
  `passport_issue_authority` varchar(45) DEFAULT NULL,
  `date_of_expiry` datetime DEFAULT NULL,
  `place_of_issue` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `payment_log` */

DROP TABLE IF EXISTS `payment_log`;

CREATE TABLE `payment_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `txnid` varchar(255) DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `productinfo` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `createdAt` varchar(105) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `personal_detail` */

DROP TABLE IF EXISTS `personal_detail`;

CREATE TABLE `personal_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mother_name` varchar(45) DEFAULT NULL,
  `father_name` varchar(45) DEFAULT NULL,
  `marital_status` varchar(45) DEFAULT NULL,
  `spouse_name` varchar(45) DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  `height` varchar(45) DEFAULT NULL,
  `weight` varchar(45) DEFAULT NULL,
  `track_suit` varchar(45) DEFAULT NULL,
  `tshirt_size` varchar(45) DEFAULT NULL,
  `shoe_size` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `personal_detail_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `preferred_location_master` */

DROP TABLE IF EXISTS `preferred_location_master`;

CREATE TABLE `preferred_location_master` (
  `id` int NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `qualification_stages` */

DROP TABLE IF EXISTS `qualification_stages`;

CREATE TABLE `qualification_stages` (
  `qualification_id` int NOT NULL,
  `match_id` int DEFAULT NULL,
  `stage` varchar(45) DEFAULT NULL,
  `no_of_finalist` varchar(45) DEFAULT NULL,
  `no_of_shots` varchar(45) DEFAULT NULL,
  `max_shot_value` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`qualification_id`),
  KEY `match_id_ibfk_idx` (`match_id`),
  CONSTRAINT `match_id_ibfk` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `refresh_token_master` */

DROP TABLE IF EXISTS `refresh_token_master`;

CREATE TABLE `refresh_token_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `athlete_id` int NOT NULL,
  `refresh_token` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `segments_master` */

DROP TABLE IF EXISTS `segments_master`;

CREATE TABLE `segments_master` (
  `id` int NOT NULL,
  `name` text,
  `label` text,
  `deleted_at` text,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `shooter_membership` */

DROP TABLE IF EXISTS `shooter_membership`;

CREATE TABLE `shooter_membership` (
  `id` int NOT NULL AUTO_INCREMENT,
  `membership_plan_id` int DEFAULT NULL,
  `main` varchar(45) NOT NULL,
  `type` varchar(105) DEFAULT NULL,
  `subtype` varchar(105) DEFAULT NULL,
  `life_others` varchar(105) DEFAULT NULL,
  `validity` varchar(45) DEFAULT NULL,
  `state_validity` varchar(45) DEFAULT NULL,
  `membership_of_club_dru` varchar(45) DEFAULT NULL,
  `arjuna_awardee` varchar(45) DEFAULT NULL,
  `arjuna_awardee_certificate` varchar(45) DEFAULT NULL,
  `international_awardee` varchar(45) DEFAULT NULL,
  `international_awardee_certificate` varchar(45) DEFAULT NULL,
  `coach_details_id` int DEFAULT NULL,
  `bond_submission_date` datetime DEFAULT NULL,
  `indemnity_bond` varchar(45) DEFAULT NULL,
  `membership_number` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coach_details_id` (`coach_details_id`),
  KEY `Shooter_Membership_ibfk_3_idx` (`membership_plan_id`),
  KEY `Shooter_Membership_ibfk_4_idx` (`membership_plan_id`),
  CONSTRAINT `shooter_membership_ibfk_2` FOREIGN KEY (`coach_details_id`) REFERENCES `coach_details` (`id`),
  CONSTRAINT `shooter_membership_ibfk_3` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_detail_master` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `state_master` */

DROP TABLE IF EXISTS `state_master`;

CREATE TABLE `state_master` (
  `id` int NOT NULL,
  `name` text,
  `country_id` int DEFAULT NULL,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `state_unit_master` */

DROP TABLE IF EXISTS `state_unit_master`;

CREATE TABLE `state_unit_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text,
  `abbreviation` text,
  `association_name` text,
  `zone_id` text,
  `is_state` text,
  `status` int DEFAULT NULL,
  `block_reason` text,
  `unblock_reason` text,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `target_groups` */

DROP TABLE IF EXISTS `target_groups`;

CREATE TABLE `target_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `target` text,
  `record` int DEFAULT NULL,
  `sighter` int DEFAULT NULL,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `targets_master` */

DROP TABLE IF EXISTS `targets_master`;

CREATE TABLE `targets_master` (
  `id` int DEFAULT NULL,
  `name` text,
  `deleted_at` text,
  `created_at` text,
  `updated_at` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `permissions` varchar(45) DEFAULT NULL,
  `last_login` varchar(45) DEFAULT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `district_unit_id` int DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `contact_number` varchar(45) DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `enroll_id` int DEFAULT NULL,
  `is_admin` varchar(45) DEFAULT NULL,
  `club_dra_listing_id` int DEFAULT NULL,
  `is_comp` varchar(45) DEFAULT NULL,
  `password_change_flag` varchar(45) DEFAULT NULL,
  `remember_token` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `flag` varchar(45) DEFAULT NULL,
  `athlete_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `club_dra_listing_id` (`club_dra_listing_id`),
  KEY `Users_ibfk_2_idx` (`state_id`),
  KEY `Users_ibfk_1_idx` (`district_unit_id`),
  KEY `Users_ibfk_4_idx` (`district_unit_id`),
  CONSTRAINT `state_ibfk_3` FOREIGN KEY (`state_id`) REFERENCES `state_master` (`id`),
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`club_dra_listing_id`) REFERENCES `club_dra_listing` (`id`),
  CONSTRAINT `users_ibfk_n` FOREIGN KEY (`district_unit_id`) REFERENCES `district_unit` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `weapon_detail` */

DROP TABLE IF EXISTS `weapon_detail`;

CREATE TABLE `weapon_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weapon_type` varchar(45) DEFAULT NULL,
  `make` varchar(45) DEFAULT NULL,
  `model` varchar(45) DEFAULT NULL,
  `calibre` varchar(45) DEFAULT NULL,
  `serial_no` varchar(45) DEFAULT NULL,
  `shooter_membership_id` int DEFAULT NULL,
  `sticker` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `zones_master` */

DROP TABLE IF EXISTS `zones_master`;

CREATE TABLE `zones_master` (
  `id` int NOT NULL,
  `name` text,
  `created_at` text,
  `updated_at` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

