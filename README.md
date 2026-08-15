# Discord Clone Project



پروژه تیمی درس تحلیل و طراحی سیستم‌ها



## ایده اصلی



این پروژه یک **monorepo** است: backend با Django و frontend با React/Vite در یک مخزن Git.  

برای دیتابیس، Redis و backend از Docker Compose استفاده می‌شود تا همه‌ی اعضای تیم محیط یکسان داشته باشند.  

برای توسعه‌ی frontend، معمولاً **pnpm** را مستقیم روی سیستم خودتان اجرا می‌کنید (سریع‌تر و HMR بهتر).



---



## فناوری‌ها



### Backend

- Django

- Django REST Framework

- Django Channels

- PostgreSQL

- Redis

- Celery



### Frontend

- React

- Vite

- TypeScript

- pnpm (workspace)



### Infrastructure

- Docker

- Docker Compose



---



## پیش‌نیازها



| ابزار | نسخه پیشنهادی | برای چه کاری |

|--------|----------------|--------------|

| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | آخرین نسخه پایدار | db، redis، backend |

| [Node.js](https://nodejs.org/) | 22+ | frontend |

| [pnpm](https://pnpm.io/installation) | 10+ | frontend |

| [Python](https://www.python.org/) | 3.12+ | فقط اگر backend را خارج از Docker اجرا کنید |



---



## راه‌اندازی سریع (پیشنهادی برای توسعه)



### ۱) گرفتن پروژه

```bash

git clone <repo-url>

cd Discord_Project

```



### ۲) ساخت فایل env

```bash

cp .env.example .env

```



### ۳) بالا آوردن سرویس‌های backend (اولین بار)

```bash

docker compose build

docker compose up db redis backend

```



در ترمینال دیگر:



### ۴) نصب وابستگی‌های frontend

```bash

pnpm install

```



### ۵) اجرای frontend

```bash

pnpm run dev

```



- Frontend: http://localhost:5173  

- Backend API: http://localhost:8000  

- Admin: http://localhost:8000/admin  



### ۶) migration و superuser (فقط بار اول)

```bash

docker compose exec backend python manage.py migrate

docker compose exec backend python manage.py createsuperuser

```



---



## دو روش توسعه



### روش A — Hybrid (پیشنهادی)



| بخش | نحوه اجرا | Hot reload |

|-----|-----------|------------|

| db + redis + backend | `docker compose up db redis backend` | ✅ تغییرات Python بلافاصله اعمال می‌شود |

| frontend | `pnpm run dev` از ریشه پروژه | ✅ Vite HMR |



**مزایا:** frontend سریع‌تر است، مصرف اینترنت کمتر (نیازی به rebuild image برای تغییر کد نیست).



### روش B — همه چیز داخل Docker



```bash

docker compose up

```



frontend هم داخل کانتینر بالا می‌آید. برای تغییر کد Python یا React **نیازی به rebuild image نیست** — volume mount و autoreload فعال است.  

فقط وقتی `requirements.txt` یا `package.json` عوض شد، rebuild لازم است:



```bash

docker compose build backend   # بعد از تغییر pip packages

docker compose build frontend  # بعد از تغییر pnpm packages

```



---



## دستورات رایج



### Frontend (از ریشه monorepo)

```bash

pnpm install          # نصب وابستگی‌ها

pnpm run dev          # dev server (بدون نیاز به --host)

pnpm run build        # build production

pnpm run lint         # eslint

```



### Docker / Backend

```bash

docker compose up db redis backend    # فقط سرویس‌های لازم backend

docker compose up                     # کل stack

docker compose down                   # خاموش کردن

docker compose logs -f backend        # لاگ backend

```



### Django

```bash

docker compose exec backend python manage.py makemigrations

docker compose exec backend python manage.py migrate

docker compose exec backend python manage.py createsuperuser

docker compose exec backend python manage.py test

docker compose exec backend bash

```



### Shell سرویس‌ها

```bash

docker compose exec db psql -U app -d app

docker compose exec redis redis-cli

```



### Makefile (اختیاری)

```bash

make setup

make build

make up

make migrate

```



---



## چه زمانی rebuild لازم است؟



| تغییر | rebuild لازم؟ |

|-------|----------------|

| فایل‌های `.py` در backend | ❌ خیر — autoreload |

| فایل‌های `.tsx` / `.ts` در frontend | ❌ خیر — HMR |

| `backend/requirements.txt` | ✅ `docker compose build backend` |

| `frontend/package.json` | ✅ `pnpm install` + در صورت Docker: `docker compose build frontend` |

| `docker-compose.yml` یا Dockerfile | ✅ `docker compose build` |



---



## اصل مهم هماهنگی تیم



این فایل‌ها باید در Git commit شوند:



- `backend/requirements.txt`

- `frontend/package.json`

- `pnpm-lock.yaml` (ریشه monorepo)

- `package.json` و `pnpm-workspace.yaml` (ریشه monorepo)

- migrationهای Django

- `docker-compose.yml`

- `backend/Dockerfile` و `frontend/Dockerfile`

- `.env.example`



این‌ها commit **نشوند**:



- `.env`

- `node_modules/`

- `__pycache__/`

- دیتای محلی



---



## تنظیمات محیط (`.env`)



فایل `.env.example` را کپی کنید. backend مقادیر را از محیط می‌خواند.



برای **Hybrid dev** (backend در Docker، db روی localhost):

```env

POSTGRES_HOST=db

REDIS_HOST=redis

```



اگر backend را **خارج از Docker** اجرا می‌کنید ولی db/redis در Docker هستند:

```env

POSTGRES_HOST=localhost

REDIS_HOST=localhost

```



---



## روال کار تیمی



### Backend

```bash

docker compose exec backend python manage.py startapp accounts

docker compose exec backend python manage.py makemigrations

docker compose exec backend python manage.py migrate

```



هر پکیج Python جدید → `requirements.txt` → commit → `docker compose build backend`



### Frontend

```bash

pnpm add axios --filter frontend

pnpm run build

```



`package.json` و `pnpm-lock.yaml` را commit کنید.



### Database

Schema فقط از طریق Django migration — هرگز دستی در PostgreSQL.



---



## ساختار پروژه



```text

Discord_Project/

├── backend/

│   ├── config/

│   ├── requirements.txt

│   └── Dockerfile

├── frontend/

│   ├── src/

│   ├── package.json

│   └── Dockerfile

├── package.json              # اسکریپت‌های monorepo

├── pnpm-lock.yaml

├── pnpm-workspace.yaml

├── .env.example

├── docker-compose.yml

├── Makefile

└── README.md

```



---



## عیب‌یابی



### `pnpm run dev` کار نمی‌کند

```bash

pnpm install

```

مطمئن شوید Node 22+ و pnpm نصب است.



### تغییرات backend در Docker دیده نمی‌شود

- مطمئن شوید `docker compose up` در حال اجراست (نه فقط build یک‌باره)

- در Windows، `WATCHFILES_FORCE_POLLING=true` در `docker-compose.yml` تنظیم شده است

- rebuild فقط برای تغییر dependency لازم است، نه برای تغییر `.py`



### frontend از Docker در دسترس نیست

`host: true` در `frontend/vite.config.ts` تنظیم شده — دیگر نیازی به `--host` در خط فرمان نیست.



---



## قانون طلایی تیم



**کد، dependency، migration و configuration در Git؛ کانتینر فقط محیط اجراست. برای تغییر کد، rebuild نکنید — فقط up کنید.**

# Project Requirements Implementation Details

This document explains how each requirement from Epic 3 and Epic 4 is implemented in the codebase.

## Epic 3: Private Group Management

### US-18: Create a private group

The `CreateGroupDialog` React component collects the group's details and sends a request to the API. In the backend, the `create_group` service function creates the group with a 'private' access level and generates a unique invite link. The creator is set as the `Owner` and is automatically added as a member in the `GroupMembership` model.

### US-19: View group in conversations list

Groups are displayed in the `ConversationSidebar` component. The backend views ensure that the API only returns groups where the user is either the owner or a member (via `GroupMembership`). The sidebar shows the group's name, avatar, member count, and unread message status.

### US-20: Add member to group

Group owners can add members via the group info panel by searching for their phone number or name. The `add_group_member` service function checks if the user is the owner and respects the target user's privacy settings before adding them to `GroupMembership`, granting immediate access.

### US-21: Remove member from group

Only the group owner can remove members. Removing a member deletes their `GroupMembership` record. Access control mechanisms in both REST APIs and WebSockets (`can_access_chat`) continuously check memberships, so removed members instantly lose access to new messages.

### US-22: Configure 'Add to Group' permission

Users have a `can_be_added_to_group` field in their profile. The `add_group_member` service checks this flag. If it's disabled, direct addition by others is blocked with a permission error. However, users can still voluntarily join using an invite link.

### US-23: Edit group info

The `GroupInfoDialog` component and the `PATCH /api/groups/{id}/` endpoint allow changing the group's name, bio, tag, access level, and media settings. The `update_group` service verifies that the user is the owner before applying the changes.

### US-24: Edit group avatar

The `Group` model has an independent `ImageField` for avatars. Create and update endpoints support multipart requests to handle image uploads. After validation, the new avatar is saved and served via `avatar_url`.

### US-25: Delete group

The delete option is only available to the group owner. The `delete_group` service performs a 'soft delete' by setting the `is_deleted` flag to true. This preserves the chat history in the database while removing the group from all user interfaces and active access paths.

### US-26: Leave group

Group membership is managed through independent `GroupMembership` records. Leaving a group simply deletes this record. Afterward, `can_access_chat` prevents further access. Owners must first transfer ownership or delete the group before leaving.

## Epic 4: Channel, Topic, and Access Control

### US-27: Create a channel

The `CreateChannelDialog` component collects the channel's name, bio, tag, avatar, and access level (public/private). The `create_channel` service creates the channel in a database transaction, assigns the creator as the `Owner`, and creates an admin `ChannelMembership` record.

### US-28: Unique channel identity

Active channel names are enforced to be unique (case-insensitive) using a `UniqueConstraint` (`uq_channel_name_ci`) in the database. The creation and update services also validate this. Each channel also receives an unguessable invite token.

### US-29: Search public channels

The `ChannelDirectoryView` handles searching by name and bio, strictly filtering results to only include channels with `access_level=public`. The frontend `SearchResultsPage` displays these public results with member counts and a join option, keeping private channels hidden.

### US-30: Create channel invite link

A unique token is generated for the channel upon creation. Owners or Admins can view, copy, or rotate it via the `ChannelInfoDialog`. The `rotate_channel_invite` service generates a new token, invalidating the old one while the new one remains valid indefinitely.

### US-31: Join channel via invite link

The `JoinChannelPage` shows a preview of the channel details before joining. The `ChannelInviteJoinView` verifies the token and, if valid, calls the `join_channel_via_token` service to create a `ChannelMembership`. Invalid or tokens for deleted channels are rejected.

### US-32: Remove member from channel

Owners and Admins can remove members. The `remove_channel_member` service prevents removing the Owner and prevents Admins from removing other Admins. Once the membership is deleted, the user loses access to all topics and live events.

### US-33: Create a Topic

The `TopicDialog` component and `TopicListCreateView` allow creating a Topic within a channel. The `create_topic` service ensures only Owners or Admins can do this, and a `ForeignKey` ensures the Topic is strictly bound to its parent channel.

### US-34: View channel Topics

The `ChannelPage` and API endpoints list active (non-deleted) Topics. The `can_discover_channel` permission logic ensures private channel details and topics remain hidden from non-members. Each Topic functions as an independent chat room.

### US-35: Send text message in Topic

A `Topic` inherits from the base `Chat` model and uses the standard messaging flow. `can_access_chat` verifies channel membership, while `can_send_to_chat` checks if regular members are allowed to post. Messages are stored linked to the Topic and broadcasted in real-time.

### US-36: Edit channel info

The `ChannelInfoDialog` and the PATCH endpoint allow modifying the channel's bio, tag, avatar, access type, and media settings. The `update_channel` service restricts these actions to managerial roles and validates inputs before saving.

### US-37: Change channel name

The channel name can be edited. The service rejects empty or duplicate names, backed by the case-insensitive `UniqueConstraint` in the database. Role checks (`is_channel_owner` or `is_channel_admin`) are performed before applying the change.

### US-38: Delete channel

Only the Owner can delete the channel. After confirmation, the `delete_channel` service performs a soft delete on the channel and all its dependent Topics within a single transaction, removing them from view and access.

### US-39: Assign Admin role

The Owner can promote a member to Admin via the members list in `ChannelInfoDialog`. The `set_channel_admin` service accepts only Owner requests and sets `is_admin=True` on the user's `ChannelMembership`, instantly granting managerial permissions.

### US-40: Revoke Admin role

Using the same endpoint, setting `is_admin=False` reverts the user to a regular Member. Only the Owner can do this, and subsequent permission checks will immediately reflect the updated membership status.

### US-41: Enforce channel roles

Centralized functions (`is_channel_owner`, `is_channel_admin`, `is_channel_member`) enforce role policies across all services. Deleting the channel and managing roles is for the Owner; managing topics/members is for Owners/Admins; regular posting is for Members.

### US-42: Configure media send access

The `allow_media` field on the `Channel` model can be toggled by Owners/Admins via `ChannelInfoDialog`. The `can_send_media_to_chat` function applies this setting specifically to the channel's Topics (Private chats and Groups have their own independent policies).

### US-43: Prevent media sending by restricted Members

Based on `allow_media` and the user's role, the `ChatPage` UI disables the attachment option. The backend independently enforces this by rejecting unauthorized uploads with a permission error. Owners and Admins bypass this restriction.
