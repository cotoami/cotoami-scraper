# Cotoami Scraper

Cotoami Scraper is a Chrome Extension that scrapes web pages to generate inputs for [Cotoami knowledge-bases](https://github.com/cotoami/cotoami).

It lets you collect fragments of web content and post them to your Cotoami knowledge-bases. You can get the most out of your findings by combining them to create highly structured knowledge in Cotoami.

[![Cotoami Scraper - scraping web contents for creating highly structured knowledge](http://img.youtube.com/vi/v2bXOIdzfFU/maxresdefault.jpg)](https://www.youtube.com/watch?v=v2bXOIdzfFU)
[YouTube video](https://www.youtube.com/watch?v=v2bXOIdzfFU)

## Types of scraping

Currently, it supports the three types of content in web pages: **Page link**, **Selection** and **Kindle highlights**.

### Page link

It simply scrapes the title and url of the current page to make a page link.

### Selection

It scrapes the selection on the current page.

### Kindle highlights

It scrapes the Kindle highlights at the Kindle websites whose URL start with `https://read.amazon`. It handles internal pagination to scrape all the highlights in a book.

