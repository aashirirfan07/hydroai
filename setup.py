from setuptools import find_packages, setup
from typing import List

HYPHEN_E_DOT = '-e .'

def get_requirements(file_path: str) -> List[str]:
    '''
    This function reads requirements.txt and returns a list of dependencies.
    '''
    requirements = []
    with open(file_path) as file_obj:
        requirements = file_obj.readlines()
        requirements = [req.replace("\n", "").strip() for req in requirements]

        if HYPHEN_E_DOT in requirements:
            requirements.remove(HYPHEN_E_DOT)
            
    return [r for r in requirements if r and not r.startswith("#")]

setup(
    name='flash_flood_prediction_system',
    version='1.0.0',
    author='Antigravity Engineering',
    author_email='contact@antigravity.ai',
    description='Flash Flood Prediction & Real-Time Monitoring System for Hilly Regions using Multi-Source Geospatial & Hydrological Data',
    packages=find_packages(),
    install_requires=get_requirements('requirements.txt')
)
