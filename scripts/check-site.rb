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
    check(!paper.data['tldr'].to_s.strip.empty?, "Missing tldr: #{paper.relative_path}")
    article = html.css('.publication').find { |node| normalized(node.at_css('h3').text) == normalized(paper.data['title']) }
    check(article, "Paper missing: #{paper.data['title']}")
    check(normalized(article.at_css('.tldr-copy')&.text.to_s) == normalized(paper.data['tldr']), "Incorrect tldr: #{paper.data['title']}")
    check(normalized(article.at_css('.venue-citation').text).end_with?("· #{year}"), 'Incorrect citation year')
    check([nil, true, false].include?(paper.data['selected']), "selected must be true or false: #{paper.relative_path}")
    check(article['class'].split.include?('is-selected') == (paper.data['selected'] == true), "Incorrect Selected state: #{paper.data['title']}")
    if paper.data['venue2']
      year2 = paper.data['publication_year2']
      check(year2.is_a?(Integer), "Missing publication_year2: #{paper.relative_path}")
      check(normalized(article.css('.venue-citation')[1].text).end_with?("· #{year2}"), 'Incorrect second venue year')
    end
  end
  # Newest publication_year first; date orders papers within the same year.
  expected = papers.sort_by { |paper| [-paper.data['publication_year'], -paper.date.to_i] }.map { |paper| normalized(paper.data['title']) }
  check(html.css('.publication h3').map { |node| normalized(node.text) } == expected, 'Incorrect publication ordering')

  sitemap = Nokogiri::XML(File.read(File.join(destination, 'sitemap.xml')))
  urls = sitemap.xpath('//*[local-name()="loc"]').map(&:text)
  check(urls == urls.uniq, 'Duplicate sitemap URLs')
  check(urls.count("#{site.config['url']}/") == 1, 'Homepage must appear once in sitemap')
  puts "PASS: homepage titles, #{papers.length} publications, all collections, unique output paths and sitemap"
end
