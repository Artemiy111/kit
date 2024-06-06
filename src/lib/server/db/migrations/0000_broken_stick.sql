CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`parent_message_id` integer,
	`author_id` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`created_At` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`parent_message_id`) REFERENCES `messages`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages_to_files` (
	`message_id` integer NOT NULL,
	`file_id` integer NOT NULL,
	PRIMARY KEY(`file_id`, `message_id`)
);
--> statement-breakpoint
CREATE TABLE `oauths` (
	`user_id` integer NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	PRIMARY KEY(`provider`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`created_At` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);