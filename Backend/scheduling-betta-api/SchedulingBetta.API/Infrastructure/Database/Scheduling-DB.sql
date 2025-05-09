-- Events table (main entity)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    session_duration INT NOT NULL, -- In minutes
    has_break BOOLEAN NOT NULL DEFAULT FALSE,
    break_start TIMESTAMP, -- Optional break start time (HH:MM)
    break_end TIMESTAMP,  -- Optional break end time (HH:MM)
    location VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    available_slots INT NOT NULL CHECK (available_slots >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_event_period CHECK (end_time > start_time),
    CONSTRAINT valid_break_times CHECK (
        (has_break = FALSE) OR 
        (has_break = TRUE AND break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start)
    )
);

-- Event schedules table
CREATE TABLE event_schedules (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    schedule_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_timeslot UNIQUE (user_id, schedule_time)
);

-- Interested users table
CREATE TABLE event_interested_users (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_interest UNIQUE (event_id, user_id)
);

-- Trigger for maximum 4 interested users
CREATE OR REPLACE FUNCTION check_max_interested()
RETURNS TRIGGER AS $$
DECLARE
    max_interested INT := 4;
BEGIN
    IF (
        SELECT COUNT(*) 
        FROM event_interested_users 
        WHERE event_id = NEW.event_id
    ) >= max_interested THEN
        RAISE EXCEPTION 'Maximum of % interested users reached for this event', max_interested;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_interested
BEFORE INSERT ON event_interested_users
FOR EACH ROW EXECUTE FUNCTION check_max_interested();

-- Optimization indexes
CREATE INDEX idx_event_schedules_event ON event_schedules(event_id);
CREATE INDEX idx_event_interested ON event_interested_users(event_id);
CREATE INDEX idx_events_time_range ON events(start_time, end_time);