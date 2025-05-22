"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Textarea,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function ExamRegistration({ params }) {
  const router = useRouter();
  const { id } = params;
  const [exam, setExam] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState("registration"); // registration or exam

  // For the exam
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const examDoc = await getDoc(doc(db, "exams", id));
        if (examDoc.exists()) {
          const examData = { id: examDoc.id, ...examDoc.data() };
          setExam(examData);

          // Initialize answers array
          setAnswers(examData.questions.map(() => ""));
        } else {
          setError("Exam not found");
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
        setError("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const startExam = () => {
    if (!studentName.trim()) {
      setError("Please enter your name");
      return;
    }

    setError("");
    setStep("exam");
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitExam = async () => {
    try {
      setSubmitting(true);

      const submissionData = {
        examId: id,
        examTitle: exam.title,
        studentName,
        studentClass,
        studentId,
        answers,
        submittedAt: serverTimestamp(),
        graded: false,
      };

      await addDoc(collection(db, "submissions"), submissionData);

      // Redirect to completion page
      router.push(`/take-exam/complete`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      setError("Failed to submit exam. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">Loading exam...</div>
    );
  }

  if (error && !exam) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-danger">{error}</p>
        <Link href="/take-exam">
          <Button color="primary" className="mt-4">
            Go Back
          </Button>
        </Link>
      </div>
    );
  }

  if (step === "registration") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <p className="text-default-500">
                Please enter your information to begin
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-6 pb-8 px-4">
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                isRequired
              />

              <Input
                label="Class/Section"
                placeholder="Enter your class or section"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
              />

              <Input
                label="Student ID (Optional)"
                placeholder="Enter your student ID if applicable"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />

              {error && <p className="text-danger text-sm">{error}</p>}

              <div className="pt-4">
                <Button color="primary" className="w-full" onClick={startExam}>
                  Start Exam
                </Button>
              </div>

              <div className="text-center">
                <Link href="/take-exam" className="text-sm text-primary">
                  Back
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Exam taking interface
  const question = exam.questions[currentQuestion];
  const isLastQuestion = currentQuestion === exam.questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const allQuestionsAnswered = answers.every((answer, index) => {
    // For MCQ, we need a selected option
    if (exam.questions[index].type === "mcq") {
      return answer !== "";
    }
    // For long answer, any non-empty string is fine
    return answer && answer.trim() !== "";
  });

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="text-sm text-default-500">
          Question {currentQuestion + 1} of {exam.questions.length}
        </div>
      </div>

      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-1">
          {exam.questions.map((_, index) => (
            <Button
              key={index}
              size="sm"
              variant={index === currentQuestion ? "solid" : "flat"}
              color={answers[index] ? "success" : "default"}
              onClick={() => setCurrentQuestion(index)}
              className="min-w-[40px]"
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-medium mb-2">
              Question {currentQuestion + 1}
            </h2>
            <p className="text-default-700">{question.text}</p>
          </div>

          <Divider className="my-4" />

          {question.type === "mcq" ? (
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) =>
                handleAnswerChange(Number.parseInt(value))
              }
            >
              {question.options.map((option, index) => (
                <Radio key={index} value={index.toString()}>
                  {option}
                </Radio>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              placeholder="Type your answer here..."
              value={answers[currentQuestion] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              minRows={5}
            />
          )}
        </CardBody>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="flat"
          startContent={<ArrowLeftIcon size={16} />}
          onClick={goToPreviousQuestion}
          isDisabled={isFirstQuestion}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            color="primary"
            endContent={<SendIcon size={16} />}
            onClick={submitExam}
            isLoading={submitting}
          >
            Submit Exam
          </Button>
        ) : (
          <Button color="primary" onClick={goToNextQuestion}>
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
