-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Апр 26 2026 г., 17:26
-- Версия сервера: 5.7.39
-- Версия PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `tower_defense`
--

-- --------------------------------------------------------

--
-- Структура таблицы `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `icon` varchar(255) DEFAULT NULL,
  `experience_reward` int(11) DEFAULT '0',
  `coins_reward` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `achievements`
--

INSERT INTO `achievements` (`id`, `name`, `description`, `icon`, `experience_reward`, `coins_reward`, `created_at`) VALUES
(1, 'Первая кровь', 'Убить первого врага', NULL, 50, 10, '2026-02-23 10:34:29'),
(2, 'Мастер башен', 'Построить 50 башен', NULL, 200, 50, '2026-02-23 10:34:29'),
(3, 'Ветеран', 'Дойти до 10-й волны', NULL, 100, 30, '2026-02-23 10:34:29'),
(4, 'Победитель', 'Выиграть 10 игр', NULL, 300, 100, '2026-02-23 10:34:29'),
(5, 'Стратег', 'Пройдите уровень 1 кампании', NULL, 100, 50, '2026-02-23 10:34:29'),
(6, 'Завоеватель', 'Пройдите все уровни кампании', NULL, 500, 200, '2026-02-23 10:34:29');

-- --------------------------------------------------------

--
-- Структура таблицы `leaderboards`
--

CREATE TABLE `leaderboards` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `map_id` enum('wave','zigzag','curve','straight') NOT NULL,
  `wave` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `kills` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`, `category`) VALUES
(1, 'users.view', 'Просмотр списка пользователей', 'users'),
(2, 'users.edit', 'Редактирование пользователей', 'users'),
(3, 'users.delete', 'Удаление пользователей', 'users'),
(4, 'users.ban', 'Блокировка пользователей', 'users'),
(5, 'settings.view', 'Просмотр настроек', 'settings'),
(6, 'settings.edit', 'Изменение настроек', 'settings'),
(7, 'logs.view', 'Просмотр логов', 'logs');

-- --------------------------------------------------------

--
-- Структура таблицы `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'Полный доступ ко всем функциям, управление пользователями', '2026-02-23 10:34:29'),
(2, 'user', 'Обычный пользователь, может играть и сохранять прогресс', '2026-02-23 10:34:29');

-- --------------------------------------------------------

--
-- Структура таблицы `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `granted` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`, `granted`, `created_at`) VALUES
(1, 1, 1, '2026-02-23 10:34:29'),
(1, 2, 1, '2026-02-23 10:34:29'),
(1, 3, 1, '2026-02-23 10:34:29'),
(1, 4, 1, '2026-02-23 10:34:29'),
(1, 5, 1, '2026-02-23 10:34:29'),
(1, 6, 1, '2026-02-23 10:34:29'),
(1, 7, 1, '2026-02-23 10:34:29'),
(2, 1, 1, '2026-02-23 10:34:29');

-- --------------------------------------------------------

--
-- Структура таблицы `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text,
  `description` text,
  `category` varchar(50) DEFAULT 'general',
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `description`, `category`, `updated_by`, `updated_at`) VALUES
(1, 'site_name', 'Tower Defense Python', 'Название сайта', 'general', NULL, '2026-02-23 10:34:29'),
(2, 'site_description', 'Игра для обучения программированию на Python', 'Описание сайта', 'general', NULL, '2026-02-23 10:34:29'),
(3, 'site_version', '1.0.0', 'Версия сайта', 'general', NULL, '2026-02-23 10:34:29'),
(4, 'max_waves', '100', 'Максимальное количество волн', 'game', NULL, '2026-02-23 10:34:29'),
(5, 'default_money', '100', 'Начальные деньги', 'game', NULL, '2026-02-23 10:34:29'),
(6, 'tower_cost', '50', 'Стоимость постройки башни', 'game', NULL, '2026-02-23 10:34:29'),
(7, 'upgrade_cost', '30', 'Стоимость улучшения башни', 'game', NULL, '2026-02-23 10:34:29'),
(8, 'kill_reward', '10', 'Награда за убийство врага', 'game', NULL, '2026-02-23 10:34:29'),
(9, 'maintenance_mode', 'false', 'Режим обслуживания', 'system', NULL, '2026-02-23 10:34:29'),
(10, 'allow_registration', 'true', 'Разрешить регистрацию новых пользователей', 'system', NULL, '2026-02-23 10:34:29');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT '2',
  `is_active` tinyint(1) DEFAULT '1',
  `is_banned` tinyint(1) DEFAULT '0',
  `ban_reason` text,
  `last_login` timestamp NULL DEFAULT NULL,
  `last_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `campaign_progress` int(11) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `is_active`, `is_banned`, `ban_reason`, `last_login`, `last_ip`, `created_at`, `updated_at`, `campaign_progress`) VALUES
(1, 'BlackVK', 'zenaglibockij@gmail.com', '$2a$10$WEvg57WHOsqzNWtKbAlfwOYvMdLn4v/N6/PfYcbIjJB1hvIISI.Gq', 2, 1, 0, NULL, '2026-04-25 11:13:03', '::1', '2026-04-22 10:35:11', '2026-04-25 11:13:03', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `user_achievements`
--

CREATE TABLE `user_achievements` (
  `user_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `earned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `user_game_stats`
--

CREATE TABLE `user_game_stats` (
  `user_id` int(11) NOT NULL,
  `total_kills` int(11) DEFAULT '0',
  `total_waves` int(11) DEFAULT '0',
  `total_towers_built` int(11) DEFAULT '0',
  `total_upgrades` int(11) DEFAULT '0',
  `games_played` int(11) DEFAULT '0',
  `wins` int(11) DEFAULT '0',
  `losses` int(11) DEFAULT '0',
  `best_wave` int(11) DEFAULT '0',
  `best_score` int(11) DEFAULT '0',
  `play_time` int(11) DEFAULT '0',
  `last_game_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `user_game_stats`
--

INSERT INTO `user_game_stats` (`user_id`, `total_kills`, `total_waves`, `total_towers_built`, `total_upgrades`, `games_played`, `wins`, `losses`, `best_wave`, `best_score`, `play_time`, `last_game_date`) VALUES
(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `user_logs`
--

CREATE TABLE `user_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `user_profiles`
--

CREATE TABLE `user_profiles` (
  `user_id` int(11) NOT NULL,
  `github` varchar(100) DEFAULT NULL,
  `experience_points` int(11) DEFAULT '0',
  `level` int(11) DEFAULT '1',
  `coins` int(11) DEFAULT '100'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `user_profiles`
--

INSERT INTO `user_profiles` (`user_id`, `github`, `experience_points`, `level`, `coins`) VALUES
(1, NULL, 0, 1, 100);

-- --------------------------------------------------------

--
-- Структура таблицы `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `leaderboards`
--
ALTER TABLE `leaderboards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_map_score` (`map_id`,`wave`),
  ADD KEY `idx_user_records` (`user_id`,`map_id`);

--
-- Индексы таблицы `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Индексы таблицы `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Индексы таблицы `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Индексы таблицы `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Индексы таблицы `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD PRIMARY KEY (`user_id`,`achievement_id`),
  ADD KEY `achievement_id` (`achievement_id`);

--
-- Индексы таблицы `user_game_stats`
--
ALTER TABLE `user_game_stats`
  ADD PRIMARY KEY (`user_id`);

--
-- Индексы таблицы `user_logs`
--
ALTER TABLE `user_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Индексы таблицы `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Индексы таблицы `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token` (`session_token`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `leaderboards`
--
ALTER TABLE `leaderboards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `user_logs`
--
ALTER TABLE `user_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `leaderboards`
--
ALTER TABLE `leaderboards`
  ADD CONSTRAINT `leaderboards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Ограничения внешнего ключа таблицы `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_game_stats`
--
ALTER TABLE `user_game_stats`
  ADD CONSTRAINT `user_game_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_logs`
--
ALTER TABLE `user_logs`
  ADD CONSTRAINT `user_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
