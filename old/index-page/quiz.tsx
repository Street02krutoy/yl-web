import React, { useState } from "react";

type Question = {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    correctPercentage: number;
};

const Quiz: React.FC<{ questions: Question[] }> = (props) => {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Array<number | null>>(
        Array(props.questions.length).fill(null),
    );
    const [finished, setFinished] = useState(false);

    const select = (idx: number) => {
        const copy = [...answers];
        copy[current] = idx;
        setAnswers(copy);
        next();
    };

    const next = () => {
        if (current < props.questions.length - 1) setCurrent((c) => c + 1);
        else setFinished(true);
    };

    const score = answers.reduce((acc, ans, i) => {
        const isCorrect = ans === props.questions[i].correctIndex;
        return (acc ?? 0) + (isCorrect ? 1 : 0);
    }, 0);

    return (
        <section
            id="quiz"
            className="w-screen mx-auto p-6 bg-gray-900 text-gray-100 rounded-xl shadow-sm ring-1 ring-gray-800 transition-transform"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Квиз</h3>
                <div className="text-sm text-gray-400">
                    {finished
                        ? "Завершен"
                        : `Вопрос ${current + 1} из ${props.questions.length}`}
                </div>
            </div>

            {!finished ? (
                <>
                    <div className="mb-4">
                        <div className="text-xl font-medium mb-2">
                            {props.questions[current].text}
                        </div>
                        <fieldset>
                            <legend className="sr-only">
                                {props.questions[current].text}
                            </legend>
                            <div className="flex flex-col gap-2">
                                {props.questions[current].options.map(
                                    (opt, i) => (
                                        <label
                                            key={i}
                                            className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors duration-150 ${
                                                answers[current] === i
                                                    ? "border-blue-600 bg-blue-700 text-white"
                                                    : "border-gray-700 hover:bg-gray-800"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={
                                                    props.questions[current].id
                                                }
                                                checked={answers[current] === i}
                                                onChange={() => select(i)}
                                                className="form-radio h-4 w-4 accent-blue-500 bg-gray-800"
                                                aria-checked={
                                                    answers[current] === i
                                                }
                                            />
                                            <span className="select-none">
                                                {opt}
                                            </span>
                                        </label>
                                    ),
                                )}
                            </div>
                        </fieldset>
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {score} / {props.questions.length}
                        </div>
                        <div className="text-sm text-gray-600">Ваш счет</div>
                    </div>

                    <div className="space-y-3">
                        {props.questions.map((q, i) => {
                            const user = answers[i];
                            const correct = q.correctIndex;
                            const isCorrect = user === correct;
                            return (
                                <div
                                    key={q.id}
                                    className="p-3 rounded border bg-gray-800 border-gray-700"
                                >
                                    <div className="font-medium text-gray-100">
                                        {q.text}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-300">
                                        <div>
                                            Ваш ответ:{" "}
                                            <span
                                                className={
                                                    isCorrect
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }
                                            >
                                                {user == null ||
                                                typeof q.options[user] ===
                                                    "undefined"
                                                    ? "-"
                                                    : q.options[user]}
                                            </span>
                                            {!isCorrect && (
                                                <span
                                                    className={"text-gray-100"}
                                                >
                                                    (
                                                    <span
                                                        className={
                                                            "text-green-400"
                                                        }
                                                    >
                                                        {typeof q.options[
                                                            correct
                                                        ] === "undefined"
                                                            ? "-"
                                                            : q.options[
                                                                  correct
                                                              ]}
                                                    </span>
                                                    )
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-gray-400">
                                            На этот вопрос правильно ответило{" "}
                                            {q.correctPercentage}% человек.
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Quiz;
