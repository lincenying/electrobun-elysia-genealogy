CREATE TABLE `genealogy` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent` integer NOT NULL,
	`sex` text,
	`desc` text
);
