(function () {
    var questions = [];
    var current = 0;
    var answers = [];
    var finished = false;
    var quizEl = document.getElementById('quiz-container');
    var mapEl = document.getElementById('map-container');

    function renderQuiz() {
        if (finished) {
            renderResults();
            return;
        }
        if (!questions.length) {
            quizEl.innerHTML = '<div class="text-center text-gray-400">Загрузка вопросов...</div>';
            return;
        }
        var q = questions[current];
        var html = '';
        html += '<div class="flex items-center justify-between mb-4">';
        html += '<h3 class="text-lg font-semibold">Квиз</h3>';
        html += '<div class="text-sm text-gray-400">Вопрос ' + (current + 1) + ' из ' + questions.length + '</div>';
        html += '</div>';
        html += '<div class="mb-4">';
        html += '<div class="text-xl font-medium mb-2">' + q.text + '</div>';
        html += '<fieldset>';
        html += '<legend class="sr-only">' + q.text + '</legend>';
        html += '<div class="flex flex-col gap-2">';
        for (var i = 0; i < q.options.length; i++) {
            var checked = answers[current] === i;
            html += '<label class="flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors duration-150 ' + (checked ? 'border-blue-600 bg-blue-700 text-white' : 'border-gray-700 hover:bg-gray-800') + '">';
            html += '<input type="radio" name="q-' + q.id + '" value="' + i + '" ' + (checked ? 'checked' : '') + ' class="h-4 w-4 accent-blue-500 bg-gray-800">';
            html += '<span class="select-none">' + q.options[i] + '</span>';
            html += '</label>';
        }
        html += '</div>';
        html += '</fieldset>';
        html += '</div>';
        quizEl.innerHTML = html;

        var radios = quizEl.querySelectorAll('input[type="radio"]');
        for (var j = 0; j < radios.length; j++) {
            radios[j].addEventListener('change', function () {
                selectAnswer(parseInt(this.value));
            });
        }
    }

    function submitAnswers() {
        var payload = {
            answers: questions.map(function (q, i) {
                return { question_id: q.id, selected_index: answers[i] };
            })
        };
        fetch('/api/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch(function () {});
    }

    function selectAnswer(idx) {
        answers[current] = idx;
        if (current < questions.length - 1) {
            current++;
            renderQuiz();
        } else {
            finished = true;
            submitAnswers();
            renderQuiz();
        }
    }

    function renderResults() {
        var score = 0;
        for (var i = 0; i < questions.length; i++) {
            if (answers[i] === questions[i].correctIndex) score++;
        }
        var html = '';
        html += '<div class="text-center mb-6">';
        html += '<div class="text-2xl font-bold">' + score + ' / ' + questions.length + '</div>';
        html += '<div class="text-sm text-gray-400">Ваш счет</div>';
        html += '</div>';
        html += '<div class="space-y-3">';
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var user = answers[i];
            var correct = q.correctIndex;
            var isCorrect = user === correct;
            html += '<div class="p-3 rounded border bg-gray-800 border-gray-700">';
            html += '<div class="font-medium text-gray-100">' + q.text + '</div>';
            html += '<div class="mt-2 text-sm text-gray-300">';
            html += '<div>Ваш ответ: ';
            html += '<span class="' + (isCorrect ? 'text-green-400' : 'text-red-400') + '">';
            html += (user == null || typeof q.options[user] === 'undefined') ? '-' : q.options[user];
            html += '</span>';
            if (!isCorrect) {
                html += ' <span class="text-gray-100">(<span class="text-green-400">' + (typeof q.options[correct] === 'undefined' ? '-' : q.options[correct]) + '</span>)</span>';
            }
            html += '</div>';
            html += '<div class="text-gray-400">На этот вопрос правильно ответило ' + q.correctPercentage + '% человек.</div>';
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';
        quizEl.innerHTML = html;
    }

    function initQuiz() {
        fetch('/api/questions')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                questions = data;
                answers = new Array(questions.length).fill(null);
                if (quizEl) renderQuiz();
            })
            .catch(function () {
                if (quizEl) quizEl.innerHTML = '<div class="text-center text-red-400">Не удалось загрузить вопросы</div>';
            });
    }

    function initMap() {
        if (!mapEl) return;
        var vw = window.visualViewport;
        var w = vw ? vw.width : window.innerWidth;
        var h = (vw ? vw.height : window.innerHeight) - 70;
        mapEl.style.width = w + 'px';
        mapEl.style.height = h + 'px';

        var map = new maplibregl.Map({
            container: 'map-container',
            style: {
                version: 8,
                sources: {
                    "osm-tiles": {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: "© OpenStreetMap contributors",
                    },
                },
                layers: [{ id: "osm-tiles", type: "raster", source: "osm-tiles" }],
            },
            center: [47.23653, 56.13646],
            zoom: 9,
            maxBounds: [45.23653, 53.13646, 49.23653, 59.13646],
        });

        map.on('load', function () {
            fetch('/points')
                .then(function (res) { return res.json(); })
                .then(function (markers) {
                    var features = markers.map(function (m) {
                        return {
                            type: "Feature",
                            geometry: { type: "Point", coordinates: [m.longitude, m.latitude] },
                            properties: { title: m.name },
                        };
                    });

                    map.addSource('markers', {
                        type: 'geojson',
                        data: { type: "FeatureCollection", features: features },
                    });

                    map.addLayer({
                        id: 'point',
                        type: 'circle',
                        source: 'markers',
                        paint: { 'circle-radius': 10, 'circle-color': '#82181a' },
                    });

                    map.on('click', 'point', function (e) {
                        var feature = e.features && e.features[0];
                        if (!feature) return;
                        var coords = feature.geometry.coordinates.slice();
                        var title = feature.properties.title || 'Marker';
                        new maplibregl.Popup({ offset: 12 })
                            .setLngLat(coords)
                            .setHTML('<strong>' + title + '</strong>')
                            .addTo(map);
                    });

                    map.on('mouseenter', 'point', function () {
                        map.getCanvas().style.cursor = 'pointer';
                    });
                    map.on('mouseleave', 'point', function () {
                        map.getCanvas().style.cursor = '';
                    });
                });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initQuiz();
        if (mapEl) initMap();
    });
})();
