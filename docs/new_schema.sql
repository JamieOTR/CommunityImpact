Here’s a full SQL schema you can use to implement the Community Impact Tracker App database using best practices. This is written in standard PostgreSQL syntax, but it can be adapted for MySQL or other RDBMS with minor changes:

📦 Database Schema: ai\_community\_impact

\-- 1. Users Table
CREATE TABLE users (
user\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
full\_name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
phone\_number TEXT,
role TEXT CHECK (role IN ('participant', 'coordinator', 'admin')) DEFAULT 'participant',
organization\_id UUID,
location TEXT,
joined\_date TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
status TEXT CHECK (status IN ('active', 'inactive', 'banned')) DEFAULT 'active',
created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP
);

\-- 2. Programs Table
CREATE TABLE programs (
program\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
program\_name TEXT NOT NULL,
description TEXT,
start\_date DATE,
end\_date DATE,
program\_lead\_id UUID REFERENCES users(user\_id),
goals JSONB,
status TEXT CHECK (status IN ('planning', 'active', 'paused', 'complete')) DEFAULT 'planning',
created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP
);

\-- 3. Milestones Table
CREATE TABLE milestones (
milestone\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
program\_id UUID REFERENCES programs(program\_id) ON DELETE CASCADE,
title TEXT NOT NULL,
description TEXT,
due\_date DATE,
completed\_date DATE,
assigned\_to\_user\_id UUID REFERENCES users(user\_id),
status TEXT CHECK (status IN ('not started', 'in progress', 'completed', 'delayed')) DEFAULT 'not started',
priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
impact\_score NUMERIC(5,2),
created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP
);

\-- 4. Activity Logs
CREATE TABLE activity\_logs (
log\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
user\_id UUID REFERENCES users(user\_id),
program\_id UUID REFERENCES programs(program\_id),
milestone\_id UUID REFERENCES milestones(milestone\_id),
action\_type TEXT CHECK (action\_type IN ('create', 'update', 'complete', 'comment', 'review')),
description TEXT,
timestamp TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
change\_snapshot JSONB
);

\-- 5. Progress Updates
CREATE TABLE progress\_updates (
update\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
milestone\_id UUID REFERENCES milestones(milestone\_id),
user\_id UUID REFERENCES users(user\_id),
update\_type TEXT CHECK (update\_type IN ('text', 'image', 'document', 'AI-assessed')),
update\_content TEXT,
percent\_complete NUMERIC(5,2) CHECK (percent\_complete >= 0 AND percent\_complete <= 100),
timestamp TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
ai\_verified BOOLEAN DEFAULT FALSE,
notes TEXT
);

\-- 6. Media / Evidence Uploads
CREATE TABLE evidence\_uploads (
media\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
milestone\_id UUID REFERENCES milestones(milestone\_id),
user\_id UUID REFERENCES users(user\_id),
file\_type TEXT,
file\_url TEXT NOT NULL,
uploaded\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
verified\_by\_ai BOOLEAN DEFAULT FALSE,
approved\_by\_admin BOOLEAN DEFAULT FALSE
);

\-- 7. Tags (optional taxonomy)
CREATE TABLE tags (
tag\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
tag\_name TEXT NOT NULL,
tag\_type TEXT CHECK (tag\_type IN ('theme', 'goal', 'sdg', 'custom')),
applies\_to TEXT CHECK (applies\_to IN ('program', 'milestone', 'update'))
);

\-- 8. Program Tag Join Table
CREATE TABLE program\_tags (
program\_id UUID REFERENCES programs(program\_id) ON DELETE CASCADE,
tag\_id UUID REFERENCES tags(tag\_id),
PRIMARY KEY (program\_id, tag\_id)
);

\-- 9. Impact Assessments
CREATE TABLE impact\_assessments (
assessment\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
program\_id UUID REFERENCES programs(program\_id),
milestone\_id UUID REFERENCES milestones(milestone\_id),
user\_id UUID REFERENCES users(user\_id),
assessment\_date DATE DEFAULT CURRENT\_DATE,
metrics JSONB,
qualitative\_feedback TEXT,
ai\_analysis\_summary TEXT,
score NUMERIC(5,2)
);

\-- 10. Rewards Table
CREATE TABLE incentives (
reward\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
user\_id UUID REFERENCES users(user\_id),
milestone\_id UUID REFERENCES milestones(milestone\_id),
reward\_type TEXT CHECK (reward\_type IN ('token', 'badge', 'certificate')),
reward\_value TEXT,
reward\_issued\_date TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,
claimed\_status BOOLEAN DEFAULT FALSE
);

This schema is modular, normalized, and scalable. You can extend it with:

* audit tables
* analytics dashboards (using views or materialized views)
* optional support for localization/multilingual content
* AI-generated scores and GPT-driven summarization

Would you like this exported as a ready-to-use file, or also need a [visual ERD diagram](f), [GraphQL schema](f), or [REST API endpoints list](f) based on this schema?
