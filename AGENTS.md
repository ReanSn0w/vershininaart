# AGENTS.md - Guide to Using LLM for Site Management

This file describes how to ask an AI assistant (LLM) for help with various tasks on the portfolio website. It includes project structure and content generation specifics.

## General Project Information

**Project Type**: Static site on Hugo for an artist's portfolio  
**Site Language**: Bilingual (Russian + English)  
**Structure**: Content + Templates (Hugo)  
**Config Language**: YAML (for frontmatter) and Go Templates (for templates)

## Project Structure for LLM

```
vershininaart/
├── content/                          # Site content (what gets displayed)
│   ├── _index.ru.md                 # Home page Russian
│   ├── _index.en.md                 # Home page English
│   ├── series/                      # Artwork collections
│   │   ├── 01-rybaki/              # Series folder (number is important for sorting!)
│   │   │   ├── _index.ru.md        # Series description Russian
│   │   │   ├── _index.en.md        # Series description English
│   │   │   ├── image1.png          # Artwork image
│   │   │   └── image2.png          # Artwork image
│   │   ├── 02-harmony/
│   │   └── 03-ulov/
│   ├── about/                       # About artist page
│   │   ├── _index.ru.md
│   │   ├── _index.en.md
│   │   └── profile-picture.png      # Artist photo
│   ├── cv/                          # Resume page
│   │   ├── _index.ru.md
│   │   └── _index.en.md
│   └── contacts/                    # Contacts page
│       ├── _index.ru.md
│       └── _index.en.md
├── layouts/                         # HTML templates (how the site is generated)
│   ├── index.html                  # Home page
│   ├── series/
│   │   └── section.html            # Series page + all series list
│   ├── about/
│   │   └── section.html            # About page
│   ├── cv/
│   │   └── section.html            # CV page
│   ├── contacts/
│   │   └── section.html            # Contacts page
│   ├── partials/                   # Reusable components
│   │   ├── header.html             # Header (automatically changes)
│   │   └── footer.html             # Footer
│   └── _default/
│       └── baseof.html             # Base template
├── static/                         # Static files (copied as-is)
│   ├── css/                        # Styles
│   ├── js/                         # JavaScript
│   └── img/                        # Icons and buttons
├── i18n/                           # UI text translations
│   ├── ru.yaml                     # Russian translations for buttons, menu
│   └── en.yaml                     # English translations
├── hugo.yaml                       # Hugo configuration
├── README.md                       # User instructions
└── AGENTS.md                       # This file
```

## How Site Generation Works

1. **Hugo reads the configuration** (`hugo.yaml`)
   - Defines two languages: Russian (default) and English
   - Russian pages: `/`, `/about/`, `/series/`
   - English pages: `/en/`, `/en/about/`, `/en/series/`

2. **Hugo processes content** (folder `content/`)
   - Reads markdown files (`_index.ru.md` and `_index.en.md`)
   - Extracts frontmatter (parameters between `---` or `+++`)
   - Renders content to HTML

3. **Hugo applies templates** (folder `layouts/`)
   - Selects the correct template based on page type
   - Inserts data from frontmatter into the template
   - Generates HTML files

4. **Hugo copies static files** (folder `static/`)
   - CSS, JavaScript, button images are copied to `public/`

5. **Result in `public/` folder**
   - Ready static site that can be deployed on hosting

### Important Details for Generation:

- **Series Sorting**: Based on the `weight` field in frontmatter, which corresponds to the folder number (01→1, 02→2, etc.)
- **Work Categories**: `collection: graphic-print` determines which section on the home page the series appears in
- **Bilingualism**: Each page must have both `_index.ru.md` and `_index.en.md`
- **Images**: Must be located in the content folder next to `_index` files
- **UI Translations**: Buttons and menu items are translated via `i18n/ru.yaml` and `i18n/en.yaml`

## Using LLM for Various Tasks

### 1️⃣ ADDING A NEW SERIES OF WORKS

This is the most common task. Ask the LLM to help create files for a new series.

#### What to Provide to LLM:

```
Help me add a new series of works to my portfolio website.

Series information:
- Series number: 12 (next after 11-bereg)
- Russian title: [your title]
- English title: [your title]
- Category: graphic-print (or paintings / sculpture)
- Number of works: [how many works in the series]

Work 1:
- Title: [title in Russian]
- Technique: [technique]
- Year: [year]
- Size: [sizes in format 50 × 70]
- Image: [if multi-sheet, specify sheet (1/2, 2/2, etc.)]
- SEO description: [brief description]

[repeat for remaining works]

Project structure: Hugo for artist portfolio, bilingual (RU + EN).
Each series is located in content/series/[number]-[name]/ with files _index.ru.md and _index.en.md
```

#### Example of a Specific Request:

```
Help me add a new series of works.

Information:
- Number: 12
- Title (Russian): Морские этюды
- Title (English): Marine Studies
- Category: paintings
- Number of works: 3

Work 1:
- Title: Закат над морем
- Technique: Tempera
- Year: 2024
- Size: 60 × 80
- Description: Painting work "Sunset over the Sea" — tempera on canvas

Work 2:
- Title: Волна
- Technique: Tempera
- Year: 2024
- Size: 50 × 70
- Description: Painting work "Wave" — tempera on canvas

Work 3:
- Title: Прилив
- Technique: Acrylic
- Year: 2024
- Size: 55 × 75
- Description: Painting work "Tide" — acrylic on canvas

Generate files content/series/12-marine-studies/_index.ru.md and _index.en.md
```

#### What You'll Get from LLM:

The LLM will create two ready-to-use files:
- `_index.ru.md` - with Russian content
- `_index.en.md` - with English content

Both files can be copied and pasted into the `content/series/12-marine-studies/` folder

#### After Receiving Files:

1. Create the folder:
   ```bash
   mkdir -p content/series/12-marine-studies
   ```

2. Copy files into the folder

3. Add images (sunset_over_sea.jpg, wave.jpg, tide.jpg)

4. Run the server to check:
   ```bash
   hugo server
   ```

---

### 2️⃣ UPDATING ARTIST INFORMATION (About Page)

If you need to change the text on the "About the Artist" page.

#### What to Provide to LLM:

```
Help me update the "About the Artist" page on my portfolio website.

Current text:
[copy the text from content/about/_index.ru.md between """ """]

Needed changes:
[what exactly needs to be changed or added]

Requirements:
- Language: Russian
- Format: TOML frontmatter with field text = """..."""
- Can use Markdown (bold text, italics)
- For line breaks use: \n\n

Structure: file content/about/_index.ru.md
```

#### Example:

```
Update the artist information on the "About" page.

Current text:
Anna Vershinina was born in 1992 in Ulan-Ude.
Works with etching, linocut and mixed media...

Need to add at the end:
Recently completed a new cycle of works "Marine Studies" (2024).

File: content/about/_index.ru.md
```

---

### 3️⃣ EDITING CV PAGE

If you need to update education, exhibitions, or experience information.

#### What to Provide to LLM:

```
Help me update the CV page on my portfolio website.

Current CV:
[copy all information from content/cv/_index.ru.md]

Needed changes:
- Add new exhibition [name, year, location]
- OR Add new experience [description]
- OR Update section [which section]

Structure: TOML frontmatter, arrays of sections.
Each section contains items with title, year, description
```

---

### 4️⃣ ADDING CONTACT INFORMATION

If you need to add new contacts or change existing ones.

#### What to Provide to LLM:

```
Update the contact information on the website.

Current contacts:
[copy from content/contacts/_index.ru.md]

Need to change/add:
- Email: [new email]
- Phone: [new phone]
- Instagram: [link]
- Etc.

Structure: array of items with label and value
```

---

### 5️⃣ CHANGING SITE STRUCTURE (Advanced)

If you need to change the layout of elements on the home page or edit templates.

#### What to Provide to LLM:

```
Help me change the home page structure on my Hugo site.

Current structure (content/_index.ru.md):
[copy file contents]

What needs to change:
[describe in detail what needs to change]

Requirements:
- Language: Hugo templates (Go syntax)
- Bilingualism: automatic system, use .Lang to determine language
- Templates are located in layouts/
- Data is stored in .Params or .Site
```

---

## Request Templates for Different Scenarios

### 🎨 "Add Multiple Works at Once"

```
Create files for 3 new series of works:

SERIES 1: Marine Landscapes (12)
- Russian: [title]
- English: [title]
- Category: paintings
- 2 works:
  * [work 1 details]
  * [work 2 details]

SERIES 2: Sculptures (13)
- [similarly]

SERIES 3: Graphics (14)
- [similarly]

Project structure: Hugo, bilingual.
Generate 6 files (_index.ru.md and _index.en.md for each series)
```

### 📝 "Help with SEO Formulations"

```
Help me reword the description for SEO:

Current description: [text]

Requirements:
- Shorter (max 160 characters)
- SEO-optimized
- In Russian
- For series page

Examples of other descriptions on the site:
[examples from other series]
```

### 🔄 "Check Consistency"

```
Check that all files in series 12 (marine-studies) are consistent:

_index.ru.md:
[copy contents]

_index.en.md:
[copy contents]

Check:
- Do all weight, collection, draft fields match?
- Are all works translated?
- Are technique names consistent?
- Are all images mentioned?
```

---

## YAML Frontmatter Structure for Different Page Types

### Series of Works (_index.ru.md in series/)

```yaml
---
title: Series name
collection: graphic-print  # graphic-print, paintings, or sculpture
description: SEO description
draft: false  # false = published, true = hidden
weight: 1  # Sorting order (1, 2, 3...)
cardclass: ""  # Optional: " card--compact" or other CSS classes
works:
  - title: Work title
    image:
      src: image-file.jpg
      alt: SEO and accessibility description
    year: 2024
    technique: Technique name
    size: 50 × 70  # Important: × symbol (not x!)
    sheet: 1/2  # Optional for multi-sheet works
  - title: Second work
    image:
      src: another-file.jpg
      alt: Second description
    year: 2024
    technique: Technique
    size: 60 × 80
---
```

### About Artist Page (_index.ru.md in about/)

```toml
+++
title = "About the Artist"
description = "Bio page"
type = "about"
layout = "about"

[bio]
image = "profile-picture.png"
alt = "Photo description"
text = """
Text about the artist.
Can contain **bold** and *italic*.

Paragraphs are separated by blank lines.
"""
+++
```

### CV Page (_index.ru.md in cv/)

```toml
+++
title = "CV"
description = "Curriculum Vitae"
type = "cv"
layout = "cv"

[[sections]]
title = "Education"

[[sections.items]]
title = "Educational Institution"
year = 2020
description = "Faculty, city"

[[sections]]
title = "Exhibitions"

[[sections.items]]
title = "Exhibition Name"
year = 2023
description = "Exhibition Location"
+++
```

### Contacts Page (_index.ru.md in contacts/)

```toml
+++
title = "Contacts"
description = "Contacts page"
type = "contacts"
layout = "contacts"

[[items]]
label = "Email"
value = "email@example.com"

[[items]]
label = "Phone"
value = "+7 (999) 123-45-67"

[[items]]
label = "Instagram"
value = "https://instagram.com/username"

contactsIntro = "Introduction before contacts"
+++
```

---

## Bilingual Content Specifics

### How Bilingualism Works on the Site:

1. **Content Folders**:
   - `content/series/01-rybaki/` → contains both `_index.ru.md` AND `_index.en.md`
   - Hugo automatically detects language by file extension `.ru` or `.en`

2. **Generated URLs**:
   - Russian: `/series/01-rybaki/` (no prefix)
   - English: `/en/series/01-rybaki/` (with `/en/` prefix)

3. **UI Element Translations**:
   - Buttons and menu items are located in `i18n/ru.yaml` and `i18n/en.yaml`
   - Templates use: `{{ i18n "back" }}`

4. **What Needs Translation**:
   - ✅ Series title (`title`)
   - ✅ Work titles
   - ✅ SEO descriptions (`alt`, `description`)
   - ✅ Technique names (translated or kept universal)
   - ❌ Sizes (stay the same)
   - ❌ Years (stay the same)

### Remember When Requesting from LLM:

```
IMPORTANT: This is a bilingual Hugo site!

Each content page must have:
- A file with suffix .ru.md for Russian version
- A file with suffix .en.md for English version

Both files have the same frontmatter STRUCTURE,
but content is translated to each language.

Generate BOTH files in every request!
```

---

## Common Errors and How to Avoid Them

### ❌ Error: Incorrect Series Folder Name

The folder must start with a number for proper sorting!

```
❌ WRONG: content/series/new-work/
✅ CORRECT: content/series/12-new-work/

Hugo reads the folder name, so:
01, 02, 03... → sort correctly
02, 10, 11... → sort correctly
new, old, abc... → sort alphabetically!
```

### ❌ Error: Incorrect Frontmatter Format

```
❌ WRONG:
title: Title
weight: 1
works:
- title: Work 1  ← Wrong indentation

✅ CORRECT:
title: Title
weight: 1
works:
  - title: Work 1  ← Correct indentation (2 spaces)
```

### ❌ Error: Different Weights in Russian and English Versions

```
❌ WRONG:
_index.ru.md: weight: 1
_index.en.md: weight: 5

✅ CORRECT:
_index.ru.md: weight: 1
_index.en.md: weight: 1  ← Same!
```

### ❌ Error: Incorrect Size Format

```
❌ WRONG:
size: 50x70
size: 50 x 70
size: 50*70

✅ CORRECT:
size: 50 × 70  ← Use × symbol (not x!)
```

### ❌ Error: Collection in Wrong Case

```
❌ WRONG:
collection: Graphic-print

✅ CORRECT:
collection: graphic-print  ← Lowercase only!
```

---

## When to Call LLM for Help

### ✅ Good Reasons:

- Adding a new series of works (main task)
- Updating artist information
- Translating descriptions from Russian to English
- Formatting CV and contacts
- Checking file consistency
- Help with SEO descriptions
- Rewriting text

### ❌ When NOT to Use LLM:

- Just running `hugo server` (do manually)
- Uploading images to a folder (do manually)
- Finding a typo in one line (fix manually)
- Changing a single parameter (edit manually)

---

## Example of Complete LLM Dialog

### Request:

```
Help me add a new series of works to my portfolio website.

Series information:
- Number: 12
- Russian title: Берег моря
- English title: Sea Coast
- Category: paintings
- Number of works: 2

Work 1:
- Russian title: Волна на закате
- English title: Wave at Sunset
- Technique: Tempera on canvas
- Year: 2024
- Size: 70 × 90
- Description: Painting work "Wave at Sunset" — tempera on canvas, 70 × 90 cm

Work 2:
- Russian title: Прибой
- English title: Surf
- Technique: Acrylic
- Year: 2024
- Size: 60 × 80
- Description: Painting work "Surf" — acrylic on canvas, 60 × 80 cm

Structure: Hugo bilingual (RU + EN).
Generate files _index.ru.md and _index.en.md for content/series/12-sea-coast/
```

### LLM Response (Example):

```yaml
# _index.ru.md
---
title: Берег моря
collection: paintings
description: Живописная серия "Берег моря"
draft: false
weight: 12
cardclass: ""
works:
  - title: Волна на закате
    image:
      src: wave-sunset.jpg
      alt: Живописная работа "Волна на закате" — темпера на холсте
    year: 2024
    technique: Темпера на холсте
    size: 70 × 90
  - title: Прибой
    image:
      src: surf.jpg
      alt: Живописная работа "Прибой" — акрил на холсте
    year: 2024
    technique: Акрил
    size: 60 × 80
---

# _index.en.md
---
title: Sea Coast
collection: paintings
description: Painting series "Sea Coast"
draft: false
weight: 12
cardclass: ""
works:
  - title: Wave at Sunset
    image:
      src: wave-sunset.jpg
      alt: Painting work "Wave at Sunset" — tempera on canvas
    year: 2024
    technique: Tempera on canvas
    size: 70 × 90
  - title: Surf
    image:
      src: surf.jpg
      alt: Painting work "Surf" — acrylic on canvas
    year: 2024
    technique: Acrylic
    size: 60 × 80
---
```

### What to Do After Getting LLM Response:

1. Copy both texts
2. Create folder: `mkdir -p content/series/12-sea-coast`
3. Create file `_index.ru.md` and paste first text
4. Create file `_index.en.md` and paste second text
5. Add images `wave-sunset.jpg` and `surf.jpg` to the folder
6. Run `hugo server` and check the result

---

## Pre-Request Checklist

Make sure you provide:

- [ ] Series number (which one in order)
- [ ] Titles in Russian AND English
- [ ] Correct category (graphic-print / paintings / sculpture)
- [ ] For each work: title, technique, year, size, description
- [ ] Number of image files
- [ ] Requirement to generate BOTH languages (_index.ru.md AND _index.en.md)

---

## Useful Links and Commands

```bash
# Run server for checking
hugo server

# Build site for production
hugo build

# Clean public folder before new build
rm -rf public && hugo build

# Check YAML syntax (if yamllint is installed)
yamllint content/series/12-name/_index.ru.md
```

---

## Frequently Asked Questions (FAQ)

**Q: Can I sort series differently, not by numbers?**  
A: Yes, but you need to change the `weight` field in each series. The current system uses weight for sorting.

**Q: What if I forget to create the `_index.en.md` file?**  
A: The English version of the site won't display that series. Always create BOTH language versions!

**Q: Can I use a different file extension instead of .md?**  
A: No, Hugo expects exactly `.md` for markdown files.

**Q: What if I upload an image with the wrong name?**  
A: The image won't display and you'll see an empty square in the browser. Check that `image.src` matches the actual filename.

**Q: Can I have more than 2 languages?**  
A: Yes, but you need to modify `hugo.yaml` and add new files `_index.fr.md`, `i18n/fr.yaml`, etc.

---

## Conclusion

Use LLM for:
- ✅ Creating structured content (series, CV, contacts)
- ✅ Translating content from Russian to English
- ✅ Formatting and structuring information
- ✅ Checking file consistency
- ✅ Help with SEO descriptions

Remember: **always provide project structure context** so that LLM can generate correct content in the proper format.
