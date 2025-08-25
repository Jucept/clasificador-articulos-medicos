import argparse
import os, re, json, time, logging
from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    f1_score, accuracy_score, classification_report, multilabel_confusion_matrix
)
import joblib
import matplotlib.pyplot as plt

# Configuración de logging
logging.basicConfig(
    format="%(asctime)s | %(levelname)s | %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Funciones auxiliares
def normalize_text(x: str) -> str:
    """Limpieza básica de texto: espacios, acentos, normalización."""
    if not isinstance(x, str):
        return ""
    return re.sub(r"\s+", " ", x).strip()


def parse_labels(val):
    """Convierte el string de etiquetas a lista estandarizada."""
    if pd.isna(val):
        return []
    labs = re.split(r"[|;,/]", str(val))
    labs = [g.strip().lower() for g in labs if g and str(g).strip()]
    mapping = {
        "cardiovascular": "Cardiovascular",
        "neurological": "Neurological",
        "hepatorenal": "Hepatorenal",
        "oncological": "Oncological",
    }
    out = [mapping[g] for g in labs if g in mapping]
    return list(dict.fromkeys(out))  # eliminar duplicados preservando orden


def save_confusion_matrices(Y_true, Y_pred, classes, out_dir: Path):
    """Genera matrices de confusión por clase en CSV y PNG."""
    out_dir.mkdir(exist_ok=True, parents=True)
    ml_cm = multilabel_confusion_matrix(Y_true, Y_pred)
    for i, label in enumerate(classes):
        tn, fp, fn, tp = ml_cm[i].ravel()
        cm = np.array([[tn, fp], [fn, tp]])

        # CSV
        pd.DataFrame(cm, index=["True 0", "True 1"], columns=["Pred 0", "Pred 1"])\
            .to_csv(out_dir / f"cm_{label}.csv")

        # PNG
        fig, ax = plt.subplots()
        ax.imshow(cm, cmap="Blues")
        ax.set_xticks([0, 1]); ax.set_yticks([0, 1])
        ax.set_xticklabels(["Pred 0", "Pred 1"]); ax.set_yticklabels(["True 0", "True 1"])
        ax.set_title(f"Confusion Matrix - {label}")
        for (r, c), val in np.ndenumerate(cm):
            ax.text(c, r, int(val), ha="center", va="center", color="red")
        fig.savefig(out_dir / f"cm_{label}.png", dpi=140, bbox_inches="tight")
        plt.close(fig)


# Función principal de entrenamiento
def train(data_path, out_dir, test_size=0.2, seed=11):
    logger.info(f"Cargando dataset desde {data_path}")
    df = pd.read_csv(data_path, sep=";")

    # Preprocesamiento
    df["text"] = (df["title"].fillna("") + " " + df["abstract"].fillna("")).map(normalize_text)
    df["labels"] = df["group"].apply(parse_labels)
    df = df[df["labels"].map(len) > 0].reset_index(drop=True)

    mlb = MultiLabelBinarizer(classes=["Cardiovascular", "Neurological", "Hepatorenal", "Oncological"])
    Y = mlb.fit_transform(df["labels"])
    primary_label = [labs[0] for labs in df["labels"]]

    # Split
    X_train, X_test, _, _, Y_train, Y_test = train_test_split(
        df["text"].values, primary_label, Y,
        test_size=test_size, random_state=seed, stratify=primary_label
    )

    logger.info(f"Entrenando modelo con {len(X_train)} train / {len(X_test)} test")
    tfidf = TfidfVectorizer(
        lowercase=True, ngram_range=(1, 2), max_df=0.95, min_df=2, max_features=50000,
        strip_accents="unicode", sublinear_tf=True
    )
    clf = OneVsRestClassifier(LinearSVC())
    pipe = Pipeline([("tfidf", tfidf), ("clf", clf)])

    start = time.time()
    pipe.fit(X_train, Y_train)
    logger.info(f"Entrenamiento terminado en {time.time()-start:.2f}s")

    # Evaluación
    Y_pred = pipe.predict(X_test)
    weighted_f1 = f1_score(Y_test, Y_pred, average="weighted", zero_division=0)
    exact_match = accuracy_score(Y_test, Y_pred)
    report = classification_report(
        Y_test, Y_pred, target_names=mlb.classes_, output_dict=True, zero_division=0
    )

    # Guardado de artefactos
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Reporte de métricas
    pd.DataFrame(report).transpose().to_csv(out_dir / "classification_report.csv")
    with open(out_dir / "metrics.json", "w") as f:
        json.dump(
            {"weighted_f1": float(weighted_f1), "exact_match_accuracy": float(exact_match)},
            f, indent=2
        )
    with open(out_dir / "params.json", "w") as f:
        json.dump(
            {"test_size": test_size, "seed": seed, "vectorizer": "TF-IDF(1,2)", "classifier": "LinearSVC(OvR)"},
            f, indent=2
        )

    # Matrices de confusión
    save_confusion_matrices(Y_test, Y_pred, mlb.classes_, out_dir / "confusion_matrices")

    # Modelo
    joblib.dump({"pipeline": pipe, "mlb": mlb}, out_dir / "model.joblib")
    logger.info(f"Artefactos guardados en {out_dir}")

# Entry point
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Entrenar baseline TF-IDF + LinearSVC")
    parser.add_argument("--data", type=str, required=True, help="Ruta al CSV con los datos")
    parser.add_argument("--out", type=str, default="artifacts/baseline_tfidf_svm", help="Directorio de salida")
    parser.add_argument("--test_size", type=float, default=0.2, help="Proporción de test")
    parser.add_argument("--seed", type=int, default=11, help="Random seed")
    args = parser.parse_args()

    train(args.data, args.out, args.test_size, args.seed)
