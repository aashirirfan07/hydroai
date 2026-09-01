import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
import os
import pandas as pd
from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer
from src.pipeline.predict_pipeline import PredictPipeline, CustomData

def test_data_ingestion():
    ingestion = DataIngestion()
    train_path, test_path = ingestion.initiate_data_ingestion()
    assert os.path.exists(train_path)
    assert os.path.exists(test_path)
    train_df = pd.read_csv(train_path)
    assert len(train_df) > 100
    assert 'flood_risk_severity_index' in train_df.columns

def test_data_transformation_and_training():
    ingestion = DataIngestion()
    train_path, test_path = ingestion.initiate_data_ingestion()
    
    transformation = DataTransformation()
    train_arr, test_arr, preprocessor_path = transformation.initiate_data_transformation(train_path, test_path)
    assert os.path.exists(preprocessor_path)
    assert train_arr.shape[1] > 10

    trainer = ModelTrainer()
    metrics = trainer.initiate_model_trainer(train_arr, test_arr)
    assert metrics["r2_score"] > 0.75
    assert os.path.exists("artifacts/model.pkl")

def test_predict_pipeline():
    custom_data = CustomData(
        elevation_m=1400.0,
        slope_gradient_deg=35.0,
        rainfall_intensity_mm_hr=75.0,
        cumulative_rainfall_24h_mm=180.0,
        soil_moisture_percentage=90.0,
        river_water_level_m=5.2,
        river_flow_velocity_mps=4.5,
        upstream_basin_surge_rate=2.8,
        vegetation_ndvi=0.35,
        drainage_density_km_km2=3.2
    )
    df = custom_data.get_data_as_data_frame()
    predictor = PredictPipeline()
    res = predictor.predict(df)
    
    assert "flood_risk_score" in res
    assert res["flood_risk_score"] >= 0.0
    assert "alert_level" in res
    assert "forecast_probability_curve" in res
