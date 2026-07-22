import base64
import re
import os

svg_file = "/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/assets/images/Home/Hero/banner1.svg"
bg_webp = "/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/assets/images/Home/Hero/banner1/background.webp"
product_webp = "/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/assets/images/Home/Hero/banner1/product.webp"

with open(bg_webp, "rb") as f:
    bg_b64 = base64.b64encode(f.read()).decode('utf-8')
    bg_data_uri = f"data:image/webp;base64,{bg_b64}"

with open(product_webp, "rb") as f:
    prod_b64 = base64.b64encode(f.read()).decode('utf-8')
    prod_data_uri = f"data:image/webp;base64,{prod_b64}"

with open(svg_file, "r") as f:
    content = f.read()

# Replace image0
content = re.sub(r'(<image id="image0[^>]+xlink:href=")[^"]+(")', r'\g<1>' + bg_data_uri + r'\g<2>', content)

# Replace image1
content = re.sub(r'(<image id="image1[^>]+xlink:href=")[^"]+(")', r'\g<1>' + prod_data_uri + r'\g<2>', content)

with open(svg_file, "w") as f:
    f.write(content)

print("SVG updated successfully!")
