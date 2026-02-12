# ML Server & AI Pipeline Worker

## Worker (face processing queue)

The worker consumes jobs from a Redis stream and processes:

- **photo_process**: Download photo, detect faces, match against guest/user samples in Pinecone, create PhotoTags, update Photo and AiProcessingQueue.
- **face_sample**: Encode a guest or user face sample, store in Pinecone, create FaceSample, update Guest/User, optionally re-queue wedding photos.
- **reprocess_wedding**: Re-queue all photos of a wedding for processing.

### Run the worker

From `apps/ml-server`:

```bash
# With uv
uv run python run_worker.py

# Or with PYTHONPATH so imports resolve
PYTHONPATH=src python src/worker.py
```

### Environment

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` – Redis (same as API).
- `REDIS_AI_QUEUE_STREAM` – Stream key (default: `ai:processing:stream`). Must match the API’s stream key (env `REDIS_AI_QUEUE_STREAM` or default in config).
- `REDIS_AI_CONSUMER_GROUP`, `REDIS_AI_CONSUMER_NAME` – Consumer group/name (defaults: `ai-workers`, `worker-1`).
- `API_BASE_URL` – Express API base URL (e.g. `http://localhost:9090`).
- `INTERNAL_SECRET` – Must match API `INTERNAL_SECRET` for internal routes.
- `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` – Pinecone index (default name: `wedding-faces`, 512 dimensions, cosine).
- `FACE_SIMILARITY_THRESHOLD` – Min similarity to tag a face (default: `0.6`).

The API pushes jobs when Redis is ready (photo confirm and face-sample routes). If Redis is not available, the API falls back to calling `AI_SERVICE_URL` for photo process and face encode.
