CREATE TABLE employees (
    id uuid PRIMARY KEY,
    username text NOT NULL UNIQUE CHECK (char_length(username) BETWEEN 3 AND 80),
    display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 100),
    role text NOT NULL CHECK (role IN
        ('operator', 'psychologist', 'conflictologist', 'lawyer', 'admin', 'analyst')),
    password_hash text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE appeals (
    id uuid PRIMARY KEY,
    tracking_hash bytea NOT NULL UNIQUE CHECK (octet_length(tracking_hash) = 32),
    category text NOT NULL CHECK (category IN
        ('anxiety', 'conflict', 'bullying', 'family', 'safety', 'other')),
    description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2500),
    status text NOT NULL DEFAULT 'new' CHECK (status IN
        ('new', 'waiting', 'active', 'closed')),
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN
        ('urgent', 'normal', 'low')),
    expert_id uuid REFERENCES employees(id),
    preferred_expert_id uuid REFERENCES employees(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    closed_at timestamptz,
    CHECK ((status = 'closed') = (closed_at IS NOT NULL))
);

CREATE TABLE appeal_colleagues (
    appeal_id uuid NOT NULL REFERENCES appeals(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id),
    PRIMARY KEY (appeal_id, employee_id)
);

CREATE TABLE messages (
    id uuid PRIMARY KEY,
    appeal_id uuid NOT NULL REFERENCES appeals(id) ON DELETE CASCADE,
    employee_id uuid REFERENCES employees(id),
    author text NOT NULL CHECK (author IN ('user', 'expert')),
    kind text NOT NULL DEFAULT 'message' CHECK (kind IN ('message', 'recommendation')),
    body text NOT NULL CHECK (char_length(body) <= 2500),
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((author = 'expert') = (employee_id IS NOT NULL)),
    CHECK (kind <> 'recommendation' OR author = 'expert'),
    UNIQUE (id, appeal_id)
);

CREATE TABLE attachments (
    id uuid PRIMARY KEY,
    appeal_id uuid NOT NULL REFERENCES appeals(id) ON DELETE CASCADE,
    message_id uuid,
    original_name text NOT NULL CHECK (char_length(original_name) BETWEEN 1 AND 255),
    media_type text NOT NULL CHECK (char_length(media_type) BETWEEN 1 AND 255),
    size_bytes bigint NOT NULL CHECK (size_bytes BETWEEN 1 AND 10485760),
    storage_key text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (message_id, appeal_id) REFERENCES messages(id, appeal_id)
);

CREATE INDEX appeals_queue ON appeals (priority, created_at) WHERE status <> 'closed';
CREATE INDEX appeals_expert ON appeals (expert_id) WHERE status <> 'closed';
CREATE INDEX messages_appeal ON messages (appeal_id, created_at, id);
CREATE INDEX attachments_appeal ON attachments (appeal_id, message_id);
