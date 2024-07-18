from bs4 import BeautifulSoup
import re

def modify_html_file(file_path):
    # Read the HTML file
    with open(file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find and modify the specific script tag
    script_tag = soup.find('script', src=re.compile(r'^/static/js/.*\.js$'))
    if script_tag:
        script_tag['src'] = script_tag['src'].replace('/static/', '/assets/static/')
    
    # Find and modify the specific link tag
    link_tag = soup.find('link', href=re.compile(r'^/static/css/.*\.css$'))
    if link_tag:
        link_tag['href'] = link_tag['href'].replace('/static/', '/assets/static/')
    
    # Write the modified HTML back to the same file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))

    print(f"File {file_path} has been successfully modified.")

# Usage
modify_html_file('../jmwoo.github.io/diet/index.html')