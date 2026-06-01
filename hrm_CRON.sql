CREATE DEFINER=`root`@`localhost` EVENT `terminate_expired_employees` ON SCHEDULE EVERY 1 DAY STARTS '2026-05-28 00:00:00' ON COMPLETION PRESERVE ENABLE DO BEGIN
    UPDATE employee_header_all AS e
    INNER JOIN user_login_header AS u ON e.eha_id = u.eha_id
    SET 
        e.status = 0, 
        e.remarks = 'CRON TERMINATED',
        u.is_locked = 1
    WHERE 
        DATE(e.valid_till) <= CURDATE()  -- Catches today and any missed past dates
        AND e.status != 0;               -- Processes only currently active users
END
