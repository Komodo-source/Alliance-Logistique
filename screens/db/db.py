import requests

def fetch_data(url):
    if not url.startswith(("http://", "https://")):
        url = "http://" + url  # Default to HTTP if no scheme provided
    
    try:
        response = requests.get(url, timeout=5)
        return response.text
    except requests.exceptions.SSLError:
        print("Warning: HTTPS failed, retrying with HTTP (INSECURE!)")
        insecure_url = url.replace("https://", "http://")
        response = requests.get(insecure_url, timeout=5)
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

data = fetch_data("backend-logistique-test.zya.me/request.php")  # Will try HTTP
print(data)