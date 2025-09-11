-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 11, 2025 at 12:40 PM
-- Server version: 8.0.43-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `voting_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int NOT NULL,
  `division` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `village` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_address_details` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `division`, `district`, `city`, `village`, `other_address_details`) VALUES
(1, 'Dhaka', 'Dhaka', 'Dhaka', 'Gulshan', 'Road 12, House 45'),
(2, 'Dhaka', 'Dhaka', 'Dhaka', 'Banani', 'Block C, Road 8'),
(3, 'Dhaka', 'Dhaka', 'Dhaka', 'Dhanmondi', 'Road 27, House 15'),
(4, 'Dhaka', 'Gazipur', 'Gazipur', 'Konabari', 'Near Police Station'),
(5, 'Dhaka', 'Narayanganj', 'Narayanganj', 'Bandar', 'River View Area'),
(6, 'Chittagong', 'Chittagong', 'Chittagong', 'Agrabad', 'Commercial Area'),
(7, 'Chittagong', 'Chittagong', 'Chittagong', 'Pahartali', 'Railway Colony'),
(8, 'Chittagong', 'Cox\'s Bazar', 'Cox\'s Bazar', 'Kolatoli', 'Beach Road'),
(9, 'Chittagong', 'Comilla', 'Comilla', 'Kandirpar', 'Central Area'),
(10, 'Rajshahi', 'Rajshahi', 'Rajshahi', 'Boalia', 'University Area'),
(11, 'Rajshahi', 'Bogra', 'Bogra', 'Sherpur', 'Main Road'),
(12, 'Rajshahi', 'Pabna', 'Pabna', 'Ishwardi', 'Railgate Area'),
(13, 'Khulna', 'Khulna', 'Khulna', 'Sonadanga', 'Bus Terminal Area'),
(14, 'Khulna', 'Satkhira', 'Satkhira', 'Kaliganj', 'Border Area'),
(15, 'Khulna', 'Bagerhat', 'Bagerhat', 'Mongla', 'Port Area'),
(16, 'Sylhet', 'Sylhet', 'Sylhet', 'Mirabazar', 'Tea Garden Area'),
(17, 'Sylhet', 'Moulvibazar', 'Moulvibazar', 'Sreemangal', 'Tea Capital'),
(18, 'Sylhet', 'Habiganj', 'Habiganj', 'Madhabpur', 'Lake View'),
(19, 'Barisal', 'Barisal', 'Barisal', 'Nattullabad', 'River Side'),
(20, 'Barisal', 'Pirojpur', 'Pirojpur', 'Nazirpur', 'Agricultural Zone'),
(21, 'Rangpur', 'Rangpur', 'Rangpur', 'Carmichael', 'College Road'),
(22, 'Rangpur', 'Dinajpur', 'Dinajpur', 'Parbatipur', 'Railway Junction'),
(23, 'Mymensingh', 'Mymensingh', 'Mymensingh', 'Trishal', 'Educational Area'),
(24, 'Mymensingh', 'Netrokona', 'Netrokona', 'Kendua', 'Rural Area');

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` int NOT NULL,
  `election_id` int NOT NULL,
  `user_id` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `symbol` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `party` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slogan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `candidates`
--

INSERT INTO `candidates` (`id`, `election_id`, `user_id`, `description`, `symbol`, `party`, `slogan`) VALUES
(2, 3, 6, NULL, 'nub.png', 'x', 'dfsd');

-- --------------------------------------------------------

--
-- Table structure for table `elections`
--

CREATE TABLE `elections` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_id` int NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `elections`
--

INSERT INTO `elections` (`id`, `title`, `address_id`, `start_date`, `end_date`, `is_active`) VALUES
(1, 'Student Council Election', 1, '2025-09-11 10:00:00', '2025-09-30 09:12:17', 1),
(2, 'General Election 2025', 1, '2025-09-06 16:25:00', '2025-09-06 15:30:00', 0),
(3, 'General Election 2025', 24, '2025-09-06 16:42:00', '2025-09-13 17:42:00', 0),
(4, 'General Election 2025', 22, '2025-09-06 11:29:00', '2025-09-26 13:30:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('Male','Female','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `nid` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('voter','presiding_officer','admin','super_admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'voter',
  `has_voted` tinyint(1) DEFAULT '0',
  `date_joined` datetime NOT NULL,
  `address_id` int DEFAULT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `phone`, `gender`, `birthdate`, `nid`, `role`, `has_voted`, `date_joined`, `address_id`, `photo`) VALUES
(1, 'test', 'pbkdf2:sha256:1000000$knHkleCABJH1JJbx$58cdba73700ce1782938954125ee3a3b8dec560b483b3bcc46f7fcb45f7099d6', 'test@gmail.com', 'test', 'user', NULL, 'Male', NULL, '1234567890', 'voter', 0, '2025-08-30 14:06:11', NULL, NULL),
(3, 'werrte', 'pbkdf2:sha256:1000000$IYI8YCvDGnOGGVU0$a97bcf1004765b048fbc50c291595b18d899d7e8151b187d479dd5fb8e2eecf0', 'er@g.com', 'wer', 'rew', '23534', 'Male', '2025-08-20', '74433', 'voter', 0, '2025-08-30 19:17:43', NULL, NULL),
(4, 'rwer', 'pbkdf2:sha256:1000000$fLfXYNRO3gzQUNVt$16ccfbdaf431463626ef4c60aceb3380f963fbdb27a901c3d71c4b3148ed3d3d', 'tesrf@g.com', 'wrer', 'rwer', '435345', 'Female', '2025-08-24', '634534', 'voter', 0, '2025-08-30 19:35:51', NULL, NULL),
(5, 'test1', 'pbkdf2:sha256:1000000$0vvWoGBhef59eQGO$5ede31241dc74bc42e302956cad316ec6023f562fba1ce5c1aa22561d8bafba2', 'test1@gmail.com', 'test', 'test', '2434343', 'Female', '2025-08-03', '123456', 'voter', 0, '2025-08-30 19:52:52', NULL, NULL),
(6, 'test3', 'pbkdf2:sha256:1000000$j8IfW9qamo9E7um8$d80b1d031b79c40ca015fa9963a3338427c4f6681363f64ac53fff01f81c7c24', 'test3@g.com', 'rest', 'tests', '324344', 'Female', '2025-08-19', '97456345', 'presiding_officer', 0, '2025-08-30 21:11:04', NULL, NULL),
(7, 'yretre', 'pbkdf2:sha256:1000000$ScJgqpKw0n1xOgrL$d611b80495a689c9ade2a3ae7bfa5166440b8fb375f66d928a9e38a4282e6b3c', 'test4@g.com', 'werer', 'rwere', 'ertr', 'Female', '2025-08-20', '86756', 'voter', 0, '2025-08-30 23:05:44', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `votes`
--

CREATE TABLE `votes` (
  `id` int NOT NULL,
  `voter_id` int NOT NULL,
  `election_id` int NOT NULL,
  `candidate_id` int NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `election_id` (`election_id`),
  ADD KEY `fk_candidates_user` (`user_id`);

--
-- Indexes for table `elections`
--
ALTER TABLE `elections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `address_id` (`address_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_unique` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nid` (`nid`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `phone_unique` (`phone`),
  ADD UNIQUE KEY `nid_unique` (`nid`),
  ADD KEY `address_id` (`address_id`);

--
-- Indexes for table `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `voter_id` (`voter_id`),
  ADD KEY `election_id` (`election_id`),
  ADD KEY `candidate_id` (`candidate_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `elections`
--
ALTER TABLE `elections`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  ADD CONSTRAINT `fk_candidates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `elections`
--
ALTER TABLE `elections`
  ADD CONSTRAINT `elections_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);

--
-- Constraints for table `votes`
--
ALTER TABLE `votes`
  ADD CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`voter_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  ADD CONSTRAINT `votes_ibfk_3` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
