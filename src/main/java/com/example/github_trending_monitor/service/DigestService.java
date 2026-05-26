package com.example.github_trending_monitor.service;

import com.example.github_trending_monitor.dto.DigestRepoItem;
import com.example.github_trending_monitor.dto.RepoBrief;
import com.example.github_trending_monitor.entity.EmailSubscription;
import com.example.github_trending_monitor.entity.SubscriptionType;
import com.example.github_trending_monitor.entity.TrendingRepo;
import com.example.github_trending_monitor.entity.User;
import com.example.github_trending_monitor.repository.EmailSubscriptionRepository;
import com.example.github_trending_monitor.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DigestService {

    private static final Logger log = LoggerFactory.getLogger(DigestService.class);

    private final EmailSubscriptionRepository subscriptionRepository;
    private final TrendingService trendingService;
    private final RepoSummaryService repoSummaryService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final String frontendBaseUrl;

    public DigestService(
            EmailSubscriptionRepository subscriptionRepository,
            TrendingService trendingService,
            RepoSummaryService repoSummaryService,
            UserRepository userRepository,
            EmailService emailService,
            @Value("${app.frontend.base-url:https://radar.qingshiyuu.com}") String frontendBaseUrl) {
        this.subscriptionRepository = subscriptionRepository;
        this.trendingService = trendingService;
        this.repoSummaryService = repoSummaryService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public record DigestStats(int subscribers, int sent, int skipped) {}

    public DigestStats sendDailyDigest() {
        List<EmailSubscription> subscriptions =
                subscriptionRepository.findByTypeAndEnabledTrue(SubscriptionType.DAILY_DIGEST);
        if (subscriptions.isEmpty()) {
            return new DigestStats(0, 0, 0);
        }

        int maxNeeded = subscriptions.stream()
                .mapToInt(EmailSubscription::getDailyCount)
                .max()
                .orElse(5);
        int fetchCount = Math.min(maxNeeded, 20);

        List<TrendingRepo> trendingRepos = trendingService.getFromDb("daily", null)
                .stream().limit(fetchCount).toList();

        if (trendingRepos.isEmpty()) {
            log.warn("No trending repos found for digest");
            return new DigestStats(subscriptions.size(), 0, subscriptions.size());
        }

        List<DigestRepoItem> allItems = buildItems(trendingRepos);

        List<Long> userIds = subscriptions.stream().map(EmailSubscription::getUserId).toList();
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        int sent = 0, skipped = 0;
        for (EmailSubscription sub : subscriptions) {
            User user = userMap.get(sub.getUserId());
            if (user == null || user.getEmail() == null) {
                skipped++;
                continue;
            }
            List<DigestRepoItem> items = allItems.stream().limit(sub.getDailyCount()).toList();
            String unsubUrl = frontendBaseUrl + "/unsubscribe?token=" + sub.getUnsubscribeToken();
            String today = LocalDate.now().toString();
            emailService.sendEmail(
                    user.getEmail(),
                    "今日 GitHub Trending 精選 · " + today,
                    "daily-digest",
                    Map.of("repos", items, "unsubscribeUrl", unsubUrl, "date", today));
            sent++;
        }

        return new DigestStats(subscriptions.size(), sent, skipped);
    }

    private List<DigestRepoItem> buildItems(List<TrendingRepo> repos) {
        List<DigestRepoItem> items = new ArrayList<>();
        for (TrendingRepo repo : repos) {
            String[] parts = repo.getRepoName().split("/", 2);
            String url = "https://github.com/" + repo.getRepoName();
            String briefWhat = null, briefTechStack = null;
            if (parts.length == 2) {
                try {
                    RepoBrief brief = repoSummaryService.getBrief(parts[0], parts[1]);
                    if (brief != null) {
                        briefWhat = brief.what();
                        briefTechStack = brief.techStack();
                    }
                } catch (Exception e) {
                    log.warn("Failed to get brief for {}: {}", repo.getRepoName(), e.getMessage());
                }
            }
            items.add(new DigestRepoItem(
                    repo.getRepoName(), repo.getDescription(), repo.getLanguage(),
                    repo.getStars(), repo.getStarsToday(), url, briefWhat, briefTechStack));
        }
        return items;
    }
}
