# ADIP SDKs

Client SDKs for the ADIP REST API (`/api/v1`). All SDKs are thin, dependency-light
clients over the same HTTP surface documented in Swagger (`/docs`).

| Language | Status | Location | Runtime |
|---|---|---|---|
| Python | Full client | `sdks/python/` | stdlib only (3.9+) |
| TypeScript | Full client | `sdks/typescript/` | fetch (browser / Node 18+) |
| Java | Reference client | `sdks/java/` | JDK 11+ HttpClient |
| C# | Reference client | `sdks/csharp/` | .NET HttpClient |

"Reference client" = idiomatic, working HTTP client returning raw JSON; add your
preferred JSON mapper (Jackson/Gson, System.Text.Json) for typed models.

## Common capabilities

- Health & runtime: `health`, `llmHealth`, `llmRuntime`
- Projects & SDLC summaries
- Orchestration: one prompt → full SDLC (`orchestrate`)
- Artifacts: generate, export (md/html/json/csv/docx-model/pdf-model), quality score
- Prompt Studio: create, search, favorite
- Benchmark & regression

## Python

```bash
cd sdks/python && pip install -e .
python examples/quickstart.py
```

```python
from adip_sdk import ADIPClient
client = ADIPClient("http://localhost:8000")
print(client.health())
artifact = client.generate_artifact(1, "BRD")
```

## TypeScript

```bash
cd sdks/typescript && npm install && npm run build
npx tsx examples/quickstart.ts
```

```ts
import { ADIPClient } from "@adip/sdk";
const client = new ADIPClient({ baseUrl: "http://localhost:8000" });
const artifact = await client.generateArtifact(1, "BRD");
```

## Java

```java
AdipClient client = new AdipClient("http://localhost:8000");
String artifact = client.generateArtifact(1, "BRD");
```

## C#

```csharp
using var client = new AdipClient("http://localhost:8000");
var artifact = await client.GenerateArtifactAsync(1, "BRD");
```

> All SDKs target the same endpoints. When the API adds routes, extend each
> client's convenience helpers; the generic `request`/`get`/`post` methods already
> reach any endpoint.
