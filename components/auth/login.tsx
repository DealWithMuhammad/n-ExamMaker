"use client";

import { createAuthCookie } from "@/actions/auth.action";
import { LoginSchema } from "@/helpers/schemas";
import type { LoginFormType } from "@/helpers/types";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Image,
  Spinner,
} from "@nextui-org/react";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { LockIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/api/firebaseConfig";

export const Login = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Static credentials
  const STATIC_EMAIL = "ahmadiya@peace.com";
  const STATIC_PASSWORD = "KhuddamGoldenVilla";

  const initialValues: LoginFormType = {
    email: "",
    password: "",
  };

  const handleLogin = useCallback(
    async (values: LoginFormType) => {
      setIsLoading(true);

      try {
        // First check if using static credentials
        if (
          values.email === STATIC_EMAIL &&
          values.password === STATIC_PASSWORD
        ) {
          // Create a cookie with admin role
          await createAuthCookie("admin");
          router.replace("/");
          return;
        }

        // If not static, try Firebase authentication
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        const uid = userCredential.user.uid;

        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, "users", uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Create a cookie with the user's role
          await createAuthCookie(userData.role);
          router.replace("/");
        } else {
          throw new Error("User data not found");
        }
      } catch (error: any) {
        console.error("Login error:", error);

        let errorMessage = "Invalid email or password";
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          errorMessage = "Invalid email or password";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage =
            "Too many failed login attempts, please try again later";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, {
          position: "bottom-center",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <Card className="w-full max-w-md shadow-xl backdrop-blur-md">
      <CardHeader className="flex flex-col gap-1 w-full items-center justify-center pt-10 pb-0">
        <Image
          alt="Khuddam-ul-Ahmadiyya Logo"
          radius="none"
          src="Khuddam.png"
          className="mb-2 h-28 sm:h-20 max-w-52 w-full"
        />

        <p className="text-xl font-semibold text-default-500 text-center">
          Sign in to manage Tajneed collection
        </p>
      </CardHeader>

      <CardBody className="px-8 py-6">
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ values, errors, touched, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                variant="bordered"
                label="Email"
                placeholder="Enter your email"
                type="email"
                startContent={
                  <MailIcon className="text-default-400" size={18} />
                }
                value={values.email}
                isInvalid={!!errors.email && !!touched.email}
                errorMessage={errors.email}
                onChange={handleChange("email")}
                classNames={{
                  inputWrapper: "bg-default-100",
                }}
              />

              <Input
                variant="bordered"
                label="Password"
                placeholder="Enter your password"
                type="password"
                startContent={
                  <LockIcon className="text-default-400" size={18} />
                }
                value={values.password}
                isInvalid={!!errors.password && !!touched.password}
                errorMessage={errors.password}
                onChange={handleChange("password")}
                classNames={{
                  inputWrapper: "bg-default-100",
                }}
              />

              <Button
                type="submit"
                className="mt-2 font-medium bg-emerald-700 text-white"
                fullWidth
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? <Spinner color="white" size="sm" /> : "Sign In"}
              </Button>
            </form>
          )}
        </Formik>
      </CardBody>

      <Divider />

      <CardFooter className="flex flex-col px-8 py-4">
        <p className="text-center text-sm text-emerald-700 italic font-medium">
          "Love for All, Hatred for None"
        </p>
        <p className="text-center text-xs text-default-500">
          Motto of the Ahmadiyya Muslim Community
        </p>
      </CardFooter>
    </Card>
  );
};
