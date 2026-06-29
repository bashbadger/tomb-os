#!/usr/bin/env ruby
# Tomb OS Open-Source Community Sync Tool
# Connects to GitHub API via Octokit to follow top open-source contributors safely within rate limits.

require 'octokit'

client = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])

def follow_top_contributors(client, repo_name, max_follow = 50)
  puts "🔍 Fetching contributors for #{repo_name}..."
  contributors = client.contributors(repo_name)
  
  contributors.first(max_follow).each do |user|
    puts "➕ Following contributor: #{user.login}"
    client.follow(user.login)
    sleep(1) # Rate-limit padding
  rescue Octokit::TooManyRequests
    puts "⚠️ Rate limit reached. Sleeping..."
    sleep(60)
  end
end

if __FILE__ == $0
  repo = ARGV[0] || "bashbadger/tombOS-project-"
  follow_top_contributors(client, repo, 20)
end
