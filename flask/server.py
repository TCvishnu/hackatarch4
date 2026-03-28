from flask import Flask, request, jsonify
from htmlParser import johnsFunction
app = Flask(__name__)

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()

    if not data or 'keyword' not in data:
        return jsonify({'error': 'Missing keyword parameter'}), 400

    keyword = data['keyword']

    johnsFunction(keyword)


    return jsonify({
        'message': f'Received keyword: {keyword}',
        'keyword': keyword
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)