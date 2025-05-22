import { Card, CardBody, CardHeader, Divider, Button } from "@nextui-org/react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ExamComplete() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col items-center gap-3 pt-8">
          <CheckCircle2 className="h-16 w-16 text-success" />
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">Exam Submitted Successfully!</h1>
            <p className="text-default-500 text-center">
              Your answers have been recorded and will be reviewed by your
              teacher.
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6 pb-8 px-4 text-center">
          <p className="mb-6">
            Thank you for completing the exam. You will be notified when your
            results are available.
          </p>

          <Link href="/">
            <Button color="primary">Return to Home</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
