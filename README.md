# XRD Facility Website

Static institutional website for the **X-Ray Diffractometer (XRD) Facility**, served via GitHub Pages.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home page – hero, quick-link cards, facility overview |
| `booking.html` | Booking – slot availability, pricing table, MS Forms link |
| `learn.html` | Learn about XRD – X-ray basics, Bragg's law, sample prep, safety |
| `data.html` | Data Interpretation – software, databases, phase ID guidance |
| `contact.html` | Contact – office hours, contact info, mailto-based enquiry form |
| `assets/styles.css` | Shared CSS – light/dark theme, responsive layout |
| `assets/main.js` | Shared JS – theme toggle, booking availability renderer |

## Features

- **Light / Dark mode** – respects `prefers-color-scheme` and persists user choice in `localStorage`.
- **Responsive layout** – works on mobile, tablet, and desktop.
- **Booking availability** – dynamically shows the next two Wednesdays with slot counts and colour-coded indicators.
- **Accessible** – semantic HTML, skip-link, ARIA roles, visible focus states.

## Enabling GitHub Pages

1. Go to **Settings → Pages** in this repository.
2. Under *Build and deployment → Source*, select **Deploy from a branch**.
3. Select the `main` branch and **/ (root)** folder, then click **Save**.
4. The site will be available at `https://<your-org>.github.io/<repo-name>/` within a few minutes.

## Updating placeholder contact details

The contact page (`contact.html`) contains several placeholder values that must be replaced with real information before going live:

- **Email** — search for `xrd-facility@institution.ac.in` and replace with the facility's actual email address (also update the `mailto:` in the contact form script at the bottom of `contact.html`).
- **Phone** — replace `+91 [Phone Number]` with the real number.
- **Location** — replace `[Department Name]`, `[Building Name]`, `[Room No.]`, `[Institution Name]`, and `[City, State – PIN Code]` with actual values.
- **Key Personnel** — replace `[Name]`, `[Designation]`, `[Department]`, and the placeholder email addresses with real names and emails.

## Updating the Microsoft Forms booking link

The "Book now" button on the booking page links to a placeholder URL. To replace it:

1. Open `assets/main.js`.
2. Find the line:
   ```js
   var MS_FORMS_LINK = 'https://forms.office.com/your-form-link'; // ← REPLACE THIS with your MS Forms URL
   ```
3. Replace the placeholder URL with your actual Microsoft Forms link.
4. Commit and push — the change is live immediately.

## Updating slot availability

Slot counts for upcoming Wednesdays can be set in `assets/main.js`:

```js
var SLOT_CONFIG = {
  // Key: "YYYY-MM-DD" (Wednesday date)
  // Simple format (backward compatible): remaining slots as a number
  "2025-04-02": 18,

  // Recommended format: object with remaining slots + optional per-date form URL + note
  "2025-04-09": {
    remaining: 0,
    bookingUrl: "https://forms.office.com/your-form-link",
    note: "Fully booked"
  }
};
```

If a date is not listed, it defaults to **24 slots** (fully available).
If `remaining` is `0`, the booking button is automatically replaced with **Booking closed** for that date.

Colour coding:
- 🟢 **12–24** remaining → green
- 🟡 **6–11** remaining → yellow
- 🔴 **<6** remaining → red
