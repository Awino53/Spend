-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 28, 2025 at 10:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spendwise`
--

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `budget_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expenditure_type` enum('Expense','Bill','Debt','Savings') NOT NULL,
  `category` varchar(255) NOT NULL,
  `limit_amount` decimal(10,2) NOT NULL,
  `timeline` enum('one-time','daily','weekly','monthly','annually') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`budget_id`, `user_id`, `expenditure_type`, `category`, `limit_amount`, `timeline`, `notes`, `created_at`, `updated_at`) VALUES
(1, 9, 'Expense', 'grocery', 200.00, 'daily', NULL, '2025-02-17 18:54:33', '2025-02-17 18:54:33'),
(2, 9, 'Expense', 'grocery', 200.00, 'daily', NULL, '2025-02-18 08:27:08', '2025-02-18 08:27:08'),
(3, 13, 'Expense', 'grocery', 500.00, 'weekly', NULL, '2025-02-20 09:41:48', '2025-02-20 09:41:48'),
(4, 13, 'Bill', 'utility(rent)', 4000.00, 'monthly', NULL, '2025-02-20 09:49:13', '2025-02-20 09:49:13'),
(5, 13, 'Debt', 'school', 4600.00, 'weekly', NULL, '2025-02-20 09:49:53', '2025-02-20 09:49:53'),
(6, 1, 'Expense', 'Food', 0.00, 'one-time', NULL, '2025-02-20 10:36:07', '2025-02-20 10:36:07'),
(7, 1, 'Expense', 'Transport', 0.00, 'one-time', NULL, '2025-02-20 10:36:07', '2025-02-20 10:36:07'),
(8, 1, 'Expense', 'Rent', 0.00, 'one-time', NULL, '2025-02-20 10:36:07', '2025-02-20 10:36:07'),
(9, 13, 'Expense', 'salary', 50000.00, 'monthly', NULL, '2025-02-21 08:04:40', '2025-02-21 08:04:40'),
(10, 13, 'Expense', 'gig', 10000.00, 'weekly', NULL, '2025-02-21 08:04:40', '2025-02-21 08:04:40'),
(11, 13, 'Expense', 'friends', 5000.00, 'one-time', NULL, '2025-02-21 08:04:40', '2025-02-21 08:04:40'),
(12, 15, 'Bill', 'utility(rent)', 2000.00, 'monthly', NULL, '2025-02-24 08:47:49', '2025-02-24 08:47:49'),
(13, 15, 'Expense', 'grocery', 300.00, 'weekly', NULL, '2025-02-24 08:52:32', '2025-02-24 08:52:32'),
(14, 18, 'Expense', 'grocery', 500.00, 'weekly', NULL, '2025-02-25 18:32:43', '2025-02-25 18:32:43'),
(15, 18, 'Bill', 'utility(rent)', 4500.00, 'annually', NULL, '2025-02-25 18:41:38', '2025-02-25 18:41:38'),
(16, 17, 'Savings', 'mmf', 300.00, 'weekly', NULL, '2025-02-25 18:47:13', '2025-02-25 18:47:13'),
(17, 17, 'Debt', 'mobile', 200.00, 'weekly', NULL, '2025-02-25 18:48:43', '2025-02-25 18:48:43'),
(18, 17, 'Bill', 'rent', 500.00, 'weekly', NULL, '2025-02-25 18:49:06', '2025-02-25 18:49:06'),
(19, 17, 'Expense', 'grocery', 500.00, 'weekly', NULL, '2025-02-25 18:49:28', '2025-02-25 18:49:28'),
(20, 19, 'Expense', 'grocery', 70.00, 'one-time', NULL, '2025-02-25 19:25:55', '2025-02-25 19:25:55'),
(21, 19, 'Bill', 'utility(rent)', 200.00, 'monthly', NULL, '2025-02-25 19:26:52', '2025-02-25 19:26:52');

-- --------------------------------------------------------

--
-- Table structure for table `income`
--

CREATE TABLE `income` (
  `income_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `source` varchar(255) DEFAULT 'Unknown',
  `date_received` date NOT NULL,
  `frequency` enum('one-time','daily','weekly','monthly','annually') DEFAULT 'one-time',
  `currency` varchar(3) DEFAULT 'KES',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `income`
--

INSERT INTO `income` (`income_id`, `user_id`, `category`, `amount`, `source`, `date_received`, `frequency`, `currency`, `created_at`, `updated_at`) VALUES
(0, 13, 'salary', 45000.00, 'monthly salary', '2025-02-20', 'monthly', 'KES', '2025-02-20 09:39:46', '2025-02-20 09:39:46'),
(0, 13, 'gig', 2000.00, 'weekend gigs', '2025-02-20', 'weekly', 'KES', '2025-02-20 09:40:20', '2025-02-20 09:40:20'),
(0, 13, 'friends', 5000.00, 'family', '2025-02-20', 'one-time', 'KES', '2025-02-20 09:40:48', '2025-02-20 09:40:48'),
(0, 15, 'salary', 5000.00, 'monthly salary', '2025-02-24', 'monthly', 'KES', '2025-02-24 08:47:10', '2025-02-24 08:47:10'),
(0, 15, 'gig', 500.00, 'weekend gigs', '2025-02-24', 'weekly', 'KES', '2025-02-24 08:51:53', '2025-02-24 08:51:53'),
(0, 18, 'salary', 6000.00, 'monthly salary', '2025-02-25', 'monthly', 'KES', '2025-02-25 18:29:22', '2025-02-25 18:29:22'),
(0, 17, 'gig', 800.00, 'weekend gigs', '2025-02-25', 'weekly', 'KES', '2025-02-25 18:46:42', '2025-02-25 18:46:42'),
(0, 19, 'friends', 300.00, 'family', '2025-02-25', 'one-time', 'KES', '2025-02-25 19:25:38', '2025-02-25 19:25:38');

--
-- Triggers `income`
--
DELIMITER $$
CREATE TRIGGER `after_income_insert` AFTER INSERT ON `income` FOR EACH ROW BEGIN
  IF NEW.income_id IS NOT NULL THEN
    INSERT INTO transactions (user_id, type, category, amount, description, transaction_date, frequency, created_at)
    VALUES (NEW.user_id, 'Income', NEW.category, NEW.amount, NEW.source, NEW.date_received, NEW.frequency, NEW.created_at);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `theme` enum('light','dark') DEFAULT 'light',
  `notifications_enabled` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `user_id`, `theme`, `notifications_enabled`) VALUES
(1, 19, 'dark', 1);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('Income','Expense','Savings','Debt','Bill') NOT NULL,
  `category` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text DEFAULT 'No description',
  `transaction_date` date NOT NULL,
  `frequency` enum('one-time','daily','weekly','monthly','annually') DEFAULT 'one-time',
  `currency` varchar(3) DEFAULT 'KES',
  `status` enum('pending','completed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `user_id`, `type`, `category`, `amount`, `description`, `transaction_date`, `frequency`, `currency`, `status`, `created_at`, `updated_at`) VALUES
(0, 13, 'Income', 'salary', 45000.00, 'monthly salary', '2025-02-20', 'monthly', 'KES', 'completed', '2025-02-20 09:39:46', '2025-02-20 09:39:46'),
(0, 13, 'Income', 'gig', 2000.00, 'weekend gigs', '2025-02-20', 'weekly', 'KES', 'completed', '2025-02-20 09:40:20', '2025-02-20 09:40:20'),
(0, 13, 'Income', 'friends', 5000.00, 'family', '2025-02-20', 'one-time', 'KES', 'completed', '2025-02-20 09:40:48', '2025-02-20 09:40:48'),
(0, 13, 'Expense', 'grocery', 200.00, 'food', '2025-02-20', 'weekly', 'KES', 'completed', '2025-02-20 10:49:27', '2025-02-20 10:49:27'),
(0, 13, 'Debt', 'school', 400.00, 'shool tuition', '2025-02-20', 'weekly', 'KES', 'completed', '2025-02-20 10:50:38', '2025-02-20 10:50:38'),
(0, 13, 'Bill', 'utility(rent)', 7000.00, 'house rent', '2025-02-21', 'one-time', 'KES', 'completed', '2025-02-21 01:55:56', '2025-02-21 01:55:56'),
(0, 15, 'Income', 'salary', 5000.00, 'monthly salary', '2025-02-24', 'monthly', 'KES', 'completed', '2025-02-24 08:47:10', '2025-02-24 08:47:10'),
(0, 15, 'Bill', 'utility(rent)', 1500.00, 'rent', '2025-02-24', 'monthly', 'KES', 'completed', '2025-02-24 08:48:39', '2025-02-24 08:48:39'),
(0, 15, 'Income', 'gig', 500.00, 'weekend gigs', '2025-02-24', 'weekly', 'KES', 'completed', '2025-02-24 08:51:53', '2025-02-24 08:51:53'),
(0, 15, 'Expense', 'grocery', 350.00, 'food', '2025-02-24', 'weekly', 'KES', 'completed', '2025-02-24 08:53:16', '2025-02-24 08:53:16'),
(0, 18, 'Income', 'salary', 6000.00, 'monthly salary', '2025-02-25', 'monthly', 'KES', 'completed', '2025-02-25 18:29:22', '2025-02-25 18:29:22'),
(0, 18, 'Bill', 'utility(rent)', 5000.00, 'house rent', '2025-02-25', 'annually', 'KES', 'completed', '2025-02-25 18:43:01', '2025-02-25 18:43:01'),
(0, 17, 'Income', 'gig', 800.00, 'weekend gigs', '2025-02-25', 'weekly', 'KES', 'completed', '2025-02-25 18:46:42', '2025-02-25 18:46:42'),
(0, 17, 'Savings', 'mmf', 250.00, 'mmf', '2025-02-25', 'weekly', 'KES', 'completed', '2025-02-25 18:48:04', '2025-02-25 18:48:04'),
(0, 17, 'Expense', 'grocery', 250.00, 'f', '2025-02-25', 'weekly', 'KES', 'completed', '2025-02-25 18:49:47', '2025-02-25 18:49:47'),
(0, 17, 'Debt', 'mobile', 250.00, 'f', '2025-02-25', 'weekly', 'KES', 'completed', '2025-02-25 18:50:28', '2025-02-25 18:50:28'),
(0, 17, 'Bill', 'rent', 5000.00, 'f', '2025-02-25', 'weekly', 'KES', 'completed', '2025-02-25 18:51:16', '2025-02-25 18:51:16'),
(0, 19, 'Income', 'friends', 300.00, 'family', '2025-02-25', 'one-time', 'KES', 'completed', '2025-02-25 19:25:38', '2025-02-25 19:25:38'),
(0, 19, 'Expense', 'grocery', 50.00, 'shoping', '2025-02-25', 'one-time', 'KES', 'completed', '2025-02-25 19:27:49', '2025-02-25 19:27:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `full_name`, `password`, `date_of_birth`, `profile_picture`, `role`, `created_at`, `updated_at`) VALUES
(15, 'awino@gmail.com', 'awino', '$2a$10$DN7370wbLdE8ExRtuxzoQeaXnUm.378sama8mvlMkX/rL/8cQE57S', '0000-00-00', NULL, 'user', '2025-02-24 08:46:21', '2025-02-24 08:46:21'),
(16, 'esther@gmail.com', 'esther', '$2a$10$Qv3hAkFZ7quFL./gsUy8m.vg7fByz1lx.mLj9sT7rttjONAxspACW', '0000-00-00', NULL, 'user', '2025-02-25 17:14:17', '2025-02-25 17:14:17'),
(17, 'albert@gmail.com', 'albert', '$2a$10$fiR9ZrMCivSB9TkFw0PZF.C9U5jQiaNpO6gper6Zcb.c9o3BRNBo2', '0000-00-00', NULL, 'user', '2025-02-25 17:21:21', '2025-02-25 17:21:21'),
(18, 'red@gmail.com', 'red', '$2a$10$omB3cuxE0DLcCXNez.dDwutu5VXk0urr2B5uvG9A9V6NMrvjd7UI.', '0000-00-00', NULL, 'user', '2025-02-25 17:31:30', '2025-02-25 17:31:30'),
(19, 'maya@gmail.com', 'maya', '$2a$10$jQf4myf4aHoCONmCVjzS1uv86WlYjw5ljCwIAlvNABot.6LI3Ps6S', '0000-00-00', NULL, 'user', '2025-02-25 17:32:35', '2025-02-25 17:32:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`budget_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_transaction_date` (`transaction_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `budget_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
