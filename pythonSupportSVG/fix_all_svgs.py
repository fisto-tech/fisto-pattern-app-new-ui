import base64
import re
import os

for i in range(2, 7):
    banner_name = f"banner{i}"
    svg_file = f"src/assets/images/Home/Hero/{banner_name}.svg"
    
    if not os.path.exists(svg_file):
        continue
        
    bg_webp = f"src/assets/images/Home/Hero/{banner_name}/background.webp"
    product_webp = f"src/assets/images/Home/Hero/{banner_name}/product.webp"
    label_webp = f"src/assets/images/Home/Hero/{banner_name}/label.webp"
    
    with open(svg_file, "r") as f:
        content = f.read()

    # Load and encode background
    if os.path.exists(bg_webp):
        with open(bg_webp, "rb") as f:
            bg_b64 = base64.b64encode(f.read()).decode('utf-8')
            bg_data_uri = f"data:image/webp;base64,{bg_b64}"
            content = re.sub(r'(<image id="image0[^>]+xlink:href=")[^"]+(")', r'\g<1>' + bg_data_uri + r'\g<2>', content)

    # Load and encode product
    if os.path.exists(product_webp):
        with open(product_webp, "rb") as f:
            prod_b64 = base64.b64encode(f.read()).decode('utf-8')
            prod_data_uri = f"data:image/webp;base64,{prod_b64}"
            content = re.sub(r'(<image id="image1[^>]+xlink:href=")[^"]+(")', r'\g<1>' + prod_data_uri + r'\g<2>', content)
            
    # Load and encode label if it exists
    if os.path.exists(label_webp):
        with open(label_webp, "rb") as f:
            label_b64 = base64.b64encode(f.read()).decode('utf-8')
            label_data_uri = f"data:image/webp;base64,{label_b64}"
            content = re.sub(r'(<image id="image2[^>]+xlink:href=")[^"]+(")', r'\g<1>' + label_data_uri + r'\g<2>', content)

    with open(svg_file, "w") as f:
        f.write(content)

    print(f"{banner_name}.svg updated successfully!")
