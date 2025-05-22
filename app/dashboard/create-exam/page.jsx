"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { PlusIcon, Trash2Icon, SaveIcon, ArrowLeftIcon } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

const questionTypes = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "long", label: "Long Answer" },
];

export default function CreateExam() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
        points: 1,
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleTypeChange = (questionIndex, newType) => {
    const updatedQuestions = [...questions];
    const currentQuestion = { ...updatedQuestions[questionIndex] };

    // Update the question type
    currentQuestion.type = newType;

    // If changing to MCQ, initialize options
    if (
      newType === "mcq" &&
      (!currentQuestion.options || currentQuestion.options.length === 0)
    ) {
      currentQuestion.options = ["", "", "", ""];
      currentQuestion.correctOption = 0;
    }

    updatedQuestions[questionIndex] = currentQuestion;
    setQuestions(updatedQuestions);
  };

  const saveExam = async () => {
    if (!title.trim()) {
      alert("Please enter an exam title");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1} is missing text`);
        return;
      }

      if (q.type === "mcq") {
        const emptyOptions = q.options.filter((opt) => !opt.trim()).length;
        if (emptyOptions > 0) {
          alert(`Question ${i + 1} has empty options`);
          return;
        }
      }
    }

    try {
      setLoading(true);

      const examData = {
        title,
        description,
        questions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "exams"), examData);
      alert(
        `Exam created successfully! Share code: ${docRef.id.substring(0, 6)}`
      );
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("Failed to save exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link href="/dashboard">
          <Button isIconOnly variant="light" aria-label="Back">
            <ArrowLeftIcon size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">Create New Exam</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Exam Details</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Input
            label="Exam Title"
            placeholder="Enter exam title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            isRequired
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Enter exam description or instructions"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardBody>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Questions</h2>
        <Button
          color="primary"
          startContent={<PlusIcon size={16} />}
          onClick={addQuestion}
        >
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-default-500 mb-4">No questions added yet</p>
          <Button
            color="primary"
            startContent={<PlusIcon size={16} />}
            onClick={addQuestion}
            className="mx-auto"
          >
            Add Your First Question
          </Button>
        </Card>
      ) : (
        <Accordion>
          {questions.map((question, qIndex) => (
            <AccordionItem
              key={question.id}
              title={
                <div className="flex items-center gap-2">
                  <span>Question {qIndex + 1}</span>
                  <Chip
                    size="sm"
                    color={question.type === "mcq" ? "primary" : "secondary"}
                  >
                    {question.type === "mcq"
                      ? "Multiple Choice"
                      : "Long Answer"}
                  </Chip>
                </div>
              }
            >
              <Card className="mb-4">
                <CardBody className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <Select
                      label="Question Type"
                      selectedKeys={[question.type]}
                      onChange={(e) => handleTypeChange(qIndex, e.target.value)}
                      className="max-w-xs"
                    >
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      type="number"
                      label="Points"
                      min={1}
                      max={100}
                      value={question.points.toString()}
                      onChange={(e) =>
                        updateQuestion(
                          qIndex,
                          "points",
                          Number.parseInt(e.target.value) || 1
                        )
                      }
                      className="max-w-[100px]"
                    />
                  </div>

                  <Textarea
                    label="Question Text"
                    placeholder="Enter your question"
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(qIndex, "text", e.target.value)
                    }
                    isRequired
                  />

                  {question.type === "mcq" && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Options</p>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            className="flex-grow"
                          />
                          <Button
                            isIconOnly
                            color="primary"
                            variant={
                              question.correctOption === oIndex
                                ? "solid"
                                : "bordered"
                            }
                            onClick={() =>
                              updateQuestion(qIndex, "correctOption", oIndex)
                            }
                            aria-label="Set as correct answer"
                          >
                            ✓
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-default-500">
                        Click ✓ to mark the correct answer
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      color="danger"
                      variant="light"
                      startContent={<Trash2Icon size={16} />}
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Remove Question
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="flex justify-between mt-8">
        <Button
          color="default"
          variant="flat"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          startContent={<SaveIcon size={16} />}
          onClick={saveExam}
          isLoading={loading}
        >
          Save Exam
        </Button>
      </div>
    </div>
  );
}
