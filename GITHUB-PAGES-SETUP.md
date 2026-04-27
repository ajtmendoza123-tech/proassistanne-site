# How to Deploy on GitHub Pages — Step by Step

If you're seeing a **404 "File not found"** error on GitHub Pages,
it means GitHub can't find your `index.html`. Here's how to fix it.

## ⚠️ The Most Common Mistake

GitHub Pages looks for `index.html` at the **root** of your repository.
Not inside a folder. **At the root.**

### ❌ WRONG (causes 404)

```
your-repo/
└── proassistanne/        ← Your files are inside this folder
    ├── index.html
    ├── about.html
    └── ...
```

When you visit `https://yourusername.github.io/your-repo/`, GitHub looks
for `index.html` at the root and doesn't find it → 404.

### ✅ RIGHT

```
your-repo/
├── index.html            ← Files at the ROOT, not in a folder
├── about.html
├── hire-me.html
├── portfolio.html
├── social-media-work.html
├── design-feed.html
├── blog.html
├── connect.html
├── resources.html
├── contact.html
├── .nojekyll
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── images/
    └── (all your photos)
```

## 🚀 How to Fix It (3 ways)

### Option A: Re-upload everything correctly

1. Go to your GitHub repo
2. Delete the `proassistanne/` folder (or whatever folder is wrapping things)
3. Upload all files **directly** — `index.html` should be at the top level

### Option B: Move files using GitHub web interface

1. In your GitHub repo, click into the `proassistanne/` folder
2. Click each file → "Edit" (pencil icon) → change the path from
   `proassistanne/index.html` to just `index.html` → commit
3. Repeat for all files (slow but works)

### Option C: Use GitHub Desktop or git command line

```bash
git mv proassistanne/* .
git mv proassistanne/.nojekyll .
rmdir proassistanne
git commit -m "Move files to root"
git push
```

## 📁 What I Included for You

I added two GitHub-specific files:

- **`.nojekyll`** — empty file that tells GitHub "don't process this as a
  Jekyll blog, just serve my files as-is." Without this, files/folders
  starting with underscore can be ignored.
- **README.md** — documentation (won't show on the site, only in GitHub)

## ✅ Step-by-Step: Upload to GitHub Pages

1. **Create or open your GitHub repo**
   - For a personal site at `yourusername.github.io`, name your repo
     exactly `yourusername.github.io` (replacing with your username)
   - For a project site at `yourusername.github.io/repo-name`, use any repo name

2. **Upload files at the root**
   - Click "Add file" → "Upload files"
   - Drag in: all 10 `.html` files, the `css/` folder, the `js/` folder,
     the `images/` folder, `.nojekyll`, and `README.md`
   - **Important:** drag the contents of `proassistanne/`, NOT the folder itself
   - Commit changes

3. **Enable GitHub Pages**
   - Go to repo Settings → Pages (left sidebar)
   - Under "Source", select "Deploy from a branch"
   - Branch: `main` (or `master`), folder: `/ (root)`
   - Save

4. **Wait 1–2 minutes** then visit your URL.

## 🌐 Custom Domain (proassistanne.xyz)

If you want `proassistanne.xyz` to point to your GitHub Pages site:

1. In repo Settings → Pages → "Custom domain" → enter `proassistanne.xyz`
2. Create a `CNAME` file in your repo (no extension) containing just:
   ```
   proassistanne.xyz
   ```
3. Update your domain's DNS at your registrar:
   - Add **A records** pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or a **CNAME record** for `www` → `yourusername.github.io`

It can take a few hours for DNS changes to take effect.

## 🔍 Still Getting 404?

- Check the URL — is it exactly right? File names are case-sensitive!
  `About.html` and `about.html` are different on GitHub Pages.
- Wait 2–3 minutes after committing. GitHub Pages takes time to update.
- Hard-refresh your browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- Check repo Settings → Pages to see the actual URL it's serving from
