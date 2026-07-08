package com.adip.sdk;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ADIP Java SDK (reference client).
 *
 * Uses the JDK 11+ HttpClient (no external dependencies). Returns raw JSON
 * strings; plug in Jackson/Gson to deserialize into typed models.
 *
 * <pre>{@code
 *   AdipClient client = new AdipClient("http://localhost:8000");
 *   String health = client.get("/health", Map.of());
 *   String artifact = client.get("/artifact-generation/projects/1/generate",
 *                                Map.of("artifact_type", "BRD"));
 * }</pre>
 */
public class AdipClient {

    private final String baseUrl;
    private final String apiPrefix;
    private final String token;
    private final HttpClient http;

    public AdipClient(String baseUrl) {
        this(baseUrl, "/api/v1", null);
    }

    public AdipClient(String baseUrl, String apiPrefix, String token) {
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.apiPrefix = apiPrefix;
        this.token = token;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    public String get(String path, Map<String, String> params) {
        return send("GET", path, params, null);
    }

    public String post(String path, String jsonBody) {
        return send("POST", path, Map.of(), jsonBody);
    }

    private String send(String method, String path, Map<String, String> params, String jsonBody) {
        String url = baseUrl + apiPrefix + path;
        if (params != null && !params.isEmpty()) {
            String qs = params.entrySet().stream()
                    .map(e -> enc(e.getKey()) + "=" + enc(e.getValue()))
                    .collect(Collectors.joining("&"));
            url += "?" + qs;
        }
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json");
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        if ("POST".equals(method)) {
            builder.POST(HttpRequest.BodyPublishers.ofString(jsonBody == null ? "{}" : jsonBody));
        } else {
            builder.GET();
        }
        try {
            HttpResponse<String> resp = http.send(builder.build(),
                    HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
                throw new RuntimeException("ADIP HTTP " + resp.statusCode() + " for "
                        + method + " " + path + ": " + resp.body());
            }
            return resp.body();
        } catch (Exception e) {
            throw new RuntimeException("ADIP request failed: " + e.getMessage(), e);
        }
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    // --- convenience helpers ---
    public String health() {
        return get("/health", Map.of());
    }

    public String listProjects() {
        return get("/projects", Map.of("size", "50"));
    }

    public String generateArtifact(int projectId, String artifactType) {
        return get("/artifact-generation/projects/" + projectId + "/generate",
                Map.of("artifact_type", artifactType));
    }

    public String orchestrate(String prompt) {
        return post("/orchestrator/run", "{\"prompt\":\"" + prompt.replace("\"", "\\\"") + "\"}");
    }
}
