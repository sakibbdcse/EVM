USE `voting_db`;

-- 1. Schema upgrades (safe to re-run)
ALTER TABLE `elections` ADD COLUMN IF NOT EXISTS `description` TEXT NULL AFTER `title`;
ALTER TABLE `votes` ADD UNIQUE KEY IF NOT EXISTS `unique_voter_election` (`voter_id`, `election_id`);
ALTER TABLE `candidates` ADD UNIQUE KEY IF NOT EXISTS `unique_candidate_election` (`election_id`, `user_id`);

-- 2. Seed Essential Accounts (Password for all seeded accounts: Password123!)
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `phone`, `gender`, `birthdate`, `nid`, `role`, `has_voted`, `date_joined`, `address_id`, `photo`)
VALUES 
(100, 'superadmin', 'pbkdf2:sha256:1000000$RRgJWwiDR7e7yc6w$5a344ebe93ef013de83dffaeea997bb42caa39d3f22c298514bb30517fc4ebba', 'superadmin@evm.com', 'Super', 'Administrator', '01700000001', 'Male', '1985-01-01', 'NID1000000001', 'super_admin', 0, NOW(), 1, NULL),
(101, 'admin', 'pbkdf2:sha256:1000000$RRgJWwiDR7e7yc6w$5a344ebe93ef013de83dffaeea997bb42caa39d3f22c298514bb30517fc4ebba', 'admin@evm.com', 'System', 'Admin', '01700000002', 'Male', '1988-03-15', 'NID1000000002', 'admin', 0, NOW(), 1, NULL),
(102, 'officer', 'pbkdf2:sha256:1000000$RRgJWwiDR7e7yc6w$5a344ebe93ef013de83dffaeea997bb42caa39d3f22c298514bb30517fc4ebba', 'officer@evm.com', 'Presiding', 'Officer', '01700000003', 'Female', '1990-07-20', 'NID1000000003', 'presiding_officer', 0, NOW(), 1, NULL),
(103, 'voter1', 'pbkdf2:sha256:1000000$RRgJWwiDR7e7yc6w$5a344ebe93ef013de83dffaeea997bb42caa39d3f22c298514bb30517fc4ebba', 'voter1@evm.com', 'Rahim', 'Uddin', '01700000004', 'Male', '1995-11-10', 'NID1000000004', 'voter', 0, NOW(), 1, NULL),
(104, 'voter2', 'pbkdf2:sha256:1000000$RRgJWwiDR7e7yc6w$5a344ebe93ef013de83dffaeea997bb42caa39d3f22c298514bb30517fc4ebba', 'voter2@evm.com', 'Fatema', 'Begum', '01700000005', 'Female', '1998-05-25', 'NID1000000005', 'voter', 0, NOW(), 1, NULL),
(105, 'candidate_tariq', 'pbkdf2:sha256:1000000$RRgJWwiDR7e7yc6w$5a344ebe93ef013de83dffaeea997bb42caa39d3f22c298514bb30517fc4ebba', 'tariq@evm.com', 'Tariqul', 'Islam', '01700000006', 'Male', '1982-04-12', 'NID1000000006', 'voter', 0, NOW(), 1, NULL),
(106, 'candidate_salma', 'pbkdf2:sha256:1000000$RRgJWwiDR7e7yc6w$5a344ebe93ef013de83dffaeea997bb42caa39d3f22c298514bb30517fc4ebba', 'salma@evm.com', 'Salma', 'Khatun', '01700000007', 'Female', '1987-09-18', 'NID1000000007', 'voter', 0, NOW(), 1, NULL)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `email` = VALUES(`email`);

-- 3. Seed or Update a live Active Election for testing
INSERT INTO `elections` (`id`, `title`, `description`, `address_id`, `start_date`, `end_date`, `is_active`)
VALUES (10, 'National Parliamentary Election 2026', 'General parliamentary election for constituency representation. Verified voters are eligible to cast one vote for their nominated candidate.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1)
ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `start_date` = VALUES(`start_date`),
  `end_date` = VALUES(`end_date`),
  `is_active` = 1;

-- 4. Add candidates to Election 10
INSERT INTO `candidates` (`id`, `election_id`, `user_id`, `description`, `symbol`, `party`, `slogan`)
VALUES 
(10, 10, 105, 'Committed to technological innovation, economic growth, and transparent governance.', 'parrot.png', 'Progressive Democratic Front', 'Empowerment through Integrity'),
(11, 10, 106, 'Championing social welfare, quality healthcare, and educational reforms for all.', 'nub.png', 'National Peoples Alliance', 'Together for a Brighter Future')
ON DUPLICATE KEY UPDATE 
  `party` = VALUES(`party`),
  `slogan` = VALUES(`slogan`),
  `description` = VALUES(`description`);