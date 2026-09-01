import os
import sys
import pandas as pd
from dataclasses import dataclass
from sklearn.model_selection import train_test_split
from src.exception import CustomException
from src.logger import logging
from src.utils import generate_multi_source_dataset

@dataclass
class DataIngestionConfig:
    raw_data_path: str = os.path.join("artifacts", "data.csv")
    train_data_path: str = os.path.join("artifacts", "train.csv")
    test_data_path: str = os.path.join("artifacts", "test.csv")

class DataIngestion:
    def __init__(self):
        self.ingestion_config = DataIngestionConfig()

    def initiate_data_ingestion(self):
        logging.info("Initiating multi-source dynamic data ingestion component")
        try:
            # Check if source data exists or generate realistic multi-source dataset
            data_file = os.path.join("data", "raw", "flash_flood_hilly_region.csv")
            if os.path.exists(data_file):
                df = pd.read_csv(data_file)
                logging.info(f"Loaded existing multi-source data from {data_file}")
            else:
                logging.info("Generating calibrated multi-source hilly terrain telemetry dataset...")
                df = generate_multi_source_dataset(n_samples=3500, random_state=42)
                os.makedirs(os.path.dirname(data_file), exist_ok=True)
                df.to_csv(data_file, index=False)
                logging.info(f"Generated and saved raw multi-source dataset to {data_file}")

            os.makedirs(os.path.dirname(self.ingestion_config.raw_data_path), exist_ok=True)
            df.to_csv(self.ingestion_config.raw_data_path, index=False, header=True)

            logging.info("Splitting dataset into train (80%) and test (20%) sets")
            train_set, test_set = train_test_split(df, test_size=0.2, random_state=42)

            train_set.to_csv(self.ingestion_config.train_data_path, index=False, header=True)
            test_set.to_csv(self.ingestion_config.test_data_path, index=False, header=True)

            logging.info("Data ingestion completed successfully")
            return (
                self.ingestion_config.train_data_path,
                self.ingestion_config.test_data_path
            )

        except Exception as e:
            raise CustomException(e, sys)
