# STAGE 3 — Add Simple CampusConnect Features

Continue from the stable implementation of Stage 2.

The goal is to make the application feel like a campus communication app without making it unnecessarily complicated.

## Feature 1: Profile screen
- Display the current user's available information.
- Reuse existing user data.
- Add a clean profile layout.
- Do not invent profile fields or add a new authentication system.

## Feature 2: Group information
If supported by the existing API:
- Display group name.
- Display group participants.
- Display available group metadata.

Do not add admin roles, member permissions, or editing features unless the backend supports them.

## Feature 3: Search
- Add search for users.
- Add search for conversations.
- Use local filtering of already-fetched data if appropriate.
- Make the search responsive and easy to clear.

## Feature 4: Image sharing
First inspect the existing image-upload API.

If supported:
- Allow choosing an image from the gallery.
- Allow taking a photo using the camera.
- Display a preview before sending.
- Send the image using the backend's documented format.
- Display the uploaded image in the conversation.
- Handle cancellation and upload errors.

Do not confuse an image URI with Base64 data.
Do not convert images unnecessarily.
Do not implement a fake image upload that only displays a local image.

If the backend does not support image uploads, leave the feature clearly documented as pending rather than inventing an endpoint.

## Feature 5: Campus announcements
Only implement this if the existing backend can represent and retrieve announcement-style group conversations.

Keep it simple:
- A dedicated announcement conversation or clearly identifiable group.
- A readable announcement message layout.
- No complex moderation or role system.

## Code quality
- Use reusable components.
- Keep API logic outside UI components.
- Add useful comments for viva explanations.
- Update `docs/VIVA_NOTES.md`.
- Avoid unnecessary packages.

At the end, list which features are fully working, partially working, or blocked by backend limitations.