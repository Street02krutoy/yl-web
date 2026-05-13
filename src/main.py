from datetime import datetime
import os
from functools import wraps
from flask import (
    Flask, render_template, jsonify, request,
    redirect, url_for, session, flash
)
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Point(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, default="")


class QuizAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('quiz_question.id'), nullable=False)
    selected_index = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class QuizQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    option1 = db.Column(db.String(200), nullable=False)
    option2 = db.Column(db.String(200), nullable=False)
    option3 = db.Column(db.String(200), nullable=False)
    correct_index = db.Column(db.Integer, nullable=False)
    answers = db.relationship('QuizAnswer', backref='question', lazy='dynamic')

    def correct_percentage(self):
        total = self.answers.count()
        if total == 0:
            return 0
        correct = self.answers.filter_by(selected_index=self.correct_index).count()
        return int(round(correct / total * 100))


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get(
        'SECRET_KEY', 'dev-secret-key-change-me'
    )
    app.config['ADMIN_PASSWORD'] = os.environ.get('ADMIN_PASSWORD', 'admin')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(
        os.path.dirname(__file__), 'data.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    with app.app_context():
        db.create_all()
        if Point.query.count() == 0:
            _seed_data()
    return app


def _seed_data():
    for p in [
        Point(name="Чебоксары", latitude=56.13646, longitude=47.23653,
              description="Столица Чувашской Республики"),
        Point(name="Мариинский Посад", latitude=56.11667, longitude=47.71667,
              description="Город на берегу Волги"),
        Point(name="Цивильск", latitude=55.86667, longitude=47.46667,
              description="Город с богатой историей"),
        Point(name="Ядрин", latitude=55.95, longitude=46.2,
              description="Купеческий город"),
        Point(name="Алатырь", latitude=54.85, longitude=46.58333,
              description="Один из древнейших городов Чувашии"),
        Point(name="Шумерля", latitude=55.5, longitude=46.41667,
              description="Город железнодорожников"),
        Point(name="Козловка", latitude=55.83333, longitude=48.25,
              description="Город на берегу Волги"),
    ]:
        db.session.add(p)

    for q in [
        QuizQuestion(text="Кто является основоположником чувашской письменности?",
                     option1="М. Сеспель", option2="П. Хузангай", option3="Я. Яковлев",
                     correct_index=2),
        QuizQuestion(text="От какого рода по легенде произошел чувашский народ?",
                     option1="от рода Улыпа", option2="от рода Сувара", option3="от рода Болгара",
                     correct_index=1),
        QuizQuestion(text="Какие птицы изображены на гербе Чебоксар?",
                     option1="утки", option2="гуси", option3="лебеди",
                     correct_index=0),
        QuizQuestion(text="В честь кого чуваши назвали самую большую реку Волгу (на чувашском языке)?",
                     option1="в честь кузнеца – Азамат", option2="в честь богатыря – Чемен",
                     option3="в честь вождя - Атăл", correct_index=2),
        QuizQuestion(text="Цвет основного фона государственного флага Чувашской Республики?",
                     option1="синего", option2="белого", option3="жёлтого",
                     correct_index=2),
        QuizQuestion(text="Кем был Гузовский, имя которого носит одна из улиц Чебоксар?",
                     option1="лесоводом", option2="военачальником", option3="композитором",
                     correct_index=0),
        QuizQuestion(text="Название головного убора замужних чувашек?",
                     option1="xушпу", option2="тухья", option3="aма",
                     correct_index=0),
        QuizQuestion(text="Назовите автора Чувашского государственного герба?",
                     option1="А.Миттов", option2="Э.Юрьев", option3="В.Смирнов",
                     correct_index=1),
        QuizQuestion(text="Украшения представляют собой одно из ярких явлений развития чувашского народного искусства. Из каких материалом изготавливались украшения?",
                     option1="из драгоценных камней", option2="из серебра и бисера",
                     option3="из золота и бисера", correct_index=1),
        QuizQuestion(text="В каком месяце древние чуваши отмечали наступление нового года?",
                     option1="октябрь", option2="март", option3="январь",
                     correct_index=1),
    ]:
        db.session.add(q)

    db.session.commit()


app = create_app()


# --- Public routes ---

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/points')
def points():
    markers = Point.query.all()
    return jsonify([{
        'id': p.id, 'name': p.name,
        'latitude': p.latitude, 'longitude': p.longitude,
        'description': p.description,
    } for p in markers])


@app.route('/api/questions')
def api_questions():
    questions = QuizQuestion.query.all()
    return jsonify([{
        'id': q.id,
        'text': q.text,
        'options': [q.option1, q.option2, q.option3],
        'correctIndex': q.correct_index,
        'correctPercentage': q.correct_percentage(),
    } for q in questions])


@app.route('/api/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    for answer in data.get('answers', []):
        db.session.add(QuizAnswer(
            question_id=answer['question_id'],
            selected_index=answer['selected_index'],
        ))
    db.session.commit()
    return jsonify({'status': 'ok'})


# --- Admin routes ---

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        if request.form.get('password') == app.config['ADMIN_PASSWORD']:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        flash('Неверный пароль', 'error')
    return render_template('admin/login.html')


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))


@app.route('/admin/')
@admin_required
def admin_dashboard():
    points_count = Point.query.count()
    questions_count = QuizQuestion.query.count()
    return render_template('admin/dashboard.html',
                           points_count=points_count,
                           questions_count=questions_count)


@app.route('/admin/points')
@admin_required
def admin_points():
    all_points = Point.query.all()
    return render_template('admin/points.html', points=all_points)


@app.route('/admin/points/add', methods=['GET', 'POST'])
@admin_required
def admin_point_add():
    if request.method == 'POST':
        try:
            point = Point(
                name=request.form['name'],
                latitude=float(request.form['latitude']),
                longitude=float(request.form['longitude']),
                description=request.form.get('description', ''),
            )
            db.session.add(point)
            db.session.commit()
            flash('Точка добавлена', 'success')
            return redirect(url_for('admin_points'))
        except Exception as e:
            flash(f'Ошибка: {e}', 'error')
    return render_template('admin/point_form.html', point=None)


@app.route('/admin/points/<int:id>/edit', methods=['GET', 'POST'])
@admin_required
def admin_point_edit(id):
    point = Point.query.get_or_404(id)
    if request.method == 'POST':
        try:
            point.name = request.form['name']
            point.latitude = float(request.form['latitude'])
            point.longitude = float(request.form['longitude'])
            point.description = request.form.get('description', '')
            db.session.commit()
            flash('Точка обновлена', 'success')
            return redirect(url_for('admin_points'))
        except Exception as e:
            flash(f'Ошибка: {e}', 'error')
    return render_template('admin/point_form.html', point=point)


@app.route('/admin/points/<int:id>/delete', methods=['POST'])
@admin_required
def admin_point_delete(id):
    point = Point.query.get_or_404(id)
    db.session.delete(point)
    db.session.commit()
    flash('Точка удалена', 'success')
    return redirect(url_for('admin_points'))


@app.route('/admin/questions')
@admin_required
def admin_questions():
    all_questions = QuizQuestion.query.all()
    return render_template('admin/questions.html', questions=all_questions)


@app.route('/admin/questions/add', methods=['GET', 'POST'])
@admin_required
def admin_question_add():
    if request.method == 'POST':
        try:
            q = QuizQuestion(
                text=request.form['text'],
                option1=request.form['option1'],
                option2=request.form['option2'],
                option3=request.form['option3'],
                correct_index=int(request.form['correct_index']),
            )
            db.session.add(q)
            db.session.commit()
            flash('Вопрос добавлен', 'success')
            return redirect(url_for('admin_questions'))
        except Exception as e:
            flash(f'Ошибка: {e}', 'error')
    return render_template('admin/question_form.html', question=None)


@app.route('/admin/questions/<int:id>/edit', methods=['GET', 'POST'])
@admin_required
def admin_question_edit(id):
    q = QuizQuestion.query.get_or_404(id)
    if request.method == 'POST':
        try:
            q.text = request.form['text']
            q.option1 = request.form['option1']
            q.option2 = request.form['option2']
            q.option3 = request.form['option3']
            q.correct_index = int(request.form['correct_index'])
            db.session.commit()
            flash('Вопрос обновлён', 'success')
            return redirect(url_for('admin_questions'))
        except Exception as e:
            flash(f'Ошибка: {e}', 'error')
    return render_template('admin/question_form.html', question=q)


@app.route('/admin/questions/<int:id>/delete', methods=['POST'])
@admin_required
def admin_question_delete(id):
    q = QuizQuestion.query.get_or_404(id)
    db.session.delete(q)
    db.session.commit()
    flash('Вопрос удалён', 'success')
    return redirect(url_for('admin_questions'))


if __name__ == '__main__':
    app.run(debug=True, port=5000)
