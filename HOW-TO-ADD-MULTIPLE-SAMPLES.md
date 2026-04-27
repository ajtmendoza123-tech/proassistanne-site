# How to Add Multiple Samples Inside ONE Card

## What this does

Each card on the Design Gallery normally shows ONE sample. But you can attach
MULTIPLE samples to a card — when someone clicks it, the lightbox opens and
they can use the ← → arrows to swipe through all the samples in that card.

A small "X SAMPLES" badge appears on the card to signal there's more inside.

## How it works — the data-extras attribute

Open `design-feed.html` in VS Code. Find the card you want to add samples to.

Each card has these attributes already:
- data-src       (the main thumbnail image)
- data-title     (the main title)
- data-cat-name  (the category name shown above the title)
- data-desc      (the main description)

To add EXTRA samples, add ONE more attribute called `data-extras`. Inside it,
list each extra sample on this format:

    image-path|Title|Description ; image-path|Title|Description ; ...

Rules:
- Each sample is separated by " ; " (semicolon WITH spaces around it)
- Within a sample, the 3 fields are separated by "|" (pipe symbol)
- Order is: image path, then title, then description
- Spaces are auto-trimmed

## Example: Instagram Post Design with 3 extra samples

This is already in your file — open design-feed.html, search for "Instagram
Post Design" and you'll see it. The data-extras attribute looks like this:

    data-extras="images/insta1.jpg|Instagram Feed Sample|Cohesive grid post with brand-matched palette ; images/insta2.jpg|Quote Post|Typographic post designed for high engagement ; images/insta3.jpg|Promotional Post|Sale announcement designed to convert"

When clicked, the lightbox opens with 4 total samples to swipe through:
  1. design1.jpg  (the main thumbnail, your Instagram Post Design overview)
  2. insta1.jpg   (Instagram Feed Sample)
  3. insta2.jpg   (Quote Post)
  4. insta3.jpg   (Promotional Post)

## How to add this to ANY card

STEP 1: Open design-feed.html in VS Code

STEP 2: Find the card you want — use Ctrl+F and search for the card title
        (e.g. "Brand Kit Design")

STEP 3: At the end of the data-desc="..." attribute, add:

        data-extras="image1.jpg|Title 1|Description 1 ; image2.jpg|Title 2|Description 2"

STEP 4: Make sure each image actually exists in your images/ folder

STEP 5: Save, upload, hard-refresh

## Tips

✓ If a description or title contains a "|" or ";", don't use those characters
  — they'll break the parsing. Use a colon or comma instead.

✓ You can have as many extra samples as you want — 1, 5, 20, no limit.

✓ The badge on the card shows "X SAMPLES" where X is the total (main + extras).
  So if you have 1 main + 3 extras, the badge says "4 SAMPLES".

✓ The lightbox arrow keys (← →) let you navigate between samples within the
  card. The counter at the bottom shows "1 / 4", "2 / 4", etc.

✓ If you don't want a badge to appear, just don't add data-extras. Cards
  without data-extras work exactly like before — single sample, no badge.

## Real-world example

Say you want "Brand Kit Design" to show 5 brand kit examples.

Before (single sample):

    <div class="dg-card"
         data-src="images/design2.jpg"
         data-title="Brand Kit Design"
         data-cat-name="Branding"
         data-desc="A cohesive brand kit including color palettes, typography, logo variations, and usage guidelines.">

After (5 samples — main + 4 extras):

    <div class="dg-card"
         data-src="images/design2.jpg"
         data-title="Brand Kit Design"
         data-cat-name="Branding"
         data-desc="A cohesive brand kit including color palettes, typography, logo variations, and usage guidelines."
         data-extras="images/brandkit1.jpg|Color Palette|Primary and accent colors ; images/brandkit2.jpg|Typography Scale|Heading and body type system ; images/brandkit3.jpg|Logo Variations|Primary, secondary, and monogram logos ; images/brandkit4.jpg|Usage Guidelines|Do's and don'ts for brand application">

Don't forget to save your 4 new images (brandkit1.jpg through brandkit4.jpg)
in your images/ folder using the same lowercase-no-spaces-no-underscores rule.

That's it! 🌸
