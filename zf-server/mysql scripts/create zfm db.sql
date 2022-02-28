SET @username := 'zf_some_facility';
SET @password := 'some_good_password';
SET @host := 'localhost';

SET @query1 = CONCAT(
        'CREATE USER `',
        @username,
        '`@`',
        @host,
        '` IDENTIFIED BY "',
        @password, '" '
    );
PREPARE stmt FROM @query1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query1 = CONCAT(
        'GRANT USAGE ON *.* TO `',
        @username,
        '`@`localhost` IDENTIFIED BY "',
        @password,
        '" WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0'
    );
PREPARE stmt FROM @query1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @query1 = CONCAT(
        'CREATE DATABASE IF NOT EXISTS `',
        @username,
        '`'
    );
PREPARE stmt FROM @query1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query1 = CONCAT(
        'GRANT ALL PRIVILEGES ON `',
        @username,
        '`.* TO `',
        @username,
        '`@`',
        @host,
        '`'
    );
PREPARE stmt FROM @query1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


# If you cant gran all privileges like if you are on an amazon rds
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP,
    CREATE TEMPORARY TABLES, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE,
    EXECUTE, CREATE VIEW, EVENT, TRIGGER
    ON zf_stl_test.* TO `zf_stl_test`@`%`;
