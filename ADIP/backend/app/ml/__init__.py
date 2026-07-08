"""ML engineering infrastructure (Role 5).

Offline evaluation pipeline, dataset versioning, drift detection and lightweight
experiment tracking. All components are dependency-free and reuse existing ADIP
services (ArtifactGenerator, QualityEngine, AIReviewer). They operate on the
JSONL datasets produced by ``app.datasets.enterprise_datasets`` (ADR-0007).
"""
from .dataset_versioning import DatasetVersion, version_dataset, version_directory
from .drift import DriftReport, detect_drift
from .experiment_tracking import ExperimentTracker
from .evaluation import EvaluationPipeline, EvaluationResult
from .hallucination import HallucinationReport, detect_hallucinations

__all__ = [
    "DatasetVersion",
    "version_dataset",
    "version_directory",
    "DriftReport",
    "detect_drift",
    "ExperimentTracker",
    "EvaluationPipeline",
    "EvaluationResult",
    "HallucinationReport",
    "detect_hallucinations",
]
