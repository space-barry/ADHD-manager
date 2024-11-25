
# import json
# import os
# from flask import Flask, request, jsonify, render_template

# app = Flask(__name__)

# # Load data from JSON file
# def load_data():
#     if not os.path.exists('data.json'):
#         return {"projects": [], "tasks": []}
#     with open('data.json', 'r') as f:
#         return json.load(f)

# # Save data to JSON file
# def save_data(data):
#     with open('data.json', 'w') as f:
#         json.dump(data, f, indent=2)

# # Routes
# @app.route('/')
# def home():
#     return render_template('index.html')

# @app.route('/projects', methods=['GET', 'POST'])
# def handle_projects():
#     data = load_data()
#     if request.method == 'POST':
#         new_project = request.json
#         new_project['id'] = max([p['id'] for p in data['projects']] + [0]) + 1
#         data['projects'].append(new_project)
#         save_data(data)
#         return jsonify(new_project), 201
#     return jsonify(data['projects'])

# @app.route('/projects/<int:project_id>', methods=['GET', 'PUT', 'DELETE'])
# def handle_project(project_id):
#     data = load_data()
#     project = next((p for p in data['projects'] if p['id'] == project_id), None)
#     if not project:
#         return jsonify({"error": "Project not found"}), 404
    
#     if request.method == 'GET':
#         return jsonify(project)
#     elif request.method == 'PUT':
#         project.update(request.json)
#         save_data(data)
#         return jsonify(project)
#     elif request.method == 'DELETE':
#         data['projects'] = [p for p in data['projects'] if p['id'] != project_id]
#         save_data(data)
#         return '', 204

# @app.route('/tasks', methods=['GET', 'POST'])
# def handle_tasks():
#     data = load_data()
#     if request.method == 'POST':
#         new_task = request.json
#         new_task['id'] = max([t['id'] for t in data['tasks']] + [0]) + 1
#         data['tasks'].append(new_task)
#         save_data(data)
#         return jsonify(new_task), 201
#     return jsonify(data['tasks'])

# @app.route('/tasks/<int:task_id>', methods=['GET', 'PUT', 'DELETE'])
# def handle_task(task_id):
#     data = load_data()
#     task = next((t for t in data['tasks'] if t['id'] == task_id), None)
#     if not task:
#         return jsonify({"error": "Task not found"}), 404
    
#     if request.method == 'GET':
#         return jsonify(task)
#     elif request.method == 'PUT':
#         task.update(request.json)
#         save_data(data)
#         return jsonify(task)
#     elif request.method == 'DELETE':
#         data['tasks'] = [t for t in data['tasks'] if t['id'] != task_id]
#         save_data(data)
#         return '', 204

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)



from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# Initialize data storage
DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {'projects': [], 'tasks': []}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# Initialize data.json if it doesn't exist
if not os.path.exists(DATA_FILE):
    save_data({'projects': [], 'tasks': []})

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/projects', methods=['GET', 'POST'])
def handle_projects():
    data = load_data()
    
    if request.method == 'POST':
        project = request.get_json()
        new_project = {
            'id': int(datetime.now().timestamp() * 1000),  # Generate unique ID
            'name': project.get('name'),
            'description': project.get('description'),
            'techStack': project.get('techStack', []),
            'motivation': project.get('motivation'),
            'tasks': [],
            'progress': 0
        }
        data['projects'].append(new_project)
        save_data(data)
        return jsonify(new_project)
    
    return jsonify(data['projects'])

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    data = load_data()
    data['projects'] = [p for p in data['projects'] if p['id'] != project_id]
    data['tasks'] = [t for t in data['tasks'] if t['projectId'] != project_id]
    save_data(data)
    return jsonify({'success': True})

@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    data = load_data()
    
    if request.method == 'POST':
        task = request.get_json()
        new_task = {
            'id': int(datetime.now().timestamp() * 1000),  # Generate unique ID
            'text': task.get('text'),
            'projectId': int(task.get('projectId')),
            'priority': task.get('priority', 'medium'),
            'completed': False
        }
        data['tasks'].append(new_task)
        save_data(data)
        return jsonify(new_task)
    
    return jsonify(data['tasks'])

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def handle_task(task_id):
    data = load_data()
    
    if request.method == 'PUT':
        task_update = request.get_json()
        for task in data['tasks']:
            if task['id'] == task_id:
                task['completed'] = task_update.get('completed', task['completed'])
                break
        save_data(data)
        return jsonify({'success': True})
    
    elif request.method == 'DELETE':
        data['tasks'] = [t for t in data['tasks'] if t['id'] != task_id]
        save_data(data)
        return jsonify({'success': True})

@app.route('/api/projects/<int:project_id>/progress', methods=['PUT'])
def update_project_progress(project_id):
    data = load_data()
    update_data = request.get_json()
    
    for project in data['projects']:
        if project['id'] == project_id:
            project['progress'] = update_data.get('progress', 0)
            break
    
    save_data(data)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)