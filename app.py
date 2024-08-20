from flask import Flask, render_template, request
import requests

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Получаем данные из формы
        url = request.form['url']
        try:
            response = requests.get(url)
            # Отображаем содержимое страницы
            return render_template('result.html', content=response.text)
        except Exception as e:
            return f"Произошла ошибка: {str(e)}"
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
