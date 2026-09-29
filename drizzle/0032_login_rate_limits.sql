-- Login throttling (audit Y1/Y2). Each attempt is reserved atomically before the
-- password is verified, so parallel requests cannot exceed the limits.
-- Keys: 'ip:<ip>', 'pair:<ip>|<login>', 'account:<login>'.
CREATE TABLE IF NOT EXISTS `app_login_attempts` (
  `key` text PRIMARY KEY NOT NULL,
  `window_start` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_login_attempts_window_idx` ON `app_login_attempts` (`window_start`);
