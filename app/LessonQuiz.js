
"use client";

import { useState } from "react";

const questions = {
    1: [
        {
            question: "What does a barista represent in AWS?",
            options: ["An EC2 instance", "An S3 bucket", "A database"],
            answer: 0,
            explanation: "An EC2 instance is a virtual server that runs applications."
        },
        {
            question: "What happens when one server receives too many requests?",
            options: ["It becomes unlimited", "It may slow down or fail", "It creates storage"],
            answer: 1,
            explanation: "A server has limited capacity. Too many requests can overwhelm it."
        },
        {
            question: "What is a cloud server?",
            options: ["A physical cloud", "A virtual computer hosted in the cloud", "A website design"],
            answer: 1,
            explanation: "Cloud servers provide computing power over the internet."
        }
    ],
    2: [
        {
            question: "What does a load balancer do?",
            options: ["Stores files", "Distributes incoming requests", "Deletes servers"],
            answer: 1,
            explanation: "A load balancer distributes requests across available servers."
        },
        {
            question: "What is scaling out?",
            options: ["Adding more servers", "Removing all servers", "Increasing storage only"],
            answer: 0,
            explanation: "Scaling out means adding more server instances to handle demand."
        },
        {
            question: "What does ELB stand for in AWS?",
            options: ["Elastic Load Balancing", "External Login Backup", "Extra Linux Box"],
            answer: 0,
            explanation: "Elastic Load Balancing automatically distributes incoming traffic."
        }
    ],
    3: [
        {
            question: "What is the main purpose of Auto Scaling?",
            options: ["Change website colours", "Adjust server capacity to demand", "Store customer passwords"],
            answer: 1,
            explanation: "Auto Scaling adjusts the number of instances according to demand."
        },
        {
            question: "What should happen when traffic increases?",
            options: ["Add capacity when needed", "Delete every server", "Stop accepting requests"],
            answer: 0,
            explanation: "Auto Scaling can add instances to help handle increased demand."
        },
        {
            question: "Why can Auto Scaling reduce costs?",
            options: ["It makes all services free", "It removes the need for databases", "It can reduce unused server capacity"],
            answer: 2,
            explanation: "Scaling in during quiet periods can reduce the cost of unused capacity."
        }
    ],
    4: [
        {
            question: "What is Amazon S3 mainly used for?",
            options: ["Object storage", "Load balancing", "Running virtual machines"],
            answer: 0,
            explanation: "Amazon S3 is an object storage service for files and other data."
        },
        {
            question: "Why keep data outside individual servers?",
            options: ["So servers can be replaced without losing stored data", "To make servers slower", "To avoid using the internet"],
            answer: 0,
            explanation: "Separating data from compute makes applications easier to scale and recover."
        },
        {
            question: "Which AWS service is a managed relational database?",
            options: ["EC2", "Amazon RDS", "Elastic Load Balancing"],
            answer: 1,
            explanation: "Amazon RDS makes it easier to set up and operate relational databases."
        }
    ],
    5: [
        {
            question: "What is an Availability Zone?",
            options: ["A separate isolated location within an AWS Region", "A type of database", "A website address"],
            answer: 0,
            explanation: "Availability Zones are isolated locations within an AWS Region."
        },
        {
            question: "What is high availability?",
            options: ["Making a website colourful", "Keeping a service available despite failures", "Increasing the price of servers"],
            answer: 1,
            explanation: "High availability uses redundancy and recovery mechanisms to reduce downtime."
        },
        {
            question: "What do health checks help a load balancer do?",
            options: ["Identify unhealthy targets", "Create new databases", "Write application code"],
            answer: 0,
            explanation: "Health checks help route traffic away from unhealthy targets."
        }
    ]
};

export default function LessonQuiz({ lesson, onNextLesson }) {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const quiz = questions[lesson] || [];

    const score = quiz.filter(
        (q, index) => answers[index] === q.answer
    ).length;

    function chooseAnswer(questionIndex, optionIndex) {
        if (submitted) return;

        setAnswers((previous) => ({
            ...previous,
            [questionIndex]: optionIndex
        }));
    }

    return (
        <section className="lesson-quiz">
            <div className="quiz-heading">
                <span>✦ QUICK KNOWLEDGE CHECK</span>
                <h2>Test what you learned</h2>
                <p>Three little questions before you explore the next lesson.</p>
            </div>

            {quiz.map((q, index) => (
                <div className="quiz-question" key={index}>
                    <h3>{index + 1}. {q.question}</h3>

                    <div className="quiz-options">
                        {q.options.map((option, optionIndex) => {
                            const selected = answers[index] === optionIndex;
                            const correct = q.answer === optionIndex;

                            let className = "quiz-option";

                            if (submitted && correct) className += " correct";
                            else if (submitted && selected) className += " incorrect";
                            else if (selected) className += " selected";

                            return (
                                <button
                                    type="button"
                                    key={optionIndex}
                                    className={className}
                                    onClick={() => chooseAnswer(index, optionIndex)}
                                    disabled={submitted}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {submitted && (
                        <p className="quiz-explanation">
                            {answers[index] === q.answer ? "✓ Correct! " : "Not quite. "}
                            {q.explanation}
                        </p>
                    )}
                </div>
            ))}

            {!submitted ? (
                <button
                    type="button"
                    className="quiz-submit"
                    onClick={() => setSubmitted(true)}
                    disabled={Object.keys(answers).length !== quiz.length}
                >
                    Check my answers
                </button>
            ) : (
                <div className="quiz-result">
                    <h3>You scored {score} / {quiz.length}</h3>

                    <p>
                        {score === quiz.length
                            ? "Excellent! You've mastered this lesson."
                            : "Good effort! Review the explanations and keep learning."}
                    </p>

                    {lesson < 5 ? (
                        <button
                            type="button"
                            className="quiz-submit"
                            onClick={onNextLesson}
                        >
                            Next Lesson →
                        </button>
                    ) : (
                        <h3>🎉 You've completed Cloudville!</h3>
                    )}
                </div>
            )}
        </section>
    );
}
