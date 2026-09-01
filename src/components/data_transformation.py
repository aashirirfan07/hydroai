import os
import sys
import numpy as np
import pandas as pd
from dataclasses import dataclass
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.base import BaseEstimator, TransformerMixin
from src.exception import CustomException
from src.logger import logging
from src.utils import save_object

class HydrologicalFeatureEngineering(BaseEstimator, TransformerMixin):
    '''
    Domain-specific feature engineering for flash floods in mountainous/hilly valleys:
    1. Topographic Wetness Index proxy = ln(Catchment Area / tan(Slope))
    2. Runoff Kinetic Surge = Velocity * Slope_gradient
    3. Soil Saturation Pressure = Soil_moisture * Cumulative_rainfall
    '''
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        try:
            df = pd.DataFrame(X).copy()
            # If incoming X is numpy array, columns are numeric indices
            # Expected order:
            # 0: elevation_m, 1: slope_gradient_deg, 2: rainfall_intensity_mm_hr,
            # 3: cumulative_rainfall_24h_mm, 4: soil_moisture_percentage,
            # 5: river_water_level_m, 6: river_flow_velocity_mps,
            # 7: upstream_basin_surge_rate, 8: vegetation_ndvi, 9: drainage_density_km_km2
            
            slope = np.maximum(df.iloc[:, 1].values, 0.1)
            rain_rate = df.iloc[:, 2].values
            cum_rain = df.iloc[:, 3].values
            soil_moist = df.iloc[:, 4].values
            velocity = df.iloc[:, 6].values
            
            # Derived feature 1: Runoff kinetic surge
            runoff_surge = (velocity * np.sin(np.radians(slope))).reshape(-1, 1)
            
            # Derived feature 2: Hydro-saturation index
            hydro_sat = ((soil_moist / 100.0) * cum_rain).reshape(-1, 1)
            
            # Derived feature 3: Instantaneous flash load
            flash_load = (rain_rate * (slope / 20.0)).reshape(-1, 1)
            
            engineered = np.hstack([df.values, runoff_surge, hydro_sat, flash_load])
            return engineered
        except Exception as e:
            raise CustomException(e, sys)

@dataclass
class DataTransformationConfig:
    preprocessor_obj_file_path = os.path.join('artifacts', 'preprocessor.pkl')

class DataTransformation:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()

    def get_data_transformer_object(self):
        try:
            pipeline = Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="median")),
                    ("feature_engineering", HydrologicalFeatureEngineering()),
                    ("scaler", StandardScaler())
                ]
            )
            return pipeline
        except Exception as e:
            raise CustomException(e, sys)

    def initiate_data_transformation(self, train_path, test_path):
        try:
            train_df = pd.read_csv(train_path)
            test_df = pd.read_csv(test_path)
            logging.info("Read train and test data completed for transformation")

            target_column_name = "flood_risk_severity_index"
            
            input_feature_train_df = train_df.drop(columns=[target_column_name])
            target_feature_train_df = train_df[target_column_name]

            input_feature_test_df = test_df.drop(columns=[target_column_name])
            target_feature_test_df = test_df[target_column_name]

            logging.info("Applying preprocessing pipeline on training and testing data")
            preprocessing_obj = self.get_data_transformer_object()

            input_feature_train_arr = preprocessing_obj.fit_transform(input_feature_train_df.values)
            input_feature_test_arr = preprocessing_obj.transform(input_feature_test_df.values)

            train_arr = np.c_[input_feature_train_arr, np.array(target_feature_train_df)]
            test_arr = np.c_[input_feature_test_arr, np.array(target_feature_test_df)]

            logging.info(f"Saving preprocessor object to {self.data_transformation_config.preprocessor_obj_file_path}")
            save_object(
                file_path=self.data_transformation_config.preprocessor_obj_file_path,
                obj=preprocessing_obj
            )

            return (
                train_arr,
                test_arr,
                self.data_transformation_config.preprocessor_obj_file_path,
            )
        except Exception as e:
            raise CustomException(e, sys)
