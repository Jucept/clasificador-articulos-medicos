# Clasificador Multilabel de Literatura Médica — Tech Sphere 2025

## Descripción

Este proyecto aborda el reto de clasificación multilabel de artículos médicos, donde cada texto puede pertenecer a varias categorías clínicas. El objetivo es construir un pipeline reproducible que permita entrenar, evaluar e inferir etiquetas médicas usando técnicas de NLP clásicas y modelos lineales.

## Objetivo

- Analizar y modelar literatura biomédica para predecir etiquetas clínicas multilabel.
- Proveer un baseline robusto y reproducible (TF-IDF + LinearSVC).
- Facilitar la evaluación y la inferencia rápida sobre nuevos textos.

---

## Instalación

```bash
pip install -r requirements.txt
```

---

## Entrenamiento del modelo

```bash
python src/train.py --data data/challenge_data-18-ago.csv --out artifacts/baseline_tfidf_svm
```

---

## Evaluación del modelo

```bash
python src/eval.py --model artifacts/baseline_tfidf_svm/model.joblib --data data/challenge_data-18-ago.csv --out artifacts/eval_baseline
```

---

## Inferencia rápida

```bash
python src/eval.py --model artifacts/baseline_tfidf_svm/model.joblib --title "Brain ischemia after cardiac arrest" --abstract "This study evaluates the neurological outcomes in patients..."
```

---

## Estructura de artefactos

- `artifacts/baseline_tfidf_svm/`: Modelo entrenado, métricas, matrices de confusión.
- `artifacts/eval_baseline/`: Resultados de evaluación sobre el set completo.

---

## Capturas de pantalla

### Matrices de confusión
| Cardiovascular | Hepatorenal | Neurological | Oncological |
|----------------|-------------|--------------|-------------|
| ![](/artifacts/eval_baseline/confusion_matrices/cm_Cardiovascular.png) | ![](/artifacts/eval_baseline/confusion_matrices/cm_Hepatorenal.png) | ![](/artifacts/eval_baseline/confusion_matrices/cm_Neurological.png) | ![](/artifacts/eval_baseline/confusion_matrices/cm_Oncological.png) |

### Reporte de métricas
<img width="524" height="218" alt="imagen" src="https://github.com/user-attachments/assets/03d9b00e-b051-4824-867d-bdddc438c0a7" />

### Ejemplo de inferencia
<img width="1760" height="116" alt="imagen" src="https://github.com/user-attachments/assets/b013ca52-ec46-4d9a-90a3-9e77edefe5e7" />

---

## Demo interactiva (V0)
Hemos desarrollado una vista interactiva con V0 que permite:
- Explorar el clasificador en tiempo real.
- Subir archivos o ingresar texto manualmente.
- Visualizar métricas clave como precisión y macro-F1.
- Navegar por la matriz de confusión con ejemplos por clase.
> [Probar demo en V0](https://v0-no-content-five-coral.vercel.app/)

---

## Créditos

- Autores: Andres Julian Munera y Julio César Posada  
- Reto: Tech Sphere 2025
