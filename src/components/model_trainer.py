import os
import sys
import json
from dataclasses import dataclass
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    ExtraTreesRegressor
)
from sklearn.linear_model import Ridge
from xgboost import XGBRegressor
from src.exception import CustomException
from src.logger import logging
from src.utils import save_object, evaluate_models

@dataclass
class ModelTrainerConfig:
    trained_model_file_path = os.path.join("artifacts", "model.pkl")
    metrics_file_path = os.path.join("artifacts", "metrics.json")

class ModelTrainer:
    def __init__(self):
        self.model_trainer_config = ModelTrainerConfig()

    def initiate_model_trainer(self, train_array, test_array):
        try:
            logging.info("Splitting training and testing input data")
            X_train, y_train, X_test, y_test = (
                train_array[:, :-1],
                train_array[:, -1],
                test_array[:, :-1],
                test_array[:, -1]
            )

            models = {
                "Random Forest": RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42, n_jobs=-1),
                "Gradient Boosting": GradientBoostingRegressor(n_estimators=140, learning_rate=0.08, max_depth=5, random_state=42),
                "XGBoost": XGBRegressor(n_estimators=130, learning_rate=0.08, max_depth=5, random_state=42, n_jobs=-1),
                "Extra Trees": ExtraTreesRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1),
                "Ridge Regression": Ridge(alpha=1.0)
            }

            model_report = evaluate_models(
                X_train=X_train,
                y_train=y_train,
                X_test=X_test,
                y_test=y_test,
                models=models
            )

            best_model_name = max(model_report, key=lambda k: model_report[k]["r2_score"])
            best_model_score = model_report[best_model_name]["r2_score"]
            best_model = model_report[best_model_name]["model"]
            best_rmse = model_report[best_model_name]["rmse"]
            best_mae = model_report[best_model_name]["mae"]

            if best_model_score < 0.70:
                raise CustomException("No suitable model found with acceptable R2 score (>0.70)", sys)

            logging.info(f"Best Model Selected: {best_model_name} with R2 Score: {best_model_score:.4f}, RMSE: {best_rmse:.4f}")

            save_object(
                file_path=self.model_trainer_config.trained_model_file_path,
                obj=best_model
            )

            # Save metrics summary
            summary = {
                "best_model": best_model_name,
                "r2_score": round(best_model_score, 4),
                "rmse": round(best_rmse, 4),
                "mae": round(best_mae, 4),
                "all_models": {
                    k: {
                        "r2_score": round(v["r2_score"], 4),
                        "rmse": round(v["rmse"], 4),
                        "mae": round(v["mae"], 4)
                    } for k, v in model_report.items()
                }
            }
            with open(self.model_trainer_config.metrics_file_path, "w") as f:
                json.dump(summary, f, indent=4)

            return summary

        except Exception as e:
            raise CustomException(e, sys)
