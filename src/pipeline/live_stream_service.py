import time
import math
import random
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from src.pipeline.predict_pipeline import PredictPipeline

class LiveStreamService:
    def __init__(self):
        self.predictor = PredictPipeline()
        self.stations = {
            "STN-KL-01": {
                "name": "Kullu Valley Catchment",
                "region": "Himachal Pradesh",
                "latitude": 31.9579,
                "longitude": 77.1095,
                "elevation": 1280,
                "slope_gradient": 32.5,
                "drainage_density": 3.2,
                "base_precip": 42.0,
                "base_stage": 3.8,
                "base_soil": 78.5,
                "base_velocity": 3.4,
                "base_surge": 1.8,
                "base_ndvi": 0.45
            },
            "STN-AL-02": {
                "name": "Alaknanda Upper Gorge",
                "region": "Garhwal Himalayas",
                "latitude": 30.5526,
                "longitude": 79.5660,
                "elevation": 1850,
                "slope_gradient": 38.0,
                "drainage_density": 3.8,
                "base_precip": 74.0,
                "base_stage": 5.4,
                "base_soil": 88.0,
                "base_velocity": 4.8,
                "base_surge": 2.9,
                "base_ndvi": 0.32
            },
            "STN-TS-03": {
                "name": "Teesta River Basin",
                "region": "Sikkim Himalayas",
                "latitude": 27.3389,
                "longitude": 88.6065,
                "elevation": 920,
                "slope_gradient": 26.0,
                "drainage_density": 2.4,
                "base_precip": 24.0,
                "base_stage": 2.1,
                "base_soil": 62.0,
                "base_velocity": 1.9,
                "base_surge": 0.7,
                "base_ndvi": 0.68
            },
            "STN-WG-04": {
                "name": "Western Ghats Escarpment",
                "region": "Idukki Slopes, Kerala",
                "latitude": 9.8497,
                "longitude": 76.9806,
                "elevation": 750,
                "slope_gradient": 29.0,
                "drainage_density": 2.9,
                "base_precip": 55.0,
                "base_stage": 4.1,
                "base_soil": 82.0,
                "base_velocity": 3.6,
                "base_surge": 2.1,
                "base_ndvi": 0.52
            },
            "STN-KD-05": {
                "name": "Kedarnath Mandakini Basin",
                "region": "Rudraprayag, Uttarakhand",
                "latitude": 30.7346,
                "longitude": 79.0669,
                "elevation": 2450,
                "slope_gradient": 44.5,
                "drainage_density": 4.4,
                "base_precip": 88.0,
                "base_stage": 5.9,
                "base_soil": 91.5,
                "base_velocity": 5.4,
                "base_surge": 3.6,
                "base_ndvi": 0.28
            },
            "STN-CH-06": {
                "name": "Chamoli Rishiganga Gorge",
                "region": "Joshimath, Uttarakhand",
                "latitude": 30.5574,
                "longitude": 79.5636,
                "elevation": 2100,
                "slope_gradient": 41.0,
                "drainage_density": 4.0,
                "base_precip": 68.0,
                "base_stage": 4.9,
                "base_soil": 84.0,
                "base_velocity": 4.5,
                "base_surge": 2.7,
                "base_ndvi": 0.35
            },
            "STN-WY-07": {
                "name": "Wayanad Meppadi Hill Tracts",
                "region": "Western Ghats, Kerala",
                "latitude": 11.5540,
                "longitude": 76.1306,
                "elevation": 980,
                "slope_gradient": 34.0,
                "drainage_density": 3.5,
                "base_precip": 79.0,
                "base_stage": 5.1,
                "base_soil": 89.0,
                "base_velocity": 4.3,
                "base_surge": 3.1,
                "base_ndvi": 0.40
            },
            "STN-DZ-08": {
                "name": "Dzukou Valley Foothills",
                "region": "Nagaland-Manipur Ridge",
                "latitude": 25.5683,
                "longitude": 94.0722,
                "elevation": 1450,
                "slope_gradient": 31.5,
                "drainage_density": 2.8,
                "base_precip": 38.0,
                "base_stage": 3.2,
                "base_soil": 72.0,
                "base_velocity": 2.7,
                "base_surge": 1.4,
                "base_ndvi": 0.60
            }
        }

    def get_live_telemetry(self, station_id="STN-KL-01", mode="stream"):
        if station_id not in self.stations:
            station_id = "STN-KL-01"

        stn = self.stations[station_id]
        t = time.time()
        
        # High-frequency continuous physical waveform oscillation
        w1 = math.sin(t * 0.15) * 5.0
        w2 = math.cos(t * 0.25) * 0.4
        
        precip = max(0.0, round(stn["base_precip"] + w1 + random.uniform(-2.0, 2.0), 2))
        stage = max(0.5, round(stn["base_stage"] + w2 + random.uniform(-0.15, 0.15), 2))
        soil = min(100.0, max(20.0, round(stn["base_soil"] + math.sin(t * 0.08) * 3.0, 1)))
        velocity = max(0.5, round(stn["base_velocity"] + (w2 * 0.5), 2))
        surge = max(0.1, round(stn["base_surge"] + (w1 * 0.05), 2))
        cum_24h = round(precip * 2.8 + random.uniform(10, 25), 1)

        input_df = pd.DataFrame([{
            'elevation_m': float(stn['elevation']),
            'slope_gradient_deg': float(stn['slope_gradient']),
            'rainfall_intensity_mm_hr': float(precip),
            'cumulative_rainfall_24h_mm': float(cum_24h),
            'soil_moisture_percentage': float(soil),
            'river_water_level_m': float(stage),
            'river_flow_velocity_mps': float(velocity),
            'upstream_basin_surge_rate': float(surge),
            'vegetation_ndvi': float(stn['base_ndvi']),
            'drainage_density_km_km2': float(stn['drainage_density'])
        }])

        prediction = self.predictor.predict(input_df)

        all_stations_summary = []
        for s_id, s_info in self.stations.items():
            all_stations_summary.append({
                "id": s_id,
                "name": s_info["name"],
                "region": s_info["region"],
                "latitude": s_info["latitude"],
                "longitude": s_info["longitude"],
                "elevation": s_info["elevation"],
                "slope_gradient": s_info["slope_gradient"],
                "precip_intensity": round(s_info["base_precip"] + math.sin(t * 0.1 + hash(s_id) % 5) * 3.0, 1),
                "river_stage": round(s_info["base_stage"] + math.cos(t * 0.1 + hash(s_id) % 5) * 0.2, 2),
                "soil_moisture": round(s_info["base_soil"], 1),
                "flow_velocity": round(s_info["base_velocity"], 2),
                "threat": "CRITICAL EVACUATION" if s_info["base_precip"] > 70 else "HIGH ADVISORY" if s_info["base_precip"] > 40 else "NORMAL"
            })

        safe_zones = [
            {"name": f"{stn['name']} High Plateau Summit", "elevation_m": stn['elevation'] + 420, "distance_km": 2.4, "capacity": 1500},
            {"name": "Sector Civil Defense Bunkers", "elevation_m": stn['elevation'] + 280, "distance_km": 1.6, "capacity": 850},
            {"name": "Regional Helipad Evac Ground", "elevation_m": stn['elevation'] + 510, "distance_km": 3.8, "capacity": 3000}
        ]

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "station": stn,
            "station_id": station_id,
            "mode": mode,
            "telemetry": {
                "rainfall_intensity_mm_hr": precip,
                "cumulative_rainfall_24h_mm": cum_24h,
                "soil_moisture_percentage": soil,
                "river_water_level_m": stage,
                "river_flow_velocity_mps": velocity,
                "upstream_basin_surge_rate": surge,
                "vegetation_ndvi": stn['base_ndvi'],
                "drainage_density_km_km2": stn['drainage_density']
            },
            "prediction": prediction,
            "all_stations": all_stations_summary,
            "safe_zones": safe_zones
        }

    def get_3d_terrain_mesh(self, resolution=30):
        # Generate synthetic realistic mountain gorge elevation matrix
        x = np.linspace(-10, 10, resolution)
        y = np.linspace(-10, 10, resolution)
        X, Y = np.meshgrid(x, y)
        Z = np.sin(np.sqrt(X**2 + Y**2)) * 3.5 + np.cos(X * 0.5) * 2.0 - np.exp(-((X)**2 + (Y)**2)/8.0) * 4.0
        return {
            "resolution": resolution,
            "elevation_matrix": Z.tolist(),
            "min_elevation": float(np.min(Z)),
            "max_elevation": float(np.max(Z))
        }
