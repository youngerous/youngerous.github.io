# updated website

This repo is built on a fork of **Jekyll Now** from [this repository](https://github.com/barryclark/jekyll-now). **Jekyll** is a static site generator that's perfect for GitHub hosted blogs ([Jekyll Repository](https://github.com/jekyll/jekyll))

The website design is just a modification of [Jon Barron's website](https://jonbarron.info/) and is converted for my own use, re-purposing my old markdown posts. **Feel free to use template for your own purposes**, but please respect copyright for all the images/content in my `images`, `pdfs`, `_posts` folders. 



## Local preview and build

The Gemfile pins `github-pages` to version 232, matching the branch-based GitHub Pages build (Jekyll 3.10.0 and Ruby Sass 3.7.4). Commit both `Gemfile` and `Gemfile.lock`. The [GitHub Pages dependency list](https://pages.github.com/versions/) is the reference when upgrading.

Run from the project directory using Ruby 3.3.x managed by rbenv:

```bash
rbenv exec bundle install
rbenv exec bundle exec jekyll serve --livereload --host 127.0.0.1
```

Open [http://127.0.0.1:4000](http://127.0.0.1:4000). Saving changes rebuilds the site and refreshes the browser. Press `Ctrl+C` to stop it. Restart the server after dependency or `_config.yml` changes.

Build and validate before pushing:

```bash
rbenv exec bundle exec jekyll build --safe
rbenv exec bundle exec ruby scripts/check-site.rb
```

The check builds into a temporary directory and verifies collection output, publication years, section counts, homepage titles, and sitemap uniqueness. GitHub Pages continues to deploy from the repository branch.

## Editing content

`index.html` is the homepage entry point. Its layout reads four collections with `output: false`, so entries do not generate separate pages or compete for `/index.html`:

| Folder | Content |
| --- | --- |
| `_news/` | News |
| `_work/` | Work experience |
| `_research/` | Publications |
| `_school/` | Education |

Keep a `date` in each entry's front matter for ordering; entries appear newest first. The site uses `Etc/UTC` to make date formatting consistent between local and hosted builds. Existing filenames are retained for familiarity.

For publications, use an integer `publication_year` for the displayed year and year navigation. `date` controls ordering within each publication year; it does not determine the displayed year. If an entry has `venue2`, set `publication_year2` for that second venue.

```yaml
---
title: "Paper title"
publication_year: 2026
date: 2026-08-01 00:00:00 +00:00
venue: "Conference or journal"
authors: "Author list"
link: https://example.com/paper
---
```

Add news, work, and education descriptions below the front matter in Markdown. School and company logo paths use the optional `logo` field. The homepage preserves the existing excerpt-based descriptions; use `excerpt_separator` if an entry needs multiple paragraphs.

Browser-tab and social-sharing titles use `name` from `_config.yml`.
