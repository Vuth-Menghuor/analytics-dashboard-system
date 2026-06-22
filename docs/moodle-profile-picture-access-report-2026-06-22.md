# Moodle Profile Picture Access Report

Date: 2026-06-22

## Summary

The analytics dashboard can identify which Moodle users have profile pictures from the database, but it cannot display the actual profile images from a database-only export.

Moodle stores user records and image metadata in the database, but the real image files are stored separately in Moodle's `moodledata/filedir` directory on the Moodle server. Because the current local project has the database data but not the Moodle file storage directory, the dashboard can only show initials for student avatars.

## What Was Verified

The Moodle user table includes profile picture metadata:

```text
public.mdl_user.picture
public.mdl_user.imagealt
```

The database also includes Moodle file metadata in:

```text
public.mdl_files
```

For example, this user has image metadata:

```text
username: e20181125
user id: 420
picture: 232321
image file: f1.jpg
contenthash: a0844ed62597f21e6b2036547496efd301ba5a89
```

The expected physical file path is:

```text
{MOODLE_DATA_ROOT}/filedir/a0/84/a0844ed62597f21e6b2036547496efd301ba5a89
```

But `MOODLE_DATA_ROOT` is not available locally, so Laravel cannot read the actual image bytes.

## Why the Image Does Not Display

The database export contains only references to the image, not the image file itself.

Moodle stores the real image files outside the database:

```text
moodledata/filedir
```

The public Moodle URL was also tested:

```text
https://moodle.ccun.edu.kh
```

The generated Moodle avatar URL exists as metadata, but real browser image requests can fail because Moodle protects file access through its own file-serving logic and session rules. Therefore, the dashboard should not depend on direct cross-site Moodle avatar URLs.

## Current Dashboard Behavior

The dashboard has been prepared for future Moodle file access:

- It checks whether a Moodle user has picture metadata.
- It only returns an avatar URL if the real Moodle file exists and is readable by Laravel.
- If the file is not available, it safely falls back to initials.
- This avoids broken image icons in the student profile drawer.

Current local result:

```text
avatarUrl: null
```

This is expected until Moodle file storage is available.

## What Is Needed to Show Real Profile Pictures

One of these is required:

1. Access to the real Moodle server's `moodledata` directory.
2. A copy/export of `moodledata/filedir` together with the database export.
3. A Moodle web service/API/token that can return user profile images.
4. A public Moodle avatar endpoint that works without Moodle session restrictions.

The recommended option is to provide `moodledata/filedir` or give Laravel read access to it.

## Required Configuration

When the Moodle file storage is available, set this in `backend/.env`:

```env
MOODLE_DATA_ROOT=/path/to/moodledata
```

Then clear Laravel config:

```bash
cd backend
php artisan config:clear
```

After this, profile pictures should display for users whose files exist under:

```text
{MOODLE_DATA_ROOT}/filedir
```

## Useful SQL Checks

Find users with profile picture metadata:

```sql
select id, username, firstname, lastname, email, picture, imagealt
from public.mdl_user
where picture > 0
  and deleted = 0
order by id
limit 50;
```

Find the file metadata for a specific Moodle user:

```sql
select
  f.id,
  f.contenthash,
  f.contextid,
  f.component,
  f.filearea,
  f.itemid,
  f.filepath,
  f.filename,
  f.mimetype,
  f.filesize
from public.mdl_files f
join public.mdl_context c on c.id = f.contextid
where c.contextlevel = 30
  and c.instanceid = 420
  and f.component = 'user'
  and f.filearea = 'icon'
  and f.filename <> '.'
order by f.id;
```

## Conclusion

The issue is not a frontend bug and not a missing database field. The database contains profile image metadata, but the actual image files are stored in Moodle's file storage directory, which was not included in the available local project data.

To display real avatars, the project needs access to Moodle's `moodledata/filedir` storage or a Moodle API that can serve the images.
