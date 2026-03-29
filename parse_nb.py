import json
with open('/Users/senurikaweesha/Desktop/final_model_training/earlydogillnessdetection-trustpawai.ipynb', 'r') as f:
    nb = json.load(f)
for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = "".join(cell.get('source', []))
        if 'LSTM' in source or 'Dense' in source:
            print("--- CELL ---")
            print(source)
