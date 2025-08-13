import { useState } from "react";

export const useAuthForm = (initialValues) => {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "mobile" ? value.replace(/\D/g, "") : value,
    }));
  };

  return {
    form,
    setForm,
    error,
    setError,
    isLoading,
    setIsLoading,
    handleChange,
  };
};
