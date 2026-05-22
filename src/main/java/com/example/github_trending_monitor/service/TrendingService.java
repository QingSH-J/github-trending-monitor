package com.example.github_trending_monitor.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import com.example.github_trending_monitor.entity.TrendingRepo;
import com.example.github_trending_monitor.repository.TrendingRepository;

@Service
public class TrendingService {

    private final TrendingRepository trendingRepository;

    public TrendingService(TrendingRepository trendingRepository) {
        this.trendingRepository = trendingRepository;
    }

    // 爬 GitHub trending 頁面並存入 DB
    public List<TrendingRepo> scrapeAndSave(String since, String language) throws IOException {
        String url = buildUrl(since, language);

        // Jsoup 發送 HTTP GET，模擬瀏覽器 User-Agent 避免被擋
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .timeout(10_000)
                .get();

        // 每個 repo 卡片都是一個 <article class="Box-row">
        Elements rows = doc.select("article.Box-row");

        List<TrendingRepo> results = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Element row : rows) {
            TrendingRepo repo = new TrendingRepo();

            // repo_name: <h2><a href="/owner/repo">
            Element nameLink = row.selectFirst("h2 a");
            if (nameLink == null) continue;
            // href 是 "/owner/repo"，去掉開頭的 /
            repo.setRepoName(nameLink.attr("href").substring(1));

            // description: <p class="col-9 ...">
            Element desc = row.selectFirst("p");
            repo.setDescription(desc != null ? desc.text().trim() : "");

            // language: <span itemprop="programmingLanguage">
            Element lang = row.selectFirst("span[itemprop=programmingLanguage]");
            repo.setLanguage(lang != null ? lang.text().trim() : "");

            // stars 和 forks: 前兩個 <a> 帶有 href 含 stargazers/forks 的
            repo.setStars(parseNumber(row, "a[href$=/stargazers]"));
            repo.setForks(parseNumber(row, "a[href$=/forks]"));

            // stars today: <span class="d-inline-block float-sm-right">
            Element starsToday = row.selectFirst("span.d-inline-block.float-sm-right");
            repo.setStarsToday(starsToday != null ? parseStarsToday(starsToday.text()) : 0);

            repo.setSince(since);
            repo.setScrapedAt(now);

            results.add(repo);
        }

        // 先清掉同一個 since 的舊資料，再存新的
        trendingRepository.deleteAll(trendingRepository.findBySinceOrderByStarsTodayDesc(since));
        trendingRepository.saveAll(results);

        return results;
    }

    // 查詢 DB 中已有的資料
    public List<TrendingRepo> getFromDb(String since, String language) {
        if (language == null || language.isBlank()) {
            return trendingRepository.findBySinceOrderByStarsTodayDesc(since);
        }
        return trendingRepository.findBySinceAndLanguageOrderByStarsTodayDesc(since, language);
    }

    private String buildUrl(String since, String language) {
        String base = "https://github.com/trending";
        if (language != null && !language.isBlank()) {
            base += "/" + language.toLowerCase().replace(" ", "-");
        }
        return base + "?since=" + since;
    }

    // 把 "1,234" 這種帶逗號的數字字串轉成 int
    private int parseNumber(Element row, String cssSelector) {
        Element el = row.selectFirst(cssSelector);
        if (el == null) return 0;
        String text = el.text().replaceAll("[^0-9]", "");
        return text.isBlank() ? 0 : Integer.parseInt(text);
    }

    // 把 "1,234 stars today" 解析成 1234
    private int parseStarsToday(String text) {
        String digits = text.replaceAll("[^0-9]", "");
        return digits.isBlank() ? 0 : Integer.parseInt(digits);
    }
}
