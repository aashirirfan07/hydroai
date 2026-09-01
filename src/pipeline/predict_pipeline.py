import os
import sys
import pandas as pd
import numpy as np
from src.exception import CustomException
from src.logger import logging
from src.utils import load_object, get_risk_category, compute_xai_attribution

class PredictPipeline:
    def __init__(self):
        self.model_path = os.path.join("artifacts", "model.pkl")
        self.preprocessor_path = os.path.join("artifacts", "preprocessor.pkl")

    def predict(self, features_df: pd.DataFrame) -> dict:
        try:
            if not os.path.exists(self.model_path) or not os.path.exists(self.preprocessor_path):
                from src.pipeline.train_pipeline import TrainPipeline
                logging.info("Model artifacts missing. Triggering automated TrainPipeline...")
                train_pipe = TrainPipeline()
                train_pipe.run_pipeline()

            model = load_object(self.model_path)
            preprocessor = load_object(self.preprocessor_path)

            data_scaled = preprocessor.transform(features_df.values)
            preds = model.predict(data_scaled)
            raw_score = float(preds[0])
            risk_score = round(max(0.0, min(1200.0, raw_score)), 1)

            risk_info = get_risk_category(risk_score)
            flood_prob = round(min(100.0, (risk_score / 1000.0) * 100.0), 1)

            hours = [f"{h}h" for h in range(0, 25, 2)]
            curve = []
            base_prob = flood_prob
            for idx, h in enumerate(hours):
                surge_peak = np.sin((idx / 12) * np.pi) * (base_prob * 0.4)
                point_val = np.clip(base_prob + surge_peak + np.random.normal(0, 1.5), 0, 100)
                curve.append(round(float(point_val), 1))

            input_dict = features_df.to_dict(orient="records")[0]
            xai_attribution = compute_xai_attribution(input_dict, risk_score)

            return {
                "flood_risk_score": risk_score,
                "flood_probability_24h": flood_prob,
                "forecast_timeline_hours": hours,
                "forecast_probability_curve": curve,
                "alert_level": risk_info["level"],
                "threat_level": risk_info.get("threat_level", "LEVEL 1"),
                "badge_class": risk_info["badge_class"],
                "color": risk_info["color"],
                "alert_status": risk_info["alert_status"],
                "evacuation_recommended": risk_info["evacuation"],
                "xai_attribution": xai_attribution,
                "input_data": input_dict
            }
        except Exception as e:
            raise CustomException(e, sys)

class CustomData:
    def __init__(
        self,
        elevation_m: float,
        slope_gradient_deg: float,
        rainfall_intensity_mm_hr: float,
        cumulative_rainfall_24h_mm: float,
        soil_moisture_percentage: float,
        river_water_level_m: float,
        river_flow_velocity_mps: float,
        upstream_basin_surge_rate: float,
        vegetation_ndvi: float = 0.5,
        drainage_density_km_km2: float = 2.2
    ):
        self.elevation_m = float(elevation_m)
        self.slope_gradient_deg = float(slope_gradient_deg)
        self.rainfall_intensity_mm_hr = float(rainfall_intensity_mm_hr)
        self.cumulative_rainfall_24h_mm = float(cumulative_rainfall_24h_mm)
        self.soil_moisture_percentage = float(soil_moisture_percentage)
        self.river_water_level_m = float(river_water_level_m)
        self.river_flow_velocity_mps = float(river_flow_velocity_mps)
        self.upstream_basin_surge_rate = float(upstream_basin_surge_rate)
        self.vegetation_ndvi = float(vegetation_ndvi)
        self.drainage_density_km_km2 = float(drainage_density_km_km2)

    def get_data_as_data_frame(self) -> pd.DataFrame:
        try:
            return pd.DataFrame({
                "elevation_m": [self.elevation_m],
                "slope_gradient_deg": [self.slope_gradient_deg],
                "rainfall_intensity_mm_hr": [self.rainfall_intensity_mm_hr],
                "cumulative_rainfall_24h_mm": [self.cumulative_rainfall_24h_mm],
                "soil_moisture_percentage": [self.soil_moisture_percentage],
                "river_water_level_m": [self.river_water_level_m],
                "river_flow_velocity_mps": [self.river_flow_velocity_mps],
                "upstream_basin_surge_rate": [self.upstream_basin_surge_rate],
                "vegetation_ndvi": [self.vegetation_ndvi],
                "drainage_density_km_km2": [self.drainage_density_km_km2],
            })
        except Exception as e:
            raise CustomException(e, sys)
