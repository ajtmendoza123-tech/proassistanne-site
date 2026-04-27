# Proassistanne — Multi-Page Site

Hi Anne! 🌸 Here's your website split into 10 separate pages.
Same look, same templates — just easier to manage and faster for visitors.

## 📂 Folder structure

```
proassistanne/
├── index.html              ← Home page (proassistanne.xyz/)
├── about.html              ← About page
├── hire-me.html            ← Hire Me / Pricing
├── portfolio.html          ← Main portfolio
├── social-media-work.html  ← SMM platform portfolio
├── design-feed.html        ← Design gallery
├── blog.html               ← Blog
├── connect.html            ← Social links
├── resources.html          ← Free VA resources
├── contact.html            ← Contact page
│
├── css/
│   └── styles.css          ← All styling (shared across all pages)
│
├── js/
│   └── main.js             ← All JavaScript (shared across all pages)
│
└── images/                 ← Your images go here
    ├── Logo_1.png
    ├── anne.jpg
    └── ... (all 84 of your existing images)
```

## ⚠️ IMPORTANT: Before uploading

**Copy your `images/` folder** into this folder before uploading.
The pages reference images at paths like `images/anne.jpg` and `images/Logo_1.png`,
so the `images/` folder must sit RIGHT NEXT TO the HTML files.

## 🚀 How to upload to your host

1. Copy your existing `images/` folder into this `proassistanne/` folder
2. Upload the WHOLE `proassistanne/` folder contents to your web host
3. That's it — `index.html` will load automatically when someone visits proassistanne.xyz

## ✏️ How to edit

Want to change your phone number? Open `contact.html` and find it. Done.
Want to change a color or font? Open `css/styles.css` and change it once —
it updates everywhere automatically.

Want to add a new blog post? Edit `blog.html` only.

## 🔗 How navigation works

When someone clicks "Portfolio" in the nav, they go to `portfolio.html`.
All your `onclick="P('xxx')"` buttons throughout the pages still work —
they automatically redirect to the correct file. No changes needed to the templates.

## 📸 Image naming reminder

For future images, use these rules:
- All lowercase: `anne.jpg` not `Anne.JPG`
- Hyphens between words: `email-sample.jpg` not `email_sample.jpg`
- No spaces ever
- Describe what it is: `instagram-grid-1.jpg` not `IMG_2384.jpg`
- Number at end for series: `design-1.jpg`, `design-2.jpg`, etc.

The one image I'd suggest renaming: `Logo_1.png` → `logo.png`
(If you do this, also update the references in every HTML file's <head>)

---

Made with care 💛
