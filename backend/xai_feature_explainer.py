"""
xai_feature_explainer.py - Explainable AI System

This uses rule-based XAI to automatically generate insights from extracted features.
The KEY: Numbers come from the model/video analysis, text is generated based on those numbers.
"""

import numpy as np
from typing import Dict, List, Tuple


class FeatureBasedExplainer:
    """
    Explainable AI system that generates insights from extracted features.
    
    The difference from templates:
    - Templates: if x < 0.03: return "Low activity"
    - XAI: Extracts features → Maps features to explanations → Combines with values
    """
    
    def __init__(self):
        """Initialize the XAI explainer"""
        pass
    
    def extract_features(self, frames: np.ndarray, probability: float) -> Dict:
        """
        Extract explainable features from video analysis
        These features drive the explanations
        
        Args:
            frames: Video frames (30, 224, 224, 3)
            probability: Model prediction probability
        
        Returns:
            dict: Extracted features with measurements
        """
        
        # Feature 1: Movement Analysis
        movement_features = self._analyze_movement(frames)
        
        # Feature 2: Posture Analysis  
        posture_features = self._analyze_posture(frames)
        
        # Feature 3: Activity Distribution
        activity_features = self._analyze_activity_distribution(frames)
        
        # Feature 4: Temporal Patterns
        temporal_features = self._analyze_temporal_patterns(frames)
        
        return {
            'movement': movement_features,
            'posture': posture_features,
            'activity': activity_features,
            'temporal': temporal_features,
            'model_confidence': probability
        }
    
    def _analyze_movement(self, frames: np.ndarray) -> Dict:
        """Extract movement features"""
        # Calculate frame-to-frame differences
        movements = []
        for i in range(len(frames) - 1):
            diff = np.abs(frames[i+1] - frames[i])
            movements.append(np.mean(diff))
        
        movements = np.array(movements)
        
        return {
            'average': float(np.mean(movements)),
            'variance': float(np.var(movements)),
            'max': float(np.max(movements)),
            'min': float(np.min(movements)),
            'trend': self._calculate_trend(movements),
            'percentage': float(np.mean(movements) * 100)
        }
    
    def _analyze_posture(self, frames: np.ndarray) -> Dict:
        """Extract posture features"""
        # Analyze vertical distribution (top, middle, bottom)
        top_region = np.mean(frames[:, :, :75, :])
        middle_region = np.mean(frames[:, :, 75:150, :])
        bottom_region = np.mean(frames[:, :, 150:, :])
        
        # Determine posture type
        if bottom_region > top_region * 1.2:
            posture_type = 'low_posture'
            description = 'hunched or low'
        elif top_region > bottom_region * 1.2:
            posture_type = 'upright'
            description = 'upright and alert'
        else:
            posture_type = 'balanced'
            description = 'balanced'
        
        return {
            'type': posture_type,
            'description': description,
            'top_activity': float(top_region),
            'middle_activity': float(middle_region),
            'bottom_activity': float(bottom_region),
            'ratio': float(bottom_region / (top_region + 0.001))
        }
    
    def _analyze_activity_distribution(self, frames: np.ndarray) -> Dict:
        """Analyze activity across frames"""
        activity_per_frame = np.mean(frames, axis=(1, 2, 3))
        
        return {
            'mean': float(np.mean(activity_per_frame)),
            'std': float(np.std(activity_per_frame)),
            'consistency': 'high' if np.std(activity_per_frame) < 0.05 else 'variable'
        }
    
    def _analyze_temporal_patterns(self, frames: np.ndarray) -> Dict:
        """Analyze patterns over time"""
        # Calculate movement in first vs second half
        first_half_movement = np.mean(np.abs(np.diff(frames[:15], axis=0)))
        second_half_movement = np.mean(np.abs(np.diff(frames[15:], axis=0)))
        
        if second_half_movement > first_half_movement * 1.2:
            pattern = 'increasing'
        elif first_half_movement > second_half_movement * 1.2:
            pattern = 'decreasing'
        else:
            pattern = 'stable'
        
        return {
            'pattern': pattern,
            'first_half': float(first_half_movement),
            'second_half': float(second_half_movement)
        }
    
    def _calculate_trend(self, values: np.ndarray) -> str:
        """Calculate if values trend up, down, or stable"""
        if len(values) < 2:
            return 'stable'
        
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        
        if slope > 0.001:
            return 'increasing'
        elif slope < -0.001:
            return 'decreasing'
        return 'stable'
    
    def generate_explanations(
        self, 
        features: Dict,
        prediction_class: str,
        threshold: float = 0.3
    ) -> Dict[str, List[str]]:
        """
        Generate explanations based on extracted features
        
        Args:
            features: Extracted features
            prediction_class: 'normal' or 'abnormal'
            threshold: Classification threshold
        
        Returns:
            dict: Generated observations, concerns, recommendations
        """
        
        observations = []
        concerns = []
        recommendations = []
        
        # Extract features
        movement = features['movement']
        posture = features['posture']
        activity = features['activity']
        temporal = features['temporal']
        confidence = features['model_confidence']
        
        # OBSERVATION 1: Movement Analysis (feature-based)
        obs1 = self._explain_movement_feature(movement)
        observations.append(obs1)
        
        # OBSERVATION 2: Posture Analysis (feature-based)
        obs2 = self._explain_posture_feature(posture)
        observations.append(obs2)
        
        # OBSERVATION 3: Activity Pattern (feature-based)
        obs3 = self._explain_activity_feature(activity, temporal)
        observations.append(obs3)
        
        # CONCERNS: Only for abnormal (feature-based)
        if prediction_class == 'abnormal':
            concerns = self._generate_concerns_from_features(
                movement, posture, activity, confidence, threshold
            )
        
        # RECOMMENDATIONS: Based on features
        recommendations = self._generate_recommendations_from_features(
            movement, posture, prediction_class, confidence, threshold
        )
        
        return {
            'observations': observations,
            'concerns': concerns,
            'recommendations': recommendations
        }
    
    def _explain_movement_feature(self, movement: Dict) -> str:
        """
        Feature → Explanation mapping for movement
        """
        avg = movement['average']
        variance = movement['variance']
        percentage = movement['percentage']
        trend = movement['trend']
        
        # Map measured value to description
        if avg < 0.02:
            level = "minimal"
        elif avg < 0.04:
            level = "low to moderate"
        elif avg < 0.06:
            level = "moderate"
        else:
            level = "active"
        
        # Map variance to consistency
        if variance < 0.001:
            consistency = "highly consistent"
        elif variance < 0.002:
            consistency = "consistent"
        else:
            consistency = "variable"
        
        # Construct explanation with actual measured values
        explanation = (
            f"Analysis across 30 frames detected {level} movement activity "
            f"(average: {percentage:.2f}%) with {consistency} patterns "
            f"(variance: {variance:.6f}), showing {trend} behavior over time."
        )
        
        return explanation
    
    def _explain_posture_feature(self, posture: Dict) -> str:
        """Feature → Explanation mapping for posture"""
        posture_type = posture['description']
        top = posture['top_activity']
        middle = posture['middle_activity']
        bottom = posture['bottom_activity']
        
        explanation = (
            f"Posture analysis indicates a {posture_type} body position, "
            f"with vertical activity distribution of top: {top:.3f}, "
            f"middle: {middle:.3f}, bottom: {bottom:.3f}."
        )
        
        return explanation
    
    def _explain_activity_feature(self, activity: Dict, temporal: Dict) -> str:
        """Feature → Explanation mapping for activity"""
        consistency = activity['consistency']
        pattern = temporal['pattern']
        
        if pattern == 'stable':
            temporal_desc = "maintaining steady activity levels"
        elif pattern == 'increasing':
            temporal_desc = "showing increasing activity over time"
        else:
            temporal_desc = "demonstrating declining activity"
        
        explanation = (
            f"Activity distribution shows {consistency} consistency across frames, "
            f"{temporal_desc} throughout the observation period."
        )
        
        return explanation
    
    def _generate_concerns_from_features(
        self,
        movement: Dict,
        posture: Dict,
        activity: Dict,
        confidence: float,
        threshold: float
    ) -> List[str]:
        """
        Generate concerns based on feature analysis
        Features determine which concerns apply
        """
        concerns = []
        
        # Concern 1: Low movement (feature-driven)
        if movement['average'] < 0.03:
            concern = (
                f"The detected movement activity of {movement['percentage']:.2f}% "
                f"falls below normal activity thresholds. Combined with abnormal "
                f"classification (confidence: {confidence:.2f}), this may indicate "
                f"reduced mobility due to discomfort, pain, or systemic illness."
            )
            concerns.append(concern)
        
        # Concern 2: Low posture + low movement (feature combination)
        if posture['type'] == 'low_posture' and movement['average'] < 0.04:
            concern = (
                f"The combination of low body posture (bottom region activity: "
                f"{posture['bottom_activity']:.3f}) with reduced movement suggests "
                f"possible abdominal discomfort, nausea, or reluctance to maintain "
                f"normal posture due to pain."
            )
            concerns.append(concern)
        
        # Concern 3: High variance (feature-driven)
        if movement['variance'] > 0.002:
            concern = (
                f"Movement inconsistency (variance: {movement['variance']:.6f}) "
                f"indicates irregular behavioral patterns that may suggest intermittent "
                f"pain, anxiety, or difficulty maintaining stable activity levels."
            )
            concerns.append(concern)
        
        return concerns[:3]  # Max 3 concerns
    
    def _generate_recommendations_from_features(
        self,
        movement: Dict,
        posture: Dict,
        prediction_class: str,
        confidence: float,
        threshold: float
    ) -> List[str]:
        """
        Generate recommendations based on features
        Features determine appropriate actions
        """
        recommendations = []
        
        if prediction_class == 'abnormal':
            # Urgency based on confidence (feature-driven)
            if confidence > 0.6:
                rec = (
                    f"Given the high abnormality confidence ({confidence*100:.1f}%), "
                    f"veterinary consultation within 24 hours is recommended to evaluate "
                    f"the observed behavioral indicators."
                )
                recommendations.append(rec)
            elif confidence > 0.4:
                rec = (
                    f"The detected abnormality indicators (confidence: {confidence*100:.1f}%) "
                    f"suggest scheduling a veterinary check-up within 2-3 days for "
                    f"professional assessment."
                )
                recommendations.append(rec)
            else:
                rec = (
                    f"Borderline abnormal indicators detected (confidence: {confidence*100:.1f}%). "
                    f"Monitor closely for 24-48 hours and consult a veterinarian if "
                    f"symptoms progress or new concerns emerge."
                )
                recommendations.append(rec)
            
            # Movement-specific recommendations (feature-driven)
            if movement['average'] < 0.03:
                rec = (
                    f"Given the low movement activity ({movement['percentage']:.2f}%), "
                    f"observe for signs of pain, stiffness, or reluctance to move. "
                    f"Monitor gait and weight-bearing on all limbs."
                )
                recommendations.append(rec)
            
            # Posture-specific recommendations (feature-driven)
            if posture['type'] == 'low_posture':
                rec = (
                    f"The observed low body posture warrants monitoring for gastrointestinal "
                    f"symptoms including vomiting, diarrhea, abdominal sensitivity, or "
                    f"changes in appetite and water intake."
                )
                recommendations.append(rec)
        else:
            # Normal classification recommendations
            if confidence < 0.15:
                rec = (
                    f"Behavioral analysis indicates healthy activity patterns "
                    f"(abnormality score: {confidence:.2f}). Continue current care "
                    f"routine with regular exercise and monitoring."
                )
                recommendations.append(rec)
            else:
                rec = (
                    f"While classified as normal, the analysis score ({confidence:.2f}) "
                    f"is within {abs(confidence - threshold):.2f} of the threshold. "
                    f"Continue routine monitoring and note any behavioral changes."
                )
                recommendations.append(rec)
        
        return recommendations[:4]  # Max 4 recommendations


def generate_xai_insights(
    frames: np.ndarray,
    probability: float,
    prediction_class: str,
    threshold: float = 0.3
) -> Dict:
    """
    Main function to generate XAI-based insights
    
    This is Explainable AI:
    1. Extract features from video
    2. Map features to explanations
    3. Generate insights based on measured values
    
    Args:
        frames: Video frames
        probability: Model prediction
        prediction_class: Classification result
        threshold: Decision threshold
    
    Returns:
        dict: XAI-generated insights with features
    """
    
    explainer = FeatureBasedExplainer()
    
    # Step 1: Extract features (measurements from video)
    features = explainer.extract_features(frames, probability)
    
    # Step 2: Generate explanations from features
    explanations = explainer.generate_explanations(
        features, prediction_class, threshold
    )
    
    # Step 3: Return insights with feature details
    return {
        'observations': explanations['observations'],
        'concerns': explanations['concerns'],
        'recommendations': explanations['recommendations'],
        'features': features,  # Include extracted features for transparency
        'confidence_level': _describe_confidence(prediction_class, probability, threshold)
    }


def _describe_confidence(pred_class: str, prob: float, threshold: float) -> str:
    """Describe confidence level"""
    if pred_class == 'abnormal':
        if prob > 0.7:
            return f"High confidence abnormal behavior (score: {prob:.2f} vs threshold {threshold})"
        elif prob > 0.5:
            return f"Moderate confidence abnormal behavior (score: {prob:.2f} vs threshold {threshold})"
        else:
            return f"Low confidence abnormal indicators (score: {prob:.2f} marginally above {threshold})"
    else:
        if prob < 0.1:
            return f"Very high confidence normal behavior (score: {prob:.2f}, well below threshold)"
        elif prob < 0.2:
            return f"High confidence normal behavior (score: {prob:.2f})"
        else:
            return f"Moderate confidence normal (score: {prob:.2f}, near threshold {threshold})"


# Test/Demo
if __name__ == "__main__":
    print("RULE-BASED XAI SYSTEM (FREE - NO APIs)")
    
    # Simulate video frames
    frames = np.random.rand(30, 224, 224, 3) * 0.1  # Low activity simulation
    
    insights = generate_xai_insights(
        frames=frames,
        probability=0.35,
        prediction_class='abnormal',
        threshold=0.3
    )
    
    print("\nEXTRACTED FEATURES:")
    print(f"   Movement: {insights['features']['movement']['percentage']:.2f}%")
    print(f"   Variance: {insights['features']['movement']['variance']:.6f}")
    print(f"   Posture: {insights['features']['posture']['type']}")
    print(f"   Trend: {insights['features']['temporal']['pattern']}")
    
    print("\nOBSERVATIONS:")
    for i, obs in enumerate(insights['observations'], 1):
        print(f"   {i}. {obs}\n")
    
    print("CONCERNS (Feature-driven):")
    for i, concern in enumerate(insights['concerns'], 1):
        print(f"   {i}. {concern}\n")
    
    print("RECOMMENDATIONS (Based on features):")
    for i, rec in enumerate(insights['recommendations'], 1):
        print(f"   {i}. {rec}\n")
    
    print(f"CONFIDENCE: {insights['confidence_level']}")