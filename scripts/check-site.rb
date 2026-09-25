require 'jekyll'
require 'nokogiri'
require 'tmpdir'

Jekyll::PluginManager.require_from_bundler

ROOT = File.expand_path('..', __dir__)
def check(condition, message)
  abort "FAIL: #{message}" unless condition
end

def normalized(text)
  text.split.join(' ')
end

Dir.mktmpdir('academic-site-check-') do |destination|
  config = Jekyll.configuration('source' => ROOT, 'destination' => destination, 'safe' => true)
  site = Jekyll::Site.new(config)
  site.process
  html = Nokogiri::HTML(File.read(File.join(destination, 'index.html')))
  check(html.at_css('title').text == site.config['name'], 'Browser title must be the name only')
  ['meta[property="og:title"]', 'meta[name="twitter:title"]'].each do |selector|
    check(html.at_css(selector)['content'] == site.config['name'], "Incorrect sharing title: #{selector}")
  end
  check(site.posts.docs.empty?, 'Content should be in collections, not posts')
  output_paths = site.pages.map { |page| page.destination(destination) }
  check(output_paths.uniq == output_paths, 'Multiple pages share an output path')
  check(output_paths.count(File.join(destination, 'index.html')) == 1, 'Exactly one homepage must be generated')

  { 'news' => '.news-item', 'work' => '[aria-labelledby="experience"] .record',
    'school' => '[aria-labelledby="education"] .record', 'research' => '.publication' }.each do |name, selector|
    collection = site.collections.fetch(name)
    check(!collection.metadata['output'], "#{name} must not output individual pages")
    check(collection.docs.none? { |doc| File.exist?(doc.destination(destination)) }, "Unexpected #{name} output file")
    check(html.css(selector).length == collection.docs.length, "Missing or duplicate #{name} entries")
    check(collection.docs.all? { |doc| doc.data['date'] }, "Missing ordering date in #{name}")
  end

  papers = site.collections.fetch('research').docs
  papers.each do |paper|
    year = paper.data['publication_year']
    check(year.is_a?(Integer) && (1900..2100).cover?(year), "Invalid publication_year: #{paper.relative_path}")
    group = html.at_css("#publications-#{year}")&.parent
    article = group&.css('.publication')&.find { |node| normalized(node.at_css('h4').text) == normalized(paper.data['title']) }
    check(article, "Paper missing from its publication year: #{paper.data['title']}")
    check(normalized(article.at_css('.venue-citation').text).end_with?("· #{year}"), 'Incorrect citation year')
    if paper.data['venue2']
      year2 = paper.data['publication_year2']
      check(year2.is_a?(Integer), "Missing publication_year2: #{paper.relative_path}")
      check(normalized(article.css('.venue-citation')[1].text).end_with?("· #{year2}"), 'Incorrect second venue year')
    end
  end
  years = papers.map { |paper| paper.data['publication_year'].to_s }.uniq.sort.reverse
  check(html.css('.publication-years a').map(&:text) == years, 'Year navigation is missing, duplicated, or unordered')
  html.css('.publication-year').each do |group|
    year = group.at_css('.year-label').text.to_i
    expected = papers.select { |paper| paper.data['publication_year'] == year }.sort_by(&:date).reverse.map { |paper| normalized(paper.data['title']) }
    check(group.css('.publication h4').map { |node| normalized(node.text) } == expected, "Incorrect paper ordering for #{year}")
  end

  sitemap = Nokogiri::XML(File.read(File.join(destination, 'sitemap.xml')))
  urls = sitemap.xpath('//*[local-name()="loc"]').map(&:text)
  check(urls == urls.uniq, 'Duplicate sitemap URLs')
  check(urls.count("#{site.config['url']}/") == 1, 'Homepage must appear once in sitemap')
  puts "PASS: homepage titles, #{papers.length} publications, all collections, unique output paths and sitemap"
end
