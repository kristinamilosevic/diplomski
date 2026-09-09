from sentence_transformers import SentenceTransformer

MODEL_NAME = "google/embeddinggemma-300m"


class EmbeddingService:
    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(MODEL_NAME)
        return self._model

    def embed_movie(self, title: str, genre: str | None, plot: str | None) -> list[float]:
        text = f"title: {title} | genre: {genre or 'unknown'} | plot: {plot or 'unknown'}"
        return self.model.encode_document(text, normalize_embeddings=True).tolist()

    def embed_query(self, query: str) -> list[float]:
        return self.model.encode_query(query, normalize_embeddings=True).tolist()


embedding_service = EmbeddingService()
