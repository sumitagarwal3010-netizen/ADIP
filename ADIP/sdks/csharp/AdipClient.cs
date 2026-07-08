using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Adip.Sdk
{
    /// <summary>
    /// ADIP C# SDK (reference client).
    ///
    /// Uses <see cref="HttpClient"/> (no external dependencies). Returns raw JSON
    /// strings; use System.Text.Json to deserialize into typed models.
    ///
    /// <code>
    ///   using var client = new AdipClient("http://localhost:8000");
    ///   var health = await client.GetAsync("/health");
    ///   var artifact = await client.GetAsync("/artifact-generation/projects/1/generate",
    ///                      new() { ["artifact_type"] = "BRD" });
    /// </code>
    /// </summary>
    public sealed class AdipClient : IDisposable
    {
        private readonly string _baseUrl;
        private readonly string _apiPrefix;
        private readonly HttpClient _http;

        public AdipClient(string baseUrl = "http://localhost:8000",
                          string apiPrefix = "/api/v1", string? token = null)
        {
            _baseUrl = baseUrl.TrimEnd('/');
            _apiPrefix = apiPrefix;
            _http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
            _http.DefaultRequestHeaders.Add("Accept", "application/json");
            if (!string.IsNullOrEmpty(token))
                _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
        }

        public async Task<string> GetAsync(string path, Dictionary<string, string>? parameters = null)
        {
            var url = _baseUrl + _apiPrefix + path;
            if (parameters is { Count: > 0 })
            {
                var query = HttpUtility.ParseQueryString(string.Empty);
                foreach (var kv in parameters) query[kv.Key] = kv.Value;
                url += "?" + query;
            }
            return await SendAsync(HttpMethod.Get, url, null);
        }

        public async Task<string> PostAsync(string path, string jsonBody)
        {
            var url = _baseUrl + _apiPrefix + path;
            return await SendAsync(HttpMethod.Post, url, jsonBody);
        }

        private async Task<string> SendAsync(HttpMethod method, string url, string? jsonBody)
        {
            using var request = new HttpRequestMessage(method, url);
            if (jsonBody != null)
                request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

            using var response = await _http.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException(
                    $"ADIP HTTP {(int)response.StatusCode} for {method} {url}: {body}");
            return body;
        }

        // --- convenience helpers ---
        public Task<string> HealthAsync() => GetAsync("/health");

        public Task<string> ListProjectsAsync() =>
            GetAsync("/projects", new() { ["size"] = "50" });

        public Task<string> GenerateArtifactAsync(int projectId, string artifactType) =>
            GetAsync($"/artifact-generation/projects/{projectId}/generate",
                     new() { ["artifact_type"] = artifactType });

        public Task<string> OrchestrateAsync(string prompt) =>
            PostAsync("/orchestrator/run",
                      $"{{\"prompt\":\"{prompt.Replace("\"", "\\\"")}\"}}");

        public void Dispose() => _http.Dispose();
    }
}
