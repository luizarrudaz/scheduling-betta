CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    duration_minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- User identifier in AD (e.g. SID or Username)
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    schedule_date TIMESTAMP NOT NULL,
    canceled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
CREATE TABLE interested_users (
    id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- User identifier in AD (e.g. SID or Username)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
CREATE TABLE schedule_logs (
    id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_service_id ON schedules(service_id);
CREATE INDEX idx_schedules_schedule_date ON schedules(schedule_date);
CREATE INDEX idx_interested_users_schedule_id ON interested_users(schedule_id);
CREATE INDEX idx_schedule_logs_schedule_id ON schedule_logs(schedule_id);