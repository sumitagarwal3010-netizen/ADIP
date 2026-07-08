"""ADIP Python SDK — quickstart example.

Run the backend first (uvicorn app.main:app), then:  python quickstart.py
"""
from adip_sdk import ADIPClient, ADIPError


def main() -> None:
    client = ADIPClient("http://localhost:8000")

    try:
        print("Health:", client.health())
        print("LLM health:", client.llm_health())

        projects = client.list_projects(size=5)
        items = projects.get("items", projects)
        print(f"Projects: {len(items)}")
        if not items:
            return
        pid = items[0]["id"]

        # One prompt → full SDLC
        result = client.orchestrate("Implement UPI Auto-Reversal with NPCI reconciliation.")
        print("Orchestration phases:", len(result.get("phases", [])))

        # Generate + score + export an artifact
        artifact = client.generate_artifact(pid, "BRD")
        print("Artifact:", artifact["reference"], "sections:", len(artifact["sections"]))
        quality = client.score_artifact_quality(pid, "BRD")
        print("Quality:", quality.get("overall_score"), quality.get("quality_band"))
        md = client.export_artifact(pid, "BRD", "markdown")
        print("Markdown export chars:", len(md))

        # Benchmark + regression
        bench = client.benchmark(["Implement UPI reversal.",
                                  "Implement UPI reversal with reconciliation & audit."])
        print("Best benchmark version:", bench.get("best_version"))
        reg = client.regression_compare("Implement UPI reversal.",
                                        "Implement UPI reversal with reconciliation & audit.")
        print("Regression verdict:", reg.get("overall_verdict"))

    except ADIPError as exc:
        print(f"ADIP error: {exc} (status={exc.status})")


if __name__ == "__main__":
    main()
