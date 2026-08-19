--
-- PostgreSQL database dump
--

\restrict rHkiQGvI0166QhP9MviBp9hffhSOayFihZp8uOiVCfSURKTbhcYmWeHjh2rU64g

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ConversationStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."ConversationStatus" AS ENUM (
    'active',
    'resolved',
    'archived'
);


ALTER TYPE public."ConversationStatus" OWNER TO ukss;

--
-- Name: ExpertDocumentStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."ExpertDocumentStatus" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public."ExpertDocumentStatus" OWNER TO ukss;

--
-- Name: ExpertDocumentType; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."ExpertDocumentType" AS ENUM (
    'identity',
    'qualification'
);


ALTER TYPE public."ExpertDocumentType" OWNER TO ukss;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."NotificationType" AS ENUM (
    'request_matched',
    'request_matching_timeout',
    'new_message',
    'application_approved',
    'application_rejected',
    'payment_receipt',
    'payout_sent',
    'review_received',
    'moderation_action'
);


ALTER TYPE public."NotificationType" OWNER TO ukss;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'pending',
    'paid',
    'refunded',
    'failed'
);


ALTER TYPE public."PaymentStatus" OWNER TO ukss;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'scheduled',
    'processing',
    'paid',
    'failed'
);


ALTER TYPE public."PayoutStatus" OWNER TO ukss;

--
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'pending',
    'investigating',
    'resolved',
    'dismissed'
);


ALTER TYPE public."ReportStatus" OWNER TO ukss;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'submitted',
    'matching',
    'matched',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public."RequestStatus" OWNER TO ukss;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."UserRole" AS ENUM (
    'student',
    'expert',
    'admin'
);


ALTER TYPE public."UserRole" OWNER TO ukss;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."UserStatus" AS ENUM (
    'active',
    'suspended',
    'banned',
    'deleted'
);


ALTER TYPE public."UserStatus" OWNER TO ukss;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: ukss
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public."VerificationStatus" OWNER TO ukss;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ukss;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    actor_id text NOT NULL,
    action text NOT NULL,
    target_id text,
    details jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO ukss;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.blog_posts (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    category text NOT NULL,
    body text NOT NULL,
    read_time_min integer,
    published_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.blog_posts OWNER TO ukss;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    request_id text NOT NULL,
    student_id text NOT NULL,
    expert_id text NOT NULL,
    status public."ConversationStatus" DEFAULT 'active'::public."ConversationStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversations OWNER TO ukss;

--
-- Name: expert_documents; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.expert_documents (
    id text NOT NULL,
    expert_id text NOT NULL,
    doc_type public."ExpertDocumentType" NOT NULL,
    file_url text NOT NULL,
    status public."ExpertDocumentStatus" DEFAULT 'pending'::public."ExpertDocumentStatus" NOT NULL,
    rejection_reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.expert_documents OWNER TO ukss;

--
-- Name: expert_profiles; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.expert_profiles (
    user_id text NOT NULL,
    subjects text[],
    qualifications text NOT NULL,
    bio text,
    verification_status public."VerificationStatus" DEFAULT 'pending'::public."VerificationStatus" NOT NULL,
    rating_avg numeric(3,2) DEFAULT 0 NOT NULL,
    is_available boolean DEFAULT false NOT NULL,
    paypal_email text
);


ALTER TABLE public.expert_profiles OWNER TO ukss;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.messages (
    id text NOT NULL,
    conversation_id text NOT NULL,
    sender_id text NOT NULL,
    body text,
    attachment_url text,
    read_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO ukss;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    type public."NotificationType" NOT NULL,
    payload jsonb NOT NULL,
    read_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO ukss;

--
-- Name: oauth_accounts; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.oauth_accounts (
    id text NOT NULL,
    user_id text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.oauth_accounts OWNER TO ukss;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.payments (
    id text NOT NULL,
    request_id text NOT NULL,
    student_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'pending'::public."PaymentStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    paypal_capture_id text,
    paypal_order_id text
);


ALTER TABLE public.payments OWNER TO ukss;

--
-- Name: payouts; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.payouts (
    id text NOT NULL,
    expert_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    status public."PayoutStatus" DEFAULT 'scheduled'::public."PayoutStatus" NOT NULL,
    period_start timestamp(3) without time zone NOT NULL,
    period_end timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    paypal_payout_batch_id text
);


ALTER TABLE public.payouts OWNER TO ukss;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    revoked_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO ukss;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.reports (
    id text NOT NULL,
    reporter_id text NOT NULL,
    request_id text,
    conversation_id text,
    reason text NOT NULL,
    details text,
    status public."ReportStatus" DEFAULT 'pending'::public."ReportStatus" NOT NULL,
    action_taken text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reports OWNER TO ukss;

--
-- Name: request_attachments; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.request_attachments (
    id text NOT NULL,
    request_id text NOT NULL,
    file_url text NOT NULL,
    file_name text NOT NULL,
    uploaded_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mime_type text,
    size_bytes integer,
    storage_key text
);


ALTER TABLE public.request_attachments OWNER TO ukss;

--
-- Name: requests; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.requests (
    id text NOT NULL,
    student_id text NOT NULL,
    service_id text NOT NULL,
    subject text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    deadline_at timestamp(3) without time zone NOT NULL,
    status public."RequestStatus" DEFAULT 'submitted'::public."RequestStatus" NOT NULL,
    matched_expert_id text,
    matching_widened_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.requests OWNER TO ukss;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    request_id text NOT NULL,
    student_id text NOT NULL,
    expert_id text NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reviews OWNER TO ukss;

--
-- Name: services; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.services (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    price numeric(10,2) DEFAULT 45.00 NOT NULL
);


ALTER TABLE public.services OWNER TO ukss;

--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.student_profiles (
    user_id text NOT NULL,
    university text NOT NULL,
    course text NOT NULL,
    year_of_study text NOT NULL,
    full_name text
);


ALTER TABLE public.student_profiles OWNER TO ukss;

--
-- Name: users; Type: TABLE; Schema: public; Owner: ukss
--

CREATE TABLE public.users (
    id text NOT NULL,
    role public."UserRole" NOT NULL,
    email text NOT NULL,
    password_hash text,
    phone text,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    email_verified_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    email_verification_code_hash text,
    email_verification_expires_at timestamp(3) without time zone,
    password_reset_expires_at timestamp(3) without time zone,
    password_reset_token_hash text
);


ALTER TABLE public.users OWNER TO ukss;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a3943110-bf57-4ef0-81fa-f66956bbc588	a326d16ae881347f186d6c379f0ab4dd78ba8fe2b4fa041034c35d45d24eeee1	2026-08-10 17:13:43.26145+00	20260808154518_init	\N	\N	2026-08-10 17:13:43.064276+00	1
80730595-410b-4d50-a8b9-4157651ef461	8ac4172219bf29d8b1a8198d3c2647d22e93357b58c5aa499167b18dbba4be14	2026-08-10 17:13:43.27909+00	20260808220128_add_verification_reset_fields	\N	\N	2026-08-10 17:13:43.266421+00	1
1fa1e9b4-c638-4161-8b85-5ee9235e0a61	cd7882ca915b9d62a042f45576125f0a4e7eb256631835bbe3bb7a14efa29e78	2026-08-10 17:23:47.755796+00	20260810172347_add_service_price	\N	\N	2026-08-10 17:23:47.741708+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.audit_logs (id, actor_id, action, target_id, details, created_at) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.blog_posts (id, title, slug, category, body, read_time_min, published_at, created_at, updated_at) FROM stdin;
b72d3106-81f3-45a7-af9f-7f933b8a572a	Writing a High-Quality University Essay: Where to Start	writing-a-high-quality-university-essay-where-to-start	Essay Writing	Writing a compelling university essay requires structure, critical analysis, and evidence-based argumentation. \n\n### 1. Deconstruct the Prompt\nBefore writing a single word, break down the assignment question into key components: the directive verb (e.g. *critically evaluate*, *analyse*, *compare*), the core topic, and any specific parameters or context.\n\n### 2. Formulate a Strong Thesis Statement\nYour thesis is the central claim of your essay. It should be concise, arguable, and directly answer the question prompt. Avoid generic summaries; instead, take a clear stance supported by evidence.\n\n### 3. Structural Essentials\n- **Introduction (10%)**: Contextualise the topic, state thesis, outline roadmap.\n- **Body Paragraphs (80%)**: Use PEEL structure (Point, Evidence, Explanation, Link).\n- **Conclusion (10%)**: Synthesise key arguments without introducing new evidence.\n\n### 4. Critical Assessment of Sources\nRely on peer-reviewed academic journals, academic monographs, and credible UK repository data. Evaluate each source's methodology, potential bias, and relevance to your thesis argument.	6	2026-08-10 17:13:48.172	2026-08-10 17:13:48.174	2026-08-10 17:13:48.174
d9ce77ce-4f42-40a5-a4b0-0e3231706780	Smarter Ways to Manage Coursework and Deadlines	smarter-ways-to-manage-coursework-and-deadlines	Study Skills	Juggling multiple module deadlines alongside lectures and personal commitments is one of the biggest challenges for UK university students.\n\n### 1. Reverse Deadline Planning\nWork backwards from submission date. Break down the task into milestones: topic selection, research, outline drafting, full draft completion, and final proofreading.\n\n### 2. Time Blocking & Pomodoro Technique\nAllocate dedicated 90-minute deep-work focus windows. Use 25-minute Pomodoro sprints for drafting intense sections to maintain momentum and prevent burnout.\n\n### 3. Document Management & Backups\nStore working drafts in cloud storage (OneDrive/Google Drive) with automatic version history. Keep reference files organised in folder sub-categories per module code.	5	2026-08-10 17:13:48.172	2026-08-10 17:13:48.179	2026-08-10 17:13:48.179
91118557-7873-40e0-bb6c-35982c895592	A Simple Guide to Harvard, APA & OSCOLA Referencing	a-simple-guide-to-harvard-apa-and-oscola-referencing	Referencing	Referencing correctly is vital to maintaining academic integrity and avoiding accidental plagiarism in UK higher education assessments.\n\n### Harvard Style (Author-Date)\nWidely used across UK universities in business, humanities, and social sciences.\n- *In-text*: (Smith, 2023, p. 45)\n- *Bibliography*: Smith, J. (2023) *Academic Writing in Higher Education*. London: Palgrave Macmillan.\n\n### OSCOLA (Oxford University Standard for Citation of Legal Authorities)\nStandard citation style for UK Law degrees.\n- *Footnotes*: Case name in italics, neutral citation, law report. e.g. *Donoghue v Stevenson* [1932] AC 562.\n- *No in-text parentheses*: All citations appear in footnotes at the bottom of the page.\n\n### APA 7th Edition\nCommonly specified for Psychology, Social Sciences, and Health disciplines.\n- *In-text*: (Smith & Jones, 2022)\n- *Bibliography*: Includes hanging indents and DOI links for online articles.	4	2026-08-10 17:13:48.172	2026-08-10 17:13:48.182	2026-08-10 17:13:48.182
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.conversations (id, request_id, student_id, expert_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: expert_documents; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.expert_documents (id, expert_id, doc_type, file_url, status, rejection_reason, created_at) FROM stdin;
\.


--
-- Data for Name: expert_profiles; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.expert_profiles (user_id, subjects, qualifications, bio, verification_status, rating_avg, is_available, paypal_email) FROM stdin;
29b86e7a-821a-4811-a363-561d0f18f101	{"Assignment Help","Dissertation Guidance","Programming Help","Essay Writing"}	PhD Computer Science (Cambridge), Senior Lecturer	Senior Academic Lecturer with 8+ years experience guiding UK undergraduate and postgraduate students in technical & research writing.	approved	4.95	t	robert.vance@cambridge.ac.uk
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.messages (id, conversation_id, sender_id, body, attachment_url, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.notifications (id, user_id, type, payload, read_at, created_at) FROM stdin;
89bcb323-8acf-467a-9cf6-ef0b168f8ff1	29b86e7a-821a-4811-a363-561d0f18f101	request_matched	{"message": "New request available in Computer Science", "subject": "Computer Science", "requestId": "01c76bab-9447-4c8c-baa4-d106b14ae023"}	\N	2026-08-11 10:24:23.924
\.


--
-- Data for Name: oauth_accounts; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.oauth_accounts (id, user_id, provider, provider_account_id, created_at) FROM stdin;
74233e39-11ee-4215-a975-7511533570f4	be487246-8891-49cb-aa29-b401500d6c05	google	google-student-1786443732774	2026-08-11 10:22:12.811
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.payments (id, request_id, student_id, amount, currency, status, created_at, updated_at, paypal_capture_id, paypal_order_id) FROM stdin;
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.payouts (id, expert_id, amount, currency, status, period_start, period_end, created_at, paypal_payout_batch_id) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, created_at) FROM stdin;
25a61642-3667-442a-9b22-2c3a1b588e05	4d310075-285f-4523-a4fa-d15c0e6f65b7	8d459112ab19c2498126f18e4811aad9ffb0ddf495fb92094232a746c65e0b30	2026-09-10 09:44:50.312	\N	2026-08-11 09:44:50.314
baf00fc6-dc75-49dd-ac1f-9cda23d3bdab	4d310075-285f-4523-a4fa-d15c0e6f65b7	0a6c196161fc31428bb8ec9ea527a4d249c06453f1139968c0c8add6285cd9a4	2026-09-10 09:50:19.696	\N	2026-08-11 09:50:19.698
1d806ad9-57a7-4a77-a124-3826dce06ad1	be487246-8891-49cb-aa29-b401500d6c05	aa329d4d9c20683fcb2b515c8b2bf8a0cd4258cbba400cb29c53693bfd57709b	2026-09-10 10:22:12.844	2026-08-11 10:22:16.471	2026-08-11 10:22:12.844
465d28e8-7653-4958-a6c0-44a0232283f4	4aa6b7c0-0025-4d20-a997-242ee0f0b2f9	d09221a1593191bbf4a88d1ed088a7cb87c12f12bcc7158337c56a871becf60c	2026-09-10 10:22:31.056	2026-08-11 10:24:30.503	2026-08-11 10:22:31.057
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.reports (id, reporter_id, request_id, conversation_id, reason, details, status, action_taken, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: request_attachments; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.request_attachments (id, request_id, file_url, file_name, uploaded_by, created_at, mime_type, size_bytes, storage_key) FROM stdin;
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.requests (id, student_id, service_id, subject, title, description, deadline_at, status, matched_expert_id, matching_widened_at, created_at, updated_at) FROM stdin;
01c76bab-9447-4c8c-baa4-d106b14ae023	4aa6b7c0-0025-4d20-a997-242ee0f0b2f9	b128f912-f4c9-41b0-9017-7ac86acdb0d0	Computer Science	Final Year Project System Architecture Review	I need guidance verifying my microservice system architecture design, database entity-relationship schema, and API REST endpoint definitions before my interim assessment next week.	2026-08-20 18:29:00	matching	\N	\N	2026-08-11 10:24:23.887	2026-08-11 10:24:23.887
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.reviews (id, request_id, student_id, expert_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.services (id, name, description, icon, is_active, created_at, price) FROM stdin;
b128f912-f4c9-41b0-9017-7ac86acdb0d0	Assignment Help	Step-by-step guidance on understanding assignment briefs and structure.	BookOpen	t	2026-08-10 17:13:48.139	25.00
970e8b39-ad8b-41da-966e-c5ef5c80b785	Homework Support	Quick assistance with coursework questions and problem sets.	HelpCircle	t	2026-08-10 17:13:48.148	15.00
58e98945-4684-420c-aa25-822df63cfff9	Dissertation Guidance	Expert feedback on thesis proposals, methodology, and literature reviews.	FileText	t	2026-08-10 17:13:48.151	60.00
bde32eb1-d856-4a4b-967c-56616d6cb51b	Exam Preparation	Targeted revision strategies and mock exam question walkthroughs.	Award	t	2026-08-10 17:13:48.155	30.00
496ed961-875a-41ff-93b3-7db91797230d	Proofreading & Editing	Academic style, clarity check, grammar, and structural polish.	CheckCircle	t	2026-08-10 17:13:48.157	20.00
3f0f8e2a-db88-458e-919e-862bf0aa79a9	Programming Help	Code debugging, architecture explanation, and algorithm support.	Code	t	2026-08-10 17:13:48.161	35.00
cf4c4bb7-65f5-4412-9585-2d1adbfa7bad	Essay Writing	Academic argument structure, critical analysis, and outline guidance.	PenTool	t	2026-08-10 17:13:48.164	30.00
013beeec-111a-407c-ad38-aa80f584d449	Referencing Support	Harvard, APA, OSCOLA and IEEE reference formatting and citations.	Bookmark	t	2026-08-10 17:13:48.166	12.00
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.student_profiles (user_id, university, course, year_of_study, full_name) FROM stdin;
4d310075-285f-4523-a4fa-d15c0e6f65b7	University of Manchester	BSc Computer Science	Final-Year	\N
be487246-8891-49cb-aa29-b401500d6c05	UK University	General Studies	First-Year	Google Student
4aa6b7c0-0025-4d20-a997-242ee0f0b2f9	University of Manchester	BSc Computer Science	First-Year	abc
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ukss
--

COPY public.users (id, role, email, password_hash, phone, status, email_verified_at, created_at, updated_at, email_verification_code_hash, email_verification_expires_at, password_reset_expires_at, password_reset_token_hash) FROM stdin;
248023fe-475e-4872-afc8-bca02105dde5	admin	admin@ukstudentsupport.co.uk	$2b$12$/5nnMLurOWPzOaisuHL3cOLftFo2IVf.ojZwgu1MHvA4iAQUq701C	+44 20 7946 0912	active	2026-08-11 08:36:05.114	2026-08-11 08:36:05.134	2026-08-11 08:36:05.134	\N	\N	\N	\N
29b86e7a-821a-4811-a363-561d0f18f101	expert	robert.vance@cambridge.ac.uk	$2b$12$1tLRaMobY0.TqnxEa9dc3uhP5BwwBD.u/nDevVckXpSdcY4VO8ETu	+44 7700 900077	active	2026-08-11 08:36:50.24	2026-08-11 08:36:50.242	2026-08-11 08:36:50.242	\N	\N	\N	\N
4d310075-285f-4523-a4fa-d15c0e6f65b7	student	aisha.patel@manchester.ac.uk	$2b$12$CAYy8N5JjlOeR2dLV0d.TuFtU5F/InDFDgg8gtOTWcmp.Mv9wBieu	+44 7700 900123	active	2026-08-11 08:36:50.261	2026-08-11 08:36:50.263	2026-08-11 08:36:50.263	\N	\N	\N	\N
be487246-8891-49cb-aa29-b401500d6c05	student	student.google@ac.uk	\N	\N	active	2026-08-11 10:22:12.81	2026-08-11 10:22:12.811	2026-08-11 10:22:12.811	\N	\N	\N	\N
4aa6b7c0-0025-4d20-a997-242ee0f0b2f9	student	forauktave@gmail.com	$2b$12$GlXK6aLDebrhW8eAWkVOJOrMx7fYKm77va7gSdJiZkbkHuQxs2IzK	\N	active	\N	2026-08-11 10:22:30.795	2026-08-11 10:22:30.795	08e7c7ccb9dd2e38ce1b641b5fb7cb3fe05094c919aa6f77afe00195ef1b663d	2026-08-11 10:37:30.794	\N	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: expert_documents expert_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.expert_documents
    ADD CONSTRAINT expert_documents_pkey PRIMARY KEY (id);


--
-- Name: expert_profiles expert_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.expert_profiles
    ADD CONSTRAINT expert_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: oauth_accounts oauth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: request_attachments request_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.request_attachments
    ADD CONSTRAINT request_attachments_pkey PRIMARY KEY (id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_actor_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX audit_logs_actor_id_idx ON public.audit_logs USING btree (actor_id);


--
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- Name: conversations_expert_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX conversations_expert_id_idx ON public.conversations USING btree (expert_id);


--
-- Name: conversations_request_id_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX conversations_request_id_key ON public.conversations USING btree (request_id);


--
-- Name: conversations_student_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX conversations_student_id_idx ON public.conversations USING btree (student_id);


--
-- Name: expert_documents_expert_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX expert_documents_expert_id_idx ON public.expert_documents USING btree (expert_id);


--
-- Name: messages_conversation_id_created_at_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX messages_conversation_id_created_at_idx ON public.messages USING btree (conversation_id, created_at);


--
-- Name: notifications_user_id_read_at_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX notifications_user_id_read_at_idx ON public.notifications USING btree (user_id, read_at);


--
-- Name: oauth_accounts_provider_provider_account_id_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX oauth_accounts_provider_provider_account_id_key ON public.oauth_accounts USING btree (provider, provider_account_id);


--
-- Name: oauth_accounts_user_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX oauth_accounts_user_id_idx ON public.oauth_accounts USING btree (user_id);


--
-- Name: payments_paypal_capture_id_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX payments_paypal_capture_id_key ON public.payments USING btree (paypal_capture_id);


--
-- Name: payments_paypal_order_id_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX payments_paypal_order_id_key ON public.payments USING btree (paypal_order_id);


--
-- Name: payments_request_id_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX payments_request_id_key ON public.payments USING btree (request_id);


--
-- Name: payouts_expert_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX payouts_expert_id_idx ON public.payouts USING btree (expert_id);


--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- Name: reports_reporter_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX reports_reporter_id_idx ON public.reports USING btree (reporter_id);


--
-- Name: reports_status_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX reports_status_idx ON public.reports USING btree (status);


--
-- Name: request_attachments_request_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX request_attachments_request_id_idx ON public.request_attachments USING btree (request_id);


--
-- Name: requests_matched_expert_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX requests_matched_expert_id_idx ON public.requests USING btree (matched_expert_id);


--
-- Name: requests_status_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX requests_status_idx ON public.requests USING btree (status);


--
-- Name: requests_student_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX requests_student_id_idx ON public.requests USING btree (student_id);


--
-- Name: reviews_expert_id_idx; Type: INDEX; Schema: public; Owner: ukss
--

CREATE INDEX reviews_expert_id_idx ON public.reviews USING btree (expert_id);


--
-- Name: reviews_request_id_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX reviews_request_id_key ON public.reviews USING btree (request_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: ukss
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: conversations conversations_expert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_expert_id_fkey FOREIGN KEY (expert_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: conversations conversations_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expert_documents expert_documents_expert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.expert_documents
    ADD CONSTRAINT expert_documents_expert_id_fkey FOREIGN KEY (expert_id) REFERENCES public.expert_profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expert_profiles expert_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.expert_profiles
    ADD CONSTRAINT expert_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: oauth_accounts oauth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payouts payouts_expert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_expert_id_fkey FOREIGN KEY (expert_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reports reports_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: request_attachments request_attachments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.request_attachments
    ADD CONSTRAINT request_attachments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: request_attachments request_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.request_attachments
    ADD CONSTRAINT request_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: requests requests_matched_expert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_matched_expert_id_fkey FOREIGN KEY (matched_expert_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: requests requests_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: requests requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_expert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_expert_id_fkey FOREIGN KEY (expert_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ukss
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rHkiQGvI0166QhP9MviBp9hffhSOayFihZp8uOiVCfSURKTbhcYmWeHjh2rU64g

