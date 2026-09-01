import os
import sys
import pickle
import numpy as np
import pandas as pd
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from src.exception import CustomException
from src.logger import logging

def save_object(file_path: str, obj: object):
    try:
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)
        with open(file_path, "wb") as file_obj:
            pickle.dump(obj, file_obj)
        logging.info(f"Object successfully saved at {file_path}")
    except Exception as e:
        raise CustomException(e, sys)

def load_object(file_path: str):
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        with open(file_path, "rb") as file_obj:
            return pickle.load(file_obj)
    except Exception as e:
        raise CustomException(e, sys)

def evaluate_models(X_train, y_train, X_test, y_test, models: dict):
    try:
        report = {}
        for name, model in models.items():
            model.fit(X_train, y_train)
            y_test_pred = model.predict(X_test)
            test_model_score = r2_score(y_test, y_test_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
            mae = mean_absolute_error(y_test, y_test_pred)
            report[name] = {
                "r2_score": float(test_model_score),
                "rmse": float(rmse),
                "mae": float(mae),
                "model": model
            }
            logging.info(f"Model {name} evaluated -> R2: {test_model_score:.4f}, RMSE: {rmse:.4f}")
        return report
    except Exception as e:
        raise CustomException(e, sys)

def get_risk_category(risk_score: float) -> dict:
    score = max(0.0, min(1200.0, float(risk_score)))
    if score < 300:
        return {
            "level": "Low / Normal",
            "badge_class": "badge-success",
            "color": "#00f5a0",
            "alert_status": "Normal Operating Baseline",
            "evacuation": False,
            "threat_level": "LEVEL 0 - CLEAR"
        }
    elif score < 600:
        return {
            "level": "Moderate / Advisory",
            "badge_class": "badge-warning",
            "color": "#f59e0b",
            "alert_status": "Hydrological Watch: Basin Saturation Elevated",
            "evacuation": False,
            "threat_level": "LEVEL 1 - ADVISORY"
        }
    elif score < 900:
        return {
            "level": "High / Warning",
            "badge_class": "badge-orange",
            "color": "#f97316",
            "alert_status": "Flash Flood Warning: Evacuate River Corridors",
            "evacuation": True,
            "threat_level": "LEVEL 2 - IMMINENT DANGER"
        }
    else:
        return {
            "level": "Critical / Extreme",
            "badge_class": "badge-danger",
            "color": "#ff3366",
            "alert_status": "CRITICAL EVACUATION ORDER ACTIVATED (CAP PROTOCOL)",
            "evacuation": True,
            "threat_level": "LEVEL 3 - CRITICAL EMERGENCY"
        }

def compute_xai_attribution(input_row: dict, risk_score: float) -> dict:
    '''
    Computes explainable AI (XAI) feature attribution breakdown for flash flood prediction.
    Shows percentage contribution of each multi-source factor to the total severity score.
    '''
    rain_contrib = (input_row.get("rainfall_intensity_mm_hr", 30) * 3.5 + input_row.get("cumulative_rainfall_24h_mm", 80) * 1.1)
    soil_contrib = max(0.0, (input_row.get("soil_moisture_percentage", 60) - 50.0) * 5.5)
    river_contrib = (input_row.get("river_water_level_m", 2.0) ** 1.6) * 28 + (input_row.get("river_flow_velocity_mps", 2.0) * 22)
    slope_contrib = np.sin(np.radians(input_row.get("slope_gradient_deg", 25))) * 250
    surge_contrib = input_row.get("upstream_basin_surge_rate", 1.0) * 45
    veg_buffer = input_row.get("vegetation_ndvi", 0.5) * 120

    raw_sum = rain_contrib + soil_contrib + river_contrib + slope_contrib + surge_contrib + 1e-5
    
    return {
        "meteorological_rainfall_pct": round((rain_contrib / raw_sum) * 100, 1),
        "soil_saturation_pressure_pct": round((soil_contrib / raw_sum) * 100, 1),
        "river_stage_and_velocity_pct": round((river_contrib / raw_sum) * 100, 1),
        "topographic_slope_gradient_pct": round((slope_contrib / raw_sum) * 100, 1),
        "upstream_surge_rate_pct": round((surge_contrib / raw_sum) * 100, 1),
        "vegetation_mitigation_index": round(veg_buffer, 1)
    }

def generate_multi_source_dataset(n_samples=3500, random_state=42) -> pd.DataFrame:
    np.random.seed(random_state)
    elevation = np.random.uniform(400, 3200, n_samples)
    slope = np.random.uniform(5, 45, n_samples)
    rainfall_intensity = np.random.exponential(scale=20, size=n_samples)
    rainfall_intensity = np.clip(rainfall_intensity, 0, 140)
    cum_rainfall = rainfall_intensity * np.random.uniform(1.8, 3.5, n_samples) + np.random.uniform(5, 80, n_samples)
    cum_rainfall = np.clip(cum_rainfall, 0, 400)
    
    soil_moisture = 20 + 0.18 * cum_rainfall + np.random.normal(0, 8, n_samples)
    soil_moisture = np.clip(soil_moisture, 10, 100)
    
    runoff_potential = (slope / 45.0) * (soil_moisture / 100.0) * rainfall_intensity
    river_level = 1.0 + 0.04 * runoff_potential + 0.015 * cum_rainfall + np.random.normal(0, 0.4, n_samples)
    river_level = np.clip(river_level, 0.5, 9.0)
    
    river_velocity = 0.8 + 0.45 * (river_level - 0.5) + 0.05 * slope + np.random.normal(0, 0.25, n_samples)
    river_velocity = np.clip(river_velocity, 0.5, 7.5)
    
    upstream_surge = 0.05 * rainfall_intensity * (slope / 30.0) + np.random.exponential(scale=0.4, size=n_samples)
    upstream_surge = np.clip(upstream_surge, 0.0, 5.5)
    
    ndvi = np.random.uniform(0.15, 0.85, n_samples)
    drainage_density = np.random.uniform(0.8, 4.2, n_samples)
    
    excess_soil = np.maximum(0.0, soil_moisture - 70.0)
    saturation_factor = np.where(soil_moisture > 70, excess_soil**1.3, 0.0)
    slope_factor = np.sin(np.radians(slope)) * 250
    rain_factor = (rainfall_intensity * 3.5) + (cum_rainfall * 1.1)
    river_factor = (river_level ** 1.6) * 28 + (river_velocity * 22)
    upstream_factor = upstream_surge * 45
    vegetation_mitigation = ndvi * 120
    
    noise = np.random.normal(0, 25, n_samples)
    
    raw_severity = (
        rain_factor 
        + saturation_factor 
        + slope_factor 
        + river_factor 
        + upstream_factor 
        - vegetation_mitigation 
        + noise
    )
    
    flood_risk_severity_index = np.clip(raw_severity * 0.85, 0, 1200)
    
    df = pd.DataFrame({
        'elevation_m': np.round(elevation, 1),
        'slope_gradient_deg': np.round(slope, 1),
        'rainfall_intensity_mm_hr': np.round(rainfall_intensity, 1),
        'cumulative_rainfall_24h_mm': np.round(cum_rainfall, 1),
        'soil_moisture_percentage': np.round(soil_moisture, 1),
        'river_water_level_m': np.round(river_level, 2),
        'river_flow_velocity_mps': np.round(river_velocity, 2),
        'upstream_basin_surge_rate': np.round(upstream_surge, 2),
        'vegetation_ndvi': np.round(ndvi, 2),
        'drainage_density_km_km2': np.round(drainage_density, 2),
        'flood_risk_severity_index': np.round(flood_risk_severity_index, 1)
    })
    
    return df
