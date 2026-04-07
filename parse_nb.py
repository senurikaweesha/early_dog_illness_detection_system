import json

notebook_path = '/Users/senurikaweesha/Documents/fyp_6COSC023C.Y Computer Science Final Project/early_dog_illness_detection_system/model_training/earlydogillnessdetection-trustpawai.ipynb'

try:
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
    print(f"Successfully loaded {notebook_path}")

    found_metrics = False
    for cell in nb.get('cells', []):
        # Look at both source and outputs
        source = "".join(cell.get('source', []))
        
        # Check printed outputs
        for out in cell.get('outputs', []):
            text = ""
            if out.get('output_type') == 'stream':
                text = "".join(out.get('text', []))
            elif out.get('output_type') == 'execute_result' or out.get('output_type') == 'display_data':
                text = "".join(out.get('data', {}).get('text/plain', []))
            
            if 'Accuracy' in text and 'Recall' in text:
                print("\n================== FOUND KEY METRICS ==================")
                print(text)
                found_metrics = True
                
        # Also print anything about saving the model to see the .keras name
        if 'saving' in source.lower() or '.keras' in source.lower() or '.h5' in source.lower():
            for out in cell.get('outputs', []):
                if out.get('output_type') == 'stream':
                    out_txt = "".join(out.get('text', []))
                    if '.keras' in out_txt or '.h5' in out_txt:
                        print(f"\nModel Export Output:\n{out_txt}")

    if not found_metrics:
        print("Could not find printouts combining Accuracy and Recall.")
except Exception as e:
    print(f"Error parsing notebook: {e}")
