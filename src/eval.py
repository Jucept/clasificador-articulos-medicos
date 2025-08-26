import argparse, json, re, logging
from pathlib import Path
import pandas as pd
import joblib
from sklearn.metrics import f1_score, accuracy_score, classification_report, multilabel_confusion_matrix
import matplotlib.pyplot as plt
import numpy as np

logging.basicConfig(
    format="%(asctime)s | %(levelname)s | %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def normalize_text(x: str) -> str:
    if not isinstance(x, str):
        return ""
    return re.sub(r"\s+", " ", x).strip()


def parse_labels(val):
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
    return list(dict.fromkeys(out))

def evaluate(model_path, data_path, out_dir):
    logger.info(f"Cargando modelo desde {model_path}")
    model_obj = joblib.load(model_path)
    pipe, mlb = model_obj["pipeline"], model_obj["mlb"]

    df = pd.read_csv(data_path, sep=";")
    df["text"] = (df["title"].fillna("") + " " + df["abstract"].fillna("")).map(normalize_text)
    df["labels"] = df["group"].apply(parse_labels)

    Y_true = mlb.transform(df["labels"])
    Y_pred = pipe.predict(df["text"].values)

    weighted_f1 = f1_score(Y_true, Y_pred, average="weighted", zero_division=0)
    exact_match = accuracy_score(Y_true, Y_pred)
    report = classification_report(
        Y_true, Y_pred, target_names=mlb.classes_, output_dict=True, zero_division=0
    )

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "eval_metrics.json", "w") as f:
        json.dump(
            {"weighted_f1": float(weighted_f1), "exact_match_accuracy": float(exact_match)},
            f, indent=2
        )
    pd.DataFrame(report).transpose().to_csv(out_dir / "eval_report.csv")

    # --- Matrices de confusión multilabel ---
    cm_dir = out_dir / "confusion_matrices"
    cm_dir.mkdir(exist_ok=True)
    ml_cm = multilabel_confusion_matrix(Y_true, Y_pred)
    corner_labels = [["TN", "FP"], ["FN", "TP"]]
    for i, label in enumerate(mlb.classes_):
        tn, fp, fn, tp = ml_cm[i].ravel()
        cm = np.array([[tn, fp], [fn, tp]])
        pd.DataFrame(cm, index=["True 0", "True 1"], columns=["Pred 0", "Pred 1"]).to_csv(cm_dir / f"cm_{label}.csv")
        fig = plt.figure()
        ax = fig.add_subplot(111)
        ax.imshow(cm, cmap=plt.cm.Purples)
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Pred 0", "Pred 1"])
        ax.set_yticklabels(["True 0", "True 1"])
        ax.set_title(f"Confusion Matrix - {label}")
        for (r, c), val in np.ndenumerate(cm):
            ax.text(c, r, f"{corner_labels[r][c]}\n{val}", ha='center', va='center', fontsize=12,
                    color="white" if val > cm.max()/2 else "black")
        ax.set_ylabel('True label')
        ax.set_xlabel('Predicted label')
        plt.tight_layout()
        fig.savefig(cm_dir / f"cm_{label}.png", dpi=140, bbox_inches="tight")
        plt.close(fig)
    # --- Fin matrices de confusión ---

    logger.info(f"Weighted F1 = {weighted_f1:.4f} | Exact Match = {exact_match:.4f}")
    logger.info(f"Resultados guardados en {out_dir}")

def predict_text(model_path, title, abstract):
    logger.info(f"Cargando modelo desde {model_path}")
    model_obj = joblib.load(model_path)
    pipe, mlb = model_obj["pipeline"], model_obj["mlb"]

    text = normalize_text(title + " " + abstract)
    pred = pipe.predict([text])
    labels = mlb.inverse_transform(pred)[0]

    logger.info(f"Texto clasificado en: {labels}")
    return labels

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluar o inferir con modelo baseline entrenado")
    parser.add_argument("--model", type=str, required=True, help="Ruta al modelo entrenado (model.joblib)")
    parser.add_argument("--data", type=str, help="CSV con datos para evaluación")
    parser.add_argument("--title", type=str, help="Título de un artículo para inferencia")
    parser.add_argument("--abstract", type=str, help="Abstract de un artículo para inferencia")
    parser.add_argument("--out", type=str, default="artifacts/eval", help="Directorio de salida para resultados")

    args = parser.parse_args()

    if args.data:
        evaluate(args.model, args.data, args.out)
    elif args.title and args.abstract:
        labels = predict_text(args.model, args.title, args.abstract)
        print("Predicción:", labels)
    else:
        parser.error("Debes proveer --data para evaluación o (--title y --abstract) para inferencia")
