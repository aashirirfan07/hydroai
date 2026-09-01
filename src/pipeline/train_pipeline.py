import sys
from src.exception import CustomException
from src.logger import logging
from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer

class TrainPipeline:
    def __init__(self):
        pass

    def run_pipeline(self):
        try:
            logging.info(">>> Starting End-to-End Flash Flood Training Pipeline <<<")
            
            # Step 1: Ingestion
            ingestion = DataIngestion()
            train_data_path, test_data_path = ingestion.initiate_data_ingestion()

            # Step 2: Transformation
            transformation = DataTransformation()
            train_arr, test_arr, preprocessor_path = transformation.initiate_data_transformation(
                train_path=train_data_path,
                test_path=test_data_path
            )

            # Step 3: Model Training
            trainer = ModelTrainer()
            metrics_summary = trainer.initiate_model_trainer(train_arr, test_arr)

            logging.info(">>> Training Pipeline Executed Successfully! <<<")
            return metrics_summary
        except Exception as e:
            raise CustomException(e, sys)

if __name__ == "__main__":
    pipeline = TrainPipeline()
    result = pipeline.run_pipeline()
    print("Training Pipeline Completed Successfully:")
    print(result)
