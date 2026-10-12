# Ritz Consulting — Website

Consulting-led, globally focused website for Ritz Consulting, built to the "Website Brief for Web Developer" (Oct 2026).
Plain HTML + CSS + one JavaScript file. No build step — it deploys as-is on Vercel.

## Pages (31)
- Home — `index.html`
- What We Do — `what-we-do.html` + 6 capability pages
- Industries — `industries.html` + 9 industry pages
- Ritz Framework — `framework.html` (interactive 12 levels)
- Business Growth Assessment — `growth-assessment.html`
- Insights — `insights.html` + 6 articles (`insight-*.html`)
- About — `about.html` (story, approach, values, people, case studies)
- Pricing & Packages — `pricing.html`
- Contact — `contact.html` (enquiry form, online meeting booking, time zones)
- `404.html`, `sitemap.xml`, `robots.txt`, `vercel.json`

## Before launch — 3 settings in `assets/js/main.js` (top of the file)
| Setting | What to put there |
|---|---|
| `formEndpoint` | Where enquiries and assessment results are emailed. Create a free form at formspree.io and paste its URL, e.g. `https://formspree.io/f/abcdwxyz`. **Until this is set, forms only show a thank-you message and nothing is sent.** |
| `bookingUrl` | Online meeting booking link (Calendly, Microsoft Bookings, etc.). Visitors pick a time in their own time zone. |
| `ga4Id` | Google Analytics 4 ID, e.g. `G-XXXXXXXXXX`. Tracks enquiries, assessment completions and framework clicks. You can also turn on Vercel Analytics in the Vercel dashboard. |

## Content to replace
- **Team profiles** and **case studies** are sample content (labelled on the site).
- **Package inclusions** on the pricing page are indicative — replace with the final list.
- Phone `+61 3 9000 0000` and email `hello@ritzconsulting.demo` are placeholders.
- Brand colours are the first three lines of `assets/css/style.css` — set them to the exact logo colours.
- `sitemap.xml`, `robots.txt` and page canonical tags use `https://ritzconsulting.com.au`.

Photos load from Unsplash.

## Deploy
Upload everything in this folder (including the `assets` folder) to GitHub, then import the repository in Vercel with the framework preset **Other**.
