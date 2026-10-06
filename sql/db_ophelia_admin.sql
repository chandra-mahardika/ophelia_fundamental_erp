-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 06, 2026 at 10:12 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_ophelia_admin`
--

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `code`, `address`, `phone`, `email`, `logoUrl`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Ophelia Demo', 'DEMO', NULL, NULL, NULL, NULL, 1, '2026-10-06 04:04:43.748', '2026-10-06 06:42:02.381'),
(2, 'PT Cabang Kedua', 'CAB2', NULL, NULL, NULL, NULL, 1, '2026-10-06 04:05:22.249', '2026-10-06 04:05:22.249'),
(3, 'Perusahaan Budi Santoso', 'personal-budi', NULL, NULL, NULL, NULL, 1, '2026-10-06 04:05:35.525', '2026-10-06 04:05:35.525'),
(4, 'Perusahaan adinda', 'personal-adinda', NULL, NULL, NULL, NULL, 1, '2026-10-06 06:38:51.174', '2026-10-06 06:38:51.174');

-- --------------------------------------------------------

--
-- Table structure for table `company_modules`
--

CREATE TABLE `company_modules` (
  `companyId` int NOT NULL,
  `moduleCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isInstalled` tinyint(1) NOT NULL DEFAULT '1',
  `installedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_modules`
--

INSERT INTO `company_modules` (`companyId`, `moduleCode`, `isInstalled`, `installedAt`, `updatedAt`) VALUES
(1, 'accounting', 1, '2026-10-06 04:04:43.957', '2026-10-06 06:42:02.607'),
(1, 'base', 1, '2026-10-06 04:04:43.852', '2026-10-06 06:42:02.430'),
(1, 'hr', 1, '2026-10-06 04:04:44.059', '2026-10-06 06:42:02.645'),
(1, 'inventory', 1, '2026-10-06 04:04:43.891', '2026-10-06 06:42:02.468'),
(1, 'sales', 1, '2026-10-06 04:04:43.918', '2026-10-06 06:42:02.568'),
(2, 'base', 1, '2026-10-06 04:05:22.249', '2026-10-06 04:05:22.249'),
(2, 'inventory', 1, '2026-10-06 04:05:22.249', '2026-10-06 04:18:22.070'),
(3, 'base', 1, '2026-10-06 04:05:35.525', '2026-10-06 04:05:35.525'),
(3, 'inventory', 1, '2026-10-06 04:05:35.525', '2026-10-06 04:05:35.525'),
(4, 'base', 1, '2026-10-06 06:38:51.174', '2026-10-06 06:38:51.174'),
(4, 'inventory', 1, '2026-10-06 06:38:51.174', '2026-10-06 06:38:51.174');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0.0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`code`, `name`, `description`, `version`, `isActive`, `createdAt`, `updatedAt`) VALUES
('accounting', 'Accounting', 'Akuntansi & keuangan', '1.0.0', 1, '2026-10-06 04:04:43.059', '2026-10-06 06:42:01.445'),
('base', 'Base', 'Fitur dasar ERP (wajib, tidak bisa di-uninstall)', '1.0.0', 1, '2026-10-06 04:04:42.882', '2026-10-06 06:42:01.328'),
('hr', 'HR', 'Sumber daya manusia', '1.0.0', 1, '2026-10-06 04:04:43.114', '2026-10-06 06:42:01.648'),
('inventory', 'Inventory', 'Produk & stok', '1.0.0', 1, '2026-10-06 04:04:42.920', '2026-10-06 06:42:01.368'),
('sales', 'Sales', 'Penjualan', '1.0.0', 1, '2026-10-06 04:04:42.955', '2026-10-06 06:42:01.407');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`) VALUES
(6, 'companies:create'),
(9, 'companies:manage'),
(7, 'companies:read'),
(8, 'companies:update'),
(11, 'modules:manage'),
(10, 'modules:read'),
(12, 'roles:manage'),
(1, 'users:manage');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ADMIN'),
(2, 'USER');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `roleId` int NOT NULL,
  `permissionId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`roleId`, `permissionId`) VALUES
(1, 1),
(1, 6),
(1, 7),
(2, 7),
(1, 8),
(1, 9),
(1, 10),
(2, 10),
(1, 11),
(1, 12);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `createdAt`, `updatedAt`, `username`) VALUES
(1, 'Admin', 'admin@example.com', '$2b$10$QJ8Q8sX.gMAZQwkiHW/lt.ftG4fRXlH/fail.4gGChCWlI/o1Vucq', '2026-10-06 04:04:43.418', '2026-10-06 06:42:02.028', 'admin'),
(2, 'User', 'user@example.com', '$2b$10$Sz0zGHDa5gmN3LyISWjg2Op21d5O8Tb/pDnfzuwor8hbdI87c677C', '2026-10-06 04:04:43.712', '2026-10-06 06:42:02.334', 'user'),
(5, 'Test User', 'testuser@example.com', '$2b$10$AAhXmfvFJKs6063e8pZ7b.b6Qw6d6oHY6Ubdua2Yxosv9.SxU53PG', '2026-10-06 07:51:37.965', '2026-10-06 07:51:37.965', 'testuser'),
(6, 'Frontend User', 'frontend@example.com', '$2b$10$crzFGsN8QMCrTH80d7u3D.T8n2hQr7YWuJx0qtPgI2yaYXePNbkFm', '2026-10-06 08:01:48.642', '2026-10-06 08:01:48.642', 'frontenduser');

-- --------------------------------------------------------

--
-- Table structure for table `user_companies`
--

CREATE TABLE `user_companies` (
  `userId` int NOT NULL,
  `companyId` int NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_companies`
--

INSERT INTO `user_companies` (`userId`, `companyId`, `isDefault`, `createdAt`) VALUES
(1, 1, 0, '2026-10-06 04:04:43.786'),
(1, 2, 1, '2026-10-06 04:05:22.249'),
(2, 1, 1, '2026-10-06 04:04:43.825'),
(5, 1, 1, '2026-10-06 07:51:37.975'),
(6, 1, 1, '2026-10-06 08:01:48.651');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `userId` int NOT NULL,
  `roleId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`userId`, `roleId`) VALUES
(1, 1),
(2, 2),
(5, 2),
(6, 2);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('44dacac7-a37b-40cf-87dc-cb176c1eb22f', '10c46d0ed733745b6034f98baf2c607637ed07ac0e806b7acf44183fe563dc0f', '2026-10-06 04:01:55.436', '20261006040152_multi_company_modules', NULL, NULL, '2026-10-06 04:01:52.746', 1),
('5452605b-6450-4fcf-98db-9ab5780d63ed', 'cf37cef43a2bbc377c6624dcd2ce34d7916f1e56e3da06557e6141f05b2bd38d', '2026-10-06 04:01:09.051', '20261005084021_init', NULL, NULL, '2026-10-06 04:01:08.792', 1),
('89bc9f91-163a-47e4-b755-f5e058091388', '187a6aecb53bb993b2faf9ae07734408346ffe8e5034a8198f2f85bb1927a537', '2026-10-06 04:01:15.754', '20261005094000_user_roles', NULL, NULL, '2026-10-06 04:01:15.038', 1),
('ab32e788-f1e3-4eec-818e-37b16b607a69', '8c481a6781048bb2b1c10ea075dd81ad1f419baeb52afe560610bbed331cbb58', '2026-10-06 04:01:15.989', '20261005095000_add_username', NULL, NULL, '2026-10-06 04:01:15.791', 1),
('bb1113c2-a481-4afd-920c-d204467733e3', '7dd0e3c575a259adcaeb0b3ce23eb07a0c767b45d1a40353a763798cc911113b', '2026-10-06 04:01:15.009', '20261005093119_snake_case_tables', NULL, NULL, '2026-10-06 04:01:13.407', 1),
('d16b9b1a-05de-4815-84aa-a3b2190003a4', '3dd6aae879f384fe637e97dc66c5f23610642f5cecd9bd0769581fca4687ed28', '2026-10-06 04:01:13.369', '20261005091815_add_rbac', NULL, NULL, '2026-10-06 04:01:09.327', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `companies_code_key` (`code`);

--
-- Indexes for table `company_modules`
--
ALTER TABLE `company_modules`
  ADD PRIMARY KEY (`companyId`,`moduleCode`),
  ADD KEY `company_modules_moduleCode_fkey` (`moduleCode`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_key` (`name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`roleId`,`permissionId`),
  ADD KEY `role_permissions_permissionId_fkey` (`permissionId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_username_key` (`username`);

--
-- Indexes for table `user_companies`
--
ALTER TABLE `user_companies`
  ADD PRIMARY KEY (`userId`,`companyId`),
  ADD KEY `user_companies_companyId_fkey` (`companyId`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`userId`,`roleId`),
  ADD KEY `user_roles_roleId_fkey` (`roleId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `company_modules`
--
ALTER TABLE `company_modules`
  ADD CONSTRAINT `company_modules_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `company_modules_moduleCode_fkey` FOREIGN KEY (`moduleCode`) REFERENCES `modules` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `user_companies`
--
ALTER TABLE `user_companies`
  ADD CONSTRAINT `user_companies_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_companies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
